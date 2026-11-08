"use strict";
/* ============================================================
   GARE JUNIORES DAL VIVO per la scuola: si possono guardare
   (i ragazzi corrono più motivati) oppure saltare.
   ============================================================ */
const JR_CLUBS=['GS Juniores Bergamo','UC Juniores Lucca','VC Juniores Treviso','SC Juniores Brescia','Team Juniores Brabant','CC Juniores Annecy','UC Juniores Cuneo','GS Juniores Forlì','VC Juniores Udine','Club Juniores Navarra','Team Juniores Limburg','UC Juniores Arezzo','GS Juniores Trento','VC Juniores Vicenza'];
const MOTIV=1.03;
const _TEAMj=TEAM;
TEAM=function(id){if(typeof id==='string'&&id.startsWith('jc')){const i=+id.slice(2);const n=JR_CLUBS[i%JR_CLUBS.length];return{id,name:n,short:n.split(' ').slice(-1)[0].slice(0,3).toUpperCase(),tier:'jr',nats:['ITA']}}return _TEAMj(id)};
function jrEligible(){return G.academy.level>0&&acadJuniors().length>0}
function jrPrepare(w){
 for(const race of G.races.filter(r=>r.tier==='jun'&&r.w===w+1&&r.status==='open'))
  if(jrEligible()){race.status='live';mail('Scuola',`${race.name}: corrono i nostri juniores`,`Questa settimana i ragazzi della scuola corrono ${race.name}. Puoi seguirli dal vivo: se li guardi corrono più motivati e imparano di più. Oppure salta e guarda solo il risultato.`)}
}
function jrBuildField(race){
 const field=acadJuniors().slice();
 const nat=race.ctry;
 for(let c=0;c<14;c++)for(let i=0;i<5;i++){
  const r=genRider({id:'jc'+c,tier:'jr'},R()<0.7&&NAMES[nat]?nat:pick(Object.keys(NAMES)),pick(ARCH_MIX),rint(17,18),R()<0.1?0.3:0);
  r.team='jc'+c;r.tmp=true;G.riders[r.id]=r;field.push(r);
 }
 return field;
}
function jrCleanup(){for(const id in G.riders)if(G.riders[id].tmp){USED.delete(G.riders[id].name);delete G.riders[id]}}
function jrRC(race){
 const field=jrBuildField(race);
 const RC={race,field,stage:0,fat:{},gc:{},stages:[],stageRace:false,kmFuga:{},out:new Set(),jr:true};
 for(const r of field){RC.gc[r.id]={t:0,pts:0,kom:0};RC.fat[r.id]=0;RC.kmFuga[r.id]=0}
 return RC;
}
const _stageCtxJ=stageCtx;
stageCtx=function(RC){const c=_stageCtxJ(RC);if(RC.jr){c.entrants=c.entrants.map(e=>({r:e.r,team:e.r.team==='acad'?'t0':e.r.team}));c.tactic=null;c.capId=null;c.motiv=RC.watched?MOTIV:1}return c};
const _createSimJ=createSim;
createSim=function(ctx){const S=_createSimJ(ctx);if(ctx.motiv&&ctx.motiv!==1)for(const x of S.riders)if(x.isMe){x.ftp*=ctx.motiv;x.Wmax*=1.05;x.W=x.Wmax}return S};
function jrGo(id,mode){
 const race=G.races.find(r=>r.id===id);if(!race||race.status!=='live')return;
 if(mode==='skip'){race.status='open';juniorRace(race);save();render();const R=race.result;toast(R&&R.junior?`${race.name}: miglior junior ${ord(R.junior[0].pos)}`:'Gara saltata');return}
 const RC=jrRC(race);RC.watched=true;
 LIVE={RC,S:null,speed:25,playing:true,acc:0,last:0,lastUI:0,zoom:false,course:null};
 startStageLive();
}
function jrFinish(RC){
 const race=RC.race,res=RC.stages[0].res,pos=id=>res.findIndex(x=>x.id===id)+1;
 const js=RC.field.filter(r=>r.team==='acad').map(r=>({r,p:pos(r.id)||res.length+1})).sort((a,b)=>a.p-b.p);
 for(const{r,p}of js){
  r.res.push({name:race.name,cls:'MJ',pos:p,n:res.length,w:p===1?1:0});
  r.wkg=+(r.wkg+(RC.watched?0.012:0.006)*(p<=10?1.5:1)).toFixed(4);
  r.days=(r.days||0)+1;
 }
 const best=js[0];
 if(best&&best.p<=10){const line=`${best.r.name} ${best.p}° a ${race.name}`;G.academy.log.unshift({s:SEASON,t:line});G.academy.log=G.academy.log.slice(0,20);if(best.p<=3)G.rep=clamp(G.rep+1,0,100)}
 race.status='done';
 race.result={junior:js.map(o=>({name:o.r.name,pos:o.p})),top:res.slice(0,10).map(x=>({id:x.id,name:RID(x.id).name,team:x.team==='t0'?'Scuola':TEAM(x.team).short,t:x.time})),winner:RID(res[0].id).name,winnerTeam:'',stageW:null,n:res.length};
 race.result.winnerTeam=res[0].team==='t0'?G.name+' (scuola)':TEAM(res[0].team).name;
 jrCleanup();save();
}
function jrFinalSheet(RC){
 const R=RC.race.result;
 openSheet(sheetHead('Gara juniores',esc(RC.race.name),`Vince <b>${esc(R.winner)}</b> (${esc(R.winnerTeam)})`)+
 `<div class="pb wrap"><div class="negbox"><div><div class="sec-h"><h3>I ragazzi della scuola</h3></div><div class="card tbl"><table class="t">${R.junior.map(j=>`<tr class="me"><td class="n">${j.pos}</td><td>${esc(j.name)}</td></tr>`).join('')}</table></div>
  <div class="note" style="margin-top:6px">${RC.watched?'Li hai seguiti dal vivo: hanno corso più motivati e hanno imparato di più.':''}</div></div>
 <div><div class="sec-h"><h3>Ordine d'arrivo</h3></div><div class="card tbl"><table class="t">${R.top.map((x,i)=>`<tr class="${x.team==='Scuola'?'me':''}"><td class="n">${i+1}</td><td>${esc(x.name)} <span class="tm">${esc(x.team)}</span></td><td class="r">${i===0?fmtT(x.t):fmtGap(x.t-R.top[0].t)}</td></tr>`).join('')}</table></div></div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Continua</button></div></div>`,'wide');
}
function jrHero(race){
 const js=acadJuniors();
 return`<div class="herorace"><div style="min-width:0"><div class="eyebrow">Scuola juniores</div><h2>${esc(race.name)}</h2><div class="mt">${raceChips(race)}<span class="muted">Corrono: ${js.map(r=>esc(r.name)).join(', ')}</span></div><div class="note">Se li segui dal vivo corrono più motivati (+3% di soglia) e crescono di più.</div></div>
  <div class="row"><button class="btn big" data-act="jrgo" data-v="${race.id}" data-m="skip">Salta</button><button class="btn primary big" data-act="jrgo" data-v="${race.id}" data-m="live">Segui dal vivo</button></div></div>`;
}
const _myPendingJ=myPending;
myPending=function(){return _myPendingJ().concat(G.races.filter(r=>r.tier==='jun'&&r.status==='live'&&r.w===G.week))};
const _weekTickJ=weekTick;
weekTick=function(w){_weekTickJ(w);jrPrepare(w)};
document.addEventListener('click',e=>{const t=e.target.closest('[data-act]');if(t&&t.dataset.act==='jrgo')jrGo(t.dataset.v,t.dataset.m)});
