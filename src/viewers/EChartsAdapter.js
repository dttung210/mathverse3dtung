/** Apache ECharts pilot - keeps the old native StatisticsChartViewer available. */
import {StatisticsChartViewer} from './StatisticsChartViewer.js';
import {Stats} from '../math/stats.js';

export const supportsECharts = model => model?.type!=='boxPlot' && (model?.modality==='statisticschart'||['barChart','pieChart'].includes(model?.type));
export class EChartsAdapter extends StatisticsChartViewer {
  constructor(model,options={}){super(model,options);this.chart=null;this.element=null;this.dragIndex=-1;this._down=e=>this._onDown(e);this._move=e=>this._onDrag(e);this._up=e=>this._onUp(e);}
  mount(container){
    if(!globalThis.echarts?.init)throw new Error('Chưa tải Apache ECharts');
    this.container=container;this.container.replaceChildren();
    const el=document.createElement('div');el.className='mv16-echarts';
    Object.assign(el.style,{width:'100%',height:'100%',minHeight:'240px',touchAction:'none'});
    this.element=el;container.append(el);
    this.chart=globalThis.echarts.init(el,null,{renderer:'canvas'});
    el.addEventListener('pointerdown',this._down);el.addEventListener('pointermove',this._move);
    el.addEventListener('pointerup',this._up);el.addEventListener('pointercancel',this._up);
    window.addEventListener('resize',this._onResize);
    this.render();
  }
  _onResize(){this.chart?.resize?.();}
  render(){if(!this.chart)return;
    const labels=this.data.labels||[],values=this.data.values||[],kind=this.chartKind;
    if(kind==='pie'){
      this.chart.setOption({animationDuration:300,tooltip:{trigger:'item',formatter:'{b}: {c} ({d}%)'},
        legend:{bottom:4,type:'scroll'},series:[{type:'pie',radius:['18%','67%'],center:['50%','44%'],
          label:{formatter:'{b}\n{d}%'},data:labels.map((name,i)=>({name,value:values[i]||0}))}]},true);
      return;
    }
    let xs=labels,ys=values;
    if(kind==='hist'){
      const bounds=Stats.makeHistogramEdges(values);ys=Stats.computeHistogramBins(values,bounds);
      xs=ys.map((_,i)=>`[${bounds[i]}; ${bounds[i+1]}${i===ys.length-1?']':')'}`);
    }
    const max=Math.max(1,...ys);
    this.chart.setOption({animationDuration:200,grid:{left:55,right:25,top:35,bottom:65,containLabel:false},
      tooltip:{trigger:'axis'},xAxis:{type:'category',data:xs,axisLabel:{rotate:xs.length>6?25:0,interval:0}},
      yAxis:{type:'value',min:0,max:Math.max(5,Math.ceil(max*1.25))},
      series:[{type:kind==='line'?'line':'bar',data:ys,barMaxWidth:55,
        smooth:false,symbolSize:10,label:{show:true,position:'top'},itemStyle:{color:'#318da5'}}]},true);
  }
  _onDown(event){
    if(this.chartKind!=='bar'||!this.chart||!this.data.values.length)return;
    const rect=this.element.getBoundingClientRect(),px=event.clientX-rect.left,py=event.clientY-rect.top;
    if(!this.chart.containPixel({gridIndex:0},[px,py]))return;
    const positions=this.data.labels.map((name,i)=>{
      const p=this.chart.convertToPixel({seriesIndex:0},[name,this.data.values[i]]);
      return Array.isArray(p)&&Number.isFinite(p[0])?p[0]:Infinity;
    });
    let best=-1,min=Infinity;positions.forEach((x,i)=>{const d=Math.abs(px-x);if(d<min){min=d;best=i;}});
    if(best<0||min>Math.max(25,rect.width/(2*positions.length)))return;
    this.dragIndex=best;this.element.setPointerCapture?.(event.pointerId);this._onDrag(event);
  }
  _onDrag(event){
    if(this.dragIndex<0||!this.chart)return;
    const rect=this.element.getBoundingClientRect(),py=event.clientY-rect.top;
    const val=this.chart.convertFromPixel({yAxisIndex:0},py);
    if(!Number.isFinite(val))return;
    const data=[...this.data.values];data[this.dragIndex]=Math.max(0,Math.min(10000,Math.round(val)));
    this.setDataValues(data);
    this.options.onDataChange?.([...this.data.values]);
  }
  _onUp(){if(this.dragIndex>=0)this.options.onInteractionEnd?.();this.dragIndex=-1;}
  exportSnapshot(){return this.chart?.getDataURL?.({type:'png',pixelRatio:2,backgroundColor:'#ffffff'})||'';}
  dispose(){
    window.removeEventListener('resize',this._onResize);
    if(this.element){this.element.removeEventListener('pointerdown',this._down);this.element.removeEventListener('pointermove',this._move);
      this.element.removeEventListener('pointerup',this._up);this.element.removeEventListener('pointercancel',this._up);}
    this.chart?.dispose?.();this.chart=null;this.container?.replaceChildren();this.container=null;this.element=null;
  }
}
