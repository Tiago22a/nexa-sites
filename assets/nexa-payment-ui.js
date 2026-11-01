'use strict';
(()=>{
 const host=document.querySelector('[data-nexa-checkout]');if(!host)return;
 const base='/.netlify/functions/nexa-asaas',plan=host.dataset.plan,notice=host.querySelector('[data-payment-status]'),link=host.querySelector('[data-open-invoice]'),receipt=host.querySelector('[data-receipt]'),buttons=[...host.querySelectorAll('[data-payment-mode]')],phone='5513997815375';
 const match=location.hash.match(/^#pagar=([0-9a-f]{32})\.([0-9a-f]{64})$/i);
 let order=null;
 const wa=text=>'https://wa.me/'+phone+'?text='+encodeURIComponent(text);
 const price=n=>Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const say=text=>notice.textContent=text;
 async function api(op,body){
  const url=new URL(base,location.origin),method=op==='read'?'GET':'POST';
  url.searchParams.set('op',op);
  if(method==='GET'){url.searchParams.set('id',body.id);url.searchParams.set('token',body.token)}
  const res=await fetch(url,{method,cache:'no-store',headers:{'content-type':'application/json'},body:method==='POST'?JSON.stringify(body):undefined});
  const data=await res.json().catch(()=>({}));if(!res.ok)throw Error(data.error||'Falha de comunicação.');return data;
 }
 receipt.href=wa('Olá, NEXA BLUE! Vou compartilhar o comprovante do plano '+plan.toUpperCase()+' e gostaria de confirmar a compensação e o início do projeto.');
 (async()=>{
  if(!match){say('Já assinou o contrato? Solicite à NEXA seu link privado; os botões abaixo pedem o link à equipe.');return}
  const id=match[1],token=match[2];
  try{
   const record=await api('read',{id,token});
   if(record.plan.toLowerCase()!==plan)throw Error('Este link pertence a outro plano.');
   order={id,token};
   host.querySelector('[data-price-cash]').textContent=price(record.cash);
   host.querySelector('[data-price-card]').textContent=price(record.cash);
   host.querySelector('[data-price-boleto]').textContent=record.count>1?record.count+'× '+price(record.monthly):price(record.cash);
   if(record.invoiceUrl){link.href=record.invoiceUrl;link.hidden=false;say(record.firstPaymentConfirmed?'Primeiro pagamento confirmado pelo Asaas. A NEXA verificará os próximos passos.':'Cobrança emitida: acesse sua fatura oficial para pagar.');}
   else say('Contrato identificado. Escolha uma forma de pagamento.');
  }catch(e){say(e.message+' Solicite outro link.');}
  document.getElementById('formas-de-pagamento')?.scrollIntoView({behavior:'smooth',block:'start'});
 })();
 for(const button of buttons)button.addEventListener('click',async()=>{
  const mode=button.dataset.paymentMode;
  if(!order){location.href=wa('Olá, NEXA BLUE! Já tenho contrato do plano '+plan.toUpperCase()+' e preciso do link para pagar por '+({pix:'Pix',credit_card:'cartão',boleto:'boleto'}[mode])+'.');return}
  buttons.forEach(b=>b.disabled=true);say('Conectando ao Asaas. Aguarde.');
  try{
   const response=await api('pay',{...order,mode});
   link.href=response.invoiceUrl;link.hidden=false;
   say('Cobrança emitida. Abrindo ambiente seguro do Asaas.');location.assign(response.invoiceUrl);
  }catch(e){say(e.message)}
  finally{buttons.forEach(b=>b.disabled=false)}
 });
})();