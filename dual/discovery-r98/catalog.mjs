/** One source of truth: only approved, locally stored scan + photograph pairs appear. */
const state={approved:[],records:[],loaded:false,error:null};
export const getR98Approved=()=>state.approved;
export const getR98Asset=id=>state.approved.find(x=>x.id===id)||null;
export const getR98State=()=>state;
export async function refreshR98Catalog(){
 try{
  const response=await fetch('/api/discovery/r98/catalog',{cache:'no-store'});
  if(!response.ok)throw Error(`HTTP ${response.status}`);
  const data=await response.json();
  state.approved=(data.approved||[]).filter(a=>a.status==='approved' && a.glb?.url && a.photo?.url && a.review?.modelSource && a.review?.photoSource);
  state.records=data.records||[];state.loaded=true;state.error=null;
 }catch(e){state.approved=[];state.records=[];state.loaded=true;state.error=e.message;}
 window.dispatchEvent(new CustomEvent('mathverse-r98-catalog-updated',{detail:{approved:state.approved,records:state.records,error:state.error}}));
 return state.approved;
}
