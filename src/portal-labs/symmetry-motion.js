/** Mathematical orthographic folding and 180-degree central rotations. */
const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||0));
export const symmetryFold=(points,progress)=>points.map(([x,y])=>[x*Math.cos(Math.PI*clamp(progress,0,1)),y]);
export const rotateAround=(points,angle,center=[0,0])=>points.map(([x,y])=>{
 const dx=x-center[0],dy=y-center[1],c=Math.cos(angle),s=Math.sin(angle);
 return [center[0]+dx*c-dy*s,center[1]+dx*s+dy*c];
});
export const opposite=(points)=>rotateAround(points,Math.PI);
export const centralCoincidence=(shape,progress)=>rotateAround(opposite(shape),Math.PI*clamp(progress,0,1));
export class SymmetryMotionCanvas{
 constructor(model,onChange=()=>{}){this.model=model;this.onChange=onChange;this.motions=this._motions();this.axis=this.motions[0]==='axis';
  this.progress=0;this.length=clamp(model.params?.a||5,1,10);this.height=clamp(model.params?.h||model.params?.b||4,1,10);
  this.canvas=null;this.drag=false;this.playing=false;this.raf=0;this.speed=1;this.last=0;}
 _motions(){
  const t=this.model.type;
  if(t==='symmetryAxis')return ['axis'];
  if(t==='symmetryCenter'||t==='parallelogram')return ['center'];
  if(t==='polygon'){return Number(this.model.params?.n||6)%2===0?['axis','center']:['axis'];}
  return ['axis','center'];
 }
 setMode(mode){if(!this.motions.includes(mode))return;this.pause();this.axis=mode==='axis';this.progress=0;this.render();this.onChange({progress:0,mode});}
 mount(node){this.node=node;this.canvas=document.createElement('canvas');this.canvas.className='mv14-symmetry-canvas';
  this.canvas.setAttribute('aria-label',this.axis?'Mo phong gap doi xung qua truc':'Mo phong quay doi xung qua tam');node.replaceChildren(this.canvas);
  this.ctx=this.canvas.getContext('2d');
  this._down=e=>{this.pause();this.drag=true;this.canvas.setPointerCapture?.(e.pointerId);this._changeFromPointer(e);};
  this._move=e=>{if(this.drag)this._changeFromPointer(e);};
  this._up=()=>{if(this.drag){this.drag=false;this.onChange({committed:true,length:this.length,height:this.height});}};
  this.canvas.addEventListener('pointerdown',this._down);this.canvas.addEventListener('pointermove',this._move);this.canvas.addEventListener('pointerup',this._up);
  this.canvas.addEventListener('pointercancel',this._up);
  this.resizer=new ResizeObserver(()=>this.resize());this.resizer.observe(node);this.resize();}
 _shape(){const w=this.length*.39,h=this.height*.45,t=this.model.type;
  if(t==='rhombus')return this.axis?[[0,-h],[-w,0],[0,h]]:[[w*.25,0],[w*.5,h*.9],[w*1.3,0],[w*.6,-h*.9]];
  if(t==='rectangleSquare')return this.axis?[[0,-h],[-w,-h],[-w,h],[0,h]]:[[w*.25,-h],[w*1.2,-h],[w*1.2,h],[w*.25,h]];
  if(t==='polygon')return this.axis?[[0,-h],[-w*.8,-h*.7],[-w,h*.1],[-w*.4,h],[0,h]]:[[w*.23,-h],[w*.9,-h*.6],[w*1.1,h*.5],[w*.3,h]];
  return this.axis?[[0,-h],[-w,-h*.75],[-w*.9,h*.2],[-w*.42,h],[0,h]]:[[w*.26,-h*.67],[w,-h*.5],[w*.79,h*.53],[w*.44,h]];
 }
 _changeFromPointer(e){const b=this.canvas.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;
  const w=Math.max(1,Math.abs(x-b.width*.5)/Math.max(10,this.scale))/.39;
  const h=Math.max(1,Math.abs(y-b.height*.5)/Math.max(10,this.scale))/.45;
  this.length=clamp(w,1,10);this.height=clamp(h,1,10);this.render();this.onChange({length:this.length,height:this.height});}
 resize(){if(!this.node||!this.ctx)return;const r=this.node.getBoundingClientRect();this.width=Math.max(300,r.width);this.heightPx=Math.max(230,r.height);
  const dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*dpr);this.canvas.height=Math.round(this.heightPx*dpr);
  this.ctx.setTransform(dpr,0,0,dpr,0,0);this.scale=Math.min(this.width/16,this.heightPx/11);this.render();}
 setProgress(value){this.progress=clamp(value,0,1);this.render();this.onChange({progress:this.progress});}
 setDimensions(a,h){this.length=clamp(a,1,10);this.height=clamp(h,1,10);this.render();}
 play(speed=1){if(this.playing)return;this.speed=clamp(speed,.25,3);this.playing=true;this.last=0;
  const step=now=>{if(!this.playing)return;const dt=this.last?Math.min(.06,(now-this.last)/1000):0;this.last=now;
   this.progress=Math.min(1,this.progress+dt*this.speed/2.8);this.render();this.onChange({progress:this.progress});
   if(this.progress>=1){this.pause();return;}this.raf=requestAnimationFrame(step);};
  this.raf=requestAnimationFrame(step);}
 pause(){this.playing=false;cancelAnimationFrame(this.raf);this.raf=0;this.last=0;}
 reset(){this.pause();this.setProgress(0);}
 render(){const c=this.ctx;if(!c)return;const w=this.width,h=this.heightPx,sc=this.scale;
  c.clearRect(0,0,w,h);c.fillStyle='#f8fcff';c.fillRect(0,0,w,h);
  c.save();c.translate(w/2,h/2);c.lineWidth=1;c.strokeStyle='#e4ecf3';for(let x=-w/2;x<w/2;x+=sc){c.beginPath();c.moveTo(x,-h/2);c.lineTo(x,h/2);c.stroke();}
  for(let y=-h/2;y<h/2;y+=sc){c.beginPath();c.moveTo(-w/2,y);c.lineTo(w/2,y);c.stroke();}
  c.scale(sc,-sc);c.lineWidth=2.5/sc;
  const draw=(pts,fill,stroke,dashed=false)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.strokeStyle=stroke;c.setLineDash(dashed?[.14,.08]:[]);c.fill();c.stroke();c.setLineDash([]);};
  const original=this._shape();if(this.axis){
    draw(original,'rgba(15,166,154,.24)','#087e82');
    const mobile=original.map(([x,y])=>[-x,y]);
    draw(symmetryFold(mobile,this.progress),'rgba(244,157,59,.27)','#dd8a23');
    c.beginPath();c.moveTo(0,-5);c.lineTo(0,5);c.strokeStyle='#536faa';c.setLineDash([.16,.1]);c.stroke();c.setLineDash([]);
  }else{
    draw(original,'rgba(14,168,148,.25)','#087e82');
    draw(centralCoincidence(original,this.progress),'rgba(234,150,55,.26)','#ca7d20');
    c.beginPath();c.arc(0,0,.12,0,Math.PI*2);c.fillStyle='#cf5272';c.fill();
  }
  c.restore();c.fillStyle='#244a5d';c.font='600 13px system-ui';
  c.fillText(this.axis?`Gap qua truc: ${Math.round(this.progress*180)}\u00b0`:`Quay quanh tam O: ${Math.round(this.progress*180)}\u00b0`,18,28);
  c.font='12px system-ui';c.fillText('K\u00e9o tr\u00ean b\u1ea3ng \u0111\u1ec3 thay \u0111\u1ed5i k\u00edch th\u01b0\u1edbc',18,h-16);
 }
 dispose(){this.pause();this.resizer?.disconnect();this.canvas?.removeEventListener('pointerdown',this._down);this.canvas?.removeEventListener('pointermove',this._move);
  this.canvas?.removeEventListener('pointerup',this._up);this.canvas?.removeEventListener('pointercancel',this._up);this.node?.replaceChildren();}
}
