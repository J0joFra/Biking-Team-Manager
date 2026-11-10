"use strict";
/* ============================================================
   STAFF TECNICO: ruoli, mercato, ingaggi ed effetti
   ============================================================ */
const STAFF_R={
 ds:{lab:'Direttore sportivo',ico:'flag',eff:'Tattica in corsa e inviti'},
 prep:{lab:'Preparatore',ico:'bolt',eff:'Allenamenti più efficaci'},
 med:{lab:'Medico',ico:'plus',eff:'Recupero e infortuni'},
 nutr:{lab:'Nutrizionista',ico:'clock',eff:'Energia in corsa'},
 mecc:{lab:'Capo meccanico',ico:'wind',eff:'Forature e guasti più brevi'},
 scout:{lab:'Osservatore',ico:'team',eff:'Talenti più forti alla scuola'},
 aero:{lab:'Tecnico crono',ico:'track',eff:'Posizione da cronometro'}
};
W_KEYS.push('staffT','staffPool','stInit');
function staffT(){return G.staffT||(G.staffT={})}
function stB(role){const s=staffT()[role];return s?clamp((s.q-35)/55,0,1.1):0}
function stSal(q){return Math.round((14000+Math.max(0,q-40)**2*28)*(G.side==='F'?0.75:1)/500)*500}
function genStaff(role,q){
 const nat=R()<0.6?'ITA':pick(Object.keys(NAMES)),N=NAMES[nat]||NAMES.ITA;
 q=Math.round(clamp(q??(42+R()*R()*50),35,95));
 return{id:'st'+(G.nextId++),name:(R()<0.25?pick(NAMES_F[nat]||NAMES_F.ITA):pick(N.f))+' '+pick(N.l),role,q,age:rint(30,64),nat,sal:stSal(q),cEnd:0};
}
function staffPool(){
 if(!G.staffPool||G.staffPool.s!==SEASON+'_'+(G.week>=24?2:1)){
  const list=[];for(const role of Object.keys(STAFF_R))for(let i=0;i<2;i++)list.push(genStaff(role));
  G.staffPool={s:SEASON+'_'+(G.week>=24?2:1),list};
 }
 return G.staffPool.list;
}
function staffInit(){if(G.stInit)return;G.stInit=true;G.staffT={};for(const r of ['ds','prep','med']){const s=genStaff(r,rint(42,52));s.cEnd=SEASON+1;G.staffT[r]=s}}
function staffCost(){return Object.values(staffT()).reduce((a,s)=>a+s.sal,0)}
function staffWants(s){return Math.max(0,s.q-38)} /* reputazione minima richiesta */
function staffHire(id,years){
 const pool=staffPool(),s=pool.find(x=>x.id===id);if(!s)return{ok:false,msg:'Non più disponibile'};
 if(G.rep<staffWants(s))return{ok:false,msg:`${s.name} vuole un club con reputazione almeno ${staffWants(s)}`};
 const cur=staffT()[s.role];let pay=0;
 if(cur){pay=staffRelease(cur);}
 s.cEnd=SEASON+years-1;if(years>=3)s.sal=Math.round(s.sal*0.93/500)*500;
 staffT()[s.role]=s;G.staffPool.list=pool.filter(x=>x!==s);
 addNews(`${STAFF_R[s.role].lab}: arriva ${s.name}`);save();
 return{ok:true,msg:`${s.name} è il nuovo ${STAFF_R[s.role].lab.toLowerCase()}${pay?` · buonuscita ${eurk(pay)}`:''}`};
}
function staffRelease(s){const rem=G.phase==='season'?remWeeks()/seasonWeeks():1;const pay=Math.round(s.sal*rem*0.5+(s.cEnd>SEASON?s.sal*0.3:0));G.cash-=pay;delete staffT()[s.role];return pay}
/* fine contratto a fine stagione */
const _newSeasonS=newSeason;
newSeason=function(up){const out=_newSeasonS(up);
 const go=(lab)=>{for(const k in staffT()){const s=staffT()[k];if(s.cEnd<SEASON){delete staffT()[k];out.push(`${lab}${STAFF_R[k].lab} ${s.name}: contratto scaduto`)}}};
 go('');if(G.other)withOther(()=>go(SIDE_LAB[G.side]+': '));
 return out};

/* ---------- effetti ---------- */
const _worldCostS=worldCost;
worldCost=function(){return _worldCostS()+staffCost()};
const _trainGrowthS=trainGrowth;
trainGrowth=function(r){return _trainGrowthS(r)*(1+0.3*stB('prep'))};
const _recRateS=recRate;
recRate=function(r,w){return _recRateS(r,w)*(r.team==='t0'?1+0.15*stB('med'):1)};
const _injureS=injure;
injure=function(r,weeks,from){if(r.team==='t0'&&R()<0.15*stB('med'))return;return _injureS(r,weeks,from)};
const _accessS=access;
access=function(race){const a=_accessS(race);if(a.ok&&a.mode==='invite')a.chance=clamp(a.chance+0.1*stB('ds'),0.03,0.95);return a};
const _createSimS=createSim;
createSim=function(ctx){
 const S=_createSimS(ctx),ds=stB('ds'),nu=stB('nutr');
 for(const x of S.riders)if(x.isMe){x.ftp*=1+0.012*ds;x.endF*=1-0.12*nu}
 S.meccB=stB('mecc');return S;
};
const _tickS=tick;
tick=function(S){
 _tickS(S);
 if(S.meccB)for(const x of S.byTeam.t0||[])if(x.stop>0&&!x.meccSeen){x.meccSeen=true;x.stop=Math.max(1,Math.round(x.stop*(1-0.5*S.meccB)))}else if(x.stop<=0)x.meccSeen=false;
};
const _intakeS=intake;
intake=function(){const got=_intakeS();const b=stB('scout');if(b)for(const r of got){r.pot=clamp(r.pot+0.12*b,0,1);r.wkg=+(r.wkg+0.04*b).toFixed(3)}return got};
const _weekTickS=weekTick;
weekTick=function(w){_weekTickS(w);const b=stB('aero');if(b)for(const r of ME().riders.map(RID))r.tt=Math.max(0.2*(r.f?SXF.tt:1),+(r.tt*(1-0.0002*b)).toFixed(4))};

/* ---------- interfaccia: Mercato › Staff ---------- */
let STF={role:'all',years:2};
function qBar(q){return`<div class="qb"><i style="width:${q}%"></i></div><b class="mono">${q}</b>`}
function staffView(){
 const T=staffT(),pool=staffPool().filter(s=>STF.role==='all'||s.role===STF.role).sort((a,b)=>b.q-a.q);
 const cur=Object.keys(STAFF_R).map(k=>{const s=T[k],R0=STAFF_R[k];return`<div class="card stc ${s?'':'empty'}">${ic(R0.ico,18)}<div class="stm"><small>${R0.lab}</small><b>${s?esc(s.name):'Posto libero'}</b><span>${R0.eff}</span></div>
  ${s?`<div class="stq">${qBar(s.q)}</div><div class="sts"><small>${eurk(s.sal)} · al ${s.cEnd}</small><button class="chip" data-act="stfire" data-v="${k}">Libera</button></div>`:`<button class="btn sm" data-act="strole" data-v="${k}">Cerca</button>`}</div>`}).join('');
 const cand=pool.map(s=>{const lock=G.rep<staffWants(s),cmp=T[s.role]?s.q-T[s.role].q:s.q;return`<div class="card stc cand">${ic(STAFF_R[s.role].ico,18)}<div class="stm"><small>${STAFF_R[s.role].lab} · ${s.age} anni</small><b>${esc(s.name)}</b><span class="${cmp>0?'up':'dn'}">${T[s.role]?(cmp>0?'+':'')+cmp+' sul tuo':'posto libero'}</span></div>
  <div class="stq">${qBar(s.q)}</div><div class="sts"><small>${eurk(Math.round(s.sal*(STF.years>=3?0.93:1)/500)*500)}/anno</small><button class="btn sm ${lock?'':'primary'}" data-act="sthire" data-v="${s.id}" ${lock?'disabled':''}>${lock?ic('lock',13)+' Rep. '+staffWants(s):'Ingaggia'}</button></div></div>`}).join('');
 return`<div class="sec"><div class="sec-h"><h2>Il tuo staff</h2><span class="eyebrow">${eurk(staffCost())}/anno</span></div><div class="stgrid">${cur}</div></div>
 <div class="sec"><div class="sec-h"><h2>Sul mercato</h2><div class="seg sm stdur">${[1,2,3].map(y=>`<button data-act="styears" data-v="${y}" aria-pressed="${STF.years===y}">${y} ${y>1?'anni':'anno'}</button>`).join('')}</div></div>
  <div class="chips" style="margin-bottom:8px">${[['all','Tutti'],...Object.entries(STAFF_R).map(([k,v])=>[k,v.lab])].map(([k,l])=>`<button class="fchip" data-act="strole" data-v="${k}" aria-pressed="${STF.role===k}">${l}</button>`).join('')}</div>
  <div class="stgrid">${cand||'<div class="note">Nessun candidato: nuovi nomi a giugno e a inizio stagione.</div>'}</div></div>`;
}
const _renderMarketS=renderMarket;
renderMarket=function(){
 _renderMarketS();
 const seg=$('#view .seg[class="seg"]')||[...document.querySelectorAll('#view .seg')].find(s=>s.querySelector('[data-act="mksub"]'));
 if(seg&&!seg.querySelector('[data-v="staff"]'))seg.insertAdjacentHTML('beforeend',`<button data-act="mksub" data-v="staff" aria-pressed="${G.mk.sub==='staff'}">Staff</button>`);
 if(G.mk.sub==='staff'){const secs=document.querySelectorAll('#view > .sec');const last=secs[secs.length-1];if(last){[...last.children].forEach(c=>{if(!c.matches('.seg'))c.remove()});last.insertAdjacentHTML('beforeend',staffView())}}
};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!G)return;const a=t.dataset.act,v=t.dataset.v;
 if(a==='strole'){STF.role=v;G.mk.sub='staff';renderMarket()}
 else if(a==='styears'){STF.years=+v;renderMarket()}
 else if(a==='sthire'){const r=staffHire(v,STF.years);toast(r.msg,r.ok?'gold':'bad');renderMarket();renderTop()}
 else if(a==='stfire'){const s=staffT()[v];if(s){const p=staffRelease(s);toast(`${s.name} liberato · ${eurk(p)}`,'');save();renderMarket();renderTop()}}
});
if(G){staffInit();if(G.other)withOther(staffInit)}
const _newGameS=newGame;
newGame=function(...a){_newGameS(...a);staffInit();save()};
const _foundOtherS=foundOther;
foundOther=function(){const r=_foundOtherS();if(r.ok){withOther(staffInit);save()}return r};
