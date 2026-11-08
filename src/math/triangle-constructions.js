/**
 * Geometrically exact triangle constructions shared by Canvas, JSXGraph and QA.
 * Coordinates are real-plane units; do not round before determining incidences.
 */
const subtract=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const midpoint=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const det=(a,b)=>a[0]*b[1]-a[1]*b[0];
const finitePoint=p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite);

/** Convention BC=a, CA=b, AB=c; A on the upper side of BC. */
export function triangleFromSides(a,b,c){
  if (![a,b,c].every(v=>Number.isFinite(v)&&v>0) || !(a+b>c&&a+c>b&&b+c>a))
    throw new RangeError('Ba cạnh phải dương và thỏa mãn bất đẳng thức tam giác.');
  const B=[-a/2,0],C=[a/2,0],x=(c*c-b*b)/(2*a);
  const heightSquared=c*c-(x+a/2)**2;
  if(heightSquared<=1e-9)throw new RangeError('Tam giác suy biến.');
  return {A:[x,Math.sqrt(heightSquared)],B,C};
}

export function triangleConstructions(A,B,C){
  if(![A,B,C].every(finitePoint))throw new RangeError('Tọa độ tam giác không hợp lệ.');
  const ab=subtract(B,A),ac=subtract(C,A),area=Math.abs(det(ab,ac))/2;
  if(area<1e-7)throw new RangeError('Ba đỉnh tam giác không được thẳng hàng.');
  const a=distance(B,C),b=distance(C,A),c=distance(A,B),perimeter=a+b+c;
  const midA=midpoint(B,C),midB=midpoint(C,A),midC=midpoint(A,B);
  const G=[(A[0]+B[0]+C[0])/3,(A[1]+B[1]+C[1])/3];
  const I=[(a*A[0]+b*B[0]+c*C[0])/perimeter,(a*A[1]+b*B[1]+c*C[1])/perimeter];
  // O solves 2*(B-A) . (O-A) = |B|^2 - |A|^2 (likewise C).
  const normalizer=2*det(ab,ac);
  const rhsB=B[0]**2+B[1]**2-A[0]**2-A[1]**2;
  const rhsC=C[0]**2+C[1]**2-A[0]**2-A[1]**2;
  const O=[(rhsB*ac[1]-rhsC*ab[1])/normalizer,(ab[0]*rhsC-ac[0]*rhsB)/normalizer];
  const H=[A[0]+B[0]+C[0]-2*O[0],A[1]+B[1]+C[1]-2*O[1]];
  const foot=(p,u,v)=>{const uv=subtract(v,u),den=uv[0]**2+uv[1]**2;
    const t=((p[0]-u[0])*uv[0]+(p[1]-u[1])*uv[1])/den;
    return [u[0]+t*uv[0],u[1]+t*uv[1]];};
  return {A,B,C,a,b,c,area,perimeter,G,I,O,H,midA,midB,midC,
    radiusCircum:distance(O,A),radiusIn:2*area/perimeter,
    altitudeA:foot(A,B,C),altitudeB:foot(B,C,A),altitudeC:foot(C,A,B)};
}

/** Keep drag meaningful without silently changing a different vertex. */
export function triangleDragIsValid(A,B,C,paramSpec,{minArea=0.20}={}){
  if(![A,B,C].every(finitePoint))return false;
  const cross=det(subtract(B,A),subtract(C,A));
  if(Math.abs(cross)<2*minArea)return false;
  const lengths={a:distance(B,C),b:distance(C,A),c:distance(A,B)};
  for(const [key,len] of Object.entries(lengths)){
    const limits=paramSpec?.[key];
    if(limits&&(len<limits[1]-1e-7||len>limits[2]+1e-7))return false;
  }
  return true;
}
