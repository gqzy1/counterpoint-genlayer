import {createClient,createAccount,abi} from 'genlayer-js';
import {studionet} from 'genlayer-js/chains';
import {sha256,stringToHex} from 'viem';
import {normalize,canonical,verifyRoom,VERSION} from './reasoning.js';

export const RPC='https://studio.genlayer.com/api',EXPLORER='https://explorer-studio.genlayer.com';
const chain={...studionet,rpcUrls:{default:{http:[RPC]}}};
const reader=createClient({chain,endpoint:RPC}),KEY='counterpoint-pending-v1';
const signers=[];let active=-1,provider=null,verified='',manifest=null;
function restoreJournal(){try{return JSON.parse(localStorage.getItem('counterpoint-journal-v1')||'[]');}catch{return [];}}
export const journal=restoreJournal();
function remember(entry){journal.push(entry);try{localStorage.setItem('counterpoint-journal-v1',JSON.stringify(journal.slice(-20)));}catch{/* Current-tab exports remain available when local storage is full. */}}
export const participants=()=>signers.map((s,i)=>({address:s.address,index:i,temporary:s.temporary}));
export const current=()=>signers[active]?.address||'';
export async function deployment(){return manifest||(manifest=await fetch('./deployment.json').then(r=>{if(!r.ok)throw Error('Deployment manifest could not be loaded.');return r.json();}));}
export function pending(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch{return null;}}
function save(p){if(p)localStorage.setItem(KEY,JSON.stringify(p));else localStorage.removeItem(KEY);}
export function addTemporary(){if(pending())throw Error('Recheck the saved transaction before changing participants.');const account=createAccount();signers.push({...account,temporary:true});active=signers.length-1;provider=null;return current();}
export function selectParticipant(index){if(pending())throw Error('Recheck the saved transaction before changing participants.');if(!signers[index])throw Error('Participant is no longer available.');active=index;provider=signers[index].provider||null;return current();}
export async function connect(){
  if(pending())throw Error('Recheck the saved transaction before connecting.');
  const p=window.okxwallet||window.ethereum;if(!p)throw Error('No browser wallet found. You can use a free test participant.');
  const addresses=await p.request({method:'eth_requestAccounts'});
  if(Number(await p.request({method:'eth_chainId'}))!==61999){
    try{await p.request({method:'wallet_switchEthereumChain',params:[{chainId:'0xf22f'}]});}
    catch(e){if(e.code!==4902)throw e;await p.request({method:'wallet_addEthereumChain',params:[{chainId:'0xf22f',chainName:'GenLayer Stable Studionet',rpcUrls:[RPC],nativeCurrency:{name:'GEN',symbol:'GEN',decimals:18},blockExplorerUrls:[EXPLORER]}]});}
  }
  if(Number(await p.request({method:'eth_chainId'}))!==61999)throw Error('Select Stable Studionet, chain 61999.');
  signers.push({address:addresses[0],provider:p,temporary:false});active=signers.length-1;provider=p;
  p.on?.('accountsChanged',()=>{verified='';});p.on?.('chainChanged',()=>{verified='';});return current();
}
export async function preflight(){
  const [id,gas]=await Promise.all([reader.request({method:'eth_chainId'}),reader.request({method:'eth_gasPrice'})]);
  if(Number(id)!==61999||BigInt(gas)!==0n)throw Error('Writes require Stable Studionet 61999 with gas price zero.');
  if(provider){const [wid,addresses]=await Promise.all([provider.request({method:'eth_chainId'}),provider.request({method:'eth_accounts'})]);if(Number(wid)!==61999||addresses[0]?.toLowerCase()!==current().toLowerCase())throw Error('Wallet account or network changed. Reconnect.');}
  return {chain_id:Number(id),gas_price:String(gas)};
}
export function hashText(text){return sha256(stringToHex(text)).slice(2);}
export async function verify(address){
  verified='';if(!/^0x[\da-fA-F]{40}$/.test(address))throw Error('Enter a deployed contract address.');
  const [m,network]=await Promise.all([deployment(),preflight()]);
  const source=await reader.getContractCode(address),hash=hashText(source);
  if(hash!==m.source_sha256)throw Error('The deployed source differs from the bundled COUNTERPOINT contract.');
  const protocol=JSON.parse(await reader.readContract({address,functionName:'get_protocol',args:[],transactionHashVariant:'latest-final'}));
  if(protocol.version!==VERSION)throw Error('Contract protocol differs from COUNTERPOINT.');verified=address.toLowerCase();return{address,source_sha256:hash,network,protocol};
}
export async function read(address,roomId){
  if(verified!==address.toLowerCase())await verify(address);
  const room=JSON.parse(await reader.readContract({address,functionName:'get_room',args:[roomId],transactionHashVariant:'latest-final'}));
  if(room.id!==roomId)throw Error('Unexpected discussion reference.');return verifyRoom(room);
}
export function decodeCall(tx){const raw=tx.data?.calldata,base64=typeof raw==='string'?raw:raw?.base64;if(base64)return normalize(abi.calldata.decode(Uint8Array.from(atob(base64),c=>c.charCodeAt(0))));return normalize(tx.txDataDecoded?.callData||null);}
export function bindReceipt(tx,p){
  if((tx.from_address||tx.sender||'').toLowerCase()!==p.sender.toLowerCase())throw Error('Receipt sender differs from signed intent.');
  if(tx.leader_only===true||tx.txDataDecoded?.leaderOnly===true||tx.data?.leader_only===true)throw Error('Leader-only execution is not accepted.');
  if(p.method==='deploy')return;
  if((tx.to_address||tx.recipient||'').toLowerCase()!==p.address.toLowerCase())throw Error('Receipt recipient differs from signed intent.');
  const call=decodeCall(tx);if(!call||call.method!==p.method||canonical(call.args||[])!==canonical(p.args)||Object.keys(call.kwargs||{}).length)throw Error('Receipt method or arguments differ from signed intent.');
}
export function bindReadback(room,p){
  if(p.method==='open_room'){
    if(room.owner.toLowerCase()!==p.sender.toLowerCase()||room.question!==p.args[1].trim()||canonical(room.members)!==canonical(JSON.parse(p.args[2]).map(a=>a.toLowerCase())))throw Error('Created discussion differs from signed intent.');
  }
  if(p.method==='submit_voice'){
    const seat=room.members.indexOf(p.sender.toLowerCase());const expected=JSON.parse(p.args[1]);expected.arguments=expected.arguments.map(a=>({title:a.title.trim(),text:a.text.trim()}));expected.challenges=expected.challenges.map(e=>({...e,basis:e.basis.trim()})).sort((a,b)=>a.source.localeCompare(b.source)||a.target.localeCompare(b.target));
    if(seat<0||canonical(room.voices[seat])!==canonical(expected))throw Error('Signed voice differs from finalized state.');
  }
  if(p.method==='map_room'&&(!['MAPPED','REVIEW'].includes(room.status)||room.input_digest!==p.args[1]))throw Error('Mapped discussion does not bind the inspected inputs.');
}
export async function send(address,method,args,roomId,onChange){
  if(pending())throw Error('There is a saved transaction. Recheck it before sending another.');
  if(!current())throw Error('Connect a wallet or create a free test participant.');
  await preflight();if(method!=='deploy'&&verified!==address.toLowerCase())await verify(address);
  let code;if(method==='deploy'){code=await fetch('./counterpoint.py').then(r=>r.text());if(hashText(code)!==(await deployment()).source_sha256)throw Error('Bundled source hash mismatch.');await reader.getContractSchemaForCode(code);}
  const p={sender:current(),address,method,args:normalize(args),room_id:roomId,hash:null,status:'SIGNING',submitted_at:new Date().toISOString()};save(p);onChange?.(p);
  const account=provider?current():signers[active];const writer=createClient({chain,endpoint:RPC,account,...(provider?{provider}:{})});
  try{p.hash=method==='deploy'?await writer.deployContract({code,args:[],leaderOnly:false,consensusMaxRotations:3}):await writer.writeContract({address,functionName:method,args,value:0n,leaderOnly:false,consensusMaxRotations:3});p.status='SUBMITTED';save(p);onChange?.(p);return p;}
  catch(e){if(e.code===4001||e.cause?.code===4001){save(null);throw Error('Signature declined. No transaction submitted.');}p.status='SUBMISSION_UNCERTAIN';p.error=String(e.message||e);save(p);throw Error('Submission returned no hash. Inspect wallet history before resending. '+p.error);}
}
export async function check(){
  const p=pending();if(!p)return{status:'NONE'};if(!p.hash)throw Error('No transaction hash was returned. Inspect wallet history before resending.');
  const tx=await reader.getTransaction({hash:p.hash}),status=tx.statusName||tx.status;
  if(status!=='FINALIZED'){
    if(['CANCELED','UNDETERMINED','LEADER_TIMEOUT','VALIDATORS_TIMEOUT','DISAGREEMENT'].includes(status)){const entry={...p,status,transaction:normalize(tx)};remember(entry);save(null);throw Error('Transaction ended without success: '+status+'. No retry sent.');}
    return{...p,status};
  }
  const receipts=tx.consensus_data?.leader_receipt,leader=Array.isArray(receipts)?receipts.at(-1):receipts;
  const execution=tx.txExecutionResultName||leader?.execution_result;
  if(execution!=='SUCCESS'){remember({...p,status,execution,transaction:normalize(tx)});save(null);throw Error('Finalized execution failed: '+(leader?.error||JSON.stringify(leader?.result)||execution));}
  const consensus=tx.resultName||tx.result_name||tx.result;if(consensus!=='MAJORITY_AGREE')throw Error('Finalized receipt has no majority agreement.');bindReceipt(tx,p);
  let address=p.address,room=null;
  if(p.method==='deploy'){address=tx.data?.contract_address||tx.txDataDecoded?.contractAddress||tx.to_address||tx.recipient;if(!address)throw Error('Deployment address missing from receipt.');await verify(address);}
  else{room=await read(address,p.room_id);bindReadback(room,p);}
  const entry={...p,address,status,execution,room,transaction:normalize(tx),checked_at:new Date().toISOString()};remember(entry);save(null);return entry;
}
export async function track(onChange){for(let i=0;i<150;i++){const result=await check();onChange?.(result);if(['FINALIZED','NONE'].includes(result.status))return result;await new Promise(r=>setTimeout(r,4000));}throw Error('Still pending. Recheck this saved transaction later; no duplicate is sent.');}
