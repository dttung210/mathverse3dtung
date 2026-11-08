/** Lightweight inline SVG previews. No raster requests, dependencies or unsafe text. */
const paths={
 polygon:'<polygon points="12,55 27,13 66,55"/><line x1="27" y1="13" x2="38" y2="55" stroke-dasharray="3 3"/>',
 symmetry:'<path d="M40 8V61" stroke-dasharray="4 4"/><path d="M10 33L22 14L34 33L22 52Z"/><path d="M70 33L58 14L46 33L58 52Z"/>',
 composition:'<path d="M14 42L32 20L48 42L30 58Z"/><path d="M49 12L72 37L49 56L27 31Z" stroke-dasharray="3 3"/>',
 tiling:'<rect x="11" y="13" width="59" height="46" rx="2"/><path d="M31 13V59M51 13V59M11 36H70"/>',
 geometry:'<path d="M11 55H69M11 55L52 17"/><path d="M29 55A18 18 0 0 0 24 43"/>',
 number:'<path d="M6 39H76M16 31V47M28 31V47M40 31V47M52 31V47M64 31V47"/><path d="M68 35L76 39L68 43"/>',
 venn:'<circle cx="31" cy="34" r="23"/><circle cx="51" cy="34" r="23"/>',
 fraction:'<circle cx="40" cy="35" r="26"/><path d="M40 35V9A26 26 0 0 1 65 35Z" class="mv13-thumb-fill"/><path d="M40 35L17 47"/>',
 chart:'<path d="M12 58H72M12 58V12"/><rect x="20" y="30" width="10" height="28"/><rect x="37" y="20" width="10" height="38"/><rect x="54" y="39" width="10" height="19"/>',
 chance:'<rect x="15" y="10" width="49" height="49" rx="11"/><circle cx="29" cy="25" r="3" fill="currentColor"/><circle cx="49" cy="25" r="3" fill="currentColor"/><circle cx="29" cy="45" r="3" fill="currentColor"/><circle cx="49" cy="45" r="3" fill="currentColor"/>',
 real:'<path d="M17 55V20L45 9L66 25V55Z"/><path d="M17 20L38 39L66 25M38 39V55"/>'
};
const variants={
  rhombus:'<polygon points="9,35 40,10 71,35 40,60"/><path d="M9 35H71M40 10V60" stroke-dasharray="3 3"/>',
  rectangle:'<rect x="12" y="16" width="55" height="39"/><path d="M12 55L67 16" stroke-dasharray="4 4"/>',
  hexagon:'<polygon points="18,35 29,14 53,14 66,35 53,56 29,56"/>',
  trapezoid:'<polygon points="27,18 53,18 69,54 11,54"/>',
  parallelogram:'<polygon points="28,15 69,15 53,54 11,54"/>',
  double:'<path d="M8 60H73M8 60V8"/><rect x="18" y="29" width="8" height="31"/><rect x="28" y="40" width="8" height="20"/><rect x="43" y="19" width="8" height="41"/><rect x="53" y="27" width="8" height="33"/>',
  spinner:'<circle cx="40" cy="35" r="25"/><path d="M40 10V60M15 35H65M22 17L58 53M22 53L58 17"/>',
  dice:paths.chance,
  ferris:'<circle cx="40" cy="29" r="20"/><path d="M40 49L25 62M40 49L55 62M40 9V49M20 29H60"/><circle cx="40" cy="29" r="3"/>',
  card:'<path d="M12 16L40 24V59L12 51ZM40 24L69 15V51L40 59Z"/>',
  cubes:'<path d="M13 48L28 40L42 48L28 57ZM28 40V22L43 14L57 22V40L43 48ZM43 14V32M13 48V31L28 22"/>',
};
export const thumbKinds=Object.keys(paths);
export function previewMarkup(model){
 const engine=String(model.engine||'geometry');const variant=String(model.variant||'');
 const safe=variants[variant]||paths[engine]||paths.geometry;
 return `<svg aria-hidden="true" class="mv13-math6-svg" viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${safe}</svg>`;
}
export const groupLabels={
 'Hình phẳng 2D':'Hình phẳng','Cắt ghép và lát nền':'Cắt ghép','Đối xứng và gấp hình':'Đối xứng',
 'Điểm – đường – góc':'Đo góc','Trục số và sơ đồ':'Trục số','Phân số – số thập phân':'Phân số',
 'Thống kê – biểu đồ':'Biểu đồ','Thí nghiệm xác suất':'Xác suất','Mô hình thực tế':'Thực tế'
};
