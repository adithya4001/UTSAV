// Browser-only prototype access. Never authorizes server APIs.
const key = 'utsavops-demo-accounts-v1';
const sessionKey = 'utsavops-demo-session-v1';
function accounts(): any[] { return JSON.parse(localStorage.getItem(key) || '[]'); }
export function demoUser() { const id = sessionStorage.getItem(sessionKey); return accounts().find(x => x.id === id) || null; }
async function digest(password: string, salt: string) {
 const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
 const bits = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'}, material, 256);
 return Array.from(new Uint8Array(bits), x=>x.toString(16).padStart(2,'0')).join('');
}
export async function demoFetch(url: string, init?: RequestInit): Promise<Response> {
 const body = init?.body ? JSON.parse(String(init.body)) : {};
 const ok = (data: any, status=200) => Response.json(data,{status});
 if(url === '/api/account') {
  if(!init) return ok({configured:true});
  const all = accounts(), email = String(body.email || '').trim().toLowerCase();
  if(body.action === 'logout') {sessionStorage.removeItem(sessionKey); return ok({ok:true});}
  if(body.action === 'recover') {
   const target=all.find(x=>x.email===email);
   if(target) {localStorage.removeItem('utsavops-demo-data-'+target.id); localStorage.setItem(key,JSON.stringify(all.filter(x=>x.id!==target.id))); if(demoUser()?.id===target.id) sessionStorage.removeItem(sessionKey);}
   return ok({message:'Demo account cleared on this browser. Register again to start fresh. No email was sent.'});
  }
  if(body.action === 'register') {
   if(all.some(x=>x.email===email)) return ok({error:'An account already exists on this browser. Sign in or reset the demo account.'},400);
   if(!email || String(body.password).length<10) return ok({error:'Use an email and a password of at least 10 characters.'},400);
   const salt=crypto.randomUUID(), user={id:crypto.randomUUID(),email,name:body.name,salt,hash:await digest(body.password,salt)};
   localStorage.setItem(key,JSON.stringify([...all,user])); sessionStorage.setItem(sessionKey,user.id); return ok({redirect:'/workspace'});
  }
  const user=all.find(x=>x.email===email);
  if(!user || await digest(body.password,user.salt)!==user.hash) return ok({error:'Email or password does not match this browser’s demo account.'},400);
  sessionStorage.setItem(sessionKey,user.id); return ok({redirect:'/workspace'});
 }
 const user=demoUser();
 if(!user) return ok({error:'Sign in to the demo.'},401);
 if(url==='/api/plan') return ok({error:'Live AI is not connected in this prototype. Your personalised event draft is available in Creative plan.'},503);
 const dataKey='utsavops-demo-data-'+user.id;
 const data=JSON.parse(localStorage.getItem(dataKey)||'{"profile":null,"events":[]}');
 if(!init) return ok({...data,user:{name:user.name,email:user.email}});
 if(body.action==='profile') data.profile=body.profile;
 let result:any={ok:true};
 if(body.action==='save') {
  const existing=data.events.find((x:any)=>x.id===body.id);
  if(body.id && (!existing || existing.revision!==body.revision)) return ok({error:'This demo event changed. Reload orders before saving.'},409);
  result={id:body.id||crypto.randomUUID(),revision:(existing?.revision||0)+1,updatedAt:new Date().toISOString()};
  data.events=[{...result,state:body.state,status:body.status},...data.events.filter((x:any)=>x.id!==result.id)];
 }
 localStorage.setItem(dataKey,JSON.stringify(data)); return ok(result);
}
