"use strict";
/* ============================================================
   GRUPPI: la rosa divisa in 2-3 sotto-squadre, ognuna con la sua
   specialità, per correre più gare nella stessa settimana
   ============================================================ */
const GSPEC={gt:'Grandi giri',salita:'Salita',classiche:'Classiche',volate:'Volate',crono:'Cronometro',pista:'Pista',misto:'Misto / giovani'};
const GIDS=['A','B','C'];
const GDEF={A:{name:'Squadra A',spec:'gt'},B:{name:'Squadra B',spec:'classiche'},C:{name:'Squadra C',spec:'volate'}};
function groups(){return G.groups||(G.groups=[])}
function grp(id){return groups().find(g=>g.id===id)}
function gScore(r,spec){return spec==='pista'?Math.round(trackScore(r,'ip')*0.5+trackScore(r,'sc')*0.5):spec==='misto'?ovr(r)+(r.age<=23?6:0):specScore(r,spec)}
function setGroups(n){
 const cur=groups();
 G.groups=GIDS.slice(0,n).map(id=>cur.find(g=>g.id===id)||{id,...GDEF[id]});
 for(const r of ME().riders.map(RID))if(r.grp&&!grp(r.grp))r.grp=null;
 if(n&&!ME().riders.map(RID).some(r=>r.grp))autoGroups();
 save();
}
/* distribuzione automatica: ognuno nel gruppo dove rende di più, gruppi equilibrati */
function autoGroups(){
 const gs=groups();if(!gs.length)return;
 const left=ME().riders.map(RID);
 /* scelta a turno: ogni gruppo prende chi rende di più nella sua specialità rispetto alle altre */
 const rel=(r,g)=>gScore(r,g.spec)*1.5-gs.filter(x=>x!==g).reduce((a,x)=>a+gScore(r,x.spec),0)/Math.max(1,gs.length-1)*0.5+ovr(r)*0.3;
 let turn=0;
 while(left.length){const g=gs[turn%gs.length];left.sort((a,b)=>rel(b,g)-rel(a,g));left.shift().grp=g.id;turn++}
 save();
}
/* gruppo che corre una certa gara: scelto a mano o in base al terreno */
function raceGroup(race){
 const gs=groups();if(!gs.length)return null;
 if(race.grp==='all')return null;
 if(race.grp&&grp(race.grp))return race.grp;
 /* gare sovrapposte: la più importante sceglie per prima il gruppo adatto, le altre prendono i gruppi liberi */
 const ov=G.races.filter(r=>r===race||(r.status==='reg'&&r.tier!=='naz'&&r.w<=race.w+race.dur-1&&r.w+r.dur-1>=race.w));
 if(!ov.includes(race))ov.push(race);
 ov.sort((a,b)=>(a.grp?0:1)-(b.grp?0:1)||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]||b.stages.length-a.stages.length||(a.id<b.id?-1:1));
 const taken=new Set();
 for(const r of ov){
  let g=null;
  if(r.grp&&r!==race){if(grp(r.grp))taken.add(r.grp);continue}
  const sp=r.tier==='track'?'pista':raceSpec(r);
  const alt={gt:['gt','salita'],salita:['salita','gt'],classiche:['classiche','misto'],volate:['volate','misto'],crono:['crono','gt'],pista:['pista','crono','volate']}[sp]||[sp];
  for(const k of alt){const x=gs.find(y=>y.spec===k&&!taken.has(y.id));if(x){g=x.id;break}}
  if(!g){const x=gs.find(y=>!taken.has(y.id));g=x?x.id:(gs.find(y=>alt.includes(y.spec))||gs[0]).id}
  taken.add(g);if(r===race)return g;
 }
 return gs[0].id;
}
function gBonus(r,race){const g=raceGroup(race);if(!g)return 0;return r.grp===g?30:!r.grp?0:-60}
function gChip(id){return id?`<span class="gchip g${id}">${id}</span>`:''}

/* ---------- convocazioni ---------- */
const _suggestG=suggest;
suggest=function(){
 const race=SEL.race;
 if(!raceGroup(race))return _suggestG();
 const el=ME().riders.map(RID).filter(r=>!whyCant(r,race));
 autoRoles();
 const sc=el.map(r=>({r,s:avgSuit(r,race)-r.fat*0.45-(r.days>65?12:0)+altEff(r,race.w)*300+roleBonus(r,race)+gBonus(r,race)})).sort((a,b)=>b.s-a.s);
 const pickd=sc.slice(0,selSize(race)).map(o=>o.r);
 SEL.ids=new Set(pickd.map(r=>r.id));
 const sp=raceSpec(race),by=(a,b)=>avgSuit(b,race)-avgSuit(a,race);
 const capC=pickd.filter(r=>r.role==='cap'&&r.spec===sp).sort(by)[0]||pickd.filter(r=>r.role==='cap').sort(by)[0]||pickd.slice().sort(by)[0];
 SEL.cap=capC?capC.id:null;
};
function grpRow(race){
 const gs=groups();if(!gs.length)return'';
 const cur=race.grp||'auto',sv=race.grp;race.grp=null;const auto=raceGroup(race);race.grp=sv;
 return`<div class="grow"><span class="eyebrow">Chi corre</span><div class="chips">${[['auto',`Automatico${auto?' ('+auto+')':''}`],...gs.map(g=>[g.id,`${g.id} · ${g.name}`]),['all','Tutta la rosa']].map(([k,l])=>`<button class="fchip" data-act="racegrp" data-r="${race.id}" data-v="${k}" aria-pressed="${cur===k}">${esc(l)}</button>`).join('')}</div></div>`;
}
const _renderConvocaG=renderConvoca;
renderConvoca=function(){
 _renderConvocaG();
 const race=SEL.race;if(!groups().length)return;
 const w=$('#sheet .pb .wrap');if(w)w.insertAdjacentHTML('afterbegin',grpRow(race)+'<div class="note" style="margin:-4px 0 8px">La proposta del DS pesca dal gruppo scelto; i corridori senza gruppo sono jolly e possono correre ovunque.</div>');
 for(const r of ME().riders.map(RID)){const el=document.querySelector(`#sheet label[for="p_${r.id}"] .nm`);if(el&&r.grp)el.insertAdjacentHTML('afterbegin',gChip(r.grp)+' ')}
};
/* pista: preferisce il gruppo pista */
const _trackConvocaG=trackConvoca;
trackConvoca=function(race){
 _trackConvocaG(race);const g=raceGroup(race);if(!g)return;
 const rs=ME().riders.map(RID).filter(r=>!whyCant(r,race));
 for(const k of race.disc){const n=k==='tp'?4:1;TSEL.sel[k]=rs.slice().sort((a,b)=>trackScore(b,k)+(b.grp===g?25:0)-trackScore(a,k)-(a.grp===g?25:0)).slice(0,rs.length>=n?n:0).map(r=>r.id)}
 renderTrackConv();
};

/* ---------- calendario e scheda corsa ---------- */
const _raceChipsG=raceChips;
raceChips=function(r){const h=_raceChipsG(r);if(r.status!=='reg'||!groups().length)return h;const g=raceGroup(r);return(g?`<span class="gchip g${g}" title="Gruppo ${g}">${g}</span>`:'<span class="chip">Tutti</span>')+h};
const _raceSheetG=raceSheet;
raceSheet=function(id){
 _raceSheetG(id);
 const r=G.races.find(x=>x.id===id);if(!r||r.status!=='reg'||!groups().length)return;
 const side=$('#sheet .rsside');if(!side)return;
 const same=G.races.filter(x=>x!==r&&x.status==='reg'&&x.w<=r.w+r.dur-1&&x.w+x.dur-1>=r.w);
 side.insertAdjacentHTML('beforeend',`<div class="card pad stack">${grpRow(r)}${same.length?`<div class="note">Nello stesso periodo corri anche: ${same.map(x=>`${esc(x.name)} (${raceGroup(x)?'gruppo '+raceGroup(x):'tutta la rosa'})`).join(' · ')}.</div>`:''}</div>`);
};

/* ---------- vista Gruppi nella scheda Squadra ---------- */
function renderGroups(){
 const gs=groups(),rs=ME().riders.map(RID).sort((a,b)=>ovr(b)-ovr(a));
 const head=`<div class="card pad stack"><div class="sec-h" style="margin:0"><h3>Sotto-squadre</h3><span class="eyebrow">per correre più gare insieme</span></div>
  <div class="note">Dividi la rosa in 2 o 3 gruppi, ognuno con la sua specialità. Quando due corse cadono nella stessa settimana, ogni gruppo va alla sua: le convocazioni pescano dal gruppo giusto in automatico. Puoi cambiare il gruppo di una singola corsa dalla sua scheda.</div>
  <div class="seg">${[[0,'Nessuna divisione'],[2,'2 gruppi'],[3,'3 gruppi']].map(([n,l])=>`<button data-act="gcount" data-v="${n}" aria-pressed="${gs.length===n}">${l}</button>`).join('')}</div></div>`;
 if(!gs.length)return head;
 const jolly=rs.filter(r=>!r.grp);
 const card=g=>{const m=rs.filter(r=>r.grp===g.id);const up=G.races.filter(r=>r.status==='reg'&&r.w>=G.week&&raceGroup(r)===g.id).sort((a,b)=>a.w-b.w).slice(0,3);
  return`<div class="card pad stack gcard g${g.id}"><div class="ghead">${gChip(g.id)}<input class="gname" data-gname="${g.id}" value="${esc(g.name)}" maxlength="24" aria-label="Nome del gruppo ${g.id}"><span class="eyebrow">${m.length} corridori</span></div>
   <label class="field"><span class="eyebrow">Specialità</span><select data-gspec="${g.id}">${Object.keys(GSPEC).map(k=>`<option value="${k}" ${g.spec===k?'selected':''}>${GSPEC[k]}</option>`).join('')}</select></label>
   <div class="gm">${m.map(r=>gRiderRow(r,g.spec)).join('')||'<div class="note">Nessun corridore.</div>'}</div>
   ${up.length?`<div class="note">Prossime: ${up.map(r=>`${esc(r.name)} (sett. ${r.w})`).join(' · ')}</div>`:''}</div>`};
 return head+`<div class="row" style="margin:10px 0"><button class="btn" data-act="gauto">Distribuisci in automatico</button><span class="note">Tocca le lettere accanto a un corridore per spostarlo.</span></div>
  <div class="ggrid">${gs.map(card).join('')}</div>
  ${jolly.length?`<div class="card pad stack" style="margin-top:12px"><div class="sec-h" style="margin:0"><h3>Jolly</h3><span class="eyebrow">senza gruppo · corrono ovunque</span></div><div class="gm">${jolly.map(r=>gRiderRow(r,null)).join('')}</div></div>`:''}`;
}
function gRiderRow(r,spec){
 return`<div class="grr"><button class="gnm" data-act="rider" data-v="${r.id}"><b>${esc(r.name)}</b><small>${ARCH[r.arch].lab} · ${r.age} anni${r.role?' · '+ROLES[r.role].lab:''}</small></button>${spec?`<span class="mono gsc" title="Rendimento nella specialità">${gScore(r,spec)}</span>`:''}
  <div class="gsw">${groups().map(g=>`<button data-act="gset" data-id="${r.id}" data-v="${g.id}" aria-pressed="${r.grp===g.id}" aria-label="Sposta nel gruppo ${g.id}">${g.id}</button>`).join('')}<button data-act="gset" data-id="${r.id}" data-v="" aria-pressed="${!r.grp}" aria-label="Jolly">J</button></div></div>`;
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!G)return;
 const a=t.dataset.act,v=t.dataset.v;
 if(a==='gcount'){setGroups(+v);renderTeam()}
 else if(a==='gauto'){autoGroups();renderTeam();toast('Gruppi ridistribuiti','ok')}
 else if(a==='gset'){const r=RID(t.dataset.id);r.grp=v||null;save();const y=window.scrollY;renderTeam();window.scrollTo(0,y)}
 else if(a==='racegrp'){const r=G.races.find(x=>x.id===t.dataset.r);r.grp=v==='auto'?null:v;save();
  if(SEL&&SEL.race===r&&$('#sheet .t.dt.conv')){suggest();renderConvoca()}else{raceSheet(r.id);if(G.tab==='cal')renderCal()}}
});
document.addEventListener('change',e=>{
 const t=e.target;if(!G)return;
 if(t.dataset.gspec){grp(t.dataset.gspec).spec=t.value;save();renderTeam()}
 else if(t.dataset.gname){grp(t.dataset.gname).name=t.value.trim()||GDEF[t.dataset.gname].name;save()}
});
