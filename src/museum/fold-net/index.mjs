/**
 * MATHVERSE R87 — 20 educational 2D<->3D folding/unfolding models.
 * Staging library for IN-UNIVERSE museum pedestals; not an add-on, not auto-registered.
 * Current project source remains untouched until Antigravity installs it.
 */
import {
  FOLD_NET_CATALOG,
  getFoldNetDefinition,
  R87_MUSEUM_PLACEMENT,
  EXTENDED_MUSEUM_MODE_TO_FOLD_NET,
  getFoldNetPlacement,
  getFoldNetForModeId,
  getNewFoldNetExhibitsForRoom,
  getFoldNetParamSchema,
  computeFoldNetFormulas
} from './catalog.mjs';
import {createPolyhedronFold} from './polyhedron-fold.mjs';
import {createCurvedFold} from './curved-fold.mjs';
import {FoldNetTimeline} from './timeline.mjs';

export {
  FOLD_NET_CATALOG,
  getFoldNetDefinition,
  R87_MUSEUM_PLACEMENT,
  EXTENDED_MUSEUM_MODE_TO_FOLD_NET,
  getFoldNetPlacement,
  getFoldNetForModeId,
  getNewFoldNetExhibitsForRoom,
  getFoldNetParamSchema,
  computeFoldNetFormulas,
  FoldNetTimeline
};

export function createFoldNetExhibit(id, overrides={}){
 const def=getFoldNetDefinition(id);
 if(!def)throw Error(`Unknown MATHVERSE 3D folding exhibit: ${id}`);
 const params={...def.defaultParams,...overrides};
 const body=def.shapeKind==='polyhedron'?
  createPolyhedronFold(def.notebookIndex,params):createCurvedFold(def.notebookIndex,params);
 const timeline=new FoldNetTimeline(body,{duration:6.5});
 let disposed=false;
 return {
  id,definition:def,params,group:body.group,body,timeline,
  /** Call when a museum exhibit is first viewed; actual folding is visible, not an instant completed mesh. */
  onEnter(){timeline.enter();},
  onLeave(){timeline.pause();},
  update(dt){return timeline.tick(dt);},
  setProgress(progress){timeline.pause();timeline.seek(progress);},
  getProgress(){return timeline.progress;},
  play(){timeline.play(1);},
  unfold(){timeline.play(-1);},
  pause(){timeline.pause();},
  stepForward(){timeline.step(1);return timeline.progress;},
  stepBackward(){timeline.step(-1);return timeline.progress;},
  reset(){timeline.reset();},
  foldInstant(){timeline.pause();timeline.seek(1);},
  setSpeed(speed){timeline.setSpeed(speed);},
  setWireframe(value){body.setWireframe(value);},
  setFacesVisible(value){body.setFacesVisible(value);},
  setEdgesVisible(value){body.setEdgesVisible?.(value);},
  setHingesVisible(value){body.setFoldMarkersVisible?.(value);},
  setXRayMode(value){body.setXRayMode?.(value);},
  getFormulas(){return computeFoldNetFormulas(id,params,timeline.progress);},
  getDiagnostic(){return body.getDiagnostic();},
  dispose(){if(!disposed){timeline.pause();body.dispose();disposed=true;}}
 };
}
