import {sha256,stringToHex} from 'viem';
export const VERSION='counterpoint-1';
export function canonical(v){return JSON.stringify(v===null||typeof v!=='object'?v:Array.isArray(v)?v.map(normalize):normalize(v));}
export function normalize(v){if(typeof v==='bigint')return v.toString();if(v===null||typeof v!=='object')return v;if(v instanceof Map)return normalize(Object.fromEntries(v));if(v instanceof Uint8Array)return Array.from(v);if(Array.isArray(v))return v.map(normalize);return Object.fromEntries(Object.keys(v).sort().map(k=>[k,normalize(v[k])]));}
export async function digest(v){return sha256(stringToHex(canonical(v))).slice(2);}
export function grounded(ids,edges){
  const incoming=Object.fromEntries(ids.map(n=>[n,edges.filter(e=>e[1]===n).map(e=>e[0]).sort()]));
  const labels=Object.fromEntries(ids.map(n=>[n,'UNDECIDED'])),trace=[];
  for(let i=0;i<=ids.length;i++){
    const ins=ids.filter(n=>labels[n]==='UNDECIDED'&&incoming[n].every(a=>labels[a]==='OUT'));
    ins.forEach(n=>labels[n]='IN');
    const outs=ids.filter(n=>labels[n]==='UNDECIDED'&&incoming[n].some(a=>labels[a]==='IN'));
    outs.forEach(n=>labels[n]='OUT');
    if(!ins.length&&!outs.length)break;
    trace.push({round:i+1,in:ins,out:outs});
  }
  const unresolved=ids.filter(n=>labels[n]==='UNDECIDED');
  const reach=Object.fromEntries(unresolved.map(n=>[n,new Set([n])]));
  for(const n of unresolved)for(let i=0;i<unresolved.length;i++){
    let change=false;for(const [a,b]of edges)if(reach[n].has(a)&&unresolved.includes(b)&&!reach[n].has(b)){reach[n].add(b);change=true;}if(!change)break;
  }
  const knots=[],used=new Set();
  for(const n of unresolved){const group=unresolved.filter(m=>reach[n].has(m)&&reach[m].has(n));if(group.length>1&&!used.has(n)){knots.push(group);group.forEach(m=>used.add(m));}}
  return {labels,trace,witnesses:ids.map(n=>({id:n,label:labels[n],attackers:incoming[n],defeated_by:incoming[n].find(a=>labels[a]==='IN')||null})),knots,in:ids.filter(n=>labels[n]==='IN'),out:ids.filter(n=>labels[n]==='OUT'),undecided:unresolved};
}
export async function verifyRoom(room){
  if(room.version!==VERSION||!Array.isArray(room.members)||room.members.length<2||room.members.length>4)throw Error('Unexpected discussion protocol.');
  if(!['READY','MAPPED','REVIEW'].includes(room.status))return room;
  const input=Object.fromEntries(['version','id','question','members','voices'].map(k=>[k,room[k]]));
  if(await digest(input)!==room.input_digest)throw Error('The signed input digest does not match.');
  const args=room.voices.flatMap((v,i)=>v.arguments.map((a,j)=>({id:String.fromCharCode(65+i)+(j+1),author:room.members[i],...a})));
  const challenges=room.voices.flatMap(v=>v.challenges);
  if(canonical(args)!==canonical(room.arguments)||canonical(challenges)!==canonical(room.challenges))throw Error('Argument content differs from signed voices.');
  if(room.status==='READY')return room;
  if(room.findings.length!==challenges.length)throw Error('A challenge assessment is missing.');
  for(let i=0;i<challenges.length;i++){
    const row=room.findings[i],e=challenges[i];
    if(!['REBUTTAL','UNDERCUT','NOT_ATTACK','UNCLEAR'].includes(row.kind))throw Error('Invalid finding.');
    for(const side of ['source','target'])if(typeof row[side+'_quote']!=='string'||row[side+'_quote'].length<5||!args.find(a=>a.id===e[side]).text.includes(row[side+'_quote']))throw Error('A quote is not grounded in its signed argument.');
  }
  const edges=challenges.filter((e,i)=>['REBUTTAL','UNDERCUT'].includes(room.findings[i].kind)).map(e=>[e.source,e.target]);
  if(canonical(edges)!==canonical(room.accepted_edges))throw Error('Attack graph differs from accepted assessments.');
  const unclear=room.findings.some(r=>r.kind==='UNCLEAR');
  if(unclear!==(room.status==='REVIEW'))throw Error('Uncertainty was not preserved.');
  if(!unclear&&canonical(grounded(args.map(a=>a.id),edges))!==canonical(room.semantics))throw Error('The grounded labelling cannot be reproduced.');
  if(unclear&&room.semantics!==null)throw Error('Review cases must not publish a complete labelling.');
  const result=Object.fromEntries(['version','id','input_digest','status','findings','accepted_edges','semantics'].map(k=>[k,room[k]]));
  if(await digest(result)!==room.result_digest)throw Error('Result certificate mismatch.');
  return room;
}
