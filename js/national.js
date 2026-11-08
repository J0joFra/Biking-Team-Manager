"use strict";
/* ============================================================
   NAZIONALI: Europei, Mondiali, Tour de l'Avenir
   Le nazionali convocano i corridori in base a forma e risultati:
   la richiesta arriva 3–4 settimane prima, si risponde entro la
   settimana che precede il raduno.
   ============================================================ */
/* [chiave, nome, settimana, categoria, percorso, settimane di raduno prima, corridori per nazione, punti UCI al vincitore, campionato] */
const NAT_EVENTS=[
 ['avenir',"Tour de l'Avenir",33,'u23','8:A',0,6,125,'avenir'],
 ['eu_tt23','Europei · Cronometro Under 23',37,'u23','crono:25',1,2,40,'eu'],
 ['eu_tt','Europei · Cronometro Elite',37,'elite','crono:30',1,2,250,'eu'],
 ['eu_jr','Europei · Strada Juniores',37,'jun','mossa:120',1,5,0,'eu'],
 ['eu_u23','Europei · Strada Under 23',37,'u23','mossa:170',1,6,60,'eu'],
 ['eu_el','Europei · Strada Elite',37,'elite','collinare:200',1,7,250,'eu'],
 ['wc_tt23','Mondiali · Cronometro Under 23',39,'u23','crono:35',1,2,60,'wc'],
 ['wc_tt','Mondiali · Cronometro Elite',39,'elite','crono:45',1,2,350,'wc'],
 ['wc_jr','Mondiali · Strada Juniores',39,'jun','collinare:130',1,5,0,'wc'],
 ['wc_u23','Mondiali · Strada Under 23',39,'u23','collinare:170',1,6,125,'wc'],
 ['wc_el','Mondiali · Strada Elite',39,'elite','collinare:260',1,8,600,'wc']
];
const NAT_HOSTS={eu:[['Trento','ITA'],['Drenthe','NED'],['Annecy','FRA'],['Limburgo','BEL'],['Lubiana','SLO'],['Glasgow','GBR']],wc:[['Zurigo','SUI'],['Copenaghen','DEN'],['Bergamo','ITA'],['Innsbruck','AUT'],['Lione','FRA'],['Herning','DEN']],avenir:[['Savoia','FRA']]};
const CHAMP_LAB={eu:'Campionati Europei',wc:'Campionati del Mondo',avenir:"Tour de l'Avenir"};
const CAT_LAB={elite:'Elite',u23:'Under 23',jun:'Juniores'};
TIERS.naz={lab:'Nazionali',win:0,fee:0,prd:0,size:0,lf:1,spf:0};
TIER_ORDER.naz=10;

function natRaces(season){
 const host={};for(const k in NAT_HOSTS)host[k]=NAT_HOSTS[k][season%NAT_HOSTS[k].length];
 return NAT_EVENTS.map(d=>{
  const[key,name,w,cat,spec,rad,size,win,champ]=d;let stages;
  if(/^\d+:/.test(spec)){const[n,p]=spec.split(':');stages=stageTypes(+n,p).map(t=>({t,seed:Math.floor(R()*1e9)}))}
  else{const[t,km]=spec.split(':');stages=[{t,km:+km,seed:Math.floor(R()*1e9)}]}
  const h=host[champ];
  return{id:'n'+key+'_'+season,key,name:champ==='avenir'?name:`${name} · ${h[0]}`,ctry:h[1],w,cls:'NAZ',lab:CAT_LAB[cat],tier:'naz',cat,champ,stages,dur:stages.length>=8?2:1,rad,size,win,flag:null,status:'open',result:null};
 });
}
function natMigrate(){if(G&&!G.races.some(r=>r.tier==='naz')){G.races.push(...natRaces(SEASON));G.callups=G.callups||[];save()}}
/* gancio nei costruttori del calendario */
const _buildRaces=buildRaces;
buildRaces=function(){return _buildRaces().concat(natRaces(SEASON))};
const _access=access;
access=function(race){return race.tier==='naz'?{ok:false,why:'Corsa per nazionali: i corridori li convocano i commissari tecnici'}:_access(race)};
const _busy=busy;
busy=function(r,w0,w1){return _busy(r,w0,w1)||!!(r.natB&&r.natB[0]<=w1&&r.natB[1]>=w0)};
const _whyCant=whyCant;
whyCant=function(r,race){if(r.natB&&r.natB[0]<=race.w+race.dur-1&&r.natB[1]>=race.w)return'In nazionale';return _whyCant(r,race)};

function natEligible(r,cat){
 if(!r||r.team==='x'||r.team==='fa')return false;
 const young=r.team==='acad'||r.team==='jr'||r.junior;
 if(cat==='jun')return young&&r.age>=17&&r.age<=18;
 if(young)return false;
 return cat==='u23'?r.age<=22:r.age>=21;
}
function natScore(r,ev){
 const t=ev.stages.length>1?'montagna':ev.stages[0].t;
 return suitType(r,t)*r.form*(1-r.fat/260)+Math.min(15,(r.pts||0)/15)+(r.wins||0)*1.5+(r.res||[]).filter(x=>x.pos&&x.pos<=10).length*0.8;
}
function natSize(ev,nat){const strong=['ITA','BEL','FRA','ESP','NED','DEN','GBR','SLO'];return strong.includes(nat)?ev.size:Math.max(1,Math.ceil(ev.size*0.6))}
const champOf=k=>(NAT_EVENTS.find(d=>d[0]===k)||[])[8];
function natPick(ev,nat,exclude){
 return Object.values(G.riders).filter(r=>r.nat===nat&&natEligible(r,ev.cat)&&!injured(r,ev.w)&&!exclude.has(r.id)&&!(r.natB&&r.natB[0]<=ev.w&&r.natB[1]>=ev.w-ev.rad&&!(r.natSelKeys||[]).some(k=>champOf(k)===ev.champ)))
  .map(r=>({r,s:natScore(r,ev)+gauss()*1.5})).sort((a,b)=>b.s-a.s).slice(0,natSize(ev,nat)).map(o=>o.r);
}
const natList=ev=>Object.keys(NAMES).filter(n=>ev.champ!=='eu'||n!=='COL');
function natWindow(ev){return[ev.w-ev.rad,ev.w+ev.dur-1]}
/* Convocazioni: 4 settimane prima del raduno */
function natSelections(w){
 G.callups=G.callups||[];G.natSel=G.natSel||{};
 const evs=G.races.filter(r=>r.tier==='naz'&&r.status==='open'&&!G.natSel[r.key]&&r.w-r.rad-4<=w);
 if(!evs.length)return;
 const byRider={};
 for(const ev of evs){
  G.natSel[ev.key]=[];
  for(const nat of natList(ev)){
   if(ev.cat==='jun'){const have=Object.values(G.riders).filter(r=>r.nat===nat&&natEligible(r,'jun')).length;for(let i=have;i<natSize(ev,nat)+1;i++){const x=genRider({id:'jr',tier:'jr'},nat,pick(ARCH_MIX),18);G.riders[x.id]=x}}
   for(const r of natPick(ev,nat,new Set())){
    if(r.team==='t0'||r.team==='acad'){(byRider[r.id]=byRider[r.id]||[]).push(ev)}
    else{G.natSel[ev.key].push(r.id);const[a,b]=natWindow(ev);r.natB=[Math.min(a,r.natB?r.natB[0]:a),Math.max(b,r.natB?r.natB[1]:b)];(r.natSelKeys=r.natSelKeys||[]).push(ev.key)}
   }
  }
 }
 for(const id in byRider){
  const r=RID(id),evl=byRider[id];
  const from=Math.min(...evl.map(e=>natWindow(e)[0])),to=Math.max(...evl.map(e=>natWindow(e)[1]));
  const c={id:'cu'+(G.nextId++),rid:id,keys:evl.map(e=>e.key),champ:evl[0].champ,nat:r.nat,from,to,exp:from-1,status:'pending'};
  G.callups.push(c);
  const clash=G.races.filter(x=>x.status==='reg'&&x.w<=to&&x.w+x.dur-1>=from).map(x=>x.name);
  mail('Federazione',`${COUNTRY[r.nat]||r.nat}: convocazione per ${r.name}`,`Il commissario tecnico vuole ${r.name} per ${evl.map(e=>e.name).join(' e ')}.\nImpegno: dal ${weekLab(from)} al ${weekLab(to+1)} (raduno compreso). In quelle settimane non potrà correre con la squadra${clash.length?`: salterebbe ${clash.join(', ')}`:''}.\nRispondi entro il ${weekLab(c.exp)} dalla Home.`);
  NOTIFY(`Nazionale: convocato ${r.name}`,'gold');
 }
}
function answerCallup(c,yes){
 const r=RID(c.rid);if(!r||c.status!=='pending')return;
 c.status=yes?'accepted':'declined';
 if(yes){r.natB=[c.from,c.to];r.natSelKeys=(r.natSelKeys||[]).concat(c.keys);for(const k of c.keys)(G.natSel[k]=G.natSel[k]||[]).push(r.id);r.mood=Math.min(100,(r.mood??65)+5);
  for(const race of G.races)if(race.status==='reg'&&race.sel&&race.w<=c.to&&race.w+race.dur-1>=c.from)race.sel=race.sel.filter(id=>id!==r.id)}
 else{r.mood=Math.max(0,(r.mood??65)-8);if(r.team==='t0')mail('Federazione',`${r.name} resta a disposizione della squadra`,`Hai rifiutato la convocazione. ${r.name} è dispiaciuto (morale in calo) ma potrà correre con voi.`)}
 save();
}
function natExpire(w){for(const c of G.callups||[])if(c.status==='pending'&&c.exp<=w){c.status='declined';const r=RID(c.rid);if(r){r.mood=Math.max(0,(r.mood??65)-5);mail('Federazione',`Convocazione scaduta: ${r.name}`,'Non hai risposto in tempo: il commissario tecnico ha scelto un altro corridore.')}}}
function natRun(w){
 for(const ev of G.races.filter(r=>r.tier==='naz'&&r.w===w&&r.status!=='done')){
  const sel=new Set((G.natSel&&G.natSel[ev.key])||[]);
  const field=[];
  for(const nat of natList(ev)){
   const mine=[...sel].map(RID).filter(r=>r&&r.nat===nat&&!injured(r,w));
   const need=natSize(ev,nat)-mine.length;
   const used=new Set(mine.map(r=>r.id));
   const declined=new Set((G.callups||[]).filter(c=>c.status!=='accepted'&&c.keys.includes(ev.key)).map(c=>c.rid));
   const fill=need>0?natPick(ev,nat,new Set([...used,...declined])).filter(r=>r.team!=='t0'&&r.team!=='acad').slice(0,need):[];
   field.push(...mine,...fill);
  }
  if(field.length<5){ev.status='done';ev.result=null;continue}
  const fat={},gc={};for(const r of field){fat[r.id]=0;gc[r.id]=0}
  const stagesRes=[];
  for(const st of ev.stages){const res=quickStage(field,st.t,fat,w);for(const x of res)gc[x.id]+=x.time;stagesRes.push(res);for(const r of field)fat[r.id]+=HARD[st.t]*0.6}
  const final=ev.stages.length>1?field.map(r=>({id:r.id,time:gc[r.id]})).sort((a,b)=>a.time-b.time):stagesRes[0];
  natEffects(ev,field,final);
 }
}
function natEffects(ev,field,final){
 const pos=id=>final.findIndex(x=>x.id===id)+1;
 const medal=['Oro','Argento','Bronzo'];
 for(const r of field){
  const p=pos(r.id);
  r.days+=ev.stages.length;r.fat=clamp(r.fat+ev.stages.reduce((a,s)=>a+HARD[s.t],0)*0.8,0,100);
  const xp=(p<=10?0.03:0.015)*(r.age<=23?1:0.4);r.wkg=+(r.wkg+xp).toFixed(4);
  if(ev.win&&p<=POINTS_D.length)r.pts+=Math.round(ev.win*POINTS_D[p-1]);
  if(p===1){r.wins++;(r.titles=r.titles||[]).push(`${ev.champ==='wc'?'Campione del mondo':ev.champ==='eu'?'Campione europeo':'Vincitore del Tour de l\'Avenir'} ${ev.name.includes('Cronometro')?'a cronometro ':''}${CAT_LAB[ev.cat]} ${SEASON}`)}
  if(p<=3||r.team==='t0'||r.team==='acad')r.res.push({name:ev.name,cls:'Naz',pos:p,n:final.length,w:p===1?1:0});
  r.natB=null;r.natSelKeys=[];
 }
 const mine=field.filter(r=>r.team==='t0'||r.team==='acad').map(r=>({id:r.id,name:r.name,pos:pos(r.id),pts:0,km:0})).sort((a,b)=>a.pos-b.pos);
 for(const m of mine){
  const r=RID(m.id),p=m.pos;
  r.mood=Math.min(100,(r.mood??65)+(p<=3?10:4));
  const dr=p===1?8:p<=3?5:p<=10?2:0.5;G.rep=clamp(G.rep+dr*(ev.cat==='elite'?1:ev.cat==='u23'?0.7:0.5),0,100);
  if(p<=3)for(const c of G.contracts||[])if(activeIn(c,SEASON))c.sat=Math.min(100,c.sat+3);
  if(r.team==='acad'&&p<=10){G.academy.log.unshift({s:SEASON,t:`${r.name} ${p}° a ${ev.name}`})}
 }
 ev.status='done';
 const W=RID(final[0].id);
 ev.result={top:final.slice(0,10).map(x=>({id:x.id,name:RID(x.id).name,team:RID(x.id).nat,t:x.time})),winner:W.name,winnerTeam:COUNTRY[W.nat]||W.nat,stageW:null,n:final.length,mine:mine.length?mine:null,myPts:0,prize:0,nat:true};
 if(mine.length){
  const best=mine[0];
  mail('Federazione',`${ev.name}: ${best.pos<=3?medal[best.pos-1]+' per '+best.name+'!':'i nostri risultati'}`,`Vince ${W.name} (${COUNTRY[W.nat]||W.nat}).\n${mine.map(m=>`• ${m.name}: ${ord(m.pos)}`).join('\n')}\n\nEsperienza in nazionale: i giovani crescono di più. ${best.pos<=10?'Buon risultato anche per la reputazione della squadra.':''}`);
  if(best.pos<=3)NOTIFY(`${medal[best.pos-1]} per ${best.name} a ${ev.name}!`,'gold');
 }
}
function natWeekly(w){natMigrate();natExpire(w);natSelections(w);natRun(w)}
const _weekTick=weekTick;
weekTick=function(w){natWeekly(w);_weekTick(w)};
const _newSeason=newSeason;
newSeason=function(up){const out=_newSeason(up);G.callups=[];G.natSel={};for(const r of Object.values(G.riders)){r.natB=null;r.natSelKeys=[]}save();return out};

/* ---------- interfaccia ---------- */
function pendingCallups(){return(G.callups||[]).filter(c=>c.status==='pending'&&RID(c.rid))}
function callupBanner(){const n=pendingCallups().length;return n?`<button class="banner nat" data-act="callups"><span class="chip amber">Nazionale</span><span><b>${n} convocazion${n>1?'i':'e'}</b> da valutare: rispondi entro la settimana prima del raduno.</span></button>`:''}
function callupSheet(){
 const cs=(G.callups||[]).filter(c=>RID(c.rid)&&c.to>=G.week).sort((a,b)=>(a.status==='pending'?0:1)-(b.status==='pending'?0:1)||a.from-b.from);
 openSheet(sheetHead('Federazioni','Convocazioni in nazionale','Accettare porta esperienza, crescita, reputazione e morale. Rifiutare tiene il corridore a disposizione della squadra, ma lui ci resta male.')+
 `<div class="pb wrap stack">${cs.length?cs.map(c=>{const r=RID(c.rid),evs=c.keys.map(k=>G.races.find(x=>x.tier==='naz'&&x.key===k)).filter(Boolean);
  const clash=G.races.filter(x=>x.status==='reg'&&x.w<=c.to&&x.w+x.dur-1>=c.from);
  return`<div class="card pad stack"><div class="sec-h" style="margin:0"><h3>${esc(r.name)}</h3><span class="chip ${c.status==='accepted'?'u23':c.status==='declined'?'red':'amber'}">${c.status==='accepted'?'Convocato':c.status==='declined'?'Rifiutata':'In attesa'}</span></div>
   <div class="note">${COUNTRY[c.nat]||c.nat} · ${catOf(r)} · ${ARCH[r.arch].lab} · valore ${ovr(r)}${r.team==='acad'?' · scuola juniores':''}</div>
   <div>${evs.map(e=>`<div>• <b>${esc(e.name)}</b> <span class="muted">(${weekLab(e.w)})</span></div>`).join('')}</div>
   <div class="note">Impegno: dal ${weekLab(c.from)} al ${weekLab(c.to+1)} con il raduno.${clash.length?` <b>Salterebbe:</b> ${clash.map(x=>esc(x.name)).join(', ')}.`:' Nessuna tua corsa in quelle settimane.'}</div>
   ${c.status==='pending'?`<div class="row" style="justify-content:flex-end"><span class="note" style="margin-right:auto">Rispondi entro il ${weekLab(c.exp)}</span><button class="btn ghost" data-act="cuno" data-v="${c.id}">Rifiuta</button><button class="btn primary" data-act="cuyes" data-v="${c.id}">Accetta</button></div>`:''}</div>`}).join(''):'<div class="note">Nessuna convocazione. Le nazionali scelgono i corridori in forma e con buoni risultati in stagione, 3–4 settimane prima di Europei, Mondiali e Tour de l\'Avenir.</div>'}</div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Chiudi</button></div></div>`,'wide');
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 const a=t.dataset.act,v=t.dataset.v;
 if(a==='callups')callupSheet();
 else if(a==='cuyes'||a==='cuno'){const c=(G.callups||[]).find(x=>x.id===v);if(c){answerCallup(c,a==='cuyes');toast(a==='cuyes'?`${RID(c.rid).name} parte per la nazionale`:'Convocazione rifiutata',a==='cuyes'?'gold':'')}callupSheet()}
});
