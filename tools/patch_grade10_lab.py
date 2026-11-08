import sys

path = 'G:/ANTIGRAVITY/MATH_3D_MUSEUM/MATHVERSE_R74_FULL_3D_GRAPHICS_TICH_HOP_ANTIGRAVITY_2026-10-31/MATHVERSE_R74_3D_GRAPHICS_FULL_PROJECT/src/curriculum/Grade10Lab.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update _resetFlags to include sgk4Lines: true
old_reset = "swapDiff:false,openBLeft:false,strictIneq:false,testM:[0,0],compareVertices:false,vecRule:'parallelogram'"
new_reset = "swapDiff:false,openBLeft:false,strictIneq:false,sgk4Lines:true,testM:[0,0],compareVertices:false,vecRule:'parallelogram'"
assert old_reset in text, "old_reset not found in Grade10Lab.js"
text = text.replace(old_reset, new_reset, 1)

# 2. Add buttons in mount
old_btn = """  if(id==='10-02-C01'){
   const strictBtn=btn('≤ ↔ < Đổi dấu: ≤ (Nét liền)',()=>{this.flags.strictIneq=!this.flags.strictIneq;strictBtn.textContent=this.flags.strictIneq?'≤ ↔ < Đổi dấu: < (Nét đứt)':'≤ ↔ < Đổi dấu: ≤ (Nét liền)';this.draw();});
   actions.append(strictBtn);
  }
  if(id==='10-02-C03'){
   const compBtn=btn('📊 So sánh giá trị tại các đỉnh',()=>{this.flags.compareVertices=!this.flags.compareVertices;compBtn.textContent=this.flags.compareVertices?'📊 Ẩn bảng đỉnh':'📊 So sánh giá trị tại các đỉnh';this.draw();});
   actions.append(compBtn);
  }"""

new_btn = """  if(id==='10-02-C01'){
   const strictBtn=btn('≤ ↔ < Đổi dấu: ≤ (Nét liền)',()=>{this.flags.strictIneq=!this.flags.strictIneq;strictBtn.textContent=this.flags.strictIneq?'≤ ↔ < Đổi dấu: < (Nét đứt)':'≤ ↔ < Đổi dấu: ≤ (Nét liền)';this.draw();});
   actions.append(strictBtn);
   actions.append(btn('↺ Đặt lại M(0; 0)',()=>{this.flags.testM=[0,0];this.draw();}));
  }
  if(id==='10-02-C02'){
   actions.append(btn('↺ Đặt lại M(0; 0)',()=>{this.flags.testM=[0,0];this.draw();}));
  }
  if(id==='10-02-C03'){
   const compBtn=btn('📊 So sánh giá trị tại các đỉnh',()=>{this.flags.compareVertices=!this.flags.compareVertices;compBtn.textContent=this.flags.compareVertices?'📊 Ẩn bảng đỉnh':'📊 So sánh giá trị tại các đỉnh';this.draw();});
   actions.append(compBtn);
   const sgkBtn=btn('📐 Hệ 4 đường SGK: Bật',()=>{this.flags.sgk4Lines=!this.flags.sgk4Lines;sgkBtn.textContent=this.flags.sgk4Lines?'📐 Hệ 4 đường SGK: Bật':'📐 Hệ 4 đường SGK: Tắt';this.draw();});
   actions.append(sgkBtn);
  }"""
assert old_btn in text, "old_btn not found in Grade10Lab.js"
text = text.replace(old_btn, new_btn, 1)

# 3. Update pointermove drag handling
old_drag = """   else if(this.id==='10-02-C01'&&(key==='M'||key==='__canvas__')){
    this.flags.testM=[Number(lim(wx,-6,6).toFixed(1)),Number(lim(wy,-5,5).toFixed(1))];
   }"""

new_drag = """   else if(this.id==='10-02-C01'||this.id==='10-02-C02'||this.id==='10-02-C03'){
    if(key==='M'||key==='__canvas__'){
     this.flags.testM=[Number(lim(wx,-6,6).toFixed(1)),Number(lim(wy,-5,5).toFixed(1))];
    }else if(key==='P1'||key==='d1'){
     p.c=Math.round(lim(p.a*wx+p.b*wy,-8,8));
    }else if(key==='P2'||key==='d2'){
     p.f=Math.round(lim(p.d*wx+p.e*wy,-8,8));
    }else if(key==='U'||key==='grad'){
     const nu=Math.round(lim(wx,-3,3)),nv=Math.round(lim(wy,-3,3));
     if(nu!==0||nv!==0){p.u=nu;p.v=nv;}
    }
   }"""
assert old_drag in text, "old_drag not found in Grade10Lab.js"
text = text.replace(old_drag, new_drag, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('SUCCESSFULLY UPDATED Grade10Lab.js')
