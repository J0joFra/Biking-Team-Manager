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
 g.innerHTML=`<div class="col hc1">${wk}</div><div class="col hc2">${standMini()}${recentMini()}</div>`;
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
/* ---------- Home: ultimi risultati al posto degli obiettivi sponsor ---------- */
const medalOf=p=>p>=1&&p<=3?`<span class="medal m${p}">${p}</span>`:p>=999?`<span class="tm">${ic2('injury',12)}</span>`:`<b>${p}°</b>`;
function recentMini(){
 const rs=G.races.filter(r=>r.status==='done'&&r.result&&r.result.winner&&r.tier!=='jun').sort((a,b)=>b.w-a.w).slice(0,5);
 if(!rs.length)return'';
 return`<div><div class="sec-h"><h3>${ic2('finish',15)} Ultime corse</h3><button class="chip" data-act="tab" data-v="palm">Tutte ›</button></div>${DT('',rs.map(r=>{const m=(r.result.mine||[])[0];
  return`<tr data-act="race" data-v="${r.id}"><td><div class="rline">${flagSvg(r.ctry,16)}<b class="rn1">${esc(r.name)}</b><span class="chip cls">${r.lab}</span></div></td><td class="r nowrap">${m?medalOf(m.pos):'<span class="tm">—</span>'}</td><td class="r nowrap tm">${ic2('trophy',12)} ${esc(r.result.winner.split(' ').slice(-1)[0])}</td></tr>`}).join(''),'hrace')}</div>`;
}
/* ---------- utilità squadre ---------- */
const teamByName=n=>G.teams.find(t=>t.name===n||t.short===n);
const tJer=(t,s=16)=>t?(t.id==='t0'?myJersey(s):jersey(t.color,'#fff',s)):'';
const TIER_SH={wt:['WT','wt'],pro:['PRO','pro'],conti:['CT','ct'],dev:['DEV','dev']};
function tierChip(t){const k=tierOfTeam(t),m=TIER_SH[k]||[(CAT[G.cat]||{}).lab||'',''];return`<span class="tierc ${m[1]}">${m[0]}</span>`}
const whyIc=s=>{s=s.trim();let m;
 if(s==='vittoria')return`<span class="wy pos" title="Vittoria">${ic2('trophy',13)}</span>`;
 if(s==='podio')return`<span class="wy pos" title="Podio">${ic2('trophy',13)}</span>`;
 if(s==='top 10')return`<span class="wy" title="Top 10">${ic2('chart',13)}10</span>`;
 if(s==='tanto lavoro')return`<span class="wy" title="Tanto lavoro per la squadra">${ic2('gregario',13)}</span>`;
 if(s==='ritirato')return`<span class="wy neg" title="Ritirato">${ic2('injury',13)}</span>`;
 if(s==='sottotono')return`<span class="wy neg" title="Sottotono">${ic2('warn',13)}</span>`;
 if((m=s.match(/^(\d+) km in fuga/)))return`<span class="wy" title="In fuga">${ic2('go',13)}${m[1]} km</span>`;
 return`<span class="tm">${esc(s)}</span>`};
/* ---------- pagelle in tabella con icone ---------- */
const _showStageResultP=showStageResult;
showStageResult=function(){const g=LIVE&&LIVE.grades?LIVE.grades.slice():null;_showStageResultP();const box=$('#sheet .pag');if(!box||!g)return;
 box.outerHTML=`<div><div class="sec-h"><h3>${ic2('cap',15)} Pagelle</h3></div>${DT('',g.map(x=>{const r=RID(x.id);return`<tr ${r?`data-act="rider" data-v="${r.id}"`:''}><td style="width:40px"><b class="pgv ${x.v>=7.5?'hi':x.v<5.5?'lo':''}">${String(x.v).replace('.',',')}</b></td><td>${r?personCell(r):esc(x.name)}${x.lead?` ${ic2('cap',12)}`:''}</td><td class="r nowrap">${x.why?x.why.split(', ').map(whyIc).join(''):''}${x.xp?` <span class="xpc">+${x.xp} XP</span>`:''}</td></tr>`}).join(''),'pagt')}</div>`};
/* ---------- bilancio della corsa ---------- */
const _showFinalP=showFinal;
showFinal=function(RC){const out=_showFinalP(RC);const s=$('#sheet');if(!s)return out;
 const KI={Punti:ic2('chart',13),Premi:ic2('euro',13),Sponsor:ic('spon',13),Reputazione:ic2('cap',13)};
 s.querySelectorAll('.kv small').forEach(x=>{const k=x.textContent.trim();if(KI[k]&&!x.querySelector('svg'))x.innerHTML=`${KI[k]} ${k}`});
 const HI={'La tua squadra':ic('team',15),"Ordine d'arrivo":ic2('finish',15),'Classifica finale':ic2('finish',15),'Classifica a squadre':ic('team',15)};
 s.querySelectorAll('h3').forEach(h=>{const k=h.textContent.trim();if(HI[k]&&!h.querySelector('svg'))h.innerHTML=`${HI[k]} ${k}`});
 /* classifica a squadre: maglie */
 s.querySelectorAll('h3').forEach(h=>{if(!/a squadre/.test(h.textContent))return;const tb=h.closest('div').parentElement.querySelector('.card.tbl table');if(!tb)return;
  tb.querySelectorAll('tr').forEach(tr=>{const c=tr.children[1];if(!c||c.querySelector('svg'))return;const n=c.textContent.trim(),t=teamByName(n)||(n===G.name?ME():null);if(t)c.innerHTML=`<span class="pc">${tJer(t,18)}<b>${esc(n)}</b></span>`})});
 return out};
/* ---------- classifica squadre ---------- */
teamsRank=function(){
 const f=G.rankf||'mine',tier=f==='mine'?G.cat:f==='all'?null:f,tr=teamRanking(tier);
 const FI={mine:ic('team',13),wt:'',pro:'',conti:'',all:''};
 return`<div class="toolbar"><div class="chips">${[['mine','Mia categoria'],['wt','WorldTeam'],['pro','ProTeam'],['conti','Continental'],['all','Tutte']].map(([k,l])=>`<button class="fchip" data-act="rankf" data-v="${k}" aria-pressed="${f===k}">${FI[k]}${FI[k]?' ':''}${l}</button>`).join('')}</div></div>
 ${DT(TH([['#','n'],['Squadra'],['','c hm'],[ic('team',13),'r hs'],[ic2('trophy',13),'r'],[ic2('chart',13),'r']]),tr.map((o,i)=>{const w=o.t.riders.reduce((a,id)=>a+((RID(id)&&RID(id).wins)||0),0);
  return`<tr class="${o.t.id==='t0'?'me':''}"><td class="n">${i<3?medalOf(i+1):i+1}</td><td><span class="pc">${tJer(o.t,22)}<b>${esc(o.t.id==='t0'?G.name:o.t.name)}</b> ${flagSvg(o.t.nats?o.t.nats[0]:'ITA',14)}</span></td><td class="c hm">${tierChip(o.t)}</td><td class="r hs">${o.t.riders.length}</td><td class="r">${w||'<span class="tm">—</span>'}</td><td class="r"><b>${o.p}</b></td></tr>`}).join(''))}`;
};
/* ---------- classifica corridori: una riga, maglia della squadra ---------- */
const RK_IC={pts:'chart',wins:'trophy',u23:'svil',ovr:'cap',young:'svil',days:'calendar'};
riderRanking=function(){
 const k=G.rkSort||'pts',scope=G.rkScope||'all';
 let rs=Object.values(G.riders).filter(r=>G.teams.some(t=>t.id===r.team));
 if(scope==='cat')rs=rs.filter(r=>tierOfTeam(TEAM(r.team))===G.cat||(G.cat==='conti'&&TEAM(r.team).tier==='dev'));
 if(k==='u23'||k==='young')rs=rs.filter(r=>r.age<=22);
 const val=r=>k==='wins'?r.wins*1000+r.pts:k==='ovr'?ovr(r):k==='young'?projOvr(r):k==='days'?r.days:r.pts;
 rs.sort((a,b)=>val(b)-val(a)||ovr(b)-ovr(a));
 const show=r=>k==='wins'?`${r.wins}`:k==='ovr'?ovr(r):k==='young'?`${ovr(r)} <span class="tm">→</span> ${projOvr(r)}`:k==='days'?`${r.days}`:`${r.pts}`;
 const top=rs.slice(0,40),mine=rs.map((r,i)=>({r,i})).filter(o=>o.r.team==='t0'&&o.i>=40);
 const tr=(r,i)=>{const t=TEAM(r.team);return`<tr class="${r.team==='t0'?'me':''}" data-act="rider" data-v="${r.id}"><td class="n">${i<3?medalOf(i+1):i+1}</td><td>${personCell(r)}</td><td class="hs"><span class="pc">${tJer(t,16)}<span class="tm">${esc(t.short)}</span></span></td><td class="c hm">${archIc(r,13)}</td><td class="r"><b>${show(r)}</b></td></tr>`};
 return`<div class="toolbar"><div class="chips">${RK_SORT.map(([s,l])=>`<button class="fchip" data-act="rksort" data-v="${s}" aria-pressed="${k===s}">${ic2(RK_IC[s],13)} ${l}</button>`).join('')}</div>
  <div class="seg sm" style="max-width:260px">${[['all','Tutti'],['cat','Mia cat.']].map(([s,l])=>`<button data-act="rkscope" data-v="${s}" aria-pressed="${scope===s}">${l}</button>`).join('')}</div></div>
  ${DT(TH([['#','n'],['Corridore'],['Squadra','hs'],['','c hm'],[ic2(RK_IC[k],13),'r']]),top.map((r,i)=>tr(r,i)).join('')+(mine.length?`<tr><td colspan="5" class="tm" style="text-align:center">…</td></tr>${mine.map(o=>tr(o.r,o.i)).join('')}`:''))}`;
};
/* segmenti Squadre / Corridori con icone */
const _renderRankP=renderRank;
renderRank=function(){_renderRankP();document.querySelectorAll('#view .rkseg button').forEach(b=>{if(b.querySelector('svg'))return;b.insertAdjacentHTML('afterbegin',(b.dataset.v==='teams'?ic('team',14):ic2('bike',14))+' ')})};
/* ---------- coppe: maglie e motivi a icone ---------- */
const motIc=v=>{let m;v=String(v);if((m=v.match(/^(\d+) punti/)))return`${ic2('chart',12)} ${m[1]}`;if((m=v.match(/^(\d+) vittori/)))return`${ic2('trophy',12)} ${m[1]}`;return esc(v)};
awardsGrid=function(list){return DT(TH([['Coppa'],['Corridore'],['Squadra','hm'],['','r']]),list.map(a=>{const A=AWARDS.find(x=>x[0]===a.k),t=teamByName(a.team);return`<tr class="${a.me?'me':''}" data-act="rider" data-v="${a.id}"><td>${trophySvg(A[3],18)} <b>${A[1]}</b></td><td>${RID(a.id)?personCell(RID(a.id)):esc(a.name)}${a.me&&a.cash?` <span class="chip amber">+${eurk(a.cash)}</span>`:''}</td><td class="hm"><span class="pc">${tJer(t,16)}<span class="tm">${esc(t?t.short:a.team)}</span></span></td><td class="r tm nowrap">${motIc(a.v)}</td></tr>`}).join(''))};
teamAwardsGrid=function(list){return DT(TH([['Coppa'],['Squadra'],['','r']]),list.map(a=>{const T=TAWARDS.find(x=>x[0]===a.k),t=a.me?ME():teamByName(a.name);return`<tr class="${a.me?'me':''}"><td>${trophySvg(T[3],18)} <b>${T[1]}</b></td><td><span class="pc">${tJer(t,18)}<b>${esc(a.name)}</b></span>${a.me?` <span class="chip amber">+${eurk(a.cash||T[4])}</span>`:''}</td><td class="r tm nowrap">${motIc(a.v)}</td></tr>`}).join(''))};
/* maglie accanto ai nomi di squadra nelle tabelle dei risultati */
function jerseyTeams(root){if(!root)return;root.querySelectorAll('table.t td').forEach(td=>{if(td.querySelector('svg,.pc,button,select,input')||td.children.length>1)return;const n=td.textContent.trim();if(!n||n.length<4)return;const t=teamByName(n)||(n===G.name?ME():null);if(t)td.innerHTML=`<span class="pc">${tJer(t,18)}<b>${esc(n)}</b></span>`})}
const _raceSheetJ=raceSheet;raceSheet=function(id){const o=_raceSheetJ(id);jerseyTeams($('#sheet'));return o};
const _showFinalJ=showFinal;showFinal=function(RC){const o=_showFinalJ(RC);jerseyTeams($('#sheet'));return o};
/* ============================================================
   POSTA: da fare, filtri per categoria, azioni nel messaggio
   ============================================================ */
const MCAT={gare:['Gare','flag',['DS','Organizzatori']],soldi:['Sponsor','euro',['Sponsor','Amministrazione']],merc:['Mercato','go',['Mercato']],squadra:['Squadra','bike',['Medico','Preparatore','Scuola']],naz:['Nazionale','trophy',['Federazione']]};
const mcatOf=f=>Object.keys(MCAT).find(k=>MCAT[k][2].includes(f))||'gare';
const _addNewsP=addNews;addNews=function(t){_addNewsP(t);if(G.news[0])G.news[0].w=G.week};
function mailLinks(m){
 const txt=m.title+' '+m.body,out=[],seen=new Set();
 const mineFirst=Object.values(G.riders).filter(r=>r.name.length>5&&txt.includes(r.name)).sort((a,b)=>(a.team==='t0'?0:1)-(b.team==='t0'?0:1)).slice(0,2);
 for(const r of mineFirst)out.push(`<button class="btn sm" data-act="rider" data-v="${r.id}">${avatar(r,18)} ${esc(r.name.split(' ').slice(-1)[0])}</button>`);
 const race=G.races.filter(r=>txt.includes(r.name)).sort((a,b)=>b.name.length-a.name.length)[0];
 if(race)out.push(`<button class="btn sm" data-act="race" data-v="${race.id}">${flagSvg(race.ctry,14)} ${race.status==='done'?'Risultati':'La corsa'}</button>`);
 const go={Mercato:['market:bids',ic('market',14),'Mercato'],Sponsor:['spon',ic('spon',14),'Sponsor'],Amministrazione:['bil',ic2('euro',14),'Bilancio'],Federazione:['callups',ic2('trophy',14),'Convocazioni'],Preparatore:['train',ic2('bike',14),'Allenamento'],Scuola:['base',ic('base',14),'Scuola'],Organizzatori:['cal',ic('cal',14),'Calendario']}[m.from];
 if(go&&!seen.has(go[0]))out.push(`<button class="btn sm" data-act="mgo" data-v="${go[0]}">${go[1]} ${go[2]}</button>`);
 return out.join('');
}
function todoList(){
 const T=[],bids=(G.bids||[]).filter(b=>RID(b.rid)&&RID(b.rid).team==='t0'),ex=ME().riders.map(RID).filter(r=>r.cEnd===SEASON&&!r.renewed&&!r.leavingTo);
 if(typeof pkgPending==='function'&&pkgPending())T.push([ic2('calendar',15),'Scegli il pacchetto di corse','tab','home']);
 for(const r of myPending())T.push([flagSvg(r.ctry,15),`Convoca: ${esc(r.name)}`,r.tier==='track'||r.tier==='naz'||r.tier==='jun'?'tab':'convoca',r.tier==='track'||r.tier==='naz'||r.tier==='jun'?'home':r.id]);
 if(G.offers.length)T.push([ic('spon',15),`${G.offers.length} propost${G.offers.length>1?'e':'a'} sponsor`,'mgo','spon']);
 if(bids.length)T.push([ic('market',15),`${bids.length} offert${bids.length>1?'e':'a'} per i tuoi corridori`,'mgo','market:bids']);
 if(pendingCallups().length)T.push([ic2('trophy',15),`${pendingCallups().length} convocazion${pendingCallups().length>1?'i':'e'} in nazionale`,'callups','']);
 if(ex.length&&G.phase==='season'&&G.week>=30||ex.length&&G.phase!=='season')T.push([ic2('contract',15),`${ex.length} contratt${ex.length>1?'i':'o'} in scadenza`,'mgo','market:renew']);
 return T;
}
/* i fatti su cui agire tornano messaggi; il resto resta notizia ma con mittente e testo */
MAIL_KEEP.push(['Mercato',/Offerta per|deluso|capitano|ci lascia/],['Medico',/infortunato/],['Federazione',/convocazione per|Convocazione scaduta/],['Sponsor',/obiettivo raggiunto|rimborso/],['Amministrazione',/Bonus/]);
mail=function(from,title,body){if(MAIL_KEEP.some(([f,re])=>f===from&&re.test(title)))return _mailC(from,title,body);G.news.unshift({id:'n'+(G.nextId++),s:SEASON,w:G.week,t:title,from,body});G.news=G.news.slice(0,60)};
const newsFrom=t=>/infortun/i.test(t)?'Medico':/Offerta|arriva|Firmato|Ingaggiat|rinnova|svincolat|passa a|cessione/i.test(t)?'Mercato':/sponsor|Accordo|Proposta/i.test(t)?'Sponsor':/livello|Ritiro/i.test(t)?'Preparatore':/Pacchetto|Traguardo|Vittoria/i.test(t)?'DS':/nazional|Mondial|Europe/i.test(t)?'Federazione':'DS';
function mailItems(view){
 const M=G.inbox.map(m=>Object.assign({},m,{ref:m}));
 if(view!=='all')return M;
 const N=G.news.filter(n=>n.s===SEASON).map((n,i)=>({id:n.id||'nx'+i,w:n.w||0,s:n.s,from:n.from||newsFrom(n.t),title:n.t,body:n.body||'',read:true,news:true}));
 return M.concat(N).sort((a,b)=>(b.s-a.s)||(b.w-a.w));
}
renderMail=function(){
 const view=G.mailView==='all'?'all':'mail',f=G.mailCat||'all';
 const all=mailItems(view),M=all.filter(m=>f==='all'||mcatOf(m.from)===f),sel=all.find(m=>m.id===G.mailSel)||M[0];
 if(sel&&sel.ref&&!sel.ref.read){sel.ref.read=true;save();setTimeout(()=>{const b=$('#tabs [data-v="mail"] .badge');const n=G.inbox.filter(m=>!m.read).length;if(b){if(n)b.textContent=n;else b.remove()}},0)}
 const unread=G.inbox.filter(m=>!m.read).length;
 const seg=`<div class="toolbar"><div class="seg sm">${[['mail',ic('mail',14),'Messaggi',unread],['all',ic2('radio',14),'Tutto',0]].map(([k,i,l,n])=>`<button data-act="mview" data-v="${k}" aria-pressed="${view===k}">${i} ${l}${n?` <b class="badge2">${n}</b>`:''}</button>`).join('')}</div>
  <div class="chips">${[['all','Tutte','mail']].concat(Object.keys(MCAT).map(k=>[k,MCAT[k][0],MCAT[k][1]])).map(([k,l,i])=>{const n=k==='all'?0:G.inbox.filter(m=>!m.read&&mcatOf(m.from)===k).length;return`<button class="fchip" data-act="mcat" data-v="${k}" aria-pressed="${f===k}" title="${l}">${i==='mail'?ic('mail',13):ic2(i,13)}${k==='all'||f===k?' '+l:''}${n?` <b class="badge2">${n}</b>`:''}</button>`}).join('')}</div>${unread?`<button class="chip" data-act="mallread" title="Segna tutte come lette">${ic('check',12)} Lette</button>`:''}</div>`;
 const T=todoList();
 const todo=T.length?`<div class="sec-h"><h3>${ic2('warn',15)} Da fare</h3></div>${DT('',T.map(([i,t,a,v])=>`<tr data-act="${a}" data-v="${v}"><td><span class="pc">${i}<b>${t}</b></span></td><td class="r tm">›</td></tr>`).join(''),'todo')}`:'';
 let lastW=null;
 const rows=M.map(m=>{const head=m.w!==lastW?`<tr class="wkr"><td colspan="3">${m.w===G.week&&m.s===SEASON?'Questa settimana':m.w?`Settimana ${m.w}`:'Prima'}</td></tr>`:'';lastW=m.w;
  return head+`<tr data-act="mailsel" data-v="${m.id}" class="${sel&&m.id===sel.id?'sel':''} ${m.read?'':'unr'} ${m.news?'nws':''}"><td style="width:22px"><span class="mci c_${mcatOf(m.from)}" title="${esc(m.from)}">${fromIc(m.from)}</span></td><td class="mt1">${m.read?'':'<span class="udot"></span> '}${esc(m.title)}</td><td class="r tm hs">${m.news?ic2('radio',11):esc(m.from)}</td></tr>`}).join('');
 const left=todo+(M.length?`<div class="sec-h" style="margin-top:${T.length?10:0}px"><h3>${view==='all'?ic2('radio',15)+' Tutto':ic('mail',15)+' Messaggi'}</h3><span class="eyebrow">${M.length}</span></div>${DT('',rows,'mailt2')}`:`<div class="note">${ic('mail',13)} Nessun messaggio${view==='mail'?': le notizie minori sono in «Tutto».':'.'}</div>`);
 const right=sel?`<div class="card pad mailread"><div class="mrh"><span class="mci c_${mcatOf(sel.from)}">${fromIc(sel.from)}</span><b>${esc(sel.from)}</b><span class="tm">S${sel.w||'—'}${sel.s!==SEASON?' · '+sel.s:''}${sel.news?' · notizia':''}</span><span style="flex:1"></span>${sel.news?'':`<button class="btn ghost sm" data-act="maildel" data-v="${sel.id}" title="Elimina">✕</button>`}</div><h2>${esc(sel.title)}</h2>${sel.body?`<div class="mailbody">${esc(sel.body).replace(/\n/g,'<br>')}</div>`:''}${(()=>{const l=mailLinks(sel);return l?`<div class="mlinks">${l}</div>`:''})()}</div>`:'';
 $('#view').innerHTML=seg+`<div class="mailgrid"><div class="col">${left}</div><div class="col">${right}</div></div>`;
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(!t||!G)return;const a=t.dataset.act,v=t.dataset.v;
 if(a==='mview'){G.mailView=v;renderMail()}
 else if(a==='mcat'){G.mailCat=v;G.mailSel=null;renderMail()}
 else if(a==='mallread'){G.inbox.forEach(m=>m.read=true);save();render()}
 else if(a==='maildel'){G.inbox=G.inbox.filter(m=>m.id!==v);G.mailSel=null;save();render()}
 else if(a==='mgo'){const[tab,sub]=v.split(':');if(tab==='spon'||tab==='bil'){G.finTab=tab==='bil'?'bil':'spon';G.tab='spon'}else if(tab==='market'){G.tab='market';if(sub&&G.mk)G.mk.sub=sub}else G.tab=tab;save();closeSheet();render()}
});
/* ============================================================
   PISTA: icone per specialità, convocazione e risultati
   ============================================================ */
IC2.elim='<circle cx="12" cy="12" r="9"/><path d="M8 8l8 8M16 8l-8 8"/>';
const DISC_IC={ip:()=>ic2('crono',14),tp:()=>ic('team',14),pr:()=>ic2('chart',14),sc:()=>ic2('velocista',14),el:()=>ic2('elim',14)};
const dIc=(k,s)=>DISC_IC[k]?DISC_IC[k]().replace(/width="14" height="14"/,`width="${s||14}" height="${s||14}"`):'';
renderTrackConv=function(){
 const race=TSEL.race,rs=ME().riders.map(RID).filter(r=>!whyCant(r,race));
 const ok=race.disc.every(k=>k!=='tp'||TSEL.sel[k].length===0||TSEL.sel[k].length===4)&&race.disc.some(k=>TSEL.sel[k].length);
 openSheet(sheetHead(`${ic2('pista',12)} Pista · ${weekLab(race.w)}`,`${flagSvg(race.ctry,18)} ${esc(race.name)}`,race.flag==='ita'?`${flagSvg('ITA',12)} Solo corridori italiani`:'')+
 `<div class="pb wrap">${DT(`<tr class="th"><td>Corridore</td>${race.disc.map(k=>{const n=TSEL.sel[k].length,need=k==='tp'?4:DISC[k].max,bad=k==='tp'&&n&&n!==4;return`<td class="c" title="${esc(DISC[k].lab+': '+DISC[k].d)}"><span class="dh">${dIc(k,15)}<small>${TK_SHORT[k]}</small><b class="${bad?'neg':n?'pos':''}">${n}/${need}</b></span></td>`}).join('')}</tr>`,
  rs.slice().sort((a,b)=>Math.max(...race.disc.map(k=>trackScore(b,k)))-Math.max(...race.disc.map(k=>trackScore(a,k)))).map(r=>`<tr><td>${personCell(r)}</td>${race.disc.map(k=>{const on=TSEL.sel[k].includes(r.id),sc=trackScore(r,k),best=Math.max(...rs.map(x=>trackScore(x,k)));return`<td class="c"><button class="tkc ${sc>=best-3?'best':''}" data-act="tksel" data-k="${k}" data-v="${r.id}" aria-pressed="${on}">${on?'✓ ':''}${sc}</button></td>`}).join('')}</tr>`).join(''),'trk')}</div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close" title="Chiudi">✕</button><button class="btn ghost" data-act="tkskip">${ic2('elim',15)} Non partecipo</button><span style="flex:1"></span><button class="btn primary" data-act="tkgo" ${ok?'':'disabled'}>${ic2('pista',16)} Corri</button></div></div>`,'wide');
};
trackResultSheet=function(race){
 const R=race.result,idx={};for(const r of Object.values(G.riders))idx[r.name]=r;
 const mine=(R.mine||[]).slice().sort((a,b)=>a.pos-b.pos).slice(0,6).map(m=>{const r=idx[m.name];return`<span class="mres">${dIc(m.k,13)} ${r?avatar(r,18):''}<b>${esc(m.name.split(' ').slice(-1)[0])}</b> ${medalOf(m.pos)}</span>`}).join('');
 openSheet(sheetHead(`${ic2('pista',12)} Pista · risultati`,`${flagSvg(race.ctry,18)} ${esc(race.name)}`,'')+
 `<div class="pb wrap">${mine||R.prize?`<div class="myres">${mine}${R.prize?`<span class="chip amber">${ic2('euro',11)} ${eurk(R.prize)}</span>`:''}</div>`:''}<div class="trackgrid">${Object.entries(R.disc).map(([k,l])=>`<div><div class="sec-h"><h3>${dIc(k,16)} ${DISC[k].lab}</h3></div>${DT('',l.map((x,i)=>{const rr=k!=='tp'&&idx[x.name],t=teamByName(x.team)||(x.me?ME():null);
  return`<tr class="${x.me?'me':''}"><td class="n">${i<3?medalOf(i+1):i+1}</td><td>${rr?personCell(rr):`<span class="pc">${tJer(t||teamByName(x.name),18)}<b>${esc(x.name)}</b></span>`}</td><td class="hs">${rr&&t?`<span class="pc">${tJer(t,14)}<span class="tm">${esc(t.short)}</span></span>`:''}</td><td class="r">${fmtTrack(k,x.v)||(x.p!=null?x.p+' pt':'')}</td></tr>`}).join(''),'tkres')}</div>`).join('')}</div></div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Continua</button></div></div>`,'wide');
};
const _raceSheetT=raceSheet;
raceSheet=function(id){const o=_raceSheetT(id);const r=G.races.find(x=>x.id===id);if(r&&r.tier==='track'&&!(r.status==='done'&&r.result&&r.result.track)){const pb=$('#sheet .stages');if(pb)pb.innerHTML=`<div class="sec-h"><h3>${ic2('pista',15)} Specialità</h3></div>`+DT('',r.disc.map(k=>`<tr title="${esc(DISC[k].d)}"><td><span class="pc"><span class="stic on">${dIc(k,14)}</span><b>${DISC[k].lab}</b><span class="tm sub">${esc(DISC[k].d.split(':')[0])}</span></span></td></tr>`).join(''))}return o};
