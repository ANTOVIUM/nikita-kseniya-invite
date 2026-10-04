(()=>{'use strict';const $=s=>document.querySelector(s);let key='';
async function load(){
 $('#status').textContent='Загружаем ответы…';
 try{const r=await fetch('/api/responses',{headers:{Authorization:'Bearer '+key},cache:'no-store'}),data=await r.json();if(!r.ok)throw Error(data.error);$('#access').hidden=true;$('#results').hidden=false;$('#rows').replaceChildren();
  let yes=0,lodging=0;for(const item of data.rows){yes+=item.attendance==='yes';lodging+=item.lodging==='Да';const tr=document.createElement('tr');for(const value of [new Date(item.submitted_at).toLocaleString('ru-RU',{timeZone:'Asia/Yekaterinburg'}),item.name,item.attendance==='yes'?'Буду':'Не смогу',item.drinks,item.food,item.lodging]){const td=document.createElement('td');td.textContent=value;td.style.cssText='padding:14px 12px;border-bottom:1px solid #c9c9bb;vertical-align:top;font-size:14px';tr.append(td);}$('#rows').append(tr);}
  $('#summary').textContent=`Ответов: ${data.rows.length}. Будут: ${yes}. Потребуется ночевка: ${lodging}.`;$('#status').textContent=data.rows.length?'Ответы актуальны.':'Пока никто не ответил. Первые анкеты появятся здесь.';
 }catch(error){$('#status').textContent=error.message||'Не удалось загрузить ответы.';}
}
$('#access').addEventListener('submit',e=>{e.preventDefault();key=e.target.elements.key.value.trim();e.target.elements.key.value='';load();});$('#refresh').addEventListener('click',load);
$('#export').addEventListener('click',async()=>{try{const r=await fetch('/api/responses.csv',{headers:{Authorization:'Bearer '+key}});if(!r.ok)throw Error('Не удалось скачать таблицу.');const url=URL.createObjectURL(await r.blob()),a=document.createElement('a');a.href=url;a.download='wedding-responses.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(error){$('#status').textContent=error.message;}});
$('#logout').addEventListener('click',()=>{key='';$('#rows').replaceChildren();$('#access').hidden=false;$('#results').hidden=true;$('#status').textContent='Доступ закрыт.';});
const secret=new URLSearchParams(location.hash.slice(1)).get('key');if(secret){key=secret;history.replaceState(null,'',location.pathname);load();}
})();
