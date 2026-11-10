"use strict";
/* ============================================================
   CARRIERA: XP dalle pagelle, stagioni di ogni corridore,
   classifiche individuali e storia del club
   ============================================================ */
/* XP: poca, così nessuno diventa un campione in pochi mesi.
   Voto 7 → 4 XP, voto 10 → 16 XP. Ogni 100 XP: +0,012 W/kg e +1 resistenza */
const XP_LV=100;
function giveXp(r,v){
 if(!r||r.team!=='t0'||v<=6)return 0;
 const xp=Math.round((v-6)*4);r.xp=(r.xp||0)+xp;
 while(r.xp>=XP_LV){r.xp-=XP_LV;r.lvl=(r.lvl||0)+1;
  r.wkg=+(r.wkg+0.012*(r.f?SXF.w:1)*(r.age>=31?0.5:1)).toFixed(4);r.endu=Math.min(99,r.endu+1);
  toast(`${r.name} sale di livello (${r.lvl})`,'gold');addNews(`${r.name}: livello ${r.lvl}`)}
 return xp;
}
/* ---------- stagioni dei corridori ---------- */
function uciRankMap(){const m={};Object.values(G.riders).filter(r=>r.pts>0&&G.teams.some(t=>t.id===r.team)).sort((a,b)=>b.pts-a.pts).forEach((r,i)=>m[r.id]=i+1);return m}
function careerSnap(){
 const rk=uciRankMap();
 for(const r of Object.values(G.riders)){
  if(!G.teams.some(t=>t.id===r.team)&&r.team!=='fa')continue;
  if(r.team==='fa'&&!r.days)continue;
  const car=r.car||(r.car=[]);if(car.some(c=>c.s===SEASON))continue;
  car.push({s:SEASON,t:r.team==='fa'?'—':TEAM(r.team).short,me:r.team==='t0',cat:catOf(r),age:r.age,d:r.days,p:r.pts,w:r.wins,o:ovr(r),rk:rk[r.id]||0});
  if(car.length>18)car.shift();
 }
}
const _newSeasonK=newSeason;
newSeason=function(up){careerSnap();if(G.other)withOther(careerSnap);return _newSeasonK(up)};
function careerRows(r){
 const now={s:SEASON,t:G.teams.some(t=>t.id===r.team)?TEAM(r.team).short:'—',me:r.team==='t0',cat:catOf(r),age:r.age,d:r.days,p:r.pts,w:r.wins,o:ovr(r),rk:uciRankMap()[r.id]||0,live:true};
 return(r.car||[]).concat([now]).reverse();
}
function careerBlock(r){
 const rows=careerRows(r),tot=rows.reduce((a,c)=>({w:a.w+c.w,p:a.p+c.p,d:a.d+c.d}),{w:0,p:0,d:0});
 const xp=r.team==='t0'?`<div class="xpline"><span class="eyebrow">Livello ${r.lvl||0}</span><div class="xpb"><i style="width:${(r.xp||0)/XP_LV*100}%"></i></div><small>${r.xp||0}/${XP_LV} XP</small></div>`:'';
 return`<div class="card pad stack"><div class="sec-h" style="margin:0"><h3>Carriera</h3><span class="eyebrow">${tot.w} vittorie · ${tot.d} giorni</span></div>${xp}
  <table class="t car"><tr class="th"><td>Anno</td><td>Squadra</td><td class="r">Val.</td><td class="r">Gg</td><td class="r">V</td><td class="r">Punti</td><td class="r">UCI</td></tr>
  ${rows.map(c=>`<tr class="${c.me?'me':''}"><td>${c.s}${c.live?'*':''}</td><td>${esc(c.t)} <span class="tm">${c.cat}</span></td><td class="r">${c.o}</td><td class="r">${c.d}</td><td class="r">${c.w||''}</td><td class="r">${c.p}</td><td class="r">${c.rk?c.rk+'°':'—'}</td></tr>`).join('')}</table>
  <div class="note">* stagione in corso</div></div>`;
}
const _riderSheetK=riderSheet;
riderSheet=function(id){
 _riderSheetK(id);const r=RID(id);if(!r)return;
 const cols=document.querySelectorAll('#sheet .negbox > .stack');const c=cols[cols.length-1];
 if(c)c.insertAdjacentHTML('afterbegin',careerBlock(r));
};

/* ---------- Classifica: Squadre / Corridori / Carriera ---------- */
const RK_SORT=[['pts','Punti UCI'],['wins','Vittorie'],['u23','Under 23'],['ovr','Valore'],['young','Promesse'],['days','Giorni di gara']];
function riderRanking(){
 const k=G.rkSort||'pts',scope=G.rkScope||'all';
 let rs=Object.values(G.riders).filter(r=>G.teams.some(t=>t.id===r.team));
 if(scope==='cat')rs=rs.filter(r=>tierOfTeam(TEAM(r.team))===G.cat||(G.cat==='conti'&&TEAM(r.team).tier==='dev'));
 if(k==='u23'||k==='young')rs=rs.filter(r=>r.age<=22);
 const val=r=>k==='wins'?r.wins*1000+r.pts:k==='ovr'?ovr(r):k==='young'?projOvr(r):k==='days'?r.days:r.pts;
 rs.sort((a,b)=>val(b)-val(a)||ovr(b)-ovr(a));
 const show=r=>k==='wins'?`${r.wins} V`:k==='ovr'?ovr(r):k==='young'?`${ovr(r)} → ${projOvr(r)}`:k==='days'?`${r.days} gg`:`${r.pts} pt`;
 const top=rs.slice(0,40),mine=rs.map((r,i)=>({r,i})).filter(o=>o.r.team==='t0'&&o.i>=40);
 const tr=(r,i)=>`<tr class="${r.team==='t0'?'me':''}" data-act="rider" data-v="${r.id}" style="cursor:pointer"><td class="n">${i+1}</td><td>${esc(r.name)} <div class="tm">${esc(TEAM(r.team).short)} · ${catOf(r)} · ${ARCH[r.arch].lab}</div></td><td class="r">${show(r)}</td></tr>`;
 return`<div class="toolbar"><div class="chips">${RK_SORT.map(([s,l])=>`<button class="fchip" data-act="rksort" data-v="${s}" aria-pressed="${k===s}">${l}</button>`).join('')}</div>
  <div class="seg sm" style="max-width:300px">${[['all','Tutti'],['cat','Mia categoria']].map(([s,l])=>`<button data-act="rkscope" data-v="${s}" aria-pressed="${scope===s}">${l}</button>`).join('')}</div></div>
  <div class="card tbl"><table class="t">${top.map((r,i)=>tr(r,i)).join('')}${mine.length?`<tr><td colspan="3" class="tm" style="text-align:center">…</td></tr>${mine.map(o=>tr(o.r,o.i)).join('')}`:''}</table></div>`;
}
function clubCareer(){
 const H=(G.history||[]).slice(),C=club(),ach=Object.keys(C.ach||{}).length;
 const now={season:SEASON,cat:G.cat,rank:myCatRank(),pts:teamPoints(ME()),wins:ME().riders.reduce((a,id)=>a+RID(id).wins,0),live:true};
 const rows=H.concat([now]).reverse();
 const best=H.length?H.slice().sort((a,b)=>(CAT[b.cat].rank-CAT[a.cat].rank)||(a.rank-b.rank))[0]:null;
 const legends=Object.values(G.riders).filter(r=>r.team==='t0'||(r.car||[]).some(c=>c.me)).map(r=>({r,w:(r.car||[]).filter(c=>c.me).reduce((a,c)=>a+c.w,0)+(r.team==='t0'?r.wins:0),s:(r.car||[]).filter(c=>c.me).length+(r.team==='t0'?1:0)})).filter(o=>o.w||o.s>1).sort((a,b)=>b.w-a.w||b.s-a.s).slice(0,10);
 return`<div class="kv kv4"><div><small>Stagioni</small><b>${H.length+1}</b></div><div><small>Vittorie del club</small><b>${C.wins||0}</b></div><div><small>Traguardi</small><b>${ach}/${ACH.length}</b></div><div><small>Miglior stagione</small><b>${best?`${best.rank}ª ${CAT[best.cat].lab}`:'—'}</b></div></div>
 <div class="basegrid" style="margin-top:12px"><div class="col"><div class="sec-h"><h2>Stagione per stagione</h2></div>
  <div class="card tbl"><table class="t"><tr class="th"><td>Anno</td><td>Categoria</td><td class="r">Pos.</td><td class="r">V</td><td class="r">Punti</td></tr>${rows.map(h=>`<tr class="${h.live?'me':''}"><td>${h.season}${h.live?'*':''}</td><td>${CAT[h.cat]?CAT[h.cat].lab:h.cat}</td><td class="r">${h.rank}ª</td><td class="r">${h.wins}</td><td class="r">${h.pts}</td></tr>`).join('')}</table></div></div>
 <div class="col"><div class="sec-h"><h2>Bandiere del club</h2><span class="eyebrow">vittorie con noi</span></div>
  ${legends.length?`<div class="card tbl"><table class="t">${legends.map((o,i)=>`<tr data-act="rider" data-v="${o.r.id}" style="cursor:pointer"><td class="n">${i+1}</td><td>${esc(o.r.name)} <div class="tm">${o.s} stagion${o.s>1?'i':'e'}${o.r.team!=='t0'?' · ex':''}</div></td><td class="r">${o.w} V</td></tr>`).join('')}</table></div>`:'<div class="note">Le prime vittorie scriveranno la storia del club.</div>'}</div></div>`;
}
const _renderRankK=renderRank;
renderRank=function(){
 const v=G.rkView||'teams';
 if(v==='teams')_renderRankK();else $('#view').innerHTML='';
 const seg=`<div class="seg rkseg" style="margin-bottom:12px">${[['teams','Squadre'],['riders','Corridori'],['career','Carriera']].map(([k,l])=>`<button data-act="rkview" data-v="${k}" aria-pressed="${v===k}">${l}</button>`).join('')}</div>`;
 if(v==='riders')$('#view').innerHTML=seg+riderRanking();
 else if(v==='career')$('#view').innerHTML=seg+clubCareer();
 else $('#view').insertAdjacentHTML('afterbegin',seg);
};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!G)return;const a=t.dataset.act,v=t.dataset.v;
 if(a==='rkview'){G.rkView=v;renderRank()}else if(a==='rksort'){G.rkSort=v;renderRank()}else if(a==='rkscope'){G.rkScope=v;renderRank()}
});
