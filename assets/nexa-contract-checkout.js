'use strict';
/* Etapas: cadastro -> minuta (não assinada) -> encaminhamento -> pagamento Asaas. */
(()=>{
 const host=document.querySelector('[data-nexa-contract-checkout]');
 if(!host)return;
 const form=host.querySelector('[data-intake-form]');
 const steps={dados:host.querySelector('[data-intake-dados]'),contrato:host.querySelector('[data-intake-contrato]'),pagamento:host.querySelector('[data-intake-pagamento]')};
 const status=host.querySelector('[data-intake-status]');
 const remote=host.querySelector('[data-intake-remote-status]');
 const download=host.querySelector('[data-intake-download]');
 const submit=host.querySelector('[data-intake-send]');
 const manual=host.querySelector('[data-intake-manual]');
 const proof=host.querySelector('[data-intake-proof]');
 const plan=host.dataset.plan;
 const phone='5513997815375';
 const hasPaymentLink=/^#pagar=[0-9a-f]{32}\.[0-9a-f]{64}$/i.test(location.hash);
 const validCPF=value=>{
  const s=String(value).replace(/\D/g,'');
  if(s.length!==11||/^(\d)\1{10}$/.test(s))return false;
  for(let n=9;n<=10;n++){let sum=0;for(let i=0;i<n;i++)sum+=Number(s[i])*(n+1-i);if((sum*10)%11%10!==Number(s[n]))return false;}
  return true;
 };
 const whats=text=>'https://wa.me/'+phone+'?text='+encodeURIComponent(text);
 const textValue=(data,k)=>String(data.get(k)||'').trim();
 const labels={barco:'BARCO',iate:'IATE',submarino:'SUBMARINO'};
 const pricing={barco:['R$ 1.490,00','12 parcelas mensais de R$ 139,07, total R$ 1.668,84'],
  iate:['R$ 2.490,00','12 parcelas mensais de R$ 232,40, total R$ 2.788,80'],
  submarino:['Somente conforme proposta individual aprovada','Parcelamento somente conforme proposta individual']};
 const scopes={
  barco:'Briefing, website One Page responsivo de ate cinco secoes, kit inicial de ate seis artes com legendas, orientacao para Google e entrega digital organizada. Sem gestao mensal continua.',
  iate:'Implantacao BARCO, planejamento editorial, ate quatro posts estaticos mensais com legendas, agendamento e publicacao em ate dois perfis, conforme escopo e aprovacoes.',
  submarino:'Projeto personalizado. Escopo, preco, prazos e entregaveis dependem de proposta individual escrita e aprovada.'
 };
 let draft=null,config={enabled:false,sitekey:null},captchaToken='';
 const show=step=>{for(const [name,node] of Object.entries(steps))node.hidden=name!==step;const paymentStage=host.closest('[data-nexa-checkout]').querySelector('[data-intake-payment-options]');if(paymentStage)paymentStage.hidden=step!=='pagamento';host.querySelectorAll('[data-intake-indicator]').forEach(el=>el.setAttribute('aria-current',el.dataset.intakeIndicator===step?'step':'false'));};
 const date=()=>new Date().toLocaleDateString('pt-BR');
 const ascii=str=>String(str).normalize('NFC').replace(/[–—]/g,'-').replace(/[“”]/g,'"');
 function pdfEscape(value){
  let out='';
  for(const ch of ascii(value)){
   let n=ch.charCodeAt(0);
   if(n>255)n=63;if(n<32)n=32;
   if(n===40||n===41||n===92)out+='\\'+String.fromCharCode(n);
   else if(n>126)out+='\\'+n.toString(8).padStart(3,'0');
   else out+=String.fromCharCode(n);
  }
  return out;
 }
 function wrap(str,width=88){
  const parts=ascii(str).split(/\s+/).filter(Boolean),out=[];let line='';
  for(const word of parts){
   if(line&&(line+' '+word).length>width){out.push(line);line=word;}
   else line+=(line?' ':'')+word;
  }if(line)out.push(line);return out.length?out:[''];
 }
 function makePdf(data){
  const items=[
   'DOCUMENTO PREPARATORIO - MINUTA PARA CONFERENCIA - NAO ASSINADO',
   'NEXA BLUE | PLANO '+labels[plan]+' | '+date(),
   '',
   '1. PARTES',
   'PRESTADORA: NEXA BLUE, razao social, CNPJ e representante a preencher e validar pela equipe antes da assinatura.',
   'CONTRATANTE: '+data.name+' | RG: '+data.rg+' | CPF: '+data.cpf,
   'E-mail: '+data.email+' | WhatsApp: '+data.phone,
   'Endereco: '+data.street+', '+data.number+(data.complement?' / '+data.complement:''),
   'Bairro: '+data.neighborhood+' | '+data.city+'/'+data.uf+' | CEP: '+data.cep,
   '',
   '2. OBJETO E ESCOPO DO PLANO',
   scopes[plan],
   'Materiais externos, dominio, hospedagem, anuncios e servicos de terceiros dependem de aprovacao e condicoes contratuais especificas.',
   '',
   '3. INVESTIMENTO E PRAZOS',
   'Pagamento anual a vista: '+pricing[plan][0]+'.',
   'Alternativa de parcelamento: '+pricing[plan][1]+'.',
   'A modalidade final, vencimentos, tarifas aplicaveis e valor de eventual contrato especial dependem de aceite documentado.',
   'Para o SUBMARINO, nenhum valor ou pagamento e definido por esta minuta padrao.',
   '',
   '4. DIRETRIZES PARA EXECUCAO',
   'Inicio do projeto condicionado a contrato definitivo assinado, primeira cobranca confirmada pelo provedor financeiro e recebimento dos materiais e acessos necessarios.',
   'Revisoes, direitos de uso, suporte, rescisoes, vigencia e demais responsabilidades devem seguir o contrato definitivo aprovado pelas partes.',
   'O cliente conserva titularidade de seus perfis e contas; acessos sao concedidos de forma autorizada.',
   '',
   '5. PRIVACIDADE E COMPROVANTES',
   'Os dados de cadastro sao destinados a preparar e administrar a contratacao. A minuta recebida pela agencia permanece sujeita a revisao.',
   'Comprovante ou Pix agendado nao substitui a confirmacao bancária. Pagamento e realizado somente no ambiente oficial do provedor.',
   '',
   '6. CONFERENCIA E ASSINATURAS',
   'Documento criado automaticamente a partir dos dados declarados pelo interessado. Pode conter erros ou omissoes.',
   'NAO CONSTITUI CONTRATO ASSINADO E NAO GERA COBRANCA. Revisao e assinatura eletronica valida serao providenciadas separadamente.',
   '',
   'ASSINATURA DA PRESTADORA: __________________________________',
   'ASSINATURA DO CONTRATANTE: __________________________________',
   'DATA DA ASSINATURA: ____/____/________',
   '',
   'NEXA BLUE - DOCUMENTO PRELIMINAR - '+'*'.repeat(20)
  ];
  const lines=items.flatMap(s=>s?wrap(s):['']);
  const pages=[];for(let i=0;i<lines.length;i+=40)pages.push(lines.slice(i,i+40));
  const objects=[null,null,null];const refs=[];
  for(let p=0;p<pages.length;p++){
   const id=objects.length+1;refs.push(id);
   let ops=['q','0.023 0.09 0.17 rg','0 766 595 76 re f','Q','BT /F2 15 Tf 1 1 1 rg 45 796 Td ('+pdfEscape('NEXA BLUE / MINUTA '+labels[plan])+') Tj ET'];
   let y=730;
   for(const [i,line] of pages[p].entries()){
    const font=i===0?'/F2 9.5':'/F1 9.2';
    ops.push('BT '+font+' Tf 0.08 0.16 0.25 rg 45 '+y+' Td ('+pdfEscape(line)+') Tj ET');y-=16;
   }
   ops.push('BT /F1 8 Tf 0.42 0.52 0.62 rg 45 42 Td ('+pdfEscape('NEXA BLUE - Minuta de conferencia - Pagina '+(p+1)+'/'+pages.length)+') Tj ET');
   const stream=ops.join('\n')+'\n';
   objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 1 0 R /F2 3 0 R >> >> /Contents '+(id+1)+' 0 R >>');
   objects.push('<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream');
  }
  objects[0]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[1]='<< /Type /Pages /Kids ['+refs.map(i=>i+' 0 R').join(' ')+'] /Count '+pages.length+' >>';
  objects[2]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  const root=objects.length+1;objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  let pdf='%PDF-1.4\n%NEXA\n',positions=[0];
  for(let i=0;i<objects.length;i++){positions.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+objects[i]+'\nendobj\n'}
  const xref=pdf.length;pdf+='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n';
  for(let i=1;i<positions.length;i++)pdf+=String(positions[i]).padStart(10,'0')+' 00000 n \n';
  pdf+='trailer\n<< /Size '+(objects.length+1)+' /Root '+root+' 0 R >>\nstartxref\n'+xref+'\n%%EOF';
  return new Uint8Array([...pdf].map(c=>c.charCodeAt(0)&255));
 }
 const downloadFile=()=>{
  if(!draft)return;
  const a=document.createElement('a'),url=URL.createObjectURL(new Blob([draft.bytes],{type:'application/pdf'}));
  a.href=url;a.download='NEXA-MINUTA-'+labels[plan]+'-'+new Date().toISOString().slice(0,10)+'.pdf';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),15000);
 };
 function dataObj(){
  const d=new FormData(form);
  return Object.fromEntries([...d.entries()].filter(([key])=>key!=='consent'));
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const customer=dataObj();
  if(!validCPF(customer.cpf)){status.textContent='Confira o CPF informado.';form.elements.cpf.focus();return}
  if(String(customer.phone).replace(/\D/g,'').length<10){status.textContent='Confira o WhatsApp.';form.elements.phone.focus();return}
  const bytes=makePdf(customer);
  draft={customer,bytes};
  status.textContent='Minuta preparada com seus dados. Confira o PDF antes de enviar à agência.';
  show('contrato');
 });
 download.addEventListener('click',downloadFile);
 manual.href=whats('Olá, NEXA BLUE! Preparei minha minuta do plano '+labels[plan]+'. Vou anexar o documento em PDF para conferência e assinatura.');
 proof.href=whats('Olá, NEXA BLUE! Vou anexar o comprovante do plano '+labels[plan]+'. Por favor, confirmem o recebimento pelo Asaas e a liberação do projeto.');
 host.querySelector('[data-intake-next]').addEventListener('click',()=>show('pagamento'));
 async function initRemote(){
  try{
   const r=await fetch('/.netlify/functions/nexa-intake?op=config',{cache:'no-store'});
   if(!r.ok)throw Error('Não disponível');
   config=await r.json();
   if(!config.enabled){remote.textContent='Envio automático ainda não habilitado. Baixe a minuta e anexe no WhatsApp; a ativação ficará com a equipe.';return}
   const script=document.createElement('script');
   script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
   script.async=true;script.defer=true;
   script.onload=()=>{
    window.turnstile.render(host.querySelector('[data-turnstile]'),{sitekey:config.sitekey,callback:token=>{captchaToken=token;submit.disabled=false;},'expired-callback':()=>{captchaToken='';submit.disabled=true;}});
   };document.head.appendChild(script);
   remote.textContent='Após a verificação, podemos receber uma cópia criptografada da sua minuta no painel interno da NEXA.';
  }catch{remote.textContent='A integração de envio automático aguarda a configuração técnica. Baixe a minuta e encaminhe por WhatsApp.'}
 }
 submit.addEventListener('click',async()=>{
  if(!draft||!captchaToken)return;
  const consent=host.querySelector('[data-intake-consent]');
  if(!consent.checked){remote.textContent='Confirme o consentimento para enviar a minuta e os dados.';return}
  submit.disabled=true;remote.textContent='Enviando cópia protegida para a equipe...';
  try{
   let binary='';for(const b of draft.bytes)binary+=String.fromCharCode(b);
   const response=await fetch('/.netlify/functions/nexa-intake?op=submit',{method:'POST',cache:'no-store',headers:{'content-type':'application/json'},body:JSON.stringify({plan,customer:draft.customer,privacyAccepted:true,turnstileToken:captchaToken,contractPdfBase64:btoa(binary)})});
   const data=await response.json();
   if(!response.ok)throw Error(data.error||'Falha ao receber.');
   remote.textContent='Cópia recebida pela NEXA. Referência: '+data.reference+'. A assinatura definitiva e a cobrança serão confirmadas pela equipe.';
   host.querySelector('[data-intake-saved]').hidden=false;
   show('pagamento');
  }catch(e){remote.textContent=e.message}
  finally{captchaToken='';if(window.turnstile)window.turnstile.reset();submit.disabled=true}
 });
 if(hasPaymentLink)show('pagamento');else show('dados');
 initRemote();
})();