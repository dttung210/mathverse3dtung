/** A linked exact section diagram; the source 3D model owns the cut position. */
export class Section2DViewer {
  constructor(model,source){this.model=model;this.source=source;this._resize=this._resize.bind(this);}
  mount(container){
    this.container=container;container.replaceChildren();
    this.canvas=document.createElement('canvas');
    Object.assign(this.canvas.style,{height:'100%',width:'100%',display:'block'});
    container.append(this.canvas);this.ctx=this.canvas.getContext('2d');
    window.addEventListener('resize',this._resize);this._resize();
  }
  _resize(){if(!this.canvas)return;const r=this.container.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
    this.w=Math.max(200,r.width);this.h=Math.max(200,r.height);
    this.canvas.width=Math.round(this.w*dpr);this.canvas.height=Math.round(this.h*dpr);
    this.ctx.setTransform(dpr,0,0,dpr,0,0);this.render();}
  render(){
    if(!this.ctx)return;
    const c=this.ctx,w=this.w,h=this.h,t=this.model.type,p=this.source.params||this.model.params||{},pct=this.source.crossSectionPct??50;
    c.clearRect(0,0,w,h);c.fillStyle='#f7fbff';c.fillRect(0,0,w,h);
    c.fillStyle='#214059';c.font='bold 14px system-ui';c.fillText('THIẾT DIỆN SONG SONG ĐÁY',18,28);
    let area=0,name='',side=0;
    c.strokeStyle='#da7a28';c.fillStyle='rgba(235,165,55,.33)';c.lineWidth=3;
    const cx=w/2,cy=h/2,scale=Math.min(w,h)*.42;
    c.beginPath();
    if(t==='squarePyramid'){
      const f=1-pct/100;side=p.a*f;area=side*side;name='HÌNH VUÔNG';
      const d=Math.min(scale,side*scale/Math.max(1,p.a)*1.4);c.rect(cx-d/2,cy-d/2,d,d);
    }else if(t==='cuboid'||t==='cube'){
      const a=p.a,b=t==='cube'?p.a:p.b;area=a*b;name=t==='cube'?'HÌNH VUÔNG':'HÌNH CHỮ NHẬT';
      const d=Math.min(scale*1.5,scale*1.4*a/Math.max(a,b)),e=Math.min(scale*1.5,scale*1.4*b/Math.max(a,b));
      c.rect(cx-d/2,cy-e/2,d,e);
    }else if(t==='sphereSection'){
      const r=Math.sqrt(Math.max(0,p.r*p.r-p.d*p.d));area=Math.PI*r*r;name='HÌNH TRÒN';
      c.arc(cx,cy,Math.max(0.1,r/(p.r||1)*scale*.62),0,Math.PI*2);
    }else{c.font='14px system-ui';c.fillText('Mô hình không có mặt cắt tự động.',18,cy);return;}
    c.fill();c.stroke();c.textAlign='center';c.fillStyle='#2b4d60';c.font='bold 14px system-ui';c.fillText(name,cx,h-57);
    c.font='13px system-ui';c.fillText(`S = ${Math.round(area*1000)/1000} đv²`,cx,h-33);c.textAlign='left';
  }
  dispose(){window.removeEventListener('resize',this._resize);this.container?.replaceChildren();this.canvas=null;this.ctx=null;}
}
