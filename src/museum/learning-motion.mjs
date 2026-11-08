/**
 * R77 teaching motion contract: physical mathematical change, incremental
 * geometric construction, or an honest static exhibit. Never ambient wobble.
 * Run once and HOLD the final result. The teacher may scrub/restart at will.
 */
export const EXHIBIT_CYCLE_SECONDS=10;
const clamp=(v,lo=0,hi=1)=>Math.min(hi,Math.max(lo,Number(v)||0));
const ease=t=>{const x=clamp(t);return x*x*(3-2*x);};

export function educationalFrame(seconds,duration=EXHIBIT_CYCLE_SECONDS){
  const time=clamp(seconds,0,Math.max(.1,Number(duration)||EXHIBIT_CYCLE_SECONDS));
  const fraction=time/Math.max(.1,Number(duration)||EXHIBIT_CYCLE_SECONDS);
  const progress=ease((fraction-.09)/.67);
  return {time,fraction,progress,stage:progress<.32?0:progress<.78?1:2};
}

export const SEVEN_GRADE_PHASES=Object.freeze([
  {grade:6,theme:'Khối, ghép hình, đối xứng và xác suất trực quan'},
  {grade:7,theme:'Góc, tam giác bằng nhau, đường đặc biệt và biểu đồ'},
  {grade:8,theme:'Định lý Pythagore, đồng dạng và dựng hình'},
  {grade:9,theme:'Quan hệ đường tròn, mặt cắt và khối tròn xoay'},
  {grade:10,theme:'Vectơ, đồ thị, đường tròn và miền nghiệm'},
  {grade:11,theme:'Hình không gian, góc nhị diện và lượng giác'},
  {grade:12,theme:'Oxyz, tích phân, mặt cắt và thể tích tròn xoay'}
]);

export function modelMotionPlan(mode={}){
  const lab=String(mode.sourceLabId||mode.labId||mode.id||'').slice(0,5);
  const grade=Number(mode.grade||lab.split('-')[0]||0);
  const name=String(mode.name||mode.title||'');
  let kind='construction';
  if (/^(?:7-08|8-08|9-12|9-13|10-10|10-11|11-03|11-04|11-13|12-05|12-11)$/.test(lab))kind='data';
  else if(/^(?:9-10|11-09|12-07|8-09|7-09)$/.test(lab))kind='solid';
  else if(/^(?:10-04|10-05|12-04|11-06)$/.test(lab))kind='vector';
  else if(/^(?:10-06|10-07|10-08|10-09|11-02|12-06)$/.test(lab))kind='graph';
  else if(/^(?:11-05|11-07|11-08|12-08|12-09|12-10)$/.test(lab))kind='space';
  const descriptions={
    construction:['Đặt các điểm và dữ kiện','Dựng đúng các đoạn và đường phụ','Giữ hình dựng và quan sát tính chất'],
    data:['Xác định các giá trị ban đầu','Dựng từng cột dữ liệu theo giá trị','Giữ biểu diễn và so sánh số liệu'],
    solid:['Quan sát đáy và kích thước','Dựng chiều cao, cạnh và mặt có liên quan','Giữ khối hoàn chỉnh để suy luận'],
    vector:['Xác định gốc, phương và chiều','Dựng vectơ hoặc phép tịnh tiến','Đọc quan hệ vectơ sau biến đổi'],
    graph:['Dựng hệ tọa độ và điểm đầu','Vẽ tiến dần theo miền xác định','Quan sát đồ thị hoàn thành'],
    space:['Dựng đối tượng ban đầu','Bổ sung mặt, đường và yếu tố vuông góc','Kiểm tra quan hệ trong không gian']
  };
  return {kind,grade,lab,name,steps:descriptions[kind]};
}

function makeSegmentAnimator(obj){
  const {a,b}=obj.userData.mathLine;
  const A=new obj.position.constructor(...a),B=new obj.position.constructor(...b);
  const v=B.clone().sub(A),h=Math.max(1e-7,v.length());
  return (p)=>{
    const t=clamp(p);
    obj.visible=t>1e-4;
    obj.scale.y=Math.max(1e-5,t);
    obj.position.copy(A).addScaledVector(v,t*.5);
  };
}

/** This reveals an ACTUAL segment from one endpoint to the other. */
export function createEducationalMotion(carrier,mode={}){
  const plan=modelMotionPlan(mode),children=[...carrier.children];
  const segments=[],curves=[],surfaces=[],arrows=[],bars=[];
  carrier.traverse?.(o=>{
    if(o.userData?.mathLine&&o.geometry?.parameters?.height){
      segments.push({o,pose:makeSegmentAnimator(o)});
    }else if(o.userData?.mathCurve&&o.geometry?.index){
      curves.push({o,count:o.geometry.index.count});
    }else if(o.userData?.mathSurface&&o.material){
      surfaces.push({o,alpha:o.material.opacity??1});
    }else if(o.userData?.mathArrowTip){
      arrows.push(o);
    }
    if(plan.kind==='data'&&o.isMesh&&o.geometry?.type==='BoxGeometry'){
      const {width=0,height=0}=o.geometry.parameters||{};
      if(height>.19&&height>width*.9){bars.push({o,height,y:o.position.y});}
    }
  });
  const bespoke=typeof carrier.userData.animatePart==='function';
  const isConstruction=!bespoke&&(segments.length>0||curves.length>0||bars.length>0);
  let lastFallbackStage=-1;
  function apply(seconds){
    const frame=educationalFrame(seconds);
    const {progress,stage}=frame;
    carrier.rotation.y=0;
    if(bespoke){
      children.forEach(o=>o.visible=true);
      carrier.userData.animatePart(progress);
    }else if(isConstruction){
      children.forEach(o=>o.visible=true);
      const count=segments.length;
      segments.forEach(({pose},i)=>pose(clamp((progress*.9*count)-i)));
      arrows.forEach(o=>{const stem=o.userData.mathArrowStem;o.visible=stem?.visible&&stem.scale.y>.97;});
      curves.forEach(({o,count:total})=>{
        const p=clamp((progress-.08)/.85);
        o.geometry.setDrawRange(0,Math.min(total,Math.floor(total*p/6)*6));
      });
      surfaces.forEach(({o,alpha})=>{
        o.material.transparent=true;
        o.material.opacity=alpha*clamp((progress-.60)/.35);
      });
      bars.forEach(({o,height,y},i)=>{
        const rise=clamp(progress*bars.length-i);
        o.scale.y=Math.max(1e-5,rise);
        o.position.y=(y-height/2)+height*rise/2;
      });
    }else if(children.length>=4){
      // Unsupported geometries are shown in a labeled sequence, never rocked.
      const first=Math.max(2,Math.ceil(children.length*.42));
      const second=Math.max(first,Math.ceil(children.length*.74));
      const shown=stage===0?first:stage===1?second:children.length;
      if(stage!==lastFallbackStage){children.forEach((o,i)=>{o.visible=i<shown;});lastFallbackStage=stage;}
    }
    return {...frame,kind:plan.kind, motionClass:bespoke?'geometric-transformation':isConstruction?'geometric-construction':'static-presentation',
      description:bespoke?(carrier.userData.motionMeaning||plan.steps[stage]):plan.steps[stage]};
  }
  return {plan,apply,quality:bespoke?'geometric-transformation':isConstruction?'geometric-construction':'static-presentation'};
}
