"use strict";
/* ============================================================
   CLUB: pacchetti di gare della dirigenza, traguardi, centro
   sportivo, posta essenziale, testi brevi
   ============================================================ */
function club(){return G.club||(G.club={ach:{},spMul:1,fac:{gym:0,med:0,wind:0,velo:0,mkt:0},build:null,wins:0})}
W_KEYS.push('pk');
Object.assign(ICON,{flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',plus:'<path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/>',clock:'<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',wind:'<path d="M3 9h11a3 3 0 1 0-3-3M3 15h15a3 3 0 1 1-3 3M3 12h8"/>',track:'<rect x="3" y="7" width="18" height="10" rx="5"/><rect x="7" y="10" width="10" height="4" rx="2"/>'});

/* ---------- PACCHETTI DI GARE ---------- */
const BLOCKS=[{from:5,to:23,lab:'Febbraio – giugno'},{from:24,to:42,lab:'Giugno – ottobre'}];
const TRK={c2:1,u23:1,crit:1,track:1,nc:2,c1:2,pro:3,uwt1:4,uwt2:4,mon:5,gt:6};
const PK_STYLE={
 terr:{name:'Territorio',ico:'pin',sub:'Corse vicine ed economiche, care agli sponsor locali'},
 fit:{name:'Su misura',ico:'team',sub:'Le corse adatte ai tuoi corridori'},
 amb:{name:'Ambizioso',ico:'rank',sub:'Corse di classe alta: costa, ma dà visibilità'},
 ril:{name:'Rilancio',ico:'flag',sub:'Corse minori dove si può vincere e ritrovare fiducia'}
};
function blockNow(){for(let i=BLOCKS.length-1;i>=0;i--){const B=BLOCKS[i];if(G.week<=B.to&&G.week>=B.from-2)return i}return -1}
function teamFit(race,ros){
 return race.stages.reduce((a,s)=>{const v=ros.map(r=>suitType(r,s.t)).sort((x,y)=>y-x).slice(0,3);return a+v.reduce((p,q)=>p+q,0)/Math.max(1,v.length)},0)/race.stages.length;
}
function objHit(race){
 const reg=RACE_REG[race.name];let n=0;
 for(const c of G.contracts.filter(c=>activeIn(c,SEASON)&&!c.done)){const k=c.obj.k;
  if(k==='reg_'+reg||k==='ctry_'+race.ctry||(k==='ita'&&race.ctry==='ITA')||(k==='wt'&&['gt','mon','uwt1','uwt2'].includes(race.tier)))n++}
 return n;
}
function perfEval(){
 const n=teamRanking(G.cat).length||1;
 if(G.week<=6){const h=(G.history||[])[G.history.length-1];if(!h)return{lvl:2,rk:0,gain:null,lab:'Prima stagione'};const l=h.rank<=Math.ceil(n/4)?3:h.rank<=Math.ceil(n/2)?2:1;return{lvl:l,rk:h.rank,gain:null,lab:['','Stagione scorsa deludente','Stagione scorsa nella media','Ottima stagione scorsa'][l]}}
 const rk=myCatRank();
 const gain=G.pk&&G.pk.s===SEASON?teamPoints(ME())-(G.pk.pts0||0):null;
 const lvl=rk<=Math.ceil(n/4)?3:rk<=Math.ceil(n/2)?2:1;
 return{lvl,rk,gain,lab:['','Prestazioni deboli','Prestazioni nella media','Ottime prestazioni'][lvl]};
}
function pkgBudget(){return Math.round(clamp(projected()*0.5,25000,3000000)+25000)}
function pkgBuild(bi){
 const B=BLOCKS[bi],ros=ME().riders.map(RID),u23=ros.filter(r=>r.age<=22).length,P=perfEval(),lim=pkgBudget();
 const cap=ros.length>=13?2:1,weeks=B.to-Math.max(B.from,G.week)+1;
 const cand=G.races.filter(r=>r.w>=Math.max(B.from,G.week)&&r.w<=B.to&&r.status==='open'&&!['jun','naz'].includes(r.tier)).map(r=>{
  const a=access(r);if(!a.ok)return null;
  if((r.tier==='u23'||r.flag==='u23')&&u23<4)return null;
  if(r.tier==='nc'&&!ros.some(x=>x.nat==='ITA'))return null;
  return{r,a,fee:feeOf(r),tr:TRK[r.tier]||1,fit:teamFit(r,ros),loc:RACE_REG[r.name]===G.sede.reg,ita:r.ctry==='ITA',obj:objHit(r)};
 }).filter(Boolean);
 const styles=['terr','fit',P.lvl>=2?'amb':'ril'];
 return styles.map(k=>{
  const inv=k==='amb'?(P.lvl===3?0.1:0.2):0.6;
  const score=c=>k==='terr'?(c.ita?2:0)+(c.loc?3:0)+c.obj*2-c.fee/5000-c.tr*0.4+(c.r.tier==='nc'?5:0)
   :k==='fit'?c.fit/10+c.obj+c.tr*0.4-c.fee/15000+(c.r.tier==='nc'?5:0)
   :k==='amb'?c.tr*2+c.fit/20-c.fee/50000
   :-c.tr*1.2-c.fee/8000+c.fit/25+(c.r.tier==='nc'?5:0);
  const n=Math.max(4,Math.round(weeks*({terr:0.45,fit:0.6,amb:0.7,ril:0.55}[k])));
  const share={terr:0.45,fit:0.75,amb:1.2,ril:0.4}[k]*lim;
  const pool=cand.filter(c=>c.a.mode!=='invite'||c.a.chance>=inv).map(c=>({...c,s:score(c)+rnd(0,1.5)})).sort((a,b)=>b.s-a.s);
  const used={},pick=[];let cost=0;
  for(const c of pool){
   if(pick.length>=n)break;
   const ws=[];for(let w=c.r.w;w<c.r.w+c.r.dur;w++)ws.push(w);
   if(ws.some(w=>(used[w]||0)>=cap))continue;
   if(cost+c.fee>share&&pick.length>=3)continue;
   pick.push(c);cost+=c.fee;for(const w of ws)used[w]=(used[w]||0)+1;
  }
  pick.sort((a,b)=>a.r.w-b.r.w);
  const mix={crono:0,volate:0,classiche:0,salita:0};
  for(const c of pick){const sp=raceSpec(c.r);mix[sp==='gt'||sp==='salita'?'salita':sp]=(mix[sp==='gt'||sp==='salita'?'salita':sp]||0)+1}
  return{k,races:pick.map(c=>c.r.id),cost,days:pick.reduce((a,c)=>a+c.r.stages.length,0),obj:pick.reduce((a,c)=>a+Math.min(1,c.obj),0),
   top:pick.slice().sort((a,b)=>b.tr-a.tr||a.r.w-b.r.w).slice(0,3).map(c=>c.r.name),mix,inv:pick.filter(c=>c.a.mode==='invite').length,maxTr:Math.max(0,...pick.map(c=>c.tr))};
 });
}
function pkgCheck(){
 if(!G||G.phase!=='season')return;
 const bi=blockNow();if(bi<0)return;
 if(G.pk&&G.pk.s===SEASON&&G.pk.b>=bi)return;
 const pts0=teamPoints(ME()),P=perfEval();
 G.pk={s:SEASON,b:bi,offers:pkgBuild(bi),chosen:null,perf:P.lab,lvl:P.lvl,budget:pkgBudget(),pts0};
 save();
}
function pkgPending(){return!!(G&&G.phase==='season'&&G.pk&&G.pk.s===SEASON&&!G.pk.chosen&&G.pk.offers&&G.pk.offers.length)}
function pkgChoose(i){
 const o=G.pk.offers[i];if(!o)return;
 let paid=0;
 for(const id of o.races){const r=G.races.find(x=>x.id===id);if(!r||r.status!=='open')continue;const fee=feeOf(r);G.cash-=fee;paid+=fee;r.status='reg';r.fee=fee;r.mode='team';r.pkg=true}
 G.pk.chosen=o.k;G.pk.pts0=teamPoints(ME());
 addNews(`Pacchetto ${PK_STYLE[o.k].name}: ${o.races.length} corse`);
 save();toast(`${PK_STYLE[o.k].name}: ${o.races.length} corse iscritte · ${eurk(paid)}`,'gold');
}
const _allPendingC=allPending;
allPending=function(){
 pkgCheck();let n=_allPendingC()+(pkgPending()?1:0);
 if(G.other)n+=withOther(()=>{pkgCheck();return pkgPending()?1:0})||0;
 return n;
};
function mixBar(m){const t=Object.values(m).reduce((a,b)=>a+b,0)||1,col={salita:'var(--accent)',classiche:'var(--amber)',volate:'var(--ok)',crono:'var(--muted)'};
 return`<div class="mixbar">${Object.entries(m).filter(([k,v])=>v).map(([k,v])=>`<i style="width:${v/t*100}%;background:${col[k]}" title="${SPEC[k]||k}"></i>`).join('')}</div><div class="mixlg">${Object.entries(m).filter(([k,v])=>v).map(([k,v])=>`<span><i style="background:${col[k]}"></i>${({salita:'Salita',classiche:'Classiche',volate:'Volate',crono:'Crono'})[k]} ${v}</span>`).join('')}</div>`}
function pkgHero(){
 const P=G.pk,B=BLOCKS[P.b];
 return`<div class="hero card go pkhero"><div class="sec-h" style="margin:0"><div><div class="eyebrow">Dirigenza · ${B.lab}</div><h2>Scegli il pacchetto di gare</h2></div><span class="chip ${P.lvl===3?'u23':P.lvl===1?'red':''}">${esc(P.perf)}</span></div>
 <div class="pkgrid">${P.offers.map((o,i)=>{const S=PK_STYLE[o.k];return`<button class="card pk" data-act="pkpick" data-v="${i}">
  <div class="pkh">${ic(S.ico,20)}<b>${S.name}</b></div><small>${S.sub}</small>
  <div class="pkn"><div><b>${o.races.length}</b><small>corse</small></div><div><b>${o.days}</b><small>giorni</small></div><div><b>${eurk(o.cost)}</b><small>costo</small></div></div>
  ${mixBar(o.mix)}
  <div class="pktop">${o.top.map(n=>`<span>${esc(n)}</span>`).join('')}</div>
  ${o.obj?`<span class="chip amber">${o.obj} per gli sponsor</span>`:''}${o.inv?` <span class="chip u23">${o.inv} inviti</span>`:''}
 </button>`}).join('')}</div>
 <div class="note">Budget indicato dalla dirigenza: ${eurk(P.budget)}. Puoi aggiungere altre corse dal Calendario.</div></div>`;
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!G)return;
 if(t.dataset.act==='pkpick'){const i=+t.dataset.v,o=G.pk.offers[i];
  openSheet(sheetHead(`Pacchetto · ${BLOCKS[G.pk.b].lab}`,PK_STYLE[o.k].name,`${o.races.length} corse · ${o.days} giorni · ${eur(o.cost)}`)+
  `<div class="pb wrap"><div class="pklist">${o.races.map(id=>{const r=G.races.find(x=>x.id===id);return`<div class="pkr"><span class="wk">S${r.w}</span><span class="rn">${esc(r.name)}</span><div class="mt">${raceChips(r)}</div></div>`}).join('')}</div></div>
  <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Indietro</button><button class="btn primary" data-act="pkok" data-v="${i}">Scegli · ${eurk(o.cost)}</button></div></div>`,'wide')}
 else if(t.dataset.act==='pkok'){pkgChoose(+t.dataset.v);closeSheet();render()}
});
const _renderHomeC=renderHome;
renderHome=function(){
 pkgCheck();_renderHomeC();
 if(pkgPending()){const h=$('#view .hero');if(h)h.remove();const g=$('#view .homegrid');if(g)g.insertAdjacentHTML('beforebegin',pkgHero())}
 const nb=(G.bids||[]).filter(b=>!b.agreed).length;
 if(nb){const c=$('#view .homegrid .col');if(c)c.insertAdjacentHTML('afterbegin',`<button class="banner" data-act="gobids">${ic('market',18)}<span><b>${nb} offert${nb>1?'e':'a'}</b> per i tuoi corridori</span></button>`)}
};
document.addEventListener('click',e=>{if(e.target.closest('[data-act="gobids"]')&&G){G.mk.sub='bids';G.tab='market';render()}});
const _otherInfoC=otherInfo;
otherInfo=function(){const o=_otherInfoC();if(o&&G.other){const p=withOther(()=>{pkgCheck();return pkgPending()});if(p)o.pend.unshift('scelta del pacchetto di gare')}return o};

/* ---------- CENTRO SPORTIVO ---------- */
const FAC={
 gym:{lab:'Centro performance',ico:'bolt',d:'Allenamenti più efficaci',eff:l=>`+${l*15}% crescita in allenamento`},
 med:{lab:'Centro medico',ico:'plus',d:'Recupero e infortuni',eff:l=>`+${l*10}% recupero · infortuni più brevi`},
 wind:{lab:'Galleria del vento',ico:'wind',d:'Posizione da cronometro',eff:l=>`CRO migliora ogni settimana (×${l})`},
 velo:{lab:'Velodromo',ico:'track',d:'Pista e volate',eff:l=>`+${l*2} nelle gare su pista · volata in allenamento`},
 mkt:{lab:'Area hospitality',ico:'spon',d:'Sponsor più generosi',eff:l=>`+${l*5}% sui contratti · sponsor più interessati`}
};
const FAC_COST=[0,150000,400000,900000],FAC_UP=[0,25000,50000,90000],FAC_WK=[0,4,8,12];
function facLv(k){return club().fac[k]||0}
function facUpkeep(){const f=club().fac;return Object.keys(FAC).reduce((a,k)=>a+FAC_UP[f[k]||0],0)}
function facBuild(k){
 const C=club(),l=facLv(k)+1;if(l>3)return{ok:false,msg:'Livello massimo'};
 if(C.build)return{ok:false,msg:'C\'è già un cantiere aperto'};
 if(G.cash<FAC_COST[l])return{ok:false,msg:`Servono ${eur(FAC_COST[l])}`};
 G.cash-=FAC_COST[l];C.build={k,l,done:absWeek()+FAC_WK[l]};save();return{ok:true,msg:`Cantiere aperto: ${FAC_WK[l]} settimane`};
}
function facTick(){const C=club();if(C.build&&absWeek()>=C.build.done){C.fac[C.build.k]=C.build.l;toast(`${FAC[C.build.k].lab} livello ${C.build.l} pronto`,'gold');addNews(`${FAC[C.build.k].lab}: livello ${C.build.l}`);C.build=null;achCheck()}}
const _weeklyCostC=weeklyCost;
weeklyCost=function(){return _weeklyCostC()+(G._inOther?0:facUpkeep()/seasonWeeks())};
const _trainGrowthC=trainGrowth;
trainGrowth=function(r){return _trainGrowthC(r)*(1+0.15*facLv('gym'))};
const _recRateC=recRate;
recRate=function(r,w){return _recRateC(r,w)*(r.team==='t0'?1+0.1*facLv('med'):1)};
const _injureC=injure;
injure=function(r,weeks,from){if(r.team==='t0'&&facLv('med')){if(R()<0.12*facLv('med'))return;weeks=Math.max(1,Math.round(weeks*(1-0.15*facLv('med'))))}return _injureC(r,weeks,from)};
const _trackScoreC=trackScore;
trackScore=function(r,k){return _trackScoreC(r,k)+(r.team==='t0'?2*facLv('velo'):0)};
const _amountForC=amountFor;
amountFor=function(s,slot){return Math.round(_amountForC(s,slot)*club().spMul*(1+0.05*facLv('mkt'))/1000)*1000};
const _interestC=interest;
interest=function(s,slot){const o=_interestC(s,slot);if(o.p>0)o.p=clamp(o.p+0.03*facLv('mkt')+(club().spMul-1)*0.6,0.03,0.9);return o};
const _weekTickC=weekTick;
weekTick=function(w){
 _weekTickC(w);
 const lw=facLv('wind'),lv=facLv('velo');
 if(lw||lv)for(const r of ME().riders.map(RID)){
  if(lw)r.tt=Math.max(0.2*(r.f?SXF.tt:1),+(r.tt*(1-0.00025*lw)).toFixed(4));
  if(lv&&R()<0.3)r.spr+=lv;
 }
 if(!G._inOther){facTick();achCheck()}
};

/* ---------- TRAGUARDI ---------- */
const ACH=[
 ['win1','Prima vittoria',2,1,10000],['win10','10 vittorie',3,2,30000],['win50','50 vittorie',5,4,100000],
 ['c1','Vittoria in classe 1',2,1,15000],['pro','Vittoria ProSeries',3,2,30000],['wt','Vittoria WorldTour',5,3,60000],
 ['gtst','Tappa in un Grande Giro',5,3,60000],['gtpod','Podio in un Grande Giro',8,5,120000],['gtwin','Vinci un Grande Giro',12,8,250000],
 ['mon','Vinci una Classica Monumento',8,5,150000],['nc','Campionato nazionale',4,3,40000],['champ','Maglia europea o iridata',8,5,100000],
 ['track','Vittoria su pista',1,1,5000],['acad','Primo talento dalla scuola',1,1,10000],
 ['lpro','Licenza ProTeam',4,4,0],['lwt','Licenza WorldTeam',6,6,0],['two','Due squadre',2,2,0],['fac','Centro sportivo completo',3,3,0]
];
function achGet(id){
 const C=club();if(C.ach[id])return;
 const a=ACH.find(x=>x[0]===id);if(!a)return;
 C.ach[id]={s:SEASON,w:G.week};
 G.rep=clamp(G.rep+a[2],0,100);C.spMul=+(C.spMul+a[3]/100).toFixed(3);G.cash+=a[4];
 for(const c of G.contracts)if(activeIn(c,SEASON))c.sat=Math.min(100,c.sat+a[3]*2);
 toast(`Traguardo: ${a[1]}! Sponsor +${a[3]}%${a[4]?` · +${eurk(a[4])}`:''}`,'gold');
 addNews(`Traguardo raggiunto: ${a[1]}`);
}
function achCheck(){
 const C=club();
 if(C.wins>=1)achGet('win1');if(C.wins>=10)achGet('win10');if(C.wins>=50)achGet('win50');
 const cats=[G.cat,G.other?G.other.cat:null];
 if(cats.includes('pro')||cats.includes('wt'))achGet('lpro');if(cats.includes('wt'))achGet('lwt');
 if(G.other)achGet('two');
 if(Object.keys(FAC).every(k=>facLv(k)>=2))achGet('fac');
 if(Object.values(G.riders).some(r=>r.team==='t0'&&r.rookie)||(G.other&&Object.values(G.other.riders||{}).some(r=>r.team==='t0'&&r.rookie)))achGet('acad');
}
function clubAfterRace(race,final,stagesRes){
 const C=club(),mine=id=>{const r=RID(id);return r&&r.team==='t0'};
 let wins=0;
 const multi=stagesRes&&stagesRes.length>1;
 if(multi)for(const s of stagesRes)if(s[0]&&mine(s[0].id)){wins++;if(race.tier==='gt')achGet('gtst');if(['uwt1','uwt2','gt','mon'].includes(race.tier))achGet('wt')}
 const p=final.findIndex(x=>mine(x.id))+1;
 if(p===1){wins++;
  if(race.tier==='c1')achGet('c1');if(race.tier==='pro')achGet('pro');if(['uwt1','uwt2','gt','mon'].includes(race.tier))achGet('wt');
  if(race.tier==='mon')achGet('mon');if(race.tier==='gt')achGet('gtwin');if(race.tier==='nc')achGet('nc');}
 if(race.tier==='gt'&&p>=1&&p<=3)achGet('gtpod');
 C.wins+=wins;achCheck();
}
const _applyOutcomeC=applyOutcome;
applyOutcome=function(race,field,final,stagesRes,RC){const out=_applyOutcomeC(race,field,final,stagesRes,RC);try{clubAfterRace(race,final,stagesRes)}catch(e){}return out};
const _natEffectsC=natEffects;
natEffects=function(ev,field,final){_natEffectsC(ev,field,final);const w=final[0]&&RID(final[0].id);if(w&&w.team==='t0'&&ev.champ!=='avenir')achGet('champ')};
const _trackFinishC=trackFinish;
trackFinish=function(race,sel){const res=_trackFinishC(race,sel);if(res&&res.mine&&res.mine.some(m=>m.pos===1)){club().wins+=res.mine.filter(m=>m.pos===1).length;achGet('track');achCheck()}return res};

/* ---------- pagina Club ---------- */
function clubPage(){
 const C=club(),got=ACH.filter(a=>C.ach[a[0]]).length;
 const facs=Object.keys(FAC).map(k=>{const F=FAC[k],l=facLv(k),b=C.build&&C.build.k===k?C.build:null,nx=l+1;
  return`<div class="card fac ${l?'on':''}"><div class="fh">${ic(F.ico,18)}<b>${F.lab}</b><span class="lv">${'●'.repeat(l)}${'○'.repeat(3-l)}</span></div>
   <small>${l?F.eff(l):F.d}</small>
   ${b?`<span class="chip amber">Cantiere · pronto tra ${b.done-absWeek()} sett.</span>`:nx<=3?`<button class="btn sm" data-act="facb" data-v="${k}" ${C.build||G.cash<FAC_COST[nx]?'disabled':''}>${l?'Migliora':'Costruisci'} · ${eurk(FAC_COST[nx])}</button>`:'<span class="chip u23">Completo</span>'}</div>`}).join('');
 const ach=ACH.map(a=>{const ok=C.ach[a[0]];return`<div class="ach ${ok?'ok':''}" title="Reputazione +${a[2]} · sponsor +${a[3]}%${a[4]?' · '+eurk(a[4]):''}">${ic(ok?'check':'lock',14)}<span>${a[1]}</span><small>+${a[3]}%</small></div>`}).join('');
 return`<div class="clubtop">
  <div class="card pad"><div class="sec-h"><h3>Centro sportivo</h3><span class="eyebrow">per tutte le squadre · ${eurk(facUpkeep())}/anno</span></div><div class="facgrid">${facs}</div></div>
  <div class="card pad"><div class="sec-h"><h3>Traguardi</h3><span class="eyebrow">${got}/${ACH.length} · sponsor +${Math.round((C.spMul-1)*100)}%</span></div><div class="achgrid">${ach}</div></div></div>`;
}
const _renderBaseC=renderBase;
renderBase=function(){_renderBaseC();$('#view').insertAdjacentHTML('afterbegin',clubPage())};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act="facb"]');if(!t||!G)return;const r=facBuild(t.dataset.v);toast(r.msg,r.ok?'ok':'bad');render()});
TABS.forEach(t=>{if(t[0]==='base')t[1]='Club'});

/* ---------- POSTA ESSENZIALE ---------- */
/* in posta solo l'essenziale: proposte, offerte e convocazioni hanno già il loro avviso nella Home e nelle sezioni */
const MAIL_KEEP=[['DS',/Benvenuto|Fine stagione|si riparte|Nasce/],['Sponsor',/clausola|non rinnova/],['Mercato',/cessione|se ne va/]];
const _mailC=mail;
mail=function(from,title,body){if(MAIL_KEEP.some(([f,re])=>f===from&&re.test(title)))return _mailC(from,title,body);addNews(title)};
NOTIFY=(t,k)=>{const box=$('#toasts');if([...box.children].some(c=>c.textContent===t))return;if(box.children.length>=2)box.firstChild.remove();toast(t,k)};

/* ---------- TESTI BREVI: le note lunghe si aprono con un tocco ---------- */
function clipNotes(root){
 root.querySelectorAll('.note:not(.gtx):not(.clip):not([data-keep])').forEach(n=>{if(n.closest('.mailbody,.guide'))return;if(n.textContent.trim().length>70)n.classList.add('clip')});
}
document.addEventListener('click',e=>{const n=e.target.closest('.note.clip');if(n&&!e.target.closest('[data-act]'))n.classList.toggle('open')});
let clipQ=false;new MutationObserver(()=>{if(clipQ)return;clipQ=true;requestAnimationFrame(()=>{clipQ=false;clipNotes($('#view'));clipNotes($('#sheet'))})}).observe(document.body,{childList:true,subtree:true});

if(G){club();render()}
