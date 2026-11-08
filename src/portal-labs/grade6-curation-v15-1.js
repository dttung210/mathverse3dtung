/** V15.1 Math 6 museum curation: 35 legible, non-redundant exhibits in four portal rooms.
 * The 63 source lab definitions remain untouched in data/models.toan6.json and the
 * supplemental V15 file. Non-selected experiments are archived, NOT deleted.
 * Selection is intentional by curriculum representation & 3D gallery readability.
 */
export const GRADE6_ACTIVE_EXHIBITS=Object.freeze({
 plane:Object.freeze([
  'toan6-tam-giac-deu','toan6-hinh-vuong','toan6-luc-giac-deu',
  'toan6-chu-nhat','toan6-hinh-thoi','toan6-binh-hanh','toan6-thang-can',
  'toan6-cat-binh-hanh','toan6-lat-nen-da-giac'
 ]),
 symmetry:Object.freeze([
  'toan6-doi-xung-truc','toan6-doi-xung-tam','toan6-diem-thuoc-duong',
  'toan6-hai-duong-thang','toan6-hai-tia-doi-nhau','toan6-do-doan-thang',
  'toan6-trung-diem','toan6-goc-dong','toan6-dong-ho-goc'
 ]),
 number:Object.freeze([
  'toan6-truc-so-tu-nhien','toan6-truc-so-nguyen','toan6-buoc-nhay-so-nguyen',
  'toan6-cay-thua-so','toan6-thanh-phan-so','toan6-phan-so-bang-nhau',
  'toan6-luoi-100-phan-tram','mv15-nguyen-to-bang100','mv15-cong-phan-so-cung-mau'
 ]),
 data:Object.freeze([
  'toan6-bieu-do-tranh','toan6-cot-don','toan6-cot-kep',
  'toan6-vong-quay','toan6-xuc-xac','toan6-dong-xu',
  'toan6-vong-quay-choi','toan6-mat-bang-phong-hoc'
 ])
});
const index=new Map(Object.entries(GRADE6_ACTIVE_EXHIBITS).flatMap(([zone,ids])=>ids.map((id,slot)=>[id,{zone,slot}])));
if(index.size!==35)throw new Error('V15.1 curator: duplicated or missing active grade-six lab');
export const GRADE6_ACTIVE_IDS=Object.freeze([...index.keys()]);
export const grade6ExhibitPlacement=id=>index.get(id)||null;
export const isGrade6ActiveLab=id=>index.has(id);
export const GRADE6_CURATED_TOTAL=index.size;
export function auditGrade6Selection(labs){
 const source=new Map(labs.map(l=>[l.id,l]));
 const unknown=GRADE6_ACTIVE_IDS.filter(id=>!source.has(id));
 if(unknown.length)throw new Error('V15.1 unknown model references: '+unknown.join(', '));
 return {active:labs.filter(l=>index.has(l.id)),archived:labs.filter(l=>!index.has(l.id)),total:labs.length};
}
