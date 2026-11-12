"use strict";
/* ============================================================
   MENU LATERALE: pagine dedicate (Posta, Allenamento, Staff,
   Palmarès) oltre a quelle esistenti
   ============================================================ */
Object.assign(ICON,{
 bike:'<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M10 8l3 8"/>',
 staff:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
 trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8"/>'
});
TABS.length=0;
TABS.push(['home','Home','home'],['mail','Posta','mail'],['cal','Corse','cal'],['team','Squadra','team'],['train','Allenam.','bike'],['market','Mercato','market'],['staff','Staff','staff'],['spon','Finanze','spon'],['base','Club','base'],['rank','Classifica','rank'],['palm','Palmarès','trophy']);
/* ---------- Posta ---------- */
function renderMail(){
 const M=G.inbox,sel=M.find(m=>m.id===G.mailSel)||M[0];
 if(sel&&!sel.read){sel.read=true;save();setTimeout(()=>{const b=$('#tabs [data-v="mail"] .badge');const n=G.inbox.filter(m=>!m.read).length;if(b){if(n)b.textContent=n;else b.remove()}},0)}
 const list=M.length?DT(TH([[''],['Da'],['Oggetto'],['Sett.','r']]),M.map(m=>`<tr data-act="mailsel" data-v="${m.id}" class="${sel&&m.id===sel.id?'sel':''}"><td style="width:14px">${m.read?'':'<span class="udot"></span>'}</td><td class="nowrap tm">${esc(m.from)}</td><td>${m.read?'':'<b>'}${esc(m.title)}${m.read?'':'</b>'}</td><td class="r tm">S${m.w}</td></tr>`).join(''),'mailt'):'<div class="note">Nessun messaggio.</div>';
 const news=G.news.filter(n=>n.s===SEASON).slice(0,25);
 $('#view').innerHTML=`<div class="mailgrid"><div class="col">${list}${news.length?`<div class="sec-h" style="margin-top:10px"><h3>Notizie</h3></div>${DT('',news.map(n=>`<tr><td class="tm">${esc(n.t)}</td></tr>`).join(''))}`:''}</div>
 <div class="col">${sel?`<div class="card pad mailread"><div class="eyebrow">${esc(sel.from)} · settimana ${sel.w}</div><h2>${esc(sel.title)}</h2><div class="mailbody">${esc(sel.body).replace(/\n/g,'<br>')}</div></div>`:''}</div></div>`;
}
/* ---------- Allenamento: sedute e ritiri in altura ---------- */
function renderTrain(){
 const camps=G.camps.slice().sort((a,b)=>b.from-a.from);
 const avail=DT(TH([['Località'],['Quota','r'],['€/sett.','r'],['']]),CAMPS.map(L=>{const ok=G.phase==='season'&&G.week+1<=L.to;return`<tr><td><b>${esc(L.name)}</b><div class="tm">${esc(L.place)} · ${weekLab(L.from)}–${weekLab(Math.min(L.to,52))}</div></td><td class="r nowrap"><b>${L.alt} m</b></td><td class="r">${eurk(L.cost)}</td><td class="r"><button class="btn sm" data-act="campbook" data-v="${L.id}" ${ok?'':'disabled'}>Prenota</button></td></tr>`}).join(''));
 const mine=camps.length?DT(TH([['Ritiro'],['Corridori','r'],['Periodo'],['Stato','r']]),camps.map(c=>{const L=CAMPS.find(x=>x.id===c.loc);return`<tr><td><b>${esc(L.name)}</b></td><td class="r">${c.riders.length}</td><td class="tm">${weekLab(c.from)}–${weekLab(c.to)}</td><td class="r">${c.done?'Concluso':c.from<=G.week?'In corso':`<button class="chip" data-act="campcancel" data-v="${c.id}">Annulla</button>`}</td></tr>`}).join('')):'';
 $('#view').innerHTML=`<div class="basegrid"><div class="col">${trainCard()}</div><div class="col"><div class="sec-h"><h3>${ic2('alt',16)} Ritiri in altura</h3><span class="eyebrow">picco 1–3 sett. dopo</span></div>${avail}${mine?`<div class="sec-h" style="margin-top:10px"><h3>I tuoi ritiri</h3></div>${mine}`:''}</div></div>`;
}
/* ---------- Staff ---------- */
function renderStaff(){$('#view').innerHTML=staffView()}
/* ---------- Palmarès ---------- */
function renderPalm(){
 const A=(G.awards||[]).slice().reverse();
 $('#view').innerHTML=renderTeamPalm()+(A.length?`<div class="sec-h" style="margin-top:12px"><h2>${ic2('trophy',18)} Albo d'oro</h2><span class="eyebrow">coppe di fine stagione</span></div>${A.map(s=>`<div class="eyebrow" style="margin:6px 0 4px">${s.s}</div>${s.teams&&s.teams.length?teamAwardsGrid(s.teams):''}${awardsGrid(s.list)}`).join('')}`:'');
}
Object.assign(VIEWS,{mail:()=>renderMail(),train:()=>renderTrain(),staff:()=>renderStaff(),palm:()=>renderPalm()});
/* le pagine vecchie non duplicano quelle nuove */
const _renderBaseN=renderBase;
renderBase=function(){_renderBaseN();const g=$('#view .basegrid');if(g){const c=g.querySelector(':scope>.col');if(c&&/Ritiri/.test(c.textContent.slice(0,40)))c.remove();g.classList.add('one')}};
const _renderMarketN=renderMarket;
renderMarket=function(){if(G.mk.sub==='staff')G.mk.sub='fa';_renderMarketN();const b=$('#view [data-act="mksub"][data-v="staff"]');if(b)b.remove()};
const _renderTeamN=renderTeam;
renderTeam=function(){if(G.teamView==='palm'||G.teamView==='allen')G.teamView='ruoli';_renderTeamN()};
const _clubCareerN=clubCareer;
clubCareer=function(){const h=_clubCareerN();const i=h.indexOf('<div class="sec-h" style="margin-top:14px"><h2>Albo d\'oro');return i>0?h.slice(0,i):h};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!G)return;const a=t.dataset.act;
 if(a==='mailsel'){G.mailSel=t.dataset.v;renderMail()}
 else if(a==='gotrain'){e.stopImmediatePropagation();G.tab='train';render()}
 else if(a==='mail'){e.stopImmediatePropagation();G.mailSel=t.dataset.v;G.tab='mail';closeSheet();render()}
},true);
if(G){if(G.teamView==='palm'||G.teamView==='allen')G.teamView='ruoli';render()}
