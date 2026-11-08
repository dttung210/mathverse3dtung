/** R7.0 Grade-6 direct manipulation for every parameterized source mode.
 * Pure, bounded, reusable and testable; does not change mathematical engines.
 * The user chooses a parameter and drags horizontally across the SVG-size
 * Canvas stage. Array parameters (chart heights) have one handle per bar.
 */
const RANGES={
 a:[.5,10,.1],b:[.5,10,.1],height:[.2,10,.1],skew:[-4,4,.1],
 rotation:[-180,360,1],speed:[1,8,.25],angle:[0,180,1],measure:[0,12,.1],
 position:[-3,3,.1],fold:[0,180,1],value:[-20,100,1],step:[-12,12,1],
 count:[2,11,1],type:[0,1,1],numerator:[0,100,1],denominator:[1,100,1],
 factor:[1,6,1],other:[0,100,1],total:[1,100,1],unit:[1,10,1],segments:[2,6,1],progress:[0,1,.01]
};
const TITLES={a:'Cạnh a',b:'Cạnh b',height:'Chiều cao',skew:'Độ nghiêng',rotation:'Góc quay',speed:'Tốc độ',angle:'Góc',measure:'Độ dài',position:'Vị trí',fold:'Góc gấp',value:'Giá trị',step:'Bước nhảy',count:'Số lượng',type:'Kiểu hình',numerator:'Tử số',denominator:'Mẫu số',factor:'Hệ số',other:'Giá trị thứ hai',total:'Tổng số',unit:'Đơn vị',segments:'Số phần',progress:'Mức tách/ghép',values:'Chiều cao cột',otherValues:'Cột đối chiếu'};
const bounded=(v,a,b)=>Math.max(a,Math.min(b,v));
export function makeGrade6DragSpec(model){
  const params=model?.defaults||{};
  const result=[];
  for(const [key,v] of Object.entries(params)){
    if(typeof v==='number' && Number.isFinite(v))result.push({key,label:TITLES[key]||key});
    else if(Array.isArray(v))v.forEach((value,i)=>{if(Number.isFinite(value))result.push({key:`${key}:${i}`,label:`${TITLES[key]||key} ${i+1}`});});
  }
  return result;
}
export function applyGrade6Drag(model,params,key,x,y){
  if(!model||!params||typeof key!=='string'||!Number.isFinite(x)||!Number.isFinite(y))return false;
  const [prop,part]=key.split(':'),index=part===undefined?-1:Number(part);
  let old;
  if(index>=0){if(!Array.isArray(params[prop])||!Number.isFinite(params[prop][index]))return false;old=params[prop][index];}
  else{if(!Number.isFinite(params[prop]))return false;old=params[prop];}
  let [a,b,step]=RANGES[prop]||[Math.min(0,old-10),Math.max(10,old+10),Number.isInteger(old)?1:.1];
  let low=a,hi=b;
  if(prop==='value'&&model.variant==='place')hi=9999;
  if(prop==='denominator'&&model.variant==='addsame')low=2;
  if(prop==='measure'&&model.variant==='clock'){low=0;hi=59;step=1;}
  if(prop==='angle'&&model.variant==='clock'){low=0;hi=360;step=30;}
  const fraction=bounded(x,.0,1);
  let result=low+fraction*(hi-low);
  result=Math.round(result/step)*step;
  result=Number(result.toFixed(4));
  if(prop==='numerator'&&Number.isFinite(params.denominator))result=Math.min(result,params.denominator);
  if(index>=0)params[prop][index]=result;
  else params[prop]=result;
  if(prop==='denominator'&&Number.isFinite(params.numerator))params.numerator=Math.min(params.numerator,result);
  if(prop==='count')params[prop]=Math.max(2,Math.round(params[prop]));
  if(prop==='segments')params[prop]=Math.max(2,Math.round(params[prop]));
  return true;
}
