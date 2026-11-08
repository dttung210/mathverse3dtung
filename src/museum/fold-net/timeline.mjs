/** Finite teaching timeline: flat net -> real fold -> completed result, no fake endless loop. */
export class FoldNetTimeline {
 constructor(model,{duration=6.5,speed=1,autoplay=false}={}){
  if(!model||typeof model.setProgress!=='function')throw Error('FoldNetTimeline requires a model');
  this.model=model;
  this.duration=Math.max(0.1,Number(duration)||6.5);
  this.speed=Math.max(0.1,Math.min(3,Number(speed)||1));
  this.direction=1;
  this.playing=false;
  this.position=0;
  this.model.setProgress(0);
  if(autoplay)this.enter();
 }
 get progress(){return this.position;}
 enter(){this.seek(0);this.direction=1;this.playing=true;return this;}
 play(direction=1){this.direction=direction<0?-1:1;
  if(this.direction===1&&this.position>=1-1e-9)this.seek(0);
  if(this.direction===-1&&this.position<=1e-9)this.seek(1);
  this.playing=true;return this;}
 pause(){this.playing=false;return this;}
 seek(t){this.position=Math.min(1,Math.max(0,Number.isFinite(Number(t))?Number(t):0));this.model.setProgress(this.position);return this;}
 step(direction=1){this.pause();const checkpoints=[0,0.2,0.45,0.7,0.9,1];
  const x=this.position;
  if(direction>=0)this.seek(checkpoints.find(t=>t>x+1e-6)??1);
  else this.seek([...checkpoints].reverse().find(t=>t<x-1e-6)??0);
  return this;}
 tick(deltaSeconds){
  if(!this.playing)return false;
  const dt=Math.max(0,Math.min(0.1,Number(deltaSeconds)||0));
  this.seek(this.position+this.direction*this.speed*dt/this.duration);
  if(this.position>=1||this.position<=0)this.pause();
  return true;
 }
 reset(){this.pause();this.seek(0);return this;}
 setSpeed(speed){this.speed=Math.max(0.1,Math.min(3,Number(speed)||1));return this;}
}
