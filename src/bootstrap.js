// R9 UI: staged loading indicator + make sure the bundled font is ready before
// canvas labels are drawn (never blocks longer than 1.5 s).
const r9Step=n=>document.getElementById('loading-overlay')?.setAttribute('data-step',String(n));
r9Step(1);
try{await Promise.race([Promise.all(['400','700','800'].map(w=>document.fonts?.load?.(`${w} 24px "Be Vietnam Pro"`,'Toán học Lớp 6–12'))),new Promise(r=>setTimeout(r,1500))]);}catch{}
r9Step(2);
try {await import('./main.js');r9Step(3);document.getElementById('loading-overlay').hidden=true;}
catch(error){
  console.error('Khong the khoi dong Math 3D Museum:',error);
  document.getElementById('loading-overlay').hidden=true;const overlay=document.getElementById('error-boot');overlay.hidden=false;
  document.getElementById('boot-message').textContent=`Lỗi kỹ thuật: ${error.message}. Nếu đây là lần đầu, kiểm tra kết nối Internet để tự tải Three.js. Nếu vẫn lỗi, mở Antigravity IDE và gửi ảnh màn hình Agent kiểm tra.`;
}
