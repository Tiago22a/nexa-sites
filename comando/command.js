'use strict';
(()=>{
const endpoint='/.netlify/functions/nexa-command';
const $=id=>document.getElementById(id);
const modules=['leads','clients','proposals','projects','tasks','deliveries','contracts','receivables','expenses'];
const opts={
 leadStage:['novo','em contato','reunião','proposta','ganho','perdido'],
 proposalStage:['rascunho','enviada','negociação','aprovada','recusada','expirada'],
 projectStatus:['planejado','em produção','aguardando cliente','revisão','concluído','pausado'],
 taskStatus:['pendente','em andamento','aguardando','concluída'],
 deliveryStatus:['planejada','em produção','enviada','aprovada'],
 paymentStatus:['pendente','em verificação','pago','cancelado'],
 contractStatus:['rascunho','em assinatura','vigente','encerrado'],
 assignee:['Você','Tiago'],
 priority:['alta','média','baixa']
};
const f=(key,label,kind='text',required=false,options=null)=>({key,label,kind,required,options});
const config={
 leads:{title:'OPORTUNIDADES',description:'Do primeiro contato ao fechamento. Organize o funil comercial da NEXA.',headers:['Contato / Empresa','Serviço','Etapa','Próximo contato','Responsável'],fields:[
  f('name','Contato', 'text',true),f('company','Empresa / Marca'),f('phone','WhatsApp','tel'),f('email','E-mail','email'),f('source','Origem','select',false,['Site','Instagram','Indicação','WhatsApp','Prospecção','Outro']),f('service','Serviço procurado','select',false,['Website','E-commerce','Redes sociais','Branding','Vídeo','Tráfego pago','Aplicativo','Outro']),f('stage','Etapa comercial','select',false,opts.leadStage),f('nextAction','Próxima ação'),f('nextDate','Data de acompanhamento','date'),f('assignee','Responsável','select',false,opts.assignee),f('estimatedValue','Valor potencial (R$)','number'),f('notes','Observações','textarea')]},
 clients:{title:'CLIENTES',description:'Cadastre empresas, contatos e informações comerciais em uma só base.',headers:['Responsável','Empresa','Segmento','Situação'],fields:[
  f('name','Nome do contato','text',true),f('company','Empresa / Marca'),f('phone','WhatsApp','tel'),f('email','E-mail','email'),f('segment','Segmento'),f('status','Situação','select',false,['prospect','ativo','inativo']),f('notes','Observações','textarea')]},
 proposals:{title:'PROPOSTAS',description:'Acompanhe ofertas enviadas, valores, negociação e aprovação.',headers:['Proposta','Cliente / Oportunidade','Valor','Etapa','Validade'],fields:[
  f('title','Título da proposta','text',true),f('clientId','Cliente cadastrado','clients'),f('leadId','Ou oportunidade','leads'),f('service','Serviço'),f('amount','Valor (R$)','number'),f('stage','Etapa','select',false,opts.proposalStage),f('validUntil','Validade','date'),f('assignee','Responsável','select',false,opts.assignee),f('url','Link HTTPS do orçamento','url'),f('notes','Observações','textarea')]},
 projects:{title:'PROJETOS',description:'Controle execução, escopo, entregas, prazos e responsável.',headers:['Projeto','Cliente','Serviço','Responsável','Prazo','Status'],fields:[
  f('title','Título do projeto','text',true),f('clientId','Cliente','clients',true),f('service','Serviço','select',false,['Site','Loja virtual','Marca','Social media','Tráfego pago','Automação','Aplicativo','Outro']),f('brand','Marca atendida'),f('assignee','Responsável','select',false,opts.assignee),f('deadline','Data de entrega','date'),f('priority','Prioridade','select',false,opts.priority),f('status','Etapa','select',false,opts.projectStatus),f('briefingUrl','Link HTTPS do briefing','url'),f('notes','Notas do projeto','textarea')]},
 tasks:{title:'TAREFAS',description:'Divida a execução entre você e Tiago, com prazos e prioridades claras.',headers:['Atividade','Vínculo','Responsável','Prazo','Situação'],fields:[
  f('title','Atividade','text',true),f('clientId','Cliente relacionado','clients'),f('projectId','Projeto relacionado','projects'),f('assignee','Responsável','select',false,opts.assignee),f('deadline','Prazo','date'),f('priority','Prioridade','select',false,opts.priority),f('status','Situação','select',false,opts.taskStatus),f('notes','Detalhes da tarefa','textarea')]},
 deliveries:{title:'ENTREGAS',description:'Organize vídeos, artes, sites, materiais e aprovações por projeto.',headers:['Entrega','Projeto','Tipo','Prazo','Situação'],fields:[
  f('title','Entrega','text',true),f('projectId','Projeto','projects',true),f('kind','Tipo','select',false,['Website','Arte','Vídeo','Identidade visual','Copywriting','Estratégia','Arquivo','Outro']),f('deadline','Prazo','date'),f('status','Situação','select',false,opts.deliveryStatus),f('url','Link HTTPS do material','url'),f('notes','Observações','textarea')]},
 contracts:{title:'CONTRATOS',description:'Vigência e renovação contratual, sem substituir assinatura digital.',headers:['Contrato','Cliente','Valor','Renovação','Situação'],fields:[
  f('title','Identificação do contrato','text',true),f('clientId','Cliente','clients',true),f('plan','Modalidade','select',false,['BARCO','IATE','SUBMARINO','AVULSO','PERSONALIZADO']),f('amount','Valor de referência (R$)','number'),f('startDate','Início','date'),f('endDate','Término','date'),f('renewalDate','Data de renovação','date'),f('status','Situação','select',false,opts.contractStatus),f('url','Link HTTPS do contrato','url'),f('notes','Observações','textarea')]},
 receivables:{title:'A RECEBER',description:'Controle de valores devidos por clientes; sem integração bancária automática.',headers:['Recebível','Cliente','Valor','Vencimento','Situação'],fields:[
  f('title','Descrição da cobrança','text',true),f('clientId','Cliente','clients',true),f('projectId','Projeto','projects'),f('amount','Valor (R$)','number',true),f('dueDate','Vencimento','date',true),f('paidOn','Pagamento confirmado em','date'),f('method','Meio de pagamento','select',false,['Pix','Pix agendado','Boleto','Transferência','Cartão','Outro']),f('status','Situação','select',false,opts.paymentStatus),f('notes','Observações','textarea')]},
 expenses:{title:'DESPESAS',description:'Custos fixos, ferramentas, impostos, fornecedores e pagamentos.',headers:['Descrição','Categoria','Valor','Vencimento','Situação'],fields:[
  f('title','Descrição','text',true),f('category','Categoria','select',false,['Software','Hospedagem','Marketing','Prestadores','Impostos','Operacional','Outro']),f('vendor','Fornecedor'),f('amount','Valor (R$)','number',true),f('dueDate','Vencimento','date',true),f('paidOn','Pagamento confirmado em','date'),f('status','Situação','select',false,opts.paymentStatus),f('notes','Observações','textarea')]}
};
const state={module:'leads',items:Object.fromEntries(modules.map(m=>[m,[]])),audit:[],edit:null,loaded:false,user:''};
const node=(tag,value,cls)=>{
 const el=document.createElement(tag);if(value!=null)el.textContent=String(value);if(cls)el.className=cls;return el;
};
const money=x=>Number(x||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const currency=x=>'R$ '+money(x);
const date=x=>{
 if(!x||!/^\d{4}-\d{2}-\d{2}$/.test(x))return '—';
 const [year,month,day]=x.split('-');return day+'/'+month+'/'+year;
};
const localDay=()=>{
 const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
const diffDay=value=>{
 if(!value||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
 const t=value.split('-').map(Number),now=localDay().split('-').map(Number);
 return Math.round((Date.UTC(t[0],t[1]-1,t[2])-Date.UTC(now[0],now[1]-1,now[2]))/86400000);
};
const nameOf=(kind,id)=>{
 if(!id)return '—';
 const item=state.items[kind].find(row=>row.id===id);
 return item?item.company||item.name||item.title:'Registro indisponível';
};
function notify(id,message){$(id).textContent=message||'';}
function linked(row){
 return row.projectId?nameOf('projects',row.projectId):row.clientId?nameOf('clients',row.clientId):'Sem vínculo';
}
function reference(row){
 return row.clientId?nameOf('clients',row.clientId):row.leadId?nameOf('leads',row.leadId):'—';
}
function payment(row){return row.status==='pago'||!!row.paidOn;}
function values(type,row){
 switch(type){
  case 'leads':return [row.company||row.name,row.service||'—',row.stage||'novo',date(row.nextDate),row.assignee||'—'];
  case 'clients':return [row.name,row.company||'—',row.segment||'—',row.status||'—'];
  case 'proposals':return [row.title,reference(row),currency(row.amount),row.stage||'—',date(row.validUntil)];
  case 'projects':return [row.title,nameOf('clients',row.clientId),row.service||'—',row.assignee||'—',date(row.deadline),row.status||'—'];
  case 'tasks':return [row.title,linked(row),row.assignee||'—',date(row.deadline),row.status||'—'];
  case 'deliveries':return [row.title,nameOf('projects',row.projectId),row.kind||'—',date(row.deadline),row.status||'—'];
  case 'contracts':return [row.title,nameOf('clients',row.clientId),currency(row.amount),date(row.renewalDate),row.status||'—'];
  case 'receivables':return [row.title,nameOf('clients',row.clientId),currency(row.amount),date(row.dueDate),payment(row)?'pago':row.status||'pendente'];
  case 'expenses':return [row.title,row.category||'—',currency(row.amount),date(row.dueDate),payment(row)?'pago':row.status||'pendente'];
 }
 return [];
}
async function api(op,settings={}){
 const u=new URL(endpoint,location.origin);u.searchParams.set('op',op);
 if(settings.type)u.searchParams.set('type',settings.type);
 const response=await fetch(u,{method:settings.method||'GET',credentials:'same-origin',cache:'no-store',headers:{'content-type':'application/json','x-nexa-command':'1'},body:settings.method==='POST'?JSON.stringify(settings.body||{}):undefined});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(data.error||'Erro na comunicação com o servidor.');
 return data;
}
function showLogin(){
 $('login-screen').hidden=false;$('command-screen').hidden=true;$('logout').hidden=true;$('who').hidden=true;
 state.loaded=false;state.user='';state.audit=[];for(const t of modules)state.items[t]=[];
}
function showCommand(user){
 state.user=user;$('who').textContent=user.toUpperCase();$('who').hidden=false;$('logout').hidden=false;
 $('login-screen').hidden=true;$('command-screen').hidden=false;
 $('today').textContent='HOJE · '+date(localDay());$('welcome').textContent='Olá, '+user+'. Acompanhe as prioridades e os números da agência.';
}
async function loadAll(){
 $('refresh').disabled=true;
 try{
  const result=await Promise.all([...modules.map(type=>api('list',{type})),api('audit')]);
  for(let i=0;i<modules.length;i++)state.items[modules[i]]=result[i].items||[];
  state.audit=result[modules.length].items||[];
  state.loaded=true;renderAll();
 }catch(error){window.alert('Não foi possível atualizar: '+error.message);throw error;}
 finally{$('refresh').disabled=false;}
}
function stats(){
 const rows=state.items;
 const openLeads=rows.leads.filter(x=>!['ganho','perdido'].includes(x.stage)).length;
 const work=rows.projects.filter(x=>!['concluído','pausado'].includes(x.status)).length;
 const tasks=rows.tasks.filter(x=>x.status!=='concluída').length;
 const pending=rows.receivables.filter(x=>!payment(x)&&x.status!=='cancelado');
 const due=pending.reduce((sum,x)=>sum+Number(x.amount||0),0);
 const outstanding=rows.expenses.filter(x=>!payment(x)&&x.status!=='cancelado').reduce((sum,x)=>sum+Number(x.amount||0),0);
 const overdue=pending.filter(x=>diffDay(x.dueDate)<0).length;
 return [['OPORTUNIDADES EM ABERTO',openLeads],['CLIENTES ATIVOS',rows.clients.filter(x=>x.status==='ativo').length],['PROJETOS EM ANDAMENTO',work],['TAREFAS PENDENTES',tasks],['TOTAL A RECEBER',currency(due)],['DESPESAS EM ABERTO',currency(outstanding)],['COBRANÇAS VENCIDAS',overdue]];
}
function renderMetrics(){
 const parent=$('metrics');parent.replaceChildren();
 for(const [i,item] of stats().entries()){
  const el=node('div',null,'metric'+(i===6&&item[1]?' warning':''));
  el.append(node('strong',item[1]),node('span',item[0]));parent.append(el);
 }
}
function priorityItems(){
 const rows=[];
 const add=(type,label,what,dateValue,person,window=7)=>{
  const days=diffDay(dateValue);
  if(days===null||days>window)return;
  rows.push({type,label,what,days,person,dateValue});
 };
 for(const row of state.items.tasks)if(row.status!=='concluída')add('tasks','TAREFA',row.title,row.deadline,row.assignee||'A definir');
 for(const row of state.items.projects)if(!['concluído','pausado'].includes(row.status))add('projects','PROJETO',row.title,row.deadline,row.assignee||'Equipe');
 for(const row of state.items.deliveries)if(row.status!=='aprovada')add('deliveries','ENTREGA',row.title,row.deadline,nameOf('projects',row.projectId));
 for(const row of state.items.receivables)if(!payment(row)&&row.status!=='cancelado')add('receivables','COBRANÇA',row.title,row.dueDate,nameOf('clients',row.clientId));
 for(const row of state.items.expenses)if(!payment(row)&&row.status!=='cancelado')add('expenses','DESPESA',row.title,row.dueDate,'Contas a pagar');
 for(const row of state.items.contracts)if(row.status==='vigente')add('contracts','RENOVAÇÃO',row.title,row.renewalDate,nameOf('clients',row.clientId),30);
 for(const row of state.items.leads)if(!['ganho','perdido'].includes(row.stage))add('leads','CONTATO',row.company||row.name,row.nextDate,row.assignee||'Equipe');
 rows.sort((a,b)=>a.days-b.days);
 return rows.slice(0,8);
}
function renderPriorities(){
 const parent=$('priorities');parent.replaceChildren();
 const items=priorityItems();
 if(!items.length){parent.append(node('p','Nenhum prazo imediato cadastrado.','empty'));return;}
 for(const p of items){
  const button=node('button',null,'priority'+(p.days<0?' late':''));
  button.type='button';
  button.append(node('span',p.label),node('strong',p.what),node('small',(p.days<0?'ATRASADO · ':p.days===0?'HOJE · ':'')+date(p.dateValue)+' · '+p.person));
  button.addEventListener('click',()=>selectModule(p.type,true));
  parent.append(button);
 }
}
function selectModule(module,scroll=false){
 if(!config[module])return;
 state.module=module;closeEditor();$('search').value='';$('status-filter').value='';
 for(const button of $('module-nav').querySelectorAll('button[data-module]'))button.classList.toggle('active',button.dataset.module===module);
 const c=config[module];$('module-title').textContent=c.title;$('module-description').textContent=c.description;
 refreshFilters();renderRecords();
 if(scroll)document.querySelector('.modules').scrollIntoView({behavior:'smooth',block:'start'});
}
function refreshFilters(){
 const filter=$('status-filter');filter.replaceChildren(new Option('Todas as situações',''));
 const key=['leads','proposals'].includes(state.module)?'stage':'status';
 const available=[...new Set(state.items[state.module].map(x=>x[key]).filter(Boolean))].sort();
 for(const s of available)filter.append(new Option(s,s));
}
function visibleRecords(){
 const q=$('search').value.trim().toLocaleLowerCase('pt-BR'),status=$('status-filter').value,key=['leads','proposals'].includes(state.module)?'stage':'status';
 return state.items[state.module].filter(row=>{
  const matchingStatus=!status||row[key]===status;
  const matchingText=!q||[...values(state.module,row),row.notes||''].join(' ').toLocaleLowerCase('pt-BR').includes(q);
  return matchingStatus&&matchingText;
 });
}
function renderRecords(){
 const c=config[state.module],thead=$('records-head'),tbody=$('records-body');
 thead.replaceChildren();tbody.replaceChildren();
 const hr=node('tr');
 for(const h of [...c.headers,'AÇÕES'])hr.append(node('th',h));thead.append(hr);
 const items=visibleRecords();$('record-count').textContent=items.length+' registro(s)';
 for(const row of items){
  const tr=node('tr');
  for(const value of values(state.module,row))tr.append(node('td',value||'—'));
  const actions=node('td');const edit=node('button','EDITAR','action-button');edit.type='button';
  edit.addEventListener('click',()=>openEditor(row));actions.append(edit);
  if(!['clients','contracts','receivables','expenses'].includes(state.module)){
   const remove=node('button','EXCLUIR','action-button remove');remove.type='button';
   remove.addEventListener('click',()=>removeRecord(row));actions.append(remove);
  }
  tr.append(actions);tbody.append(tr);
 }
 $('empty-state').hidden=items.length!==0;
 $('empty-state').textContent=$('search').value||$('status-filter').value?'Nenhum registro corresponde aos filtros.':'Ainda não há registros nesta área.';
}
function renderAudit(){
 const root=$('audit');root.replaceChildren();
 if(!state.audit.length){root.append(node('p','O histórico começa no primeiro cadastro salvo.','empty'));return;}
 for(const row of state.audit.slice(0,12)){
  const item=node('div',null,'audit-row');
  item.append(node('b',row.user+' · '+row.action),node('span',config[row.type]?.title||row.type),node('small',new Date(row.at).toLocaleString('pt-BR')));
  root.append(item);
 }
}
function renderAll(){renderMetrics();renderPriorities();refreshFilters();renderRecords();renderAudit();}
function formInput(field,row){
 const label=node('label');if(field.kind==='textarea')label.classList.add('wide');
 label.append(node('span',field.label+(field.required?' *':'')));
 let control;
 if(['select','clients','leads','projects'].includes(field.kind)){
  control=document.createElement('select');control.append(new Option('Selecione',''));
  const items=field.kind==='select'?(field.options||[]).map(s=>({id:s,text:s})):(state.items[field.kind]||[]).map(r=>({id:r.id,text:r.company||r.name||r.title}));
  for(const it of items)control.append(new Option(it.text,it.id));
 }else if(field.kind==='textarea')control=document.createElement('textarea');
 else{
  control=document.createElement('input');control.type=field.kind;
  control.maxLength=field.kind==='url'?500:field.kind==='email'?180:170;
  if(field.kind==='number'){control.min='0';control.step='0.01';}
 }
 control.name=field.key;
 control.required=field.required;
 if(row?.[field.key]!=null)control.value=row[field.key];
 label.append(control);return label;
}
function openEditor(row=null){
 state.edit=row;$('editor-title').textContent=row?'EDITAR '+config[state.module].title:'NOVO CADASTRO · '+config[state.module].title;
 $('form-fields').replaceChildren();
 for(const field of config[state.module].fields)$('form-fields').append(formInput(field,row));
 notify('editor-feedback','');
 $('editor').hidden=false;
 $('editor').scrollIntoView({behavior:'smooth',block:'start'});
}
function closeEditor(){state.edit=null;$('editor').hidden=true;$('editor-form').reset();}
async function saveRecord(event){
 event.preventDefault();const form=$('editor-form');if(!form.reportValidity())return;
 const button=form.querySelector('[type="submit"]');button.disabled=true;notify('editor-feedback','');
 const data=Object.fromEntries(new FormData(form).entries());
 for(const key of ['amount','estimatedValue'])if(data[key])data[key]=Number(data[key]).toFixed(2);
 try{
  await api('save',{method:'POST',body:{type:state.module,id:state.edit?.id,updatedAt:state.edit?.updatedAt,data}});
  closeEditor();await loadAll();
 }catch(error){notify('editor-feedback',error.message);}
 finally{button.disabled=false;}
}
async function removeRecord(row){
 if(!window.confirm('Excluir '+(row.title||row.name||'este registro')+'? Essa ação não pode ser desfeita.'))return;
 try{await api('delete',{method:'POST',body:{type:state.module,id:row.id}});await loadAll();}
 catch(error){window.alert(error.message);}
}
function exportCsv(){
 const headers=config[state.module].headers;
 const fields=visibleRecords().map(x=>values(state.module,x));
 const safe=v=>{
  let s=String(v??'');
  // Prevent formula injection in spreadsheet programs.
  if(/^[=+\-@\t\r]/.test(s))s="'"+s;
  return '"'+s.replace(/"/g,'""')+'"';
 };
 const content='\uFEFF'+[headers,...fields].map(row=>row.map(safe).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download='nexa-'+state.module+'-'+localDay()+'.csv';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
$('year').textContent=new Date().getFullYear();
$('login-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=event.submitter;button.disabled=true;notify('login-feedback','');
 try{
  const data=await api('login',{method:'POST',body:{username:$('username').value,password:$('password').value}});
  $('password').value='';showCommand(data.user);await loadAll();
 }catch(error){notify('login-feedback',error.message);}
 finally{button.disabled=false;}
});
$('logout').addEventListener('click',async()=>{try{await api('logout',{method:'POST'});}catch{}showLogin();});
$('refresh').addEventListener('click',()=>loadAll().catch(()=>{}));
$('new-task').addEventListener('click',()=>{selectModule('tasks',true);openEditor();});
$('module-nav').addEventListener('click',event=>{const btn=event.target.closest('button[data-module]');if(btn)selectModule(btn.dataset.module);});
$('add-record').addEventListener('click',()=>openEditor());
$('close-editor').addEventListener('click',closeEditor);
$('cancel-editor').addEventListener('click',closeEditor);
$('editor-form').addEventListener('submit',saveRecord);
$('search').addEventListener('input',renderRecords);
$('status-filter').addEventListener('change',renderRecords);
$('csv').addEventListener('click',exportCsv);
selectModule('leads');
api('session').then(async data=>{showCommand(data.user);await loadAll();}).catch(error=>{
 showLogin();
 if(!/sessão|expirada|autorizado/i.test(error.message))notify('login-feedback',error.message);
});
})();
