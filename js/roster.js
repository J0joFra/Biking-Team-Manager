"use strict";
/* ============================================================
   SQUADRA: ruoli e gerarchie, prospetti per il futuro, rosa
   ============================================================ */
const ROLES={cap:{lab:'Capitano',desc:'Corre per vincere: la squadra lavora per lui'},luog:{lab:'Luogotenente',desc:'Vice capitano: ultimo uomo in salita o in volata, piano B'},free:{lab:'Cacciatore di tappe',desc:'Libero di andare in fuga e giocarsi le sue occasioni'},greg:{lab:'Gregario',desc:'Lavora per i capitani: tira, chiude, porta borracce'},svil:{lab:'In sviluppo',desc:'Giovane da far crescere: corre per imparare, soprattutto tra gli Under 23'}};
const ROLE_ORD=['cap','luog','free','greg','svil'];
const SPEC={gt:'Corse a tappe',salita:'Salita',classiche:'Classiche',volate:'Volate',crono:'Cronometro'};
const SPEC_TYPE={gt:'montagna',salita:'montagna',classiche:'pave',volate:'piatta',crono:'crono'};
function bestSpec(r){
 const s=stats(r),c={salita:suitType(r,'montagna'),classiche:Math.max(suitType(r,'pave'),suitType(r,'collinare')),volate:suitType(r,'piatta'),crono:s.cro};
 let k=Object.keys(c).sort((a,b)=>c[b]-c[a])[0];
 if(k==='salita'&&s.res>=72&&s.cro>=55)k='gt';
 return k;
}
function specScore(r,k){return Math.round(k==='gt'?(suitType(r,'montagna')*0.7+stats(r).cro*0.15+stats(r).res*0.15):k==='classiche'?Math.max(suitType(r,'pave'),suitType(r,'collinare')):suitType(r,SPEC_TYPE[k]))}
function autoRoles(){
 const rs=ME().riders.map(RID).filter(r=>!r.role).sort((a,b)=>ovr(b)-ovr(a));
 const all=ME().riders.map(RID).sort((a,b)=>ovr(b)-ovr(a));
 for(const r of rs){
  const i=all.indexOf(r);
  r.spec=r.spec||bestSpec(r);
  r.role=i<3?'cap':i<6?'luog':(r.age<=21&&r.pot>=0.45)?'svil':ovr(r)>=ovr(all[Math.min(all.length-1,7)])?'free':'greg';
  if(r.role==='greg'&&r.age<=21&&r.pot>=0.35)r.role='svil';
 }
}
function projOvr(r){const o=ovr(r);if(r.age<=26){let g=0;for(let a=r.age;a<=26;a++)g+=AGE_STEP[a]||0;return Math.min(94,Math.round(o+g*(0.5+(r.pot||0))*30*(o>70?0.6:1)))}if(r.age>=31)return Math.max(30,Math.round(o-(r.age-30)*1.6));return o}
function trend(r){const p=projOvr(r),o=ovr(r);return p>o+2?{t:`→ ${p}`,c:'up',l:'in crescita'}:p<o-2?{t:`→ ${p}`,c:'down',l:'in calo'}:{t:'',c:'flat',l:'al massimo'}}
function raceSpec(race){
 const ts=race.stages.map(s=>s.t);
 if(ts.length>=5&&ts.includes('montagna'))return'gt';
 const c={salita:0,classiche:0,volate:0,crono:0};
 for(const t of ts){if(t==='montagna')c.salita++;else if(['collinare','pave','roubaix','sterrato','mossa'].includes(t))c.classiche++;else if(t==='piatta'||t==='circuito')c.volate++;else c.crono++}
 return Object.keys(c).sort((a,b)=>c[b]-c[a])[0];
}
function roleBonus(r,race){
 const sp=raceSpec(race),u23=race.tier==='u23'||race.flag==='u23';
 return r.role==='cap'?(r.spec===sp?22:6):r.role==='luog'?(r.spec===sp?12:6):r.role==='free'?4:r.role==='svil'?(u23?10:-4):0;
}
function keyStats(r){const s=stats(r);return[['SAL',s.sal],['PIA',s.pia],['CRO',s.cro],['VOL',s.vol],['RES',s.res]].sort((a,b)=>b[1]-a[1]).slice(0,3)}
function rcard(r,opts={}){
 const c=condOf(r),tr=trend(r);
 const flags=[];
 if(injured(r))flags.push(`<span class="chip red">Infortunato</span>`);
 else if(inCamp(r,G.week,G.week))flags.push('<span class="chip amber">In altura</span>');
 if(recDays(r))flags.push(`<span class="chip">Recupero ${recDays(r)} gg</span>`);
 if(r.cEnd===SEASON&&!r.renewed&&!r.leavingTo)flags.push('<span class="chip red">Contratto in scadenza</span>');
 if(r.leavingTo)flags.push(`<span class="chip red">Va a ${esc(TEAM(r.leavingTo).short)}</span>`);
 if(r.listed)flags.push('<span class="chip amber">Sul mercato</span>');
 if(moodOf(r)<35)flags.push('<span class="chip red">Scontento</span>');
 if(r.natB&&r.natB[1]>=G.week)flags.push('<span class="chip amber">In nazionale</span>');
 if((r.titles||[]).length)flags.push(`<span class="chip amber">${esc(r.titles[r.titles.length-1].split(' ').slice(0,3).join(' '))}</span>`);
 return`<button class="card rc ${opts.big?'big':''}" data-act="rider" data-v="${r.id}">
  <div class="ovr ${ovr(r)>=75?'hi':''}">${ovr(r)}${tr.t&&opts.trend?`<small class="tr ${tr.c}">${tr.t}</small>`:''}</div>
  <div class="rcm"><div class="nm">${esc(r.name)}</div>
   <div class="tags">${(r.role==='cap'||r.role==='luog')&&r.spec?`<span class="chip spec">${SPEC[r.spec]}</span>`:''}<span class="chip ${r.age<=22?'u23':''}">${catOf(r)}</span><span>${ARCH[r.arch].lab} · ${r.age} anni</span></div>
   <div class="kst">${keyStats(r).map(([k,v])=>`<span><b>${v}</b> ${k}</span>`).join('')}</div>
   ${flags.length?`<div class="tags">${flags.join('')}</div>`:''}</div>
  <div class="rcr"><span class="cond" style="--c:${c.c}">${c.t}</span><small>${r.days} gg · ${r.wins} V</small></div>
 </button>`;
}
function coverage(){
 const rs=ME().riders.map(RID).filter(r=>!injured(r));
 return Object.keys(SPEC).map(k=>{const best=rs.map(r=>({r,v:specScore(r,k)})).sort((a,b)=>b.v-a.v)[0];return{k,best}});
}
function renderTeam(){
 autoRoles();
 const rs=ME().riders.map(RID),v=G.teamView||'ruoli',ms=mainSponsor();
 const head=`<div class="teamhead">${myJersey(46)}<div style="min-width:0"><div class="eyebrow">Nome ufficiale ${SEASON} · ${myCat().lab} · ${esc(G.sede.city)}</div><h2 class="teamname">${ms?`<span class="msp">${esc(ms.name)}</span> `:''}${esc(G.name)}</h2></div></div>
 <div class="kv kv4"><div><small>Corridori</small><b>${rs.length}/${myCat().max}</b></div><div><small>Età media</small><b>${(rs.reduce((a,r)=>a+r.age,0)/rs.length).toFixed(1)}</b></div><div><small>Monte ingaggi</small><b>${eurk(payroll())}</b></div><div><small>Vittorie</small><b>${rs.reduce((a,r)=>a+r.wins,0)}</b></div></div>
 <div class="seg teamseg">${[['ruoli','Ruoli'],['gruppi','Gruppi'],['futuro','Prospetti'],['rosa','Rosa']].map(([k,l])=>`<button data-act="teamview" data-v="${k}" aria-pressed="${v===k}">${l}</button>`).join('')}</div>`;
 let body='';
 if(v==='palm')body=renderTeamPalm();
 else if(v==='gruppi')body=renderGroups();
 else if(v==='allen')body=trainCard()+(G.camps.length?`<div class="sec-h" style="margin-top:12px"><h3>Ritiri in altura</h3><button class="chip" data-act="tab" data-v="base">Club ›</button></div>`:'');
 else if(v==='ruoli'){
  const cov=coverage();
  body=`<div class="card pad"><div class="sec-h" style="margin-bottom:6px"><h3>Copertura dei terreni</h3><span class="eyebrow">il migliore per ogni specialità</span></div>
   ${covTable(cov)}

   ${cov.filter(c=>c.best.v<60).length?`<div class="note">Punti deboli: ${cov.filter(c=>c.best.v<60).map(c=>SPEC[c.k].toLowerCase()).join(', ')}. Cerca rinforzi sul mercato o fai crescere un giovane.</div>`:''}</div>
  ${ROLE_ORD.map(k=>{const g=rs.filter(r=>r.role===k).sort((a,b)=>ovr(b)-ovr(a));
   return`<div class="sec rolesec"><div class="sec-h"><h2>${ROLES[k].lab} <span class="cnt2">${g.length}</span></h2><span class="note">${ROLES[k].desc}</span></div>
   ${g.length?riderTable(g):`<div class="note">Nessuno. Tocca un corridore per cambiargli ruolo.</div>`}</div>`}).join('')}
  <div class="note">I ruoli guidano la proposta di convocazione e la scelta del capitano: per ogni corsa viene proposto il capitano con la specialità giusta. Cambia ruolo e specialità dalla scheda del corridore.</div>`;
 }else if(v==='futuro'){
  const js=acadJuniors(),inc=incoming();
  const pros=rs.slice().sort((a,b)=>projOvr(b)-projOvr(a));
  const leaving=rs.filter(r=>r.leavingTo||(r.cEnd===SEASON&&!r.renewed));
  const toElite=rs.filter(r=>r.age===22);
  const young=rs.filter(r=>r.age<=24).sort((a,b)=>projOvr(b)-projOvr(a));
  body=`<div class="futgrid"><div class="col">
   <div class="card pad"><div class="sec-h"><h3>I talenti</h3><span class="eyebrow">valore oggi → stimato a 27 anni (il picco)</span></div>
    ${young.length?DT(TH([['Corridore'],['Età','r'],['Pot.'],['Oggi','r'],['A 27','r'],['Contratto','r hs']]),young.map(r=>{const p=projOvr(r);return`<tr data-act="rider" data-v="${r.id}"><td><b>${esc(r.name)}</b><div class="tm">${ARCH[r.arch].lab}</div></td><td class="r">${r.age}</td><td class="stars">${'★'.repeat(1+Math.round((r.pot||0)*4))}</td><td class="r">${ovr(r)}</td><td class="r"><b class="pos">${p}</b></td><td class="r hs ${r.cEnd<=SEASON+1&&!r.renewed?'neg':''}">${r.cEnd}</td></tr>`}).join('')):'<div class="note">Nessun giovane in rosa.</div>'}
   </div>
   ${js.length?`<div class="card pad"><div class="sec-h"><h3>Scuola juniores</h3><span class="eyebrow">${js.length} ragazzi</span></div>${js.sort((a,b)=>projOvr(b)-projOvr(a)).map(r=>`<button class="prow" data-act="rider" data-v="${r.id}"><span class="nm">${esc(r.name)}</span><span class="muted">${r.age} anni · ${ARCH[r.arch].lab}</span><span class="stars">${'★'.repeat(1+Math.round((r.pot||0)*4))}</span><span class="pv"><b>${ovr(r)}</b> → <b class="up">${projOvr(r)}</b></span></button>`).join('')}</div>`:''}
  </div><div class="col">
   <div class="card pad stack"><div class="sec-h" style="margin:0"><h3>Stagione ${SEASON+1}</h3><span class="eyebrow">rosa prevista ${nextRoster()}/${myCat().max}</span></div>
    ${leaving.length?`<div><div class="eyebrow">In uscita</div>${leaving.map(r=>`<div class="note">• ${esc(r.name)} — ${r.leavingTo?'ha firmato con '+esc(TEAM(r.leavingTo).name):'contratto in scadenza, da rinnovare'}</div>`).join('')}</div>`:''}
    ${inc.length?`<div><div class="eyebrow">In arrivo</div>${inc.map(r=>`<div class="note">• ${esc(r.name)} (${ARCH[r.arch].lab}, ${r.age+1} anni)</div>`).join('')}</div>`:''}
    ${toElite.length?`<div><div class="eyebrow">Passano Elite</div>${toElite.map(r=>`<div class="note">• ${esc(r.name)}: dal ${SEASON+1} non potrà più correre le gare Under 23</div>`).join('')}</div>`:''}
    ${!leaving.length&&!inc.length&&!toElite.length?'<div class="note">Nessun cambiamento previsto.</div>':''}
   </div>
   <div class="card pad"><div class="sec-h"><h3>Tutta la rosa nel tempo</h3><span class="eyebrow">ordinata per potenziale</span></div>
    <table class="t">${pros.map(r=>{const tr=trend(r);return`<tr><td>${esc(r.name)} <span class="tm">${r.age} anni · ${ROLES[r.role]?ROLES[r.role].lab:''}</span></td><td class="r">${ovr(r)}</td><td class="r"><span class="trd ${tr.c}">${tr.l}</span></td><td class="r">${projOvr(r)}</td></tr>`}).join('')}</table></div>
  </div></div>`;
 }else{
  const u=rs.filter(r=>r.age<=22).sort((a,b)=>ovr(b)-ovr(a)),e=rs.filter(r=>r.age>22).sort((a,b)=>ovr(b)-ovr(a));
  body=`<div class="note" style="margin-bottom:8px">SAL salita · PIA pianura · CRO cronometro · VOL volata · RES resistenza. Programma consigliato 50–70 giorni di corsa.</div>
  <div class="sec"><div class="sec-h"><h2>Under 23</h2><span class="eyebrow">19–22 anni</span></div>${riderTable(u,{trend:true})}</div>
  <div class="sec"><div class="sec-h"><h2>Elite</h2><span class="eyebrow">23 anni e oltre</span></div>${riderTable(e,{trend:true})}</div>`;
 }
 $('#view').innerHTML=head+body;
}
function roleBlock(r){
 if(r.team!=='t0')return'';
 if(!r.role)autoRoles();
 return`<div class="card pad stack"><div class="eyebrow">Ruolo in squadra</div>
  <div class="rolepick">${ROLE_ORD.map(k=>`<button data-act="setrole" data-id="${r.id}" data-v="${k}" aria-pressed="${r.role===k}">${ROLES[k].lab}</button>`).join('')}</div>
  <div class="note">${ROLES[r.role].desc}.${r.promise==='cap'&&r.role!=='cap'?' Attenzione: gli hai promesso il ruolo di capitano.':''}</div>
  <label class="field"><span class="eyebrow">Specialità</span><select data-spec="${r.id}">${Object.keys(SPEC).map(k=>`<option value="${k}" ${r.spec===k?'selected':''}>${SPEC[k]} · ${specScore(r,k)}</option>`).join('')}</select></label></div>`;
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 const a=t.dataset.act;
 if(a==='teamview'){G.teamView=t.dataset.v;save();renderTeam();window.scrollTo(0,0)}
 else if(a==='setrole'){const r=RID(t.dataset.id);r.role=t.dataset.v;if(r.role==='cap'&&r.promise==='cap')r.mood=Math.min(100,moodOf(r)+3);save();riderSheet(r.id)}
});
document.addEventListener('change',e=>{
 const t=e.target;if(!t.dataset.spec)return;
 const r=RID(t.dataset.spec);r.spec=t.value;save();toast('Specialità aggiornata','ok');
});
