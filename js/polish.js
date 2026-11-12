"use strict";
/* ============================================================
   RIFINITURA: icone e tabelle anche in Home, Allenamento,
   offerte di mercato, ritiri, nazionale, pacchetti, Club
   ============================================================ */
const TR_IC={fondo:'battery',soglia:'speed',salita:'montagna',volata:'velocista',crono:'crono',recupero:'clockw',riposo:'svil'};
IC2.drop='<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>';
const EFF_IC={endu:['battery','RES'],wkg:['montagna','W/kg'],spr:['velocista','VOL'],tt:['crono','CRO'],mass:['grade','peso']};
function effIcons(T){const e=T.eff,o=Object.keys(e).map(k=>`<span class="effi" title="${EFF_IC[k][1]}">${ic2(EFF_IC[k][0],12)}${e[k]<0&&k!=='tt'&&k!=='mass'?'−':'+'}</span>`);
 o.push(`<span class="effi ${T.fat>0?'neg':'pos'}" title="Fatica">${ic2('drop',12)}${T.fat>0?'−'+T.fat:'+'+(-T.fat)}</span>`);return o.join('')}
/* ---------- Allenamento ---------- */
trainCard=function(){
 const T=trainState(),w=G.week,racing=teamRacingWeek(w),last=T.last&&T.last.w===w-1?T.last:null;
 const opt=k=>Object.keys(TRAIN).map(x=>`<option value="${x}" ${T[k]===x?'selected':''}>${TRAIN[x].lab}</option>`).join('');
 const head=`<div class="sec-h"><h3>${ic2('bike',16)} Settimana ${w}</h3><span class="chip ${racing?'amber':'u23'}">${racing?`${ic2('flag',11)} gara`:`${ic2('calendar',11)} 2 sedute`}</span></div>`;
 const sess=racing?`<div class="note">${ic2('flag',13)} Settimana di gara: solo recupero.</div>`:DT(TH([['Giorno'],['Seduta'],['Effetto']]),[['s1','Mar'],['s2','Gio']].map(([k,d])=>`<tr><td><b>${d}</b></td><td><span class="pc"><span class="stic on">${ic2(TR_IC[T[k]]||'bike',14)}</span><select class="tsel" id="t${k}" data-tr="${k}" title="${esc(TRAIN[T[k]].desc)}">${opt(k)}</select></span></td><td>${effIcons(TRAIN[T[k]])}</td></tr>`).join(''));
 let rep='';
 if(last&&!last.skip&&last.lines.length){const idx={};for(const r of Object.values(G.riders))idx[r.name]=r;
  rep=`<div class="sec-h" style="margin-top:10px"><h3>${ic2('chart',15)} Settimana scorsa</h3><span class="eyebrow">${ic2(TR_IC[last.s1],11)} ${ic2(TR_IC[last.s2],11)}</span></div>${DT('',last.lines.slice(0,8).map(l=>{const[n,rest]=l.split(': ');const r=idx[n];return`<tr><td>${r?personCell(r):esc(n)}</td><td class="r">${(rest||'').split(', ').map(x=>`<span class="chip u23">${esc(x)}</span>`).join(' ')}</td></tr>`}).join(''))}`}
 return`<div>${head}${sess}${rep}</div>`;
};
/* ---------- Home ---------- */
const ACT_IC={adv1:['ic2','go'],advnext:['ic2','calendar'],convoca:['ic','team'],natgo:['ic2','flag'],jrgo:['ic2','svil'],callups:['ic2','flag']};
const _renderHomeP=renderHome;
renderHome=function(){
 _renderHomeP();
 const v=$('#view');
 v.querySelectorAll('[data-act]').forEach(b=>{const m=ACT_IC[b.dataset.act];if(m&&b.tagName==='BUTTON'&&!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',(m[0]==='ic'?ic(m[1],16):ic2(m[1],16))+' ')});
 v.querySelectorAll('.hero .eyebrow').forEach(e=>{if(!e.querySelector('svg'))e.insertAdjacentHTML('afterbegin',ic2('calendar',12)+' ')});
 v.querySelectorAll('h3').forEach(h=>{if(/Obiettivi/.test(h.textContent)&&!h.querySelector('svg'))h.insertAdjacentHTML('afterbegin',ic2('flag',15)+' ')});
 /* prossima corsa: bandiera */
 const h2=v.querySelector('.hero h2');const nx=nextMyRace();if(h2&&nx&&/Prossima/.test(h2.textContent)&&!h2.querySelector('svg'))h2.innerHTML=`${flagSvg(nx.ctry,22)} ${esc(nx.name)} <span class="tm">S${nx.w}</span>`;
};
/* ---------- Mercato: offerte ricevute in tabella ---------- */
bidsList=function(){
 const bs=(G.bids||[]).filter(b=>RID(b.rid)&&RID(b.rid).team==='t0'),listed=ME().riders.map(RID).filter(r=>r.listed);
 const t1=bs.length?DT(TH([['Corridore'],['Squadra'],['Indennizzo','r'],['Ingaggio','r hs'],['Scade','r hs'],['']]),bs.map(b=>{const r=RID(b.rid),t=TEAM(b.team),wk=Math.max(0,b.exp-absWeek());
  return`<tr><td>${personCell(r)}</td><td><span class="pc">${jersey(t.color,'#fff',18)}<b>${esc(t.short)}</b></span></td><td class="r"><b>${eurk(b.fee)}</b></td><td class="r hs">${eurk(b.sal)} <span class="tm">ora ${eurk(r.sal)}</span></td><td class="r hs">${G.phase==='season'?wk+' sett.':''}</td>
  <td class="r nowrap">${b.agreed?`<button class="btn primary sm" data-act="bidyes" data-v="${b.id}">${ic2('go',12)} Cedi</button>`:`<button class="btn ghost sm" data-act="bidno" data-v="${b.id}" title="Rifiuta">✕</button> <button class="btn sm" data-act="bidup" data-v="${b.id}:1.15">+15%</button> <button class="btn sm" data-act="bidup" data-v="${b.id}:1.3">+30%</button> <button class="btn primary sm" data-act="bidyes" data-v="${b.id}">✓</button>`}</td></tr>`}).join('')):`<div class="note">${ic2('inbox',13)} Nessuna offerta.</div>`;
 const t2=listed.length?`<div class="sec-h" style="margin-top:10px"><h3>${ic('market',15)} In vendita</h3></div>`+DT(TH([['Corridore'],['Prezzo','r']]),listed.map(r=>`<tr data-act="sell" data-v="${r.id}"><td>${personCell(r)}</td><td class="r"><b>${eurk(r.listed)}</b></td></tr>`).join('')):'';
 return t1+t2;
};
/* ---------- ritiro in altura: scelta corridori in tabella ---------- */
const _campSheetP=campSheet;
campSheet=function(){
 _campSheetP();
 const box=[...document.querySelectorAll('#sheet .negbox > .card')].pop();if(!box)return;
 const from=CAMPSEL.from,to=from+CAMPSEL.weeks-1,mine=ME().riders.map(RID).sort((a,b)=>ovr(b)-ovr(a));
 box.outerHTML=DT(TH([[''],['Corridore'],['Val','r'],['','r']]),mine.map(r=>{const conflict=inCamp(r,from,to)?'Già in ritiro':(r.bT>=from&&r.bF<=to)?'Ha una corsa':'';
  return`<tr class="${conflict?'off':''}"><td><input type="checkbox" data-act="camppick" data-v="${r.id}" ${CAMPSEL.ids.has(r.id)?'checked':''} ${conflict?'disabled':''} aria-label="${esc(r.name)}"></td><td>${personCell(r)}</td><td class="r"><b class="ov">${ovr(r)}</b></td><td class="r tm">${conflict?ic2('warn',12)+' '+conflict:r.age<=23?ic2('svil',12)+' cresce':''}</td></tr>`}).join(''),'conv');
};
/* ---------- convocazioni in nazionale in tabella ---------- */
callupSheet=function(){
 const cs=(G.callups||[]).filter(c=>RID(c.rid)&&c.to>=G.week).sort((a,b)=>(a.status==='pending'?0:1)-(b.status==='pending'?0:1)||a.from-b.from);
 openSheet(sheetHead('Federazioni','Convocazioni in nazionale','')+`<div class="pb wrap">${cs.length?DT(TH([['Corridore'],['Corse'],['Periodo','hs'],['','r']]),cs.map(c=>{const r=RID(c.rid),evs=c.keys.map(k=>G.races.find(x=>x.tier==='naz'&&x.key===k)).filter(Boolean),clash=G.races.filter(x=>x.status==='reg'&&x.w<=c.to&&x.w+x.dur-1>=c.from);
  return`<tr><td>${personCell(r)}</td><td>${evs.map(e=>`<span class="chip">${ic2('trophy',11)} ${esc(e.name.split(' · ').slice(0,2).join(' '))}</span>`).join(' ')}${clash.length?` <span class="neg" title="Salterebbe: ${esc(clash.map(x=>x.name).join(', '))}">${ic2('warn',12)} ${clash.length}</span>`:''}</td><td class="hs tm">${weekLab(c.from)}–${weekLab(c.to+1)}</td>
  <td class="r nowrap">${c.status==='pending'?`<button class="btn ghost sm" data-act="cuno" data-v="${c.id}">✕</button> <button class="btn primary sm" data-act="cuyes" data-v="${c.id}">✓ Accetta</button>`:`<span class="chip ${c.status==='accepted'?'u23':'red'}">${c.status==='accepted'?'Convocato':'Rifiutata'}</span>`}</td></tr>`}).join('')):`<div class="note">${ic2('flag',13)} Nessuna convocazione.</div>`}</div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Chiudi</button></div></div>`,'wide');
};
/* ---------- elenco del pacchetto in tabella ---------- */
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="pkpick"]');if(!t||!G)return;requestAnimationFrame(()=>{const l=$('#sheet .pklist');if(!l)return;const o=G.pk.offers[+t.dataset.v];
 l.outerHTML=DT(TH([['Sett.'],['Corsa'],['','r']]),o.races.map(id=>{const r=G.races.find(x=>x.id===id);return`<tr><td class="tm">S${r.w}</td><td><div class="rline">${flagSvg(r.ctry,16)}<b class="rn1">${esc(r.name)}</b><span class="mt">${raceChips(r)}</span></div></td><td class="r tm">${eurk(feeOf(r))}</td></tr>`}).join(''),'cal')})});
/* ---------- scheda corsa e Club: icone ---------- */
const _raceSheetP=raceSheet;
raceSheet=function(id){_raceSheetP(id);const s=$('#sheet');if(!s)return;
 s.querySelectorAll('.eyebrow').forEach(e=>{if(/^Costi$/.test(e.textContent.trim()))e.insertAdjacentHTML('afterbegin',ic2('euro',12)+' ')});
 s.querySelectorAll('[data-act="register"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic2(b.dataset.m==='singles'?'bike':'contract',15)+' ')});
 const w=s.querySelector('[data-act="withdraw"]');if(w&&!w.querySelector('svg'))w.insertAdjacentHTML('afterbegin',ic2('warn',13)+' ')};
const _renderBaseP=renderBase;
renderBase=function(){_renderBaseP();const v=$('#view');
 v.querySelectorAll('[data-act="acadup"],[data-act="foundother"],[data-act="side"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic(b.dataset.act==='acadup'?'base':'team',15)+' ')});
 v.querySelectorAll('label.eyebrow, .eyebrow').forEach(e=>{if(/^Osservatori$/.test(e.textContent.trim()))e.insertAdjacentHTML('afterbegin',ic2('flag',11)+' ')});
 v.querySelectorAll('h3').forEach(h=>{if(/squadr/i.test(h.textContent)&&!h.querySelector('svg'))h.insertAdjacentHTML('afterbegin',ic('team',16)+' ')});
};
if(G)render();
