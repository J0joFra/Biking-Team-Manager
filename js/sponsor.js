"use strict";
/* ============================================================
   SPONSOR: si parte dal vicinato e si arriva al main sponsor
   ============================================================ */
function distKm(a,b,c,d){const toR=x=>x*Math.PI/180,dl=toR(c-a),dn=toR(d-b);const h=Math.sin(dl/2)**2+Math.cos(toR(a))*Math.cos(toR(c))*Math.sin(dn/2)**2;return 2*6371*Math.asin(Math.sqrt(h))}
const isForeign=code=>!!FOREIGN[code];
const areaName=code=>REGIONS[code]?REGIONS[code].n:FOREIGN[code]?FOREIGN[code].n:code;
const SP=id=>G.sponsors.find(s=>s.id===id);
const absWeek=()=>SEASON*60+G.week;
function allCities(){const out=[];for(const k in REGIONS)for(const c of REGIONS[k].c)out.push({city:c[0],reg:k,lat:c[1],lon:c[2]});return out}

function genSponsors(){
 const out=[],used=new Set();let k=0;
 const name=(tpls,brands,P)=>{let n;for(let t=0;t<12;t++){n=pick(tpls).replace('{S}',pick(brands)).replace('{P}',P);if(!used.has(n))break}used.add(n);return n};
 for(const code in REGIONS){const Rg=REGIONS[code];
  const counts={locale:Math.round(3+Rg.w*3),regionale:Math.round(1+Rg.w*1.5),nazionale:Rg.w>=1.1?Math.round(Rg.w):Rg.w>=0.7&&R()<0.5?1:0};
  for(const size in counts)for(let i=0;i<counts[size];i++){
   const city=pick(Rg.c),sec=pick(Object.keys(SECTORS)),SZ=SPONSOR_SIZE[size];
   out.push({id:'s'+(k++),name:name(SECTORS[sec].t,BRAND,city[0]),sector:sec,area:code,city:city[0],lat:city[1]+gauss()*0.04,lon:city[2]+gauss()*0.04,size,
    pot:Math.round(rnd(SZ.pot[0],SZ.pot[1])*(0.8+Rg.w*0.2)/5000)*5000,req:Math.max(0,Math.round(SZ.req+rnd(-5,10))),taste:+rnd(-0.1,0.1).toFixed(2),cool:0});
  }
 }
 for(const code in FOREIGN){const F=FOREIGN[code],n=Math.round(2+F.w*2);
  for(let i=0;i<n;i++){
   const size=(i===0&&F.w>=1)||R()<0.35?'internazionale':'nazionale',SZ=SPONSOR_SIZE[size];
   out.push({id:'s'+(k++),name:name(FOREIGN_T[code],FOREIGN_BRAND,F.c[0]),sector:'estero',area:code,city:F.c[0],lat:F.c[1],lon:F.c[2],size,
    pot:Math.round(rnd(SZ.pot[0],SZ.pot[1])*F.w/5000)*5000,req:Math.round(SZ.req+rnd(0,12)+(['UAE','USA'].includes(code)?8:0)),taste:+rnd(-0.1,0.1).toFixed(2),cool:0});
  }
 }
 return out;
}
function spDist(s){return Math.round(distKm(G.sede.lat,G.sede.lon,s.lat,s.lon))}
function interest(s,slot='partner'){
 if(G.rep<s.req)return{p:0,why:`Chiede una reputazione di almeno ${s.req} (ora ${Math.round(G.rep)})`};
 if(s.size==='internazionale'&&G.cat==='conti'&&slot!=='partner')return{p:0,why:'Come main o co-sponsor vuole almeno una ProTeam'};
 const SZ=SPONSOR_SIZE[s.size],d=spDist(s);
 const prox=SZ.range?Math.exp(-d/SZ.range):0.45;
 const exp=isForeign(s.area)?Math.min(1,((G.exp||{})[s.area]||0)/4)*0.3:0;
 let p=0.05+0.7*prox+(G.rep-s.req)/150+exp+s.taste;
 if(slot==='main')p*=0.75;else if(slot==='partner')p*=1.15;
 if(isForeign(s.area)&&s.size!=='internazionale')p*=0.8;
 return{p:clamp(p,0.03,0.95),d};
}
function amountFor(s,slot){return Math.round(s.pot*SLOTS[slot].share*(0.85+G.rep/400)/1000)*1000}
function activeIn(c,season){return c.from<=season&&c.end>=season}
function slotUsed(slot,season){return G.contracts.filter(c=>c.slot===slot&&activeIn(c,season)).length}
function slotStart(slot){
 const free=s=>slotUsed(slot,s)<SLOTS[slot].cap;
 if(G.phase!=='season')return free(SEASON+1)?SEASON+1:null;
 return free(SEASON)?SEASON:free(SEASON+1)?SEASON+1:null;
}
function hasContract(s){return G.contracts.some(c=>c.sid===s.id&&c.end>=SEASON&&!(G.phase!=='season'&&c.end===SEASON))}
function incomeIn(season){return G.contracts.filter(c=>activeIn(c,season)).reduce((a,c)=>a+c.amount,0)}
function weeklyIncome(){return incomeIn(SEASON)/seasonWeeks()}
function mainSponsor(){const c=G.contracts.find(c=>c.slot==='main'&&activeIn(c,SEASON));return c?SP(c.sid):null}
function sponsorSat(){const a=G.contracts.filter(c=>activeIn(c,SEASON));if(!a.length)return 0;const w=a.reduce((x,c)=>x+c.amount,0);return Math.round(a.reduce((x,c)=>x+c.sat*c.amount,0)/w)}

/* ---------- obiettivi dei contratti ---------- */
function objTxt(k,n){
 if(k.startsWith('reg_'))return`Corri ${n} corse in ${REGIONS[k.slice(4)].n}`;
 if(k.startsWith('ctry_'))return`Corri ${n} corse in ${FOREIGN[k.slice(5)]?FOREIGN[k.slice(5)].n:COUNTRY[k.slice(5)]}`;
 return{wins:`Vinci ${n} corse o tappe`,top10:`Ottieni ${n} piazzamenti nei primi 10`,fuga:`Accumula ${n} km in fuga`,ita:`Corri ${n} corse in Italia`,wt:`Corri ${n} corse WorldTour`}[k];
}
function regRaces(code){return G.races.filter(r=>RACE_REG[r.name]===code&&r.tier!=='jun'&&r.status!=='done'&&r.w>G.week&&(()=>{const a=access(r);return a.ok&&(a.mode==='fee'||a.chance>=0.5)})()).length}
function makeObj(s){
 let k,n;
 if(isForeign(s.area)){const m=G.races.filter(r=>r.ctry===s.area).length;
  if(m>=2&&R()<0.6){k='ctry_'+s.area;n=Math.min(3,m)}else if(s.size==='internazionale'){k=G.cat==='wt'?pick(['wins','wt']):'wins';n=k==='wt'?10:G.cat==='wt'?8:4}else{k='top10';n=8}}
 else if(s.size==='locale'){const m=regRaces(s.area);if(m>=1){k='reg_'+s.area;n=Math.min(2,m)}else if(R()<0.5){k='ita';n=4}else{k='fuga';n=100}}
 else if(s.size==='regionale'){const m=regRaces(s.area);if(m>=2&&R()<0.6){k='reg_'+s.area;n=Math.min(3,m)}else if(R()<0.5){k='top10';n=3}else{k='ita';n=8}}
 else{const o=pick([['wins',2],['top10',8],['ita',12]]);k=o[0];n=o[1]}
 return{k,n,txt:objTxt(k,n)};
}
function signContract(s,slot,amount,years,from){
 const obj=makeObj(s);
 const c={id:'k'+(G.nextId++),sid:s.id,slot,amount,from,end:from+years-1,obj,
  bonus:Math.round(amount*({locale:0.1,regionale:0.15,nazionale:0.2,internazionale:0.25}[s.size])/1000)*1000,
  base:from===SEASON&&G.phase==='season'?(G.st[obj.k]||0):0,done:false,sat:60};
 G.contracts.push(c);
 G.offers=G.offers.filter(o=>o.sid!==s.id);
 return c;
}
function contractProg(c){return activeIn(c,SEASON)?Math.max(0,(G.st[c.obj.k]||0)-(c.base||0)):0}
function checkSponsorObjectives(){
 for(const c of G.contracts){
  if(c.done||!activeIn(c,SEASON))continue;
  if(contractProg(c)>=c.obj.n){const s=SP(c.sid);c.done=true;G.cash+=c.bonus;c.sat=Math.min(100,c.sat+15);
   mail('Sponsor',`${s.name}: obiettivo raggiunto`,`${c.obj.txt}: fatto. Bonus di ${eur(c.bonus)} accreditato. Lo sponsor è più soddisfatto (${c.sat}%).`);
   NOTIFY(`Obiettivo ${s.name}: +${eurk(c.bonus)}`,'gold')}
 }
}
function sponsorRaceUpdate(dS){for(const c of G.contracts)if(activeIn(c,SEASON))c.sat=clamp(Math.round(c.sat+dS*(c.slot==='main'?1:0.7)),0,100);G.sponsor=sponsorSat()}

/* ---------- proposte e offerte ---------- */
function propose(s,slot,years){
 const from=slotStart(slot);
 if(from===null)return{ok:false,msg:`Nessun posto libero da ${SLOTS[slot].lab}.`};
 if(hasContract(s))return{ok:false,msg:`${s.name} è già tuo sponsor.`};
 if((s.cool||0)>absWeek())return{ok:false,msg:`${s.name} ti ha già risposto: riprova tra qualche settimana.`};
 const it=interest(s,slot);if(it.p<=0)return{ok:false,msg:it.why};
 const p=it.p*(years===3?0.9:1);
 if(R()<p){const c=signContract(s,slot,amountFor(s,slot),years,from);
  mail('Sponsor',`Accordo con ${s.name}`,`${SLOTS[slot].lab} dal ${from} al ${c.end}: ${eur(c.amount)} l'anno.\nObiettivo stagionale: ${c.obj.txt} (bonus ${eur(c.bonus)}).`);
  save();return{ok:true,msg:`${s.name} firma come ${SLOTS[slot].lab.toLowerCase()}: ${eurk(c.amount)} l'anno!`}}
 s.cool=absWeek()+8;save();
 return{ok:false,msg:`${s.name} per ora non è interessato. Riprova tra 8 settimane.`};
}
function makeOffer(s,renew,src){
 let slot=src?src.slot:s.size==='locale'?'partner':s.size==='regionale'?pick(['partner','co','co']):pick(['co','main']);
 let from=renew?SEASON+1:slotStart(slot);
 if(from===null&&!renew){slot='partner';from=slotStart(slot)}
 if(from===null)return null;
 const amount=renew?Math.round(src.amount*(0.95+src.sat/500)/1000)*1000:Math.round(amountFor(s,slot)*rnd(0.95,1.12)/1000)*1000;
 const o={id:'o'+(G.nextId++),sid:s.id,slot,amount,years:rint(1,3),from,exp:absWeek()+(renew?20:4),renew:!!renew};
 G.offers.push(o);
 mail('Sponsor',renew?`${s.name} vuole rinnovare`:`Proposta da ${s.name}`,`${s.name} (${s.city}, ${SPONSOR_SIZE[s.size].lab.toLowerCase()}) offre ${eur(o.amount)} l'anno come ${SLOTS[slot].lab.toLowerCase()} per ${o.years} ${o.years>1?'anni':'anno'}, dal ${from}.\nRispondi dalla sezione Sponsor${renew?'':' entro 4 settimane'}.`);
 NOTIFY(renew?`${s.name} vuole rinnovare`:`Nuova proposta: ${s.name}`,'ok');
 return o;
}
function weeklyOffers(force){
 G.offers=G.offers.filter(o=>o.exp>absWeek());
 if(G.offers.filter(o=>!o.renew).length>=4)return;
 if(!force&&R()>0.07+G.rep/350)return;
 const cand=G.sponsors.filter(s=>!hasContract(s)&&!G.offers.some(o=>o.sid===s.id)&&(s.cool||0)<=absWeek()).map(s=>({s,p:interest(s,s.size==='locale'?'partner':'co').p})).filter(o=>o.p>0.35);
 if(!cand.length)return;
 const tot=cand.reduce((a,o)=>a+o.p*o.p,0);let q=R()*tot;
 for(const o of cand){q-=o.p*o.p;if(q<=0){makeOffer(o.s,false);return}}
}
function acceptOffer(o){
 const s=SP(o.sid);
 if(!o.renew&&slotUsed(o.slot,o.from)>=SLOTS[o.slot].cap)return{ok:false,msg:`Non c'è più posto da ${SLOTS[o.slot].lab.toLowerCase()}.`};
 G.offers=G.offers.filter(x=>x!==o);
 const c=signContract(s,o.slot,o.amount,o.years,o.from);
 mail('Sponsor',`Accordo con ${s.name}`,`${SLOTS[o.slot].lab} dal ${c.from} al ${c.end}: ${eur(c.amount)} l'anno.\nObiettivo stagionale: ${c.obj.txt} (bonus ${eur(c.bonus)}).`);
 save();return{ok:true,msg:`Firmato con ${s.name}`};
}
function declineOffer(o){G.offers=G.offers.filter(x=>x!==o);const s=SP(o.sid);if(s)s.cool=absWeek()+10;save()}
function sponsorSeasonEnd(){
 for(const c of G.contracts.filter(c=>c.end===SEASON)){
  const s=SP(c.sid);
  if(c.sat>=50&&R()<0.45+c.sat/200)makeOffer(s,true,c);
  else mail('Sponsor',`${s.name} non rinnova`,`Il contratto da ${SLOTS[c.slot].lab.toLowerCase()} scade a fine ${SEASON} e lo sponsor non continua (soddisfazione ${c.sat}%). Cerca un sostituto nella sezione Sponsor.`);
 }
 for(let i=0;i<3;i++)weeklyOffers(true);
}
function licenceCheck(){
 const to=G.cat==='conti'?'pro':G.cat==='pro'?'wt':null;if(!to)return null;
 const L=LICENCE[to],inc=incomeIn(SEASON+1),rk=myCatRank();
 const reqs=[{t:`Sponsor garantiti per il ${SEASON+1}: almeno ${eurk(L.income)} (ora ${eurk(inc)})`,ok:inc>=L.income},
  {t:`Reputazione almeno ${L.rep} (ora ${Math.round(G.rep)})`,ok:G.rep>=L.rep},
  {t:`Tra le prime ${L.rank} della tua categoria (sei ${rk}ª)`,ok:rk<=L.rank}];
 return{to,reqs,ok:reqs.every(r=>r.ok)};
}
/* Sponsor iniziali: un main sponsor regionale e qualche partner del vicinato, per circa 1 milione */
function initialSponsors(){
 const near=G.sponsors.filter(s=>s.area===G.sede.reg).sort((a,b)=>spDist(a)-spDist(b));
 const reg=near.find(s=>s.size==='regionale')||near[0];
 const loc=near.filter(s=>s.size==='locale');
 const co=loc[0],partners=loc.slice(1,4);
 for(const s of [reg,co,...partners])if(s)s.req=0;
 const pAm=partners.map(()=>Math.round(rnd(35000,75000)/1000)*1000);
 const coAm=Math.round(rnd(120000,160000)/1000)*1000;
 const mainAm=1000000-coAm-pAm.reduce((a,b)=>a+b,0);
 const c1=signContract(reg,'main',mainAm,2,SEASON);
 if(co)signContract(co,'co',coAm,1,SEASON);
 partners.forEach((s,i)=>signContract(s,'partner',pAm[i],rint(1,2),SEASON));
 for(const c of G.contracts)c.base=0;
 return c1;
}
