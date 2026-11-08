/**
 * MATHVERSE V5 - ViewerRegistry
 * Bộ điều phối trung tâm: Ánh xạ từng mô hình Toán theo modality tới đúng Viewer chuyên biệt.
 */

import { Solid3DViewer } from './Solid3DViewer.js?v=r107_v15';
import { Geometry2DViewer } from './Geometry2DViewer.js?v=r107_v15';
import { FunctionGraphViewer } from './FunctionGraphViewer.js?v=r107_v15';
import { StatisticsChartViewer } from './StatisticsChartViewer.js?v=r107_v15';
import { detectModality } from '../data/migrate-v2-v4-v5.js?v=r107_v15';
import {JSXGraphAdapter,supportsJSXGraph} from './JSXGraphAdapter.js?v=r107_v15';
import {EChartsAdapter,supportsECharts} from './EChartsAdapter.js?v=r107_v15';

export class ViewerRegistry {
  static getViewerClass(model) {
    const modality = model.modality || detectModality(model.type);
    switch (modality) {
      case 'solid3d':
        return Solid3DViewer;
      case 'geometry2d':
        return Geometry2DViewer;
      case 'functiongraph':
        return FunctionGraphViewer;
      case 'statisticschart':
        return StatisticsChartViewer;
      default:
        return Solid3DViewer;
    }
  }

  static createViewer(model, options = {}) {
    // Opt-in only: unsupported models always use the verified V15.1 native viewer.
    const {engine='native',...viewerOptions}=options;
    if(engine==='jsxgraph'&&supportsJSXGraph(model))return new JSXGraphAdapter(model,viewerOptions);
    if(engine==='echarts'&&supportsECharts(model))return new EChartsAdapter(model,viewerOptions);
    const ViewerClass=this.getViewerClass(model);
    return new ViewerClass(model, viewerOptions);
  }
}
