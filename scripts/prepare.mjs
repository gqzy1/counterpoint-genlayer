import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await mkdir('public',{recursive:true});
const code=await readFile('contracts/counterpoint.py');
await copyFile('contracts/counterpoint.py','public/counterpoint.py');
let m;try{m=JSON.parse(await readFile('public/deployment.json','utf8'));}catch{m={version:'counterpoint-1',chain_id:61999,rpc:'https://studio.genlayer.com/api',address:null,example:null};}
m.source_sha256=createHash('sha256').update(code).digest('hex');
await writeFile('public/deployment.json',JSON.stringify(m,null,2)+'\n');
