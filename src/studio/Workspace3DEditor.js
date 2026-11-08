import * as THREE from '../../vendor/three.module.js';
import {readStoredPixelRatio} from '../museum/quality-controller.js';
import { createMathModel, disposeObject } from '../geometry.js';
import { clamp, constrainScale3D } from './workspace-document.js';
import { computeHorizontalSection } from './section-math.js';

const axisVector={x:new THREE.Vector3(1,0,0),y:new THREE.Vector3(0,1,0),z:new THREE.Vector3(0,0,1)};
const palette={x:0xe35d57,y:0x2aae7b,z:0x368fd0};
const unit=1.1;
export class Workspace3DEditor {
  constructor(document,callbacks={}){
    this.doc=document;this.cb=callbacks;this.tool='select';this.selection=[];
    this.cameraYaw=.6;this.cameraPitch=.35;this.distance=19;this.targetYaw=.6;this.targetPitch=.35;this.targetDistance=19;this.target=new THREE.Vector3(0,0,0);this.lastFrame=0;
    this.meshById=new Map();this.gizmos=[];this.raycaster=new THREE.Raycaster();this.pointer=new THREE.Vector2();this.drag=null;
    this._down=this._down.bind(this);this._move=this._move.bind(this);this._up=this._up.bind(this);this._wheel=this._wheel.bind(this);
    this._frame=this._frame.bind(this);this.lastInspectorAt=0;
  }
  mount(container){
    this.container=container;container.replaceChildren();
    this.canvas=document.createElement('canvas');this.canvas.className='mv11-canvas3d';this.canvas.setAttribute('aria-label','Khong gian dung hinh hoc 3D');container.append(this.canvas);
    try{this.renderer=new THREE.WebGLRenderer({canvas:this.canvas,antialias:true,preserveDrawingBuffer:true});}
    catch(error){const label=document.createElement('div');label.className='mv11-webgl-error';label.textContent='WebGL khong san sang. Hay bat tang toc phan cung trong Chrome/Edge.';container.append(label);this.cb.notify?.(error.message);return;}
    this.renderer.setPixelRatio(readStoredPixelRatio(devicePixelRatio||1));this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#f6fafc');
    this.camera=new THREE.PerspectiveCamera(48,1,.1,300);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0xabc4d7,2.3));
    const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(5,12,8);this.scene.add(sun);
    const floor=new THREE.GridHelper(40,40,0xa7c1cc,0xe0eaf1);floor.name='workspace-grid';this.scene.add(floor);
    this.scene.add(new THREE.AxesHelper(3));
    this.shapeRoot=new THREE.Group();this.scene.add(this.shapeRoot);
    this.gizmoGroup=new THREE.Group();this.scene.add(this.gizmoGroup);
    this._syncObjects();this._updateCamera();this.resize();
    this.canvas.addEventListener('pointerdown',this._down);this.canvas.addEventListener('wheel',this._wheel,{passive:false});
    window.addEventListener('pointermove',this._move);window.addEventListener('pointerup',this._up);
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);
    this.running=true;this.raf=requestAnimationFrame(this._frame);
  }
  _makeModel(item){
    let group=new THREE.Group();group.name=item.label;
    if(item.kind==='catalog3d'){
      try{const root=createMathModel(item.source,{faces:true,edges:true,labels:true,mode:'solid'});group.add(root);}
      catch(e){this.cb.notify?.('Model geometry unavailable: '+e.message);group.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshNormalMaterial()));}
      return group;
    }
    const material=new THREE.MeshStandardMaterial({color:item.color||'#168597',roughness:.44,metalness:.05,transparent:true,opacity:.87,side:THREE.DoubleSide});
    let geometry;
    switch(item.kind){
      case 'box':geometry=new THREE.BoxGeometry(2,2,2);break;
      case 'pyramid':geometry=new THREE.CylinderGeometry(0,1.6,2.7,4,1);geometry.rotateY(Math.PI/4);break;
      case 'prism':geometry=new THREE.CylinderGeometry(1.6,1.6,2.5,3,1);break;
      case 'cylinder':geometry=new THREE.CylinderGeometry(1.3,1.3,2.5,48);break;
      case 'cone':geometry=new THREE.ConeGeometry(1.4,3,48);break;
      case 'sphere':geometry=new THREE.SphereGeometry(1.4,32,22);break;
      default:geometry=new THREE.BoxGeometry(1,1,1);
    }
    geometry.computeBoundingBox();const floorLift=-(geometry.boundingBox?.min.y||0);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.y=floorLift;mesh.userData.itemId=item.id;group.add(mesh);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(geometry,17),new THREE.LineBasicMaterial({color:0x2c617c,transparent:true,opacity:.4}));
    outline.position.y=floorLift;outline.userData.itemId=item.id;group.add(outline);
    return group;
  }
  _applyTransform(item,group){
    group.position.set(item.x||0,item.y||0,item.z||0);group.rotation.y=(item.angle||0)*Math.PI/180;
    group.scale.set(item.sx||1,item.sy||1,item.sz||1);
    group.visible=!item.hidden;
  }
  _syncObjects(){
    if(!this.scene)return;
    for(const [id,group] of this.meshById)if(!this.doc.items.find(o=>o.id===id)){
      this.shapeRoot.remove(group);disposeObject(group);this.meshById.delete(id);
    }
    for(const item of this.doc.items){
      let group=this.meshById.get(item.id);
      if(!group){group=this._makeModel(item);group.userData.itemId=item.id;this.shapeRoot.add(group);this.meshById.set(item.id,group);}
      this._applyTransform(item,group);this._updateSection(item,group);
    }
    this._buildGizmo();
  }
  _updateSection(item,group){
    const old=group.getObjectByName('section-visual');
    const fraction=item.sectionFraction??.5;
    if(item.sectionEnabled&&old&&group.userData.sliceAt===fraction)return;
    if(old){group.remove(old);disposeObject(old);}group.userData.sliceAt=null;
    if(!item.sectionEnabled||item.hidden||item.kind==='catalog3d')return;
    const profile=computeHorizontalSection(item,item.sectionFraction??.5);if(!profile)return;
    const points=profile.vertices||Array.from({length:65},(_,i)=>{
      const a=i*Math.PI*2/65;return [profile.radius*Math.cos(a),profile.radius*Math.sin(a)];
    });
    if(points.length<3)return;
    const y=profile.y+.015,positions=[];
    for(let i=1;i<points.length-1;i++){
      positions.push(points[0][0],y,points[0][1],points[i][0],y,points[i][1],points[i+1][0],y,points[i+1][1]);
    }
    const visual=new THREE.Group();visual.name='section-visual';
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.computeVertexNormals();
    const fill=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xe9ac50,transparent:true,opacity:.46,side:THREE.DoubleSide,depthWrite:false}));
    visual.add(fill);const edgePoints=points.map(p=>new THREE.Vector3(p[0],y,p[1]));
    visual.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(edgePoints),new THREE.LineBasicMaterial({color:0xe48426,linewidth:2,depthTest:false})));
    group.add(visual);group.userData.sliceAt=fraction;
  }
  _buildGizmo(){
    if(!this.gizmoGroup)return;
    for(const child of [...this.gizmoGroup.children]){this.gizmoGroup.remove(child);disposeObject(child);}
    this.gizmos=[];
    if(this.selection.length!==1)return;
    const item=this.doc.items.find(x=>x.id===this.selection[0]);if(!item||item.locked||item.hidden)return;
    const origin=new THREE.Vector3(item.x,item.y,item.z),kind=this.tool;this.gizmoGroup.position.copy(origin);
    if(!['move','scale','rotate','select'].includes(kind))return;
    if(kind==='rotate'){
      const geo=new THREE.TorusGeometry(1.7,.04,8,80);
      const ring=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xef9b46,depthTest:false}));
      ring.rotation.x=Math.PI/2;ring.position.set(0,0,0);ring.renderOrder=900;
      ring.userData={gizmo:'rotate',axis:'y'};this.gizmoGroup.add(ring);this.gizmos.push(ring);return;
    }
    const axes=kind==='scale'?['x','y','z']:['x','y','z'];
    for(const axis of axes){
      const direction=axisVector[axis];const length=kind==='scale'?2.05:2.7;
      const endpoint=direction.clone().multiplyScalar(length);
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),endpoint]),new THREE.LineBasicMaterial({color:palette[axis],depthTest:false}));
      line.renderOrder=899;this.gizmoGroup.add(line);
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(.21,12,10),new THREE.MeshBasicMaterial({color:palette[axis],depthTest:false}));
      mesh.position.copy(endpoint);mesh.renderOrder=901;mesh.userData={gizmo:kind==='scale'?'scale':'move',axis};this.gizmoGroup.add(mesh);this.gizmos.push(mesh);
    }
  }
  setTool(tool){this.tool=tool;this._buildGizmo();}
  setSelection(ids){this.selection=[...new Set(ids)];this._buildGizmo();this.cb.select?.(this.selection);}
  add(item){this.doc.items.push(item);this._syncObjects();this.setSelection([item.id]);this.cb.change?.();}
  resize(){if(!this.renderer||!this.container)return;
    const rect=this.container.getBoundingClientRect();if(!rect.width||!rect.height)return;
    this.camera.aspect=rect.width/rect.height;this.camera.updateProjectionMatrix();this.renderer.setSize(rect.width,rect.height,false);}
  _updateCamera(){if(!this.camera)return;
    const cp=Math.cos(this.cameraPitch);this.camera.position.set(this.target.x+this.distance*cp*Math.sin(this.cameraYaw),this.target.y+this.distance*Math.sin(this.cameraPitch),this.target.z+this.distance*cp*Math.cos(this.cameraYaw));
    this.camera.lookAt(this.target);
  }
  _mouse(e){const rect=this.canvas.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.setFromCamera(this.pointer,this.camera);}
  _down(e){if(!this.renderer||e.button!==0)return;
    e.preventDefault();this.canvas.setPointerCapture?.(e.pointerId);this._mouse(e);
    const hit=this.raycaster.intersectObjects(this.gizmos,false)[0];
    if(hit && this.selection.length===1){
      const item=this.doc.items.find(v=>v.id===this.selection[0]);if(!item||item.locked)return;
      const def=hit.object.userData;
      if(def.gizmo==='rotate')this.drag={kind:'rotate',start:e.clientX,value:item.angle||0,itemId:item.id,moved:false};
      else{
        const start=new THREE.Vector3(item.x,item.y,item.z),unitWorld=axisVector[def.axis];
        const screenA=start.clone().project(this.camera),screenB=start.clone().add(unitWorld).project(this.camera);
        const rect=this.canvas.getBoundingClientRect();const vx=(screenB.x-screenA.x)*rect.width/2,vy=-(screenB.y-screenA.y)*rect.height/2,norm=Math.hypot(vx,vy);
        if(norm>4)this.drag={kind:'gizmo',action:def.gizmo,axis:def.axis,itemId:item.id,px:e.clientX,py:e.clientY,vx:vx/norm,vy:vy/norm,pixelsPerUnit:norm,initial:def.gizmo==='scale'?item['s'+def.axis]:item[def.axis],moved:false};
      }
      return;
    }
    const targets=[];for(const group of this.meshById.values())if(group.visible)targets.push(group);
    const intersections=this.raycaster.intersectObjects(targets,true);
    const source=intersections.map(hit=>{let node=hit.object;while(node&&!node.userData.itemId)node=node.parent;return node?.userData.itemId||null;}).find(Boolean);
    if(source){
      const item=this.doc.items.find(v=>v.id===source);if(!item)return;
      if(e.shiftKey){this.setSelection(this.selection.includes(source)?this.selection.filter(x=>x!==source):[...this.selection,source]);return;}
      if(!this.selection.includes(source))this.setSelection([source]);
      if(!item.locked && ['select','move'].includes(this.tool)){
        this.drag={kind:'object',id:item.id,prevWorld:this._rayFloor(),moved:false};
      }
    }else{
      if(!e.shiftKey)this.setSelection([]);
      this.drag={kind:'orbit',x:e.clientX,y:e.clientY,yaw:this.targetYaw,pitch:this.targetPitch};
    }
  }
  _rayFloor(){const ray=this.raycaster.ray;const plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
    return ray.intersectPlane(plane,new THREE.Vector3())||null;}
  _move(e){if(!this.drag||!this.renderer)return;
    if(this.drag.kind==='orbit'){
      this.targetYaw=this.drag.yaw-(e.clientX-this.drag.x)*.008;
      this.targetPitch=clamp(this.drag.pitch-(e.clientY-this.drag.y)*.007,-1.38,1.38);return;
    }
    const item=this.doc.items.find(v=>v.id===this.drag.itemId||v.id===this.drag.id);
    if(!item||item.locked)return;
    if(this.drag.kind==='rotate'){
      item.angle=((this.drag.value+(e.clientX-this.drag.start)*.7)%360+360)%360;this.drag.moved=true;
    }else if(this.drag.kind==='gizmo'){
      const {vx,vy,pixelsPerUnit,initial,axis,action}=this.drag;
      const amount=((e.clientX-this.drag.px)*vx+(e.clientY-this.drag.py)*vy)/pixelsPerUnit;
      const value=action==='scale'?clamp(initial+amount*.48,.15,10):clamp(initial+amount,-50,50);
      if(action==='move')item[axis]=Math.round(value*100)/100;
      else{
        constrainScale3D(item,axis,value);
      }
      this.drag.moved=true;
    }else if(this.drag.kind==='object'){
      this._mouse(e);const next=this._rayFloor();const before=this.drag.prevWorld;
      if(before&&next){
        const dx=next.x-before.x,dz=next.z-before.z;
        for(const oid of this.selection){const member=this.doc.items.find(x=>x.id===oid);
          if(member&&!member.locked){member.x=clamp(member.x+dx,-50,50);member.z=clamp(member.z+dz,-50,50);
            const mgroup=this.meshById.get(member.id);if(mgroup)this._applyTransform(member,mgroup);}
        }
        this.drag.prevWorld=next;this.drag.moved=true;
      }
    }
    const group=this.meshById.get(item.id);if(group)this._applyTransform(item,group);
    if(this.gizmoGroup)this.gizmoGroup.position.set(item.x,item.y,item.z);if(performance.now()-this.lastInspectorAt>70){this.lastInspectorAt=performance.now();this.cb.live?.();}
  }
  _up(){if(!this.drag)return;const changed=this.drag.moved;this.drag=null;if(changed){this._buildGizmo();this.cb.change?.();}}
  _wheel(e){e.preventDefault();this.targetDistance=clamp(this.targetDistance*(e.deltaY<0?.9:1.1),4,80);}
  _frame(time=0){if(!this.running||!this.renderer)return;
    const dt=this.lastFrame?Math.min(.05,Math.max(0,(time-this.lastFrame)/1000)):1/60;this.lastFrame=time;
    const f=1-Math.exp(-11*dt);
    this.cameraYaw+=(this.targetYaw-this.cameraYaw)*f;
    this.cameraPitch+=(this.targetPitch-this.cameraPitch)*f;
    this.distance+=(this.targetDistance-this.distance)*f;
    this._updateCamera();if(!document.hidden)this.renderer.render(this.scene,this.camera);
    this.raf=requestAnimationFrame(this._frame);
  }
  focus(){this.target.set(0,0,0);this.targetDistance=19;this.targetYaw=.6;this.targetPitch=.35;this._updateCamera();}
  reload(){this._syncObjects();}
  preview(){
    for(const item of this.doc.items){const group=this.meshById.get(item.id);if(!group)continue;
      this._applyTransform(item,group);
      if(item.sectionEnabled&&item.kind!=='catalog3d')this._updateSection(item,group);
    }
  }
  exportPNG(){return this.renderer?.domElement?.toDataURL('image/png')||'';}
  dispose(){this.running=false;cancelAnimationFrame(this.raf);this.resizeObserver?.disconnect();this.canvas?.removeEventListener('pointerdown',this._down);this.canvas?.removeEventListener('wheel',this._wheel);
    window.removeEventListener('pointermove',this._move);window.removeEventListener('pointerup',this._up);
    this.shapeRoot?.traverse(obj=>{if(obj.geometry)obj.geometry.dispose?.();if(obj.material){const m=Array.isArray(obj.material)?obj.material:[obj.material];m.forEach(x=>x.dispose?.());}});
    this.gizmoGroup?.traverse(obj=>{obj.geometry?.dispose?.();obj.material?.dispose?.();});this.renderer?.dispose?.();this.container?.replaceChildren();}
}
