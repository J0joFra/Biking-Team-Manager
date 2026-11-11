"use strict";
/* ============================================================
   PISTA: riunioni in velodromo con inseguimento individuale,
   inseguimento a squadre, corsa a punti, scratch, eliminazione
   ============================================================ */
const DISC={
 ip:{lab:'Inseguimento individuale',short:'Inseg. individuale',d:'4 km da solo contro il tempo: contano soglia e posizione aerodinamica',max:2},
 tp:{lab:'Inseguimento a squadre',short:'Inseg. a squadre',d:'4 corridori, 4 km, si danno il cambio: conta il tempo del terzo',max:4,min:4},
 pr:{lab:'Corsa a punti',short:'Corsa a punti',d:'40 km con uno sprint ogni 10 giri: resistenza e volata',max:2},
 sc:{lab:'Scratch',short:'Scratch',d:'15 km, vince chi taglia per primo il traguardo: volata',max:2},
 el:{lab:'Eliminazione',short:'Eliminazione',d:'ogni 2 giri esce l\'ultimo: scatto e intelligenza',max:2}
};
const TRACK_EVENTS=[
 ['Gran Premio di Montichiari','ITA',7,['ip','tp','pr','sc'],'LOM'],
 ['Track Cup Grenchen','SUI',11,['ip','tp','pr','el']],
 ['Omnium del Vélodrome de Roubaix','FRA',16,['ip','pr','sc','el']],
 ['Sei Giorni delle Rose · Fiorenzuola','ITA',27,['tp','pr','sc','el'],'EMR'],
 ['Tre Sere di Pordenone','ITA',29,['ip','pr','sc','el'],'FVG'],
 ['Campionati Italiani su pista','ITA',31,['ip','tp','pr','sc','el'],'LOM','ita'],
 ['Grand Prix del Kuipke · Gand','BEL',41,['tp','pr','sc','el']]
];
TIERS.track={lab:'Pista',win:0,fee:800,prd:150,size:8,lf:1,spf:1,prize:[3000,2000,1200,800,500,400,300,200]};
TIER_ORDER.track=11;
for(const t of TRACK_EVENTS)if(t[4])RACE_REG[t[0]]=t[4];
function trackRaces(){return TRACK_EVENTS.map((d,i)=>({id:'k'+i+'_'+SEASON,name:d[0],ctry:d[1],w:d[2],cls:'PISTA',lab:'Velodromo',tier:'track',disc:d[3],flag:d[5]||null,stages:[{t:'pista',seed:Math.floor(R()*1e9)}],dur:1,status:'open',result:null}))}
const _buildRacesK=buildRaces;
buildRaces=function(){return _buildRacesK().concat(trackRaces())};
function trackMigrate(){if(G&&!G.races.some(r=>r.tier==='track')){G.races.push(...trackRaces().filter(r=>r.w>G.week));save()}}
const _accessK=access;
access=function(race){return race.tier==='track'?{ok:true,mode:'fee'}:_accessK(race)};
const _whyCantK=whyCant;
whyCant=function(r,race){if(race.tier==='track'&&race.flag==='ita'&&r.nat!=='ITA')return'Solo corridori italiani';return _whyCantK(r,race)};
TYPE_LAB.pista='Pista';TYPE_H.pista=6;HARD.pista=4;
/* valore in pista: inseguimento (soglia + aerodinamica), gruppo (volata + resistenza) */
function trackScore(r,k){
 const s=stats(r);
 return Math.round(k==='ip'||k==='tp'?s.cro*0.75+s.pia*0.25:k==='pr'?s.pia*0.45+s.vol*0.35+s.res*0.2:k==='sc'?s.vol*0.65+s.pia*0.35:s.vol*0.55+s.pia*0.45);
}
function trackFtp(r){return r.mass*r.wkg*r.form*(1-r.fat/260)}
function ipTime(r){const W=15000+(r.spr-900)*14,P=trackFtp(r)*1.06+W/280;const v=spd(P,r.mass,0,1,r.tt*0.97,0.0025);return 4000/v*(1+gauss()*0.006)}
function tpTime(team){
 const vs=team.map(r=>{const P=trackFtp(r)*1.08+(15000+(r.spr-900)*14)/300;let lo=5,hi=20;for(let k=0;k<22;k++){const m=(lo+hi)/2,rot=(pw(m,r.mass,0,1,r.tt*1.02,0.0025)+3*pw(m,r.mass,0,1,r.tt*1.02*0.58,0.0025))/4;if(rot<P)lo=m;else hi=m}return lo}).sort((a,b)=>b-a);
 return 4000/vs[Math.min(2,vs.length-1)]*(1+gauss()*0.005);
}
function trackField(race,k,mine){
 const nat=race.flag==='ita';
 const ai=G.teams.slice(1).filter(t=>t.tier!=='wt'||R()<0.3);
 if(k==='tp'){
  const teams=shuffle(ai.slice()).map(t=>({t,rs:t.riders.map(RID).filter(r=>canRace(r,race)&&(!nat||r.nat==='ITA')).sort((a,b)=>trackScore(b,'tp')-trackScore(a,'tp')).slice(0,4)})).filter(o=>o.rs.length===4).slice(0,mine&&mine.length?9:10);
  return teams.map(o=>({team:o.t.id,rs:o.rs}));
 }
 const pool=ai.flatMap(t=>t.riders.map(RID)).filter(r=>canRace(r,race)&&(!nat||r.nat==='ITA'));
 return shuffle(pool).slice(0,90).sort((a,b)=>trackScore(b,k)-trackScore(a,k)).slice(0,k==='ip'?14:20);
}
function trackSim(race,sel){
 const out={};const mineIds=new Set();
 for(const k of race.disc){
  const mine=(sel&&sel[k]||[]).map(RID).filter(Boolean);
  if(k==='tp'){
   const teams=trackField(race,k,mine);
   if(mine.length===4)teams.push({team:'t0',rs:mine});
   out[k]=teams.map(o=>({team:o.team,ids:o.rs.map(r=>r.id),v:tpTime(o.rs)})).sort((a,b)=>a.v-b.v);
   for(const r of mine)mineIds.add(r.id);
  }else{
   const field=trackField(race,k,mine).concat(mine);
   const uniq=[...new Map(field.map(r=>[r.id,r])).values()];
   out[k]=uniq.map(r=>({id:r.id,team:r.team,v:k==='ip'?ipTime(r):trackScore(r,k)*r.form*(1-r.fat/300)*(1+gauss()*(k==='el'?0.07:k==='sc'?0.06:0.05))}))
    .sort((a,b)=>k==='ip'?a.v-b.v:b.v-a.v);
   for(const r of mine)mineIds.add(r.id);
  }
 }
 return{out,mineIds};
}
function trackFinish(race,sel){
 const{out,mineIds}=trackSim(race,sel);
 const T=TIERS.track;let prize=0;const mine=[];
 for(const k in out){
  const list=out[k];
  list.forEach((x,i)=>{
   const ids=k==='tp'?x.ids:[x.id];
   for(const id of ids){const r=RID(id);if(!r)continue;
    if(i<3||r.team==='t0')palmRec(r,i+1,`${DISC[k].lab} · ${race.name}`,'Pista');
    if(r.team==='t0'){
     if(k!=='tp'||ids[0]===id)prize+=T.prize[i]||0;
     mine.push({id,name:r.name,pos:i+1,k});
     if(k==='ip'||k==='tp'){r.tt=Math.max(0.198,+(r.tt-0.0004).toFixed(4));r.wkg=+(r.wkg+0.003).toFixed(4)}else{r.spr+=4;r.wkg=+(r.wkg+0.002).toFixed(4)}
     r.fat=clamp(r.fat+4,0,100);r.days+=1;if(i===0){r.wins++;r.mood=Math.min(100,(r.mood??65)+4)}
    }else if(i===0)r.wins++;
   }
   if(i===0&&k==='tp'&&x.team==='t0')teamRec(RID(x.ids[0]),1,`${DISC[k].lab} · ${race.name}`,'Pista','track');
   else if(i===0&&k!=='tp'){const r=RID(x.id);if(r&&r.team==='t0')teamRec(r,1,`${DISC[k].lab} · ${race.name}`,'Pista','track')}
  });
 }
 const best=mine.slice().sort((a,b)=>a.pos-b.pos)[0];
 if(mine.length){G.cash+=prize;G.rep=clamp(G.rep+(best.pos===1?1.5:best.pos<=3?0.6:0.1),0,100);
  const st=G.st;if(race.ctry==='ITA')st.ita=(st.ita||0)+1;if(RACE_REG[race.name])st['reg_'+RACE_REG[race.name]]=(st['reg_'+RACE_REG[race.name]]||0)+1;st.wins=(st.wins||0)+mine.filter(m=>m.pos===1).length;checkSponsorObjectives()}
 const first=out[race.disc[0]][0];const fr=RID(race.disc[0]==='tp'?first.ids[0]:first.id);
 race.status='done';
 race.result={track:true,disc:Object.fromEntries(Object.entries(out).map(([k,l])=>[k,l.slice(0,8).map(x=>({name:k==='tp'?TEAM(x.team).name:RID(x.id).name,team:k==='tp'?'':TEAM(x.team).short,v:x.v,me:x.team==='t0'}))])),
  mine:mine.length?mine.sort((a,b)=>a.pos-b.pos):null,winner:fr?(race.disc[0]==='tp'?TEAM(first.team).name:fr.name):'',winnerTeam:'',top:[],prize,myPts:0};
 for(const ids of Object.values(sel||{}))for(const id of ids){const r=RID(id);if(r){r.bF=race.w;r.bT=race.w}}
 save();return race.result;
}
const _quickRaceK=quickRace;
quickRace=function(race){if(race.tier==='track'){trackFinish(race,null);return}_quickRaceK(race)};
/* ---------- interfaccia ---------- */
let TSEL=null;
const _openConvocaK=openConvoca;
openConvoca=function(id){const race=G.races.find(r=>r.id===id);if(race&&race.tier==='track'){trackConvoca(race);return}_openConvocaK(id)};
function trackConvoca(race){
 TSEL={race,sel:{}};
 const rs=ME().riders.map(RID).filter(r=>!whyCant(r,race));
 for(const k of race.disc){const n=k==='tp'?4:1;TSEL.sel[k]=rs.slice().sort((a,b)=>trackScore(b,k)-trackScore(a,k)).slice(0,rs.length>=n?n:0).map(r=>r.id)}
 renderTrackConv();
}
function fmtTrack(k,v){return k==='ip'||k==='tp'?`${Math.floor(v/60)}'${(v%60).toFixed(2).padStart(5,'0').replace('.',',')}"`:''}
const TK_SHORT={ip:'Ins. ind.',tp:'Ins. sq.',pr:'Punti',sc:'Scratch',el:'Elim.'};
function renderTrackConv(){
 const race=TSEL.race,rs=ME().riders.map(RID).filter(r=>!whyCant(r,race));
 const ok=race.disc.every(k=>k!=='tp'||TSEL.sel[k].length===0||TSEL.sel[k].length===4)&&race.disc.some(k=>TSEL.sel[k].length);
 openSheet(sheetHead(`Pista · ${COUNTRY[race.ctry]||race.ctry} · ${weekLab(race.w)}`,esc(race.name),'Velodromo al coperto. Scegli chi corre in ogni specialità: un corridore può farne più di una.')+
 `<div class="pb wrap"><div class="card tbl dtw"><table class="t dt trk">
  <tr class="th"><td>Corridore</td>${race.disc.map(k=>`<td class="c" title="${esc(DISC[k].d)}">${TK_SHORT[k]}</td>`).join('')}</tr>
  <tr class="th sub"><td>Scelti</td>${race.disc.map(k=>{const n=TSEL.sel[k].length,need=k==='tp'?4:DISC[k].max;return`<td class="c ${k==='tp'&&n&&n!==4?'neg':''}">${n}/${need}${k==='tp'?'*':''}</td>`}).join('')}</tr>
  ${rs.slice().sort((a,b)=>Math.max(...race.disc.map(k=>trackScore(b,k)))-Math.max(...race.disc.map(k=>trackScore(a,k)))).map(r=>`<tr><td><b>${esc(r.name)}</b><div class="tm">${ARCH[r.arch].lab} · ${r.age} anni</div></td>${race.disc.map(k=>{const on=TSEL.sel[k].includes(r.id),sc=trackScore(r,k),best=Math.max(...rs.map(x=>trackScore(x,k)));return`<td class="c"><button class="tkc ${sc>=best-3?'best':''}" data-act="tksel" data-k="${k}" data-v="${r.id}" aria-pressed="${on}">${on?'✓ ':''}${sc}</button></td>`}).join('')}</tr>`).join('')}
  </table></div>
  <div class="note">Tocca il valore per far correre il corridore in quella specialità (può farne più di una). ${race.disc.includes('tp')?'* Inseguimento a squadre: servono 4 corridori.':''}</div>
  ${race.flag==='ita'?'<div class="note">Campionato italiano: solo corridori italiani.</div>':''}</div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Chiudi</button><button class="btn ghost" data-act="tkskip">Non partecipare</button><button class="btn primary" data-act="tkgo" ${ok?'':'disabled'}>Corri in pista</button></div></div>`,'wide');
}
function trackResultSheet(race){
 const R=race.result;
 openSheet(sheetHead('Pista · risultati',esc(race.name),R.mine?`I tuoi: ${R.mine.slice(0,4).map(m=>`${esc(m.name.split(' ').slice(-1)[0])} ${ord(m.pos)} (${DISC[m.k].short})`).join(' · ')}${R.prize?` · premi ${eurk(R.prize)}`:''}`:'')+
 `<div class="pb wrap"><div class="trackgrid">${Object.entries(R.disc).map(([k,l])=>`<div class="card pad"><div class="sec-h"><h3>${DISC[k].lab}</h3></div><table class="t">${l.map((x,i)=>`<tr class="${x.me?'me':''}"><td class="n">${i+1}</td><td>${esc(x.name)} <span class="tm">${esc(x.team)}</span></td><td class="r">${fmtTrack(k,x.v)}</td></tr>`).join('')}</table></div>`).join('')}</div></div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Continua</button></div></div>`,'wide');
}
const _raceSheetK=raceSheet;
raceSheet=function(id){const r=G.races.find(x=>x.id===id);if(r&&r.tier==='track'&&r.status==='done'&&r.result&&r.result.track){trackResultSheet(r);return}_raceSheetK(id);
 if(r&&r.tier==='track'){const pb=$('#sheet .stages');if(pb)pb.innerHTML=`<div class="card pad stack"><div class="eyebrow">Velodromo · specialità</div>${r.disc.map(k=>`<div><b>${DISC[k].lab}</b><div class="note">${DISC[k].d}</div></div>`).join('')}<div class="note">I corridori su strada fanno pista per migliorare: l'inseguimento allena soglia e posizione da crono, le gare di gruppo la volata.</div></div>`}};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!TSEL)return;
 const a=t.dataset.act;
 if(a==='tksel'){const k=t.dataset.k,v=t.dataset.v,s=TSEL.sel[k];const i=s.indexOf(v);if(i>=0)s.splice(i,1);else if(s.length<DISC[k].max)s.push(v);const sc=$('#sheet .pb').scrollTop;renderTrackConv();$('#sheet .pb').scrollTop=sc}
 else if(a==='tkgo'){const race=TSEL.race,sel=TSEL.sel;TSEL=null;closeSheet();busyOn('In pista…');setTimeout(()=>{trackFinish(race,sel);busyOff();render();trackResultSheet(race)},40)}
 else if(a==='tkskip'){const race=TSEL.race;TSEL=null;closeSheet();race.status='open';trackFinish(race,null);render()}
});
if(G){trackMigrate();if(G.tab==='cal')render()}
