import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeCampusMap} from '../dual/campus-map-ui-v3.mjs';
class FakeElement {
  constructor(tag='div'){this.tagName=tag;this.children=[];this.attributes={};this.dataset={};this.listeners={};this.hidden=true;this.textContent='';}
  appendChild(e){if(!e)throw Error('Invalid child');this.children.push(e);return e;}
  setAttribute(k,v){this.attributes[k]=String(v);if(k==='data-destination')this.dataset.destination=String(v);}
  removeAttribute(k){delete this.attributes[k];}
  addEventListener(k,fn){this.listeners[k]=fn;}
  querySelector(tag){if(this.tagName===tag)return this;for(const c of this.children){const n=c.querySelector(tag);if(n)return n;}return null;}
  focus(){this.focused=true;}
  closest(){return null;}
}
test('The plan SVG constructs every game marker and updates student position without WebGL',()=>{
 const ids=['campus-map-dialog','campus-map-svg','campus-map-legend','campus-map-open','campus-map-close','campus-map-overview','campus-map-parkview'];
 const nodes=Object.fromEntries(ids.map(id=>[id,new FakeElement()]));
 const prior=globalThis.document;
 globalThis.document={getElementById:id=>nodes[id],createElementNS:(_ns,tag)=>new FakeElement(tag),createElement:tag=>new FakeElement(tag)};
 try{
  const visited=[];
  const ctrl=initializeCampusMap({navigate:t=>visited.push(t),aerial:t=>visited.push(t),notice:()=>{}});
  assert.equal(nodes['campus-map-legend'].children.length,15);
  const svg=nodes['campus-map-svg'];
  const buttons=svg.children.filter(n=>n.attributes['data-destination']?.startsWith('zone:'));
  assert.equal(buttons.length,10);
  ctrl.updatePlayer({x:0,z:138});
  const dot=svg.children.find(n=>n.tagName==='g'&&n.attributes['aria-label']==='Vị trí nhân vật').querySelector('circle');
  assert.ok(Number.isFinite(Number(dot.attributes.cx)));
  ctrl.show();assert.equal(nodes['campus-map-dialog'].hidden,false);
  ctrl.hide();assert.equal(nodes['campus-map-dialog'].hidden,true);
 }finally{globalThis.document=prior;}
});
