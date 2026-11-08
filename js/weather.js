"use strict";
/* ============================================================
   METEO, CADUTE DI GRUPPO E RITIRI PER MALTEMPO
   ============================================================ */
const WX={
 sole:{lab:'Sole',crash:1,cap:0,drain:1,draft:1,ab:0,tt:1},
 nuvole:{lab:'Nuvoloso',crash:1,cap:0,drain:1,draft:1,ab:0,tt:1},
 vento:{lab:'Vento laterale',crash:1.3,cap:0,drain:1.05,draft:0.7,ab:0,tt:1.012},
 caldo:{lab:'Caldo',crash:1,cap:0,drain:1.15,draft:1,ab:1,tt:1.008},
 pioggia:{lab:'Pioggia',crash:3,cap:16.5,drain:1.08,draft:1,ab:1,tt:1.015},
 diluvio:{lab:'Pioggia forte',crash:5,cap:14,drain:1.15,draft:0.9,ab:2,tt:1.03},
 freddo:{lab:'Freddo e pioggia',crash:3.5,cap:15,drain:1.2,draft:1,ab:3,tt:1.025},
 neve:{lab:'Neve in quota',crash:4,cap:13,drain:1.25,draft:1,ab:4,tt:1.03}
};
const NORTH=['BEL','NED','GBR','DEN','NOR','GER','POL','LUX'];
function makeWeather(race,i){
 const st=race.stages[i];if(st.wx)return st.wx;
 const r=mulberry32((st.seed^0x9e3779b9)>>>0),w=race.w,t=st.t;
 const north=NORTH.includes(race.ctry),spring=w<=17,summer=w>=26&&w<=35;
 let pr=spring?0.32:summer?0.12:w>=36?0.28:0.22;if(north)pr+=0.13;
 const temp=Math.round((spring?11:summer?27:w>=36?17:20)+(north?-4:2)-(t==='montagna'?6:0)+(r()-0.5)*8);
 let k='sole';const x=r();
 if(x<pr)k=temp<=8?(t==='montagna'&&r()<0.5?'neve':'freddo'):r()<0.3?'diluvio':'pioggia';
 else if(x<pr+0.2)k='nuvole';
 else if((t==='piatta'||t==='pave'||t==='roubaix'||t==='circuito')&&north&&r()<0.45)k='vento';
 else if(temp>=30)k='caldo';
 const wind=Math.round(k==='vento'?30+r()*25:5+r()*20);
 let short=0;
 if(ROAD(t)&&(k==='neve'||(k==='freddo'&&temp<=4)||(k==='diluvio'&&r()<0.25)))short=+(0.3+r()*0.2).toFixed(2);
 st.wx={k,temp,wind,short};return st.wx;
}
function wxText(wx){return`${WX[wx.k].lab} · ${wx.temp}°C${wx.k==='vento'||wx.wind>=25?` · vento ${wx.wind} km/h`:''}`}
function wxEffects(wx){
 const W=WX[wx.k],L=[];
 if(W.crash>1)L.push(`rischio cadute ×${W.crash}`);
 if(W.cap)L.push('discese più lente');
 if(W.draft<1)L.push('scia meno efficace: rischio ventagli in pianura');
 if(W.drain>1)L.push('si consumano più energie');
 if(W.ab)L.push(wx.k==='caldo'?'chi va in crisi rischia il ritiro':'chi resta senza energie rischia il ritiro per il freddo');
 if(wx.short)L.push(`protocollo maltempo: tappa accorciata del ${Math.round(wx.short*100)}%`);
 return L;
}
/* taglia la parte iniziale del percorso (protocollo per meteo estremo) */
function cutCourse(c,frac){
 const off=Math.round(c.N*frac),N=c.N-off,len=+(N/10).toFixed(1);
 const sl=a=>a.slice(off);
 const alt=c.alt.slice(off);
 let mn=Infinity,mx=-Infinity;for(const a of alt){mn=Math.min(mn,a);mx=Math.max(mx,a)}
 const km=off/10;
 const climbs=c.climbs.filter(cb=>cb.start>=km).map(cb=>Object.assign({},cb,{start:cb.start-km,top:cb.top-km}));
 let secN=0;const surf=sl(c.surf);for(let i=1;i<N;i++)if(surf[i]&&!surf[i-1])secN++;
 return Object.assign({},c,{len,N,g:sl(c.g),alt,sin:sl(c.sin),cos:sl(c.cos),crr:sl(c.crr),surf,secN,climbs,mn,mx,
  sprintKm:c.sprintKm&&c.sprintKm>km+5?Math.round(c.sprintKm-km):null,pts:c.pts?c.pts.filter(p=>p>km).map(p=>+(p-km).toFixed(1)):null,shortened:km});
}
/* contesto di tappa: aggiunge meteo e protocollo */
const _stageCtxW=stageCtx;
stageCtx=function(RC){
 const c=_stageCtxW(RC);
 const wx=makeWeather(RC.race,RC.stage);c.weather=wx;
 if(wx.short&&ROAD(c.course.type))c.course=cutCourse(c.course,wx.short);
 return c;
};
const _createSimW=createSim;
createSim=function(ctx){
 const S=_createSimW(ctx);
 const wx=ctx.weather||{k:'sole',temp:20,wind:10,short:0},W=WX[wx.k];
 S.wx=wx;S.W=W;S.crashes=0;S.dnfWx=0;
 for(const x of S.riders)x.endF*=W.drain;
 slog(S,`Meteo: ${wxText(wx)}${ctx.course.shortened?` · protocollo maltempo: partenza spostata al km ${Math.round(ctx.course.shortened)}`:''}`);
 return S;
};
function massCrash(S,cl){
 const rs=cl.rs.filter(x=>!x.finished&&x.stop<=0);if(rs.length<10)return;
 const n=rint(3,Math.max(3,Math.min(18,Math.round(rs.length*0.25))));
 const start=rint(0,rs.length-n),inv=rs.slice(start,start+n),mine=[];
 let out=0;
 for(const x of inv){
  const roll=R();
  if(roll<0.08){x.dnf=true;x.finished=true;x.inj=rint(2,6);x.v=0;x.P=0;out++}
  else{x.stop=rint(3,12);if(roll<0.25)x.inj=rint(1,2)}
  if(x.isMe)mine.push(x.r.name+(x.dnf?' (ritirato)':x.inj?' (dolorante)':''));
 }
 for(const x of rs.slice(start+n,start+n+rint(5,20)))if(x.stop<=0)x.stop=rint(1,3);
 S.crashes++;
 slog(S,`Caduta di gruppo a ${km1(Math.max(0,S.len-cl.front))} km dall'arrivo: coinvolti ${n} corridori${out?`, ${out} ritirat${out>1?'i':'o'}`:''}${mine.length?'. Dei nostri: '+mine.join(', '):''}`,mine.length>0);
}
const _tickW=tick;
tick=function(S){
 const c=S.course,W=S.W||WX.sole;
 // cadute di gruppo
 if(S.clusters&&S.clusters.length){
  for(const cl of S.clusters){
   if(cl.rs.length<15)continue;
   const i=gi(S,cl.front),k2g=S.len-cl.front;
   const p=0.00004*W.crash*(c.surf[i]?3:1)*(c.g[i]<-4?2:1)*(k2g<5?4:1)*(cl.rs.length/50);
   if(R()<p)massCrash(S,cl);
  }
 }
 // ritiri per maltempo e caldo (ogni 30 secondi di corsa)
 if(W.ab&&S.tick%6===1&&S.main){
  for(const x of S.riders){
   if(x.finished||x.stop>0||x.E>35)continue;
   const behind=x.cl&&x.cl.idx>S.main.idx;
   const p=0.004*W.ab*(behind?2:0.5)*(1+(35-x.E)/35);
   if(R()<p){x.dnf=true;x.finished=true;x.v=0;S.dnfWx++;
    if(x.isMe||x.role==='lead'||S.dnfWx<=3)slog(S,`${x.r.name} (${tshort(x)}) si ritira ${S.wx.k==='caldo'?'stremato dal caldo':'per il freddo e la pioggia'}`,x.isMe)}
  }
 }
 _tickW(S);
};
/* cronometro: il meteo rallenta i tempi */
const _simTTW=simTT;
simTT=function(ctx){const res=_simTTW(ctx),W=WX[(ctx.weather||{k:'sole'}).k];return res.map(x=>({...x,time:Math.round(x.time*W.tt*(1+(R()-0.5)*0.004)*10)/10})).sort((a,b)=>a.time-b.time)};
/* simulazione rapida: qualche ritiro in più col brutto tempo */
quickRace=function(race){
 const field=buildField(race,null);
 if(field.length<10){race.status='done';race.result=null;return}
 const fat={},gc={},out=new Set();for(const r of field){fat[r.id]=0;gc[r.id]=0}
 const stagesRes=[],multi=race.stages.length>1;
 race.stages.forEach((st,i)=>{
  const W=WX[makeWeather(race,i).k];
  for(const r of field)if(!out.has(r.id)&&R()<0.002*(1+W.ab)*(W.crash>1?1.5:1)){out.add(r.id);if(R()<0.4)injure(r,rint(1,4),race.w+race.dur-1)}
  const res=quickStage(field.filter(r=>!out.has(r.id)),st.t,fat,race.w);
  for(const x of res)gc[x.id]+=x.time;
  if(multi&&ROAD(st.t))[10,6,4].forEach((b,j)=>{if(res[j])gc[res[j].id]-=b});
  stagesRes.push(res);for(const r of field)fat[r.id]+=HARD[st.t]*0.6;
 });
 const final=multi?field.filter(r=>!out.has(r.id)).map(r=>({id:r.id,team:r.team,time:gc[r.id]})).sort((a,b)=>a.time-b.time):stagesRes[0];
 applyOutcome(race,field,final,stagesRes,null);
};
function wxChip(wx){if(!wx)return'';const bad=['pioggia','diluvio','freddo','neve'].includes(wx.k);return`<span class="chip ${bad?'red':wx.k==='vento'||wx.k==='caldo'?'amber':''}">${esc(wxText(wx))}</span>`}
function wxTip(S){
 const k=S.wx&&S.wx.k;if(!k)return null;
 if(['pioggia','diluvio','freddo','neve'].includes(k))return{k:'warn',t:`${WX[k].lab}: in discesa si va piano e si cade di più. Tieni il capitano nelle prime posizioni e non rischiare in discesa. Chi resta senza energie rischia il ritiro per il freddo.`};
 if(k==='vento')return{k:'warn',t:'Vento laterale: in pianura il gruppo può spezzarsi nei ventagli. Stai davanti con il capitano; un gregario su "Tira" lo protegge.'};
 if(k==='caldo')return{k:'info',t:'Caldo: si consuma di più. Evita di far tirare troppo i gregari nella prima parte: chi va in crisi può ritirarsi.'};
 return null;
}
