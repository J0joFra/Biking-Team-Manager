"use strict";
/* ============================================================
   RIFINITURA 2: stesso stile ovunque
   - icona automatica su ogni pulsante in base all'azione
   - icone sulle etichette dei riquadri numerici e delle sezioni
   - note lunghe accorciate in icona + poche parole
   - Prospetti, Ritiri, Convocazioni e Bilancio in tabella con icone
   ============================================================ */
const icx=(n,s)=>ICON[n]?ic(n,s):ic2(n,s);
/* ---------- pulsanti ---------- */
const BTN_IC={adv1:'go',advnext:'finish',bidno:'elim',bidyes:'check',campbook:'alt',campok:'alt',convoca:'team',cuno:'elim',cuyes:'check',end:'ffwd',forfeit:'elim',foundother:'team',jrrelease:'elim',mdel:'elim',mdelok:'elim',mnewok:'go',negcfee:'check',negcsal:'check',negoffer:'contract',neg:'contract',nextseason:'go',nextstage:'go',offno:'elim',offyes:'check',pkok:'check',promoteok:'contract',promote:'svil',racedone:'chart',register:'contract',releaseok:'elim',release:'elim',reset:'warn',sellok:'market',sell:'market',simrest:'ffwd',sppropose:'spon',start:'go',suggest:'cap',tt:'crono',unsell:'elim',withdraw:'warn',facb:'base',acadup:'base',side:'team',mback:'go',strole:'search',jump:'finish'};
const BTN_BY_LABEL=[[/^Simula/,'ffwd'],[/^In corsa|^Segui dal vivo/,'bike'],[/^Salta/,'ffwd'],[/^Continua/,'go'],[/^Ho capito|^Ok$/,'check'],[/^Calendario/,'cal'],[/^Sponsor/,'spon'],[/^Via/,'go'],[/^Rinnova/,'contract']];
function iconButtons(root){
 root.querySelectorAll('button.btn:not([data-ic])').forEach(b=>{b.dataset.ic='1';if(b.querySelector('svg,img,.av'))return;const t=b.textContent.trim();if(!t||t.length<2||/^[✕×✓+−\-?❚]/.test(t))return;
  const a=b.dataset.act;let k=null;
  if(a==='go'||a==='jrgo'||a==='natgo'||a==='close'||a==='tab'){const m=BTN_BY_LABEL.find(([re])=>re.test(t));k=m?m[1]:null}else k=BTN_IC[a];
  if(k)b.insertAdjacentHTML('afterbegin',icx(k,15)+' ')});
}
/* ---------- etichette dei riquadri e titoli di sezione ---------- */
const LAB_IC={'Valore':'cap','Soglia':'speed','W/kg':'speed','Peso':'grade','Volata':'velocista','Potenziale':'svil','Cassa':'euro','Saldo a fine stagione':'euro','Monte ingaggi':'contract','Punti':'chart','Vittorie':'trophy','Vittorie del club':'trophy','Premi':'euro','Reputazione':'cap','Reputazione richiesta':'cap','La tua':'cap','Distanza':'go','Indennizzo':'euro','Ingaggio':'contract','Età':'calendar','Classifica':'chart','Stagioni':'calendar','Traguardi':'flag','Miglior stagione':'trophy','Contratto':'contract','Ruolo promesso':'cap','Ingaggio annuo':'contract','Durata':'calendar','Partenza':'calendar','Clausola di rimborso':'warn','Ruolo nella squadra':'spon','Programma individuale (seduta del giovedì)':'bike','Condizione':'battery','Fatica · giorni':'drop','Velodromo · specialità':'pista','Osservatori':'flag','Obiettivo':'flag','Bonus':'euro','Rosa':'team'};
function iconLabels(root){
 root.querySelectorAll('.kv small:not([data-ic]), .eyebrow:not([data-ic]), .sec-h h3:not([data-ic]), .sec-h h2:not([data-ic])').forEach(e=>{e.dataset.ic='1';if(e.querySelector('svg'))return;const t=e.textContent.trim().replace(/\s+\d{4}$/,'');const k=LAB_IC[t]||(/^Rosa \d{4}$/.test(e.textContent.trim())?'team':null);if(k)e.insertAdjacentHTML('afterbegin',icx(k,e.tagName==='SMALL'?11:13)+' ')});
}
/* ---------- note lunghe → icona + poche parole ---------- */
const NOTE_SHORT=[
 [/^Corsa a tappe: si corre solo come squadra \(almeno (\d+) corridori\).*/,m=>`${ic('team',13)} Solo squadra · almeno ${m[1]}`],
 [/^Riunione su pista: dopo l'iscrizione.*/,()=>`${ic2('pista',13)} Convocazioni per specialità dopo l'iscrizione`],
 [/^Iscritto\. Quota pagata: (€\s?[\d.]+)\..*/,m=>`${ic('check',13)} Iscritto · ${m[1]}`],
 [/^Tocca un pacchetto per vedere le corse\. Budget della dirigenza: (€[\w,.]+)\.?/,m=>`${ic2('euro',13)} Budget ${m[1]}`],
 [/^C = capitano:.*/,()=>null],
 [/^Il ruolo pesa poco sulle sue richieste.*/,()=>`${ic2('warn',13)} Promessa non mantenuta → corridore scontento`],
 [/^Tocca il valore per far correre.*/,()=>null],
 [/^Valgono per tutti tranne infortunati.*/,()=>null],
 [/^Scrivi la cifra.*Totale sul contratto:\s*(€\s?[\d.]+) in (\d+) ann.*/,m=>`${ic2('contract',13)} Totale <b>${m[1]}</b> · ${m[2]} anni`],
 [/^Il procuratore chiede circa (€\s?[\d.]+)(?:.*?\((\d) anni\))?(?:.*?Minimo [^:]+: (€\s?[\d.]+))?.*/,m=>`${ic2('euro',13)} Chiede ~${m[1]}${m[2]?` · preferisce ${m[2]} anni`:''}${m[3]?` · <span class="neg">min ${m[3]}</span>`:''}`]
];
function shortNotes(root){
 root.querySelectorAll('.note:not([data-ns])').forEach(n=>{n.dataset.ns='1';const t=n.textContent.trim();for(const[re,f]of NOTE_SHORT){const m=t.match(re);if(m){const h=f(m);if(h===null)n.remove();else n.innerHTML=h;break}}});
}
/* ---------- voci del bilancio ---------- */
const VOCE_IC=[[/^Sponsor/,'spon'],[/^Stipendi/,'contract'],[/^Staff tecnico/,'staff'],[/^Staff e struttura/,'base'],[/^Scuola/,'svil'],[/^Centro sportivo/,'base'],[/^Risultato/,'chart'],[/^Premi/,'trophy'],[/^Squadra femminile|^Squadra maschile|^Femminile|^Maschile/,'team'],[/^Iscrizioni|^Trasferte/,'calendar'],[/^Ritiri/,'alt'],[/^Mercato|^Cessioni|^Acquisti/,'market'],[/^Bonus/,'euro']];
function voceIcons(root){
 root.querySelectorAll('table.t tr:not([data-vi]) > td:first-child').forEach(td=>{const tr=td.parentElement;tr.dataset.vi='1';if(td.querySelector('svg,.av,input,button')||td.children.length>1)return;const t=td.textContent.trim();if(t.length>40)return;const m=VOCE_IC.find(([re])=>re.test(t));if(m&&G&&G.tab==='spon')td.innerHTML=`<span class="pc"><span class="tm">${icx(m[1],14)}</span>${td.innerHTML}</span>`});
}
/* ---------- osservatore unico ---------- */
{let pend=false;const run=()=>{pend=false;if(!G)return;for(const id of ['view','sheet','race']){const r=document.getElementById(id);if(r){iconButtons(r);iconLabels(r);shortNotes(r);voceIcons(r)}}};
 new MutationObserver(()=>{if(!pend){pend=true;requestAnimationFrame(run)}}).observe(document.body,{childList:true,subtree:true});run()}

/* ---------- Convocazioni: ruolo e tipo a icone ---------- */
const _renderConvocaP2=renderConvoca;
renderConvoca=function(){
 _renderConvocaP2();
 const s=$('#sheet');if(!s)return;
 s.querySelectorAll('tr input[data-act="pick"]').forEach(inp=>{const r=RID(inp.dataset.v),tr=inp.closest('tr');if(!r||!tr)return;
  const sub=tr.querySelector('label .tm');const ch=tr.querySelector('label .chip');if(ch){ch.outerHTML=`${roleIc(r,14)}${(r.role==='cap'||r.role==='luog')&&r.spec&&typeof GSPEC_IC!=='undefined'&&GSPEC_IC[r.spec]?`<span class="tm" title="${esc(SPEC[r.spec])}">${ic2(GSPEC_IC[r.spec],12)}</span>`:''}`}
  if(sub){sub.innerHTML=sub.innerHTML.replace(new RegExp('(</span>)\\s*'+esc(ARCH[r.arch].lab)),'$1').replace(/^(\s*<span class="aic"[\s\S]*?<\/span>)\s*·?\s*/,'$1 ').replace(/altura \+([\d.]+)%/,`${ic2('alt',11)}+$1%`)}});
 const H={'Forma':ic2('battery',12),'Fatica':ic2('drop',12),'Gg':ic2('calendar',12),'Adatto':ic2('chart',12),'Cap.':ic2('cap',12)};
 s.querySelectorAll('tr.th td').forEach(td=>{const k=td.textContent.trim();if(H[k]){td.title=k;td.innerHTML=H[k]}});
};
/* ---------- Squadra › Prospetti in tabella ---------- */
const _renderTeamP2=renderTeam;
renderTeam=function(){
 _renderTeamP2();
 if(G.teamView!=='futuro')return;const g=$('#view .futgrid');if(!g)return;
 const rs=ME().riders.map(RID),js=acadJuniors().sort((a,b)=>projOvr(b)-projOvr(a)),inc=incoming();
 const leaving=rs.filter(r=>r.leavingTo||(r.cEnd===SEASON&&!r.renewed)),toElite=rs.filter(r=>r.age===22);
 const young=rs.filter(r=>r.age<=24).sort((a,b)=>projOvr(b)-projOvr(a));
 const stars=r=>`<span class="stars">${'★'.repeat(1+Math.round((r.pot||0)*4))}</span>`;
 const tal=young.length?DT(TH([['Corridore'],['','r'],['','c hs'],[ic2('cap',12),'r'],[ic2('svil',12)+' 27','r'],[ic2('calendar',12),'r hs']]),young.map(r=>`<tr data-act="rider" data-v="${r.id}"><td>${personCell(r)} ${archIc(r,13)}</td><td class="r tm">${r.age}</td><td class="c hs">${stars(r)}</td><td class="r">${ovr(r)}</td><td class="r"><b class="pos">${projOvr(r)}</b></td><td class="r hs ${r.cEnd<=SEASON+1&&!r.renewed?'neg':'tm'}">${r.cEnd}</td></tr>`).join('')):`<div class="note">${ic2('svil',13)} Nessun giovane in rosa.</div>`;
 const jr=js.length?DT('',js.map(r=>`<tr data-act="rider" data-v="${r.id}"><td>${personCell(r)} ${archIc(r,13)}</td><td class="r tm">${r.age}</td><td class="c">${stars(r)}</td><td class="r nowrap">${ovr(r)} <span class="tm">→</span> <b class="pos">${projOvr(r)}</b></td></tr>`).join('')):'';
 const rows=[].concat(
  leaving.map(r=>`<tr data-act="rider" data-v="${r.id}"><td><span class="stic neg" title="In uscita">${ic2('elim',13)}</span></td><td>${personCell(r)}</td><td class="r tm nowrap">${r.leavingTo?`<span class="pc">${tJer(TEAM(r.leavingTo),14)}${esc(TEAM(r.leavingTo).short)}</span>`:`${ic2('contract',12)} scade`}</td></tr>`),
  inc.map(r=>`<tr data-act="rider" data-v="${r.id}"><td><span class="stic on" title="In arrivo">${ic2('go',13)}</span></td><td>${personCell(r)} ${archIc(r,13)}</td><td class="r tm">${r.age+1}</td></tr>`),
  toElite.map(r=>`<tr data-act="rider" data-v="${r.id}"><td><span class="stic" title="Passa Elite: niente più gare Under 23">${ic2('svil',13)}</span></td><td>${personCell(r)}</td><td class="r tm">Elite</td></tr>`)).join('');
 g.innerHTML=`<div class="col"><div class="sec-h"><h3>${ic2('svil',15)} Talenti</h3><span class="eyebrow">oggi → a 27 anni</span></div>${tal}${jr?`<div class="sec-h" style="margin-top:10px"><h3>${ic('base',15)} Scuola juniores</h3><span class="eyebrow">${js.length}</span></div>${jr}`:''}</div>
 <div class="col"><div class="sec-h"><h3>${ic2('calendar',15)} Stagione ${SEASON+1}</h3><span class="chip">${ic('team',12)} ${nextRoster()}/${myCat().max}</span></div>${rows?DT('',rows):`<div class="note">${ic('check',13)} Nessun cambiamento previsto.</div>`}</div>`;
};
/* ---------- Allenamento › Ritiri in altura: una riga, niente tagli ---------- */
renderTrain=function(){
 const camps=G.camps.slice().sort((a,b)=>b.from-a.from);
 const avail=DT(TH([['Località'],[ic2('alt',12),'r'],[ic2('euro',12),'r'],['']]),CAMPS.map(L=>{const ok=G.phase==='season'&&G.week+1<=L.to;
  return`<tr class="${ok?'':'off'}" title="${esc(L.place)} · ${weekLab(L.from)}–${weekLab(Math.min(L.to,52))}"><td><b>${esc(L.name)}</b></td><td class="r nowrap">${L.alt} m</td><td class="r">${eurk(L.cost)}</td><td class="r"><button class="btn sm ${ok?'primary':''}" data-act="campbook" data-v="${L.id}" ${ok?'':'disabled'} title="Prenota">${ic2('alt',14)}</button></td></tr>`}).join(''));
 const mine=camps.length?DT(TH([['Ritiro'],[ic('team',12),'r'],[ic2('calendar',12)],['','r']]),camps.map(c=>{const L=CAMPS.find(x=>x.id===c.loc);return`<tr><td><b>${esc(L.name)}</b></td><td class="r">${c.riders.length}</td><td class="tm nowrap">${weekLab(c.from)}–${weekLab(c.to)}</td><td class="r">${c.done?`<span class="tm">${ic('check',13)}</span>`:c.from<=G.week?`<span class="chip u23">${ic2('alt',11)} in corso</span>`:`<button class="btn ghost sm" data-act="campcancel" data-v="${c.id}" title="Annulla">${ic2('elim',14)}</button>`}</td></tr>`}).join('')):'';
 $('#view').innerHTML=`<div class="basegrid"><div class="col">${trainCard()}</div><div class="col"><div class="sec-h"><h3>${ic2('alt',16)} Ritiri in altura</h3><span class="eyebrow">picco 1–3 sett. dopo</span></div>${avail}${mine?`<div class="sec-h" style="margin-top:10px"><h3>${ic2('alt',15)} I tuoi ritiri</h3></div>${mine}`:''}</div></div>`;
};
/* ---------- menu iniziale ---------- */
IC2.gear='<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>';
const MENU_IC=[[/Nuova partita/i,'go'],[/Continua/i,'bike'],[/Come si gioca/i,'info'],[/Impostazioni/i,'gear'],[/Cancella/i,'elim']];
new MutationObserver(()=>{document.querySelectorAll('.menu button:not([data-ic]), .mbtn:not([data-ic])').forEach(b=>{b.dataset.ic='1';const h=b.querySelector('b,strong,h3,span')||b;const m=MENU_IC.find(([re])=>re.test(b.textContent));if(m&&!b.querySelector('svg'))h.insertAdjacentHTML('afterbegin',icx(m[1],18)+' ')})}).observe(document.body,{childList:true,subtree:true});
/* Palmarès: la sottoriga "21 anni · 0 V nel 2027" ripete le colonne */
const _renderPalmP2=renderPalm;renderPalm=function(){_renderPalmP2();setTimeout(()=>document.querySelectorAll('#view .tm').forEach(x=>{if(/^\d+ anni · \d+ V nel \d{4}$/.test(x.textContent.trim()))x.remove()}),0)};
if(G)render();
/* ============================================================
   PALMARÈS della squadra: tutto in tabella, niente elenchi
   ============================================================ */
const riderByName=n=>{for(const r of Object.values(G.riders))if(r.name===n)return r;return null};
const rCell=(n,s)=>{const r=riderByName(n);return r?`<span data-act="palmr" data-v="${r.id}">${personCell(r)}</span>`:`<b>${esc(n)}</b>`};
const shortSur=n=>esc(String(n).split(' ').slice(-1)[0]);
const BIG_T=['gt','mon','uwt1','uwt2','pro'];
renderPalm=function(){
 const P=teamPalm(),hist=G.history.slice(),A=(G.awards||[]).slice().reverse();
 const cur={season:SEASON,cat:G.cat,rank:myCatRank(),pts:teamPoints(ME()),wins:P.w.filter(w=>w.s===SEASON).length,cur:G.phase==='season'};
 const all=hist.concat(G.phase==='season'||!hist.some(h=>h.season===SEASON)?[cur]:[]).slice().reverse();
 const riders={};for(const w of P.w)riders[w.r]=(riders[w.r]||0)+1;
 const top=Object.entries(riders).sort((a,b)=>b[1]-a[1]).slice(0,8);
 const cups=A.reduce((n,s)=>n+(s.list||[]).filter(a=>a.me).length+(s.teams||[]).filter(a=>a.me).length,0);
 const stat=`<div class="toolbar"><div class="mkstat"><span class="kc" title="Vittorie">${ic2('trophy',14)}<b>${P.w.length}</b></span><span class="kc" title="Podi">${ic2('cap',14)}<b>${P.pod}</b></span><span class="kc" title="Stagioni">${ic2('calendar',14)}<b>${all.length}</b></span><span class="kc" title="Medaglie in nazionale">${ic2('flag',14)}<b>${P.nat.length}</b></span><span class="kc" title="Coppe di fine stagione">${trophySvg('#D4A017',14)}<b>${cups}</b></span></div></div>`;
 const seasons=DT(TH([[ic2('calendar',12)],['Categoria'],[ic2('chart',12),'r'],[ic2('trophy',12),'r'],['Punti','r']]),all.map(h=>`<tr class="${h.cur?'me':''}"><td class="n">${h.season}</td><td><span class="chip">${CAT[h.cat].lab}</span>${h.cur?` <span class="tm">${ic2('clockw',11)}</span>`:''}</td><td class="r">${h.rank<=3?medalOf(h.rank):h.rank+'ª'}</td><td class="r">${h.wins||'<span class="tm">—</span>'}</td><td class="r">${h.pts??'—'}</td></tr>`).join(''));
 const rosa=ME().riders.map(RID).map(r=>({r,p:palmOf(r)})).sort((a,b)=>b.p.w.length-a.p.w.length||b.p.pod-a.p.pod||b.p.t10-a.p.t10||(a.p.best?a.p.best.p:999)-(b.p.best?b.p.best.p:999));
 const rosaT=DT(TH([['Corridore'],[ic2('trophy',12),'r'],[ic2('cap',12),'r'],['10','r hs'],['Migliore','c hm']]),rosa.map(({r,p})=>`<tr data-act="palmr" data-v="${r.id}"><td>${personCell(r)}</td><td class="r">${p.w.length||'<span class="tm">—</span>'}</td><td class="r">${p.pod||'<span class="tm">—</span>'}</td><td class="r hs">${p.t10||'<span class="tm">—</span>'}</td><td class="c hm" title="${p.best?esc(p.best.n)+' ('+p.best.s+')':''}">${p.best?(p.best.p<=3?medalOf(p.best.p):`<b>${p.best.p}°</b>`):'<span class="tm">—</span>'}</td></tr>`).join(''),'palmt');
 let lastS=null;
 const wins=P.w.slice().sort((a,b)=>b.s-a.s||TIER_W[b.t]-TIER_W[a.t]).map(w=>{const h=w.s!==lastS?`<tr class="wkr"><td colspan="3">${w.s} · ${P.w.filter(x=>x.s===w.s).length} ${ic2('trophy',11)}</td></tr>`:'';lastS=w.s;
  return h+`<tr><td class="bestc"><span class="pc">${BIG_T.includes(w.t)?`<span class="wy pos">${ic2('trophy',13)}</span>`:''}<span class="chip cls">${esc(w.c)}</span><b>${esc(w.n)}</b></span></td><td class="nowrap">${(()=>{const r=riderByName(w.r);return`<span class="pc" title="${esc(w.r)}" ${r?`data-act="palmr" data-v="${r.id}"`:''}>${r?avatar(r,18):''}<span>${shortSur(w.r)}</span></span>`})()}</td></tr>`}).join('');
 const winsT=P.w.length?DT('',wins,'palmt'):`<div class="note">${ic2('trophy',13)} Ancora nessuna vittoria.</div>`;
 const topT=top.length?DT('',top.map(([n,c],i)=>`<tr><td class="n">${i<3?medalOf(i+1):i+1}</td><td>${rCell(n)}</td><td class="r"><b>${c}</b> ${ic2('trophy',12)}</td></tr>`).join('')):'';
 const natT=P.nat.length?DT('',P.nat.slice().reverse().map(m=>`<tr><td>${medalOf(m.p)}</td><td>${rCell(m.r)}</td><td class="tm bestc">${esc(m.n)}</td><td class="r tm">${m.s}</td></tr>`).join('')):'';
 const albo=A.length?A.map(s=>`<div class="eyebrow" style="margin:6px 0 4px">${trophySvg('#D4A017',12)} ${s.s}</div>${s.teams&&s.teams.length?teamAwardsGrid(s.teams):''}${awardsGrid(s.list)}`).join(''):'';
 $('#view').innerHTML=stat+`<div class="futgrid"><div class="col">
  <div class="sec-h"><h3>${ic2('calendar',15)} Stagioni</h3></div>${seasons}
  <div class="sec-h" style="margin-top:10px"><h3>${ic('team',15)} La rosa</h3><span class="eyebrow">carriera</span></div>${rosaT}
  ${albo?`<div class="sec-h" style="margin-top:10px"><h3>${trophySvg('#D4A017',15)} Albo d'oro</h3></div>${albo}`:''}
 </div><div class="col">
  <div class="sec-h"><h3>${ic2('trophy',15)} Vittorie</h3><span class="chip">${P.w.length}</span></div>${winsT}
  ${topT?`<div class="sec-h" style="margin-top:10px"><h3>${ic2('cap',15)} I più vincenti</h3></div>${topT}`:''}
  ${natT?`<div class="sec-h" style="margin-top:10px"><h3>${ic2('flag',15)} Medaglie in nazionale</h3></div>${natT}`:''}
 </div></div>`;
};
/* palmarès nella scheda del corridore: tabelle al posto degli elenchi */
palmBlock=function(r){
 const p=palmOf(r),wins=p.w.slice().reverse(),pods=p.podl.slice().reverse().slice(0,6);
 const rows=wins.slice(0,12).map(w=>`<tr><td>${medalOf(1)}</td><td class="bestc"><b>${esc(w.n)}</b></td><td class="r tm nowrap"><span class="chip cls">${esc(w.c)}</span> ${w.s}</td></tr>`).concat(pods.map(w=>`<tr><td>${medalOf(w.p)}</td><td class="bestc">${esc(w.n)}</td><td class="r tm">${w.s}</td></tr>`)).join('');
 return`<div class="card pad stack"><div class="sec-h" style="margin:0"><h3>${ic2('trophy',15)} Palmarès</h3><span class="mkstat"><span class="kc" title="Vittorie">${ic2('trophy',12)}<b>${p.w.length}</b></span><span class="kc" title="Podi">${ic2('cap',12)}<b>${p.pod}</b></span><span class="kc" title="Top 10">${ic2('chart',12)}<b>${p.t10}</b></span></span></div>
  ${(r.titles||[]).length?`<div class="titles">${r.titles.map(t=>`<span class="chip amber">${ic2('flag',11)} ${esc(t)}</span>`).join('')}</div>`:''}
  ${rows?DT('',rows,'palmt'):p.best?`<div class="note">${ic2('chart',13)} Migliore: <b>${ord(p.best.p)}</b> · ${esc(p.best.n)} · ${p.best.s}</div>`:`<div class="note">${ic2('chart',13)} Nessun piazzamento.</div>`}
  ${rows&&p.best&&p.best.p>3?'':''}</div>`;
};
/* ============================================================
   GARA A TAPPE: titolo con numero e tipo di tappa, note a icone
   ============================================================ */
const _showStageResultP2=showStageResult;
showStageResult=function(){
 const RC=LIVE&&LIVE.RC,sr=RC&&RC.stages[RC.stages.length-1];
 _showStageResultP2();const s=$('#sheet');if(!s||!RC||!sr)return;
 if(RC.stageRace){const i=RC.stages.length-1,pro=RC.race.stages[0].t==='prologo',st=RC.race.stages[i];const eb=s.querySelector('.ph .eyebrow');
  if(eb)eb.innerHTML=`${ic2('tappe',12)} ${esc(RC.race.name)} · ${st.t==='prologo'?'Prologo':`Tappa ${i+(pro?0:1)}/${RC.race.stages.length-(pro?1:0)}`} · ${typeIc(st.t,12)} ${TYPE_LAB[st.t]||''}`}
 s.querySelectorAll('h3').forEach(h=>{const t=h.textContent.trim();if(h.querySelector('svg'))return;if(t==='Classifica generale')h.innerHTML=`${ic2('tappe',15)} Generale`;else if(t==='Classifica a squadre')h.innerHTML=`${ic('team',15)} Squadre`});
 s.querySelectorAll('.sec-h .eyebrow').forEach(e=>{if(/somma dei 3/.test(e.textContent))e.textContent='3 migliori tempi'});
 const n=[...s.querySelectorAll('.pb .note')].find(x=>/Meteo|cadut|Ritirati/.test(x.textContent));
 if(n){const ch=[];if(sr.wx&&typeof wxIcon==='function')ch.push(`<span class="kc" title="${esc(wxText(sr.wx))}">${wxIcon(sr.wx.k,14)}</span>`);if(sr.crashes)ch.push(`<span class="kc" title="Cadute di gruppo">${ic2('warn',13)}<b>${sr.crashes}</b></span>`);
  if(sr.dnf&&sr.dnf.length){const mine=sr.dnf.filter(id=>RID(id).team==='t0');ch.push(`<span class="kc neg" title="Ritirati${mine.length?': '+esc(mine.map(id=>RID(id).name).join(', ')):''}">${ic2('injury',13)}<b>${sr.dnf.length}</b>${mine.length?` · ${mine.map(id=>avatar(RID(id),16)).join('')}`:''}</span>`)}
  n.outerHTML=`<div class="mkstat" style="margin-top:8px">${ch.join('')}</div>`}
 const ot=s.querySelector('.msg.no');if(ot&&/Fuori tempo/.test(ot.textContent)){ot.innerHTML=`${ic2('clockw',13)} Fuori tempo: <b>${sr.otl.length}</b> ${sr.otl.filter(id=>RID(id).team==='t0').map(id=>avatar(RID(id),16)+' '+shortSur(RID(id).name)).join(' ')}`}
 jerseyTeams(s);
};
/* ============================================================
   NAZIONALE: partecipanti con avatar e bandiera, finale a medaglie
   ============================================================ */
natHero=function(ev){
 const mine=(ev.field||[]).map(RID).filter(r=>r&&(r.team==='t0'||r.team==='acad'));
 return`<div class="herorace"><div style="min-width:0"><div class="eyebrow">${ic2('flag',12)} ${CHAMP_LAB[ev.champ]} · nazionali</div><div class="rline">${flagSvg(ev.ctry,18)}<b class="rn1">${esc(ev.name)}</b><span class="mt">${raceChips(ev)}</span></div>
  <div class="mkstat" style="margin-top:6px">${mine.map(r=>`<span class="kc" data-act="rider" data-v="${r.id}">${avatar(r,18)}${flagSvg(r.nat,13)}<b>${shortSur(r.name)}</b></span>`).join('')}</div></div>
  <div class="row"><button class="btn sm" data-act="natgo" data-v="${ev.id}" data-m="sim">Simula</button><button class="btn primary sm" data-act="natgo" data-v="${ev.id}" data-m="live">Segui dal vivo</button></div></div>`;
};
const _natFinalSheetP=natFinalSheet;
natFinalSheet=function(RC){
 _natFinalSheetP(RC);const s=$('#sheet'),R=RC.race.result;if(!s||!R)return;
 const eb=s.querySelector('.ph .eyebrow');if(eb)eb.insertAdjacentHTML('afterbegin',ic2('flag',12)+' ');
 if(R.mine){const box=[...s.querySelectorAll('h3')].find(h=>/I tuoi corridori/.test(h.textContent));if(box){const wrap=box.closest('div').parentElement;
  wrap.innerHTML=`<div class="sec-h"><h3>${ic('team',15)} I tuoi</h3></div>`+DT('',R.mine.map(m=>{const r=RID(m.id);return`<tr class="me" ${r?`data-act="rider" data-v="${r.id}"`:''}><td class="n">${m.pos===999?`<span class="tm">${ic2('injury',13)}</span>`:m.pos<=3?medalOf(m.pos):m.pos}</td><td>${r?personCell(r):esc(m.name)}</td></tr>`}).join(''))}}
 s.querySelectorAll('h3').forEach(h=>{if(/Ordine d'arrivo/.test(h.textContent)&&!h.querySelector('svg'))h.innerHTML=`${ic2('finish',15)} Ordine d'arrivo`});
};
/* scheda "piazzamenti" dal Palmarès: solo risultati, niente contratto/ruolo/allenamento */
function palmSheet(id){
 const r=RID(id);if(!r)return;const p=palmOf(r);
 const wins=p.w.slice().reverse(),pods=p.podl.slice().reverse();
 const wp=wins.map(w=>`<tr><td>${medalOf(1)}</td><td class="bestc"><b>${esc(w.n)}</b></td><td class="r tm nowrap"><span class="chip cls">${esc(w.c)}</span> ${w.s}</td></tr>`).concat(pods.map(w=>`<tr><td>${medalOf(w.p)}</td><td class="bestc">${esc(w.n)}</td><td class="r tm nowrap"><span class="chip cls">${esc(w.c||'')}</span> ${w.s}</td></tr>`)).join('');
 const res=(r.res||[]).slice().reverse().map(x=>`<tr><td class="n">${x.pos?(x.pos<=3?medalOf(x.pos):x.pos+'°'):`<span class="tm">${ic2('injury',12)}</span>`}</td><td class="bestc">${esc(x.name)}</td><td class="r nowrap"><span class="chip cls">${esc(x.cls||'')}</span>${x.w?` <span class="chip amber">${ic2('trophy',10)} ${x.w}</span>`:''}</td></tr>`).join('');
 const car=typeof careerRows==='function'?careerRows(r):[];
 const carT=car.length?DT(TH([[ic2('calendar',12)],['Squadra'],[ic2('cap',12),'r'],[ic2('calendar',12)+' gg','r hs'],[ic2('trophy',12),'r'],['Punti','r'],['UCI','r hs']]),car.map(c=>`<tr class="${c.me?'me':''}"><td class="n">${c.s}${c.live?'*':''}</td><td>${esc(c.t)} <span class="tm">${c.cat}</span></td><td class="r">${c.o}</td><td class="r hs">${c.d}</td><td class="r">${c.w||'<span class="tm">—</span>'}</td><td class="r">${c.p}</td><td class="r hs">${c.rk?c.rk+'°':'—'}</td></tr>`).join('')):'';
 openSheet(`<div class="ph wrap"><div class="pc" style="gap:12px;min-width:0">${avatar(r,46)}<div style="min-width:0"><div class="eyebrow">${ic2('trophy',12)} Palmarès · ${archIc(r,12)} ${ARCH[r.arch].lab}</div><h2>${flagSvg(r.nat,18)} ${esc(r.name)}</h2><div class="mkstat"><span class="kc" title="Vittorie">${ic2('trophy',12)}<b>${p.w.length}</b></span><span class="kc" title="Podi">${ic2('cap',12)}<b>${p.pod}</b></span><span class="kc" title="Top 10">${ic2('chart',12)}<b>${p.t10}</b></span>${p.best?`<span class="kc" title="Miglior piazzamento: ${esc(p.best.n)} (${p.best.s})">${p.best.p<=3?medalOf(p.best.p):'<b>'+p.best.p+'°</b>'}</span>`:''}${(r.titles||[]).map(t=>`<span class="kc">${ic2('flag',12)}${esc(t)}</span>`).join('')}</div></div></div><button class="x" data-act="close" aria-label="Chiudi">×</button></div>
 <div class="pb wrap"><div class="negbox"><div><div class="sec-h"><h3>${ic2('trophy',15)} Vittorie e podi</h3><span class="chip">${wins.length+pods.length}</span></div>${wp?DT('',wp,'palmt'):`<div class="note">${ic2('chart',13)} Nessun podio.</div>`}
  ${carT?`<div class="sec-h" style="margin-top:10px"><h3>${ic2('calendar',15)} Carriera</h3></div>${carT}`:''}</div>
  <div><div class="sec-h"><h3>${ic2('finish',15)} Piazzamenti ${SEASON}</h3><span class="chip">${(r.res||[]).length}</span></div>${res?DT('',res,'palmt'):`<div class="note">${ic2('finish',13)} Nessuna corsa.</div>`}</div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Chiudi</button></div></div>`,'wide');
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="palmr"]');if(t&&G){e.stopPropagation();palmSheet(t.dataset.v)}},true);
/* ============================================================
   CLUB: centro sportivo, traguardi, seconda squadra e scuola juniores
   ============================================================ */
renderBase=function(){
 const C=club(),got=ACH.filter(a=>C.ach[a[0]]).length,A=G.academy,js=acadJuniors().sort((a,b)=>b.age-a.age||b.pot-a.pot);
 const facs=DT(TH([['Struttura'],[ic2('chart',12),'c'],['Effetto','hm'],[ic2('euro',12)+'/anno','r hs'],['','r']]),Object.keys(FAC).map(k=>{const F=FAC[k],l=facLv(k),b=C.build&&C.build.k===k?C.build:null,nx=l+1;
  return`<tr><td><span class="pc"><span class="stic ${l?'on':''}">${ic(F.ico,16)}</span><b>${F.lab}</b></span></td><td class="c"><span class="lv">${'●'.repeat(l)}${'○'.repeat(3-l)}</span></td><td class="hm tm">${l?F.eff(l):F.d}</td><td class="r hs">${l?eurk(FAC_UP[l]):'—'}</td>
  <td class="r nowrap">${b?`<span class="chip amber">${ic2('clockw',11)} ${b.done-absWeek()} sett.</span>`:nx<=3?`<button class="btn sm" data-act="facb" data-v="${k}" ${C.build||G.cash<FAC_COST[nx]?'disabled':''} title="${l?'Migliora':'Costruisci'}">${ic('base',13)} ${eurk(FAC_COST[nx])}</button>`:`<span class="chip u23">${ic('check',11)}</span>`}</td></tr>`}).join(''));
 const ach=DT(TH([['Traguardo'],[ic('spon',12),'r'],[ic2('euro',12),'r hs'],['','r']]),ACH.map(a=>{const ok=C.ach[a[0]];return`<tr class="${ok?'okr':''}" title="Reputazione +${a[2]}"><td><span class="pc"><span class="achic ${ok?'on':''}">${ok?ic('check',14):ic('lock',13)}</span>${a[1]}</span></td><td class="r">+${a[3]}%</td><td class="r hs">${a[4]?eurk(a[4]):'—'}</td><td class="r tm">${ok?ok.s:''}</td></tr>`}).join(''));
 /* seconda squadra */
 let side;
 if(G.other){const o=otherInfo();side=`<div class="sec-h"><h3>${ic('team',15)} Le tue squadre</h3><span class="eyebrow">un solo budget</span></div>${DT('',`<tr class="me"><td><b>${SIDE_LAB[G.side]}</b> <span class="tm">ora</span></td><td><span class="chip">${myCat().lab}</span></td><td class="r">${ic('team',12)} ${ME().riders.length}</td><td class="r">${eurk(worldCost())}</td></tr><tr><td><b>${SIDE_LAB[o.side]}</b></td><td><span class="chip">${o.cat}</span></td><td class="r">${ic('team',12)} ${o.n}</td><td class="r">${eurk(o.cost)}</td></tr>`)}<div class="row" style="margin-top:6px"><button class="btn sm" data-act="side">Passa alla ${SIDE_LONG[o.side]}</button></div>`}
 else{const sd=G.side==='F'?'M':'F',CC=CAT_SIDE[sd].conti;side=`<div class="sec-h"><h3>${ic('team',15)} Fonda la ${SIDE_LONG[sd]}</h3><span class="eyebrow">facoltativo</span></div>
  <div class="mkstat"><span class="kc" title="Costo di fondazione">${ic('base',13)}<b>${eurk(FOUND_COST)}</b></span><span class="kc" title="Costo stimato all'anno">${ic2('euro',13)}<b>${eurk(CC.staff+(sd==='F'?90000:280000))}</b>/anno</span><span class="kc" title="${sd==='F'?'Atlete':'Corridori'}">${ic('team',13)}<b>${CC.min}–${CC.max}</b></span><span class="kc" title="Saldo previsto ora">${ic2('chart',13)}<b class="${projected()<0?'neg':''}">${eurk(projected())}</b></span></div>
  <div class="row" style="margin-top:8px"><button class="btn primary sm" data-act="foundother" ${G.cash<FOUND_COST?'disabled':''}>Fonda</button><span class="tm">${ic2('warn',12)} stessa cassa per le due squadre</span></div>`}
 /* scuola juniores */
 const acadHead=`<div class="sec-h"><h3>${ic2('svil',15)} Scuola juniores</h3><span class="lvd">${[1,2,3,4,5].map(i=>`<i class="${i<=A.level?'on':''}"></i>`).join('')}</span></div>
  <div class="mkstat">${A.level?`<span class="kc" title="Posti">${ic('team',13)}<b>${js.length}/${acadCap()}</b></span><span class="kc" title="Nuovi ragazzi a stagione">${ic2('go',13)}<b>+${1+A.level}</b>/anno</span><span class="kc" title="Costo annuo">${ic2('euro',13)}<b>${eurk(academyCost())}</b></span>`:`<span class="kc">${ic('lock',13)} da costruire</span>`}
   ${A.level<5?`<button class="btn ${A.level?'':'primary'} sm" data-act="acadup" ${G.cash<ACAD_UP[A.level+1]?'disabled':''} title="${A.level?'Migliora':'Costruisci'}">${ic('base',13)} ${A.level?'+1':'Costruisci'} · ${eurk(ACAD_UP[A.level+1])}</button>`:''}
   ${A.level?`<label class="kc" title="Osservatori">${ic2('search',13)}<select id="afocus" data-act="afocus" class="tsel">${Object.keys(ACAD_FOCUS).map(k=>`<option value="${k}" ${A.focus===k?'selected':''}>${ACAD_FOCUS_LAB[k]}</option>`).join('')}</select></label>`:''}</div>`;
 const jt=js.length?DT(TH([['','r'],['Ragazzo'],[ic2('calendar',12),'r'],['','hs'],[ic2('speed',12),'r hs'],['','r']]),js.map(r=>{const g=r.joined?r.wkg-r.joined.wkg:0,canPro=r.age>=18&&!r.next;
  return`<tr data-act="rider" data-v="${r.id}"><td class="r"><b class="ov">${ovr(r)}</b></td><td>${personCell(r)} ${archIc(r,13)}${r.next?` <span class="chip u23">${ic('check',10)}</span>`:''}</td><td class="r tm">${r.age}</td><td class="hs"><span class="stars">${'★'.repeat(1+Math.round(r.pot*4))}</span></td><td class="r hs ${g>0.005?'pos':'tm'}">${g>0.005?'+'+g.toFixed(2):''}</td><td class="r">${canPro?`<button class="btn primary sm" data-act="promote" data-v="${r.id}" title="Promuovi in squadra">${ic2('svil',13)} Promuovi</button>`:r.age<18?`<span class="tm" title="Promuovibile a 18 anni">${ic('lock',12)} 18</span>`:''}</td></tr>`}).join('')):'';
 const jl=A.log.length?`<div class="sec-h" style="margin-top:10px"><h3>${ic2('finish',15)} Risultati juniores</h3></div>`+DT('',A.log.slice(0,6).map(l=>`<tr><td class="n tm">${l.s}</td><td>${esc(l.t)}</td></tr>`).join('')):'';
 $('#view').innerHTML=`<div class="futgrid"><div class="col"><div class="sec-h"><h3>${ic('base',15)} Centro sportivo</h3><span class="row" style="gap:6px"><button class="chip" data-act="achsheet" title="Traguardi">${ic2('trophy',11)} ${got}/${ACH.length} · ${ic('spon',11)} +${Math.round((C.spMul-1)*100)}%</button><span class="eyebrow">${ic2('euro',11)} ${eurk(facUpkeep())}/anno</span></span></div>${facs}
</div>
  <div class="col">${acadHead}${jt?`<div style="margin-top:8px">${jt}</div>`:''}${jl}<div style="margin-top:12px">${side}</div></div></div>`;
};
