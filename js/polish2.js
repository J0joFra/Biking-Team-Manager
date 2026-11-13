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
const MENU_IC=[[/Nuova partita/i,'go'],[/Continua/i,'bike'],[/Come si gioca/i,'info'],[/Impostazioni/i,'staff'],[/Cancella/i,'elim']];
new MutationObserver(()=>{document.querySelectorAll('.menu button:not([data-ic]), .mbtn:not([data-ic])').forEach(b=>{b.dataset.ic='1';const h=b.querySelector('b,strong,h3,span')||b;const m=MENU_IC.find(([re])=>re.test(b.textContent));if(m&&!b.querySelector('svg'))h.insertAdjacentHTML('afterbegin',icx(m[1],18)+' ')})}).observe(document.body,{childList:true,subtree:true});
/* Palmarès: la sottoriga "21 anni · 0 V nel 2027" ripete le colonne */
const _renderPalmP2=renderPalm;renderPalm=function(){_renderPalmP2();setTimeout(()=>document.querySelectorAll('#view .tm').forEach(x=>{if(/^\d+ anni · \d+ V nel \d{4}$/.test(x.textContent.trim()))x.remove()}),0)};
if(G)render();
