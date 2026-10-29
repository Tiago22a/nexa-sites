'use strict';
(()=>{
const dialog=document.querySelector('#nexa-contact');
if(!dialog)return;
let previous=null;
document.querySelectorAll('[data-open-contact]').forEach(btn=>btn.addEventListener('click',event=>{
 event.preventDefault();previous=btn;
 const nav=document.querySelector('#main-nav');
 if(nav)nav.classList.remove('open');
 if(!dialog.open)dialog.showModal();
}));
document.querySelectorAll('[data-close-contact]').forEach(btn=>btn.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>{if(previous)previous.focus()});
})();