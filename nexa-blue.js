'use strict';
const whats='5513997815375';
const base='Olá, equipe NEXA BLUE! Estava explorando o site e quero entender como vocês podem fortalecer a presença digital do meu negócio. Preciso de orientação estratégica para identificar as melhores oportunidades e gostaria de conversar sobre ';
const goWhatsapp=(interest)=>{const msg=base+interest+'. Podemos conversar sobre as possibilidades e os próximos passos?';window.open('https://wa.me/'+whats+'?text='+encodeURIComponent(msg),'_blank','noopener,noreferrer')};
const menuButton=document.querySelector('#nav-toggle'),nav=document.querySelector('#main-nav');
menuButton.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Fechar menu':'Abrir menu')});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}});
const sections=['inicio','mergulho','exploracao','profundidade','planos'];
const names=['SUPERFÍCIE','MERGULHO','EXPLORAÇÃO','PROFUNDIDADE','PLANOS'];
const depthLinks=[...document.querySelectorAll('.depth-nav a')];
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{const highest=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!highest)return;const index=sections.indexOf(highest.target.id);if(index!==-1){depthLinks.forEach((item,i)=>item.classList.toggle('active',i===index));document.querySelector('#depth-label').textContent=names[index]}},{rootMargin:'-20% 0px -35% 0px',threshold:[0,.15,.3,.5,.7]});sections.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el)})}
document.querySelectorAll('[data-plan],[data-service]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();const item=el.dataset.plan||el.dataset.service;goWhatsapp(item)}));
document.querySelectorAll('img[data-fallback]').forEach(img=>img.addEventListener('error',()=>{if(img.dataset.fallback&&!img.dataset.usedFallback){img.dataset.usedFallback='true';img.src=img.dataset.fallback}}));
const vid=document.getElementById('hero-video');if(vid){vid.addEventListener('playing',()=>vid.classList.add('is-playing'));vid.addEventListener('error',()=>vid.classList.remove('is-playing'));if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){vid.pause();vid.removeAttribute('autoplay')}else{vid.play().catch(()=>{})}}
document.getElementById('year').textContent=new Date().getFullYear();
