"use strict";
/* ============================================================
   PREMI DI FINE STAGIONE: coppe ai migliori corridori
   ============================================================ */
W_KEYS.push('awards');
const AWARDS=[
 ['oro','Bici d\'Oro','Miglior corridore della stagione (punti UCI)','#D4A017'],
 ['gio','Bici d\'Oro Giovani','Miglior Under 23','#3B82F6'],
 ['vol','Re delle volate','Più vittorie in pianura','#23804A'],
 ['mon','Re della montagna','Più vittorie in salita e collina','#B4532A'],
 ['cla','Re delle classiche','Più vittorie nelle corse di un giorno dure','#7C3AED'],
 ['cro','Specialista delle crono','Più vittorie a cronometro','#475569'],
 ['tap','Re delle corse a tappe','Più classifiche generali vinte','#C2185B'],
 ['riv','Rivelazione','Il corridore cresciuto di più','#0E7490']
];
const nameIdx=()=>{const m={};for(const r of Object.values(G.riders))m[r.name]=r;return m};
function seasonWins(){
 const W={},N=nameIdx(),add=(r,k,w=1)=>{if(!r)return;(W[r.id]=W[r.id]||{vol:0,mon:0,cla:0,cro:0,tap:0,tw:0});W[r.id][k]+=w;W[r.id].tw+=w};
 const kind=t=>['crono','prologo'].includes(t)?'cro':['piatta','circuito'].includes(t)?'vol':['montagna','collinare'].includes(t)?'mon':'cla';
 for(const race of G.races){
  const R0=race.result;if(race.status!=='done'||!R0||!R0.top||!R0.top.length||['naz','jun','track'].includes(race.tier)||R0.junior)continue;
  const multi=race.stages.length>1;
  if(multi){(R0.stageW||[]).forEach((n,i)=>{const r=N[n];const t=race.stages[i]&&race.stages[i].t;if(r&&t)add(r,t==='mossa'?'vol':kind(t))});add(RID(R0.top[0].id),'tap',race.tier==='gt'?3:1)}
  else{const t=race.stages[0].t,k=kind(t);add(RID(R0.top[0].id),k==='mon'&&t==='collinare'?'cla':k)}
 }
 return W;
}
function computeAwards(){
 const pool=Object.values(G.riders).filter(r=>G.teams.some(t=>t.id===r.team));
 const W=seasonWins(),best=(arr,val)=>arr.filter(r=>val(r)>0).sort((a,b)=>val(b)-val(a)||b.pts-a.pts)[0];
 const out=[];
 const push=(k,r,v)=>{if(r)out.push({k,id:r.id,name:r.name,team:TEAM(r.team).short,me:r.team==='t0',v})};
 const o=best(pool,r=>r.pts);push('oro',o,o?`${o.pts} punti`:'');
 const g=best(pool.filter(r=>r.age<=22),r=>r.pts);push('gio',g,g?`${g.pts} punti`:'');
 for(const k of ['vol','mon','cla','cro','tap']){const r=best(pool,x=>W[x.id]?W[x.id][k]:0);push(k,r,r?(k==='tap'?`${W[r.id][k]} punti (Grande Giro = 3)`:`${W[r.id][k]} vittori${W[r.id][k]>1?'e':'a'}`):'')}
 const gain=r=>{const c=(r.car||[]).slice(-1)[0];return c&&c.s===SEASON-1?ovr(r)-c.o:0};
 const rv=best(pool.filter(r=>r.days>=15),gain);push('riv',rv,rv?`+${gain(rv)} di valore`:'');
 /* premi ai vincitori */
 let mine=[];
 for(const a of out){const r=RID(a.id);const A=AWARDS.find(x=>x[0]===a.k);
  (r.titles=r.titles||[]).push(`${A[1]} ${SEASON}`);
  if(r.team==='t0'){mine.push(a);r.mood=Math.min(100,(r.mood??65)+8);const cash=a.k==='oro'?50000:a.k==='gio'?20000:15000;G.cash+=cash;G.rep=clamp(G.rep+(a.k==='oro'?5:2),0,100);a.cash=cash}
 }
 (G.awards=G.awards||[]).push({s:SEASON,list:out});
 if(G.awards.length>15)G.awards.shift();
 return mine;
}
const _endOfSeasonA=endOfSeason;
endOfSeason=function(){
 const m=computeAwards();let o=[];if(G.other)o=withOther(computeAwards)||[];
 _endOfSeasonA();
 G.awSeen=null;
 if(m.length||o.length)toast(`Premiazioni: ${m.length+o.length} coppe per i tuoi!`,'gold');
};
function trophySvg(col,s=44){return`<svg viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true"><path d="M14 6h20v8a10 10 0 0 1-20 0z" fill="${col}"/><path d="M14 9H7v3a7 7 0 0 0 7 7M34 9h7v3a7 7 0 0 1-7 7" fill="none" stroke="${col}" stroke-width="3"/><rect x="21" y="23" width="6" height="9" fill="${col}"/><rect x="14" y="32" width="20" height="6" rx="2" fill="${col}"/><rect x="11" y="38" width="26" height="4" rx="2" fill="${col}" opacity=".75"/></svg>`}
function awardsGrid(list){return`<div class="awgrid">${list.map(a=>{const A=AWARDS.find(x=>x[0]===a.k);return`<button class="card aw ${a.me?'me':''}" data-act="rider" data-v="${a.id}">${trophySvg(A[3])}<div><small>${A[1]}</small><b>${esc(a.name)}</b><span>${esc(a.team)} · ${esc(a.v)}</span>${a.me?`<span class="chip amber">Tuo${a.cash?' · +'+eurk(a.cash):''}</span>`:''}</div></button>`}).join('')}</div>`}
function awardsSheet(seasonObj){
 const A=seasonObj;if(!A)return;
 const mine=A.list.filter(a=>a.me).length;
 openSheet(sheetHead(`Premiazioni ${A.s}`,'Le coppe della stagione',mine?`${mine} coppe per i tuoi corridori`:'Nessuna coppa per i tuoi: sarà per la prossima')+`<div class="pb wrap">${awardsGrid(A.list)}</div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Continua</button></div></div>`,'wide');
}
const _renderHomeA=renderHome;
renderHome=function(){
 _renderHomeA();
 const last=(G.awards||[]).slice(-1)[0];
 if(G.phase!=='season'&&last&&last.s===SEASON){
  const h=$('#view .hero');if(h)h.insertAdjacentHTML('afterend',`<button class="banner awb" data-act="awshow">${trophySvg('#D4A017',26)}<span><b>Premiazioni ${SEASON}</b>: ${last.list.filter(a=>a.me).length} coppe ai tuoi corridori</span></button>`);
  if(G.awSeen!==SEASON){G.awSeen=SEASON;save();awardsSheet(last)}
 }
};
/* albo d'oro nella Carriera */
const _clubCareerA=clubCareer;
clubCareer=function(){
 const A=(G.awards||[]).slice().reverse();
 return _clubCareerA()+(A.length?`<div class="sec-h" style="margin-top:14px"><h2>Albo d'oro</h2><span class="eyebrow">coppe di fine stagione</span></div>${A.map(s=>`<div class="eyebrow" style="margin:8px 0 4px">${s.s}</div>${awardsGrid(s.list)}`).join('')}`:'');
};
document.addEventListener('click',e=>{if(e.target.closest('[data-act="awshow"]')&&G)awardsSheet((G.awards||[]).slice(-1)[0])});
