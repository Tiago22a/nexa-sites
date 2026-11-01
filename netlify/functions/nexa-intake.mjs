import {randomUUID,createCipheriv,createDecipheriv,randomBytes} from "node:crypto";
import {getStore} from "@netlify/blobs";

// Encrypted copy of a *draft* contract and the related intake data.
// Public submission stays DISABLED until site verification, encryption and WAF are configured.
const FLAG=process.env.NEXA_INTAKE_ENABLED==="true";
const SITE=process.env.NEXA_TURNSTILE_SITE_KEY||"";
const SECRET=process.env.NEXA_TURNSTILE_SECRET_KEY||"";
const KEY=process.env.NEXA_INTAKE_ENCRYPTION_KEY||"";
const key=()=>/^[a-f0-9]{64}$/i.test(KEY)?Buffer.from(KEY,"hex"):null;
const ready=()=>FLAG&&!!key()&&SITE.length>10&&SECRET.length>20;
const db=()=>getStore({name:"nexa-intakes-v1-"+(process.env.CONTEXT==="production"?"prod":"preview"),consistency:"strong"});
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store, private","referrer-policy":"no-referrer","x-content-type-options":"nosniff"}});
const digits=s=>String(s||"").replace(/\D/g,"");
const simple=(v,min,max)=>typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max;
const uuid=id=>/^[a-f0-9-]{36}$/i.test(id);
const brazilStates=new Set("AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" "));
function cpfValid(s){
 const cpf=digits(s);if(cpf.length!==11||/^(\d)\1{10}$/.test(cpf))return false;
 for(let len=9;len<=10;len++){
  const weighted=[...cpf.slice(0,len)].reduce((sum,d,i)=>sum+Number(d)*(len+1-i),0);
  const expected=(weighted*10)%11%10;if(expected!==Number(cpf[len]))return false;
 }return true;
}
function valid(data){
 const o={};
 o.plan=String(data.plan||"").toLowerCase();
 if(!["barco","iate","submarino"].includes(o.plan))throw Error("Plano inválido.");
 const person=data.customer;
 if(!person||typeof person!=="object"||Array.isArray(person))throw Error("Cadastro inválido.");
 for(const k of ["name","rg","email","phone","cpf","cep","street","number","neighborhood","city","uf"]){
  o[k]=String(person[k]||"").trim();
 }
 o.complement=String(person.complement||"").trim();
 if(!simple(o.name,3,120)||!simple(o.rg,3,30)||!simple(o.email,5,140)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(o.email))throw Error("Verifique nome, RG e e-mail.");
 if(!cpfValid(o.cpf))throw Error("CPF inválido.");
 if(digits(o.phone).length<10||digits(o.phone).length>13)throw Error("WhatsApp inválido.");
 if(digits(o.cep).length!==8||!simple(o.street,3,120)||!simple(o.number,1,15)||!simple(o.neighborhood,2,90)||!simple(o.city,2,80)||!brazilStates.has(o.uf.toUpperCase())||o.complement.length>100)throw Error("Confira o endereço.");
 o.uf=o.uf.toUpperCase();
 if(data.privacyAccepted!==true)throw Error("É necessário consentimento explícito para enviar os dados à NEXA.");
 const pdf=String(data.contractPdfBase64||"");
 if(pdf.length<600||pdf.length>105000||!/^[A-Za-z0-9+/=]+$/.test(pdf))throw Error("PDF de minuta inválido.");
 const buffer=Buffer.from(pdf,"base64");if(buffer.length<400||buffer.length>78000||!buffer.subarray(0,8).toString().startsWith("%PDF-1."))throw Error("O documento não é um PDF válido.");
 return {customer:o,contractPdfBase64:pdf,plan:o.plan};
}
async function turnstile(token,request){
 if(!simple(token,30,2200))return false;
 const body=new URLSearchParams({secret:SECRET,response:token});
 const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body,signal:AbortSignal.timeout(10000)});
 const result=await response.json();
 return result.success===true&&result.hostname===new URL(request.url).hostname;
}
function encrypt(obj){
 const iv=randomBytes(12),cipher=createCipheriv("aes-256-gcm",key(),iv);
 const ct=Buffer.concat([cipher.update(JSON.stringify(obj),"utf8"),cipher.final()]);
 return {v:1,iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64"),data:ct.toString("base64")};
}
function decrypt(obj){
 const decipher=createDecipheriv("aes-256-gcm",key(),Buffer.from(obj.iv,"base64"));
 decipher.setAuthTag(Buffer.from(obj.tag,"base64"));
 const plaintext=Buffer.concat([decipher.update(Buffer.from(obj.data,"base64")),decipher.final()]);
 return JSON.parse(plaintext.toString("utf8"));
}
export async function adminIntakes(){
 if(!key())throw Error("Criptografia de contratos não configurada.");
 const store=db();let cursor,all=[],round=0;
 do{
  const page=await store.list({prefix:"intakes/",...(cursor?{cursor}:{})});
  all.push(...page.blobs.map(i=>i.key));
  cursor=page.cursor;round++;
  if(round>8)throw Error("Há registros demais para esta listagem; precisa de paginação.");
 }while(cursor);
 const items=[];
 for(let i=0;i<all.length;i+=15){
  const group=await Promise.all(all.slice(i,i+15).map(async k=>{
   const envelope=await store.get(k,{type:"json",consistency:"strong"});
   if(!envelope)return null;
   const d=decrypt(envelope);
   return {id:d.id,plan:d.plan,name:d.customer.name,email:d.customer.email,createdAt:d.createdAt,status:"minuta recebida"};
  }));
  items.push(...group.filter(Boolean));
 }
 return items.sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,150);
}
export async function adminIntake(id){
 if(!uuid(id)||!key())return null;
 const envelope=await db().get("intakes/"+id,{type:"json",consistency:"strong"});
 return envelope?decrypt(envelope):null;
}
export default async function handler(request){
 const url=new URL(request.url),op=url.searchParams.get("op")||"config";
 if(op==="config"&&request.method==="GET")return reply({enabled:ready(),sitekey:ready()?SITE:null});
 if(op!=="submit"||request.method!=="POST")return reply({error:"Rota inexistente."},404);
 if(!ready())return reply({error:"Envio automático aguardando ativação pela NEXA. Baixe a minuta e compartilhe com a equipe."},503);
 if(request.headers.get("origin")!==url.origin)return reply({error:"Origem não autorizada."},403);
 try{
  const body=await request.text();
  if(body.length>120000)throw Error("Solicitação muito grande.");
  const payload=JSON.parse(body);
  if(!await turnstile(payload.turnstileToken,request))return reply({error:"Não foi possível verificar a segurança da solicitação."},403);
  const checked=valid(payload);
  const id=randomUUID(),createdAt=new Date().toISOString();
  const result=await db().setJSON("intakes/"+id,encrypt({id,createdAt,...checked}),{onlyIfNew:true});
  if(result?.modified===false)throw Error("Falha ao registrar minuta.");
  return reply({ok:true,reference:id.slice(0,8).toUpperCase()});
 }catch(error){console.error("NEXA intake:",error?.message);return reply({error:"Não foi possível receber esta minuta. Confira os dados ou tente novamente com a equipe."},400)}
}
export const config={path:"/.netlify/functions/nexa-intake"};
