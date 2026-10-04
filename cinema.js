/* Animated optical light only: portrait pixels and geometry remain untouched. */
(() => {
  'use strict';
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes=[
    {canvas:document.getElementById('cinema-canvas'),target:document.querySelector('.hero')},
    {canvas:document.getElementById('gate-light'),target:document.getElementById('envelope-screen')}
  ];
  scenes.forEach(({canvas,target})=>{
    if(!canvas||!target)return;
    const ctx=canvas.getContext('2d',{alpha:true});
    if(!ctx){canvas.dataset.renderer='static';return;}
    canvas.dataset.renderer='canvas2d-light';
    canvas.classList.add('ready');
    let width=1,height=1,visible=false,frame=0,last=0,started=performance.now();
    let pointer={x:.72,y:.32},position={...pointer},frames=0;
    function size(){
      const r=target.getBoundingClientRect(),scale=Math.min(1.25,devicePixelRatio||1,1100/Math.max(1,r.width));
      width=Math.max(1,r.width);height=Math.max(1,r.height);
      canvas.width=Math.round(width*scale);canvas.height=Math.round(height*scale);
      ctx.setTransform(scale,0,0,scale,0,0);
    }
    function draw(now){
      frame=0;
      if(!visible||document.hidden||motion.matches)return;
      if(now-last<42){frame=requestAnimationFrame(draw);return;}
      last=now;
      const t=(now-started)/1000;
      position.x+=(pointer.x-position.x)*.055;position.y+=(pointer.y-position.y)*.055;
      ctx.clearRect(0,0,width,height);
      ctx.globalCompositeOperation='source-over';
      const x=width*(.65+Math.sin(t*.16)*.18+(position.x-.5)*.12);
      const y=height*(.27+Math.cos(t*.19)*.09+(position.y-.5)*.08);
      const glow=ctx.createRadialGradient(x,y,0,x,y,Math.max(width,height)*.8);
      glow.addColorStop(0,'rgba(207,220,157,.25)');
      glow.addColorStop(.28,'rgba(246,225,168,.22)');
      glow.addColorStop(.65,'rgba(255,254,244,.03)');
      glow.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
      for(let beam=0;beam<5;beam++){
        ctx.save();
        ctx.translate(x,y);ctx.rotate(-.48+Math.sin(t*.12+beam*.6)*.13);
        const shift=(beam-2)*width*.12;
        const light=ctx.createLinearGradient(shift,0,shift+width*.09,0);
        light.addColorStop(0,'rgba(255,252,229,0)');
        light.addColorStop(.46,'rgba(255,252,229,'+(beam===2?.19:.085)+')');
        light.addColorStop(1,'rgba(255,252,229,0)');
        ctx.fillStyle=light;ctx.fillRect(shift-width*.08,-height,width*.23,height*2);
        ctx.restore();
      }
      ctx.globalCompositeOperation='source-over';
      for(let ribbon=0;ribbon<3;ribbon++){
        const offset=ribbon*.2,phase=t*.25+offset;
        ctx.beginPath();
        ctx.moveTo(width*(.45+Math.sin(phase)*.22),-30);
        ctx.bezierCurveTo(width*(.15+offset),height*.38,width*(1.2-offset),height*.58,width*(.5+Math.cos(phase)*.3),height+30);
        ctx.strokeStyle='rgba(141,161,99,'+(.16-ribbon*.025)+')';
        ctx.lineWidth=2+ribbon*2;
        ctx.stroke();
      }
      if(++frames%12===0)canvas.dataset.frame=String(frames);
      target.style.setProperty('--scene-x',((position.x-.5)*10+Math.sin(t*.13)*6).toFixed(2)+'px');
      target.style.setProperty('--scene-y',((position.y-.5)*8).toFixed(2)+'px');
      frame=requestAnimationFrame(draw);
    }
    function wake(){if(visible&&!document.hidden&&!motion.matches&&!frame)frame=requestAnimationFrame(draw);}
    function halt(){if(frame)cancelAnimationFrame(frame);frame=0;if(motion.matches)ctx.clearRect(0,0,width,height);}
    const observer=new IntersectionObserver(entries=>{
      visible=entries.some(e=>e.isIntersecting);
      if(visible){size();wake();}else halt();
    },{threshold:.01});
    observer.observe(target);
    new ResizeObserver(()=>{size();wake();}).observe(target);
    target.addEventListener('pointermove',event=>{
      const r=target.getBoundingClientRect();
      pointer={x:Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))};
      wake();
    },{passive:true});
    target.addEventListener('pointerdown',event=>{
      const r=target.getBoundingClientRect();pointer={x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};wake();
    },{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?halt():wake());
    motion.addEventListener('change',()=>motion.matches?halt():wake());
    window.addEventListener('pagehide',halt);
  });
})();
