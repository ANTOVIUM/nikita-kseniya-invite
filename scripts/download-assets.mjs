import {mkdir,writeFile} from 'node:fs/promises';
import {dirname} from 'node:path';
const origin='https://nikita-kseniya-24072027.alyshagf.chatgpt.site';
const files=['portrait-garden.webp','cinematic-veil-glass.webp','ivory-satin-macro.webp','tarantella-napoletana.mp3',...Array.from({length:6},(_,i)=>'fonts/font-'+(i+1)+'.woff2')];
for(const file of files){const response=await fetch(origin+'/assets/'+file);if(!response.ok)throw new Error(file+': '+response.status);const path='dist/assets/'+file;await mkdir(dirname(path),{recursive:true});await writeFile(path,new Uint8Array(await response.arrayBuffer()));console.log(path);}
