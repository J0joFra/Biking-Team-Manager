"use strict";
/* ============================================================
   TABELLE: rose, mercato, calendario, sponsor, staff, club,
   pacchetti e premi in forma di tabella (i riquadri restano
   solo nel palmarès e nella scheda del corridore)
   ============================================================ */
const TH=(cols)=>`<tr class="th">${cols.map(c=>`<td class="${c[1]||''}">${c[0]}</td>`).join('')}</tr>`;
const DT=(head,rows,cls='')=>`<div class="card tbl dtw"><table class="t dt ${cls}">${head}${rows}</table></div>`;
function miniBar(v,max=100,cls=''){return`<span class="mb ${cls}"><i style="width:${clamp(v/max*100,0,100)}%"></i></span>`}
function riderFlags(r){
 const f=[];
 if(injured(r))f.push('<span class="chip red">Infortunato</span>');
 else if(inCamp(r,G.week,G.week))f.push('<span class="chip amber">Altura</span>');
 if(r.cEnd===SEASON&&!r.renewed&&!r.leavingTo&&r.team==='t0')f.push('<span class="chip red">Scadenza</span>');
 if(r.leavingTo)f.push(`<span class="chip red">→ ${esc(TEAM(r.leavingTo).short)}</span>`);
 if(r.listed)f.push('<span class="chip amber">In vendita</span>');
 if(moodOf(r)<35)f.push('<span class="chip red">Scontento</span>');
 if(r.natB&&r.natB[1]>=G.week)f.push('<span class="chip amber">Nazionale</span>');
 return f.join('');
}
/* rosa */
function riderTable(list,opts={}){
 if(!list.length)return'<div class="note">Nessun corridore.</div>';
 return DT(TH([['Val','r'],['Corridore'],['Ruolo','hm'],['Età','r'],['SAL','r hs'],['PIA','r hs'],['CRO','r hs'],['VOL','r hs'],['Forma'],['Gg','r'],['V','r']]),
 list.map(r=>{const s=stats(r),c=condOf(r),tr=trend(r);
  return`<tr data-act="rider" data-v="${r.id}"><td class="r"><b class="ov ${ovr(r)>=75?'hi':''}">${ovr(r)}</b>${opts.trend&&tr.t?`<small class="tr ${tr.c}">${tr.t}</small>`:''}</td>
  <td><b>${esc(r.name)}</b> <span class="chip ${r.age<=22?'u23':''}">${catOf(r)}</span>${r.grp&&typeof gChip==='function'?' '+gChip(r.grp):''}<div class="tm">${ARCH[r.arch].lab}${(r.role==='cap'||r.role==='luog')&&r.spec?' · '+SPEC[r.spec]:''} ${riderFlags(r)}</div></td>
  <td class="hm">${r.role?ROLES[r.role].lab:''}</td><td class="r">${r.age}</td>
  <td class="r hs">${s.sal}</td><td class="r hs">${s.pia}</td><td class="r hs">${s.cro}</td><td class="r hs">${s.vol}</td>
  <td><span class="cond" style="--c:${c.c}">${c.t}</span>${recDays(r)?`<div class="tm">rec. ${recDays(r)} gg</div>`:''}</td><td class="r">${r.days}</td><td class="r">${r.wins||''}</td></tr>`}).join(''));
}
function covTable(cov){
 return DT(TH([['Specialità'],['Il migliore'],['Valore','r'],['']]),cov.map(({k,best})=>`<tr data-act="rider" data-v="${best.r.id}"><td>${SPEC[k]}</td><td>${esc(best.r.name)}</td><td class="r"><b class="${best.v<60?'neg':best.v>=75?'pos':''}">${best.v}</b></td><td style="width:30%">${miniBar(best.v)}</td></tr>`).join(''));
}
/* mercato */
function mkInfo(r){
 const m=negMode(r),py=typeof prefYears==='function'?prefYears(r):2;let pr='',sm='';
 if(r.team==='t0'){pr=r.leavingTo?'—':r.renewed?eurk(r.nextSal):'~'+eurk(askSal(r,'renew',py));sm=r.leavingTo?'firmato altrove':r.renewed?`fino al ${r.cEnd}`:'richiesta'}
 else if(m==='buy'){pr='~'+eurk(feeAsk(r));sm='indennizzo'}
 else if(m==='pre'){pr='~'+eurk(askSal(r,'pre',py));sm=r.junior?'ingaggio':'parametro zero'}
 else if(m==='sign'){pr='~'+eurk(askSal(r,'sign',py));sm='ingaggio'}
 else{pr='—';sm=whyNot(r)}
 return{pr,sm};
}
function mkTable(list){
 if(!list.length)return'<div class="note">Nessun corridore.</div>';
 return DT(TH([['Val','r'],['Corridore'],['Età','r'],['Squadra','hm'],['SAL','r hs'],['PIA','r hs'],['CRO','r hs'],['VOL','r hs'],['Costo','r']]),
 list.map(r=>{const s=stats(r),i=mkInfo(r),pot=r.age<=22?'★'.repeat(1+Math.round((r.pot||0)*4)):'';
  const team=r.team==='t0'?'Mio':r.team==='fa'?'Svincolato':r.team==='jr'?'Juniores':`${esc(TEAM(r.team).short)} · ${r.cEnd}`;
  return`<tr data-act="neg" data-v="${r.id}"><td class="r"><b class="ov ${ovr(r)>=75?'hi':''}">${ovr(r)}</b></td><td><b>${esc(r.name)}</b> <span class="chip ${r.age<=22||r.junior?'u23':''}">${r.junior?'Juniores':catOf(r)}</span><div class="tm">${ARCH[r.arch].lab}${pot?` · <span class="stars">${pot}</span>`:''}</div></td>
  <td class="r">${r.age}</td><td class="hm">${team}</td><td class="r hs">${s.sal}</td><td class="r hs">${s.pia}</td><td class="r hs">${s.cro}</td><td class="r hs">${s.vol}</td><td class="r"><b>${i.pr}</b><div class="tm">${esc(i.sm)}</div></td></tr>`}).join(''));
}
/* calendario */
function calTable(list,past){
 let lw=-1,rows='';
 for(const r of list){
  if(r.w!==lw){lw=r.w;rows+=`<tr class="wkr ${r.w===G.week?'now':''}" ${r.w===G.week?'id="wknow"':''}><td colspan="2">Sett. ${r.w} · ${weekLab(r.w)}${r.w===G.week?' · adesso':''}</td></tr>`}
  const s=raceState(r);
  rows+=`<tr data-act="race" data-v="${r.id}" class="${past?'past':''}"><td><b>${esc(r.name)}</b><div class="mt">${raceChips(r)}</div></td><td class="r"><span class="pill ${s.cls}">${s.t}</span></td></tr>`;
 }
 return DT('',rows,'cal');
}
/* sponsor */
function spTable(list){
 if(!list.length)return'<div class="note">Nessuno sponsor.</div>';
 return DT(TH([['Sponsor'],['Tipo','hm'],['Km','r hs'],['Main','r'],['Propensione','r']]),list.map(s=>{
  const c=myContract(s),it=interest(s,'partner'),off=G.offers.find(o=>o.sid===s.id);
  const st=c?`<span class="pill reg">${SLOTS[c.slot].lab}</span>`:off?'<span class="pill inv">Proposta</span>':it.p<=0?`<span class="lockt">${ic('lock',12)} rep. ${s.req}</span>`:`${Math.round(it.p*100)}% ${miniBar(it.p*100)}`;
  return`<tr data-act="sponsor" data-v="${s.id}"><td><b>${esc(s.name)}</b><div class="tm">${sectorLab(s)} · ${esc(s.city)}</div></td><td class="hm"><span class="chip ${s.size==='internazionale'||s.size==='nazionale'?'amber':''}">${SPONSOR_SIZE[s.size].lab}</span></td><td class="r hs">${spDist(s)}</td><td class="r">${eurk(amountFor(s,'main'))}</td><td class="r">${st}</td></tr>`}).join(''));
}
function contractTable(list){
 if(!list.length)return'<div class="note">Nessun contratto.</div>';
 return DT(TH([['Sponsor'],['Ruolo'],['€/anno','r'],['Anni','r hs'],['Obiettivo'],['Soddisf.','r']]),list.map(c=>{const sp=SP(c.sid),v=Math.min(c.obj.n,Math.round(contractProg(c)));
  return`<tr data-act="sponsor" data-v="${sp.id}"><td><b>${esc(sp.name)}</b>${c.pen?`<div class="tm"><span class="chip red">Penale ${eurk(c.pen)}</span></div>`:''}</td><td>${SLOTS[c.slot].lab}</td><td class="r">${eurk(c.amount)}</td><td class="r hs">${c.from===c.end?c.from:c.from+'–'+String(c.end).slice(2)}</td>
  <td>${activeIn(c,SEASON)?`<div class="tm">${esc(c.obj.txt)}</div>${miniBar(v,c.obj.n,c.done?'ok':'')} <small>${c.done?'fatto':v+'/'+c.obj.n}</small>`:'<span class="tm">dal '+c.from+'</span>'}</td><td class="r"><b>${c.sat}%</b></td></tr>`}).join(''));
}
function offerTable(list){
 if(!list.length)return'<div class="note">Nessuna proposta in arrivo.</div>';
 return DT(TH([['Sponsor'],['Ruolo'],['€/anno','r'],['Durata','r hs'],['']]),list.map(o=>{const sp=SP(o.sid),wk=Math.max(0,o.exp-absWeek());
  return`<tr><td><b>${esc(sp.name)}</b> ${o.renew?'<span class="chip u23">Rinnovo</span>':''}<div class="tm">${esc(sp.city)} · ${spDist(sp)} km${G.phase==='season'?` · scade tra ${wk} sett.`:''}${o.pen?` · <span class="chip red">Penale ${eurk(o.pen)}</span> ${esc(o.obj.txt)}`:''}</div></td><td>${SLOTS[o.slot].lab}</td><td class="r"><b>${eurk(o.amount)}</b></td><td class="r hs">${o.years} ${o.years>1?'anni':'anno'}</td>
  <td class="r nowrap"><button class="btn ghost sm" data-act="offno" data-v="${o.id}">No</button> <button class="btn primary sm" data-act="offyes" data-v="${o.id}">Accetta</button></td></tr>`}).join(''));
}
/* staff */
staffView=function(){
 const T=staffT(),pool=staffPool().filter(s=>STF.role==='all'||s.role===STF.role).sort((a,b)=>b.q-a.q);
 const cur=DT(TH([['Ruolo'],['Nome'],['Qualità','r'],['Stipendio','r hs'],['Fino al','r hs'],['']]),Object.keys(STAFF_R).map(k=>{const s=T[k],R0=STAFF_R[k];
  return`<tr><td><b>${R0.lab}</b><div class="tm">${R0.eff}</div></td><td>${s?esc(s.name):'<span class="tm">posto libero</span>'}</td><td class="r">${s?`<b>${s.q}</b> ${miniBar(s.q)}`:'—'}</td><td class="r hs">${s?eurk(s.sal):''}</td><td class="r hs">${s?s.cEnd:''}</td>
  <td class="r">${s?`<button class="chip" data-act="stfire" data-v="${k}">Libera</button>`:`<button class="btn sm" data-act="strole" data-v="${k}">Cerca</button>`}</td></tr>`}).join(''));
 const cand=pool.length?DT(TH([['Ruolo'],['Nome'],['Età','r hs'],['Qualità','r'],['Rispetto al tuo','r hm'],['Stipendio','r'],['']]),pool.map(s=>{const lock=G.rep<staffWants(s),cmp=T[s.role]?s.q-T[s.role].q:null;
  return`<tr><td>${STAFF_R[s.role].lab}</td><td><b>${esc(s.name)}</b></td><td class="r hs">${s.age}</td><td class="r"><b>${s.q}</b> ${miniBar(s.q)}</td><td class="r hm ${cmp===null?'':cmp>0?'pos':'neg'}">${cmp===null?'posto libero':(cmp>0?'+':'')+cmp}</td><td class="r">${eurk(Math.round(s.sal*(STF.years>=3?0.93:1)/500)*500)}</td>
  <td class="r"><button class="btn sm ${lock?'':'primary'}" data-act="sthire" data-v="${s.id}" ${lock?'disabled':''}>${lock?ic('lock',12)+' rep. '+staffWants(s):'Ingaggia'}</button></td></tr>`}).join('')):'<div class="note">Nessun candidato: nuovi nomi a giugno e a inizio stagione.</div>';
 return`<div class="sec"><div class="sec-h"><h2>Il tuo staff</h2><span class="eyebrow">${eurk(staffCost())}/anno</span></div>${cur}</div>
 <div class="sec"><div class="sec-h"><h2>Sul mercato</h2><div class="seg sm stdur">${[1,2,3].map(y=>`<button data-act="styears" data-v="${y}" aria-pressed="${STF.years===y}">${y} ${y>1?'anni':'anno'}</button>`).join('')}</div></div>
  <div class="chips" style="margin-bottom:8px">${[['all','Tutti'],...Object.entries(STAFF_R).map(([k,v])=>[k,v.lab])].map(([k,l])=>`<button class="fchip" data-act="strole" data-v="${k}" aria-pressed="${STF.role===k}">${l}</button>`).join('')}</div>${cand}</div>`;
};
/* club */
clubPage=function(){
 const C=club(),got=ACH.filter(a=>C.ach[a[0]]).length;
 const facs=DT(TH([['Struttura'],['Livello'],['Effetto','hm'],['Manutenzione','r hs'],['']]),Object.keys(FAC).map(k=>{const F=FAC[k],l=facLv(k),b=C.build&&C.build.k===k?C.build:null,nx=l+1;
  return`<tr><td><b>${F.lab}</b></td><td><span class="lv">${'●'.repeat(l)}${'○'.repeat(3-l)}</span></td><td class="hm tm">${l?F.eff(l):F.d}</td><td class="r hs">${l?eurk(FAC_UP[l]):'—'}</td>
  <td class="r">${b?`<span class="chip amber">Cantiere · ${b.done-absWeek()} sett.</span>`:nx<=3?`<button class="btn sm" data-act="facb" data-v="${k}" ${C.build||G.cash<FAC_COST[nx]?'disabled':''}>${l?'+1':'Costruisci'} · ${eurk(FAC_COST[nx])}</button>`:'<span class="chip u23">Completo</span>'}</td></tr>`}).join(''));
 const ach=DT(TH([['Traguardo'],['Sponsor','r'],['Premio','r hs'],['','r']]),ACH.map(a=>{const ok=C.ach[a[0]];return`<tr class="${ok?'okr':''}"><td>${ic(ok?'check':'lock',13)} ${a[1]}</td><td class="r">+${a[3]}%</td><td class="r hs">${a[4]?eurk(a[4]):'—'}</td><td class="r tm">${ok?ok.s:''}</td></tr>`}).join(''));
 return`<div class="clubtop"><div><div class="sec-h"><h3>Centro sportivo</h3><span class="eyebrow">${eurk(facUpkeep())}/anno</span></div>${facs}</div>
  <div><div class="sec-h"><h3>Traguardi</h3><span class="eyebrow">${got}/${ACH.length} · sponsor +${Math.round((C.spMul-1)*100)}%</span></div>${ach}</div></div>`;
};
/* pacchetti della dirigenza */
pkgHero=function(){
 const P=G.pk,B=BLOCKS[P.b];
 const rows=P.offers.map((o,i)=>{const S=PK_STYLE[o.k];return`<tr data-act="pkpick" data-v="${i}"><td><b>${ic(S.ico,15)} ${S.name}</b><div class="tm">${S.sub}</div></td><td class="r">${o.races.length}</td><td class="r">${o.days}</td><td class="r"><b>${eurk(o.cost)}</b></td><td class="hm" style="width:22%">${mixBar(o.mix)}</td><td class="hs tm">${o.top.slice(0,2).map(esc).join(', ')}</td><td class="r">${o.obj?`<span class="chip amber">${o.obj}</span>`:''}</td></tr>`}).join('');
 return`<div class="pkhero"><div class="sec-h"><div><div class="eyebrow">Dirigenza · ${B.lab}</div><h2>Scegli il pacchetto di gare</h2></div><span class="chip ${P.lvl===3?'u23':P.lvl===1?'red':''}">${esc(P.perf)}</span></div>
 ${DT(TH([['Pacchetto'],['Corse','r'],['Giorni','r'],['Costo','r'],['Terreni','hm'],['Corse principali','hs'],['Sponsor','r']]),rows)}
 <div class="note">Tocca un pacchetto per vedere le corse. Budget della dirigenza: ${eurk(P.budget)}.</div></div>`;
};
/* premi */
awardsGrid=function(list){return DT(TH([['Coppa'],['Corridore'],['Squadra','hm'],['Motivo','r']]),list.map(a=>{const A=AWARDS.find(x=>x[0]===a.k);return`<tr class="${a.me?'me':''}" data-act="rider" data-v="${a.id}"><td>${trophySvg(A[3],18)} <b>${A[1]}</b></td><td>${esc(a.name)}${a.me&&a.cash?` <span class="chip amber">+${eurk(a.cash)}</span>`:''}</td><td class="hm">${esc(a.team)}</td><td class="r tm">${esc(a.v)}</td></tr>`}).join(''))};
teamAwardsGrid=function(list){return DT(TH([['Coppa'],['Squadra'],['Motivo','r']]),list.map(a=>{const T=TAWARDS.find(x=>x[0]===a.k);return`<tr class="${a.me?'me':''}"><td>${trophySvg(T[3],18)} <b>${T[1]}</b></td><td>${esc(a.name)}${a.me?` <span class="chip amber">+${eurk(a.cash||T[4])}</span>`:''}</td><td class="r tm">${esc(a.v)}</td></tr>`}).join(''))};
/* guide: da riquadri a tabella Tema · Spiegazione */
function guideToTable(){
 const g=$('#sheet .guide');if(!g||g.dataset.tab)return;
 const rows=[...g.querySelectorAll(':scope > .card')].map(c=>{const h=c.querySelector('h3'),b=c.querySelector('.gtx')||c;return`<tr><td class="gk"><b>${h?h.innerHTML:''}</b></td><td class="gtx">${b.innerHTML}</td></tr>`}).join('');
 g.outerHTML=`<div class="card tbl dtw guide-t" data-tab="1"><table class="t dt gtab"><tr class="th"><td>Tema</td><td>Come funziona</td></tr>${rows}</table></div>`;
}
const _helpSheetT=helpSheet;helpSheet=function(){_helpSheetT();guideToTable()};
const _guideSheetT=guideSheet;guideSheet=function(){_guideSheetT();guideToTable()};
