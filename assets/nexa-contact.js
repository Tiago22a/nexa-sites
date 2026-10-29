'use strict';
(() => {
 const dialog=document.getElementById('nexa-contact-dialog');
 if(dialog){
   let previous=null;
   const open=trigger=>{
     previous=trigger;
     if(typeof dialog.showModal==='function'){if(!dialog.open)dialog.showModal();}
     else dialog.setAttribute('open','');
   };
   document.querySelectorAll('[data-contact-open]').forEach(button=>button.addEventListener('click',()=>open(button)));
   document.querySelectorAll('[data-contact-close]').forEach(button=>button.addEventListener('click',()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')}));
   dialog.addEventListener('click',event=>{if(event.target===dialog){if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open')}});
   dialog.addEventListener('close',()=>{if(previous)previous.focus()});
 }
 document.querySelectorAll('[data-plan-switch]').forEach(control=>{
   control.addEventListener('click',()=>{
     const wrapper=control.closest('[data-plan-tabs]');if(!wrapper)return;
     const chosen=control.dataset.planSwitch;
     wrapper.querySelectorAll('[data-plan-switch]').forEach(btn=>{const active=btn.dataset.planSwitch===chosen;btn.setAttribute('aria-selected',String(active));btn.tabIndex=active?0:-1;btn.classList.toggle('is-active',active)});
     wrapper.querySelectorAll('[data-plan-panel]').forEach(panel=>{panel.hidden=panel.dataset.planPanel!==chosen});
   });
 });
 if('IntersectionObserver' in window){
   const stops=[...document.querySelectorAll('[data-depth-section]')];
   const dots=[...document.querySelectorAll('.detail-stepnav a')];
   if(stops.length&&dots.length){
     const o=new IntersectionObserver(entries=>{
       const active=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
       if(!active)return;
       const id=active.target.id;
       dots.forEach(a=>{const yes=a.hash==='#'+id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
     },{rootMargin:'-30% 0px -55% 0px',threshold:[0,.15,.25]});
     stops.forEach(s=>o.observe(s));
   }
 }
})();