"use strict";
/* ============================================================
   RIFINITURA 3: revisione generale, via le ridondanze
   ============================================================ */
/* ---------- barra in alto: una sola indicazione della squadra attiva ---------- */
const _renderTopP3=renderTop;
renderTop=function(){
 _renderTopP3();
 if(!G||!G.other)return;
 const sub=$('#top .sub');if(sub){const ch=sub.querySelector(':scope > .chip.fem, :scope > .chip');if(ch&&/^(Uomini|Donne)$/i.test(ch.textContent.trim()))ch.remove()}
 const b=$('#top [data-act="side"]');if(b)b.innerHTML=`<b>${SIDE_LAB[G.side]}</b> <span class="tm">⇄ ${SIDE_LAB[G.other.side]}</span>`;
};
/* ---------- terreni del pacchetto: solo la barra, il dettaglio nel suggerimento ---------- */
mixBar=function(m){const t=Object.values(m).reduce((a,b)=>a+b,0)||1,col={salita:'var(--accent)',classiche:'var(--amber)',volate:'var(--ok)',crono:'var(--muted)'},L={salita:'Salita',classiche:'Classiche',volate:'Volate',crono:'Crono'};
 const tip=Object.entries(m).filter(([k,v])=>v).map(([k,v])=>`${L[k]||k} ${v}`).join(' · ');
 return`<div class="mixbar" title="${tip}">${Object.entries(m).filter(([k,v])=>v).map(([k,v])=>`<i style="width:${v/t*100}%;background:${col[k]}"></i>`).join('')}</div>`};
/* ---------- Home ---------- */
const _renderHomeP3=renderHome;
renderHome=function(){
 _renderHomeP3();
 const v=$('#view');
 /* banner dell'altra squadra: una riga */
 const sb=v.querySelector('.banner[data-act="side"]');
 if(sb&&G.other){const o=otherInfo(),t=sb.textContent.split(': ').slice(1).join(': ').replace(/\. Passa all'altra squadra per convocare\.?$/,'');
  sb.innerHTML=`<span class="chip ${o.side==='F'?'fem':''}">${SIDE_LAB[o.side]}</span>${ic2('flag',14)}<b class="rn1">${esc(t)}</b><span class="tm">${ic('team',13)} da convocare</span><span class="go">⇄</span>`;sb.classList.add('sideban')}
 if(G.phase!=='season')offHome(v);
};
/* fine stagione: niente doppione della Posta, cose da fare in tabella */
function offHome(v){
 const hero=v.querySelector('.hero');if(!hero)return;
 const banners=[...v.querySelectorAll('.banner')].filter(b=>!b.closest('.hero'));
 hero.querySelectorAll(':scope > .note').forEach(n=>n.remove());
 const kv=hero.querySelector('.kv');if(kv){const KI=[['Punti','chart'],['Vittorie','trophy'],['Sponsor','spon']];kv.outerHTML=`<div class="mkstat">${[...kv.children].map(d=>{const l=d.querySelector('small').textContent,val=d.querySelector('b').innerHTML,k=KI.find(([re])=>l.startsWith(re));return`<span class="kc" title="${esc(l)}">${k?icx(k[1],14):''}<b>${val}</b>${/Sponsor/.test(l)?`<span class="tm">${l.replace('Sponsor ','')}</span>`:''}</span>`}).join('')}</div>`}
 const off=hero.querySelector('.offer');if(off){off.querySelectorAll('.note').forEach(n=>n.remove())}
 const h=hero.querySelector('h2');if(h){const rk=myCatRank();h.innerHTML=`${rk<=3?medalOf(rk):''} ${h.innerHTML}`}
 const T=typeof todoList==='function'?todoList():[];
 const todo=T.length?`<div><div class="sec-h"><h3>${ic2('warn',15)} Da fare</h3></div>${DT('',T.map(([i,t,a,val])=>`<tr data-act="${a}" data-v="${val}"><td><span class="pc">${i}<b>${t}</b></span></td><td class="r tm">›</td></tr>`).join(''),'todo')}</div>`:'';
 const g=document.createElement('div');g.className='homegrid';
 g.innerHTML=`<div class="col hc1"></div><div class="col hc2">${todo}${standMini()}${typeof recentMini==='function'?recentMini():''}</div>`;
 banners.forEach(b=>g.firstChild.appendChild(b));g.firstChild.appendChild(hero);
 v.innerHTML='';v.appendChild(g);
}
/* ---------- Calendario: filtri per tipo a sola icona ---------- */
const _renderCalP3=renderCal;
renderCal=function(){
 _renderCalP3();
 const v=$('#view');
 v.querySelectorAll('.fchip[data-act="calt"]').forEach(b=>{if(b.getAttribute('aria-pressed')==='true'||b.dataset.v==='all')return;const s=b.querySelector('svg');if(!s)return;b.title=b.textContent.trim();b.innerHTML='';b.appendChild(s);b.classList.add('ico')});
 const n=v.querySelector('.toolbar > .note');if(n&&/corse/.test(n.textContent)){n.outerHTML=`<span class="kc">${ic('cal',13)}<b>${n.textContent.match(/\d+/)?n.textContent.match(/\d+/)[0]:0}</b></span>`}
};
/* ---------- Scheda corsa: tappe in tabella, costi a icone ---------- */
const _raceSheetP3=raceSheet;
raceSheet=function(id){
 const o=_raceSheetP3(id);const r=G.races.find(x=>x.id===id),s=$('#sheet');if(!r||!s)return o;
 const st=s.querySelector('.stages');
 if(st&&r.tier!=='track'&&r.stages.length>1){const pro=r.stages[0].t==='prologo';
  st.innerHTML=DT(TH([['#','n'],['Tappa'],[ic2('go',12),'r'],[ic2('montagna',12),'r hs'],['','hm']]),r.stages.map((x,i)=>{const c=genCourse(x.t,x.seed,x.km,raceLf(r)),cl=c.climbs.filter(q=>q.cat!=='4').length;
   return`<tr><td class="n">${x.t==='prologo'?'P':i+(pro?0:1)}</td><td><span class="pc">${typeIc(x.t,14)}<b>${TYPE_LAB[x.t]}</b>${c.secN?`<span class="tm" title="Settori">${ic2('pave',11)}${c.secN}</span>`:''}</span></td><td class="r nowrap">${km1(c.len)}</td><td class="r hs">${cl||'<span class="tm">—</span>'}</td><td class="hm stprof">${profileSVG(c,140,22)}</td></tr>`}).join(''),'stt')}
 const cost=[...s.querySelectorAll('.rsside .eyebrow')].find(e=>/Costi/.test(e.textContent));
 if(cost){const n=cost.parentElement.querySelector('.note');if(n){const T=TIERS[r.tier];n.outerHTML=`<div class="mkstat"><span class="kc" title="Iscrizione">${ic2('contract',12)}<b>${eurk(T.fee)}</b></span><span class="kc" title="Trasferta per corridore al giorno">${ic('team',12)}<b>${eurk(T.prd)}</b>/gg</span>${r.ctry!=='ITA'?`<span class="kc" title="Trasferta all'estero">${flagSvg(r.ctry,12)}<b>+20%</b></span>`:''}</div>`}}
 const sw=[...s.querySelectorAll('.note')].find(n=>/^Vincitori di tappa/.test(n.textContent.trim()));
 if(sw&&r.result&&r.result.stageW){sw.outerHTML=`<div class="sec-h" style="margin-top:8px"><h3>${ic2('tappe',14)} Tappe</h3></div>`+DT('',r.result.stageW.map((n,i)=>{const rr=riderByName(n);return`<tr><td class="n">${i+1}</td><td>${rr?personCell(rr):esc(n)}</td></tr>`}).join(''))}
 return o;
};
/* ---------- note e messaggi lunghi (anche .msg) ---------- */
NOTE_SHORT.push(
 [/^Serve un invito degli organizzatori\. Probabilità [^(]*\((\d+)%\).*/,m=>`${ic2('inbox',13)} Su invito · probabilità ${m[1]}%`],
 [/^Iscrizione anche individuale: puoi schierare da 1 a (\d+) corridori.*/,m=>`${ic('team',13)} Squadra o singoli · 1–${m[1]}`],
 [/^Squadra: corrono insieme.*/,()=>null],
 [/^Si corre come squadra: almeno (\d+) corridori\.?/,m=>`${ic('team',13)} Solo squadra · almeno ${m[1]}`],
 [/^Iscrizioni chiuse.*/,()=>`${ic('lock',13)} Iscrizioni chiuse`],
 [/^Gara juniores: corrono i ragazzi della tua scuola.*/,()=>`${ic2('svil',13)} Corrono i ragazzi della scuola juniores`],
 [/^Corsa per nazionali.*/,()=>`${ic2('flag',13)} Corsa per nazionali: convocano i CT`],
 [/^\* stagione in corso$/,()=>null],
 [/^Sei tra le prime due ProTeam.*/,()=>`${ic('check',13)} Invito automatico`],
 [/^(Main sponsor|Co-sponsor|Partner) dal (\d+) al (\d+): (€\s?[\d.]+) l'anno\. Soddisfazione (\d+)%\.?/,m=>`${ic('spon',13)} ${m[1]} · ${ic2('calendar',12)} ${m[2]}–${m[3]} · ${m[4]} · ${m[5]}%`]
);
{const run=()=>{for(const id of ['view','sheet']){const r=document.getElementById(id);if(!r)continue;r.querySelectorAll('.msg:not([data-ns])').forEach(n=>{n.dataset.ns='1';const t=n.textContent.trim();for(const[re,f]of NOTE_SHORT){const m=t.match(re);if(m){const h=f(m);if(h===null)n.remove();else n.innerHTML=h;break}}})}};
 let pend=false;new MutationObserver(()=>{if(!pend){pend=true;requestAnimationFrame(()=>{pend=false;if(G)run()})}}).observe(document.body,{childList:true,subtree:true})}
/* ---------- titoli: più icone ---------- */
Object.assign(LAB_IC,{'Squadre':'team','Corridori':'bike','Ordine d\'arrivo':'finish','Carriera':'calendar','Risultati':'finish','Pagelle':'cap','La tua squadra':'team','Classifica a squadre':'team','Licenza ProTeam':'contract','Licenza WorldTeam':'contract','Licenza Continental':'contract','Gare':'flag','Specialità':'pista'});
/* ---------- scheda corridore: contratto a icone, risultati con medaglie ---------- */
const _riderSheetP3=riderSheet;
riderSheet=function(id){
 _riderSheetP3(id);const r=RID(id),s=$('#sheet');if(!r||!s)return;
 const eb=[...s.querySelectorAll('.eyebrow')].find(e=>/Contratto/.test(e.textContent));
 if(eb&&r.team==='t0'){const d=eb.nextElementSibling;if(d&&!d.classList.contains('mkstat')&&/l'anno/.test(d.textContent))d.outerHTML=`<div class="mkstat"><span class="kc" title="Ingaggio">${ic2('euro',12)}<b>${eurk(r.sal)}</b></span><span class="kc" title="Scadenza">${ic2('calendar',12)}<b>${r.cEnd}</b></span>${r.nextSal?`<span class="kc" title="Dal ${SEASON+1}">${ic2('go',12)}<b>${eurk(r.nextSal)}</b></span>`:''}${r.leavingTo?`<span class="kc neg">${tJer(TEAM(r.leavingTo),12)}<b>${esc(TEAM(r.leavingTo).short)}</b></span>`:''}</div>`;
  eb.parentElement.querySelectorAll('.note').forEach(n=>{if(/^Ha firmato con/.test(n.textContent.trim()))n.remove()})}
 const rh=[...s.querySelectorAll('.eyebrow')].find(e=>/^Risultati \d{4}/.test(e.textContent.trim()));
 if(rh){const tb=rh.parentElement.querySelector('table');if(tb)tb.querySelectorAll('tr').forEach(tr=>{const td=tr.lastElementChild;if(!td)return;const m=td.textContent.trim().match(/^(\d+)°/);if(m&&+m[1]<=3)td.innerHTML=td.innerHTML.replace(/^\s*\d+°/,medalOf(+m[1]))})}
};
if(G)render();
/* ---------- gara dal vivo: capitano e seconda punta a icona ---------- */
const _renderMineP3=renderMine;
renderMine=function(full){_renderMineP3(full);document.querySelectorAll('#mine .l1 .chip:not([data-ic])').forEach(c=>{c.dataset.ic='1';const t=c.textContent.trim();c.title=t;c.classList.add('chico');c.innerHTML=ic2('cap',12)+(/Seconda/.test(t)?'2':'')})};
/* ============================================================
   MENU INIZIALE, IMPOSTAZIONI, GUIDA E NUOVA PARTITA: icone
   ============================================================ */
IC2.sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>';
IC2.moon='<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>';
IC2.screen='<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>';
IC2.save='<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v5h7V3M8 14h8v7H8z"/>';
/* pulsanti del menu: icona a sinistra in un riquadro colorato */
new MutationObserver(()=>{document.querySelectorAll('.mbtn:not([data-mi])').forEach(b=>{b.dataset.mi='1';const s=b.querySelector(':scope > span svg');if(!s)return;const w=document.createElement('span');w.className='mico';w.appendChild(s);b.insertBefore(w,b.firstChild)})}).observe(document.body,{childList:true,subtree:true});
/* impostazioni */
settingsSheet=function(){
 const t=applyTheme();
 const th=[['system','screen','Sistema'],['light','sun','Chiaro'],['dark','moon','Scuro']];
 openSheet(sheetHead(`${ic2('gear',12)} Impostazioni`,'Preferenze')+`<div class="pb wrap stack">
  ${DT('',`<tr><td><span class="pc"><span class="stic on">${ic2(th.find(x=>x[0]===t)[1],15)}</span><b>Tema</b></span></td><td class="r"><div class="seg sm">${th.map(([k,i,l])=>`<button data-act="mtheme" data-v="${k}" aria-pressed="${t===k}" title="${l}">${ic2(i,14)} ${l}</button>`).join('')}</div></td></tr>
  <tr><td><span class="pc"><span class="stic on">${ic2('save',15)}</span><b>Salvataggio</b></span></td><td class="r"><span class="chip u23">${ic('check',11)} automatico</span></td></tr>
  ${G?`<tr><td><span class="pc">${typeof myJersey==='function'?myJersey(22):''}<b>${esc(G.name)}</b><span class="chip">${CAT[G.cat].lab}</span><span class="tm">${ic2('calendar',11)} ${SEASON}</span></span></td><td class="r"><button class="btn ghost sm" data-act="mdel" title="Cancella la partita">${ic2('elim',14)} Cancella</button></td></tr>`:''}`,'sett')}
 </div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">${ic('check',15)} Chiudi</button></div></div>`);
};
/* guida: icona per ogni tema */
const GUIDE_IC=[[/settimana/i,'calendar'],[/^Le corse/i,'flag'],[/In corsa/i,'bike'],[/^La squadra/i,'team'],[/Soldi|sponsor/i,'spon'],[/Mercato/i,'market'],[/maschile e femminile/i,'team']];
const _helpSheetP3=helpSheet;
helpSheet=function(){_helpSheetP3();const s=$('#sheet');if(!s)return;const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.querySelector('svg'))eb.insertAdjacentHTML('afterbegin',ic2('info',12)+' ');
 s.querySelectorAll('td.gk b').forEach(b=>{if(b.querySelector('svg'))return;const m=GUIDE_IC.find(([re])=>re.test(b.textContent));if(m)b.insertAdjacentHTML('afterbegin',`<span class="stic on">${icx(m[1],14)}</span> `)});
 s.querySelectorAll('tr.th td').forEach(td=>{if(td.textContent.trim()==='Tema')td.innerHTML=ic2('info',12);else if(td.textContent.trim()==='Come funziona')td.textContent=''})};
/* nuova partita: etichette a icone, note in breve */
Object.assign(LAB_IC,{'Nome della squadra':'contract','Sede della squadra':'base','Maglia':'team','Squadra':'team','Tema':'sun','Salvataggio':'save'});
const _renderIntroP3=renderIntro;
renderIntro=function(){_renderIntroP3();const v=$('#view');
 const ul=v.querySelector('.intro ul.note');if(ul)ul.outerHTML=`<div class="introtips">${[['flag','Continental e U23 subito · ProSeries su invito'],['euro','Ogni corsa: iscrizione + trasferta'],['spon','Sponsor dal territorio, poi dall\'Italia e dall\'estero'],['save','Salvataggio automatico']].map(([i,t])=>`<span class="kc">${icx(i,13)} ${t}</span>`).join('')}</div>`;
 v.querySelectorAll('.intro .field .note').forEach(n=>{if(/sponsor vicini/.test(n.textContent))n.innerHTML=`${ic('spon',12)} Sponsor più propensi vicino alla sede`});
 v.querySelectorAll('.intro label.eyebrow, .intro span.eyebrow').forEach(e=>{if(e.querySelector('svg'))return;const k=LAB_IC[e.textContent.trim()];if(k)e.insertAdjacentHTML('afterbegin',icx(k,12)+' ')});
 const st=v.querySelector('[data-act="start"]');if(st&&!st.querySelector('svg'))st.insertAdjacentHTML('afterbegin',ic2('go',16)+' ')};
/* ============================================================
   SCHEDA CORRIDORE: icone ovunque
   ============================================================ */
const ROLE_K_IC=k=>k==='cap'||k==='luog'?'cap':k==='free'?'free':k==='svil'?'svil':'gregario';
const raceByName=n=>G.races.find(x=>x.name===n);
const _riderSheetP3b=riderSheet;
riderSheet=function(id){
 _riderSheetP3b(id);const r=RID(id),s=$('#sheet');if(!r||!s)return;
 /* intestazione */
 const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.dataset.ri){eb.dataset.ri='1';eb.innerHTML=`${archIc(r,12)} ${eb.innerHTML}${r.team==='t0'&&r.role&&ROLES[r.role]?` · ${ic2(ROLE_K_IC(r.role),11)} ${ROLES[r.role].lab}`:''}`}
 const sub=s.querySelector('.ph .note');const t=G.teams.find(x=>x.id===r.team);
 if(sub&&!sub.dataset.ri){sub.dataset.ri='1';sub.innerHTML=`<span class="mkstat"><span class="kc" title="Età">${ic2('calendar',12)}<b>${r.age}</b></span><span class="kc" title="${esc(COUNTRY[r.nat]||r.nat)}">${flagSvg(r.nat,14)}<b>${r.nat}</b></span>${t?`<span class="kc">${tJer(t,14)}<b>${esc(t.id==='t0'?G.name:t.name)}</b></span>`:r.team==='acad'?`<span class="kc">${ic2('svil',12)}<b>Scuola juniores</b></span>`:r.team==='fa'?`<span class="kc">${ic2('free',12)}<b>Svincolato</b></span>`:''}</span>`}
 /* carriera */
 s.querySelectorAll('table.car').forEach(tb=>{const H={'Anno':ic2('calendar',11),'Val.':ic2('cap',11),'Gg':ic2('calendar',11)+' gg','V':ic2('trophy',11),'Punti':ic2('chart',11),'UCI':'UCI'};
  tb.querySelectorAll('tr.th td').forEach(td=>{const k=td.textContent.trim();if(H[k]){td.title=k;td.innerHTML=H[k]}});
  tb.querySelectorAll('tr:not(.th)').forEach(tr=>{const c=tr.children[1];if(!c||c.querySelector('svg'))return;const sh=c.childNodes[0]&&c.childNodes[0].textContent.trim(),tt=G.teams.find(x=>x.short===sh)||(sh===ME().short?ME():null);if(tt)c.insertAdjacentHTML('afterbegin',tJer(tt,14)+' ')})});
 const xp=s.querySelector('.xpline .eyebrow');if(xp&&!xp.querySelector('svg'))xp.insertAdjacentHTML('afterbegin',ic2('svil',11)+' ');
 /* umore, promessa e mercato */
 if(r.team==='t0'){const ce=[...s.querySelectorAll('.eyebrow')].find(e=>/Contratto/.test(e.textContent));const card=ce&&ce.parentElement;
  const mn=card&&[...card.querySelectorAll('.note')].find(n=>n.querySelector('.cond'));
  if(mn){const ml=moodLab(moodOf(r));mn.outerHTML=`<div class="mkstat"><span class="kc" title="Morale">${moodIc(r,14)}<b>${ml.t}</b></span>${r.promise&&PROMISE[r.promise]?`<span class="kc" title="Ruolo promesso">${ic2('cap',12)}<b>${PROMISE[r.promise]}</b>${r.promise==='cap'?`<span class="tm">${r.capN||0}/${r.myRaces||0}</span>`:''}</span>`:''}${r.listed?`<span class="kc" title="Sul mercato">${ic('market',12)}<b>${eurk(r.listed)}</b></span>`:''}</div>`}}
 /* ruolo in squadra */
 s.querySelectorAll('.rolepick button[data-act="setrole"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic2(ROLE_K_IC(b.dataset.v),13)+' ')});
 const rp=s.querySelector('.rolepick');if(rp){const n=rp.parentElement.querySelector(':scope > .note');if(n&&!n.dataset.ri){n.dataset.ri='1';const warn=/Attenzione/.test(n.textContent);n.innerHTML=`${ic2('info',12)} ${esc(n.textContent.replace(/\s*Attenzione:.*$/,''))}${warn?` <span class="neg">${ic2('warn',12)} promesso capitano</span>`:''}`}}
 s.querySelectorAll('label.field > span.eyebrow').forEach(e=>{if(/Specialità/.test(e.textContent)&&!e.querySelector('svg'))e.insertAdjacentHTML('afterbegin',ic2('flag',11)+' ')});
 /* programma individuale: nota età breve */
 s.querySelectorAll('.note').forEach(n=>{const m=n.textContent.trim().match(/^Età (\d+): (.*)\.$/);if(m&&!n.dataset.ri){n.dataset.ri='1';const up=/molto/.test(m[2])?'svil':/buoni/.test(m[2])?'go':/poco/.test(m[2])?'clockw':'warn';n.innerHTML=`${ic2(up,12)} ${m[2]}`}});
 /* fatica: chip */
 const fe=[...s.querySelectorAll('.eyebrow')].find(e=>/Fatica/.test(e.textContent));
 if(fe){const n=fe.parentElement.querySelector(':scope > .note');if(n&&!n.dataset.ri){n.dataset.ri='1';const rd=recDays(r);n.outerHTML=`<div class="mkstat" style="margin-top:6px"><span class="kc" title="Fatica">${ic2('drop',12)}<b>${Math.round(r.fat)}</b>/100</span><span class="kc" title="${rd?'Recupero completo':'Riposato'}">${ic2('clockw',12)}<b>${rd?'~'+rd+' gg':'ok'}</b></span><span class="kc" title="Giorni di corsa">${ic2('bike',12)}<b>${r.days}</b> gg</span></div>`}}
 /* risultati della stagione: bandiera e medaglie */
 const rh=[...s.querySelectorAll('.eyebrow')].find(e=>/^Risultati \d{4}/.test(e.textContent.trim()));
 if(rh&&r.res&&r.res.length){const box=rh.parentElement.querySelector('.card.tbl')||rh.nextElementSibling;if(box)box.outerHTML=DT('',r.res.slice().reverse().map(x=>{const rc=raceByName(x.name);return`<tr ${rc?`data-act="race" data-v="${rc.id}"`:''}><td class="n">${x.pos?(x.pos<=3?medalOf(x.pos):x.pos+'°'):`<span class="tm">${ic2('injury',12)}</span>`}</td><td class="bestc"><span class="pc">${rc?flagSvg(rc.ctry,14):''}<span>${esc(x.name)}</span></span></td><td class="r nowrap"><span class="chip cls">${esc(x.cls||'')}</span>${x.w?` <span class="chip amber">${ic2('trophy',10)} ${x.w}</span>`:''}</td></tr>`}).join(''),'palmt')}
 else if(rh){const n=rh.parentElement.querySelector(':scope > .note');if(n)n.innerHTML=`${ic2('finish',12)} Nessuna corsa`}
};
/* ============================================================
   GUIDA TATTICA (tutorial in corsa): icone su temi e ordini
   ============================================================ */
const TGUIDE_IC=[[/barre/i,'battery'],[/ordini/i,'radio'],[/attaccare/i,'velocista'],[/coprire/i,'shield'],[/fuga/i,'go'],[/volata/i,'velocista'],[/Imprevisti/i,'injury']];
const WORD_IC={Energia:'battery','Riserva scatti':'velocista',Piano:'contract',Ruota:'bike',Copri:'free',Tira:'speed',Scatta:'velocista',Scorta:'shield','Fuga di squadra':'team',salita:'montagna','muri e sul pavé':'pave',fuga:'go'};
const _guideSheetP3=guideSheet;
guideSheet=function(){_guideSheetP3();const s=$('#sheet');if(!s)return;
 const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.querySelector('svg'))eb.insertAdjacentHTML('afterbegin',ic2('info',12)+' ');
 const nt=s.querySelector('.ph .note');if(nt)nt.innerHTML=`${ic2('clockw',12)} Corsa in pausa`;
 s.querySelectorAll('td.gk b').forEach(b=>{if(b.querySelector('svg'))return;const m=TGUIDE_IC.find(([re])=>re.test(b.textContent));if(m)b.insertAdjacentHTML('afterbegin',`<span class="stic on">${icx(m[1],14)}</span> `)});
 s.querySelectorAll('td.gtx b').forEach(b=>{const k=WORD_IC[b.textContent.trim()];if(k&&!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',icx(k,13)+' ')});
 s.querySelectorAll('tr.th td').forEach(td=>{if(td.textContent.trim()==='Tema')td.innerHTML=ic2('info',12);else if(td.textContent.trim()==='Come funziona')td.textContent=''});
 const ok=s.querySelector('[data-act="close-guide"]');if(ok&&!ok.querySelector('svg'))ok.insertAdjacentHTML('afterbegin',ic('check',15)+' ')};
/* anche la guida generale: parole chiave a icona */
const _helpSheetP3b=helpSheet;helpSheet=function(){_helpSheetP3b();document.querySelectorAll('#sheet td.gtx b').forEach(b=>{const k=WORD_IC[b.textContent.trim()];if(k&&!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',icx(k,13)+' ')})};
/* ============================================================
   CONVOCAZIONE e CALENDARIO: altre icone
   ============================================================ */
const _renderConvocaP3=renderConvoca;
renderConvoca=function(){
 _renderConvocaP3();const s=$('#sheet'),race=SEL&&SEL.race;if(!s||!race)return;
 const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.dataset.ci){eb.dataset.ci='1';eb.innerHTML=`${ic('team',12)} ${eb.innerHTML.replace(/^(Convocazioni|Singoli)\s*·\s*/,'')}`}
 const sub=s.querySelector('.ph .note');if(sub&&!sub.dataset.ci){sub.dataset.ci='1';const pro=race.stages[0].t==='prologo';sub.innerHTML=`<span class="convst">${race.stages.map((x,i)=>`<span class="kc" title="${TYPE_LAB[x.t]}">${race.stages.length>1?`<b>${x.t==='prologo'?'P':i+(pro?0:1)}</b>`:''}${typeIc(x.t,13)}${race.stages.length>1?'':` ${TYPE_LAB[x.t]}`}</span>`).join('')}</span>`}
 s.querySelectorAll('tr input[data-act="pick"]').forEach(inp=>{const r=RID(inp.dataset.v),tr=inp.closest('tr');if(!r||!tr)return;
  const cd=tr.querySelector('.cond');if(cd&&!cd.dataset.ci){cd.dataset.ci='1';const c=condOf(r);cd.outerHTML=`<span class="kc" title="Forma: ${c.t}" style="color:${c.c}">${ic2('battery',14)}<b>${c.t}</b></span>`}
  const st=tr.querySelector('button.star[data-act="cap"]');if(st&&!st.dataset.ci){st.dataset.ci='1';st.innerHTML=ic2('cap',14)}});
};
const _renderCalP3b=renderCal;
renderCal=function(){_renderCalP3b();document.querySelectorAll('#view tr.wkr td').forEach(td=>{if(td.dataset.ci)return;td.dataset.ci='1';const now=/adesso/i.test(td.textContent);td.innerHTML=`${ic2(now?'flag':'calendar',11)} ${td.innerHTML.replace(/\s*·\s*adesso/i,'')}${now?` <span class="chip u23">${ic2('go',10)} ora</span>`:''}`})};
/* ============================================================
   MERCATO: trattativa e cessione a icone
   ============================================================ */
const PROM_IC={cap:'cap',lib:'free',greg:'gregario'},CL_IC={win:'trophy',pts:'chart',prog:'calendar',alt:'alt',exit:'go',noexit:'lock'};
const NEG_IC={renew:'contract',sign:'free',buy:'euro',pre:'svil'};
const _renderNegP3=renderNeg;
renderNeg=function(){
 _renderNegP3();const s=$('#sheet'),r=NEG&&RID(NEG.id);if(!s||!r)return;
 const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.dataset.ni){eb.dataset.ni='1';eb.insertAdjacentHTML('afterbegin',ic2(NEG_IC[NEG.mode]||'market',12)+' ')}
 const sub=s.querySelector('.ph .note');const t=G.teams.find(x=>x.id===r.team);
 if(sub&&!sub.dataset.ni){sub.dataset.ni='1';sub.innerHTML=`<span class="mkstat"><span class="kc">${archIc(r,12)}<b>${catOf(r)}</b></span><span class="kc" title="Età">${ic2('calendar',12)}<b>${r.age}</b></span><span class="kc">${flagSvg(r.nat,14)}<b>${r.nat}</b></span>${t?`<span class="kc">${tJer(t,14)}<b>${esc(t.id==='t0'?G.name:t.short)}</b></span>`:r.team==='fa'?`<span class="kc">${ic2('free',12)}<b>Svincolato</b></span>`:r.team==='jr'?`<span class="kc">${ic2('svil',12)}<b>Juniores</b></span>`:''}</span>`}
 s.querySelectorAll('.pb .note').forEach(n=>{if(n.dataset.ni)return;const x=n.textContent.trim();let m;
  if((m=x.match(/^(Contratto attuale|Contratto con .+?): (€\s?[\d.]+) l'anno fino al (\d{4})$/))){n.dataset.ni='1';n.outerHTML=`<div class="mkstat"><span class="kc" title="${esc(m[1])}">${ic2('contract',12)}<b>${eurk(r.sal)}</b>/anno</span><span class="kc" title="Scadenza">${ic2('calendar',12)}<b>${m[3]}</b></span></div>`}
  else if(/^(Uno dei corridori più importanti|Corridore importante|Non è tra i leader)/.test(x)){n.dataset.ni='1';const lv=/più importanti/.test(x)?3:/^Corridore importante/.test(x)?2:1;n.innerHTML=`${ic2('cap',12)} ${'★'.repeat(lv)}${'☆'.repeat(3-lv)} <span class="tm">${lv===3?'leader della squadra':lv===2?'importante':'non è un leader'}</span>`}
  else if((m=x.match(/^(\d{4}): (\d+) punti, (\d+) vittorie, (\d+) giorni di corsa$/))){n.dataset.ni='1';n.outerHTML=`<div class="mkstat"><span class="kc">${ic2('calendar',12)}<b>${m[1]}</b></span><span class="kc" title="Punti">${ic2('chart',12)}<b>${m[2]}</b></span><span class="kc" title="Vittorie">${ic2('trophy',12)}<b>${m[3]}</b></span><span class="kc" title="Giorni di corsa">${ic2('bike',12)}<b>${m[4]}</b> gg</span></div>`}
  else if(/^Sereno|^Molto contento|^Scontento|^Vuole andare via/.test(x)&&n.querySelector('.cond')){n.dataset.ni='1';const mm=x.match(/(\d+) corse con noi/);n.outerHTML=`<div class="mkstat"><span class="kc">${moodIc(r,14)}<b>${moodLab(moodOf(r)).t}</b></span>${mm?`<span class="kc" title="Corse con noi">${ic2('bike',12)}<b>${mm[1]}</b></span>`:''}${r.promise?`<span class="kc" title="Promesso">${ic2(PROM_IC[r.promise]||'cap',12)}<b>${PROMISE[r.promise]}</b></span>`:''}</div>`}
  else if((m=x.match(/^Costo su questa stagione: (€\s?[\d.]+) · saldo previsto dopo: (-?€\s?-?[\d.]+)/))){n.dataset.ni='1';const neg=/-/.test(m[2]);n.innerHTML=`<span class="mkstat"><span class="kc" title="Costo su questa stagione">${ic2('euro',12)}<b>${m[1]}</b></span><span class="kc ${neg?'neg':''}" title="Saldo previsto dopo">${ic2('chart',12)}<b>${m[2]}</b></span></span>`}
  else if(/^Pesa sul bilancio dal|^Il nuovo ingaggio pesa sul bilancio dal/.test(x)){n.dataset.ni='1';n.innerHTML=`${ic2('calendar',12)} dal ${SEASON+1}`}
  else if(/^I contratti lunghi costano meno/.test(x)){n.dataset.ni='1';n.innerHTML=`${ic2('info',12)} lungo = meno all'anno`}
  else if((m=x.match(/^Per lui l'offerta vale circa (€\s?[\d.]+)/))){n.dataset.ni='1';n.innerHTML=`${ic2('chart',12)} Vale per lui ~<b>${m[1]}</b>`}});
 s.querySelectorAll('[data-act="negpromise"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic2(PROM_IC[b.dataset.v]||'cap',13)+' ')});
 s.querySelectorAll('[data-act="negyears"]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic2('calendar',11)+' ')});
 s.querySelectorAll('[data-act="negcl"] b').forEach(b=>{const k=b.parentElement.dataset.v;if(!b.querySelector('svg')&&CL_IC[k])b.insertAdjacentHTML('afterbegin',ic2(CL_IC[k],13)+' ')});
 const H={'Clausole':'contract',"Motivazione dell'offerta":'info','Ruolo promesso':'cap','Durata':'calendar'};
 s.querySelectorAll('.eyebrow').forEach(e=>{if(e.querySelector('svg'))return;const k=e.textContent.trim();if(H[k])e.insertAdjacentHTML('afterbegin',ic2(H[k],11)+' ');else if(/^Indennizzo a /.test(k))e.innerHTML=`${ic2('euro',11)} Indennizzo ${(()=>{const tt=G.teams.find(x=>x.id===r.team);return tt?tJer(tt,12)+' '+esc(tt.short):''})()}`});
};
const _sellSheetP3=sellSheet;
sellSheet=function(id){const o=_sellSheetP3(id);const s=$('#sheet'),r=RID(id);if(!s||!r)return o;
 const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.querySelector('svg'))eb.insertAdjacentHTML('afterbegin',ic('market',12)+' ');
 const sub=s.querySelector('.ph .note');if(sub){const m=sub.textContent.match(/(€\s?[\d.]*\d)/);sub.innerHTML=`<span class="mkstat"><span class="kc">${avatar(r,16)}${flagSvg(r.nat,13)}<b>${esc(r.name)}</b></span>${m?`<span class="kc" title="Valore stimato">${ic2('chart',12)}<b>~${m[1]}</b></span>`:''}</span>`}
 s.querySelectorAll('.pb .note').forEach(n=>{if(/^Più alto è il prezzo/.test(n.textContent.trim()))n.innerHTML=`${ic2('info',12)} prezzo alto → meno offerte`});
 s.querySelectorAll('.eyebrow').forEach(e=>{if(/Prezzo richiesto/i.test(e.textContent)&&!e.querySelector('svg'))e.insertAdjacentHTML('afterbegin',ic2('euro',11)+' ')});return o};
/* ============================================================
   TATTICA: intestazione a icone, colonne a icone
   ============================================================ */
const _renderTacticP3=renderTactic;
renderTactic=function(){_renderTacticP3();const s=$('#sheet');if(!s)return;
 const eb=s.querySelector('.ph .eyebrow');if(eb&&!eb.dataset.ti){eb.dataset.ti='1';eb.innerHTML=`${ic2('contract',12)} ${eb.innerHTML.replace(/^Tattica\s*·\s*/,'')}`}
 const sub=s.querySelector('.ph .note');if(sub&&!sub.dataset.ti){sub.dataset.ti='1';const m=sub.textContent.match(/^(.+?) · ([\d.,]+) km · tempo massimo (\+\d+%)/);const k=m&&Object.keys(TYPE_LAB).find(x=>TYPE_LAB[x]===m[1]);
  if(m)sub.innerHTML=`<span class="mkstat"><span class="kc">${k?typeIc(k,13):''}<b>${m[1]}</b></span><span class="kc" title="Distanza">${ic2('go',12)}<b>${m[2]}</b> km</span><span class="kc" title="Tempo massimo">${ic2('clockw',12)}<b>${m[3]}</b></span></span>`}
 const H={'Corridore':null,'Punta':ic2('cap',12),'2ª':ic2('cap',12)+'2','Compito':ic('team',12),'Attacco':ic2('velocista',12),'Come corre':ic2('bike',12),'Quando attacca':ic2('velocista',12)};
 s.querySelectorAll('tr.th td').forEach(td=>{const k=td.textContent.trim();if(H[k]){td.title=k;td.innerHTML=H[k]}});
 s.querySelectorAll('.t.tac select.tsel').forEach(sl=>{if(sl.previousElementSibling&&sl.previousElementSibling.classList&&sl.previousElementSibling.classList.contains('selic'))return;sl.insertAdjacentHTML('beforebegin',`<span class="selic tm">${ic2('clockw',12)}</span>`)});
};
