import { readdir, stat, mkdir, copyFile, rm } from 'node:fs/promises';
import { extname, join, relative, dirname, basename } from 'node:path';
const root=process.cwd(), out=join(root,'dist');
const excludedDirs=new Set(['.git','.github','node_modules','netlify','scripts','dist']);
const extensions=new Set(['.html','.css','.js','.svg','.png','.jpg','.jpeg','.webp','.gif','.ico','.woff','.woff2','.mp4','.webm','.txt','.xml']);
const special=new Set(['_redirects','_headers']);
await rm(out,{recursive:true,force:true});
let count=0;
async function visit(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  if(entry.isSymbolicLink())continue;
  const src=join(dir,entry.name);
  if(entry.isDirectory()){if(!excludedDirs.has(entry.name))await visit(src);continue;}
  if(!entry.isFile())continue;
  if(!extensions.has(extname(entry.name).toLowerCase())&&!special.has(entry.name))continue;
  const dest=join(out,relative(root,src));
  await mkdir(dirname(dest),{recursive:true});
  await copyFile(src,dest);count++;
 }
}
await visit(root);
for(const required of ['index.html','shop/index.html','planos/barco/index.html','planos/iate/index.html','planos/submarino/index.html','_redirects']){
 const exists=await stat(join(out,required)).then(x=>x.isFile()).catch(()=>false);
 if(!exists)throw Error('Arquivo essencial ausente do deploy: '+required);
}
console.log('NEXA BLUE: '+count+' arquivos públicos preparados em dist/');
