"use strict";
/* ============================================================
   PALMARÈS: dei corridori (vittorie, podi, miglior piazzamento)
   e della squadra (vittorie, stagioni, titoli in nazionale)
   ============================================================ */
function palmOf(r){return r.palm||(r.palm={w:[],pod:0,t10:0,best:null,podl:[]})}
function palmRec(r,pos,name,cls){
 if(!r||!pos)return;const p=palmOf(r),s=SEASON;
 if(pos===1)p.w.push({s,n:name,c:cls});
 else if(pos<=3){p.podl.push({s,n:name,c:cls,p:pos});if(p.podl.length>30)p.podl.shift()}
 if(pos<=3)p.pod++;
 if(pos<=10)p.t10++;
 if(!p.best||pos<p.best.p)p.best={p:pos,n:name,s,c:cls};
}
function teamPalm(){return G.palm||(G.palm={w:[],pod:0,nat:[]})}
function teamRec(r,pos,name,cls,tier){
 if(!r||r.team!=='t0')return;const P=teamPalm();
 if(pos===1)P.w.push({s:SEASON,n:name,c:cls,t:tier,r:r.name});
 if(pos<=3)P.pod++;
}
const _applyOutcomeP=applyOutcome;
applyOutcome=function(race,field,final,stagesRes,RC){
 const out=_applyOutcomeP(race,field,final,stagesRes,RC);
 const multi=stagesRes.length>1;
 if(multi){const pro=race.stages[0].t==='prologo';
  stagesRes.forEach((res,i)=>{const nm=`${race.stages[i].t==='prologo'?'Prologo':'Tappa '+(i+(pro?0:1))} · ${race.name}`;
   res.slice(0,3).forEach((x,j)=>{const r=RID(x.id);palmRec(r,j+1,nm,race.lab);teamRec(r,j+1,nm,race.lab,race.tier)})})}
 const nm=multi?`${race.name} (classifica generale)`:race.name;
 final.forEach((x,j)=>{const r=RID(x.id);if(j<10||(r&&r.team==='t0'))palmRec(r,j+1,nm,race.lab);if(j<3)teamRec(r,j+1,nm,race.lab,race.tier)});
 return out;
};
const _natEffectsP=natEffects;
natEffects=function(ev,field,final){
 _natEffectsP(ev,field,final);
 final.forEach((x,j)=>{const r=RID(x.id);if(!r)return;if(j<10||r.team==='t0'||r.team==='acad')palmRec(r,j+1,ev.name,'Naz');
  if((r.team==='t0'||r.team==='acad')&&j<3)teamPalm().nat.push({s:SEASON,n:ev.name,p:j+1,r:r.name})});
};
function palmBlock(r){
 const p=palmOf(r);
 const wins=p.w.slice().reverse(),pods=p.podl.slice().reverse().slice(0,6);
 return`<div class="card pad stack"><div class="sec-h" style="margin:0"><h3>Palmarès</h3><span class="eyebrow">carriera</span></div>
  <div class="kv"><div><small>Vittorie</small><b>${p.w.length}</b></div><div><small>Podi</small><b>${p.pod}</b></div><div><small>Top 10</small><b>${p.t10}</b></div></div>
  ${(r.titles||[]).length?`<div class="titles">${r.titles.map(t=>`<span class="chip amber">${esc(t)}</span>`).join('')}</div>`:''}
  ${p.best?`<div class="note">Miglior piazzamento: <b>${ord(p.best.p)}</b> a ${esc(p.best.n)} (${p.best.s})</div>`:'<div class="note">Nessun piazzamento ancora.</div>'}
  ${wins.length?`<div><div class="eyebrow">Vittorie</div>${wins.slice(0,12).map(w=>`<div class="note">• ${w.s} · ${esc(w.n)} <span class="tm">${w.c}</span></div>`).join('')}${wins.length>12?`<div class="note">e altre ${wins.length-12}</div>`:''}</div>`:''}
  ${pods.length?`<div><div class="eyebrow">Podi</div>${pods.map(w=>`<div class="note">• ${w.s} · ${ord(w.p)} ${esc(w.n)}</div>`).join('')}</div>`:''}
 </div>`;
}
const TIER_W={gt:9,mon:8,uwt2:7,uwt1:6,pro:5,c1:4,nc:4,c2:3,u23:3,crit:2,jun:1,naz:8};
function renderTeamPalm(){
 const P=teamPalm(),hist=G.history.slice();
 const cur={season:SEASON,cat:G.cat,rank:myCatRank(),pts:teamPoints(ME()),wins:P.w.filter(w=>w.s===SEASON).length,cur:G.phase==='season'};
 const all=hist.concat(G.phase==='season'||!hist.some(h=>h.season===SEASON)?[cur]:[]);
 const bySeason={};for(const w of P.w)(bySeason[w.s]=bySeason[w.s]||[]).push(w);
 const riders={};for(const w of P.w)riders[w.r]=(riders[w.r]||0)+1;
 const top=Object.entries(riders).sort((a,b)=>b[1]-a[1]).slice(0,8);
 const bigs=P.w.filter(w=>['gt','mon','uwt1','uwt2','pro'].includes(w.t));
 return`<div class="kv kv4"><div><small>Vittorie totali</small><b>${P.w.length}</b></div><div><small>Podi</small><b>${P.pod}</b></div><div><small>Stagioni</small><b>${all.length}</b></div><div><small>Medaglie in nazionale</small><b>${P.nat.length}</b></div></div>
 <div class="futgrid" style="margin-top:12px"><div class="col">
  <div class="card pad"><div class="sec-h"><h3>Stagione per stagione</h3></div>
   <table class="t">${all.slice().reverse().map(h=>`<tr><td class="n">${h.season}</td><td>${CAT[h.cat].lab} · ${h.rank}ª${h.cur?' <span class="chip u23">in corso</span>':''}</td><td class="r">${h.wins} V</td><td class="r">${h.pts} pt</td></tr>`).join('')}</table></div>
  ${top.length?`<div class="card pad"><div class="sec-h"><h3>I più vincenti</h3></div><table class="t">${top.map(([n,c],i)=>`<tr><td class="n">${i+1}</td><td>${esc(n)}</td><td class="r">${c} vittori${c>1?'e':'a'}</td></tr>`).join('')}</table></div>`:''}
  ${P.nat.length?`<div class="card pad"><div class="sec-h"><h3>Medaglie in nazionale</h3></div>${P.nat.slice().reverse().map(m=>`<div class="note">• ${m.s} · ${['Oro','Argento','Bronzo'][m.p-1]} · ${esc(m.r)} · ${esc(m.n)}</div>`).join('')}</div>`:''}
 </div><div class="col">
  ${bigs.length?`<div class="card pad"><div class="sec-h"><h3>Le vittorie più importanti</h3></div>${bigs.sort((a,b)=>TIER_W[b.t]-TIER_W[a.t]).slice(0,8).map(w=>`<div class="note">• <b>${esc(w.n)}</b> · ${esc(w.r)} · ${w.s} <span class="tm">${w.c}</span></div>`).join('')}</div>`:''}
  <div class="card pad"><div class="sec-h"><h3>Tutte le vittorie</h3></div>
   ${Object.keys(bySeason).length?Object.keys(bySeason).sort((a,b)=>b-a).map(s=>`<div class="eyebrow" style="margin-top:6px">${s} · ${bySeason[s].length}</div>${bySeason[s].slice().sort((a,b)=>TIER_W[b.t]-TIER_W[a.t]).map(w=>`<div class="note">• ${esc(w.n)} — ${esc(w.r)} <span class="tm">${w.c}</span></div>`).join('')}`).join(''):'<div class="note">Ancora nessuna vittoria: la prima è la più bella.</div>'}</div>
 </div></div>`;
}
