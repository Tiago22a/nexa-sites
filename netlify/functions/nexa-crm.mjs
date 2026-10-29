import { scryptSync, createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { getStore } from "@netlify/blobs";

const ADMIN_USERS = (() => {
  const users = Object.create(null);
  const json = process.env.NEXA_ADMIN_USERS_JSON || "";
  if(json){
    try{
      const parsed=JSON.parse(json);
      for(const [name,hash] of Object.entries(parsed)){
        if(/^[A-Za-z0-9._-]{3,70}$/.test(name)&&typeof hash==="string"&&hash.length<400)users[name]=hash;
      }
    }catch{console.error("NEXA_ADMIN_USERS_JSON inválido");}
  }
  if(process.env.NEXA_ADMIN_USERNAME&&process.env.NEXA_ADMIN_PASSWORD_HASH){
    users[process.env.NEXA_ADMIN_USERNAME]=process.env.NEXA_ADMIN_PASSWORD_HASH;
  }
  return users;
})();
const SECRET = process.env.NEXA_SESSION_SECRET || "";
const HERMES_KEY = process.env.NEXA_HERMES_API_KEY || "";
const COOKIE = "nexa_admin_session";
const TYPES = {
  clients: ["name","company","email","phone","plan","status","notes"],
  projects: ["clientId","title","deadline","status","briefingUrl","notes"],
  invoices: ["clientId","amount","dueDate","paidOn","method","status","notes"],
  portfolio: ["clientId","title","kind","url","notes"]
};
const MAX_FIELDS = { name:130, company:150, email:150, phone:35, plan:50, status:40,
  notes:1200, clientId:80, title:150, deadline:15, briefingUrl:450, amount:25,
  dueDate:15, paidOn:15, method:45, kind:45, url:450 };

function response(value,status=200,headers={}){
  return new Response(JSON.stringify(value),{status,headers:{
    "content-type":"application/json; charset=utf-8","cache-control":"no-store",
    "x-content-type-options":"nosniff","referrer-policy":"no-referrer",...headers}});
}
function compare(a,b){
  const aa=Buffer.from(a||""),bb=Buffer.from(b||"");
  return aa.length===bb.length && timingSafeEqual(aa,bb);
}
function sign(payload){
  const body=Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body+"."+createHmac("sha256",SECRET).update(body).digest("base64url");
}
function readSession(request){
  if(!SECRET)return null;
  const cookies=request.headers.get("cookie")||"";
  const raw=cookies.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
  if(!raw || raw.length>2400)return null;
  const [body,signature]=raw.split(".");
  if(!body||!signature)return null;
  const expected=createHmac("sha256",SECRET).update(body).digest("base64url");
  if(!compare(signature,expected))return null;
  try{
    const data=JSON.parse(Buffer.from(body,"base64url").toString("utf8"));
    if(data.role!=="admin"||!Object.hasOwn(ADMIN_USERS,data.user)||Date.now()>data.exp)return null;
    return data;
  }catch{return null;}
}
function sameOrigin(request){
  const origin=request.headers.get("origin");
  const url=new URL(request.url);
  return origin===url.origin && request.headers.get("x-nexa-admin")==="1";
}
function authCookie(token,maxAge){
  return COOKIE+"="+token+"; Path=/.netlify/functions/nexa-crm; HttpOnly; Secure; SameSite=Strict; Max-Age="+maxAge;
}
function store(){
  const context=process.env.CONTEXT==="production"?"production":"preview";
  return getStore({name:"nexa-crm-"+context,consistency:"strong"});
}
function clean(type,input){
  const fields=TYPES[type];if(!fields||!input||typeof input!=="object"||Array.isArray(input))return null;
  const result={};
  for(const name of fields){
    const value=input[name];
    if(value==null||value==="")continue;
    if(typeof value!=="string"&&typeof value!=="number")return null;
    const v=String(value).trim();
    if(v.length>MAX_FIELDS[name])return null;
    result[name]=v;
  }
  if(type==="clients"&&!result.name)return null;
  if(type==="projects"&&(!result.title||!result.clientId))return null;
  if(type==="invoices"&&(!result.clientId||!result.dueDate||!result.amount))return null;
  if(type==="portfolio"&&(!result.clientId||!result.title))return null;
  for(const key of ["dueDate","deadline","paidOn"]){
    if(result[key] && !/^\d{4}-\d{2}-\d{2}$/.test(result[key]))return null;
  }
  for(const key of ["url","briefingUrl"]){
    if(result[key]){
      try{const u=new URL(result[key]);if(u.protocol!=="https:")return null;}
      catch{return null;}
    }
  }
  if(result.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email))return null;
  if(result.amount&&!/^\d+(?:\.\d{1,2})?$/.test(result.amount))return null;
  return result;
}
async function allRecords(type){
  const s=store();
  const listed=await s.list({prefix:type+"/"});
  const keys=listed.blobs.slice(0,350).map(item=>item.key);
  const values=await Promise.all(keys.map(key=>s.get(key,{type:"json",consistency:"strong"})));
  return values.filter(x=>x&&typeof x==="object").sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));
}
async function onlySummary(){
  const [clients,projects,invoices]=await Promise.all(["clients","projects","invoices"].map(allRecords));
  const today=new Date().toISOString().slice(0,10);
  const overdue=invoices.filter(x=>x.status!=="paid"&&!x.paidOn&&x.dueDate<today);
  const soon=invoices.filter(x=>x.status!=="paid"&&!x.paidOn&&x.dueDate>=today&&x.dueDate<=new Date(Date.now()+7*86400000).toISOString().slice(0,10));
  return {generatedAt:new Date().toISOString(),counts:{clients:clients.length,projects:projects.length,invoices:invoices.length,overdue:overdue.length,dueSoon:soon.length},graceDays:3,automaticSuspension:false};
}
export default async (request)=>{
  const url=new URL(request.url);
  const op=url.searchParams.get("op")||"session";
  if(!SECRET||Object.keys(ADMIN_USERS).length===0)return response({error:"Painel ainda não configurado. Defina as variáveis secretas na Netlify."},503);
  if(request.method==="POST"&&!sameOrigin(request))return response({error:"Origem ou confirmação da requisição inválida."},403);
  try{
    if(op==="login"&&request.method==="POST"){
      const data=await request.json();
      const user=String(data.username||"");
      const [salt,hex]=String(Object.hasOwn(ADMIN_USERS,user)?ADMIN_USERS[user]:"").split(":");
      if(!salt||!hex||salt.length>128||hex.length!==128)return response({error:"Hash administrativo inválido."},503);
      const derived=scryptSync(String(data.password||"").slice(0,220),Buffer.from(salt,"hex"),64).toString("hex");
      if(!Object.hasOwn(ADMIN_USERS,user)||!compare(derived,hex))return response({error:"Credenciais inválidas."},401);
      const session=sign({role:"admin",user,exp:Date.now()+8*3600000,nonce:randomUUID()});
      return response({ok:true,user},200,{"set-cookie":authCookie(session,8*3600)});
    }
    if(op==="hermes-summary"){
      const bearer=request.headers.get("authorization")||"";
      if(!HERMES_KEY||!compare(bearer,"Bearer "+HERMES_KEY))return response({error:"Não autorizado."},401);
      if(request.method!=="GET")return response({error:"Acesso Hermes somente leitura."},405);
      return response(await onlySummary());
    }
    const user=readSession(request);
    if(!user)return response({error:"Sessão expirada ou acesso não autorizado."},401);
    if(op==="session"&&request.method==="GET")return response({ok:true,user:user.user,graceDays:3});
    if(op==="logout"&&request.method==="POST")return response({ok:true},200,{"set-cookie":authCookie("",0)});
    if(op==="list"&&request.method==="GET"){
      const type=url.searchParams.get("type");
      if(!TYPES[type])return response({error:"Categoria inválida."},400);
      return response({items:await allRecords(type)});
    }
    if(op==="save"&&request.method==="POST"){
      const payload=await request.json();
      const type=String(payload.type||"");
      const data=clean(type,payload.data);
      if(!data)return response({error:"Dados inválidos ou incompletos."},400);
      const s=store();
      const now=new Date().toISOString();
      const id=payload.id?String(payload.id):randomUUID();
      if(!/^[a-f0-9-]{36}$/.test(id))return response({error:"Identificador inválido."},400);
      let old=null,etag=null;
      if(payload.id){
        const prev=await s.getWithMetadata(type+"/"+id,{type:"json",consistency:"strong"});
        if(!prev?.data)return response({error:"Registro não encontrado."},404);
        old=prev.data;etag=prev.etag;
      }
      if(type!=="clients"){
        const owner=await s.get("clients/"+data.clientId,{type:"json",consistency:"strong"});
        if(!owner)return response({error:"Selecione um cliente cadastrado."},400);
      }
      const record={...data,id,type,createdAt:old?.createdAt||now,updatedAt:now};
      const opts=old?{onlyIfMatch:etag}:{onlyIfNew:true};
      const result=await s.setJSON(type+"/"+id,record,opts);
      if(result?.modified===false)return response({error:"Registro foi alterado em outra sessão. Atualize e tente de novo."},409);
      return response({item:record});
    }
    if(op==="delete"&&request.method==="POST"){
      const payload=await request.json();
      const type=String(payload.type||""),id=String(payload.id||"");
      if(!TYPES[type]||!/^[a-f0-9-]{36}$/.test(id))return response({error:"Parâmetros inválidos."},400);
      if(type==="clients")return response({error:"Remoção de cliente bloqueada para preservar o histórico. Altere o status para inativo."},409);
      const s=store();
      await s.delete(type+"/"+id);
      return response({ok:true});
    }
    return response({error:"Rota ou método não encontrado."},404);
  }catch(error){
    console.error("NEXA CRM:",error?.message);
    return response({error:"Não foi possível concluir a operação. Confira configuração e serviço de armazenamento."},500);
  }
};
