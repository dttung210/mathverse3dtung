/**
 * MATHVERSE V5 - Data Migration Adapter (V2/V3/V4 -> V5)
 * Đảm bảo 100% tính tương thích ngược, không thay đổi ID và bảo lưu các mô hình cá nhân của giáo viên.
 */

const MODALITY_MAP = {
  // Statistics
  barChart: 'statisticschart',
  pieChart: 'statisticschart',
  boxPlot:'statisticschart',

  // Function graphs
  lineGraph: 'functiongraph',
  linearSlope: 'functiongraph',
  parabola: 'functiongraph',
  parabolaGeneral: 'functiongraph',
  cubicCurve: 'functiongraph',
  rationalFunc: 'functiongraph',
  sine: 'functiongraph',
  exponential: 'functiongraph',
  derivative: 'functiongraph',
  inequalityRegion: 'functiongraph',

  // 2D Plane Geometry
  polygon: 'geometry2d',
  polygonTiling:'geometry2d',
  transform2d:'geometry2d',
  unitCircleMotion:'geometry2d',
  circle: 'geometry2d',
  triangle: 'geometry2d',
  pythagoras: 'geometry2d',
  trapezoid: 'geometry2d',
  rhombus: 'geometry2d',
  angles: 'geometry2d',
  parallelogram: 'geometry2d',
  symmetryAxis: 'geometry2d',
  symmetryCenter: 'geometry2d',
  segmentMidpoint: 'geometry2d',
  parallelLines: 'geometry2d',
  triangleAngles: 'geometry2d',
  congruentTriangles: 'geometry2d',
  triangleCenters: 'geometry2d',
  thales: 'geometry2d',
  midSegment: 'geometry2d',
  parallelogramMid: 'geometry2d',
  rectangleSquare: 'geometry2d',
  similarTriangles: 'geometry2d',
  trigTriangle: 'geometry2d',
  circleTangent: 'geometry2d',
  circleInscribed: 'geometry2d',
  circumIncircle: 'geometry2d',
  cyclicQuad: 'geometry2d',
  triangleLaws: 'geometry2d',
  vectorParallelogram: 'geometry2d',
  vectorDot: 'geometry2d',
  lineOxy: 'geometry2d',
  circleOxy: 'geometry2d',
  ellipse: 'geometry2d',
  hyperbola: 'geometry2d',

  // 3D Spatial Geometry (Solid 3D)
  cube: 'solid3d',
  cuboid: 'solid3d',
  cylinder: 'solid3d',
  cone: 'solid3d',
  sphere: 'solid3d',
  squarePyramid: 'solid3d',
  trianglePyramid: 'solid3d',
  triPrism: 'solid3d',
  tetrahedron: 'solid3d',
  crossSection: 'solid3d',
  prismQuad: 'solid3d',
  frustumPyramid: 'solid3d',
  sphereSection: 'solid3d',
  revolvedSolid: 'solid3d',
  oxyzAxes: 'solid3d',
  oxyzVector: 'solid3d',
  oxyzSphere: 'solid3d',
  oxyzPlane: 'solid3d',
  oxyzLine: 'solid3d',
  oxyzDistance: 'solid3d',
  skewLines: 'solid3d',
  lineParallelPlane: 'solid3d',
  parallelPlanes: 'solid3d',
  linePerpPlane: 'solid3d',
  perpendicularPlanes: 'solid3d',
  linePlaneAngle: 'solid3d',
  dihedralAngle: 'solid3d',
  twoPlanes: 'solid3d',
  plane: 'solid3d',
  linePlane: 'solid3d',
  vector: 'solid3d',
  surface: 'solid3d'
};

export function detectModality(type, existingModality = null) {
  if (existingModality && ['solid3d', 'geometry2d', 'functiongraph', 'statisticschart'].includes(existingModality)) {
    return existingModality;
  }
  return MODALITY_MAP[type] || 'solid3d';
}

export function migrateItemToV5(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const id = String(raw.id || `v5_item_${Math.random().toString(36).substring(2, 9)}`);
  const grade = Number(raw.grade) || 8;
  const type = raw.type || raw.builderType || 'squarePyramid';
  const modality = detectModality(type, raw.modality);
  const title = raw.title || 'Mô hình Toán';
  const category = raw.category || (modality === 'solid3d' ? 'Hình không gian' : modality === 'geometry2d' ? 'Hình học phẳng' : modality === 'functiongraph' ? 'Hàm số & Đồ thị' : 'Thống kê');
  const chapter = raw.chapter || '';
  const topic = raw.topic || '';
  const curriculumSource = raw.curriculumSource || '';
  const description = raw.description || '';
  const formula = raw.formula || raw.formulaLatex || '';
  const formulaLatex = raw.formulaLatex || raw.formula || '';
  const params = raw.params || raw.parameters || {};
  const custom = Boolean(raw.custom);

  return {
    id,
    grade,
    type,
    builderType: type,
    modality,
    title,
    category,
    chapter,
    topic,
    curriculumSource,
    description,
    formula,
    formulaLatex,
    params: { ...params },
    ...(raw.data?{data:raw.data}:{}),
    ...(raw.viewState?{viewState:raw.viewState}:{}),
    custom,
    schemaVersion: 5
  };
}

export function migrateLibraryToV5(libraryData, defaultItems = []) {
  const defaultMap = new Map((defaultItems || []).map(it => [it.id, it]));

  if (!libraryData) {
    return {
      schemaVersion: 5,
      version: 5,
      items: (defaultItems || []).map(migrateItemToV5)
    };
  }

  const itemsList = Array.isArray(libraryData.items) ? libraryData.items : (Array.isArray(libraryData) ? libraryData : []);
  
  // Xử lý giữ nguyên mô hình của cô (custom) và chuẩn hóa mô hình hệ thống
  const result = [];
  const processedIds = new Set();

  for (const item of itemsList) {
    if (!item || !item.id) continue;
    const migrated = migrateItemToV5(item);
    if (!migrated) continue;

    if (migrated.custom) {
      result.push(migrated);
      processedIds.add(migrated.id);
    } else {
      // Mô hình hệ thống: nếu có bản cập nhật chuẩn trong defaultItems, dùng thông tin mới nhất
      const def = defaultMap.get(migrated.id);
      if (def) {
        result.push(migrateItemToV5({ ...def, params: { ...def.params, ...migrated.params } }));
      } else {
        result.push(migrated);
      }
      processedIds.add(migrated.id);
    }
  }

  // Bổ sung các mô hình mặc định chưa có
  for (const def of (defaultItems || [])) {
    if (!processedIds.has(def.id)) {
      result.push(migrateItemToV5(def));
    }
  }

  return {
    schemaVersion: 5,
    version: 5,
    items: result
  };
}
