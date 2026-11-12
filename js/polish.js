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
 if(G.phase==='season'&&!v.querySelector('.pkhero'))homeRebuild(v);
};
/* Home in stagione: settimana compatta a sinistra, classifica e obiettivi a destra */
function homeRebuild(v){
 const banners=[...v.querySelectorAll('.banner')].filter(b=>!b.closest('.hero'));
 const pend=myPending(),nx=nextMyRace(),norm=pend.filter(r=>r.tier!=='jun'&&r.tier!=='naz'),spec=pend.filter(r=>r.tier==='jun'||r.tier==='naz');
 const rl=r=>`<div class="rline">${flagSvg(r.ctry,18)}<b class="rn1" title="${esc(r.name)}">${esc(r.name)}</b><span class="chip cls">${r.lab}</span>${r.stages.length>1?`<span class="tm nowrap">${ic2('tappe',13)}${r.stages.length}</span>`:typeIc(r.stages[0].t,14)}</div>`;
 let rows='';
 if(norm.length)rows=DT('',norm.map(r=>`<tr><td>${rl(r)}</td><td class="r"><button class="btn primary sm" data-act="convoca" data-v="${r.id}" title="Convocazioni">${ic('team',15)}</button></td></tr>`).join(''),'hrace');
 else if(!pend.length&&nx)rows=DT('',`<tr data-act="race" data-v="${nx.id}"><td>${rl(nx)}</td><td class="r tm nowrap">${ic2('clockw',12)} ${nx.w-G.week} sett.</td></tr>`,'hrace');
 else if(!pend.length)rows=`<div class="note">${ic2('calendar',13)} Nessuna corsa in programma.</div>`;
 const btns=pend.length?'':`${nx?`<button class="btn sm" data-act="advnext" title="Vai alla prossima corsa">${ic2('finish',14)} S${nx.w}</button>`:`<button class="btn sm" data-act="tab" data-v="cal">${ic('cal',14)}</button>`}<button class="btn primary sm" data-act="adv1">${ic2('go',14)} Avanza</button>`;
 const wk=`<div class="card pad wkcard ${pend.length?'go':''}"><div class="wkh">${ic2(pend.length?'flag':'calendar',15)}<b>Settimana ${G.week}</b><span class="tm">${weekLab(G.week)}</span><span style="flex:1"></span>${btns}</div>${rows}${spec.map(r=>r.tier==='jun'?jrHero(r):natHero(r)).join('')}</div>`;
 const objs=G.contracts.filter(c=>activeIn(c,SEASON)).sort((a,b)=>b.amount-a.amount).slice(0,6).map(c=>{const s=SP(c.sid),val=Math.min(c.obj.n,Math.round(contractProg(c)));
  return`<tr class="${c.done?'okr':''}" data-act="tab" data-v="spon"><td><span class="pc">${spLogo(s,20)}<b>${esc(s.name)}</b><span class="tm sub">${esc(c.obj.txt)}</span></span></td><td style="width:22%">${miniBar(val,c.obj.n,c.done?'ok':'')}</td><td class="r">${val}/${c.obj.n}</td><td class="r"><b>${c.done?ic('check',14):eurk(c.bonus)}</b></td></tr>`}).join('');
 const obj=`<div><div class="sec-h"><h3>${ic2('flag',15)} Obiettivi sponsor</h3><span class="chip">${sponsorSat()}%</span></div>${objs?DT('',objs,'hobj'):`<div class="note">${ic('spon',13)} Nessuno sponsor attivo.</div>`}</div>`;
 const g=document.createElement('div');g.className='homegrid';
 g.innerHTML=`<div class="col hc1">${wk}</div><div class="col hc2">${standMini()}${obj}</div>`;
 const c1=g.firstChild;banners.forEach(b=>c1.appendChild(b));c1.insertAdjacentHTML('beforeend',trainMini());
 v.innerHTML='';v.appendChild(g);
}
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
/* ---------- Gara dal vivo: icone su ordini, comandi e momenti ---------- */
IC2.bell='<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>';
IC2.ffwd='<path d="M3 6l8 6-8 6zM12 6l8 6-8 6z"/>';
const ORD_IC={auto:'contract',ruota:'bike',copri:'free',tira:'speed',scatta:'velocista',scorta:'shield'};
const _renderMineP=renderMine;
renderMine=function(full){_renderMineP(full);const b=$('#mine .orders button');if(!b||b.querySelector('svg'))return;
 document.querySelectorAll('#mine .orders button').forEach(x=>{x.title=x.textContent;x.innerHTML=`${ic2(ORD_IC[x.dataset.v]||'bike',15)}<small>${x.textContent}</small>`})};
function momswHtml(){return`${ic2('bell',15)}<small>${LIVE.noMom?'off':'on'}</small>`}
const _renderRaceSkeletonP=renderRaceSkeleton;
renderRaceSkeleton=function(){_renderRaceSkeletonP();const c=$('#race .ctrl .wrap');if(!c)return;
 const m=c.querySelector('[data-act="momsw"]');if(m){m.innerHTML=momswHtml();m.classList.add('icb')}
 const j=c.querySelector('[data-act="jump"]');if(j){j.innerHTML=`${ic2('finish',15)}<small>Finale</small>`;j.classList.add('icb');j.title='Salta al finale'}
 const e=c.querySelector('[data-act="end"]');if(e){e.innerHTML=`${ic2('ffwd',15)}<small>Fine</small>`;e.classList.add('icb');e.title='Simula fino all\'arrivo'}
 const p=$('#playb');if(p)p.title='Pausa'};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="momsw"]');if(t&&LIVE)t.innerHTML=momswHtml()});
const MOM_IC=[[/coper|ruota|rialza|aspett|lascia|gestisce|calma|tranquill|risparm/i,'battery'],[/treno|tira|ritmo|insiste|forza|tenere|tiene/i,'speed'],[/scatt|attacc|manda|risponde|prova|vai|anticip/i,'velocista'],[/chiude|insegu|riporta|gregario|compagn/i,'shield'],[/cambi|bici|ammiraglia|medic/i,'injury']];
const _momShowP=momShow;
momShow=function(ev){_momShowP(ev);document.querySelectorAll('#mom .momb').forEach(b=>{const t=(b.querySelector('b')||b).textContent,m=MOM_IC.find(([re])=>re.test(t));const h=b.querySelector('b');if(h&&!h.querySelector('svg'))h.insertAdjacentHTML('afterbegin',ic2(m?m[1]:'go',16)+' ');
 const ch=b.querySelector('.chip.amber');if(ch)ch.innerHTML=`${ic2('cap',11)} DS`})};
/* ---------- Tattica pre-gara: icone su sezioni e pulsanti ---------- */
const _renderTacticP=renderTactic;
renderTactic=function(){_renderTacticP();const s=$('#sheet');if(!s)return;
 s.querySelectorAll('.pb .eyebrow').forEach(e=>{const t=e.textContent.trim();if(e.querySelector('svg'))return;
  if(/^Percorso/.test(t))e.innerHTML=`${ic2('montagna',12)} Percorso`;
  else if(/Obiettivo/.test(t))e.innerHTML=`${ic2('flag',12)} Obiettivo`;
  else if(/Piano dei corridori/.test(t))e.innerHTML=`${ic('team',12)} Compiti`;
  else if(/Piano dei singoli/.test(t))e.innerHTML=`${ic2('bike',12)} Ognuno per sé`});
 const B=(a,h,tt)=>{const b=s.querySelector(`.pf [data-act="${a}"]`);if(b){b.innerHTML=h;if(tt)b.title=tt}};
 B('tacreset',`${ic2('cap',15)} Consigliato`,'Piano consigliato');B('tacback',`${ic('team',15)} Convocati`);
 const g=s.querySelector('.pf [data-act="tacgo"]');if(g&&!g.querySelector('svg'))g.insertAdjacentHTML('afterbegin',ic2('go',16)+' ');
 /* sotto-righe: archetipo già nell'icona → solo l'adattamento come numero colorato */
 s.querySelectorAll('.t.tac .tm.sub, .t.tac .pcs').forEach(x=>{const m=x.textContent.match(/adatto (\d+)/);if(!m)return;const v=+m[1],cap=/capitano/.test(x.textContent),gap=(x.textContent.split(' · ').find(p=>/^[+−-]|^a |'/.test(p.trim()))||'');
  x.innerHTML=`<span class="suit ${v>=70?'pos':v<55?'neg':''}" title="Adattamento al percorso">${ic2('chart',11)}${v}</span>${cap?` ${ic2('cap',11)}`:''}${gap?` <span class="tm">${esc(gap.trim())}</span>`:''}`})};
