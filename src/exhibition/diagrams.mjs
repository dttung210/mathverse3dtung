/** Illustrations are original schematic drawings, not historical manuscripts. */
const svg=(inside,view='0 0 440 270')=>`<svg viewBox="${view}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sơ đồ minh họa Toán học" class="math-diagram"><rect width="440" height="270" rx="12" fill="#0a2133"/>${inside}</svg>`;
const line=(x1,y1,x2,y2,color='#77e2ec',width=3,more='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${more}/>`;
const text=(x,y,v,fill='#e7f9fe',size=20)=>`<text x="${x}" y="${y}" font-family="Arial,sans-serif" fill="${fill}" font-size="${size}" text-anchor="middle">${v}</text>`;
const circle=(x,y,r,color='#ffcd77')=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
function axes(){return line(30,218,412,218)+line(74,245,74,25)+text(414,235,'x','#aecbd7',17)+text(59,30,'y','#aecbd7',17);}
function pathPoints(fn,lo,hi,n=70){return Array.from({length:n+1},(_,k)=>{const x=lo+(hi-lo)*k/n;return`${k?'L':'M'}${x.toFixed(1)},${fn(x).toFixed(1)}`;}).join(' ');}
export function diagramFor(person){
  let s='';const kind=person.kind;
  if(kind==='pythagoras'){
    // True right-triangle side-square proportions: legs 60 and 80, hypotenuse 100.
    s='<polygon points="140,165 140,105 220,165" fill="#62b3cc33" stroke="#76e6f4" stroke-width="4"/>'
      +'<polygon points="80,105 140,105 140,165 80,165" fill="#bca0fe66" stroke="#c5b4ff" stroke-width="3"/>'
      +'<polygon points="140,165 220,165 220,245 140,245" fill="#7dd6a855" stroke="#9fe6c4" stroke-width="3"/>'
      +'<polygon points="140,105 220,165 280,85 200,25" fill="#f4b57a55" stroke="#f8c98c" stroke-width="3"/>'
      +text(346,153,'a²+b²=c²','#fcd77a',22);
  }else if(kind==='parallel'){
    s=line(45,73,393,73)+line(45,186,393,186)+line(156,26,268,248,'#f7c67a',4)+text(323,54,'a ∥ b')+text(218,155,'so le trong','#f0d394',18);
  }else if(kind==='sphere'){
    s='<ellipse cx="190" cy="138" rx="89" ry="103" fill="#67bcd444" stroke="#6bd7eb" stroke-width="3"/>'
      +'<rect x="100" y="35" width="180" height="206" fill="none" stroke="#dfc894" stroke-width="3"/>'
      +'<ellipse cx="190" cy="35" rx="90" ry="18" fill="none" stroke="#dfc894" stroke-width="2"/>'
      +'<ellipse cx="190" cy="241" rx="90" ry="18" fill="none" stroke="#dfc894" stroke-width="2"/>'
      +text(347,118,'V cầu','#fcd77a',18)+text(347,144,'2/3 V trụ','#fcd77a',18);
  }else if(kind==='fibonacci'){
    const values=[1,1,2,3,5,8,13];let x=20;
    values.forEach((v,i)=>{s+=`<rect x="${x}" y="${210-v*6}" width="${v*4+5}" height="${v*6}" fill="#69c4b533" stroke="#80e4cb"/>`;s+=text(x+v*2+2,230,String(v),'#e8fffb',17);x+=v*4+12;});
    s+=text(214,48,'1, 1, 2, 3, 5, 8, 13…','#f6d79d',24);
  }else if(kind==='coordinate'){
    s=axes()+`<path d="${pathPoints(x=>170-.007*(x-220)**2,74,395)}" fill="none" stroke="#ffcc7f" stroke-width="4"/>`+circle(220,170,6)+text(290,102,'M(x; y)','#9ee5f0');
  }else if(kind==='probability'){
    for(let r=0;r<6;r++)for(let c=0;c<6;c++){
      const x=62+c*51,y=42+r*35;
      s+=`<rect x="${x}" y="${y}" width="44" height="28" rx="4" fill="${r+c>=7?'#edb879':'#20516a'}" stroke="#7daebe" opacity=".93"/>`;
    }
    s+=text(221,258,'36 kết quả đồng khả năng','#e9e0bb',18);
  }else if(kind==='pascal'){
    const rows=[[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1],[1,5,10,10,5,1]];
    rows.forEach((row,r)=>row.forEach((val,c)=>{const x=220+(c-(row.length-1)/2)*60,y=38+r*38;s+=`<circle cx="${x}" cy="${y}" r="16" fill="${r===5?'#216b82':'#193e59'}" stroke="#5cbed0"/>`+text(x,y+6,String(val),'#f9e4b1',18);}));
  }else if(kind==='derivative'){
    s=axes()+`<path d="${pathPoints(x=>210-.004*(x-75)**2,74,295)}" stroke="#6cdeeb" stroke-width="4" fill="none"/>`+line(110,211.5,370,55.5,'#ffd58d',3)+circle(150,187.5,7)+text(316,48,'Tiếp tuyến','#ffdea3',18);
  }else if(kind==='integral'){
    s=axes();for(let x=86;x<340;x+=25){const y=215-0.0028*(x-73)**2;s+=`<rect x="${x}" y="${y}" width="25" height="${218-y}" fill="#59c9bc66" stroke="#62dfe0" stroke-width="1"/>`;}
    s+=`<path d="${pathPoints(x=>215-.0028*(x-73)**2,73,340)}" fill="none" stroke="#ffd386" stroke-width="4"/>`;
  }else if(kind==='polyhedron'){
    s='<polygon points="134,70 264,70 305,107 175,107" fill="#1b7aa2aa" stroke="#82e3f3" stroke-width="3"/>'
      +'<polygon points="134,70 175,107 175,215 134,178" fill="#26719caa" stroke="#82e3f3" stroke-width="3"/>'
      +'<polygon points="175,107 305,107 305,215 175,215" fill="#5ab4bd66" stroke="#82e3f3" stroke-width="3"/>'
      +text(218,254,'8 − 12 + 6 = 2','#fbd08a',23);
  }else if(kind==='shadow-measure'){
    // Original pedagogical diagram: two vertical poles and parallel sun rays.
    // Similarity condition: 160/120 = 60/45; two triangles are proportional.
    s=line(24,225,414,225,'#91cad7',3)
      +line(117,225,117,65,'#f1ba70',7)+line(117,65,237,225,'#f5d78b',2)
      +line(305,225,305,165,'#70decf',7)+line(305,165,350,225,'#f5d78b',2)
      +text(95,137,'H','#f9db93',23)+text(292,197,'h','#a0f5dc',20)
      +text(184,251,'L','#f9db93',20)+text(351,251,'ℓ','#a0f5dc',20)
      +text(250,40,'H/h = L/ℓ','#f4dfaa',25)+text(240,70,'Tia nắng song song','#a4dbe5',16);
  }else if(kind==='proof-flow'){
    // Metaphor of mathematical reasoning, NOT a reconstruction of Ngô's proof.
    for(const [x,label] of [[25,'Giả thiết'],[174,'Lập luận'],[323,'Kết luận']]){
      s+=`<rect x="${x}" y="83" width="118" height="70" rx="12" fill="#194962" stroke="#82ddea" stroke-width="3"/>`
        +text(x+59,124,label,'#f0ebd6',17);
    }
    s+=line(145,117,171,117,'#f7d08a',3)+line(294,117,320,117,'#f7d08a',3)
      +'<path d="M164 110L173 117L164 124" fill="none" stroke="#f7d08a" stroke-width="3"/>'
      +'<path d="M313 110L322 117L313 124" fill="none" stroke="#f7d08a" stroke-width="3"/>'
      +text(220,211,'Sơ đồ tư duy, không phải Bổ đề cơ bản','#b8d3e4',17);
  }else if(kind==='progression'){
    for(let i=1;i<=8;i++)for(let j=0;j<i;j++)s+=circle(26+i*45,222-j*21,4.6,'#7ee2d0');
    s+=text(223,42,'1 + 2 + ⋯ + n','#ffe09c',23)+text(223,78,'n(n + 1)/2','#ffe09c',21);
  }else if(kind==='balance-equation'){
    // Balance scale demonstrating equivalent equation transformations
    s='<polygon points="200,225 240,225 220,185" fill="#f7d08a" stroke="#ffe09c" stroke-width="2"/>'
      +line(60,185,380,185,'#91cad7',5)
      +'<ellipse cx="120" cy="185" rx="46" ry="12" fill="#1b4b60" stroke="#72d3e4" stroke-width="2"/>'
      +'<ellipse cx="320" cy="185" rx="46" ry="12" fill="#1b4b60" stroke="#72d3e4" stroke-width="2"/>'
      +'<rect x="85" y="115" width="70" height="55" rx="6" fill="#205570" stroke="#8ce3f0" stroke-width="2"/>'
      +'<rect x="290" y="115" width="60" height="55" rx="6" fill="#205570" stroke="#8ce3f0" stroke-width="2"/>'
      +text(120,150,'ax + b','#f7d08a',18)
      +text(320,150,'c','#9ee5f0',22)
      +text(220,55,'ax + b = c  (a ≠ 0)','#ffe09c',22)
      +text(220,252,'Cân bằng hai vế phương trình (Minh họa sư phạm)','#b8d3e4',16);
  }else if(kind==='germain-prime'){
    // Sophie Germain prime condition: p and 2p+1 both prime
    s='<rect x="35" y="70" width="370" height="135" rx="12" fill="#16384c" stroke="#5cb8cb" stroke-width="2"/>'
      +text(220,105,'p ∈ ℙ  ⟹  2p + 1 ∈ ℙ','#ffd58d',22)
      +line(55,125,385,125,'#41778f',1)
      +text(220,155,'p = 2 ➔ 5  |  p = 3 ➔ 7  |  p = 5 ➔ 11','#a2ecfb',17)
      +text(220,185,'p = 11 ➔ 23  |  p = 23 ➔ 47','#a2ecfb',17)
      +text(220,42,'Số nguyên tố Sophie Germain','#fbd08a',22)
      +text(220,245,'Số nguyên tố mở rộng Toán 6 (Minh họa sư phạm)','#b8d3e4',16);
  }else if(kind==='algorithm-flow'){
    // Ada Lovelace algorithm flow representation
    const steps=[[24,'Bắt đầu',68],[112,'Lặp k=1..n',86],[218,'S = S + k',86],[324,'Xuất S',68]];
    for(const [x,lbl,w] of steps){
      s+=`<rect x="${x}" y="95" width="${w}" height="55" rx="10" fill="#1b4b66" stroke="#7de4f4" stroke-width="2"/>`
        +text(x+w/2,130,lbl,'#f0ebd6',15);
    }
    s+=line(92,122,112,122,'#f7d08a',3)+line(198,122,218,122,'#f7d08a',3)+line(304,122,324,122,'#f7d08a',3)
      +text(220,50,'S_n = 1 + 2 + ⋯ + n','#ffe09c',22)
      +text(220,245,'Sơ đồ thuật toán & Vòng lặp tính toán (Toán – Tin)','#b8d3e4',16);
  }else if(kind==='symmetry-invariant'){
    // Emmy Noether invariant / symmetry illustration (even function symmetry)
    s=line(220,230,220,50,'#f7d08a',2,'stroke-dasharray="5,4"')
      +`<path d="${pathPoints(x=>70+.0032*(x-220)**2,65,375)}" fill="none" stroke="#6ce0ef" stroke-width="4"/>`
      +circle(140,90,5)+circle(300,90,5)
      +line(140,90,300,90,'#ffe09c',1,'stroke-dasharray="4,4"')
      +text(140,118,'M(-x; y)','#9ee5f0',15)+text(300,118,'M\'(x; y)','#9ee5f0',15)
      +text(220,38,'f(-x) = f(x)','#ffd58d',22)
      +text(220,252,'Trục đối xứng: tính bất biến đồ thị hàm số chẵn','#b8d3e4',16);
  }else if(kind==='curved-surface'){
    // Maryam Mirzakhani curved surface path vs straight chord
    s='<ellipse cx="220" cy="135" rx="88" ry="88" fill="#18425744" stroke="#6ce0ef" stroke-width="3"/>'
      +'<ellipse cx="220" cy="135" rx="88" ry="24" fill="none" stroke="#6ce0ef" stroke-width="1.5" stroke-dasharray="4,4"/>'
      +'<path d="M 158 75 A 88 88 0 0 1 282 75" fill="none" stroke="#ffd58d" stroke-width="4"/>'
      +line(158,75,282,75,'#ff8d8d',2,'stroke-dasharray="4,3"')
      +circle(158,75,5,'#ffd58d')+circle(282,75,5,'#ffd58d')
      +text(220,50,'s = Rθ  (đường trên mặt cầu)','#ffd58d',19)
      +text(220,105,'đoạn thẳng xuyên tâm khối cầu','#ff9b9b',14)
      +text(220,252,'Hình học mặt cong · Liên hệ mở rộng SGK','#b8d3e4',16);
  }
  return svg(s||text(220,138,person.contribution));
}
