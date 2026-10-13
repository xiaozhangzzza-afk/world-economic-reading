import {readFile,writeFile} from 'node:fs/promises';
// Credential stays in the GitHub Actions secret store; never log headers or response errors.
if(!process.env.SITES_AUTH_TOKEN)throw new Error('SITES_AUTH_TOKEN is required');
const response=await fetch('https://world-economic-reading.socialbetta.chatgpt.site/api/briefs',{headers:{'OAI-Sites-Authorization':'Bearer '+process.env.SITES_AUTH_TOKEN},redirect:'error',signal:AbortSignal.timeout(30000)});
if(!response.ok)throw new Error('Source request failed: HTTP '+response.status);
const data=await response.json();
if(data.storageWarning||!Array.isArray(data.briefs))throw new Error('Source storage is unavailable');
const dates=new Set();
for(const b of data.briefs){if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||dates.has(b.date)||!Array.isArray(b.items)||!['complete','empty','failed'].includes(b.status))throw new Error('Invalid archive');dates.add(b.date);for(const x of b.items){for(const key of ['title','source','published','url','category','conclusion','value'])if(typeof x[key]!=='string'||!x[key].trim())throw new Error('Invalid item');if(!/^https?:\/\//.test(x.url))throw new Error('Invalid source URL');}}
const current=JSON.parse(await readFile('public/data/briefs.json','utf8'));
for(const old of current.briefs){const replacement=data.briefs.find(b=>b.date===old.date);if(!replacement||old.status==='complete'&&replacement.status!=='complete')throw new Error('Refusing to discard completed archive');}
const output=JSON.stringify({briefs:data.briefs.sort((a,b)=>b.date.localeCompare(a.date))},null,2)+'\n';
if(output===await readFile('public/data/briefs.json','utf8'))console.log('Archive unchanged.');else {await writeFile('public/data/briefs.json',output);console.log('Archive updated: '+data.briefs.length+' editions.');}
