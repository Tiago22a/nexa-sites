import {scryptSync,createHmac,timingSafeEqual,randomUUID} from "node:crypto";
import {getStore} from "@netlify/blobs";

// Isolated NEXA Command authentication. All secrets are environment-only.
const SECRET=process.env.NEXA_COMMAND_SESSION_SECRET||"";
const USERS=(()=>{
 const map=Object.create(null);
 try{
   const json=JSON.parse(process.env.NEXA_COMMAND_USERS_JSON||"{}");
   for(const [user,hash] of Object.entries(json)){
     if(/^[a-zA-Z0-9._-]{3,60}$/.test(user)&&/^[a-f0-9]{48}:[a-f0-9]{128}$/.test(String(hash)))map[user]=hash;
   }
 }catch{console.error("NEXA_COMMAND_USERS_JSON inválido");}
 return map;
})();
const COOKIE="nexa_command_session";
const SCHEMAS={
 leads:{fields:["company","name","phone","email","source","service","stage","nextAction","nextDate","assignee","estimatedValue","notes"],required:["name"],refs:[]},
 clients:{fields:["name","company","phone","email","segment","status","notes"],required:["name"],refs:[]},
 proposals:{fields:["clientId","leadId","title","service","amount","stage","validUntil","assignee","url","notes"],required:["title"],refs:["clientId","leadId"]},
 projects:{fields:["clientId","title","service","brand","deadline","status","priority","assignee","briefingUrl","notes"],required:["clientId","title"],refs:["clientId"]},
 tasks:{fields:["clientId","projectId","title","assignee","deadline","priority","status","notes"],required:["title"],refs:["clientId","projectId"]},
 contracts:{fields:["clientId","title","plan","amount","startDate","endDate","renewalDate","status","url","notes"],required:["clientId","title"],refs:["clientId"]},
 receivables:{fields:["clientId","projectId","title","amount","dueDate","paidOn","method","status","notes"],required:["clientId","title","amount","dueDate"],refs:["clientId","projectId"]},
 expenses:{fields:["title","category","vendor","amount","dueDate","paidOn","status","notes"],required:["title","amount","dueDate"],refs:[]},
 deliveries:{fields:["projectId","title","kind","url","deadline","status","notes"],required:["projectId","title"],refs:["projectId"]}
};
const STATUS={
 leads:["novo","em contato","reunião","proposta","ganho","perdido"],
 clients:["prospect","ativo","inativo"],
 proposals:["rascunho","enviada","negociação","aprovada","recusada","expirada"],
 projects:["planejado","em produção","aguardando cliente","revisão","concluído","pausado"],
 tasks:["pendente","em andamento","aguardando","concluída"],
 contracts:["rascunho","em assinatura","vigente","encerrado"],
 receivables:["pendente","em verificação","pago","cancelado"],
 expenses:["pendente","em verificação","pago","cancelado"],
 deliveries:["planejada","em produção","enviada","aprovada"]
};
const LIMITS={notes:2500,briefingUrl:500,url:500,email:180,phone:50,nextAction:250,amount:25,estimatedValue:25};
const REGEX_DATE=/^\d{4}-\d{2}-\d{2}$/;
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const now=()=>new Date().toISOString();
function json(data,status=200,headers={}){
 return new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store, private","x-content-type-options":"nosniff","referrer-policy":"no-referrer",...headers}});
}
function safeEqual(a,b){
 const aa=Buffer.from(String(a||"")),bb=Buffer.from(String(b||""));
 return aa.length===bb.length&&timingSafeEqual(aa,bb);
}
function sign(body){
 const payload=Buffer.from(JSON.stringify(body)).toString("base64url");
 return payload+"."+createHmac("sha256",SECRET).update(payload).digest("base64url");
}
function session(request){
 if(!SECRET)return null;
 const raw=(request.headers.get("cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
 if(!raw||raw.length>2400)return null;
 const parts=raw.split(".");
 if(parts.length!==2)return null;
 const expect=createHmac("sha256",SECRET).update(parts[0]).digest("base64url");
 if(!safeEqual(parts[1],expect))return null;
 try{
  const data=JSON.parse(Buffer.from(parts[0],"base64url").toString());
  if(data.v!==1||!Object.hasOwn(USERS,data.user)||!Number.isFinite(data.exp)||Date.now()>=data.exp)return null;
  return data;
 }catch{return null;}
}
function cookie(value,seconds){
 return COOKIE+"="+value+"; HttpOnly; Secure; SameSite=Strict; Path=/.netlify/functions/nexa-command; Max-Age="+seconds;
}
function sameOrigin(request){
 return request.headers.get("origin")===new URL(request.url).origin && request.headers.get("x-nexa-command")==="1";
}
function store(){
 return getStore({name:"nexa-command-v1-"+(process.env.CONTEXT==="production"?"prod":"preview"),consistency:"strong"});
}
function actualDate(str){
 if(!REGEX_DATE.test(str))return false;
 const [y,m,d]=str.split("-").map(Number),utc=new Date(Date.UTC(y,m-1,d));
 return utc.getUTCFullYear()===y&&utc.getUTCMonth()===m-1&&utc.getUTCDate()===d;
}
function normalize(type,raw){
 const schema=SCHEMAS[type];
 if(!schema||!raw||typeof raw!=="object"||Array.isArray(raw))return {error:"Categoria ou dados inválidos."};
 const clean={};
 for(const field of schema.fields){
  const val=raw[field];
  if(val==null||val==="")continue;
  if(typeof val!=="string"&&typeof val!=="number")return {error:"Tipo de campo inválido."};
  const value=String(val).trim();
  if(value.length>(LIMITS[field]||170))return {error:"Campo excede o limite permitido."};
  if((field==="amount"||field==="estimatedValue")&&(!/^\d{1,10}(?:\.\d{1,2})?$/.test(value)||!Number.isFinite(Number(value))))return {error:"Valor monetário inválido."};
  if((field.endsWith("Date")||["deadline","dueDate","paidOn","validUntil","startDate","endDate","renewalDate"].includes(field))&&!actualDate(value))return {error:"Data inválida."};
  if((field==="url"||field==="briefingUrl")){
   try{if(new URL(value).protocol!=="https:")return {error:"Use link HTTPS."};}
   catch{return {error:"URL inválida."};}
  }
  if(field==="email"&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))return {error:"E-mail inválido."};
  if(field.endsWith("Id")&&!ID.test(value))return {error:"Identificador relacionado inválido."};
  clean[field]=value;
 }
 for(const field of schema.required)if(!clean[field])return {error:"Preencha os campos obrigatórios."};
 if(clean.status&&!STATUS[type].includes(clean.status))return {error:"Situação inválida."};
 if(type==="leads"&&clean.stage&&!STATUS.leads.includes(clean.stage))return {error:"Etapa de negociação inválida."};
 if(type==="proposals"&&clean.stage&&!STATUS.proposals.includes(clean.stage))return {error:"Etapa da proposta inválida."};
 if(type==="proposals"&&!clean.clientId&&!clean.leadId)return {error:"Vincule a proposta a um cliente ou oportunidade."};
 if(["receivables","expenses"].includes(type)){
   if(clean.paidOn&&clean.status!=="pago")return {error:"Marque como pago quando informar a data da quitação."};
 }
 return {data:clean};
}
async function records(type){
 const db=store();
 let cursor,all=[],pages=0;
 do{
  const page=await db.list({prefix:type+"/", ...(cursor?{cursor}:{})});
  all.push(...page.blobs.map(x=>x.key));
  cursor=page.cursor;pages++;
  if(pages>12)throw Error("Limite de registros excedido: necessário banco transacional");
 }while(cursor);
 const batches=[];
 for(let i=0;i<all.length;i+=30){
  const values=await Promise.all(all.slice(i,i+30).map(k=>db.get(k,{type:"json",consistency:"strong"})));
  batches.push(...values.filter(v=>v&&typeof v==="object"));
 }
 return batches.sort((a,b)=>String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")));
}
async function logAction(user,action,type,id){
 try{
  await store().setJSON("audit/"+Date.now()+"-"+randomUUID(),{user,action,type,id,at:now()});
 }catch(e){console.error("NEXA audit:",e?.message);throw e;}
}
async function checkRefs(type,data){
 const db=store();
 for(const field of SCHEMAS[type].refs){
   if(!data[field])continue;
   const refType=field==="clientId"?"clients":field==="leadId"?"leads":"projects";
   const found=await db.get(refType+"/"+data[field],{type:"json",consistency:"strong"});
   if(!found)return false;
 }
 return true;
}
async function bodyOf(request){
 if(Number(request.headers.get("content-length")||0)>15000)throw Error("Requisição muito grande");
 const raw=await request.text();
 if(raw.length>15000)throw Error("Requisição muito grande");
 return JSON.parse(raw);
}
export default async function handler(request){
 const url=new URL(request.url);
 const op=url.searchParams.get("op")||"session";
 if(!SECRET||SECRET.length<32||Object.keys(USERS).length<2)return json({error:"Centro de Comando não ativado. Configure os dois administradores na hospedagem."},503);
 if(request.method==="POST"&&!sameOrigin(request))return json({error:"Origem não autorizada."},403);
 try{
  if(op==="login"&&request.method==="POST"){
   const data=await bodyOf(request),user=String(data.username||""),pass=String(data.password||"");
   if(pass.length<14||pass.length>220||!Object.hasOwn(USERS,user))return json({error:"Credenciais inválidas."},401);
   const [salt,expected]=USERS[user].split(":");
   const derived=scryptSync(pass,Buffer.from(salt,"hex"),64).toString("hex");
   if(!safeEqual(derived,expected))return json({error:"Credenciais inválidas."},401);
   const token=sign({v:1,user,exp:Date.now()+4*3600000,nonce:randomUUID()});
   return json({ok:true,user},200,{"set-cookie":cookie(token,4*3600)});
  }
  const auth=session(request);
  if(!auth)return json({error:"Sessão expirada ou acesso não autorizado."},401);
  if(op==="session"&&request.method==="GET")return json({ok:true,user:auth.user});
  if(op==="logout"&&request.method==="POST")return json({ok:true},200,{"set-cookie":cookie("",0)});
  if(op==="list"&&request.method==="GET"){
   const type=url.searchParams.get("type");
   if(!SCHEMAS[type])return json({error:"Módulo inválido."},400);
   return json({items:await records(type)});
  }
  if(op==="audit"&&request.method==="GET"){
   const list=await records("audit");
   return json({items:list.slice(0,60)});
  }
  if(op==="save"&&request.method==="POST"){
   const payload=await bodyOf(request),type=String(payload.type||""),val=normalize(type,payload.data);
   if(val.error)return json({error:val.error},400);
   const data=val.data;
   if(!await checkRefs(type,data))return json({error:"Cliente, oportunidade ou projeto vinculado não encontrado."},400);
   const id=payload.id?String(payload.id):randomUUID();
   if(!ID.test(id))return json({error:"Identificador inválido."},400);
   const db=store(),key=type+"/"+id,time=now();
   let old=null,etag=null;
   if(payload.id){
    const prior=await db.getWithMetadata(key,{type:"json",consistency:"strong"});
    if(!prior?.data)return json({error:"Registro não encontrado."},404);
    old=prior.data;etag=prior.etag;
   }
   const item={...data,id,type,createdAt:old?.createdAt||time,createdBy:old?.createdBy||auth.user,updatedAt:time,updatedBy:auth.user};
   const result=await db.setJSON(key,item,old?{onlyIfMatch:etag}:{onlyIfNew:true});
   if(result?.modified===false)return json({error:"Registro alterado por outro usuário. Recarregue e tente novamente."},409);
   await logAction(auth.user,old?"update":"create",type,id);
   return json({item});
  }
  if(op==="delete"&&request.method==="POST"){
   const payload=await bodyOf(request),type=String(payload.type||""),id=String(payload.id||"");
   if(!SCHEMAS[type]||!ID.test(id))return json({error:"Parâmetros inválidos."},400);
   if(["clients","contracts","receivables","expenses"].includes(type))return json({error:"Mantenha o histórico: altere o status ou arquive manualmente."},409);
   if(!await store().get(type+"/"+id,{type:"json",consistency:"strong"}))return json({error:"Registro não encontrado."},404);
   await store().delete(type+"/"+id);
   await logAction(auth.user,"delete",type,id);
   return json({ok:true});
  }
  return json({error:"Rota ou método inválido."},404);
 }catch(e){
  console.error("NEXA Command:",e?.message);
  return json({error:"Não foi possível concluir a operação. Revise os dados e a configuração."},500);
 }
}
export const config={path:"/.netlify/functions/nexa-command"};
