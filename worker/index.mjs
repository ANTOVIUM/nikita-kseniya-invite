/* siteAssets is injected by the deterministic build. No credentials are bundled. */
const drinkOptions=new Set(['Игристое','Белое вино','Красное вино','Крепкие напитки','Безалкогольные напитки','Пока не знаю']);
const json=(body,status=200,headers={})=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))).map(b=>b.toString(16).padStart(2,'0')).join('');
async function authorized(request,env){
  const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
  if(!env.ORGANIZER_KEY||token.length<20||token.length>256)return false;
  const a=await hash(token),b=await hash(env.ORGANIZER_KEY);let diff=0;
  for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
function clean(value,max){if(typeof value!=='string'||value.length>max)throw Error('Проверьте длину и формат ответа.');return value.trim().replace(/\u0000/g,'');}
function validate(data){
  if(!data||typeof data!=='object'||Array.isArray(data))throw Error('Некорректная анкета.');
  if(data.website)throw Error('Не удалось отправить анкету.');
  const requestId=clean(data.requestId,100),name=clean(data.name,120).replace(/\s+/g,' '),attendance=data.attendance;
  if(!/^[a-zA-Z0-9_-]{8,100}$/.test(requestId)||name.length<3||! /\p{L}/u.test(name)||!['yes','no'].includes(attendance))throw Error('Укажите имя, фамилию и ответ о присутствии.');
  if(attendance==='no')return {requestId,name,attendance,drinks:'',food:'',lodging:''};
  const drinks=clean(data.drinks,200),food=clean(data.food,500),lodging=data.lodging;
  const selected=drinks.split(', ').filter(Boolean);
  if(!selected.length||selected.some(d=>!drinkOptions.has(d))||new Set(selected).size!==selected.length||selected.includes('Пока не знаю')&&selected.length>1||!food||!['Да','Нет'].includes(lodging))throw Error('Проверьте напитки, питание и проживание.');
  return {requestId,name,attendance,drinks,food,lodging};
}
const headers={
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer',
  'Content-Security-Policy':"default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'self'; form-action 'self'",
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
};
function csvCell(value){let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
export default {
  async fetch(request,env,ctx){
    const url=new URL(request.url),route=url.pathname;
    try{
      if(route==='/api/rsvp'){
        const incoming=request.headers.get('Origin');
        if(incoming&&incoming!==url.origin&&incoming!=='null')return json({ok:false,error:'Откройте анкету на странице приглашения.'},403);
        const cors=incoming==='null'?{'Access-Control-Allow-Origin':'null','Vary':'Origin'}:{};
        if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type'}});
        if(request.method!=='POST')return json({ok:false,error:'Метод не поддерживается.'},405,{Allow:'POST',...cors});
        if(!env.DB)return json({ok:false,error:'Сервис ответов временно недоступен. Попробуйте позже.'},503,cors);
        if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({ok:false,error:'Некорректный формат анкеты.'},415,cors);
        const raw=await request.text();if(raw.length>5000)return json({ok:false,error:'Анкета слишком длинная.'},413,cors);
        let payload;try{payload=validate(JSON.parse(raw));}catch(error){return json({ok:false,error:error.message},400,cors);}
        const isTest=request.headers.get('X-Wedding-QA')==='1'&&await authorized(request,env)?1:0;
        const fingerprint=await hash(JSON.stringify(payload));
        const existing=await env.DB.prepare('SELECT payload_hash FROM responses WHERE request_id = ?').bind(payload.requestId).first();
        if(existing)return existing.payload_hash===fingerprint?json({ok:true,duplicate:true},200,cors):json({ok:false,error:'Ответ уже сохранен. Для нового ответа откройте приглашение заново.'},409,cors);
        if(!isTest){
          const hour=Math.floor(Date.now()/3600000),ip=request.headers.get('CF-Connecting-IP')||'preview';
          const key=await hash(`${env.ORGANIZER_KEY}:${hour}:${ip}`);
          const count=await env.DB.prepare('INSERT INTO submission_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,Date.now()+7200000).first();
          if(count.count>30)return json({ok:false,error:'Слишком много отправок. Попробуйте позже.'},429,cors);
          if(ctx?.waitUntil)ctx.waitUntil(env.DB.prepare('DELETE FROM submission_limits WHERE expires_at < ?').bind(Date.now()).run());
        }
        await env.DB.prepare('INSERT INTO responses (request_id,submitted_at,name,attendance,drinks,food,lodging,payload_hash,is_test) VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(payload.requestId,new Date().toISOString(),payload.name,payload.attendance,payload.drinks,payload.food,payload.lodging,fingerprint,isTest).run();
        const saved=await env.DB.prepare('SELECT payload_hash FROM responses WHERE request_id = ?').bind(payload.requestId).first();
        if(saved?.payload_hash!==fingerprint)return json({ok:false,error:'Ответ уже сохранен с другими данными.'},409,cors);
        return json({ok:true},200,cors);
      }
      if(route==='/api/responses'||route==='/api/responses.csv'){
        if(!await authorized(request,env))return json({ok:false,error:'Нужен код организатора.'},401);
        if(request.method!=='GET')return json({ok:false,error:'Метод не поддерживается.'},405);
        if(!env.DB)return json({ok:false,error:'Хранилище временно недоступно.'},503);
        const result=await env.DB.prepare('SELECT request_id,submitted_at,name,attendance,drinks,food,lodging,is_test FROM responses WHERE is_test = ? ORDER BY submitted_at DESC LIMIT 5000').bind(url.searchParams.get('qa')==='1'?1:0).all();
        if(route.endsWith('.csv')){
          const rows=[['Дата ответа','Имя','Присутствие','Напитки','Особенности питания','Проживание'],...result.results.map(r=>[r.submitted_at,r.name,r.attendance==='yes'?'Буду':'Не смогу',r.drinks,r.food,r.lodging])];
          return new Response('\ufeff'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n'),{headers:{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="wedding-responses.csv"','Cache-Control':'no-store',...headers}});
        }
        return json({ok:true,rows:result.results});
      }
      if(route.startsWith('/api/'))return json({ok:false,error:'Страница не найдена.'},404);
      if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
      const path=route==='/'?'/index.html':route==='/organizers'?'/organizers.html':route;
      const asset=siteAssets[path];if(!asset)return new Response('Страница не найдена',{status:404,headers});
      const bytes=Uint8Array.from(atob(asset.data),c=>c.charCodeAt(0));
      const assetHeaders={...headers,'Content-Type':asset.type,'Content-Length':String(bytes.length),'Cache-Control':/\.(webp|mp3|woff2)$/.test(path)?'public, max-age=86400':'no-cache'};
      if(asset.type==='audio/mpeg'){
        assetHeaders['Accept-Ranges']='bytes';
        const range=request.headers.get('Range');
        if(range&&request.method==='GET'){
          const match=/^bytes=(\d*)-(\d*)$/.exec(range);
          if(!match||!match[1]&&!match[2])return new Response(null,{status:416,headers:{...assetHeaders,'Content-Length':'0','Content-Range':`bytes */${bytes.length}`}});
          let start=match[1]?Number(match[1]):Math.max(0,bytes.length-Number(match[2]));
          let end=match[1]&&match[2]?Math.min(bytes.length-1,Number(match[2])):bytes.length-1;
          if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=bytes.length)return new Response(null,{status:416,headers:{...assetHeaders,'Content-Length':'0','Content-Range':`bytes */${bytes.length}`}});
          return new Response(bytes.slice(start,end+1),{status:206,headers:{...assetHeaders,'Content-Length':String(end-start+1),'Content-Range':`bytes ${start}-${end}/${bytes.length}`}});
        }
      }
      return new Response(request.method==='HEAD'?null:bytes,{headers:assetHeaders});
    }catch(error){console.error('Wedding service failed:',error?.name);return json({ok:false,error:'Сервис временно недоступен. Ваши ответы остались в анкете; попробуйте еще раз.'},503);}
  }
};
