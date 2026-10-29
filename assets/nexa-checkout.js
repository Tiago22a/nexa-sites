'use strict';
/* Contratação NEXA — dados processados no browser, sem envio automático. */
(() => {
  const phone='5513997815375';
  const nameDate=()=>new Date().toISOString().slice(0,10);
  const cleanse=(s)=>String(s==null?'':s).replace(/[\u0000-\u001f]+/g,' ').trim();
  // WinAnsi octal escapes keep the PDF valid without external CDN dependencies.
  function pdfText(s){
    let out='';
    for(const ch of String(s).normalize('NFC')){
      let code=ch.charCodeAt(0);
      if(ch==='×')code=120;
      else if(ch==='–'||ch==='—')code=45;
      else if(ch==='“'||ch==='”')code=34;
      else if(ch==='‘'||ch==='’')code=39;
      else if(code>255)code=63;
      if(code===40||code===41||code===92)out+='\\'+String.fromCharCode(code);
      else if(code<32)out+=' ';
      else if(code>126)out+='\\'+code.toString(8).padStart(3,'0');
      else out+=String.fromCharCode(code);
    }
    return out;
  }
  function wrap(text,max){
    const parts=String(text).split(/\s+/).filter(Boolean),lines=[];
    let line='';
    for(const word of parts){
      if(line && (line+' '+word).length>max){lines.push(line);line=word;}
      else line+=(line?' ':'')+word;
    }
    if(line)lines.push(line);
    return lines;
  }
  function generatePdf(info){
    const docTitle=info.plan==='SUBMARINO'?'FICHA DE PRE-PROPOSTA':'MINUTA DE CONTRATACAO PARA CONFERENCIA';
    const today=new Date().toLocaleDateString('pt-BR');
    const lines=[
      'Documento de apoio - nao assinado e sem efeito de comprovante de pagamento.',
      '',
      'DADOS DO INTERESSADO',
      'Nome ou razao social: '+info.cliente,
      'E-mail: '+info.email,
      'CPF/CNPJ (informado pelo interessado): '+(info.documento||'Nao informado'),
      'Telefone: '+(info.telefone||'Nao informado'),
      'Data de geracao: '+today,
      '',
      'PLANO E CONDICOES ESCOLHIDAS',
      'Modalidade: '+info.plan,
      'Preferencia: '+({pix:'Pix integral',pix_scheduled:'Pix agendado mensal (12 parcelas)',boleto:'Carne de 12 boletos, sujeito a emissao pelo provedor financeiro'}[info.mode]||'A definir'),
      'Valor anual a vista: '+info.cash,
      'Parcelamento: '+info.monthly,
      'Total parcelado: '+info.total,
      'Vigencia: '+(info.plan==='SUBMARINO'?'A definir em proposta e contrato':'12 meses, apos assinatura do contrato definitivo'),
      '',
      'ESCOPO PRELIMINAR',
      info.scope,
      '',
      'CONDICOES DE CONTRATACAO',
      '1. Esta minuta registra interesse e preferencia de pagamento; nao e contrato definitivo nem titulo de cobranca.',
      '2. A prestadora devera informar sua razao social, CNPJ e dados oficiais, e emitir contrato completo para assinatura eletronica.',
      '3. A contratacao depende de aceite expresso, assinatura pelas partes, confirmacao de pagamento e disponibilizacao dos materiais necessarios.',
      '4. Em caso de Pix integral, a chave e o nome do beneficiario devem ser obtidos e confirmados diretamente com a equipe NEXA BLUE.',
      '4.1. Para Pix agendado, comprovantes de agendamento nao representam pagamentos executados; confirme cada credito na data prevista.',
      '4.2. Os 12 boletos precisam ser emitidos por provedor financeiro habilitado e seus dados verificados antes de pagar.',
      '5. Em caso de parcelas mensais, a primeira e prevista na assinatura, e as demais vencem nos prazos escritos no contrato.',
      '6. O inicio de execucao ocorre apos as validacoes. A meta de 48 horas uteis aplica-se apenas aos materiais iniciais elegiveis; as demais entregas seguem cronograma aprovado.',
      '7. Escopo, revisoes, suporte, reajustes, direitos de uso, cancelamento, deveres e tratamento de dados devem constar do documento definitivo.',
      '',
      'PROXIMOS PASSOS',
      'Enviar a minuta ao WhatsApp oficial, solicitar dados de pagamento, conferir a proposta, assinar eletronicamente e anexar comprovante manualmente.',
      '',
      'STATUS: MINUTA PARA CONFERENCIA. AGUARDANDO VALIDACAO E ASSINATURA.',
      'Canal oficial: +55 13 99781-5375'
    ];
    const pages=[],pageLines=[];let current=[];
    for(const entry of lines){
      const wrapped=entry?wrap(entry,96):[''];
      for(const line of wrapped){
        if(current.length>=40){pages.push(current);current=[];}
        current.push(line);
      }
    }
    if(current.length)pages.push(current);
    const objs=[null,null,null];
    const pageRefs=[];
    for(let i=0;i<pages.length;i++){
      const pageId=objs.length+1,contentId=pageId+1;
      pageRefs.push(pageId);
      const ops=['q','0.023 0.09 0.17 rg','0 764 595 78 re f','Q','BT','/F2 16 Tf','1 1 1 rg','55 797 Td','('+pdfText('NEXA BLUE  /  '+docTitle)+') Tj','ET'];
      let y=732;
      for(const line of pages[i]){
        ops.push('BT /F1 9.4 Tf 0.08 0.16 0.25 rg 55 '+y+' Td ('+pdfText(line)+') Tj ET');
        y-=16;
      }
      ops.push('BT /F1 8.5 Tf 0.42 0.52 0.62 rg 55 42 Td ('+pdfText('NEXA BLUE / Pagina '+(i+1)+' de '+pages.length+' / '+today)+') Tj ET');
      const stream=ops.join('\n')+'\n';
      objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 1 0 R /F2 3 0 R >> >> /Contents '+contentId+' 0 R >>');
      objs.push('<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream');
    }
    objs[0]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objs[1]='<< /Type /Pages /Kids ['+pageRefs.map(x=>x+' 0 R').join(' ')+'] /Count '+pages.length+' >>';
    objs[2]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    // Root catalog is appended after page objects.
    const rootId=objs.length+1;objs.push('<< /Type /Catalog /Pages 2 0 R >>');
    let pdf='%PDF-1.4\n%NEXA\n',offsets=[0];
    for(let i=0;i<objs.length;i++){offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+objs[i]+'\nendobj\n';}
    const xrefOffset=pdf.length;
    pdf+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n';
    for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+='trailer\n<< /Size '+(objs.length+1)+' /Root '+rootId+' 0 R >>\nstartxref\n'+xrefOffset+'\n%%EOF';
    const b=new Uint8Array(pdf.length);for(let i=0;i<pdf.length;i++)b[i]=pdf.charCodeAt(i)&255;
    return new Blob([b],{type:'application/pdf'});
  }
  for(const dock of document.querySelectorAll('[data-nexa-checkout]')){
    const form=dock.querySelector('.nx-client-form'),status=dock.querySelector('.nx-dock-status'),link=dock.querySelector('[data-whatsapp]');
    const copy=dock.querySelector('[data-copy-summary]');
    const d=dock.dataset;
    const selection=()=>dock.querySelector('input[type="radio"]:checked')?.value||'pix';
    const summary=()=>{
      const chosen=selection();
      const condition=chosen==='pix'?'Pix integral '+d.cash:chosen==='pix_scheduled'?'12 Pix mensais programados, '+d.monthly+' (total '+d.total+')':'Carne de 12 boletos, '+d.monthly+' (total '+d.total+') - emissao mediante provedor financeiro';
      return 'Plano '+d.planLabel+' | '+condition+' | Chave Pix: solicitar a NEXA BLUE e conferir beneficiario. Proposta e contrato sujeitos a assinatura. Pagamento nao realizado pelo site.';
    };
    const updateLink=()=>{
      const chosen=selection(),mode=chosen==='pix'?'Pix integral':chosen==='pix_scheduled'?'Pix mensal agendado em 12 parcelas':'Carne com 12 boletos bancarios';
      const text='Ola, NEXA BLUE! Estive na pagina do plano '+d.planLabel+' e escolhi '+mode+'. Gostaria de receber os dados oficiais de pagamento, a proposta final e as instrucoes para assinatura eletronica. Sei que comprovante de agendamento nao comprova pagamento, e que os boletos dependem de emissao pela plataforma financeira. Enviarei a minuta e o comprovante da primeira parcela efetivamente paga como anexos no WhatsApp. Plano: '+location.href.split('#')[0];
      link.href='https://wa.me/'+phone+'?text='+encodeURIComponent(text);
    };
    dock.querySelectorAll('input[type="radio"]').forEach(r=>r.addEventListener('change',updateLink));
    updateLink();
    copy.addEventListener('click',async()=>{
      const message=summary();
      try{if(!navigator.clipboard)throw Error('clipboard unsupported');await navigator.clipboard.writeText(message);status.textContent='Resumo copiado. Solicite a chave Pix ou os boletos oficiais antes de pagar.';}
      catch{status.textContent='Seu navegador nao permitiu copiar. Use o WhatsApp para obter os dados oficiais.';}
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const data=new FormData(form);
      const info={plan:d.planLabel,cliente:cleanse(data.get('cliente')),email:cleanse(data.get('email')),documento:cleanse(data.get('documento')),telefone:cleanse(data.get('telefone')),mode:selection(),cash:d.cash,monthly:d.monthly,total:d.total,scope:d.scope};
      const blob=generatePdf(info);
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='NEXA-'+(d.planLabel==='SUBMARINO'?'PRE-PROPOSTA-':'MINUTA-')+d.planLabel+'-'+nameDate()+'.pdf';
      document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
      status.textContent='PDF gerado e baixado. Confira a minuta e abra o WhatsApp para combinar a assinatura e o pagamento. O envio de anexos e manual.';
    });
  }
})();
