/** Position of line/circle and circle/circle, robust against tangency boundaries. */
export const CIRCLE_POSITION_IDS=Object.freeze(Array.from({length:6},(_,i)=>`9-06-C0${i+1}`));
export const isCirclePosition=id=>CIRCLE_POSITION_IDS.includes(id);
const near=(a,b)=>Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(a),Math.abs(b));
export function classifyLineCircle(r,d){
 if(!Number.isFinite(r)||!Number.isFinite(d)||r<=0||d<0)throw Error('Bán kính phải dương; khoảng cách d không âm.');
 if(near(r,d))return 'tangent';return d<r?'secant':'disjoint';
}
export function lineCircleGeometry(r,d){
 const state=classifyLineCircle(r,d);
 const intersections=state==='secant'?[[Math.sqrt(Math.max(0,r*r-d*d)),d],[-Math.sqrt(Math.max(0,r*r-d*d)),d]]:state==='tangent'?[[0,d]]:[];
 return {state,intersections};
}
export function classifyTwoCircles(R,r,d){
 if(!Number.isFinite(R)||!Number.isFinite(r)||!Number.isFinite(d)||R<=0||r<=0||d<0)throw Error('Hai bán kính phải dương; khoảng cách hai tâm không âm.');
 if(near(d,0)&&near(R,r))return 'coincident';
 if(near(d,R+r))return 'externally_tangent';
 if(near(d,Math.abs(R-r)))return 'internally_tangent';
 if(d>R+r)return 'separate';
 if(d<Math.abs(R-r))return 'contained';
 return 'intersect';
}
export function twoCircleGeometry(R,r,d){
 const state=classifyTwoCircles(R,r,d);const intersections=[];
 if((state==='intersect'||state.endsWith('_tangent'))&&d>0){
  const x=(d*d+R*R-r*r)/(2*d);const y=Math.sqrt(Math.max(0,R*R-x*x));
  intersections.push([x,y]);if(state==='intersect'&&y>0)intersections.push([x,-y]);
 }
 return {state,intersections};
}
export const CIRCLE_LABELS={secant:'Cắt nhau tại hai điểm',tangent:'Tiếp xúc tại một điểm',disjoint:'Không có điểm chung',intersect:'Hai đường tròn cắt nhau tại hai điểm',externally_tangent:'Tiếp xúc ngoài',internally_tangent:'Tiếp xúc trong',separate:'Hai đường tròn ở ngoài nhau',contained:'Một đường tròn nằm trong đường tròn kia, không tiếp xúc',coincident:'Hai đường tròn trùng nhau'};
export const circleDefaults=id=>{
 if(!isCirclePosition(id))throw Error('Không có mô hình này');
 return ({'9-06-C01':{r:3,d:1},'9-06-C02':{r:3,d:3},'9-06-C03':{r:3,d:4},'9-06-C04':{R:3,r:2,d:3},'9-06-C05':{R:3,r:2,d:5},'9-06-C06':{R:3,r:2,d:6}})[id];
};
export function circleExpected(id,state){
 return ({'9-06-C01':['secant'],'9-06-C02':['tangent'],'9-06-C03':['disjoint'],'9-06-C04':['intersect'],'9-06-C05':['externally_tangent','internally_tangent'],'9-06-C06':['separate','contained','coincident']})[id]?.includes(state)||false;
}
export function circleLatex(id){
 return ({'9-06-C01':'0\\le d<R\\Rightarrow 2\\text{ giao điểm}','9-06-C02':'d=R\\Rightarrow 1\\text{ tiếp điểm}','9-06-C03':'d>R\\Rightarrow 0\\text{ giao điểm}','9-06-C04':'|R-r|<d<R+r\\Rightarrow 2\\text{ giao điểm}','9-06-C05':'d=R+r\\quad\\text{hoặc}\\quad d=|R-r|','9-06-C06':'d>R+r\\quad\\text{hoặc}\\quad d<|R-r|\\quad\\text{hoặc}\\quad(d=0,R=r)'})[id]||'';
}
