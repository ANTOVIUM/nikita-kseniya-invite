(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  document.documentElement.classList.add('enhanced');
  let toastTimer;
  function toast(message) { clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').hidden=false; toastTimer=setTimeout(()=>$('#toast').hidden=true,3500); }
  function softSwap(element) {
    if (!reducedMotion.matches && element?.animate) element.animate([{opacity:0,transform:'translateY(9px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.2,.65,.3,1)'});
  }
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const calendar = $('#calendar-grid');
  for (let day = 0; day < 35; day++) { const number = day - 2; const cell = document.createElement(number===24?'button':'span'); if (number > 0 && number <= 31) { cell.textContent = number; if (number === 24) { cell.type='button'; cell.className = 'selected'; cell.setAttribute('aria-label','24 июля: добавить в календарь'); cell.addEventListener('click',()=>$('#calendar-link').click()); } } calendar.append(cell); }
  const weddingDate = new Date('2027-07-24T15:30:00+05:00').getTime();
  function tick() {
    const remaining=Math.max(0,weddingDate-Date.now());
    const values=[Math.floor(remaining/86400000),Math.floor(remaining/3600000)%24,Math.floor(remaining/60000)%60,Math.floor(remaining/1000)%60];
    ['days','hours','minutes','seconds'].forEach((id,index)=>{
      const element=$('#'+id),value=index?String(values[index]).padStart(2,'0'):String(values[index]);
      if(element.textContent===value)return;
      const initialized=element.textContent!=='—';element.textContent=value;
      if(initialized&&!reducedMotion.matches&&element.animate)element.animate([{transform:'translateY(7px)',opacity:.3},{transform:'translateY(0)',opacity:1}],{duration:400,easing:'cubic-bezier(.16,1,.3,1)'});
    });
  }
  tick(); setInterval(tick, 1000);
  const progress = $('#reading-progress');
  let ticking = false;
  function updateProgress() { const max = document.documentElement.scrollHeight - window.innerHeight; progress.style.width = (max > 0 ? Math.min(100, Math.max(0, window.scrollY / max * 100)) : 0) + '%'; ticking = false; }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); } }, { passive:true });
  updateProgress();
  document.querySelectorAll('a[href^="#"]').forEach(link=>{if(link.id==='calendar-link')return;link.addEventListener('click',event=>{const target=document.getElementById(link.hash.slice(1));if(!target)return;event.preventDefault();history.replaceState(null,'',link.hash);target.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});});});
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), {threshold:0.06});
    document.querySelectorAll('main > section:not(.hero)').forEach(section => { section.classList.add('reveal'); observer.observe(section); });
  }
  const stages = [
    ['15:30','Сбор гостей и фуршет','Встречаемся, знакомимся и настраиваемся на вечер. Будет время спокойно обняться и поднять первый бокал.'],
    ['16:00','Выездная регистрация','Соберемся для нашей свадебной церемонии. Просим подойти к площадке к 16:00.'],
    ['17:00','Банкет','Время для ужина, теплых слов, музыки и долгого вечера в кругу близких.']
  ];
  document.querySelectorAll('.time-inline').forEach((description,i)=>description.textContent=stages[i][2]);
  $('#timeline-controls').addEventListener('click', e => { const button = e.target.closest('button[data-index]'); if (!button) return; const expanded=button.getAttribute('aria-expanded')!=='true'; document.querySelectorAll('.time').forEach(b => { const active=b===button&&expanded; b.classList.toggle('active',active); b.setAttribute('aria-pressed',String(active)); b.setAttribute('aria-expanded',String(active)); b.querySelector('.time-inline').hidden=!active; }); if(expanded)softSwap(button.querySelector('.time-inline')); });
  const palette = [
    ['Шалфей','#A7AD8C','Мягкий зеленый с приглушенным серым подтоном.','шампань · тауп · песочный'],
    ['Олива','#747A55','Глубокий природный зеленый, сдержанный и выразительный.','песочный · шампань · пыльная роза'],
    ['Мох','#4E5942','Темный зеленый для цельного вечернего образа.','шампань · тауп · дымчатый голубой'],
    ['Шампань','#D5C5A8','Светлый теплый тон с мягким сиянием.','олива · мох · серо-сиреневый'],
    ['Песочный','#C7B69D','Спокойный оттенок натурального камня.','шалфей · олива · дымчатый голубой'],
    ['Тауп','#A89B8B','Универсальный нейтральный оттенок между серым и коричневым.','шалфей · мох · пыльная роза'],
    ['Пыльная роза','#B98E90','Приглушенный розовый без лишней яркости.','олива · тауп · шампань'],
    ['Дымчатый голубой','#8699AA','Прохладный акцент с серым подтоном.','песочный · мох · шампань'],
    ['Серо-сиреневый','#AAA0B2','Мягкий прохладный оттенок для вечернего образа.','шампань · шалфей · тауп']
  ];
  function selectShade(i) { const p = palette[i]; $('#shade-title').textContent = p[0]; $('#shade-desc').textContent = p[2]; $('#shade-hex').textContent=p[1]; $('#shade-pairs').textContent = 'Попробуйте сочетать с этими оттенками:'; $('.shade-info').style.setProperty('--selected-shade',p[1]); $('#fabric-swatch').style.setProperty('--selected-shade',p[1]); $('#fabric-number').textContent=String(i+1).padStart(2,'0')+' / 09'; $('#combination-chips').replaceChildren(...p[3].split(' · ').map(name=>{const pair=palette.find(color=>color[0].toLocaleLowerCase('ru')===name);const chip=document.createElement('span');chip.textContent=pair[0];chip.style.setProperty('--chip',pair[1]);return chip;})); document.querySelectorAll('.swatch').forEach((b,n) => b.setAttribute('aria-pressed',n === i?'true':'false')); softSwap($('.shade-info')); }
  palette.forEach((p,i) => { const b = document.createElement('button'); b.type='button'; b.className='swatch'; b.style.setProperty('--shade',p[1]); b.setAttribute('aria-label',p[0]); b.setAttribute('aria-pressed',i===0?'true':'false'); b.innerHTML=`<span class="swatch-number">0${i+1}</span><span class="swatch-name">${i===8?'Серо-<br>сиреневый':p[0]}</span>`; b.addEventListener('click',() => selectShade(i)); $('#swatches').append(b); });
  selectShade(0);
  function download(name,blob) { const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); }
  async function exportCard(name,height,draw) { try { await document.fonts.ready; const c=document.createElement('canvas');c.width=1080;c.height=height;const x=c.getContext('2d');x.fillStyle='#f6f3ed';x.fillRect(0,0,c.width,c.height);draw(x);const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('Не удалось сформировать карточку.');download(name,blob);toast('Карточка готова. Сохраните ее на телефон.'); } catch {toast('Не удалось сохранить карточку. Попробуйте еще раз.');} }
  $('#save-palette').addEventListener('click',()=>exportCard('nikita-kseniya-palette.png',1480,x=>{x.fillStyle='#222b20';x.font='400 65px "Noto Serif Display", Georgia';x.fillText('Никита & Ксения',80,135);x.font='500 28px "Manrope", Arial';x.fillText('24 ИЮЛЯ 2027  /  ПАЛИТРА ДНЯ',82,200);palette.forEach((p,i)=>{const left=80+i%3*314,top=275+Math.floor(i/3)*337;x.fillStyle=p[1];x.fillRect(left,top,284,240);x.fillStyle='#222b20';x.font='500 25px "Manrope", Arial';x.fillText(p[0],left,top+280);x.font='22px "Manrope", Arial';x.fillText(p[1],left,top+314);});x.font='25px "Manrope", Arial';x.fillText('Просим оставить белый цвет для образа невесты.',80,1390);}));
  $('#save-memo').addEventListener('click',()=>exportCard('nikita-kseniya-guest-memo.png',1640,x=>{const text=(value,y,size=28,weight=400)=>{x.fillStyle='#222b20';x.font=`${weight} ${size}px "Manrope", Arial`;x.fillText(value,80,y);};x.fillStyle='#222b20';x.font='400 65px "Noto Serif Display", Georgia';x.fillText('Никита & Ксения',80,130);text('24 ИЮЛЯ 2027 / СУББОТА',198,32,500);text('ПАМЯТКА ГОСТЯ',265,24,500);x.fillStyle='#283522';x.fillRect(80,310,920,2);text('15:30',380,48,600);text('Сбор гостей и фуршет',427,30);text('16:00–17:00',507,48,600);text('Выездная регистрация',554,30);text('17:00',634,48,600);text('Банкет',681,30);text('Ресторан «Эдельвейс»',797,40,600);text('Комплекс «Мандала»',845);text('Оренбургская область, г. Кувандык,',900);text('дер. Гумарово, ул. Садовая, 1А',944);text('ПРИРОДНАЯ ПАЛИТРА',1040,24,500);palette.forEach((p,i)=>{x.fillStyle=p[1];x.fillRect(80+i*103,1080,95,120);});text('Просим оставить белый цвет для образа невесты.',1260,27);text('Праздник пройдет в формате только для взрослых.',1380,28,500);text('Если потребуется ночевка,',1445,28);text('пожалуйста, сообщите об этом в анкете.',1488,28);}));
  const address='Оренбургская область, г. Кувандык, дер. Гумарово, ул. Садовая, 1А';
  $('#copy-address').addEventListener('click', async e=>{const button=e.currentTarget;try {try{await navigator.clipboard.writeText(address);}catch{const t=document.createElement('textarea');t.value=address;t.style.position='fixed';t.style.opacity='0';document.body.append(t);t.select();const copied=document.execCommand('copy');t.remove();if(!copied)throw Error('Copy unavailable');}button.textContent='Адрес скопирован ✓';setTimeout(()=>button.textContent='Скопировать адрес',2500);}catch{toast('Не удалось скопировать. Выделите адрес и сохраните его.');}});
  $('#calendar-link').addEventListener('click', e=>{e.preventDefault();const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nikita Ksenia//Wedding//RU','BEGIN:VEVENT','UID:nikita-kseniya-20270724@gumarovo','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART:20270724T103000Z','DTEND:20270724T190000Z','SUMMARY:Свадьба Никиты и Ксении','LOCATION:Ресторан Эдельвейс\\, дер. Гумарово\\, ул. Садовая\\, 1А','DESCRIPTION:Сбор гостей в 15:30. Регистрация в 16:00. Банкет в 17:00.','END:VEVENT','END:VCALENDAR'].join('\r\n')+'\r\n'; download('nikita-kseniya-24-07-2027.ics',new Blob([ics],{type:'text/calendar;charset=utf-8'}));});
  // A real instrumental tarantella from the USAF public-domain music collection.
  const audio=$('#wedding-music');
  const musicButton=$('#music-toggle');
  let musicBusy=false;
  audio.volume=.82;
  function syncMusic(){
    const playing=!audio.paused&&!audio.ended;
    musicButton.setAttribute('aria-pressed',String(playing));
    musicButton.dataset.audioState=playing?'playing':audio.readyState?'paused':'off';
    musicButton.dataset.duration=Number.isFinite(audio.duration)?audio.duration.toFixed(2):'';
    musicButton.setAttribute('aria-label',playing?'Поставить тарантеллу на паузу':'Включить итальянскую тарантеллу');
    musicButton.title=playing?'Пауза · Tarantella Napoletana':'Tarantella Napoletana · живой оркестр';
    $('#music-label').textContent=playing?'Пауза':'Музыка';
  }
  ['playing','pause','ended','loadedmetadata'].forEach(event=>audio.addEventListener(event,syncMusic));
  audio.addEventListener('error',()=>{syncMusic();toast('Не удалось загрузить музыку. Проверьте соединение и нажмите еще раз.');});
  musicButton.addEventListener('click',async()=>{
    if(musicBusy)return;
    if(!audio.paused){audio.pause();syncMusic();return;}
    musicBusy=true;musicButton.disabled=true;$('#music-label').textContent='Загрузка…';
    try{await audio.play();}
    catch{toast('Музыка не запустилась. Попробуйте нажать еще раз.');}
    finally{musicBusy=false;musicButton.disabled=false;syncMusic();}
  });
  const musicDialog=$('#music-dialog');
  $('#music-credits').addEventListener('click',()=>musicDialog.showModal());
  $('#close-music-dialog').addEventListener('click',()=>musicDialog.close());
  musicDialog.addEventListener('click',event=>{if(event.target===musicDialog){const rect=musicDialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)musicDialog.close();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.pause();});
  window.addEventListener('pagehide',()=>audio.pause());
  syncMusic();
  const state={step:0,name:'',attendance:'',drinks:[],food:'none',foodDetails:'',lodging:'',requestId:crypto.randomUUID?.() || String(Date.now())+'-'+String(Math.random()).slice(2)};
  const drinks=['Игристое','Белое вино','Красное вино','Крепкие напитки','Безалкогольные напитки','Пока не знаю'];
  const radio=(name,value,label,checked)=>`<label class="choice"><input type="radio" name="${name}" value="${esc(value)}" ${checked?'checked':''}><span>${esc(label)}</span></label>`;
  const checkbox=(name,value,checked)=>`<label class="choice"><input type="checkbox" name="${name}" value="${esc(value)}" ${checked?'checked':''}><span>${esc(value)}</span></label>`;
  const field=(name,label,value,optional=false,textarea=false)=>`<label class="field"><span>${esc(label)}${optional?' · необязательно':''}</span>${textarea?`<textarea name="${name}" maxlength="500">${esc(value)}</textarea>`:`<input name="${name}" type="text" maxlength="120" value="${esc(value)}" ${optional?'':'required'} autocomplete="${name==='guestName'?'name':'off'}">`}</label>`;
  function render(focus=false){const s=state.step; $('#step-label').textContent=s<3?`0${s+1} / 03`:s===3?'Проверка ответов':'Ответ принят';$('#progress-fill').style.width=`${Math.min(s+1,3)/3*100}%`;$('#form-error').hidden=true;$('#back').hidden=s===0||s===4;$('#next').hidden=s===4;let html='';
    if(s===0) html=`<h3>Давайте знакомиться</h3>${field('guestName','Имя и фамилия',state.name)}<div class="form-section"><span class="question-label">Сможете ли вы быть с нами?</span><div class="choice-grid">${radio('attendance','yes','С радостью буду',state.attendance==='yes')}${radio('attendance','no','К сожалению, не смогу',state.attendance==='no')}</div></div>`;
    if(s===1) html=`<h3>Ваши предпочтения</h3><div class="form-section"><span class="question-label">Какие напитки вы предпочитаете? Можно выбрать несколько.</span><div class="choice-grid">${drinks.map(d=>checkbox('drinks',d,state.drinks.includes(d))).join('')}</div></div><div class="form-section"><span class="question-label">Особенности питания</span><div class="choice-grid">${radio('food','none','Особых ограничений нет',state.food==='none')}${radio('food','special','Есть особенности питания / аллергии',state.food==='special')}</div><div id="food-wrap" ${state.food==='special'?'':'hidden'}>${field('foodDetails','Расскажите об особенностях питания',state.foodDetails,false,true)}</div></div>`;
    if(s===2) html=`<h3>После праздника</h3><div class="form-section"><span class="question-label">Потребуется ли вам проживание после праздника?</span><div class="choice-grid">${radio('lodging','Да','Да',state.lodging==='Да')}${radio('lodging','Нет','Нет',state.lodging==='Нет')}</div></div>`;
    if(s===3){const entries=[['Имя',state.name],['Присутствие',state.attendance==='yes'?'Буду':'Не смогу']];if(state.attendance==='yes')entries.push(['Напитки',state.drinks.join(', ')],['Питание',state.food==='none'?'Без ограничений':state.foodDetails],['Проживание',state.lodging]);html=`<h3>Все верно?</h3><p>Проверьте ответы перед отправкой.</p><dl class="review-list">${entries.map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`;}
    if(s===4)html=`<div class="success"><h3>Спасибо, ${esc(state.name.split(/\s+/)[0])}!</h3><p>Ваш ответ сохранен. ${state.attendance==='yes'?'Будем рады видеть вас 24 июля.':'Спасибо, что сообщили нам заранее.'}</p></div>`;
    $('#step-content').innerHTML=html;$('#next').textContent=s===3?'Отправить ответ':'Продолжить'; softSwap($('#step-content'));
    if(focus){const heading=$('#step-content h3');heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'instant':'smooth'});}
  }
  function readStep(){const f=$('#rsvp-form');if(state.step===0){state.name=f.elements.guestName.value.trim().replace(/\s+/g,' ');state.attendance=f.querySelector('input[name=attendance]:checked')?.value||'';if(state.name.length<3 || !/\p{L}/u.test(state.name))return 'Укажите имя и фамилию.';if(!state.attendance)return 'Выберите, сможете ли присутствовать.';}
    if(state.step===1){state.drinks=[...f.querySelectorAll('input[name=drinks]:checked')].map(i=>i.value);state.food=f.querySelector('input[name=food]:checked')?.value||'none';state.foodDetails=f.elements.foodDetails?.value.trim()||'';if(state.drinks.length===0)return 'Выберите хотя бы один вариант напитков.';if(state.food==='special'&&!state.foodDetails)return 'Укажите особенности питания или аллергии.';}
    if(state.step===2){state.lodging=f.querySelector('input[name=lodging]:checked')?.value||'';if(!state.lodging)return 'Выберите ответ о проживании.';}
    return '';
  }
  $('#rsvp-form').addEventListener('change',e=>{if(e.target.name==='drinks'){const list=[...document.querySelectorAll('input[name=drinks]:checked')];if(e.target.checked&&e.target.value==='Пока не знаю')list.forEach(i=>{if(i!==e.target)i.checked=false});else if(e.target.checked)document.querySelector('input[name=drinks][value="Пока не знаю"]').checked=false;}if(e.target.name==='food')$('#food-wrap').hidden=e.target.value!=='special';});
  $('#back').addEventListener('click',()=>{if(state.step===3&&state.attendance==='no')state.step=0;else state.step=Math.max(0,state.step-1);render(true)});
  $('#next').addEventListener('click',async()=>{if($('#next').disabled)return;const error=readStep();if(error){$('#form-error').textContent=error;$('#form-error').hidden=false;return;}if(state.step===3){await send();return;}if(state.step===0&&state.attendance==='no')state.step=3;else state.step++;render(true);});
  async function send(){const button=$('#next');button.disabled=true;$('#back').disabled=true;button.textContent='Отправляем…';$('#form-error').hidden=true;const payload={requestId:state.requestId,name:state.name,attendance:state.attendance,drinks:state.attendance==='yes'?state.drinks.join(', '):'',food:state.attendance==='yes'?(state.food==='special'?state.foodDetails:'Без ограничений'):'',lodging:state.attendance==='yes'?state.lodging:'',website:$('#rsvp-form').elements.website.value};
    try { if(typeof google!=='undefined' && google.script?.run){await new Promise((resolve,reject)=>google.script.run.withSuccessHandler(resolve).withFailureHandler(reject).saveRsvp(payload));}
      else {const endpoint=window.RSVP_ENDPOINT||(location.protocol==='file:'?'https://nikita-kseniya-24072027.alyshagf.chatgpt.site/api/rsvp':'/api/rsvp');const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(15000)});const result=await response.json();if(!response.ok||!result.ok)throw Error(result.error||'Не удалось сохранить ответ.');}state.step=4;render(true);
    }catch(e){$('#form-error').textContent=e.name==='TimeoutError'?'Не удалось дождаться подтверждения. Повторите отправку: второй ответ не появится.':e.message||'Не удалось отправить ответ. Проверьте соединение и повторите попытку.';$('#form-error').hidden=false;button.disabled=false;button.textContent='Повторить отправку';}finally{$('#back').disabled=false;}
  }
  render();
  // Progressive enhancement: without JavaScript the invitation remains readable.
  const envelope = $('#envelope-screen');
  const invite = $('#invite-content');
  const openButton = $('#open-envelope');
  const envelopeVisual=$('.envelope-visual');
  let opening = false;
  let lightFrame=0,lightPoint;
  function moveEnvelopeLight(event){
    if(opening||reducedMotion.matches)return;
    const rect=openButton.getBoundingClientRect();
    lightPoint={x:Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))};
    if(lightFrame)return;
    lightFrame=requestAnimationFrame(()=>{lightFrame=0;if(opening)return;envelopeVisual.style.setProperty('--light-x',lightPoint.x*100+'%');envelopeVisual.style.setProperty('--light-y',lightPoint.y*100+'%');envelopeVisual.style.setProperty('--tilt-x',(lightPoint.y-.5)*-5+'deg');envelopeVisual.style.setProperty('--tilt-y',(lightPoint.x-.5)*7+'deg');});
  }
  function resetEnvelopeLight(){envelopeVisual.style.setProperty('--tilt-x','0deg');envelopeVisual.style.setProperty('--tilt-y','0deg');}
  openButton.addEventListener('pointermove',moveEnvelopeLight,{passive:true});
  openButton.addEventListener('pointerdown',moveEnvelopeLight,{passive:true});
  openButton.addEventListener('pointerleave',resetEnvelopeLight,{passive:true});
  function revealInvitation() {
    if (opening) return;
    opening = true;
    resetEnvelopeLight();
    openButton.setAttribute('aria-expanded','true');
    openButton.disabled = true;
    $('#envelope-hint').textContent = 'Приглашение открывается…';
    envelope.classList.add('is-opening');
    if(!reducedMotion.matches){setTimeout(()=>envelope.classList.add('is-unlatched'),750);setTimeout(()=>envelope.classList.add('is-lifting'),810);}
    const reveal = () => {
      invite.hidden = false;
      invite.inert = false;
      envelope.hidden = true;
      document.body.classList.remove('is-sealed');
      window.scrollTo({top:0,behavior:'instant'});
    };
    const finishFocus=()=>{
        invite.classList.add('invitation-open');
        const heading = $('#hero-title');
        heading.setAttribute('tabindex','-1');
        heading.focus({preventScroll:true});
        updateProgress();
    };
    const finish = () => {
      if(!reducedMotion.matches&&typeof document.startViewTransition==='function'){
        document.documentElement.classList.add('paper-transition');
        invite.classList.add('shared-open');
        try {
          const transition=document.startViewTransition(reveal);
          const safeguard=setTimeout(()=>{if(invite.hidden){transition.skipTransition?.();reveal();envelope.dataset.transition='fallback';finishFocus();}},1600);
          transition.ready.then(()=>{clearTimeout(safeguard);envelope.dataset.transition='running';envelope.dataset.transitionReady='true';}).catch(()=>{envelope.dataset.transition='fallback';envelope.dataset.transitionReady='false';});
          transition.finished.catch(()=>{}).finally(()=>{clearTimeout(safeguard);document.documentElement.classList.remove('paper-transition');envelope.dataset.transition='complete';finishFocus();});
          return;
        }catch{document.documentElement.classList.remove('paper-transition');}
      }
      envelope.dataset.transition='fallback';
      envelope.classList.add('is-exiting');
      setTimeout(()=>{reveal();finishFocus();},reducedMotion.matches?0:350);
    };
    setTimeout(finish,reducedMotion.matches ? 0 : 2550);
  }
  openButton.addEventListener('click',revealInvitation);
  $('#replay-envelope').addEventListener('click',()=>{opening=false;delete envelope.dataset.transition;delete envelope.dataset.transitionReady;openButton.disabled=false;openButton.setAttribute('aria-expanded','false');envelope.classList.remove('is-opening','is-unlatched','is-lifting','is-exiting');envelope.hidden=false;invite.hidden=true;invite.inert=true;invite.classList.remove('invitation-open','shared-open');document.body.classList.add('is-sealed');$('#envelope-hint').textContent='Нажмите на конверт';window.scrollTo({top:0,behavior:'instant'});openButton.focus({preventScroll:true});});
  // Arrow keys move through colors without changing the normal Tab order.
  $('#swatches').addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(e.key))return;
    const buttons=[...$('#swatches').querySelectorAll('button')],current=buttons.indexOf(e.target);
    if(current<0)return;e.preventDefault();
    const offset=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:e.key==='ArrowDown'?3:-3;
    const next=e.key==='Home'?0:e.key==='End'?8:(current+offset+9)%9;
    buttons[next].focus();buttons[next].click();
  });
  // Deep links remain usable without replaying the opening sequence.
  if (!location.hash || location.hash === '#top') {
    invite.hidden = true;
    invite.inert = true;
    envelope.hidden = false;
    document.body.classList.add('is-sealed');
  }
  $('#rsvp-form').addEventListener('submit',e=>{e.preventDefault();if(!$('#next').disabled&&!$('#next').hidden)$('#next').click();});
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries=>entries.forEach(entry=>{
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.topbar nav a').forEach(link=>{
        if(link.hash === '#'+entry.target.id) link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }),{rootMargin:'-18% 0px -58% 0px',threshold:0});
    document.querySelectorAll('#program,#place,#dress,#rsvp').forEach(section=>navObserver.observe(section));
  }
})();
