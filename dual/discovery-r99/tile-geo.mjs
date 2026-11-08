/** Pure mathematical conversions for verified DEM geometry; suitable for offline tests. */
export const WEB_MERCATOR_MAX=85.05112878;
export function lonLatTile(lon,lat,zoom){
 if(!Number.isFinite(lon)||!Number.isFinite(lat)||!Number.isInteger(zoom)||zoom<0||zoom>15)throw Error('Tọa độ hoặc zoom không hợp lệ');
 const n=2**zoom;
 const phi=Math.max(-WEB_MERCATOR_MAX,Math.min(WEB_MERCATOR_MAX,lat))*Math.PI/180;
 const tx=((lon+180)/360*n+n)%n;
 const ty=(1-Math.asinh(Math.tan(phi))/Math.PI)/2*n;
 return {x:tx,y:Math.min(n-1e-9,Math.max(0,ty)),zoom};
}
export function decodeTerrarium(r,g,b){return r*256+g+b/256-32768;}
export function metresPerPixel(lat,zoom){return 156543.03392804097*Math.cos(lat*Math.PI/180)/(2**zoom);}
export function tilePlan(lng,lat,zoom,tiles=3){
 if(![1,2,3].includes(tiles))throw Error('tiles phải là 1, 2 hoặc 3');
 const n=2**zoom,{x,y}=lonLatTile(lng,lat,zoom);const x0=Math.floor(x)-Math.floor(tiles/2),y0=Math.floor(y)-Math.floor(tiles/2);
 return {zoom,tiles,x0,y0,totalPixels:tiles*256,pixelMetres:metresPerPixel(lat,zoom),centerX:x,centerY:y,worldTiles:n};
}
export function tileCoords(plan){const points=[];for(let r=0;r<plan.tiles;r++)for(let c=0;c<plan.tiles;c++){
 const x=(plan.x0+c+plan.worldTiles)%plan.worldTiles,y=plan.y0+r;
 if(y<0||y>=plan.worldTiles)throw Error('Lát địa hình vượt cực');
 points.push({zoom:plan.zoom,x,y,row:r,col:c});
}return points;}
