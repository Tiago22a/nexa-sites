'use strict';
/* Alternancia acessivel entre visao do cliente e bastidores dos planos NEXA. */
(()=>{
 for(const root of document.querySelectorAll('[data-plan-tabs]')){
  const tabs=[...root.querySelectorAll('[data-plan-switch]')];
  const panels=[...root.querySelectorAll('[data-plan-panel]')];
  if(!tabs.length||!panels.length)continue;
  const activate=(name,focus=false)=>{
   for(const tab of tabs){
    const selected=tab.dataset.planSwitch===name;
    tab.classList.toggle('is-active',selected);
    tab.setAttribute('aria-selected',String(selected));
    tab.tabIndex=selected?0:-1;
    if(selected&&focus)tab.focus();
   }
   for(const panel of panels)panel.hidden=panel.dataset.planPanel!==name;
  };
  tabs.forEach((tab,i)=>{
   tab.addEventListener('click',()=>activate(tab.dataset.planSwitch));
   tab.addEventListener('keydown',event=>{
    let j;
    if(event.key==='ArrowRight')j=(i+1)%tabs.length;
    else if(event.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;
    else if(event.key==='Home')j=0;
    else if(event.key==='End')j=tabs.length-1;
    else return;
    event.preventDefault();activate(tabs[j].dataset.planSwitch,true);
   });
  });
  activate(tabs.find(x=>x.getAttribute('aria-selected')==='true')?.dataset.planSwitch||tabs[0].dataset.planSwitch);
 }
})();
