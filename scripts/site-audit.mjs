import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, extname } from 'node:path';

const root=process.cwd();
const ignored=new Set(['.git','.github','node_modules','dist','netlify','scripts']);
const pages=[];
function walk(folder){
 for(const ent of readdirSync(folder,{withFileTypes:true})){
  if(ent.isSymbolicLink())continue;
  const file=join(folder,ent.name);
  if(ent.isDirectory()){if(!ignored.has(ent.name))walk(file);}
  else if(ent.isFile()&&ent.name.endsWith('.html'))pages.push(file);
 }
}
walk(root);
let examined=0, checked=0;
const errors=[], warnings=[];
function readIdSet(file){return new Set([...readFileSync(file,'utf8').matchAll(/\bid=["']([^"']+)["']/g)].map(x=>x[1]));}
for(const page of pages){
 const html=readFileSync(page,'utf8');examined++;
 const currentIds=readIdSet(page);
 for(const item of html.matchAll(/\b(href|src)=["']([^"']+)["']/g)){
  const val=item[2].trim();if(!val||val==='#'||/^(https?:|mailto:|tel:|data:|blob:|\/\/)/i.test(val))continue;
  if(val.startsWith('#')){checked++;if(!currentIds.has(val.slice(1)))errors.push(page+': ancora nao encontrada '+val);continue;}
  const parsed=val.split('#');const raw=parsed[0].split('?')[0];
  if(raw.startsWith('/.netlify/')||raw.startsWith('javascript:'))continue;
  const target=raw.startsWith('/')?join(root,raw.slice(1)):resolve(dirname(page),raw);
  const candidate=existsSync(target)&&statSync(target).isDirectory()?join(target,'index.html'):target;
  checked++;
  if(!existsSync(candidate)){errors.push(page+': arquivo nao encontrado '+val);continue;}
  if(parsed.length>1&&parsed[1]&&candidate.endsWith('.html')){
   if(!readIdSet(candidate).has(parsed[1]))errors.push(page+': ancora destino nao encontrada '+val);
  }
 }
 for(const m of html.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/g)){
  if(!/rel=["'][^"']*noopener/.test(m[0]))warnings.push(page+': link em nova aba sem noopener');
 }
 if(html.includes('data-plan-switch')&&!html.includes('/assets/nexa-plan-tabs.js')) errors.push(page+': abas dos planos sem codigo de interacao');
 if(html.includes('data-nexa-checkout')){
  if(!html.includes('/assets/nexa-checkout.js')||!html.includes('data-whatsapp')||!html.includes('nx-client-form'))
   errors.push(page+': formulario de plano sem recursos de contratacao');
 }
 if(html.includes('data-open-contact')&&!html.includes('/assets/nexa-contact.js'))
  errors.push(page+': botao de contato sem script');
}
for(const path of ['index.html','shop/index.html','planos/barco/index.html','planos/iate/index.html','planos/submarino/index.html','_redirects']){
 if(!existsSync(join(root,path)))errors.push('Arquivo essencial ausente: '+path);
}
console.log('Auditoria NEXA: '+examined+' paginas HTML; '+checked+' links internos, ancoras e recursos conferidos.');
for(const note of warnings)console.warn('AVISO: '+note);
for(const err of errors)console.error('ERRO: '+err);
if(errors.length)process.exitCode=1;
