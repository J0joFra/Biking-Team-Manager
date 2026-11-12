"use strict";
/* ============================================================
   GRUPPI PER SPECIALITÀ
   Un gruppo per specialità (Grandi giri, Salita, Classiche,
   Volate, Cronometro, Pista). Ogni corridore sta al massimo in
   2 gruppi. Ogni corsa va al gruppo della sua specialità (o a
   quello più simile, se è già impegnato). Se un corridore del
   gruppo è infortunato o in nazionale, il DS lo sostituisce con
   un altro solo per quella corsa.
   ============================================================ */
const GSPEC={gt:'Grandi giri',salita:'Salita',classiche:'Classiche',volate:'Volate',crono:'Cronometro',pista:'Pista'};
const GSPEC_IC={gt:'tappe',salita:'montagna',classiche:'pave',volate:'velocista',crono:'crono',pista:'pista'};
const GSPEC_COL={gt:'#C2185B',salita:'#B4532A',classiche:'#7C3AED',volate:'#23804A',crono:'#475569',pista:'#0E7490'};
const GALT={gt:['gt','salita'],salita:['salita','gt'],classiche:['classiche','volate'],volate:['volate','classiche'],crono:['crono','gt'],pista:['pista','crono','volate']};
const SQ_MAX=2;
/* stato: G.groups={on,active:[specialità attive]}; corridore: r.sq=[specialità] */
function groups(){
 let g=G.groups;
 if(Array.isArray(g)){/* vecchio formato A/B/C */
  const map={};for(const x of g)map[x.id]=GSPEC[x.spec]?x.spec:null;
  for(const r of Object.values(G.riders))if(r.grp){r.sq=map[r.grp]?[map[r.grp]]:[];delete r.grp}
  g=G.groups={on:g.length>0,active:[...new Set(Object.values(map).filter(Boolean))]};
 }
 g=g||(G.groups={on:false,active:[]});g.caps=g.caps||{};return g;
}
const sqOn=()=>{const g=groups();return g.on&&g.active.length>0};
const sqOf=r=>(r.sq||[]).filter(k=>groups().active.includes(k));
function gScore(r,spec){return spec==='pista'?Math.round(trackScore(r,'ip')*0.5+trackScore(r,'sc')*0.5):specScore(r,spec)}
function gChip(k,s=12){return GSPEC[k]?`<span class="gchip" style="background:${GSPEC_COL[k]}" title="${GSPEC[k]}">${ic2(GSPEC_IC[k],s)}</span>`:''}
function sqChips(r){return sqOn()?sqOf(r).map(k=>gChip(k,11)).join(''):''}
function sqToggle(r,k){
 r.sq=sqOf(r);const i=r.sq.indexOf(k);
 if(i>=0){r.sq.splice(i,1);if(groups().caps[k]===r.id)delete groups().caps[k];return true}
 if(r.sq.length>=SQ_MAX){toast(`${r.name.split(' ').slice(-1)[0]} è già in ${SQ_MAX} gruppi`,'bad');return false}
 r.sq.push(k);return true;
}
/* distribuzione automatica: ognuno nei gruppi dove rende di più (max 2), gruppi equilibrati */
function autoGroups(){
 const g=groups(),A=g.active;if(!A.length)return;
 const rs=ME().riders.map(RID);for(const r of rs)r.sq=[];
 const target=Math.ceil(rs.length*Math.min(SQ_MAX,A.length)/A.length),cnt={};A.forEach(k=>cnt[k]=0);
 /* valore per un gruppo: bravura nella specialità + quanto è "sua" rispetto alle altre */
 const own=r=>A.reduce((a,k)=>a+gScore(r,k),0)/A.length;
 const val=(r,k)=>gScore(r,k)+(gScore(r,k)-own(r))*1.5;
 /* 1° giro: ognuno in un gruppo, a turno */
 let left=rs.slice(),t=0;
 while(left.length){const k=A[t++%A.length];left.sort((a,b)=>val(b,k)-val(a,k));const r=left.shift();r.sq.push(k);cnt[k]++}
 /* 2° giro: secondi gruppi fino a riempire, a turno */
 let guard=0;
 while(guard++<200){let added=false;
  for(const k of A){if(cnt[k]>=target)continue;const c=rs.filter(r=>r.sq.length<SQ_MAX&&!r.sq.includes(k)).sort((a,b)=>val(b,k)-val(a,k))[0];if(c){c.sq.push(k);cnt[k]++;added=true}}
  if(!added)break}
 /* capitano di ogni gruppo: il migliore nella specialità */
 g.caps={};for(const k of A){const b=rs.filter(r=>r.sq.includes(k)).sort((a,b)=>gScore(b,k)-gScore(a,k))[0];if(b)g.caps[k]=b.id}
 save();
}
function setGroupCap(r,k){const g=groups();if(!sqOf(r).includes(k)){if(!sqToggle(r,k))return false}if(g.caps[k]===r.id)delete g.caps[k];else g.caps[k]=r.id;save();return true}
function groupCap(k){const id=groups().caps[k];const r=id&&RID(id);return r&&r.team==='t0'&&sqOf(r).includes(k)?r:null}
/* gruppo che corre una corsa: scelto a mano o in base al terreno */
function raceSpecK(r){return r.tier==='track'?'pista':raceSpec(r)}
function raceGroup(race){
 if(!sqOn()||race.grp==='all')return null;
 const A=groups().active;
 if(race.grp&&A.includes(race.grp))return race.grp;
 const ov=G.races.filter(r=>r===race||(r.status==='reg'&&r.tier!=='naz'&&r.w<=race.w+race.dur-1&&r.w+r.dur-1>=race.w));
 if(!ov.includes(race))ov.push(race);
 ov.sort((a,b)=>(a.grp?0:1)-(b.grp?0:1)||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]||b.stages.length-a.stages.length||(a.id<b.id?-1:1));
 const taken=new Set();
 for(const r of ov){
  if(r.grp&&r!==race){if(A.includes(r.grp))taken.add(r.grp);continue}
  const alt=(GALT[raceSpecK(r)]||[]).filter(k=>A.includes(k));
  let g=alt.find(k=>!taken.has(k))||alt[0]||null;
  if(!g){g=A.find(k=>!taken.has(k))||A[0]}
  taken.add(g);if(r===race)return g;
 }
 return null;
}
/* ---------- convocazioni: prima il gruppo, poi i sostituti ---------- */
const _suggestG=suggest;
suggest=function(){
 const race=SEL.race,g=raceGroup(race);SEL.subs=new Set();SEL.missing=[];
 if(!g)return _suggestG();
 autoRoles();
 const all=ME().riders.map(RID),size=selSize(race);
 const score=r=>avgSuit(r,race)-r.fat*0.45-(r.days>65?12:0)+altEff(r,race.w)*300+roleBonus(r,race);
 const members=all.filter(r=>sqOf(r).includes(g));
 SEL.missing=members.filter(r=>whyCant(r,race)).map(r=>({r,why:whyCant(r,race)}));
 const gc=groupCap(g),okM=members.filter(r=>!whyCant(r,race)).sort((a,b)=>(b===gc)-(a===gc)||score(b)-score(a)).slice(0,size);
 const others=all.filter(r=>!members.includes(r)&&!whyCant(r,race)).sort((a,b)=>score(b)-score(a)+(sqOf(a).length?0:0));
 const fill=others.slice(0,Math.max(0,size-okM.length));
 const pickd=okM.concat(fill);
 SEL.ids=new Set(pickd.map(r=>r.id));SEL.subs=new Set(fill.map(r=>r.id));
 const sp=raceSpec(race),by=(a,b)=>avgSuit(b,race)-avgSuit(a,race);
 const capC=pickd.filter(r=>r.role==='cap'&&r.spec===sp).sort(by)[0]||pickd.filter(r=>r.role==='cap').sort(by)[0]||pickd.slice().sort(by)[0];
 SEL.cap=gc&&SEL.ids.has(gc.id)?gc.id:capC?capC.id:null;
};
function grpRow(race){
 if(!sqOn())return'';
 const A=groups().active,cur=race.grp||'auto',sv=race.grp;race.grp=null;const auto=raceGroup(race);race.grp=sv;
 return`<div class="grow"><div class="chips">${[['auto',`Auto ${auto?gChip(auto):''}`],...A.map(k=>[k,`${gChip(k)} ${GSPEC[k]}`]),['all','Tutti']].map(([k,l])=>`<button class="fchip" data-act="racegrp" data-r="${race.id}" data-v="${k}" aria-pressed="${cur===k}">${l}</button>`).join('')}</div></div>`;
}
const _renderConvocaG=renderConvoca;
renderConvoca=function(){
 _renderConvocaG();
 const race=SEL.race;if(!sqOn())return;
 const w=$('#sheet .pb .wrap');
 const miss=(SEL.missing||[]).length?`<div class="subnote">${SEL.missing.map(o=>`<span title="${esc(o.why)}">${/nazionale/i.test(o.why)?flagSvg(o.r.nat,14):ic2(/Infortun/.test(o.why)?'injury':/stanco/i.test(o.why)?'battery':'warn',13)} ${esc(o.r.name.split(' ').slice(-1)[0])}</span>`).join(' ')} <span class="tm">fuori: ${SEL.missing.length}</span></div>`:'';
 if(w)w.insertAdjacentHTML('afterbegin',grpRow(race)+miss);
 for(const r of ME().riders.map(RID)){const el=document.querySelector(`#sheet label[for="p_${r.id}"] .nm`);if(!el)continue;
  if(sqOf(r).length)el.insertAdjacentHTML('beforeend',' '+sqChips(r));
  if(SEL.subs&&SEL.subs.has(r.id)&&SEL.ids.has(r.id)){const i=[...SEL.subs].indexOf(r.id),sub=i<(SEL.missing||[]).length;el.insertAdjacentHTML('beforeend',` <span class="chip ${sub?'amber':''}" title="${sub?'Al posto di un assente, solo per questa corsa':'Completa la squadra'}">${sub?'Sostituto':'Rinforzo'}</span>`)}}
};
/* pista: preferisce il gruppo pista */
const _trackConvocaG=trackConvoca;
trackConvoca=function(race){
 _trackConvocaG(race);const g=raceGroup(race);if(!g)return;
 const rs=ME().riders.map(RID).filter(r=>!whyCant(r,race)),inG=r=>sqOf(r).includes(g)?25:0;
 for(const k of race.disc){const n=k==='tp'?4:1;TSEL.sel[k]=rs.slice().sort((a,b)=>trackScore(b,k)+inG(b)-trackScore(a,k)-inG(a)).slice(0,rs.length>=n?n:0).map(r=>r.id)}
 renderTrackConv();
};
/* ---------- calendario e scheda corsa ---------- */
const _raceChipsG=raceChips;
raceChips=function(r){const h=_raceChipsG(r);if(r.status!=='reg'||!sqOn())return h;const g=raceGroup(r);return(g?gChip(g):'<span class="chip">Tutti</span>')+h};
const _raceSheetG=raceSheet;
raceSheet=function(id){
 _raceSheetG(id);
 const r=G.races.find(x=>x.id===id);if(!r||r.status!=='reg'||!sqOn())return;
 const side=$('#sheet .rsside');if(side)side.insertAdjacentHTML('beforeend',`<div><div class="eyebrow">Chi corre</div>${grpRow(r)}</div>`);
};
/* ---------- Squadra › Gruppi: tabella corridori × specialità ---------- */
function renderGroups(){
 const g=groups(),A=g.active,rs=ME().riders.map(RID).sort((a,b)=>ovr(b)-ovr(a));
 const head=`<div class="toolbar"><div class="seg sm" style="max-width:230px">${[[0,'Spenti'],[1,'Attivi']].map(([v,l])=>`<button data-act="gon" data-v="${v}" aria-pressed="${!!g.on===!!v}">${l}</button>`).join('')}</div>
  ${g.on?`<div class="chips">${Object.keys(GSPEC).map(k=>`<button class="fchip" data-act="gspec" data-v="${k}" aria-pressed="${A.includes(k)}">${gChip(k)} ${GSPEC[k]}</button>`).join('')}</div><button class="btn sm" data-act="gauto">Auto</button>`:''}</div>`;
 if(!g.on||!A.length)return head;
 const cnt=k=>rs.filter(r=>sqOf(r).includes(k)).length;
 const up=k=>G.races.filter(r=>r.status==='reg'&&r.w>=G.week&&raceGroup(r)===k).length;
 const th=`<tr class="th"><td>Corridore</td>${A.map(k=>`<td class="c">${gChip(k)}<div class="tm">${cnt(k)} · ${up(k)}${ic2('calendar',10)}</div></td>`).join('')}</tr>`;
 const rows=rs.map(r=>{const m=sqOf(r);return`<tr class="${m.length?'':'off'}"><td>${personCell(r)}<div class="tm pcs">${ic2(r.arch,11)} ${ARCH[r.arch].lab}${injured(r)?` <span class="neg">${ic2('injury',11)}</span>`:''}${r.natB&&r.natB[1]>=G.week?' '+flagSvg(r.nat,12):''}</div></td>
  ${A.map(k=>{const on=m.includes(k),sc=gScore(r,k);return`<td class="c"><button class="tkc ${on?'':''}" data-act="gtog" data-id="${r.id}" data-v="${k}" aria-pressed="${on}" ${!on&&m.length>=SQ_MAX?'data-full="1"':''}>${on?'✓ ':''}${sc}</button></td>`}).join('')}</tr>`}).join('');
 return head+`<div class="card tbl dtw"><table class="t dt trk grp">${th}${rows}</table></div>`;
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!G)return;
 const a=t.dataset.act,v=t.dataset.v,g=groups();
 if(a==='gon'){g.on=v==='1';if(g.on&&!g.active.length){g.active=['gt','classiche','volate'];autoGroups()}save();renderTeam()}
 else if(a==='gspec'){const i=g.active.indexOf(v);if(i>=0){g.active.splice(i,1);for(const r of ME().riders.map(RID))r.sq=(r.sq||[]).filter(k=>k!==v)}else g.active.push(v);save();renderTeam()}
 else if(a==='gauto'){autoGroups();renderTeam();toast('Gruppi ridistribuiti','ok')}
 else if(a==='gtog'){const r=RID(t.dataset.id);if(sqToggle(r,v)){save();const sc=$('#view .vscroll')?$('#view .vscroll').scrollTop:0;renderTeam();const vs=$('#view .vscroll');if(vs)vs.scrollTop=sc}}
 else if(a==='racegrp'){const r=G.races.find(x=>x.id===t.dataset.r);r.grp=v==='auto'?null:v;save();
  if(SEL&&SEL.race===r&&$('#sheet .t.dt.conv')){suggest();renderConvoca()}else{raceSheet(r.id);if(G.tab==='cal')renderCal()}}
});
/* compatibilità: alcune parti chiamano setGroups(n) */
function setGroups(n){const g=groups();g.on=n>0;if(g.on&&!g.active.length)g.active=['gt','classiche','volate'].slice(0,Math.max(2,n));if(g.on)autoGroups();save()}
