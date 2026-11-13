"use strict";
/* ============================================================
   - via la moto TV dalla gara dal vivo
   - sponsor: niente categoria scritta, ruolo solo a simbolo
   - traguardi del club in una scheda a parte
   - TUTORIAL INTERATTIVO: passo passo sulle schermate vere
   ============================================================ */
/* ---------- niente moto TV ---------- */
tvBar=function(){return''};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="tvgroup"],[data-act="tvview"]');if(t){e.stopPropagation();e.preventDefault();if(LIVE)LIVE.view='prof'}},true);
new MutationObserver(()=>{document.querySelectorAll('#race .grp[data-act="tvgroup"]').forEach(g=>{g.removeAttribute('data-act');g.removeAttribute('title');g.removeAttribute('role');g.removeAttribute('tabindex')})}).observe(document.body,{childList:true,subtree:true});

/* ---------- sponsor: ruolo a simbolo, niente categoria ---------- */
const SLOT_IC={main:'cap',co:'free',partner:'team'};
const slotIc=(k,s=14)=>`<span class="slic s_${k}" title="${SLOTS[k].lab}">${ic2(SLOT_IC[k],s)}</span>`;
spTable=function(list){
 if(!list.length)return`<div class="note">${ic('spon',13)} Nessuno sponsor.</div>`;
 return DT(TH([['Sponsor'],[ic2('go',12),'r hs'],['Main','r'],['','r']]),list.map(s=>{
  const c=myContract(s),it=interest(s,'partner'),off=G.offers.find(o=>o.sid===s.id);
  const st=c?slotIc(c.slot):off?`<span class="pill inv" title="Proposta da valutare">${ic2('inbox',12)}</span>`:it.p<=0?`<span class="lockt" title="Reputazione richiesta">${ic('lock',12)} ${s.req}</span>`:`${Math.round(it.p*100)}% ${miniBar(it.p*100)}`;
  return`<tr data-act="sponsor" data-v="${s.id}"><td><span class="pc">${spLogo(s,22)}<b>${esc(s.name)}</b><span class="tm sub">${sectorLab(s)} · ${esc(s.city)}</span></span></td><td class="r hs">${spDist(s)}</td><td class="r">${eurk(amountFor(s,'main'))}</td><td class="r nowrap">${st}</td></tr>`}).join(''));
};
contractTable=function(list){
 if(!list.length)return`<div class="note">${ic('spon',13)} Nessun contratto.</div>`;
 return DT(TH([['Sponsor'],['','c'],['€/anno','r'],[ic2('calendar',12),'r hs'],['','r']]),list.map(c=>{const sp=SP(c.sid);
  return`<tr data-act="sponsor" data-v="${sp.id}"><td><span class="pc">${spLogo(sp,24)}<b>${esc(sp.name)}</b>${c.pen?` <span class="chip red" title="Penale se manchi l'obiettivo">${eurk(c.pen)}</span>`:''}</span></td><td class="c">${slotIc(c.slot)}</td><td class="r">${eurk(c.amount)}</td><td class="r hs">${c.from===c.end?c.from:c.from+'–'+String(c.end).slice(2)}</td><td class="r nowrap">${moodIc({mood:c.sat},16)} <b>${c.sat}%</b></td></tr>`}).join(''));
};
offerTable=function(list){
 if(!list.length)return`<div class="note">${ic2('inbox',13)} Nessuna proposta.</div>`;
 return DT(TH([['Sponsor'],['','c'],['€/anno','r'],[ic2('calendar',12),'r hs'],['']]),list.map(o=>{const sp=SP(o.sid),wk=Math.max(0,o.exp-absWeek());
  return`<tr data-act="sponsor" data-v="${sp.id}"><td><span class="pc">${spLogo(sp,22)}<b>${esc(sp.name)}</b>${o.renew?` <span class="chip u23" title="Rinnovo">${ic2('contract',10)}</span>`:''}${o.pen?` <span class="chip red" title="Penale: ${esc(o.obj.txt)}">${eurk(o.pen)}</span>`:''}${G.phase==='season'?`<span class="tm sub">${ic2('clockw',10)} ${wk} sett.</span>`:''}</span></td><td class="c">${slotIc(o.slot)}</td><td class="r"><b>${eurk(o.amount)}</b></td><td class="r hs">${o.years}</td>
  <td class="r nowrap"><button class="btn ghost sm" data-act="offno" data-v="${o.id}" title="Rifiuta">${ic2('elim',13)}</button> <button class="btn primary sm" data-act="offyes" data-v="${o.id}" title="Accetta">${ic('check',13)}</button></td></tr>`}).join(''));
};
/* la scheda dello sponsor: scritta della categoria → simbolo */
const _sponsorSheetTu=sponsorSheet;
sponsorSheet=function(id){_sponsorSheetTu(id);const s=$('#sheet'),sp=SP(id);if(!s||!sp)return;
 const eb=s.querySelector('.ph .eyebrow');if(eb&&SPONSOR_SIZE[sp.size]){eb.innerHTML=eb.innerHTML.replace(new RegExp('^\\s*'+SPONSOR_SIZE[sp.size].lab+'\\s*·\\s*','i'),'')}
 s.querySelectorAll('tr').forEach(tr=>{const td=tr.children[1];if(!td)return;const k=Object.keys(SLOTS).find(x=>td.textContent.trim()===SLOTS[x].lab);if(k)td.innerHTML=`${slotIc(k)} <span class="hs">${SLOTS[k].lab}</span>`})};

/* ---------- traguardi del club: scheda a parte ---------- */
function achSheet(){
 const C=club(),got=ACH.filter(a=>C.ach[a[0]]).length;
 openSheet(sheetHead(`${ic('base',12)} Club`,`${ic2('trophy',18)} Traguardi`,`${got}/${ACH.length} · ${ic('spon',12)} sponsor +${Math.round((C.spMul-1)*100)}%`)+`<div class="pb wrap">${DT(TH([['Traguardo'],[ic('spon',12),'r'],[ic2('euro',12),'r'],[ic2('calendar',12),'r']]),ACH.map(a=>{const ok=C.ach[a[0]];return`<tr class="${ok?'okr':''}" title="Reputazione +${a[2]}"><td><span class="pc"><span class="achic ${ok?'on':''}">${ok?ic('check',14):ic('lock',13)}</span>${a[1]}</span></td><td class="r">+${a[3]}%</td><td class="r">${a[4]?eurk(a[4]):'—'}</td><td class="r tm">${ok?ok.s:''}</td></tr>`}).join(''))}</div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">${ic('check',15)} Chiudi</button></div></div>`,'wide');
}
document.addEventListener('click',e=>{if(e.target.closest('[data-act="achsheet"]'))achSheet()});

/* ============================================================
   TUTORIAL INTERATTIVO
   ============================================================ */
const TUT=[
 {tab:'home',sel:'#top',ic:['ic','team'],t:'La tua squadra',d:'In alto: cassa, reputazione e soddisfazione degli sponsor. Il ☰ apre il menu.'},
 {tab:'home',sel:'#tabs',ic:['ic','home'],t:'Le sezioni',d:'Da qui passi da una sezione all\'altra. Il numero rosso indica cose nuove.'},
 {tab:'home',sel:'.pkhero, .wkcard',ic:['ic2','calendar'],t:'La settimana',d:'Qui vedi le corse della settimana. Convoca i corridori oppure avanza.',pk:'Prima scegli il pacchetto di corse dei prossimi mesi: tocca una riga per vederle.'},
 {tab:'cal',sel:'#view .toolbar',ic:['ic','cal'],t:'Calendario',d:'Filtra per livello e tipo di percorso. Tocca una corsa per iscriverti.'},
 {tab:'team',sel:'#view .teamrow, #view .toolbar',ic:['ic','team'],t:'La rosa',d:'Ruoli, forma e morale. Con i gruppi dividi la squadra per specialità; tieni premuto per scegliere il capitano.'},
 {tab:'team',sel:'#view table.t tr[data-act="rider"]',ic:['ic2','cap'],t:'Il corridore',d:'Tocca un corridore per vedere la scheda: valori, contratto, ruolo e programma.'},
 {tab:'train',sel:'#view .basegrid > .col',ic:['ic2','bike'],t:'Allenamento',d:'Due sedute a settimana: scegli il lavoro. I ritiri in altura danno un picco di forma.'},
 {tab:'market',sel:'.mkbar, #view .seg',ic:['ic','market'],t:'Mercato',d:'Svincolati, altre squadre, juniores e rinnovi. Le offerte per i tuoi arrivano qui.'},
 {tab:'spon',sel:'.fintabs, #view .seg',ic:['ic','spon'],t:'Finanze e sponsor',d:'Bilancio della stagione e sponsor sul mappamondo: più reputazione, più sponsor.'},
 {tab:'base',sel:'#view .futgrid > .col',ic:['ic','base'],t:'Club',d:'Strutture, scuola juniores e seconda squadra.'},
 {tab:'mail',sel:'#view .mailgrid > .col',ic:['ic','mail'],t:'Posta',d:'In cima le cose da fare. Ogni messaggio ha i pulsanti per agire subito.'},
 {tab:'home',sel:'[data-act="pkpick"], [data-act="convoca"], [data-act="adv1"], .wkcard',ic:['ic2','go'],t:'Tocca a te!',d:'Inizia da qui. Puoi rivedere il tutorial dal menu ☰.',last:true}
];
let TUTI=-1;
function tutStart(){if(!G)return;MENU=false;TUTI=0;closeSheet();tutShow()}
function tutEnd(){TUTI=-1;const o=$('#tut');if(o)o.remove();if(G){G.tutDone=true;save()}G.tab='home';render()}
function tutTarget(sel){for(const s of sel.split(',')){const el=document.querySelector(s.trim());if(el){const r=el.getBoundingClientRect();if(r.width&&r.height)return el}}return null}
function tutShow(){
 const st=TUT[TUTI];if(!st){tutEnd();return}
 if(G.tab!==st.tab){G.tab=st.tab;render()}
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
  let o=$('#tut');if(!o){o=document.createElement('div');o.id='tut';document.body.appendChild(o)}
  const el=tutTarget(st.sel),vw=innerWidth,vh=innerHeight;
  let r=el?el.getBoundingClientRect():{left:vw/2-1,top:vh/2-1,width:2,height:2};
  const pad=6,L=Math.max(4,r.left-pad),T=Math.max(4,r.top-pad),W=Math.min(vw-8,r.width+pad*2),H=Math.min(vh-8,r.height+pad*2);
  const pk=st.pk&&document.querySelector('.pkhero');
  const ico=st.ic[0]==='ic'?ic(st.ic[1],18):ic2(st.ic[1],18);
  const dots=TUT.map((x,i)=>`<i class="${i===TUTI?'on':''}"></i>`).join('');
  o.innerHTML=`<div class="tut-hole" style="left:${L}px;top:${T}px;width:${W}px;height:${H}px"></div>
  <div class="tut-bub" role="dialog" aria-label="Tutorial"><div class="tut-h"><span class="tut-i">${ico}</span><b>${st.t}</b><span class="tut-n">${TUTI+1}/${TUT.length}</span></div>
   <div class="tut-d">${pk?st.pk:st.d}</div>
   <div class="tut-f"><span class="tut-dots">${dots}</span><span style="flex:1"></span>${TUTI>0?`<button class="btn ghost sm" data-tut="prev" title="Indietro">←</button>`:''}${st.last?'':`<button class="btn ghost sm" data-tut="skip">Salta</button>`}<button class="btn primary sm" data-tut="next">${st.last?`${ic('check',13)} Inizia`:`Avanti ${ic2('go',13)}`}</button></div></div>`;
  /* fumetto accanto al riquadro, dove c'è più spazio */
  const b=o.querySelector('.tut-bub'),bw=Math.min(300,vw-24),bh=b.offsetHeight;b.style.width=bw+'px';
  const right=vw-(L+W),left=L,below=vh-(T+H),above=T;let x,y;
  if(right>=bw+16){x=L+W+10;y=T}else if(left>=bw+16){x=L-bw-10;y=T}else if(below>=bh+16){x=L;y=T+H+10}else if(above>=bh+16){x=L;y=T-bh-10}else{x=vw-bw-12;y=vh-bh-12}
  x=Math.max(8,Math.min(vw-bw-8,x));y=Math.max(8,Math.min(vh-b.offsetHeight-8,y));b.style.left=x+'px';b.style.top=y+'px';
 }));
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-tut]');if(!t)return;e.stopPropagation();const a=t.dataset.tut;
 if(a==='next'){if(TUT[TUTI]&&TUT[TUTI].last)tutEnd();else{TUTI++;tutShow()}}else if(a==='prev'){TUTI=Math.max(0,TUTI-1);tutShow()}else if(a==='skip')tutEnd()},true);
addEventListener('resize',()=>{if(TUTI>=0)tutShow()});
/* parte da solo alla prima partita */
document.addEventListener('click',e=>{if(e.target.closest('[data-act="start"]'))setTimeout(()=>{if(G&&!G.tutDone)tutStart()},900)});
/* dal menu e dalle impostazioni */
const _renderMenuTu=renderMenu;
renderMenu=function(){_renderMenuTu();if(!G)return;const h=$('#view [data-act="mhelp"]');if(h)h.insertAdjacentHTML('afterend',`<button class="card mbtn" data-act="mtut" data-mi="1" data-ic="1"><span class="mico">${ic2('flag',20)}</span><span><b>Tutorial</b><small>Giro guidato delle schermate</small></span></button>`)};
const _settingsSheetTu=settingsSheet;
settingsSheet=function(){_settingsSheetTu();if(!G)return;const tb=$('#sheet table.t');if(tb)tb.insertAdjacentHTML('beforeend',`<tr><td><span class="pc"><span class="stic on">${ic2('info',15)}</span><b>Tutorial</b></span></td><td class="r"><button class="btn sm" data-act="mtut">${ic2('go',13)} Rivedi</button></td></tr>`)};
document.addEventListener('click',e=>{if(e.target.closest('[data-act="mtut"]')){closeSheet();tutStart()}});
if(G)render();
