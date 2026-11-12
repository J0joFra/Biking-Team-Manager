"use strict";
/* ============================================================
   FINANZE: due schede (Bilancio · Sponsor). Gli sponsor si
   cercano su un mappamondo 3D: le nazioni con sponsor sono
   verdi, più intense quanto più sono interessati a te.
   Icone anche nel calendario e nel mercato.
   ============================================================ */
const ISO_N={ITA:'380',SUI:'756',AUT:'040',SLO:'705',FRA:'250',GER:'276',ESP:'724',BEL:'056',NED:'528',DEN:'208',GBR:'826',UAE:'784',USA:'840'};
const N_ISO=Object.fromEntries(Object.entries(ISO_N).map(([k,v])=>[v,k]));
let WORLD=null;
function worldFeatures(){if(!WORLD&&typeof topojson!=='undefined'&&typeof WORLD_TOPO!=='undefined')WORLD=topojson.feature(WORLD_TOPO,WORLD_TOPO.objects.countries).features;return WORLD||[]}
function heatOf(code){if(code==='ITA')return Math.max(0,...Object.keys(REGIONS).map(areaHeat));return areaHeat(code)}
function heatCol(h,open){if(!open)return'#C9CFC7';const t=clamp(h/0.6,0,1);const a=[214,236,214],b=[22,128,61];return`rgb(${a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',')})`}
function areaOpen(code){const ss=code==='ITA'?G.sponsors.filter(s=>REGIONS[s.area]):G.sponsors.filter(s=>s.area===code);return ss.some(s=>G.rep>=s.req)}
/* ---------- mappamondo ---------- */
const GLOBE={rot:[-12,-46,0],anim:null,zoom:1.7};
function drawGlobe(){
 const cv=$('#globe');if(!cv||typeof d3==='undefined'||!d3.geoOrthographic)return;
 const box=cv.parentElement.getBoundingClientRect(),S=Math.max(140,Math.min(box.width,box.height||box.width)),dpr=devicePixelRatio||1;
 cv.width=S*dpr;cv.height=S*dpr;cv.style.width=S+'px';cv.style.height=S+'px';
 const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
 const proj=d3.geoOrthographic().scale((S/2-4)*GLOBE.zoom).translate([S/2,S/2]).rotate(GLOBE.rot).clipAngle(90),path=d3.geoPath(proj,g);
 GLOBE.proj=proj;
 const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();
 g.clearRect(0,0,S,S);
 g.save();g.beginPath();g.arc(S/2,S/2,S/2-2,0,7);g.clip();
 g.beginPath();path({type:'Sphere'});g.fillStyle=css('--globe-sea')||'#DCE8F3';g.fill();
 g.beginPath();path(d3.geoGraticule10());g.strokeStyle='rgba(0,0,0,.05)';g.lineWidth=0.6;g.stroke();
 const sel=isForeign(G.spArea)?G.spArea:'ITA';
 for(const f of worldFeatures()){
  const code=N_ISO[f.id];
  g.beginPath();path(f);
  g.fillStyle=code?heatCol(heatOf(code),areaOpen(code)):(css('--globe-land')||'#EEF0EC');g.fill();
  g.strokeStyle=code===sel?css('--accent'):'rgba(0,0,0,.18)';g.lineWidth=code===sel?2:0.5;g.stroke();
 }
 /* sede */
 const p=proj([G.sede.lon,G.sede.lat]);if(p&&d3.geoDistance([G.sede.lon,G.sede.lat],proj.invert([S/2,S/2]))<Math.PI/2){g.beginPath();g.arc(p[0],p[1],3.5,0,7);g.fillStyle=css('--amber');g.fill();g.strokeStyle='#fff';g.lineWidth=1.2;g.stroke()}
 g.restore();g.beginPath();g.arc(S/2,S/2,S/2-2,0,7);g.strokeStyle='rgba(0,0,0,.2)';g.lineWidth=1;g.stroke();
}
function globeFocus(code){
 const f=worldFeatures().find(x=>x.id===ISO_N[code]);if(!f)return;
 const c=code==='USA'?[-95,39]:code==='GBR'?[-2,54]:d3.geoCentroid(f),from=GLOBE.rot.slice(),to=[-c[0],-c[1]*0.85,0],t0=performance.now();
 cancelAnimationFrame(GLOBE.anim);
 const step=now=>{const k=Math.min(1,(now-t0)/450),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;GLOBE.rot=[from[0]+(to[0]-from[0])*e,from[1]+(to[1]-from[1])*e,0];drawGlobe();if(k<1)GLOBE.anim=requestAnimationFrame(step)};
 GLOBE.anim=requestAnimationFrame(step);
}
function globeEvents(){
 const cv=$('#globe');if(!cv)return;let drag=null,moved=0;
 cv.onpointerdown=e=>{drag={x:e.clientX,y:e.clientY,r:GLOBE.rot.slice()};moved=0;cv.setPointerCapture(e.pointerId)};
 cv.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));GLOBE.rot=[drag.r[0]+dx*0.4,clamp(drag.r[1]-dy*0.4,-80,80),0];drawGlobe()};
 cv.onpointerup=e=>{const was=drag;drag=null;if(!was||moved>6||!GLOBE.proj)return;
  const r=cv.getBoundingClientRect(),ll=GLOBE.proj.invert([e.clientX-r.left,e.clientY-r.top]);if(!ll)return;
  const f=worldFeatures().find(x=>N_ISO[x.id]&&d3.geoContains(x,ll));if(!f)return;
  const code=N_ISO[f.id];G.spArea=code;G.spCity=null;G.spTab='area';save();renderSponsor();globeFocus(code)};
}
/* ---------- regioni italiane come bottoni ---------- */
function regionChips(){
 return`<div class="regs">${Object.keys(REGIONS).map(k=>{const h=areaHeat(k),n=G.sponsors.filter(s=>s.area===k).length,mine=G.sponsors.filter(s=>s.area===k&&myContract(s)).length;
  return`<button class="reg ${G.spArea===k?'sel':''}" data-act="sparea" data-v="${k}" style="--hc:${heatCol(h,true)}" title="${esc(REGIONS[k].n)} · ${n} sponsor"><b>${k}</b>${mine?`<i>${mine}</i>`:''}${G.sede.reg===k?ic2('flag',10):''}</button>`}).join('')}</div>`;
}
/* ---------- pagina Finanze ---------- */
function slotsRow(){const sv=G.phase==='season'?SEASON:SEASON+1;return`<span class="slotsrow" title="Ruoli occupati ${sv}">${['main','co','partner'].map(k=>`<span>${SLOTS[k].lab.split(' ')[0]} <b>${slotUsed(k,sv)}/${SLOTS[k].cap}</b></span>`).join('')}</span>`}
renderSponsor=function(){
 G.finTab=G.finTab||'bil';if(!G.spArea||REGIONS[G.spArea])G.spArea='ITA';G.spTab=G.spTab||'area';
 const tabs=`<div class="toolbar"><div class="seg fintabs">${[['bil','euro','Bilancio'],['spon','spon','Sponsor']].map(([k,i,l])=>`<button data-act="fintab" data-v="${k}" aria-pressed="${G.finTab===k}">${i==='spon'?ic(i,15):ic2(i,15)} ${l}${k==='spon'&&G.offers.length?` <b class="badge2">${G.offers.length}</b>`:''}</button>`).join('')}</div>
  <span class="finkpi">${ic2('contract',13)} ${SEASON+1}: <b>${eurk(incomeIn(SEASON+1))}</b> ${slotsRow()}</span></div>`;
 if(G.finTab==='bil'){$('#view').innerHTML=tabs+finTable();return}
 const area=G.spArea,ita=area==='ITA';
 const list=G.sponsors.filter(s=>ita?!!REGIONS[s.area]:s.area===area).sort((a,b)=>(myContract(b)?1:0)-(myContract(a)?1:0)||interest(b).p-interest(a).p||b.pot-a.pot).slice(0,40);
 const contracts=G.contracts.filter(c=>(activeIn(c,SEASON)&&!c.done&&G.phase==='season')||(c.from>SEASON&&G.phase!=='season')||(G.phase!=='season'&&activeIn(c,SEASON+1))).sort((a,b)=>['main','co','partner'].indexOf(a.slot)-['main','co','partner'].indexOf(b.slot)||b.amount-a.amount);
 const sub=[['area',`${flagSvg(area,14)} ${ita?'Italia':esc(FOREIGN[area].n)}`],['mine',`${ic2('contract',13)} Contratti ${contracts.length}`],['offers',`${ic2('inbox',13)} Proposte ${G.offers.length}`]];
 const body=G.spTab==='mine'?contractTable(contracts):G.spTab==='offers'?offerTable(G.offers):(isForeign(area)&&!areaOpen(area)?`<div class="msg no">${ic('lock',13)} ${esc(FOREIGN[area].n)}: serve più reputazione</div>`:'')+spTable(list);
 $('#view').innerHTML=tabs+`<div class="spgrid2"><div class="col globecol"><div class="globebox"><canvas id="globe" aria-label="Mappamondo degli sponsor"></canvas></div>
  <div class="glegend"><span><i style="background:${heatCol(0.05,true)}"></i><i style="background:${heatCol(0.3,true)}"></i><i style="background:${heatCol(0.6,true)}"></i> interesse</span><span><i style="background:#C9CFC7"></i> ${ic('lock',10)}</span></div>
  </div>
  <div class="col"><div class="seg sm">${sub.map(([k,l])=>`<button data-act="sptab" data-v="${k}" aria-pressed="${G.spTab===k}">${l}</button>`).join('')}</div>${body}</div></div>`;
 requestAnimationFrame(()=>{drawGlobe();globeEvents();document.querySelectorAll('#view .spgrid2 > .col').forEach(c=>c.scrollTop=0)});
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="fintab"]');if(t&&G){G.finTab=t.dataset.v;save();renderSponsor()}});
window.addEventListener('resize',()=>{if(G&&G.tab==='spon'&&G.finTab==='spon')drawGlobe()});
/* le offerte nuove portano direttamente agli sponsor */
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="tab"][data-v="spon"]');if(t&&G&&G.offers.length&&t.closest('#view'))G.finTab='spon'},true);

/* ---------- icone nel calendario ---------- */
const CALF_IC={acc:'go',reg:'contract',all:'calendar',ita:null,u23:'svil',wt:'trophy',naz:'team',done:'finish'};
const CALT_IC={all:'bike',crono:'crono',piatta:'velocista',ondulata:'mossa',montagna:'montagna',pave:'pave',tappe:'tappe',pista:'pista'};
const PILL_IC={reg:'contract',inv:'inbox',fee:'euro',lock:null,done:'finish'};
const _renderCalI=renderCal;
renderCal=function(){
 _renderCalI();
 document.querySelectorAll('#view [data-act="calf"]').forEach(b=>{const k=b.dataset.v;b.insertAdjacentHTML('afterbegin',k==='ita'?flagSvg('ITA',14)+' ':CALF_IC[k]?ic2(CALF_IC[k],13)+' ':'')});
 document.querySelectorAll('#view [data-act="calt"]').forEach(b=>{const k=b.dataset.v;if(CALT_IC[k])b.insertAdjacentHTML('afterbegin',ic2(CALT_IC[k],13)+' ')});
 document.querySelectorAll('#view .t.dt.cal .pill').forEach(p=>{if(/Iscrizioni chiuse/.test(p.textContent))p.textContent='Chiusa';const k=[...p.classList].find(c=>PILL_IC[c]);if(k&&!p.querySelector('svg'))p.insertAdjacentHTML('afterbegin',ic2(PILL_IC[k],12)+' ')});
};
/* chip delle corse: niente sigla del paese (c'è la bandiera) e tipo come icona */
const _raceChipsI=raceChips;
raceChips=function(r){
 let h=_raceChipsI(r).replace(/<span class="chip">[A-Z]{3}<\/span>/,'');
 h=h.replace(/<span class="muted">([^<]*)<\/span>/,(m,t)=>{const parts=t.split(' · ');const km=parts.find(p=>/km/.test(p))||'';const tap=/tappe/.test(t)?t:'';return`<span class="muted rmeta">${r.stages.length>1?ic2('tappe',12)+' '+r.stages.length:raceIc(r,12)}${km?' '+esc(km):''}</span>`});
 return h;
};
/* ---------- icone nel mercato ---------- */
const MK_IC={bids:'inbox',renew:'contract',fa:'free',others:'team',jr:'svil'};
const _renderMarketI=renderMarket;
renderMarket=function(){
 _renderMarketI();
 document.querySelectorAll('#view [data-act="mksub"]').forEach(b=>{const k=b.dataset.v;if(MK_IC[k]&&!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic2(MK_IC[k],13)+' ')});
 const ban=$('#view .banner');if(ban&&!ban.querySelector('.ic2')){const open=!ban.classList.contains('closed');ban.insertAdjacentHTML('afterbegin',`<span style="color:${open?'var(--ok)':'var(--muted)'}">${open?ic2('go',16):ic('lock',16)}</span>`)}
 const ex=$('#view .banner.closed[data-act="tab"]');if(ex)ex.querySelector('.chip')&&ex.querySelector('.chip').insertAdjacentHTML('beforebegin',ic2('contract',15));
};
if(G)render();
