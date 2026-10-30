'use strict';
(()=>{
const endpoint='/.netlify/functions/nexa-crm';
const planningStyles=document.createElement('link');planningStyles.rel='stylesheet';planningStyles.href='/admin/strategy.css';document.head.append(planningStyles);
const $=id=>document.getElementById(id);
const all=['clients','projects','invoices','portfolio','tasks','contracts','expenses','goals','habits'];
const cfg={
 goals:{title:'METAS.',columns:['Meta','Período','Alvo','Realizado'],description:'Metas mensuráveis, revisadas pela equipe.',fields:[['title','Nome da meta','text',true],['category','Área','select',['Comercial','Produção','Financeiro','Relacionamento','Operações']],['period','Período','select',['Diária','Mensal','Anual']],['target','Objetivo numérico','number',true],['current','Resultado atual','number',false],['deadline','Data limite','date',false],['notes','Observações','textarea',false]]},
 habits:{title:'HÁBITOS E ROTINAS.',columns:['Rotina','Frequência','Responsável','Status'],description:'Ações de execução contínua.',fields:[['title','Nome da rotina','text',true],['frequency','Frequência','select',['Diária','Semanal','Mensal','Anual']],['assignee','Responsável','select',['Você','Tiago','Equipe']],['status','Situação','select',['ativa','pausada','concluída']],['notes','Instruções','textarea',false]]},
 clients:{title:'CLIENTES.',columns:['Nome','Empresa','Plano','Status'],description:'Empresas, contatos e relacionamento.',fields:[['name','Responsável','text',true],['company','Empresa','text',false],['email','E-mail','email',false],['phone','Telefone','tel',false],['plan','Plano','select',['ANZOL','BARCO','IATE','SUBMARINO','REDE','MODO SUBMARINO','AVULSO']],['status','Situação','select',['lead','proposta','ativo','inativo']],['onboardingStatus','Etapa de onboarding','select',['novo','contato realizado','briefing recebido','iniciado','concluído']],['notes','Observações','textarea',false]]},
 projects:{title:'PROJETOS.',columns:['Projeto','Cliente','Prazo','Status'],description:'Entregas e produção.',fields:[['clientId','Cliente','client',true],['title','Projeto','text',true],['deadline','Prazo','date',false],['status','Etapa','select',['planejado','em produção','aguardando cliente','concluído','pausado']],['briefingUrl','Briefing HTTPS','url',false],['notes','Observações','textarea',false]]},
 invoices:{title:'MENSALIDADES.',columns:['Cliente','Valor','Vencimento','Status'],description:'Controle de pagamentos.',fields:[['clientId','Cliente','client',true],['amount','Valor R$','number',true],['dueDate','Vencimento','date',true],['paidOn','Pagamento confirmado em','date',false],['method','Forma','select',['Pix','Pix agendado','Boleto','Outro']],['status','Situação','select',['pendente','em verificação','pago','cancelado']],['notes','Observações','textarea',false]]},
 portfolio:{title:'COLEÇÕES DOS CLIENTES.',columns:['Coleção','Cliente','Categoria','Status'],description:'Biblioteca criativa e entregas organizadas por cliente.',fields:[['clientId','Cliente','client',true],['title','Nome da coleção','text',true],['kind','Categoria','select',['Imagens','Vídeos','Website','Documentos','Campanha','Outro']],['status','Etapa','select',['em produção','em revisão','aprovada','entregue']],['url','Link seguro da coleção (HTTPS)','url',false],['coverUrl','URL da capa (HTTPS)','url',false],['notes','Descrição e observações','textarea',false]]},
 tasks:{title:'TAREFAS.',columns:['Atividade','Cliente','Responsável','Prazo','Situação'],description:'Atividades e responsáveis.',fields:[['clientId','Cliente','client',true],['title','Atividade','text',true],['assignee','Responsável','select',['Você','Tiago']],['deadline','Prazo','date',false],['priority','Prioridade','select',['alta','média','baixa']],['status','Situação','select',['pendente','em andamento','aguardando','concluída']],['notes','Detalhes','textarea',false]]},
 contracts:{title:'CONTRATOS.',columns:['Contrato','Cliente','Renovação','Status'],description:'Planos e renovações.',fields:[['clientId','Cliente','client',true],['title','Contrato','text',true],['plan','Plano','select',['ANZOL','BARCO','IATE','SUBMARINO','REDE','MODO SUBMARINO','AVULSO']],['amount','Valor mensal R$','number',false],['startDate','Início','date',false],['renewalDate','Renovação','date',false],['status','Situação','select',['rascunho','em assinatura','vigente','encerrado']],['url','Documento HTTPS','url',false],['notes','Observações','textarea',false]]},
 expenses:{title:'DESPESAS.',columns:['Descrição','Categoria','Valor','Vencimento','Status'],description:'Despesas e compromissos.',fields:[['title','Descrição','text',true],['category','Categoria','select',['Software','Hospedagem','Marketing','Equipe','Impostos','Outros']],['amount','Valor R$','number',true],['dueDate','Vencimento','date',true],['paidOn','Pago em','date',false],['status','Situação','select',['pendente','pago','cancelado']],['notes','Observações','textarea',false]]}
};
const state={tab:'dashboard',items:{clients:[],projects:[],invoices:[],portfolio:[],tasks:[],contracts:[],expenses:[],goals:[],habits:[]},edit:null};
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
 const summary=[['CLIENTES',rows.clients.length],['PROJETOS',rows.projects.length],['TAREFAS ABERTAS',rows.tasks.filter(x=>x.status!=='concluída').length],['A RECEBER', 'R$ '+money(open.reduce((sum,x)=>sum+Number(x.amount||0),0))],['DESPESAS ABERTAS','R$ '+money(rows.expenses.filter(x=>x.status!=='pago'&&!x.paidOn&&x.status!=='cancelado').reduce((sum,x)=>sum+Number(x.amount||0),0))],['EM ATRASO',open.filter(x=>days(x.dueDate)>0).length]];
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
 goals:r=>[r.title,r.period||'—',r.target||'—',r.current||'0'],
 habits:r=>[r.title,r.frequency||'—',r.assignee||'—',r.status||'ativa'],
 tasks:r=>[r.title,owner(r.clientId),r.assignee||'—',r.deadline||'—',r.status||'—'],
 contracts:r=>[r.title,owner(r.clientId),r.renewalDate||'—',r.status||'—'],
 expenses:r=>[r.title,r.category||'—','R$ '+money(r.amount),r.dueDate||'—',r.paidOn?'pago':r.status||'pendente'],
 clients:r=>[r.name,r.company||'—',r.plan||'—',r.status||'—'],
 projects:r=>[r.title,owner(r.clientId),r.deadline||'—',r.status||'—'],
 invoices:r=>[owner(r.clientId),'R$ '+money(r.amount),r.dueDate||'—',r.paidOn?'Pago':r.status||'pendente'],
 portfolio:r=>[r.title,owner(r.clientId),r.kind||'—',r.url?'Link cadastrado':'—']
};
let collectionSearch='',collectionCategory='todos';
function renderCollections(){
 const section=$('collections-panel'),grid=$('collection-grid'),table=$('record-table');
 section.hidden=false;table.hidden=true;$('empty-records').hidden=true;
 const kinds=['todos',...new Set(state.items.portfolio.map(i=>i.kind||'Outro'))];
 const filter=$('collection-kind');
 const current=collectionCategory;
 filter.replaceChildren(...kinds.map(k=>new Option(k==='todos'?'Todas as categorias':k,k)));
 filter.value=kinds.includes(current)?current:'todos';collectionCategory=filter.value;
 const items=state.items.portfolio.filter(i=>(collectionCategory==='todos'||(i.kind||'Outro')===collectionCategory)&&[i.title,owner(i.clientId),i.notes].join(' ').toLocaleLowerCase('pt-BR').includes(collectionSearch.toLocaleLowerCase('pt-BR')));
 $('collection-count').textContent=items.length+' coleção(ões)';
 grid.replaceChildren();
 if(!items.length){grid.append(make('p','Nenhuma coleção encontrada. Crie uma coleção ou ajuste os filtros.','empty'));return;}
 for(const item of items){
  const card=make('article',null,'collection-card');
  const cover=make('div',null,'collection-cover');
  const safeUrl=(value)=>{try{let u=new URL(value);return u.protocol==='https:'?u.href:null}catch{return null}};
  const pic=safeUrl(item.coverUrl);
  if(pic){const img=make('img');img.src=pic;img.alt='Capa da coleção '+item.title;img.loading='lazy';img.referrerPolicy='no-referrer';img.onerror=()=>{img.remove();cover.append(make('span','N /','collection-placeholder'))};cover.append(img);}
  else cover.append(make('span','N /','collection-placeholder'));
  cover.append(make('span',item.kind||'Coleção','collection-kind-tag'));
  const content=make('div',null,'collection-content');
  content.append(make('span',owner(item.clientId),'collection-owner'),make('h3',item.title),make('p',item.notes||'Coleção criativa organizada para este cliente.'));
  content.append(make('span',item.status||'em produção','collection-status'));
  const actions=make('div',null,'collection-actions');
  const link=safeUrl(item.url);
  if(link){const a=make('a','ABRIR COLEÇÃO ↗','row-button');a.href=link;a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}
  const edit=make('button','EDITAR','row-button');edit.type='button';edit.addEventListener('click',()=>openEditor(item));actions.append(edit);
  const del=make('button','EXCLUIR','row-button');del.type='button';del.addEventListener('click',()=>removeRecord(item));actions.append(del);
  content.append(actions);card.append(cover,content);grid.append(card);
 }
}

const onboardingStages=['novo','contato realizado','briefing recebido','iniciado','concluído'];
function renderOnboarding(){
 const panel=$('onboarding-panel');panel.hidden=state.tab!=='clients';
 if(panel.hidden)return;
 const list=$('onboarding-list');list.replaceChildren();
 const clients=[...state.items.clients].sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 $('onboarding-count').textContent=clients.length+' cliente(s)';
 if(!clients.length){list.append(make('p','Cadastre um cliente para iniciar automaticamente sua linha do tempo de 24 a 48 horas.','empty'));return;}
 for(const client of clients){
  const start=new Date(client.createdAt),valid=Number.isFinite(start.getTime());
  const elapsed=valid?Math.max(0,(Date.now()-start.getTime())/3600000):null;
  const stage=onboardingStages.includes(client.onboardingStatus)?client.onboardingStatus:'novo';
  const done=stage==='concluído';
  const status=done?'Concluído':elapsed===null?'Cadastro antigo':elapsed>48?'Prazo ultrapassado':elapsed>=24?'Atenção · 24–48h':'Dentro das primeiras 24h';
  const box=make('article',null,'onboard-card');
  const top=make('div',null,'onboard-row');
  const details=make('div');details.append(make('h4',client.company||client.name),make('small',valid?'Início: '+start.toLocaleString('pt-BR'):'Cadastro sem data de início'));
  const flag=make('span',status,'onboard-flag'+(!done&&elapsed!==null&&elapsed>48?' overdue':''));
  top.append(details,flag);
  const track=make('div',null,'onboard-track');
  const ticks=[{hour:0,label:'Cadastro'},{hour:24,label:'Contato + briefing'},{hour:48,label:'Início planejado'}];
  for(const tick of ticks){
   const step=make('div',null,'onboard-step'+(elapsed!==null&&elapsed>=tick.hour?' reached':''));
   step.append(make('strong',tick.hour+'h'),make('span',tick.label));track.append(step);
  }
  const bottom=make('div',null,'onboard-bottom');
  const progress=make('span','Etapa atual: '+stage,'onboard-progress');
  const btn=make('button','ACOMPANHAR ↗','row-button');btn.type='button';btn.addEventListener('click',()=>openEditor(client));
  bottom.append(progress,btn);box.append(top,track,bottom);list.append(box);
 }
}

function renderTable(){
 const config=cfg[state.tab];
 $('work-title').textContent=config.title;$('work-description').textContent=config.description;
 $('collections-panel').hidden=state.tab!=='portfolio';
 $('record-table').hidden=state.tab==='portfolio';
 if(state.tab==='portfolio'){renderCollections();return;}
 renderOnboarding();
 const head=$('record-head'),body=$('record-body');head.replaceChildren();body.replaceChildren();
 const tr=make('tr');for(const label of config.columns.concat('AÇÕES'))tr.append(make('th',label));head.append(tr);
 for(const item of state.items[state.tab]){
  const row=make('tr');for(const val of cells[state.tab](item))row.append(make('td',val));
  const actions=make('td');const edit=make('button','EDITAR','row-button');edit.type='button';edit.addEventListener('click',()=>openEditor(item));actions.append(edit);
  if(state.tab!=='clients'){const del=make('button','EXCLUIR','row-button');del.type='button';del.addEventListener('click',()=>removeRecord(item));actions.append(del);}
  row.append(actions);body.append(row);
 }
 $('empty-records').hidden=state.items[state.tab].length>0;
}


const sitePlans=[['ANZOL','/planos/anzol/'],['BARCO','/planos/barco/'],['IATE','/planos/iate/'],['SUBMARINO','/planos/submarino/'],['REDE','/planos/rede/'],['MODO SUBMARINO','/planos/modo-submarino/']];
const siteServices=['Sites e One Pages','Aplicativos e Sistemas','Perfil da Empresa no Google','Gestão de Redes Sociais','Branding e Estratégia Digital'];
function renderCatalog(){
 const plans=$('catalog-plans'),services=$('catalog-services');
 plans.replaceChildren();services.replaceChildren();
 for(const [name,path] of sitePlans){const item=make('a',name+' ↗','catalog-item');item.href=path;item.target='_blank';item.rel='noopener noreferrer';plans.append(item);}
 for(const name of siteServices){services.append(make('div',name,'catalog-item'));}
}

function renderStrategy(){
 for(const [type,id] of [['goals','strategy-goals'],['habits','strategy-habits']]){
  const root=$(id);root.replaceChildren();
  const entries=state.items[type];
  if(!entries.length){root.append(make('p',type==='goals'?'Cadastre sua primeira meta com um objetivo realista.':'Cadastre a primeira rotina da equipe.','overview-empty'));continue;}
  for(const item of entries){
   const row=make('article',null,'strategy-record');const info=make('div');
   info.append(make('strong',item.title),make('small',type==='goals'?[(item.period||'Sem período'),(item.current||'0')+' / '+(item.target||'0'),item.category].filter(Boolean).join(' · '):[item.frequency,item.assignee,item.status].filter(Boolean).join(' · ')));
   const action=make('button','EDITAR','row-button');action.type='button';action.addEventListener('click',()=>{showTab(type);openEditor(item);});row.append(info,action);root.append(row);
  }
 }
}
let selectedClientId=null;
function showTab(tab){
 state.tab=tab;closeEditor();
 $('overview-panel').hidden=tab!=='dashboard';$('catalog-panel').hidden=tab!=='catalog';$('strategy-panel').hidden=tab!=='strategy';document.querySelector('.workspace').hidden=['dashboard','catalog','strategy'].includes(tab);
 for(const b of $('crm-tabs').querySelectorAll('[data-tab]'))b.classList.toggle('active',b.dataset.tab===tab);
 if(tab==='dashboard')renderOverview();else if(tab==='catalog')renderCatalog();else if(tab==='strategy')renderStrategy();else renderTable();
}
function renderOverview(){
 const query=$('service-client-search').value.trim().toLocaleLowerCase('pt-BR');
 const results=$('service-results');results.replaceChildren();
 const clients=state.items.clients.filter(x=>[x.company,x.name,x.email,x.phone].join(' ').toLocaleLowerCase('pt-BR').includes(query)).slice(0,8);
 if(!clients.length){results.append(make('p',query?'Nenhum cliente localizado.':'Nenhum cliente cadastrado.','overview-empty'));}
 for(const x of clients){
  const button=make('button',(x.company||x.name)+' · '+x.name,'service-client');button.type='button';
  button.addEventListener('click',()=>{selectedClientId=x.id;renderOverview();});results.append(button);
 }
 const file=$('service-file'),client=state.items.clients.find(x=>x.id===selectedClientId);
 file.hidden=!client;file.replaceChildren();
 if(client){
  const head=make('div',null,'service-file-head');const left=make('div');
  left.append(make('span','FICHA DO CLIENTE / ATENDIMENTO','eyebrow'),make('h3',client.company||client.name),make('p',[client.name,client.phone,client.email].filter(Boolean).join(' · ')));
  const edit=make('button','EDITAR CLIENTE','row-button');edit.type='button';edit.addEventListener('click',()=>{showTab('clients');openEditor(client);});
  head.append(left,edit);file.append(head);
  const wrap=make('div',null,'service-sections');
  for(const [type,label,detail] of [['projects','PROJETOS',x=>(x.title||'Projeto')+' · '+(x.status||'sem status')],['portfolio','COLEÇÕES',x=>(x.title||'Coleção')+' · '+(x.status||'em produção')],['invoices','MENSALIDADES',x=>'R$ '+money(x.amount)+' · '+(x.dueDate||'sem vencimento')+' · '+(x.paidOn?'pago':x.status||'pendente')],['contracts','CONTRATOS',x=>x.title||'Contrato'],['tasks','TAREFAS',x=>x.title||'Tarefa']]){
   const section=make('div',null,'service-section');section.append(make('h4',label));
   const records=state.items[type].filter(x=>x.clientId===client.id).slice(0,5);
   if(!records.length)section.append(make('p','Nenhum registro.','overview-empty'));
   for(const record of records)section.append(make('p',detail(record),'service-detail'));
   const add=make('button','+ ADICIONAR','overview-link');add.type='button';add.addEventListener('click',()=>{showTab(type);openEditor(null);const select=$('editor-fields').querySelector('[name="clientId"]');if(select)select.value=client.id;});section.append(add);wrap.append(section);
  }file.append(wrap);
 }
 const entries=[
  ['overview-onboarding',state.items.clients.slice(0,3),x=>(x.company||x.name)+' · '+(x.onboardingStatus||'novo')],
  ['overview-projects',state.items.projects.filter(x=>x.status!=='concluído').slice(0,3),x=>x.title+' · '+owner(x.clientId)],
  ['overview-finance',state.items.invoices.filter(unpaid).sort((a,b)=>String(a.dueDate).localeCompare(String(b.dueDate))).slice(0,3),x=>owner(x.clientId)+' · '+x.dueDate]
 ];
 for(const [id,items,label] of entries){
  const target=$(id);target.replaceChildren();if(!items.length)target.append(make('p','Nada pendente por aqui.','overview-empty'));
  for(const item of items)target.append(make('p',label(item),'overview-entry'));
 }
}

function render(){renderStats();renderAlerts();showTab(state.tab);}
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
$('crm-tabs').addEventListener('click',e=>{const button=e.target.closest('[data-tab]');if(button)showTab(button.dataset.tab);});
$('overview-panel').addEventListener('click',e=>{const button=e.target.closest('[data-go]');if(!button)return;showTab(button.dataset.go);if(button.textContent.includes('NOVO CLIENTE'))openEditor(null);});
$('service-client-search').addEventListener('input',renderOverview);
$('strategy-panel').addEventListener('click',e=>{const b=e.target.closest('[data-strategy-tab]');if(!b)return;showTab(b.dataset.strategyTab);openEditor(null);});
$('add-record').addEventListener('click',()=>openEditor(null));
$('close-editor').addEventListener('click',closeEditor);
$('cancel-editor').addEventListener('click',closeEditor);
$('record-form').addEventListener('submit',async event=>{
 event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;
 const data=Object.fromEntries(new FormData(form).entries());
 if(['invoices','expenses','contracts'].includes(state.tab)&&data.amount)data.amount=Number(data.amount).toFixed(2);
 try{
  await api('save',{method:'POST',body:{type:state.tab,id:state.edit&&state.edit.id,data}});
  closeEditor();await load();
 }catch(e){feedback('editor-message',e.message);}
});
$('collection-search').addEventListener('input',e=>{collectionSearch=e.target.value;renderCollections();});
$('collection-kind').addEventListener('change',e=>{collectionCategory=e.target.value;renderCollections();});
$('year').textContent=new Date().getFullYear();
api('session').then(showApp).catch(e=>{
 $('login-view').hidden=false;$('crm-view').hidden=true;
 if(!/sessão|autorizado|expirada/i.test(e.message))feedback('login-message',e.message);
});
})()