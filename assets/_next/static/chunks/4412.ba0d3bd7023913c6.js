try{let e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},t=(new e.Error).stack;t&&(e._sentryDebugIds=e._sentryDebugIds||{},e._sentryDebugIds[t]="62861981-b7ee-4ec9-99ce-f7b86c174bb5",e._sentryDebugIdIdentifier="sentry-dbid-62861981-b7ee-4ec9-99ce-f7b86c174bb5")}catch(e){}"use strict";(self.webpackChunk_xiehanzi=self.webpackChunk_xiehanzi||[]).push([[4412],{57939:function(e,t,a){function i(e,t){e.accDescr&&t.setAccDescription?.(e.accDescr),e.accTitle&&t.setAccTitle?.(e.accTitle),e.title&&t.setDiagramTitle?.(e.title)}a.d(t,{A:function(){return i}}),(0,a(34140).e)(i,"populateCommonDb")},34412:function(e,t,a){a.d(t,{diagram:function(){return k}});var i=a(57939),l=a(92979),r=a(1484),n=a(91715),s=a(22609),o=a(34140),c=a(40685),d=a(24927),p=n.vZ.pie,h={sections:new Map,showData:!1,config:p},g=h.sections,u=h.showData,f=structuredClone(p),b=(0,o.e)(()=>structuredClone(f),"getConfig"),m=(0,o.e)(()=>{g=new Map,u=h.showData,(0,n.ZH)()},"clear"),w=(0,o.e)(({label:e,value:t})=>{if(t<0)throw Error(`"${e}" has invalid value: ${t}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);g.has(e)||(g.set(e,t),s.c.debug(`added new section: ${e}, with value: ${t}`))},"addSection"),y=(0,o.e)(()=>g,"getSections"),x=(0,o.e)(e=>{u=e},"setShowData"),$=(0,o.e)(()=>u,"getShowData"),D={getConfig:b,clear:m,setDiagramTitle:n.g2,getDiagramTitle:n.Kr,setAccTitle:n.GN,getAccTitle:n.eu,setAccDescription:n.U$,getAccDescription:n.Mx,addSection:w,getSections:y,setShowData:x,getShowData:$},S=(0,o.e)((e,t)=>{(0,i.A)(e,t),t.setShowData(e.showData),e.sections.map(t.addSection)},"populateDb"),T={parse:(0,o.e)(async e=>{let t=await (0,c.Qc)("pie",e);s.c.debug(t),S(t,D)},"parse")},v=(0,o.e)(e=>`
  .pieCircle{
    stroke: ${e.pieStrokeColor};
    stroke-width : ${e.pieStrokeWidth};
    opacity : ${e.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${e.pieOuterStrokeColor};
    stroke-width: ${e.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${e.pieTitleTextSize};
    fill: ${e.pieTitleTextColor};
    font-family: ${e.fontFamily};
  }
  .slice {
    font-family: ${e.fontFamily};
    fill: ${e.pieSectionTextColor};
    font-size:${e.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${e.pieLegendTextColor};
    font-family: ${e.fontFamily};
    font-size: ${e.pieLegendTextSize};
  }
`,"getStyles"),C=(0,o.e)(e=>{let t=[...e.values()].reduce((e,t)=>e+t,0),a=[...e.entries()].map(([e,t])=>({label:e,value:t})).filter(e=>e.value/t*100>=1);return(0,d.ve8)().value(e=>e.value).sort(null)(a)},"createPieArcs"),k={parser:T,db:D,renderer:{draw:(0,o.e)((e,t,a,i)=>{s.c.debug("rendering pie chart\n"+e);let o=i.db,c=(0,n.nV)(),p=(0,r.Rb)(o.getConfig(),c.pie),h=(0,l.P)(t),g=h.append("g");g.attr("transform","translate(225,225)");let{themeVariables:u}=c,[f]=(0,r.VG)(u.pieOuterStrokeWidth);f??=2;let b=p.legendPosition,m=p.textPosition,w=p.donutHole>0&&p.donutHole<=.9?p.donutHole:0,y=(0,d.Nb1)().innerRadius(185*w).outerRadius(185),x=(0,d.Nb1)().innerRadius(185*m).outerRadius(185*m),$=g.append("g");$.append("circle").attr("cx",0).attr("cy",0).attr("r",185+f/2).attr("class","pieOuterCircle");let D=o.getSections(),S=C(D),T=[u.pie1,u.pie2,u.pie3,u.pie4,u.pie5,u.pie6,u.pie7,u.pie8,u.pie9,u.pie10,u.pie11,u.pie12],v=0;D.forEach(e=>{v+=e});let k=S.filter(e=>"0"!==(e.data.value/v*100).toFixed(0)),A=(0,d.PKp)(T).domain([...D.keys()]);$.selectAll("mySlices").data(k).enter().append("path").attr("d",y).attr("fill",e=>A(e.data.label)).attr("class",e=>{let t="pieCircle";return"hover"===p.highlightSlice?t+=" highlightedOnHover":p.highlightSlice===e.data.label&&(t+=" highlighted"),t}),$.selectAll("mySlices").data(k).enter().append("text").text(e=>(e.data.value/v*100).toFixed(0)+"%").attr("transform",e=>"translate("+x.centroid(e)+")").style("text-anchor","middle").attr("class","slice");let z=g.append("text").text(o.getDiagramTitle()).attr("x",0).attr("y",-200).attr("class","pieTitleText"),O=[...D.entries()].map(([e,t])=>({label:e,value:t})),M=g.selectAll(".legend").data(O).enter().append("g").attr("class","legend");M.append("rect").attr("width",18).attr("height",18).style("fill",e=>A(e.label)).style("stroke",e=>A(e.label)),M.append("text").attr("x",22).attr("y",14).text(e=>o.getShowData()?`${e.label} [${e.value}]`:e.label);let R=Math.max(...M.selectAll("text").nodes().map(e=>e?.getBoundingClientRect().width??0)),H=450,_=490,F=22*O.length;switch(b){case"center":M.attr("transform",(e,t)=>"translate("+(-R/2-22)+","+(22*t-22*O.length/2)+")");break;case"top":H+=F,M.attr("transform",(e,t)=>`translate(${-R/2-22}, ${22*t-185})`),$.attr("transform",()=>`translate(0, ${F+22})`);break;case"bottom":H+=F,M.attr("transform",(e,t)=>"translate("+(-R/2-22)+","+(22*t- -207)+")");break;case"left":_+=22+R,M.attr("transform",(e,t)=>"translate(-207,"+(22*t-22*O.length/2)+")"),$.attr("transform",()=>`translate(${R+18+4}, 0)`);break;default:_+=22+R,M.attr("transform",(e,t)=>"translate(216,"+(22*t-22*O.length/2)+")")}let I=z.node()?.getBoundingClientRect().width??0,P=Math.min(0,225-I/2),N=Math.max(_,225+I/2)-P;h.attr("viewBox",`${P} 0 ${N} ${H}`),(0,n.v2)(h,H,N,p.useMaxWidth)},"draw")},styles:v}}}]);