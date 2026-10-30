'use strict';
/* Atualiza o endereco de origem embutido nas mensagens do NEXA SHOP.
 * Assim os links continuam corretos quando o dominio for substituido.
 */
(()=>{
 const oldHost='https://nexasite.netlify.app';
 const current=window.location.origin;
 for(const a of document.querySelectorAll('a[href^="https://wa.me/5513997815375"]')){
  try{
   const u=new URL(a.href);
   const message=u.searchParams.get('text');
   if(!message||!message.includes(oldHost))continue;
   u.searchParams.set('text',message.split(oldHost).join(current));
   a.href=u.toString();
  }catch{/* Mantem o link original se nao puder ser interpretado. */}
 }
})();
