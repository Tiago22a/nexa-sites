import {createHash,randomBytes,timingSafeEqual} from "node:crypto";
import {getStore} from "@netlify/blobs";

// NEXA + Asaas: no public payment without an administrator-approved contract.
// All prices and payer records are created on the server. The client gets a capability token.
const ID=/^[0-9a-f]{32}$/i;
const ROOT=process.env.ASAAS_BASE_URL==="https://api.asaas.com/v3"?"https://api.asaas.com/v3":"https://api-sandbox.asaas.com/v3";
const live=ROOT==="https://api.asaas.com/v3";
const enabled=()=>process.env.ASAAS_PAYMENTS_ENABLED==="true"&&!!process.env.ASAAS_API_KEY;
const store=()=>getStore({name:"nexa-asaas-"+(process.env.CONTEXT==="production"?"prod":"preview"),consistency:"strong"});
const digest=v=>createHash("sha256").update(v).digest("hex");
const safe=(a,b)=>{const aa=Buffer.from(String(a)),bb=Buffer.from(String(b));return aa.length===bb.length&&timingSafeEqual(aa,bb)};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json;charset=utf-8","cache-control":"no-store,private","referrer-policy":"no-referrer","x-content-type-options":"nosniff"}});
const digits=v=>String(v||"").replace(/\D/g,"");
const money=v=>Math.round(Number(v)*100);
const day=(delta=2)=>{const d=new Date();d.setUTCDate(d.getUTCDate()+delta);return d.toISOString().slice(0,10)};
const rate=v=>Number((v/100).toFixed(2));
const plans={
 barco:{name:"BARCO",cash:149000,monthly:13907,count:12},
 iate:{name:"IATE",cash:249000,monthly:23240,count:12}
};
async function api(path,options={}){
 if(!enabled())throw new Error("Conta Asaas ainda não habilitada nas variáveis privadas do Netlify.");
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),14000);
 try{
  const r=await fetch(ROOT+path,{...options,signal:ctrl.signal,headers:{"Content-Type":"application/json","accept":"application/json","User-Agent":"NexaBlue/1.0","access_token":process.env.ASAAS_API_KEY,...options.headers}});
  const data=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error("Asaas recusou a operação ("+r.status+"). Confira cadastro e habilitação no painel.");
  return data;
 }finally{clearTimeout(timer)}
}
function offer(data){
 const plan=String(data.plan||"").toLowerCase();
 if(Object.hasOwn(plans,plan))return {plan,...plans[plan]};
 if(plan!=="submarino")throw new Error("Plano inválido.");
 const cash=money(data.cash),monthly=money(data.monthly),count=Number(data.count||1);
 if(!Number.isSafeInteger(cash)||cash<100||cash>50000000)throw new Error("Valor de proposta inválido.");
 if(!Number.isInteger(count)||count<1||count>12)throw new Error("Número de parcelas inválido.");
 if(count>1&&(!Number.isSafeInteger(monthly)||monthly<100||monthly>50000000))throw new Error("Parcela de proposta inválida.");
 return {plan,name:"SUBMARINO",cash,monthly:count>1?monthly:cash,count};
}
export async function preparePayment(data,origin){
 if(!enabled())throw new Error("Integração Asaas desativada. Configure primeiro a conta e habilite o ambiente.");
 if(data?.signed!==true)throw new Error("Somente contratos já assinados podem receber link de cobrança.");
 const ref=String(data.contractReference||"").trim();
 const name=String(data.customerName||"").trim(),cpfCnpj=digits(data.cpfCnpj),email=String(data.email||"").trim();
 if(ref.length<6||ref.length>120)throw new Error("Informe a referência do contrato assinado.");
 if(name.length<3||name.length>120||![11,14].includes(cpfCnpj.length)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("Nome, CPF/CNPJ e e-mail do contrato precisam estar completos.");
 const terms=offer(data);
 const id=randomBytes(16).toString("hex"),token=randomBytes(32).toString("hex");
 // If the Asaas customer request times out, stop; do not retry automatically.
 const customer=await api("/customers",{method:"POST",body:JSON.stringify({name,cpfCnpj,email,externalReference:"NEXA-"+id,notificationDisabled:true})});
 if(!/^cus_/.test(String(customer.id||"")))throw new Error("Asaas não retornou ID de cliente válido.");
 const order={id,tokenHash:digest(token),plan:terms.plan,planName:terms.name,contractReference:ref,
  customerId:customer.id,cash:terms.cash,monthly:terms.monthly,count:terms.count,
  paymentId:null,method:null,status:"ready",createdAt:new Date().toISOString(),
  expiresAt:new Date(Date.now()+30*86400000).toISOString(),environment:live?"production":"sandbox"};
 const stored=await store().setJSON("orders/"+id,order,{onlyIfNew:true});
 if(stored?.modified===false)throw new Error("Não foi possível reservar o identificador do pedido.");
 const base=new URL(origin);
 if(!["https:","http:"].includes(base.protocol))throw new Error("Domínio inválido");
 const url=new URL("/planos/"+terms.plan+"/",base);
 url.hash="pagar="+id+"."+token; // fragment never travels in HTTP referrer
 return {url:url.toString(),id,plan:terms.name,environment:order.environment};
}
async function authorized(id,token){
 if(!ID.test(String(id||""))||!/^[a-f0-9]{64}$/i.test(String(token||"")))return null;
 const order=await store().get("orders/"+id,{type:"json",consistency:"strong"});
 if(!order||!safe(digest(String(token)),order.tokenHash))return null;
 return order;
}
async function input(request){
 const raw=await request.text();
 if(raw.length>2500)throw Error("Requisição extensa");
 return JSON.parse(raw);
}
const invoiceUrl=v=>{
 const url=new URL(v);
 if(url.protocol!=="https:"||!(url.hostname==="asaas.com"||url.hostname.endsWith(".asaas.com")))throw Error("Link de cobrança não confiável");
 return url.toString();
};
function publicState(order){
 return {plan:order.planName,environment:order.environment,
  cash:rate(order.cash),monthly:rate(order.monthly),count:order.count,
  method:order.method,status:order.status,
  firstPaymentConfirmed:!!order.firstPaymentConfirmedAt,
  // A payer can reopen their previously chosen invoice; never expose bank data.
  invoiceUrl:order.invoiceUrl||null};
}
async function pay(order,mode){
 if(!enabled())return json({error:"Pagamentos ainda não ativados."},503);
 if(!["pix","boleto","credit_card"].includes(mode))return json({error:"Forma inválida"},400);
 if(Date.now()>Date.parse(order.expiresAt))return json({error:"Link expirado. Solicite outro à NEXA."},410);
 if(order.paymentId){
  if(order.method===mode&&order.invoiceUrl)return json({invoiceUrl:order.invoiceUrl,status:order.status});
  return json({error:"Este contrato já possui uma forma de cobrança vinculada. Peça ajuda à NEXA para trocar."},409);
 }
 // Strongly consistent conditional claim: an uncertain timeout never triggers duplicate charging.
 const claim=await store().setJSON("claims/"+order.id,{method:mode,startedAt:new Date().toISOString()},{onlyIfNew:true});
 if(claim?.modified===false)return json({error:"Cobrança em preparação. Aguarde ou procure a equipe; não tente gerar outra."},409);
 const obj={customer:order.customerId,billingType:mode==="pix"?"PIX":mode==="boleto"?"BOLETO":"CREDIT_CARD",
  dueDate:day(3),externalReference:order.id,description:"NEXA BLUE / "+order.planName+" / Contrato "+order.contractReference};
 if(mode==="boleto"&&order.count>1){obj.installmentCount=order.count;obj.installmentValue=rate(order.monthly)}
 else obj.value=rate(order.cash);
 try{
  const res=await api("/payments",{method:"POST",body:JSON.stringify(obj)});
  if(!/^pay_/.test(String(res.id||"")))throw Error("Asaas não retornou identificador da cobrança");
  const target=invoiceUrl(res.invoiceUrl||res.bankSlipUrl);
  const prior=await store().getWithMetadata("orders/"+order.id,{type:"json",consistency:"strong"});
  if(!prior?.data||prior.data.paymentId)throw Error("Pedido alterado durante a criação da cobrança.");
  const updated={...prior.data,paymentId:res.id,installmentId:res.installment||null,method:mode,invoiceUrl:target,status:"pending",createdPaymentAt:new Date().toISOString()};
  const saved=await store().setJSON("orders/"+order.id,updated,{onlyIfMatch:prior.etag});
  if(saved?.modified===false)throw Error("Pedido alterado durante a gravação. Necessária conciliação manual.");
  return json({invoiceUrl:target,status:"pending"});
 }catch(e){console.error("Asaas payment needs manual reconciliation:",order.id,e.message);return json({error:"Não foi possível concluir com segurança. A equipe deve conferir o Asaas antes de tentar novamente."},502)}
}
async function webhook(request){
 const secret=process.env.ASAAS_WEBHOOK_TOKEN||"";
 if(secret.length<32||!safe(request.headers.get("asaas-access-token")||"",secret))return json({error:"Não autorizado"},401);
 const data=await input(request),eventId=String(data.id||"");
 if(!/^[\w-]{4,120}$/.test(eventId))return json({error:"Evento inválido"},400);
 const db=store();
 if(await db.get("events/"+eventId,{type:"json",consistency:"strong"}))return json({ok:true});
 const p=data.payment||{},orderId=String(p.externalReference||""),paymentId=String(p.id||"");
 const positive=["PAYMENT_CONFIRMED","PAYMENT_RECEIVED"].includes(data.event);
 let verified=false;
 if(positive&&ID.test(orderId)&&/^pay_/.test(paymentId)){
  const order=await db.getWithMetadata("orders/"+orderId,{type:"json",consistency:"strong"});
  if(order?.data?.paymentId===paymentId&&order.data.firstPaymentConfirmedAt){verified=true;}
  else if(order?.data?.paymentId===paymentId&&!order.data.firstPaymentConfirmedAt){
   // Never trust webhook payload alone for marking a payment settled.
   const canonical=await api("/payments/"+encodeURIComponent(paymentId));
   if(["CONFIRMED","RECEIVED"].includes(canonical.status)&&canonical.externalReference===orderId&&money(canonical.value)===(order.data.method==="boleto"&&order.data.count>1?order.data.monthly:order.data.cash)){
    const update={...order.data,firstPaymentConfirmedAt:new Date().toISOString(),status:"first_paid"};
    const res=await db.setJSON("orders/"+orderId,update,{onlyIfMatch:order.etag});
    if(res?.modified===false)throw Error("Concorrência na atualização do pedido; repetir evento");
    verified=true;
   }
  }
 }
 if(positive&&ID.test(orderId)&&/^pay_/.test(paymentId)&&!verified)return json({error:"Aguardando conciliação da cobrança"},503);
 const saved=await db.setJSON("events/"+eventId,{event:data.event,orderId:ID.test(orderId)?orderId:null,paymentId:paymentId.slice(0,70),at:new Date().toISOString(),verified},{onlyIfNew:true});
 if(saved?.modified===false)return json({ok:true});
 return json({ok:true});
}
export default async function handler(request){
 const url=new URL(request.url),op=url.searchParams.get("op")||"read";
 try{
  if(op==="webhook"&&request.method==="POST")return await webhook(request);
  if(!["GET","POST"].includes(request.method))return json({error:"Método inválido"},405);
  let payload=op==="pay"&&request.method==="POST"?await input(request):{id:url.searchParams.get("id"),token:url.searchParams.get("token")};
  const order=await authorized(payload.id,payload.token);
  if(!order)return json({error:"Pedido não encontrado ou acesso inválido"},404);
  if(op==="read"&&request.method==="GET")return json(publicState(order));
  if(op==="pay"&&request.method==="POST"){
   if(request.headers.get("origin")!==url.origin)return json({error:"Origem não autorizada"},403);
   return await pay(order,String(payload.mode||""));
  }
  return json({error:"Operação inválida"},404);
 }catch(e){console.error("NEXA/Asaas:",e.message);return json({error:"Falha temporária; a equipe deve conferir o pedido."},500)}
}
export const config={path:"/.netlify/functions/nexa-asaas"};
