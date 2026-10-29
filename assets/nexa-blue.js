(()=>{'use strict';
const PHONE='5513997815375';
const intro='Olá, equipe Nexa! 👋 Estava explorando o site NEXA BLUE e gostaria de conversar sobre a presença digital do meu negócio. Preciso de orientação para atrair mais clientes, fortalecer minha marca e escolher a solução adequada.';
const wa=(message)=>'https://wa.me/'+PHONE+'?text='+encodeURIComponent(message);
document.querySelectorAll('[data-wa]').forEach(a=>{let msg=intro;if(a.dataset.wa==='plan')msg='Olá, equipe NEXA BLUE! 🌊 Conheci o plano '+a.dataset.interest+' no site e gostaria de saber como ele pode ajudar meu negócio. Podemos conversar sobre os entregáveis, o prazo e os próximos passos?';a.href=wa(msg);a.target='_blank';a.rel='noopener noreferrer';});
const menu=document.getElementById('siteMenu'), toggle=document.getElementById('menuToggle');
const closeMenu=()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');};
toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!menu.contains(e.target)&&!toggle.contains(e.target))closeMenu();});
menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.getElementById('year').textContent=new Date().getFullYear();
const items=[...document.querySelectorAll('.depth-nav a')],sections=items.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
if('IntersectionObserver'in window){const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){items.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));let lbl=e.target.id==='inicio'?'INÍCIO':e.target.id==='descoberta'?'DESCOBERTA':e.target.id==='exploracao'?'EXPLORAÇÃO':e.target.id==='profundidade'?'PROFUNDIDADE':'PLANOS';document.getElementById('depthLabel').textContent=lbl;}});},{rootMargin:'-32% 0px -48% 0px',threshold:0});sections.forEach(s=>io.observe(s));}
const desc={
'Sites e One Pages':'Sua empresa precisa transmitir confiança em segundos. Desenvolvemos experiências digitais claras, responsivas e direcionadas ao objetivo do seu negócio.',
'Aplicativos':'Quando a operação exige mais do que uma página, planejamos ferramentas digitais para simplificar jornadas e aproximar você do seu público.',
'Perfil da Empresa no Google':'Quem procura no Google precisa encontrar informações confiáveis sobre seu negócio. Ajudamos a organizar sua presença local e facilitar o contato.',
'Administração de redes sociais':'Seu conteúdo precisa ter direção. Criamos uma presença mais coerente e uma rotina de comunicação alinhada à sua marca.'
};
const dialog=document.getElementById('serviceDialog'),title=document.getElementById('serviceTitle'),description=document.getElementById('serviceDescription'),cta=document.getElementById('serviceWhatsapp');
document.querySelectorAll('[data-service]').forEach(btn=>btn.addEventListener('click',()=>{const name=btn.dataset.service;title.textContent=name;description.textContent=desc[name]||'';cta.href=wa('Olá, equipe NEXA BLUE! Gostaria de saber mais sobre '+name+'. Como podemos estruturar uma solução para meu negócio?');dialog.showModal();}));
document.getElementById('closeDialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
})();