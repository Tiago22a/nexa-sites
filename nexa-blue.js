'use strict';

const whats = '5513997815375';
const instagram = 'https://www.instagram.com/nexasites_dev/';
const contactMessage = interest => 'Olá, equipe NEXA BLUE! Estava explorando o site e gostaria de melhorar a presença digital do meu negócio. Tenho interesse em: '+interest+'. Podemos conversar sobre o escopo, o contrato anual e os próximos passos?';
const whatsappURL = interest => 'https://wa.me/'+whats+'?text='+encodeURIComponent(contactMessage(interest));
const goWhatsapp = interest => { window.open(whatsappURL(interest), '_blank', 'noopener,noreferrer'); };

const menuButton = document.querySelector('#nav-toggle');
const nav = document.querySelector('#main-nav');
if(menuButton && nav){
  menuButton.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>{
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded','false');
  }));
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape'){
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded','false');
    }
  });
}

const sections = ['inicio','mergulho','exploracao','profundidade','planos'];
const names = ['SUPERFÍCIE','MERGULHO','EXPLORAÇÃO','PROFUNDIDADE','PLANOS'];
const depthLinks = [...document.querySelectorAll('.depth-nav a')];
if('IntersectionObserver' in window){
  const observer = new IntersectionObserver(entries => {
    const highest=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(!highest) return;
    const index=sections.indexOf(highest.target.id);
    if(index!==-1){
      depthLinks.forEach((item,i)=>item.classList.toggle('active',i===index));
      const label=document.querySelector('#depth-label');
      if(label)label.textContent=names[index];
    }
  },{rootMargin:'-20% 0px -35% 0px',threshold:[0,.15,.3,.5,.7]});
  sections.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el)});
}

document.querySelectorAll('[data-service]').forEach(el=>el.addEventListener('click',e=>{
  e.preventDefault();
  goWhatsapp(el.dataset.service);
}));
document.querySelectorAll('[data-plan]:not([data-open-plan])').forEach(el=>el.addEventListener('click',e=>{
  e.preventDefault();
  goWhatsapp(el.dataset.plan);
}));

const scopePlans={
  anzol:{
    heading:'ANZOL.',
    category:'01 / PRESENÇA DIGITAL ORGANIZADA',
    summary:'Seu negócio precisa ser encontrado, ter uma primeira impressão profissional e receber todos os materiais e acessos organizados. A produção de peças é concentrada na implantação, sem gestão recorrente de postagens.',
    includes:[
      'Briefing de marca e diagnóstico inicial de presença digital.',
      '1 website institucional de página única (one page), responsivo, com até 5 seções e botão de WhatsApp.',
      'Ajustes básicos de identidade visual para uso digital a partir de marca e materiais existentes; criação de logotipo inteiramente novo é serviço à parte.',
      'Kit inicial com até 6 artes estáticas digitais em formatos combinados para redes sociais, entregues com legendas sugeridas.',
      'Apoio na configuração ou otimização inicial de até 1 Perfil da Empresa no Google, sujeito à elegibilidade e à aprovação do Google.',
      'Organização das artes e arquivos finais em pastas nomeadas, com guia simples de publicação.',
      'Inventário de URLs, perfis, responsáveis e permissões; entrega segura dos acessos e orientações para recuperação de contas.',
      'Até 2 rodadas de ajustes consolidados durante a implantação e orientação de entrega.'
    ],
    limits:[
      'A Nexa não publica nem administra as redes sociais após a entrega neste plano.',
      'Fotos, vídeos, textos institucionais e informações legais devem ser fornecidos ou aprovados pelo contratante.',
      'Não inclui domínio, hospedagem, ferramentas pagas, anúncios, produção audiovisual ou materiais impressos.',
      'O serviço de implantação e a manutenção técnica básica do site durante a vigência são distintos de criação recorrente de peças.',
      'Renovações, ampliações e novas campanhas precisam de proposta específica.'
    ],
    cash:'R$ 1.490,00 à vista',installments:'12× de R$ 139,07',note:'Contrato de 12 meses. Total parcelado: R$ 1.668,84. Primeira parcela no ato da assinatura e outras 11 em vencimentos mensais. Valor parcelado aproximadamente 12% superior ao pagamento à vista.'
  },
  rede:{
    heading:'REDE.',
    category:'02 / PRESENÇA + PUBLICAÇÃO',
    summary:'Para quem quer a estrutura do ANZOL e também uma rotina real de conteúdo publicada pela Nexa durante os 12 meses de contrato, dentro de um calendário e um limite de produção claros.',
    includes:[
      'Todos os entregáveis de implantação e organização digital previstos no plano ANZOL.',
      'Planejamento editorial simplificado e calendário mensal de postagens.',
      'Criação de até 4 posts estáticos por mês (até 48 no período de 12 meses), com legendas e hashtags pertinentes.',
      'Agendamento e publicação dos 4 conteúdos mensais em até 2 perfis sociais do cliente, quando as plataformas permitirem.',
      'Adequação dos formatos para os dois perfis contratados, aproveitando o mesmo conteúdo-base.',
      '1 ciclo de aprovação mensal do calendário e até 1 rodada consolidada de ajustes nas peças do mês.',
      'Relatório mensal simples com publicações realizadas e indicadores disponibilizados pelas plataformas.',
      'Operação por permissões de colaborador/administrador, preservando o controle e a titularidade das contas pelo cliente.'
    ],
    limits:[
      'Não inclui atendimento de mensagens, comentários, SAC, gestão de comunidade ou resposta a seguidores.',
      'Não inclui gravação de Reels, vídeos, fotografia, produção de stories diários ou cobertura de eventos.',
      'Não inclui impulsionamentos, verba de anúncios, gestão de tráfego pago ou compromisso de crescimento em seguidores.',
      'Os posts não publicados por falta de aprovação ou de material do cliente seguem o fluxo e os prazos previstos no contrato.',
      'Calendário e pauta devem ser aprovados pelo contratante; conteúdo sujeito às políticas de cada plataforma.',
      'Mudanças estruturais do website e conteúdo além do limite mensal exigem orçamento separado.'
    ],
    cash:'R$ 2.490,00 à vista',installments:'12× de R$ 232,40',note:'Contrato de 12 meses. Total parcelado: R$ 2.788,80. Primeira parcela no ato da assinatura e outras 11 em vencimentos mensais. Acréscimo de 12% sobre o valor à vista.'
  },
  submarino:{
    heading:'MODO SUBMARINO.',
    category:'03 / PROJETOS PERSONALIZADOS',
    summary:'Para marcas, redes e operações que precisam de soluções digitais, sistemas e estratégias que não cabem em uma estrutura padronizada.',
    includes:[
      'Diagnóstico e proposta de escopo específicos para o objetivo do contratante.',
      'Possibilidades: identidade visual completa, páginas especiais, múltiplos websites, e-commerce e aplicativos.',
      'Possibilidades: integrações, automações, áreas restritas, fluxos comerciais, estratégias de conteúdo e gestão de múltiplas contas.',
      'Definição documentada de cronograma, entregáveis, critérios de aceite, suporte e governança dos acessos.',
      'Execução e acompanhamento conforme proposta personalizada assinada.'
    ],
    limits:[
      'Não existe preço único ou prazo padrão para projetos personalizados.',
      'Integrações e licenças de terceiros dependem de disponibilidade, permissões e orçamento próprio.',
      'Custos de domínio, hospedagem, serviços de nuvem e ferramentas externas são discriminados na proposta.',
      'Condições de pagamento, propriedade intelectual, manutenção e renovação serão detalhadas em contrato específico.'
    ],
    cash:'Valor sob consulta',installments:'Condições a combinar',note:'A consultoria inicial define um orçamento e um contrato próprios. Nenhuma cobrança é realizada pelo site.'
  }
};

const planDialog=document.querySelector('#plan-dialog');
const closePlanButton=document.querySelector('#plan-dialog-close');
let lastPlanTrigger=null;
const addList=(selector,lines)=>{
  const target=document.querySelector(selector);
  if(!target)return;
  target.replaceChildren();
  lines.forEach(t=>{const item=document.createElement('li');item.textContent=t;target.appendChild(item)});
};
const setText=(selector,value)=>{
  const el=document.querySelector(selector);
  if(el)el.textContent=value;
};
function openPlan(planId,trigger){
  const p=scopePlans[planId];
  if(!p||!planDialog)return;
  lastPlanTrigger=trigger;
  setText('#plan-dialog-title',p.heading);
  setText('#plan-dialog-category',p.category);
  setText('#plan-dialog-summary',p.summary);
  addList('#plan-dialog-includes',p.includes);
  addList('#plan-dialog-limits',p.limits);
  setText('#plan-dialog-cash',p.cash);
  setText('#plan-dialog-installments',p.installments);
  setText('#plan-dialog-payment-note',p.note);
  const cash=document.querySelector('#plan-dialog-cash-cta');
  const installment=document.querySelector('#plan-dialog-installment-cta');
  if(cash)cash.href=whatsappURL(p.heading+' — pagamento à vista. Gostaria de receber a proposta e o contrato para assinatura eletrônica');
  if(installment)installment.href=whatsappURL(p.heading+' — 12 parcelas. Gostaria de receber o contrato anual e as datas de vencimento');
  if(planId==='submarino'){
    if(cash)cash.textContent='SOLICITAR PROPOSTA ↗';
    if(installment)installment.textContent='CONVERSAR COM ESPECIALISTA ↗';
  }else{
    if(cash)cash.textContent='QUERO CONTRATAR À VISTA ↗';
    if(installment)installment.textContent='QUERO PARCELAR ↗';
  }
  if(typeof planDialog.showModal==='function')planDialog.showModal();
  else planDialog.setAttribute('open','');
}
document.querySelectorAll('[data-open-plan]').forEach(el=>{
  el.addEventListener('click',()=>openPlan(el.dataset.openPlan,el));
  el.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){e.preventDefault();openPlan(el.dataset.openPlan,el)}
  });
});
if(closePlanButton&&planDialog){
  closePlanButton.addEventListener('click',()=>planDialog.close());
  planDialog.addEventListener('click',e=>{
    if(e.target===planDialog)planDialog.close();
  });
  planDialog.addEventListener('close',()=>{if(lastPlanTrigger)lastPlanTrigger.focus()});
}
document.querySelectorAll('img[data-fallback]').forEach(img=>img.addEventListener('error',()=>{
  if(img.dataset.fallback&&!img.dataset.usedFallback){
    img.dataset.usedFallback='true';img.src=img.dataset.fallback;
  }
}));
const vid=document.querySelector('#hero-video');
if(vid){
  vid.addEventListener('playing',()=>vid.classList.add('is-playing'));
  vid.addEventListener('error',()=>vid.classList.remove('is-playing'));
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    vid.pause();vid.removeAttribute('autoplay');
  } else {
    vid.play().catch(()=>{});
  }
}
const year=document.querySelector('#year');
if(year)year.textContent=new Date().getFullYear();
