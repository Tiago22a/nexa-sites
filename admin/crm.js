'use strict';
(()=>{
const endpoint='/.netlify/functions/nexa-crm';
const $=id=>document.getElementById(id);
const all=['clients','projects','invoices','portfolio'];
const cfg={
 clients:{title:'CLIENTES.',columns:['Nome','Empresa','Plano','Status'],description:'Relacione empresas, oportunidades e clientes ativos.',fields:[
  ['name','Nome do responsável','text',true],['company','Empresa','text',false],['email','E-mail','email',false],['phone','Telefone','tel',false],['plan','Modalidade','select',['BARCO','IATE','SUBMARINO','AVULSO']],['status','Situação','select',['lead','proposta','ativo','inativo']],['notes','Observações','textarea',false]]},
 projects:{title:'PROJETOS.',columns:['Projeto','Cliente','Prazo','Status'],description:'Organize entregas, cronogramas e links de briefing.',fields:[
  ['clientId','Cliente','client',true],['title','Projeto','text',true],['deadline','Prazo de entrega','date',false],['status','Etapa','select',['planejado','em produção','aguardando cliente','concluído','pausado']],['briefingUrl','Link de briefing (https)','url',false],['notes','Observações','textarea',false]]},
 invoices:{title:'MENSALIDADES.',columns:['Cliente','Valor','Vencimento','Status'],description:'Controle manual de parcelas pagas, programadas e pendentes.',fields:[
  ['clientId','Cliente','client',true],['amount','Valor R$ (sem pontos de milhar)','number',true],['dueDate','Vencimento','date',true],['paidOn','Pagamento confirmado em','date',false],['method','Forma','select',['Pix','Pix agendado','Boleto','Outro']],['status','Situação','select',['pendente','em verificação','pago','cancelado']],['notes','Observações','textarea',false]]},
 portfolio:{title:'PORTFÓLIOS.',columns:['Coleção','Cliente','Tipo','Link'],description:'Organize links de coleções e entregas. Arquivos privados devem ficar em armazenamento protegido.',fields:[
  ['clientId','Cliente','client',true],['title','Nome da coleção','text',true],['kind','Tipo de conteúdo','select',['Imagens','Vídeos','Website','Documentos','Campanha','Outro']],['url','Link HTTPS','url',false],['notes','Observações','textarea',false]]}
};
const state={tab:'clients',items:{clients:[],projects:[],invoices:[],portfolio:[]},edit:null};
const make=(tag,text,className)=>{
 const el=document.createElement(tag);
 if(text!==undefined&&text!==null)el.textContent=String(text);
 if(className)el.className=className;
 return el;
};
const feedback=(id,msg)=>{$(id).textContent=msg||'';};
async function api(op,options){
 const opts=options||{};
 const url=new URL(endpoint,location.origin);
 url.searchParams.set('op',op);
 if(opts.type)url.searchParams.set('type',opts.type);
 const res=await fetch(url,{method:opts.method||'GET',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json','x-nexa-admin':'1'},body:opts.method==='POST'?JSON.stringify(opts.body||{}):undefined});
 let json={};try{json=await res.json();}catch{}
 if(!res.ok)throw Error(json.error||'Falha ao comunicar com o servidor.');
 return json;
}
const owner=(id)=>{
 const row=state.items.clients.find(x=>x.id===id);
 return row?(row.company||row.name):'Cliente não encontrado';
};
const money=x=>Number(x||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const todayUTC=()=>{const d=new Date();return Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());};
const days=(s)=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(s||'')))return -99999;
 const t=s.split('-').map(Number);
 return Math.round((todayUTC()-Date.UTC(t[0],t[1]-1,t[2]))/86400000);
};
const unpaid=i=>!i.paidOn&&i.status!=='pago'&&i.status!=='cancelado';
function renderStats(){
 const rows=state.items,open=rows.invoices.filter(unpaid);
 const summary=[['CLIENTES',rows.clients.length],['PROJETOS',rows.projects.length],['MENSALIDADES',rows.invoices.length],['EM ATRASO',open.filter(x=>days(x.dueDate)>0).length],['PRÓXIMOS 7 DIAS',open.filter(x=>days(x.dueDate)>=-7&&days(x.dueDate)<=0).length]];
 $('stats').replaceChildren();
 for(const item of summary){
  const card=make('div',null,'stat');
  card.append(make('strong',item[1]),make('span',item[0]));
  $('stats').append(card);
 }
}
function renderAlerts(){
 const list=$('alerts');list.replaceChildren();
 const due=state.items.invoices.filter(x=>unpaid(x)&&days(x.dueDate)>=-7).sort((a,b)=>days(b.dueDate)-days(a.dueDate));
 if(!due.length){list.append(make('p','Sem parcelas vencidas ou previstas para os próximos 7 dias.','empty'));return;}
 for(const bill of due){
  const age=days(bill.dueDate),wrap=make('article',null,'alert'+(age>3?' late':age>0?' warning':''));
  const info=make('div');info.append(make('strong',owner(bill.clientId)),make('small','R$ '+money(bill.amount)+' · Vencimento: '+bill.dueDate+' · '+(bill.method||'A definir')));
  let badge='VENCE EM '+(-age)+' DIA(S)';
  if(age===0)badge='VENCE HOJE';
  if(age>0&&age<=3)badge='TOLERÂNCIA: '+(3-age)+' DIA(S)';
  if(age>3)badge='REVISAR · APÓS TOLERÂNCIA';
  wrap.append(info,make('span',badge,'alert-label'));list.append(wrap);
 }
}
const cells={
 clients:r=>[r.name,r.company||'—',r.plan||'—',r.status||'—'],
 projects:r=>[r.title,owner(r.clientId),r.deadline||'—',r.status||'—'],
 invoices:r=>[owner(r.clientId),'R$ '+money(r.amount),r.dueDate||'—',r.paidOn?'Pago':r.status||'pendente'],
 portfolio:r=>[r.title,owner(r.clientId),r.kind||'—',r.url?'Link cadastrado':'—']
};
function renderTable(){
 const config=cfg[state.tab];
 $('work-title').textContent=config.title;
 $('work-description').textContent=config.description;
 const head=$('record-head'),body=$('record-body');
 head.replaceChildren();body.replaceChildren();
 const tr=make('tr');
 for(const label of config.columns.concat('AÇÕES'))tr.append(make('th',label));
 head.append(tr);
 for(const item of state.items[state.tab]){
  const row=make('tr');
  for(const val of cells[state.tab](item))row.append(make('td',val));
  const actions=make('td');
  const edit=make('button','EDITAR','row-button');
  edit.type='button';edit.addEventListener('click',()=>openEditor(item));
  actions.append(edit);
  if(state.tab!=='clients'){
   const del=make('button','EXCLUIR','row-button');
   del.type='button';del.addEventListener('click',()=>removeRecord(item));
   actions.append(del);
  }
  row.append(actions);body.append(row);
 }
 $('empty-records').hidden=state.items[state.tab].length>0;
}
function render(){renderStats();renderAlerts();renderTable();}
async function load(){
 for(const type of all)state.items[type]=(await api('list',{type})).items||[];
 render();
}
function makeField(def,record){
 const key=def[0],label=def[1],kind=def[2],rule=def[3];
 const group=make('label');
 group.append(make('span',label));
 let input;
 if(kind==='select'||kind==='client'){
  input=document.createElement('select');
  input.append(new Option('Selecione',''));
  const options=kind==='client'?state.items.clients.map(c=>({label:c.company||c.name,value:c.id})):rule.map(v=>({label:v,value:v}));
  for(const opt of options)input.append(new Option(opt.label,opt.value));
 }else if(kind==='textarea')input=document.createElement('textarea');
 else{input=document.createElement('input');input.type=kind==='number'?'number':kind;input.maxLength=kind==='url'?450:kind==='email'?150:120;if(kind==='number'){input.min='0';input.step='0.01';}}
 input.name=key;input.value=record&&record[key]?record[key]:'';
 input.required=rule===true;
 group.append(input);
 return group;
}
function openEditor(item){
 state.edit=item||null;
 $('editor-title').textContent=item?'EDITAR REGISTRO':'NOVO REGISTRO';
 $('editor-fields').replaceChildren();
 for(const def of cfg[state.tab].fields)$('editor-fields').append(makeField(def,item));
 $('editor').hidden=false;feedback('editor-message','');
 $('editor').scrollIntoView({block:'nearest',behavior:'smooth'});
}
function closeEditor(){state.edit=null;$('editor').hidden=true;$('record-form').reset();}
async function removeRecord(item){
 if(!confirm('Excluir este registro? Esta ação não pode ser desfeita.'))return;
 try{await api('delete',{method:'POST',body:{type:state.tab,id:item.id}});await load();}
 catch(e){alert(e.message);}
}
async function showApp(){
 $('login-view').hidden=true;$('crm-view').hidden=false;feedback('login-message','');
 try{await load();}catch(e){alert('Não foi possível carregar o CRM: '+e.message);}
}
$('login-form').addEventListener('submit',async event=>{
 event.preventDefault();const btn=event.submitter;btn.disabled=true;feedback('login-message','');
 try{
  await api('login',{method:'POST',body:{username:$('login-username').value,password:$('login-password').value}});
  $('login-password').value='';await showApp();
 }catch(e){feedback('login-message',e.message);}finally{btn.disabled=false;}
});
$('logout').addEventListener('click',async()=>{
 try{await api('logout',{method:'POST'});}catch{}
 $('crm-view').hidden=true;$('login-view').hidden=false;all.forEach(t=>state.items[t]=[]);
});
$('crm-tabs').addEventListener('click',event=>{
 const target=event.target.closest('[data-tab]');
 if(!target)return;
 state.tab=target.dataset.tab;closeEditor();
 for(const b of $('crm-tabs').querySelectorAll('[data-tab]'))b.classList.toggle('active',b===target);
 renderTable();
});
$('add-record').addEventListener('click',()=>openEditor(null));
$('close-editor').addEventListener('click',closeEditor);
$('cancel-editor').addEventListener('click',closeEditor);
$('record-form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form).entries());
 if(state.tab==='invoices'&&data.amount)data.amount=Number(data.amount).toFixed(2);
 try{
  await api('save',{method:'POST',body:{type:state.tab,id:state.edit&&state.edit.id,data}});
  closeEditor();await load();
 }catch(e){feedback('editor-message',e.message);}
});
$('year').textContent=new Date().getFullYear();
api('session').then(showApp).catch(e=>{
 $('login-view').hidden=false;$('crm-view').hidden=true;
 if(!/sessão|autorizado|expirada/i.test(e.message))feedback('login-message',e.message);
});
})();