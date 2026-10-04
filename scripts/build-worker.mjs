import {readFile,writeFile,mkdir,readdir} from 'node:fs/promises';
const assets={};
for(const [file,type] of [['index.html','text/html; charset=utf-8'],['editorial.css','text/css; charset=utf-8'],['fonts.css','text/css; charset=utf-8'],['app.js','application/javascript; charset=utf-8'],['cinema.js','application/javascript; charset=utf-8'],['organizers.html','text/html; charset=utf-8'],['organizers.js','application/javascript; charset=utf-8'],['assets/portrait-garden.webp','image/webp'],['assets/cinematic-veil-glass.webp','image/webp'],['assets/ivory-satin-macro.webp','image/webp'],['assets/tarantella-napoletana.mp3','audio/mpeg'],['assets/music-license.txt','text/plain; charset=utf-8']]){
  assets['/'+file]={type,data:(await readFile('dist/'+file)).toString('base64')};
}
for(const file of (await readdir('dist/assets/fonts')).filter(name=>name.endsWith('.woff2')||name.endsWith('.txt'))){assets['/assets/fonts/'+file]={type:file.endsWith('.woff2')?'font/woff2':'text/plain; charset=utf-8',data:(await readFile('dist/assets/fonts/'+file)).toString('base64')};}
await mkdir('dist/server',{recursive:true});
await writeFile('dist/server/index.js','const siteAssets='+JSON.stringify(assets)+';\n'+await readFile('worker/index.mjs','utf8'));
console.log('Standalone Worker built with invite and private organizer interface.');
