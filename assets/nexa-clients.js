'use strict';
/*
 * NEXA BLUE — logos oficiais de clientes.
 * Adicionar APENAS clientes e cases efetivos, após receber o logotipo e o link público.
 * Exemplo de entrada (NÃO ativa até ser incluída na lista):
 * {name:'Empresa',logo:'/assets/clientes/empresa-logo-branca.png',url:'https://empresa.com.br/'}
 */
const NEXA_CLIENTS = [];
(()=>{
  const row=document.querySelector('#clients-track');
  const empty=document.querySelector('#clients-placeholder');
  const marquee=document.querySelector('#clients-marquee');
  if(!row||!empty||!marquee||!NEXA_CLIENTS.length)return;
  const valid=NEXA_CLIENTS.filter(x=>x&&typeof x.name==='string'&&x.name.trim()&&typeof x.logo==='string'&&x.logo.startsWith('/assets/clientes/')&&typeof x.url==='string'&&/^https:\/\//i.test(x.url));
  if(!valid.length)return;
  const makeSet=(duplicate=false)=>{
    const group=document.createElement('div');
    group.className='clients-logo-set';
    if(duplicate)group.setAttribute('aria-hidden','true');
    for(const client of valid){
      const link=document.createElement('a');
      link.href=client.url;
      link.target='_blank';
      link.rel='noopener noreferrer';
      link.className='clients-logo-link';
      link.setAttribute('aria-label','Conhecer o site de '+client.name);
      if(duplicate)link.tabIndex=-1;
      const logo=document.createElement('img');
      logo.src=client.logo;
      logo.alt=duplicate?'':client.name;
      logo.loading='lazy';
      logo.decoding='async';
      link.append(logo);
      group.append(link);
    }
    return group;
  };
  row.append(makeSet(),makeSet(true));
  empty.hidden=true;
  marquee.hidden=false;
})();
