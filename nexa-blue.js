'use strict';
const whats='5513997815375';
const message=interest=>'Olá, equipe NEXA BLUE! Estava explorando o site e gostaria de mais informações sobre '+interest+'. Preciso de uma solução de presença digital para meu negócio. Podemos conversar sobre escopo, contrato e próximos passos?';
const whatsapp=interest=>'https://wa.me/'+whats+'?text='+encodeURIComponent(message(interest));
const menu=document.querySelector('#nav-toggle'),nav=document.querySelector('#main-nav');
if(menu&&nav){menu.addEventListener('click',()=>{const o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(o));menu.setAttribute('aria-label',o?'Fechar menu':'Abrir menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}})}
const ids=['inicio','mergulho','exploracao','profundidade','planos'];
const labels=['SUPERFÍCIE','MERGULHO','EXPLORAÇÃO','PROFUNDIDADE','PLANOS'];
const links=[...document.querySelectorAll('.depth-nav a')];
if('IntersectionObserver' in window){const o=new IntersectionObserver(entries=>{const item=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!item)return;const i=ids.indexOf(item.target.id);if(i<0)return;links.forEach((x,j)=>x.classList.toggle('active',i===j));const label=document.querySelector('#depth-label');if(label)label.textContent=labels[i]},{rootMargin:'-20% 0px -35% 0px',threshold:[0,.15,.3,.5,.7]});ids.forEach(id=>{const e=document.getElementById(id);if(e)o.observe(e)})}
document.querySelectorAll('[data-service]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();window.open(whatsapp(el.dataset.service),'_blank','noopener,noreferrer')}));
document.querySelectorAll('[data-plan]:not([data-open-plan])').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();window.open(whatsapp(el.dataset.plan),'_blank','noopener,noreferrer')}));
document.querySelectorAll('img[data-fallback]').forEach(img=>img.addEventListener('error',()=>{if(img.dataset.fallback&&!img.dataset.usedFallback){img.dataset.usedFallback='true';img.src=img.dataset.fallback}}));
const video=document.getElementById('hero-video');
if(video){video.addEventListener('playing',()=>video.classList.add('is-playing'));video.addEventListener('error',()=>video.classList.remove('is-playing'));if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){video.pause();video.removeAttribute('autoplay')}else video.play().catch(()=>{})}
const year=document.querySelector('#year');if(year)year.textContent=new Date().getFullYear();
