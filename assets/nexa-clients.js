'use strict';
/* Logomarcas oficiais extraídas dos materiais fornecidos e vetorizadas em branco.
   Incluir novas marcas somente com arquivo oficial. Sem substituições por textos comuns. */
const NEXA_CASES=[
{slug:'winf-partners',name:'WINF Partners',logo:'/assets/cases/winf-partners-branco.svg',url:'https://winf.com.br/partners/'},
{slug:'aerocore',name:'AeroCore',logo:'/assets/cases/aerocore-branco.svg',url:'https://winf.com.br/aerocore/'},
{slug:'neoskin',name:'NeoSkin',logo:'/assets/cases/neoskin-branco.svg',url:'https://winf.com.br/aerocore/neoskin/'},
{slug:'ceramic',name:'Ceramic Armoring',logo:'/assets/cases/ceramic-armoring-branco.svg',url:'https://winf.com.br/aerocore/ceramic-armoring/'},
{slug:'maw',name:'M.A.W.',logo:'/assets/cases/maw-branco.svg'},
{slug:'synthwave',name:'Synthwave.fm',logo:'/assets/cases/synthwave-fm-branco.svg'},
{slug:'winf',name:'WINF',logo:'/assets/cases/winf-branco.svg',url:'https://winf.com.br/'},
{slug:'mc-gesso',name:'MC Gesso',logo:'/assets/cases/mc-gesso-branco.svg'}
];
(()=>{
const track=document.getElementById('clients-track');
const placeholder=document.getElementById('clients-placeholder');
const marquee=document.getElementById('clients-marquee');
if(!track||!marquee||!placeholder)return;
function createSet(duplicate){
 const group=document.createElement('div');group.className='clients-logo-set';
 if(duplicate)group.setAttribute('aria-hidden','true');
 for(const brand of NEXA_CASES){
  const tile=document.createElement(brand.url?'a':'div');
  tile.className='clients-logo-link';
  tile.dataset.slug=brand.slug;
  if(brand.url){
   tile.href=brand.url;tile.target='_blank';tile.rel='noopener noreferrer';
   tile.setAttribute('aria-label','Conhecer o projeto '+brand.name);
   if(duplicate)tile.tabIndex=-1;
  }else{tile.title=brand.name;}
  const img=document.createElement('img');
  img.src=brand.logo;img.alt=duplicate?'':brand.name;
  img.loading='eager';img.decoding='async';
  tile.append(img);group.append(tile);
 }
 return group;
}
track.replaceChildren(createSet(false),createSet(true));
placeholder.hidden=true;
marquee.hidden=false;
})();
