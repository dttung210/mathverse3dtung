const catalog=await fetch('/museum-data/catalog.json').then(r=>r.json());
const $=id=>document.getElementById(id);
$('grade-label').textContent='Ch\u1ecdn l\u1edbp:';
$('back-link').textContent='V\u1ec1 s\u1ea3nh hai khu';
for(let g=6;g<=12;g++){$('grade').add(new Option(`L\u1edbp ${g}`,String(g)));}
function render(){
  const grade=Number($('grade').value),list=catalog.items.filter(x=>x.grade===grade).sort((a,b)=>a.number-b.number);
  $('summary').textContent=`L\u1edbp ${grade}: ${list.length} infographic (xem tr\u1ef1c ti\u1ebfp, kh\u00f4ng c\u00f3 n\u00fat t\u1ea3i \u1ea3nh).`;
  const grid=$('grid');grid.replaceChildren();
  for(const item of list){
    const card=document.createElement('article');card.tabIndex=0;
    const img=document.createElement('img');img.loading='lazy';img.src=item.src;img.alt=item.title;
    const title=document.createElement('h2');title.textContent=item.title;card.append(img,title);
    function open(){ $('title').textContent=`To\u00e1n ${grade}: ${item.title}`; $('full').src=item.src; $('overlay').hidden=false;}
    card.onclick=open;card.onkeydown=e=>{if(e.key==='Enter')open();};grid.append(card);
  }
}
$('grade').onchange=render;
$('close').onclick=()=>{$('overlay').hidden=true;$('full').removeAttribute('src');};
window.addEventListener('keydown',e=>{if(e.key==='Escape')$('close').click();});
render();
