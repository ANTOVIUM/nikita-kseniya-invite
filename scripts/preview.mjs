import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {readdir} from 'node:fs/promises';
import worker from '../dist/server/index.js';

const database=new DatabaseSync(':memory:');
for(const file of (await readdir(new URL('../drizzle/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort())database.exec(await readFile(new URL('../drizzle/'+file,import.meta.url),'utf8'));
const DB={prepare(sql){let values=[];const statement=database.prepare(sql);return {bind(...args){values=args;return this;},async first(){return statement.get(...values)||null;},async all(){return {results:statement.all(...values)};},async run(){return statement.run(...values);}};}};

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.mp3':'audio/mpeg','.txt':'text/plain; charset=utf-8'};
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://terminal.local').pathname);
    if(pathname.startsWith('/api/')||pathname.endsWith('.mp3')){
      const chunks=[];for await(const chunk of request){chunks.push(chunk);if(chunks.reduce((n,c)=>n+c.length,0)>10000){response.writeHead(413).end();return;}}
      const body=Buffer.concat(chunks);
      const input=new Request('http://terminal.local:4173'+request.url,{method:request.method,headers:request.headers,body:['GET','HEAD'].includes(request.method)?undefined:body});
      const output=await worker.fetch(input,{DB,ORGANIZER_KEY:'preview-organizer-key-not-production'},{waitUntil(promise){promise.catch(()=>{});}});
      response.writeHead(output.status,Object.fromEntries(output.headers)).end(Buffer.from(await output.arrayBuffer()));return;
    }
    const route=pathname==='/organizers'?'/organizers.html':pathname;
    const target = route === '/__qa' ? fileURLToPath(new URL('../tests/responsive.html',import.meta.url)) : path.resolve(root, '.' + (route === '/' ? '/index.html' : route));
    if (pathname !== '/__qa' && !target.startsWith(root)) { response.writeHead(403).end(); return; }
    const data = await readFile(target);
    response.writeHead(200, {'Content-Type':mime[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store'}).end(data);
  } catch { response.writeHead(404).end('Not found'); }
});
server.listen(4173,'0.0.0.0',()=>console.log('Local invitation preview ready on port 4173'));
