import {readStoredPixelRatio} from '../museum/quality-controller.js';
/**
 * MATHVERSE V5 - Solid3DViewer
 * Trình xem và tương tác hình học không gian 3D Three.js.
 * Hỗ trợ 4 góc nhìn chuẩn, mặt cắt thiết diện động, khai triển phẳng 2D, các chế độ hiển thị đặc/khung dây/trong suốt.
 */

import * as THREE from '../../vendor/three.module.js';
import { createMathModel, disposeObject } from '../geometry.js';
import { normalizeExhibit, metrics, TYPES } from '../math-core.js';
import { getSolidHandles, clampHandleValue } from '../studio/solid-handles.js';
import {
  applyConditionalShadows,
  createContactShadowDisc,
  createPedagogicalShadowFloor,
  createProceduralHDRIEnvironment,
  getSharedPBRMaterial
} from '../graphics-r74/depth-pipeline-v12.mjs';

function getSolidHighDpiRatio() {
  const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
  return Math.min(Math.max(dpr * 1.5, 2.0), 3.0);
}

export class Solid3DViewer {
  constructor(model, options = {}) {
    this.model = normalizeExhibit(model);
    this.options = options;
    this.container = null;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.meshGroup = null;
    this.grid = null;
    this.axes = null;

    this.params = { ...this.model.params };
    this.distance = 7;
    this.yaw = 0.55;
    this.pitch = 0.38;
    this.center = new THREE.Vector3(0, 0, 0);

    this.faces = true;
    this.edges = true;
    this.showLabels = true;
    this.showGrid = true;
    this.showAxes = true;
    this.displayMode = 'solid'; // 'solid' | 'wireframe' | 'transparent'

    this.crossSectionEnabled = false;
    this.crossSectionPct = 50;
    this.obliqueEnabled=false;this.obliquePct=50;this.obliqueAngle=0;this.obliqueData=null;
    this.unfoldEnabled = false;
    this.unfoldProgress = 0;
    this.revolutionProgress = 1;
    this.autoRotate = false;

    this.raf = 0;
    this.isDragging = false;
    this.isPanning = false;
    this.lastPointer = { x: 0, y: 0 };
    this.lastTime = 0;
    this._lastDrawAt = 0;
    this.toolMode = 'edit';
    this.showHandles = true;
    this.handleGroup = null;
    this.handleMeshes = [];
    this.dragHandle = null;
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();


    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onResize = this._onResize.bind(this);
    this._animate = this._animate.bind(this);
  }

  mount(container) {
    this.container = container;
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    this.container.style.overflow = 'hidden';

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.cursor = 'grab';
    this.container.appendChild(this.canvas);
    this.handleTip = null;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(getSolidHighDpiRatio());
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf6f9fc);
    const envTex = createProceduralHDRIEnvironment(this.renderer);
    if (envTex) this.scene.environment = envTex;

    const hemi = new THREE.HemisphereLight(0xffffff, 0xd2ddec, 2.2);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff6ea, 2.8);
    sun.position.set(6, 9, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -6.5;
    sun.shadow.camera.right = 6.5;
    sun.shadow.camera.top = 6.5;
    sun.shadow.camera.bottom = -6.5;
    sun.shadow.camera.near = 0.2;
    sun.shadow.camera.far = 30;
    sun.shadow.bias = -0.00012;
    sun.shadow.normalBias = 0.024;
    this.scene.add(sun);
    const fillLight = new THREE.DirectionalLight(0xe8f0f8, 1.1);
    fillLight.position.set(-6, -4, -6);
    this.scene.add(fillLight);

    this.shadowFloor = createPedagogicalShadowFloor({ size: 22, y: -1.86, color: 0xe6eef6 });
    this.scene.add(this.shadowFloor);
    this.contactDisc = createContactShadowDisc({ radius: 2.05, y: -1.852, opacity: 0.34 });
    this.scene.add(this.contactDisc);
    this.pbrPresetKey = 'default';

    this.grid = new THREE.GridHelper(10, 20, 0x90aabf, 0xd5e2ec);
    this.grid.position.y = -1.85;
    this.scene.add(this.grid);

    this.axes = new THREE.AxesHelper(4.5);
    this.axes.position.y = -1.85;
    this.scene.add(this.axes);

    this.perspectiveCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.orthographicCamera = new THREE.OrthographicCamera(-3.5, 3.5, 3.5, -3.5, 0.1, 100);
    this.projectionMode = 'perspective';
    this.camera = this.perspectiveCamera;
    this._updateCamera();

    // Floating button to toggle Perspective <-> Orthographic camera & Real-World PBR Material Preset
    if (typeof document !== 'undefined' && this.container) {
      const topBar = document.createElement('div');
      topBar.style.cssText = 'position:absolute;top:10px;right:12px;z-index:8;display:flex;gap:6px;align-items:center;flex-wrap:wrap;';

      const pbrSel = document.createElement('select');
      pbrSel.className = 'mv-v12-pbr-select';
      pbrSel.title = 'Chọn chất liệu PBR thực tế (Gỗ, Kính, Kim loại, Nhựa, Đá) cho khối 3D';
      pbrSel.style.cssText = 'padding:5px 10px;border-radius:999px;border:1px solid rgba(14,116,144,0.45);background:rgba(255,255,255,0.94);color:#0f2b3c;font-size:11.5px;font-weight:800;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,0.12);';
      for (const [val, label] of [
        ['default', '🎨 Chất liệu: Mặc định'],
        ['woodOak', '🪵 Gỗ Sồi (Wood)'],
        ['crystalGlass', '💎 Kính Pha Lê (Glass)'],
        ['brushedMetal', '🥇 Kim Loại (Metal)'],
        ['glossyPlastic', '🧪 Nhựa Bóng (Plastic)'],
        ['marbleStone', '🏛️ Đá Cẩm Thạch (Stone)']
      ]) {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label;
        pbrSel.appendChild(opt);
      }
      pbrSel.addEventListener('change', () => {
        this.setPBRMaterialPreset(pbrSel.value);
      });
      topBar.appendChild(pbrSel);

      const projBtn = document.createElement('button');
      projBtn.type = 'button';
      projBtn.className = 'mv-v12-ortho-btn';
      projBtn.textContent = '🎥 Phối cảnh 3D';
      projBtn.title = 'Đổi giữa Camera Phối cảnh (Perspective) và Camera Trực giao (Orthographic) để đo góc/độ dài chính xác';
      projBtn.style.cssText = 'padding:6px 12px;border-radius:999px;border:1px solid rgba(14,116,144,0.45);background:rgba(255,255,255,0.92);color:#0f2b3c;font-size:11.5px;font-weight:800;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,0.12);';
      projBtn.addEventListener('click', () => {
        const next = this.toggleProjectionMode();
        projBtn.textContent = next === 'orthographic' ? '📐 Đo đạc Trực giao (Ortho)' : '🎥 Phối cảnh 3D';
      });
      topBar.appendChild(projBtn);
      this.container.appendChild(topBar);
      this.projBtn = projBtn;
      this.pbrSel = pbrSel;
    }

    this.canvas.addEventListener('pointerdown', this._onPointerDown);
    this.canvas.addEventListener('contextmenu', e=>e.preventDefault());
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
    this.canvas.addEventListener('wheel', this._onWheel, { passive: false });
    window.addEventListener('resize', this._onResize);

    this._rebuildShape();
    this._onResize();
    if (typeof ResizeObserver !== 'undefined' && this.container) {
      this._ro = new ResizeObserver(() => this._onResize());
      this._ro.observe(this.container);
    }
    requestAnimationFrame(() => this._onResize());
    this.raf = requestAnimationFrame(this._animate);
  }

  _rebuildShape() {
    if (this.meshGroup) {
      this.scene.remove(this.meshGroup);
      disposeObject(this.meshGroup);
      this.meshGroup = null;
    }

    const item = { ...this.model, params: { ...this.params } };
    this.meshGroup = createMathModel(item, {
      faces: this.faces,
      edges: this.edges,
      labels: this.showLabels,
      mode: this.displayMode
    });
    if(!this.labelOffsets3D)this.labelOffsets3D=new Map();
    const lGroup=this.meshGroup?.userData?.labelsGroup;
    if(lGroup?.children){
      lGroup.children.forEach((sp,idx)=>{
        const key=`${idx}:${sp.userData?.labelText||''}`;
        sp.userData.labelKey=key;
        const off=this.labelOffsets3D.get(key);
        if(off)sp.position.add(off);
      });
    }
    this.scene.add(this.meshGroup);
    applyConditionalShadows(this.meshGroup);
    if (this.pbrPresetKey && this.pbrPresetKey !== 'default') {
      this._applyPBRPresetToGroup(this.pbrPresetKey);
    }
    this._buildHandles();

    if (this.meshGroup.supportsCrossSection) {
      this.meshGroup.setCrossSection(this.crossSectionEnabled, this.crossSectionPct);
    }
    if (this.meshGroup.supportsUnfold) {
      this.meshGroup.setUnfoldProgress(this.unfoldEnabled ? this.unfoldProgress : 0);
    }
    if (this.meshGroup.supportsRevolution) {
      this.meshGroup.setRevolutionProgress(this.revolutionProgress);
    }
    if (this.meshGroup.setBuildProgress && this.buildProgress !== undefined) {
      this.meshGroup.setBuildProgress(this.buildProgress);
    }
    this.setSphereSweepProgress(this.sphereSweepProgress??1);
    this.obliqueData=this.meshGroup.supportsObliqueSection
      ?this.meshGroup.setObliqueSection(this.obliqueEnabled,this.obliquePct,this.obliqueAngle):null;

    this.grid.visible = this.showGrid;
    this.axes.visible = this.showAxes;
  }

  _buildHandles() {
    if(this.handleGroup){
      this.scene.remove(this.handleGroup);
      disposeObject(this.handleGroup);
    }
    this.handleGroup = new THREE.Group();
    this.handleGroup.name='editableSolidHandles';
    this.handleMeshes=[];
    const baseScale = Number.isFinite(this.meshGroup?.userData?.baseScale) ? this.meshGroup.userData.baseScale : (this.meshGroup?.scale?.x || 1);
    const modelCenter = this.meshGroup?.userData?.modelCenter || new THREE.Vector3(0, 0, 0);
    for(const def of getSolidHandles(this.model.type,this.params)){
      const isHeight = def.key === 'h';
      const handleColor = isHeight ? 0xf59e0b : 0x06b6d4;
      const glowColor = isHeight ? 0xffbe3b : 0x22d3ee;
      const worldPos = new THREE.Vector3(...def.pos).sub(modelCenter).multiplyScalar(baseScale);

      // Sleek pinpoint handle sphere: radius 0.08, high tessellation
      const material = new THREE.MeshStandardMaterial({
        color: handleColor,
        emissive: glowColor,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0.65,
        depthTest: true
      });
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 24, 18), material);
      mesh.position.copy(worldPos);
      mesh.renderOrder = 999;
      mesh.userData.handle = { ...def, worldPos: [worldPos.x, worldPos.y, worldPos.z], baseScale };
      this.handleGroup.add(mesh);
      this.handleMeshes.push(mesh);

      // Precision targeting ring around handle: radius 0.125, fine tube 0.012
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.125, 0.012, 8, 36),
        new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthTest: true })
      );
      ring.position.copy(worldPos);
      ring.renderOrder = 998;
      this.handleGroup.add(ring);
    }
    this.handleGroup.visible=this.showHandles && this.toolMode==='edit' && !(this.unfoldEnabled && this.unfoldProgress > 0.03);
    this.scene.add(this.handleGroup);
  }

  _hitHandle(event){
    if(!this.handleGroup?.visible||!this.canvas)return null;
    const rect=this.canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    this.pointer.set(2*(event.clientX-rect.left)/rect.width-1,1-2*(event.clientY-rect.top)/rect.height);
    this.raycaster.setFromCamera(this.pointer,this.camera);
    const directHits = this.raycaster.intersectObjects(this.handleMeshes,false);
    if(directHits.length > 0) return directHits[0].object?.userData?.handle || null;

    // Generous 24px screen proximity threshold for easy grabbing
    for (const m of this.handleMeshes) {
      const p3 = m.position.clone().project(this.camera);
      if (p3.z > 1) continue;
      const sx = (p3.x + 1) * 0.5 * rect.width;
      const sy = (1 - p3.y) * 0.5 * rect.height;
      const px = event.clientX - rect.left;
      const py = event.clientY - rect.top;
      if (Math.hypot(px - sx, py - sy) <= 24) {
        return m.userData.handle || null;
      }
    }
    return null;
  }

  _hitLabelSprite(event){
    const lGroup=this.meshGroup?.userData?.labelsGroup;
    if(!lGroup?.visible||!lGroup.children?.length||!this.canvas)return null;
    const rect=this.canvas.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    this.pointer.set(2*(event.clientX-rect.left)/rect.width-1,1-2*(event.clientY-rect.top)/rect.height);
    this.raycaster.setFromCamera(this.pointer,this.camera);
    return this.raycaster.intersectObjects(lGroup.children,false)[0]?.object||null;
  }

  _startHandleDrag(def,event){
    const camera=this.camera;
    const canvas=this.canvas.getBoundingClientRect();
    const bScale=def.baseScale||1;
    const P=new THREE.Vector3(...(def.worldPos||def.pos));
    const Q=P.clone().add(new THREE.Vector3(...def.axis).multiplyScalar(bScale));
    P.project(camera); Q.project(camera);
    const vx=(Q.x-P.x)*canvas.width/2;
    const vy=-(Q.y-P.y)*canvas.height/2;
    const magnitude=Math.hypot(vx,vy);
    // A nearly edge-on axis cannot be dragged reliably; retain camera orbit instead.
    if(magnitude<6)return false;
    this.dragHandle={
      def, startX:event.clientX,startY:event.clientY,
      base:this.params[def.key], ux:vx/magnitude,uy:vy/magnitude,
      pixelsPerUnit:magnitude
    };
    this.canvas.setPointerCapture?.(event.pointerId);
    this.canvas.style.cursor='grabbing';
    if(this.handleTip)this.handleTip.classList.remove('visible');
    return true;
  }

  setToolMode(mode){
    this.toolMode=mode==='orbit'?'orbit':'edit';
    if(this.handleGroup)this.handleGroup.visible=this.showHandles&&this.toolMode==='edit';
  }
  setShowHandles(enabled){
    this.showHandles=!!enabled;
    if(this.handleGroup)this.handleGroup.visible=this.showHandles&&this.toolMode==='edit';
  }
  getEditableHandleCount(){return getSolidHandles(this.model.type,this.params).length;}

  setProjectionMode(mode) {
    this.projectionMode = (mode === 'orthographic' || mode === 'ortho') ? 'orthographic' : 'perspective';
    this.camera = (this.projectionMode === 'orthographic' && this.orthographicCamera)
      ? this.orthographicCamera
      : (this.perspectiveCamera || this.camera);
    this._updateCamera();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
    return this.projectionMode;
  }

  toggleProjectionMode() {
    return this.setProjectionMode(this.projectionMode === 'perspective' ? 'orthographic' : 'perspective');
  }

  setPBRMaterialPreset(presetKey = 'default') {
    this.pbrPresetKey = presetKey || 'default';
    this._rebuildShape();
    return this.pbrPresetKey;
  }

  _applyPBRPresetToGroup(presetKey) {
    if (!this.meshGroup || !presetKey || presetKey === 'default') return;
    const sharedMat = getSharedPBRMaterial(presetKey);
    if (!sharedMat) return;
    this.meshGroup.traverse(obj => {
      if (!obj?.isMesh || obj.isSprite || obj.isLine) return;
      if (obj.userData?.handle || obj.parent?.name === 'editableSolidHandles') return;
      if (obj.material && !obj.material.wireframe) {
        obj.material = sharedMat;
      }
    });
  }

  _updateCamera() {
    const cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    const cy = Math.cos(this.yaw), sy = Math.sin(this.yaw);
    const x = this.center.x + this.distance * cp * sy;
    const y = this.center.y + this.distance * sp;
    const z = this.center.z + this.distance * cp * cy;
    if (this.perspectiveCamera) {
      this.perspectiveCamera.position.set(x, y, z);
      this.perspectiveCamera.lookAt(this.center);
    }
    if (this.orthographicCamera) {
      this.orthographicCamera.position.set(x, y, z);
      this.orthographicCamera.lookAt(this.center);
      const aspect = this.perspectiveCamera?.aspect || 1.5;
      const halfH = Math.max(0.8, this.distance * Math.tan(THREE.MathUtils.degToRad(22.5)));
      const halfW = halfH * aspect;
      this.orthographicCamera.left = -halfW;
      this.orthographicCamera.right = halfW;
      this.orthographicCamera.top = halfH;
      this.orthographicCamera.bottom = -halfH;
      this.orthographicCamera.updateProjectionMatrix();
    }
    if (this.camera && this.camera !== this.perspectiveCamera && this.camera !== this.orthographicCamera) {
      this.camera.position.set(x, y, z);
      this.camera.lookAt(this.center);
    }
  }

  _onPointerDown(e) {
    if(e.button===0 && !e.shiftKey){
      if(this.toolMode==='edit'){
        const hit=this._hitHandle(e);
        if(hit && this._startHandleDrag(hit,e)){
          e.preventDefault();return;
        }
      }
      const sp=this._hitLabelSprite(e);
      if(sp){
        const key=sp.userData?.labelKey||'0';
        const curOff=(this.labelOffsets3D?.get(key)||new THREE.Vector3()).clone();
        this.dragLabel3D={
          sprite:sp, key, startX:e.clientX, startY:e.clientY,
          basePos:sp.position.clone().sub(curOff), baseOff:curOff
        };
        this.canvas.setPointerCapture?.(e.pointerId);
        this.canvas.style.cursor='grabbing';
        if(this.handleTip)this.handleTip.classList.remove('visible');
        e.preventDefault();return;
      }
    }
    this.isDragging = true;
    this.isPanning = e.shiftKey || e.button === 1 || e.button === 2;
    this.lastPointer = { x: e.clientX, y: e.clientY };
    this.canvas.style.cursor = 'grabbing';
  }

  _onPointerMove(e) {
    if(this.dragLabel3D){
      const {sprite,key,startX,startY,basePos,baseOff}=this.dragLabel3D;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      const right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,0).normalize();
      const up=new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld,1).normalize();
      const scale=0.0085*(this.distance/7);
      const nextOff=baseOff.clone().addScaledVector(right,dx*scale).addScaledVector(up,-dy*scale);
      if(!this.labelOffsets3D)this.labelOffsets3D=new Map();
      this.labelOffsets3D.set(key,nextOff);
      sprite.position.copy(basePos).add(nextOff);
      return;
    }
    if(this.dragHandle){
      const {def,startX,startY,base,ux,uy,pixelsPerUnit}=this.dragHandle;
      const projected=(e.clientX-startX)*ux+(e.clientY-startY)*uy;
      const proposed=clampHandleValue(this.model.type,def.key,base+def.factor*projected/pixelsPerUnit);
      if(proposed!==null && proposed!==this.params[def.key]) this.updateParameters({[def.key]:proposed});
      return;
    }
    if(!this.isDragging){
      const hit=this.toolMode==='edit'?this._hitHandle(e):null;
      const lblHit=!hit?this._hitLabelSprite(e):null;
      if(this.canvas)this.canvas.style.cursor=(hit||lblHit)?'pointer':'grab';
      return;
    }
    const dx = e.clientX - this.lastPointer.x;
    const dy = e.clientY - this.lastPointer.y;
    this.lastPointer = { x: e.clientX, y: e.clientY };

    if (this.isPanning) {
      const panSpeed = 0.005 * (this.distance / 7);
      this.center.x -= dx * panSpeed;
      this.center.y += dy * panSpeed;
    } else {
      this.yaw += dx * 0.01;
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch + dy * 0.01));
    }
    this._updateCamera();
  }

  _onPointerUp() {
    const changed=!!this.dragHandle;
    this.dragHandle=null;
    this.dragLabel3D=null;
    if(changed)this.options.onInteractionEnd?.();
    this.isDragging = false;
    this.isPanning = false;
    if (this.canvas) this.canvas.style.cursor = 'grab';
    if(this.handleTip)this.handleTip.classList.remove('visible');
  }

  _onWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.9 : 1.1;
    this.distance = Math.max(1.8, Math.min(25, this.distance * factor));
    this._updateCamera();
  }

  _onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const targetEl = this.canvas || this.container;
    const rect = targetEl.getBoundingClientRect?.() || this.container.getBoundingClientRect?.() || { width: 0, height: 0 };
    const cw = Math.round(rect.width) || targetEl.clientWidth || this.container.clientWidth || 0;
    const ch = Math.round(rect.height) || targetEl.clientHeight || this.container.clientHeight || 0;
    const w = cw > 40 ? cw : 800;
    const h = ch > 40 ? ch : 520;
    this._lastW = cw;
    this._lastH = ch;
    const targetPr = getSolidHighDpiRatio();
    if (this.renderer.getPixelRatio() !== targetPr) {
      this.renderer.setPixelRatio(targetPr);
    }
    this.renderer.setSize(w, h, false);
    if (this.perspectiveCamera) {
      this.perspectiveCamera.aspect = w / h;
      this.perspectiveCamera.updateProjectionMatrix();
    } else if (this.camera) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }
    this._updateCamera();
    if (this.scene) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  _animate(time) {
    // Request the next tick but avoid painting hidden tabs and unchanged frames.
    this.raf = requestAnimationFrame(this._animate);
    if (!this.renderer || !this.scene || !this.camera) return;
    if (this.container) {
      const targetEl = this.canvas || this.container;
      const rect = targetEl.getBoundingClientRect?.() || { width: targetEl.clientWidth || 0, height: targetEl.clientHeight || 0 };
      const cw = Math.round(rect.width) || targetEl.clientWidth || this.container.clientWidth || 0;
      const ch = Math.round(rect.height) || targetEl.clientHeight || this.container.clientHeight || 0;
      if (cw > 40 && ch > 40 && (Math.abs((this._lastW || 0) - cw) > 1 || Math.abs((this._lastH || 0) - ch) > 1)) {
        this._onResize();
      }
    }
    if (typeof document !== 'undefined' && document.hidden) {
      this.lastTime = time;
      this._lastDrawAt = time;
      return;
    }
    const interactive = this.autoRotate || this.isDragging || !!this.dragHandle;
    const minInterval = interactive ? 1000 / 60 : 1000 / 30;
    if (this._lastDrawAt && time - this._lastDrawAt < minInterval) return;
    this._lastDrawAt = time;
    if (this.autoRotate && !this.isDragging) {
      const dt = this.lastTime ? Math.max(0, Math.min(.075, (time - this.lastTime) * .001)) : .016;
      this.yaw += dt * .45;
      this._updateCamera();
    }
    this.lastTime = time;
    this.renderer.render(this.scene, this.camera);
  }

  setViewPreset(preset) {
    switch (preset) {
      case 'iso':
        this.yaw = 0.55;
        this.pitch = 0.38;
        this.distance = 7;
        this.center.set(0, 0, 0);
        break;
      case 'front':
        this.yaw = 0;
        this.pitch = 0;
        this.distance = 7;
        this.center.set(0, 0, 0);
        break;
      case 'top':
        this.yaw = 0;
        this.pitch = 1.55;
        this.distance = 7.5;
        this.center.set(0, 0, 0);
        break;
      case 'side':
        this.yaw = Math.PI / 2;
        this.pitch = 0;
        this.distance = 7;
        this.center.set(0, 0, 0);
        break;
    }
    this._updateCamera();
  }

  setDisplayMode(mode) {
    this.displayMode = mode;
    this._rebuildShape();
  }

  setToggles({ faces, edges, labels, grid, axes }) {
    if (faces !== undefined) this.faces = faces;
    if (edges !== undefined) this.edges = edges;
    if (labels !== undefined) this.showLabels = labels;
    if (grid !== undefined) this.showGrid = grid;
    if (axes !== undefined) this.showAxes = axes;
    this._rebuildShape();
  }

  setCrossSection(enabled, pct = null) {
    this.crossSectionEnabled = enabled;
    if(enabled){this.obliqueEnabled=false;this.obliqueData=null;this.meshGroup?.setObliqueSection?.(false);}
    if (pct !== null) this.crossSectionPct = pct;
    if (this.meshGroup?.supportsCrossSection) {
      return this.meshGroup.setCrossSection(this.crossSectionEnabled, this.crossSectionPct);
    }
    return null;
  }

  /** Slanted plane: angle and height change the actual polygon and its area. */
  setObliqueSection(enabled,percent=this.obliquePct,angle=this.obliqueAngle,mnp=null){
    this.obliqueEnabled=!!enabled;this.obliquePct=percent;this.obliqueAngle=angle;
    if(enabled){this.crossSectionEnabled=false;this.meshGroup?.setCrossSection?.(false);}
    this.obliqueData=this.meshGroup?.setObliqueSection?.(this.obliqueEnabled,percent,angle,mnp)||null;
    this.options.onMetricsChange?.(this.getMetrics());
    return this.obliqueData;
  }

  setObliqueSectionThroughPoints(M, N, P) {
    this.obliqueEnabled = true;
    this.crossSectionEnabled = false;
    this.meshGroup?.setCrossSection?.(false);
    this.obliqueData = this.meshGroup?.setObliqueSection?.(true, 50, 0, { M, N, P }) || null;
    this.options.onMetricsChange?.(this.getMetrics());
    return this.obliqueData;
  }

  setUnfold(enabled, progress = null) {
    this.unfoldEnabled = !!enabled;
    if (progress !== null) this.unfoldProgress = Math.max(0,Math.min(1,Number(progress)||0));
    if (this.meshGroup?.supportsUnfold) {
      this.meshGroup.setUnfoldProgress(this.unfoldEnabled ? this.unfoldProgress : 0);
    }
    if (this.handleGroup) {
      this.handleGroup.visible = this.showHandles && this.toolMode === 'edit' && !(this.unfoldEnabled && this.unfoldProgress > 0.03);
    }
  }

  /** Build the sphere surface in real geometry by sweeping latitude bands.
   * Sphere is NOT an isometrically developable surface; do not simulate a flat net.
   * Re-applied after _rebuildShape to keep timeline frame stable on param change.
   */
  setSphereSweepProgress(progress=1){
    this.sphereSweepProgress=Math.max(0,Math.min(1,Number(progress)||0));
    let found=0;
    this.meshGroup?.traverse(object=>{
      const geo=object?.geometry;
      if(!object.isMesh||geo?.type!=='SphereGeometry'||!geo.index)return;
      const full=geo.index.count;
      // Whole triangles only; zero index draw range on frame zero.
      const count=Math.min(full,Math.floor(full*this.sphereSweepProgress/3)*3);
      geo.setDrawRange(0,count);
      found++;
    });
    return found;
  }

  /** Sweep the genuine lathe mesh from 0 to 360 degrees without rotating camera. */
  setRevolutionProgress(fraction=1){
    this.revolutionProgress=Math.max(0,Math.min(1,Number(fraction)||0));
    return this.meshGroup?.setRevolutionProgress?.(this.revolutionProgress)??false;
  }

  exportStateJSON() {
    return JSON.stringify({
      schemaVersion: '3.0',
      timestamp: new Date().toISOString(),
      modelId: this.model.id || this.model.type,
      type: this.model.type,
      modality: 'solid3d',
      params: { ...this.params },
      camera: {
        yaw: this.yaw,
        pitch: this.pitch,
        distance: this.distance,
        center: [this.center.x, this.center.y, this.center.z]
      },
      visibility: {
        faces: this.faces,
        edges: this.edges,
        showLabels: this.showLabels,
        showGrid: this.showGrid,
        showAxes: this.showAxes
      },
      displayMode: this.displayMode,
      unfold: {
        enabled: this.unfoldEnabled,
        progress: this.unfoldProgress
      },
      crossSection: {
        enabled: this.crossSectionEnabled,
        percent: this.crossSectionPct
      },
      obliqueSection: {
        enabled: this.obliqueEnabled,
        percent: this.obliquePct,
        angle: this.obliqueAngle
      }
    }, null, 2);
  }

  importStateJSON(jsonStrOrObj) {
    try {
      const state = typeof jsonStrOrObj === 'string' ? JSON.parse(jsonStrOrObj) : jsonStrOrObj;
      if (!state || typeof state !== 'object') return false;
      if (state.params) {
        this.params = { ...this.params, ...state.params };
      }
      if (state.camera) {
        if (Number.isFinite(state.camera.yaw)) this.yaw = state.camera.yaw;
        if (Number.isFinite(state.camera.pitch)) this.pitch = state.camera.pitch;
        if (Number.isFinite(state.camera.distance)) this.distance = state.camera.distance;
        if (Array.isArray(state.camera.center) && state.camera.center.length === 3) {
          this.center.set(...state.camera.center);
        }
      }
      if (state.visibility) {
        if (state.visibility.faces !== undefined) this.faces = state.visibility.faces;
        if (state.visibility.edges !== undefined) this.edges = state.visibility.edges;
        if (state.visibility.showLabels !== undefined) this.showLabels = state.visibility.showLabels;
        if (state.visibility.showGrid !== undefined) this.showGrid = state.visibility.showGrid;
        if (state.visibility.showAxes !== undefined) this.showAxes = state.visibility.showAxes;
      }
      if (state.displayMode) this.displayMode = state.displayMode;
      if (state.unfold) {
        this.unfoldEnabled = !!state.unfold.enabled;
        this.unfoldProgress = state.unfold.progress ?? 0;
      }
      if (state.crossSection) {
        this.crossSectionEnabled = !!state.crossSection.enabled;
        this.crossSectionPct = state.crossSection.percent ?? 50;
      }
      if (state.obliqueSection) {
        this.obliqueEnabled = !!state.obliqueSection.enabled;
        this.obliquePct = state.obliqueSection.percent ?? 50;
        this.obliqueAngle = state.obliqueSection.angle ?? 0;
      }
      if (this.scene) this._rebuildShape();
      return true;
    } catch (e) {
      console.error('importStateJSON error:', e);
      return false;
    }
  }

  updateParameters(patch) {
    this.params = normalizeExhibit({...this.model,params:{...this.params,...patch}}).params;
    this._rebuildShape();
    this.options.onParametersChange?.({...this.params});
    this.options.onMetricsChange?.(this.getMetrics());
  }

  reset() {
    this.params = { ...(this.model.params || {}) };
    this.setViewPreset('iso');
    this.faces = true;
    this.edges = true;
    this.showLabels = true;
    this.showGrid = true;
    this.showAxes = true;
    this.displayMode = 'solid';
    this.crossSectionEnabled = false;
    this.crossSectionPct = 50;
    this.obliqueEnabled=false;this.obliquePct=50;this.obliqueAngle=0;this.obliqueData=null;
    this.unfoldEnabled = false;
    this.unfoldProgress = 0;
    this.revolutionProgress = 1;
    this._rebuildShape();
    this.options.onParametersChange?.({...this.params});
    this.options.onMetricsChange?.(this.getMetrics());
  }

  getMetrics() {
    const base=metrics(this.model.type, this.params);
    if(this.obliqueEnabled&&this.obliqueData){
      const s=this.obliqueData,r=n=>Math.round(n*1000)/1000;
      return [...base,{name:'Thiết diện nghiêng',value:s.vertices.length+' đỉnh',unit:''},
        {name:'Diện tích thiết diện',value:r(s.area),unit:'đv²'},
        {name:'Chu vi thiết diện',value:r(s.perimeter),unit:'đv'}];
    }
    return base;
  }

  exportSnapshot() {
    if (!this.canvas) return '';
    return this.canvas.toDataURL('image/png');
  }

  getState() {
    return {
      type: this.model.type,
      modality: 'solid3d',
      params: { ...this.params },
      displayMode: this.displayMode,
      crossSectionEnabled: this.crossSectionEnabled,
      crossSectionPct: this.crossSectionPct,
      obliqueEnabled:this.obliqueEnabled,obliquePct:this.obliquePct,obliqueAngle:this.obliqueAngle,
      revolutionProgress:this.revolutionProgress
    };
  }

  setTheme(isDark) {
    if (!this.scene) return;
    if (isDark) {
      this.scene.background = new THREE.Color(0x0f1d2c);
      if (this.grid) this.grid.material.color.setHex(0x274a62);
    } else {
      this.scene.background = new THREE.Color(0xf6f9fc);
      if (this.grid) this.grid.material.color.setHex(0x90aabf);
    }
  }

  resize() {
    this._onResize();
  }

  dispose() {
    if (this._ro) {
      this._ro.disconnect();
      this._ro = null;
    }
    cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
    window.removeEventListener('resize', this._onResize);

    if (this.meshGroup) {
      this.scene.remove(this.meshGroup);
      disposeObject(this.meshGroup);
    }
    if(this.handleGroup){this.scene.remove(this.handleGroup);disposeObject(this.handleGroup);this.handleGroup=null;this.handleMeshes=[];}
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
    }
    if(this.handleTip)this.handleTip.remove();this.handleTip=null;
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
