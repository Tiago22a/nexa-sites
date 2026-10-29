'use strict';
/* Identidades fornecidas no repositório usam seus SVGs oficiais.
 * Outros nomes entram como wordmarks tipográficos temporários — sem criar logotipos.
 * Preencher logo: /assets/clientes/<arquivo>.svg e url: https://site-oficial
 * apenas após receber arquivos/URLs confirmados.
 */
const NEXA_SHOWCASE = [
  {name:'WINF Partners',kind:'ecosistema',logo:'/assets/nexa-winf-partners.svg',url:null},
  {name:'M.A.W. Agência',kind:'ecosistema',logo:'/assets/nexa-maw-ghost.svg',url:null},
  {name:'SYNTHWAVE',kind:'ecosistema',logo:null,url:null},
  {name:'UNIVERSO DARK',kind:'ecosistema',logo:null,url:null},
  {name:'NeoSkin',kind:'ecosistema',logo:null,url:null},
  {name:'AeroCore',kind:'ecosistema',logo:null,url:null},
  {name:'Ceramic Armoring',kind:'ecosistema',logo:null,url:null},
  {name:'Gceiro',kind:'cliente',logo:null,url:null},
  {name:'MC Gesso',kind:'cliente',logo:null,url:null}
];
(()=>{
  const band=document.querySelector('#clients-marquee');
  const track=document.querySelector('#clients-track');
  const placeholder=document.querySelector('#clients-placeholder');
  if(!band||!track||!placeholder)return;
  const entries=NEXA_SHOWCASE.filter(x=>x&&x.name&&['ecosistema','cliente'].includes(x.kind));
  if(!entries.length)return;
  const make=(duplicate)=>{
    const group=document.createElement('div');
    group.className='clients-logo-set';
    if(duplicate)group.setAttribute('aria-hidden','true');
    for(const entry of entries){
      const verified=typeof entry.url==='string'&&/^https:\/\/[^ ]+$/i.test(entry.url);
      const tile=document.createElement(verified?'a':'div');
      tile.className='clients-logo-link nexa-showcase-tile';
      tile.title=entry.name+(verified?' — abrir site':' — endereço ainda não informado');
      if(verified){tile.href=entry.url;tile.target='_blank';tile.rel='noopener noreferrer';tile.setAttribute('aria-label','Visitar '+entry.name);}
      if(duplicate)tile.tabIndex=-1;
      if(entry.logo&&entry.logo.startsWith('/assets/')){
        const img=document.createElement('img');
        img.src=entry.logo;img.alt=duplicate?'':entry.name;img.loading='lazy';img.decoding='async';
        tile.append(img);
        if(entry.name==='M.A.W. Agência')tile.classList.add('nexa-maw-tile');
      }else{tile.append(Object.assign(document.createElement('strong'),{textContent:entry.name}));}
      const tag=document.createElement('small');
      tag.textContent=entry.kind==='cliente'?'CLIENTE / CASE':'ECOSSISTEMA WINF';
      tile.append(tag);
      group.append(tile);
    }
    return group;
  };
  track.replaceChildren(make(false),make(true));
  placeholder.hidden=true;band.hidden=false;
})();
