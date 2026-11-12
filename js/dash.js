"use strict";
/* ============================================================
   STRUTTURA "DA MANAGER": cruscotto in Home, Finanze,
   allenamento in Squadra, info nascoste dietro un'icona
   ============================================================ */
function trainMini(){
 const T=trainState(),racing=teamRacingWeek(G.week);
 return`<button class="dashrow" data-act="gotrain">${ic2('bike',18)}<span><b>Allenamento</b> · ${racing?'settimana di gara':`${TRAIN[T.s1].lab} + ${TRAIN[T.s2].lab}`}</span><span class="go">›</span></button>`;
}
function standMini(){
 const tr=teamRanking(G.cat),i=tr.findIndex(o=>o.t.id==='t0');
 const show=tr.slice(0,5).map((o,k)=>[o,k]);if(i>=5)show.push([tr[i],i]);
 return`<div><div class="sec-h"><h3>${ic2('chart',16)} Classifica ${myCat().lab}</h3><button class="chip" data-act="tab" data-v="rank">Tutta ›</button></div>
 ${DT('',show.map(([o,k])=>`<tr class="${o.t.id==='t0'?'me':''}"><td class="n">${k+1}</td><td><span class="pc">${o.t.id==='t0'?myJersey(20):jersey(o.t.color,'#fff',20)}<b>${esc(o.t.id==='t0'?G.name:o.t.name)}</b></span></td><td class="r">${o.p}</td></tr>`).join(''))}</div>`;
}
function finRows(){
 const W=seasonWeeks(),pay=payroll(),stf=typeof staffCost==='function'?staffCost():0,base=myCat().staff,acad=academyCost(),fac=typeof facUpkeep==='function'?facUpkeep():0;
 const other=G.other?withOther(worldCost):0,inc=incomeIn(SEASON);
 const out=[['Stipendi corridori',pay],['Staff tecnico',stf],['Staff e struttura '+myCat().lab,base],['Scuola juniores',acad],['Centro sportivo',fac]];
 if(G.other)out.push([`${SIDE_LONG[G.other.side][0].toUpperCase()+SIDE_LONG[G.other.side].slice(1)}`,other]);
 return{inc,out:out.filter(o=>o[1]>0),tot:out.reduce((a,o)=>a+o[1],0),W};
}
function finMini(){
 const f=finRows(),proj=projected();
 return`<div><div class="sec-h"><h3>${ic2('euro',16)} Finanze</h3><button class="chip" data-act="tab" data-v="spon">Dettagli ›</button></div>
 ${DT('',`<tr><td>Cassa</td><td class="r"><b class="${G.cash<0?'neg':''}">${eurk(G.cash)}</b></td></tr><tr><td>Entrate a settimana</td><td class="r pos">+${eurk(f.inc/f.W)}</td></tr><tr><td>Uscite a settimana</td><td class="r neg">−${eurk(f.tot/f.W)}</td></tr><tr><td>Saldo a fine stagione</td><td class="r"><b class="${proj<0?'neg':'pos'}">${eurk(proj)}</b></td></tr>`)}</div>`;
}
function finTable(){
 const f=finRows();
 return`<div class="sec"><div class="sec-h"><h2>${ic2('euro',18)} Bilancio ${SEASON}</h2><span class="eyebrow">saldo previsto ${eurk(projected())}</span></div>
 ${DT(TH([['Voce'],['Anno','r'],['Settimana','r hs']]),`<tr class="okr"><td><b>Sponsor</b></td><td class="r pos"><b>+${eurk(f.inc)}</b></td><td class="r hs">+${eurk(f.inc/f.W)}</td></tr>`+f.out.map(([l,v])=>`<tr><td>${esc(l)}</td><td class="r neg">−${eurk(v)}</td><td class="r hs">−${eurk(v/f.W)}</td></tr>`).join('')+`<tr class="me"><td><b>Risultato</b></td><td class="r"><b class="${f.inc-f.tot<0?'neg':'pos'}">${f.inc-f.tot<0?'−':'+'}${eurk(Math.abs(f.inc-f.tot))}</b></td><td class="r hs">${eurk((f.inc-f.tot)/f.W)}</td></tr>`)}
 <div class="note">Quote d'iscrizione, premi delle corse e acquisti non sono compresi: si pagano o incassano al momento.</div></div>`;
}
const _renderHomeD=renderHome;
renderHome=function(){
 _renderHomeD();
 const cols=document.querySelectorAll('#view .homegrid > .col');const c2=cols[1];
 if(c2&&G.phase==='season')c2.insertAdjacentHTML('afterbegin',standMini()+finMini());
 /* bandiere e icone nei risultati recenti */
 document.querySelectorAll('#view .recent').forEach(b=>{const r=G.races.find(x=>x.id===b.dataset.v);if(r&&!b.querySelector('.flag'))b.insertAdjacentHTML('afterbegin',flagSvg(r.ctry,16))});
};
const _renderSponsorD=renderSponsor;
renderSponsor=function(){_renderSponsorD();$('#view').insertAdjacentHTML('afterbegin',finTable())};
/* scheda corridore: avatar grande e bandiera */
const _riderSheetD=riderSheet;
riderSheet=function(id){_riderSheetD(id);const r=RID(id);if(!r)return;const h=$('#sheet .ph');if(h&&!h.querySelector('.av'))h.insertAdjacentHTML('afterbegin',`<span class="phav">${avatar(r,52)}<span class="phfl">${flagSvg(r.nat,20)}</span></span>`)};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="gotrain"]');if(t&&G){G.tab='team';G.teamView='allen';render();window.scrollTo(0,0)}});
/* info: le spiegazioni lunghe diventano un'icona da toccare */
clipNotes=function(root){if(!root)return;root.querySelectorAll('.note:not(.gtx):not(.clip):not([data-keep])').forEach(n=>{if(n.closest('.mailbody,.guide,.gtab,.momc'))return;if(n.textContent.trim().length>60){n.classList.add('clip');n.setAttribute('role','button');n.title='Mostra la spiegazione'}})};
if(G)render();
