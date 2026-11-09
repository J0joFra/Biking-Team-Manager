"use strict";
/* ============================================================
   STATO DI GIOCO, STAGIONE, ISCRIZIONI, MERCATO, STRUTTURE
   ============================================================ */
let G=null,SEASON=2027;
const SAVE_KEY='ammiraglia-save-v4';
const USED=new Set();
const PSEUDO={fa:{id:'fa',name:'Svincolato',short:'SV',tier:'none',nats:[]},jr:{id:'jr',name:'Juniores',short:'JR',tier:'none',nats:[]},acad:{id:'acad',name:'Scuola juniores',short:'SJ',tier:'none',nats:[]},x:{id:'x',name:'Ritirato',short:'—',tier:'none',nats:[]}};
const ME=()=>G.teams[0];
const RID=id=>G.riders[id];
function TEAM(id){return G.teams.find(t=>t.id===id)||PSEUDO[id]||PSEUDO.x}
let NOTIFY=()=>{};
const eur=n=>'€ '+Math.round(n).toLocaleString('it-IT');
const eurk=n=>(n<0?'−':'')+'€'+(Math.abs(n)>=1e6?(Math.abs(n)/1e6).toFixed(2).replace('.',',')+'M':Math.round(Math.abs(n)/1000)+'k');
const MESI=['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const MES3=['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
function weekDate(w){return new Date(SEASON,0,4+(w-1)*7)}
function weekLab(w){const d=weekDate(w);return`${d.getDate()} ${MES3[d.getMonth()]}`}
const catOf=r=>r.junior||r.team==='acad'?'Juniores':r.age<=22?'U23':'Elite';
const myCat=()=>CAT[G.cat];

function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(G))}catch(e){}}
function load(){try{const s=localStorage.getItem(SAVE_KEY);if(s){const g=JSON.parse(s);if(g&&g.v===4){SEASON=g.season;USED.clear();for(const id in g.riders)USED.add(g.riders[id].name);return g}}}catch(e){}return null}

/* ---------- corridori ---------- */
function uniqueName(N){let n;for(let k=0;k<40;k++){n=pick(N.f)+' '+pick(N.l);if(!USED.has(n))break}USED.add(n);return n}
function demand(r){const o=ovr(r);let d=12000+Math.max(0,o-55)**2*55;if(r.age<=21)d+=r.pot*20000;if(r.age>=32)d*=0.85;return d}
const SAL_MUL={wt:3.2,pro:2,conti:1,dev:1,me:1};
function genRider(team,nat,arch,age,boost=0){
 const A=ARCH[arch],N=NAMES[nat]||NAMES.ITA;
 const lvl={wt:0.35,pro:0.2,conti:0,dev:-0.05,me:0,fa:-0.04,jr:0,acad:0}[team.tier]||0;
 const ageAdj=age<=16?-0.5:age===17?-0.42:age===18?-0.32:age===19?-0.26:age===20?-0.18:age===21?-0.11:age===22?-0.05:age<=30?0:-0.025*(age-30);
 const pot=age<=22?clamp(R()*R()*1.15+R()*0.25+boost,0,1):0;
 const r={id:'r'+(G.nextId++),name:uniqueName(N),nat,age,team:team.id,arch,
  mass:+rnd(A.m[0],A.m[1]).toFixed(1),
  wkg:+(rnd(A.w[0],A.w[1])+lvl+ageAdj+gauss()*0.08+pot*0.05+boost*0.12).toFixed(3),
  spr:Math.round(rnd(A.s[0],A.s[1])+lvl*300+gauss()*50-(age<19?120:0)),
  tt:+rnd(A.tt[0],A.tt[1]).toFixed(3),
  endu:Math.round(clamp(rnd(A.e[0],A.e[1])+(age<21?-8:0)+(age<19?-8:0),20,99)),
  rec:Math.round(clamp(rnd(45,90)+(age<21?-6:0),20,99)),
  pot,form:+rnd(0.95,0.99).toFixed(3),fat:0,days:0,pts:0,wins:0,res:[],bF:0,bT:0,
  neo:age===19||(age===23&&R()<0.5),askMul:+rnd(0.92,1.1).toFixed(3)};
 if(['fa','jr','acad'].includes(team.tier)){r.sal=0;r.cEnd=0;if(team.tier!=='fa'){r.junior=true;r.neo=false}}
 else{r.sal=Math.round(demand(r)*(SAL_MUL[team.tier]||1)*rnd(0.85,1.12)/500)*500;r.cEnd=SEASON+(age<=25?rint(1,3):rint(0,2))}
 return r;
}
function genJuniors(n){for(let i=0;i<n;i++){const nat=R()<0.45?'ITA':pick(Object.keys(NAMES));const r=genRider({id:'jr',tier:'jr'},nat,pick(ARCH_MIX),18,R()<0.18?rnd(0.3,0.6):0);G.riders[r.id]=r}}
function moveRider(r,to){
 const from=G.teams.find(t=>t.id===r.team);if(from)from.riders=from.riders.filter(id=>id!==r.id);
 r.team=to;const tt=G.teams.find(t=>t.id===to);if(tt&&!tt.riders.includes(r.id))tt.riders.push(r.id);
}
const TEAM_SIZE={me:14,wt:25,pro:22,conti:13,dev:12},TEAM_U23={me:7,wt:3,pro:3,conti:5,dev:12};
function teamColor(i){return`hsl(${(i*137.5)%360} 55% 48%)`}

/* ---------- calendario ---------- */
function stageTypes(n,p){
 if(p==='G'){const a=['crono','piatta','mossa','piatta','collinare','piatta','montagna','mossa','montagna','crono','piatta','collinare','piatta','montagna','montagna','piatta','montagna','collinare','montagna','mossa','piatta'];if(R()<0.5)a[0]='piatta';if(R()<0.5){a[4]='montagna';a[13]='collinare'}return a}
 const T={F:['piatta','piatta','mossa','piatta','crono','piatta','mossa','piatta'],M:['piatta','mossa','collinare','crono','montagna','piatta','montagna','mossa'],H:['collinare','mossa','collinare','montagna','crono','collinare','montagna','mossa'],A:['mossa','montagna','collinare','montagna','crono','montagna','montagna','piatta']};
 let a=T[p].slice(0,n);
 if(n<5)a=a.map(t=>t==='crono'?'collinare':t);
 if(n>=6&&R()<0.35)a[0]='prologo';
 return a;
}
function buildRaces(){
 return RACES.map((d,i)=>{
  const[name,ctry,w,cls,spec,flag]=d,tier=CLS_TIER[cls];
  let stages;
  if(/^\d+:/.test(spec)){const[n,p]=spec.split(':');stages=stageTypes(+n,p).map(t=>({t,seed:Math.floor(R()*1e9)}))}
  else{const[t,km]=spec.split(':');stages=[{t,km:+km,seed:Math.floor(R()*1e9)}]}
  const n=stages.length;
  return{id:'g'+i+'_'+SEASON,name,ctry,w,cls,lab:CLS_LAB[cls]||cls,tier,stages,dur:n>=15?3:n>=8?2:1,flag:flag||null,status:'open',sel:null,cap:null,result:null};
 });
}

/* ---------- nuova partita ---------- */
function newGame(name,jersey,sede){
 const seed=Math.floor(Math.random()*1e9);
 R=mulberry32(seed);SEASON=2027;USED.clear();
 G={v:4,season:SEASON,name,jersey,sede,cat:'conti',seed,week:5,phase:'season',teams:[],riders:{},races:[],nextId:1,sponsor:60,rep:20,cash:100000,
  news:[],inbox:[],sponsors:[],contracts:[],offers:[],exp:{},camps:[],academy:{level:0,focus:'ITA',log:[]},history:[],
  mk:{sub:'renew',cat:'all',role:'all'},calf:'acc',tab:'home',rankf:'mine',st:{},kmFuga:0,bids:[],train:{s1:'fondo',s2:'soglia',last:null}};
 const short=name.replace(/[^A-Za-zÀ-ÿ ]/g,'').split(/\s+/).filter(Boolean).map(w=>w[0]).join('').slice(0,3).toUpperCase()||'ME';
 G.teams.push({id:'t0',name,short,tier:'me',nats:['ITA'],color:'var(--accent)',riders:[]});
 AI_TEAMS.forEach((d,i)=>G.teams.push({id:'t'+(i+1),name:d[0],short:d[1],tier:d[2],nats:d[3],color:teamColor(i+1),riders:[]}));
 for(const t of G.teams){
  const n=TEAM_SIZE[t.tier],nU=TEAM_U23[t.tier];
  const mix=shuffle(ARCH_MIX.slice()).slice(0,n);
  if(!mix.includes('velocista'))mix[0]='velocista';
  if(!mix.includes('scalatore'))mix[1]='scalatore';
  for(let i=0;i<n;i++){
   const age=i<nU?rint(19,22):rint(23,33);
   const nat=t.tier==='me'?(R()<0.75?'ITA':pick(['SLO','ESP','COL','FRA'])):pick(t.nats);
   const r=genRider(t,nat,mix[i],age,(t.tier==='me'&&i===0)?0.55:0);
   G.riders[r.id]=r;t.riders.push(r.id);
  }
 }
 for(let i=0;i<24;i++){const age=R()<0.25?rint(20,22):rint(23,33);const r=genRider({id:'fa',tier:'fa'},pick(Object.keys(NAMES)),pick(ARCH_MIX),age);G.riders[r.id]=r}
 genJuniors(16);
 G.races=buildRaces();
 G.sponsors=genSponsors();
 const main=initialSponsors();
 mail('DS','Benvenuto in ammiraglia',`La ${name} nasce a ${sede.city} come squadra Continental. Il primo main sponsor è ${main.name}, un'azienda della tua regione: con i partner del territorio garantisce circa ${eur(incomeIn(SEASON))} per questa stagione, versati settimana per settimana.\n\nIscriviti alle corse dal Calendario: ogni gara ha una quota d'iscrizione e costi di trasferta. WorldTour e Grandi Giri sono riservati alle squadre di categoria superiore: per salire servono sponsor più grandi, che si conquistano partendo dal vicinato.`);
 mail('Sponsor','Gli sponsor e i loro obiettivi',G.contracts.map(c=>`• ${SP(c.sid).name} (${SLOTS[c.slot].lab}): ${c.obj.txt} → bonus ${eur(c.bonus)}`).join('\n'));
 R=Math.random;save();
}

/* ---------- finanze ---------- */
function payroll(){return ME().riders.reduce((a,id)=>a+RID(id).sal,0)}
function academyCost(){return G.academy.level*40000}
function seasonWeeks(){return WEEK_END-4}
function weeklyCost(){return(payroll()+myCat().staff+academyCost())/seasonWeeks()}
function remWeeks(){return G.phase!=='season'?0:Math.max(0,WEEK_END-G.week+1)}
function projected(extra=0){return G.cash+remWeeks()*(weeklyIncome()-weeklyCost())-extra}
function mail(from,title,body){G.inbox.unshift({id:'m'+(G.nextId++),w:G.week,s:SEASON,from,title,body,read:false});G.inbox=G.inbox.slice(0,60)}
function addNews(t){G.news.unshift({s:SEASON,t});G.news=G.news.slice(0,40)}

/* ---------- classifiche ---------- */
function teamPoints(t){return t.riders.reduce((a,id)=>a+(RID(id)?RID(id).pts:0),0)}
function tierOfTeam(t){return t.id==='t0'?G.cat:t.tier}
function teamRanking(tier){return G.teams.filter(t=>!tier||tierOfTeam(t)===tier||(tier==='conti'&&tierOfTeam(t)==='dev')).map(t=>({t,p:teamPoints(t)})).sort((a,b)=>b.p-a.p)}
function myRank(){return teamRanking().findIndex(o=>o.t.id==='t0')+1}
function myCatRank(){return teamRanking(G.cat).findIndex(o=>o.t.id==='t0')+1}

/* ---------- accesso alle corse ---------- */
function feeOf(race){const T=TIERS[race.tier];return Math.round((T.fee+T.prd*Math.min(T.size,8)*race.stages.length)*(race.ctry==='ITA'?1:1.2)/100)*100}
function access(race){
 const t=race.tier,c=G.cat;
 if(t==='jun')return{ok:false,why:'Gara juniores: ci corrono i ragazzi della tua scuola'};
 if(t==='nc'||t==='crit')return{ok:true,mode:'fee'};
 if(t==='u23')return c==='conti'?{ok:true,mode:'fee'}:{ok:false,why:'Riservata a Continental e squadre Under 23'};
 if(t==='c2')return c==='conti'?{ok:true,mode:'fee'}:{ok:false,why:'ProTeam e WorldTeam non corrono la classe 2'};
 if(t==='c1')return{ok:true,mode:'fee'};
 if(t==='pro'){if(c==='conti')return{ok:true,mode:'invite',chance:clamp(0.15+G.rep/110+(race.ctry==='ITA'?0.12:0),0.05,0.9)};return{ok:true,mode:'fee'}}
 if(c==='conti')return{ok:false,why:'Le Continental non possono correre il WorldTour'};
 if(c==='wt')return{ok:true,mode:'fee'};
 const pr=teamRanking('pro').findIndex(o=>o.t.id==='t0')+1;
 if(pr>0&&pr<=2)return{ok:true,mode:'fee',auto:true};
 const home=race.ctry==='ITA'?1:0;
 const ch=race.tier==='gt'?0.04+G.rep/230+home*0.3:0.12+G.rep/160+home*0.15;
 return{ok:true,mode:'invite',chance:clamp(ch,0.02,0.95)};
}
function chanceLab(c){return c>=0.7?'alta':c>=0.4?'media':c>=0.15?'bassa':'minima'}
function singlesFee(race){const T=TIERS[race.tier];return Math.round((T.fee*0.15+T.prd*race.stages.length)*(race.ctry==='ITA'?1:1.2)/100)*100}
function register(race,mode){
 if(race.w<=G.week)return{ok:false,msg:'Iscrizioni chiuse: serve almeno una settimana di anticipo.'};
 const a=access(race);if(!a.ok)return{ok:false,msg:a.why};
 const singles=mode==='singles'&&indivOk(race)&&a.mode==='fee';
 const fee=singles?singlesFee(race):feeOf(race);
 if(G.cash<fee)return{ok:false,msg:`Non hai i soldi per la quota (${eur(fee)}).`};
 if(a.mode==='invite'){
  if(R()>=a.chance){race.status='declined';save();return{ok:false,msg:`${race.name}: l'organizzazione ha scelto altre squadre.`,declined:true}}
 }
 G.cash-=fee;race.status='reg';race.fee=fee;race.mode=singles?'singles':'team';save();
 if(singles)return{ok:true,msg:`Iscrizione per singoli a ${race.name}: ${eur(fee)} a corridore, il resto si paga alle convocazioni.`};
 return{ok:true,msg:a.mode==='invite'?`Invito accettato! Iscritti a ${race.name} (${eur(fee)}).`:`Iscritti a ${race.name} (${eur(fee)}).`};
}
function withdraw(race){if(race.status!=='reg')return;G.cash+=Math.round((race.fee||0)*0.5);race.status='open';G.rep=Math.max(0,G.rep-1);save()}

/* ---------- disponibilità e formazioni ---------- */
function recRate(r,w=G.week){return(34+r.rec*0.22)*(r.injRec&&w<=r.injRec?0.55:1)*(r.age>=33?0.9:1)}
function recDays(r){return r.fat<3?0:Math.ceil(r.fat/(recRate(r)/7))}
function injured(r,w=G.week){return r.injUntil&&r.injUntil>=w}
function injure(r,weeks,from){r.injUntil=from+weeks;r.injRec=r.injUntil+3;r.form=Math.max(0.9,r.form-0.01*weeks);if(r.team==='t0'){mail('Medico',`${r.name} infortunato`,`Stop di ${weeks} settiman${weeks>1?'e':'a'} (rientro il ${weekLab(r.injUntil+1)}). Al rientro recupererà la fatica più lentamente per altre 3 settimane.`);NOTIFY(`${r.name} infortunato: ${weeks} sett.`,'bad')}}
function inCamp(r,w0,w1){return G.camps.some(c=>!c.cancel&&c.riders.includes(r.id)&&c.from<=w1&&c.to>=w0)}
function busy(r,w0,w1){return(r.bT>=w0&&r.bF<=w1)||(r.injUntil&&r.injUntil>=w0)||(r.team==='t0'&&inCamp(r,w0,w1))}
function ageOk(r,race){if(race.tier==='u23'||race.flag==='u23')return r.age<=22;if(race.flag==='elite')return r.age>22;return true}
function canRace(r,race){return!busy(r,race.w,race.w+race.dur-1)&&ageOk(r,race)&&(race.tier!=='nc'||r.nat==='ITA')}
function whyCant(r,race){
 if(race.tier==='nc'&&r.nat!=='ITA')return'Solo corridori italiani';
 if(!ageOk(r,race))return race.flag==='elite'?'Solo Elite':'Solo Under 23';
 if(injured(r,race.w))return`Infortunato fino al ${weekLab(r.injUntil)}`;
 if(r.team==='t0'&&inCamp(r,race.w,race.w+race.dur-1))return'In ritiro in altura';
 if(busy(r,race.w,race.w+race.dur-1))return'Impegnato in un\'altra corsa';
 return'';
}
function avgSuit(r,race){return race.stages.reduce((a,s)=>a+suitType(r,s.t),0)/race.stages.length}
function wsample(arr,n,wf){const pool=arr.slice(),out=[];while(out.length<n&&pool.length){let tot=0;for(const x of pool)tot+=wf(x);let q=R()*tot,k=0;for(;k<pool.length-1;k++){q-=wf(pool[k]);if(q<=0)break}out.push(pool.splice(k,1)[0])}return out}
function pickTeams(race,meIn){
 const ai=G.teams.slice(1),by=t=>ai.filter(x=>x.tier===t),wf=x=>1+(x.nats.includes(race.ctry)?1.5:0);
 switch(race.tier){
  case'gt':case'uwt1':case'uwt2':case'mon':return by('wt').concat(wsample(by('pro'),(race.tier==='gt'?4:5)-(meIn?1:0),x=>wf(x)+teamPoints(x)/300));
  case'pro':return wsample(by('wt'),rint(6,9),wf).concat(wsample(by('pro'),8,wf)).concat(wsample(by('conti'),rint(3,5)-(meIn?1:0),wf));
  case'c1':return wsample(by('wt'),rint(1,3),wf).concat(wsample(by('pro'),6,wf)).concat(wsample(by('conti'),11-(meIn?1:0),wf));
  case'c2':case'u23':return wsample(by('conti').concat(by('dev')),21,wf);
  case'crit':return wsample(by('conti').concat(by('dev')),11,wf).concat(wsample(by('pro'),4,wf)).concat(wsample(by('wt'),2,wf));
  case'nc':return ai.filter(t=>t.riders.some(id=>RID(id).nat==='ITA'));
 }
 return[];
}
function aiSelect(team,race,size){
 const el=team.riders.map(RID).filter(r=>canRace(r,race)&&r.days<88);
 return el.map(r=>({r,s:avgSuit(r,race)-r.fat*0.35-(r.days>60?(r.days-60)*1.5:0)+(race.tier==='gt'?r.endu*0.1:0)+rnd(0,9)})).sort((a,b)=>b.s-a.s).slice(0,size).map(o=>o.r);
}
function buildField(race,mine){
 const T=TIERS[race.tier],field=[];
 if(mine)for(const r of mine)field.push(r);
 for(const t of pickTeams(race,!!mine)){
  const size=race.tier==='nc'?(race.stages[0].t==='crono'?2:6):T.size;
  const sel=aiSelect(t,race,size);
  if(sel.length<(race.tier==='nc'?1:4))continue;
  field.push(...sel);
 }
 for(const r of field){r.bF=race.w;r.bT=race.w+race.dur-1}
 return field;
}

/* ---------- contesto di gara ---------- */
function newRC(race){
 const mine=race.sel.map(RID);
 const field=buildField(race,mine);
 const RC={race,field,stage:0,fat:{},gc:{},stages:[],stageRace:race.stages.length>1,kmFuga:{},out:new Set()};
 for(const r of field){RC.gc[r.id]={t:0,pts:0,kom:0};RC.fat[r.id]=0;RC.kmFuga[r.id]=0}
 return RC;
}
function teamGcOrder(RC){return Object.entries(RC.teamGc||{}).filter(([k,t])=>t!==null).map(([k,t])=>({k,t})).sort((a,b)=>a.t-b.t)}
function indivOk(race){return race.stages.length===1&&['c2','u23','crit','nc','c1'].includes(race.tier)}
function minRiders(race){return indivOk(race)||race.mode==='singles'?1:4}
function gcOrder(RC){return RC.field.filter(r=>!RC.out.has(r.id)).map(r=>({id:r.id,team:RC.nat?'n_'+r.nat:r.team,t:RC.gc[r.id].t})).sort((a,b)=>a.t-b.t)}
function stageCtx(RC){
 const st=RC.race.stages[RC.stage];
 const course=genCourse(st.t,st.seed,st.km,TIERS[RC.race.tier].lf);
 const gcGap={};
 if(RC.stageRace&&RC.stage>0){const o=gcOrder(RC);const t0=o[0].t;for(const x of o)gcGap[x.id]=x.t-t0}
 let tactic=RC.tactic||null;
 if(tactic&&RC.tacStage!==RC.stage){tactic=JSON.parse(JSON.stringify(tactic));for(const k in tactic)if(tactic[k].zone&&tactic[k].zone.startsWith('climb:'))tactic[k].zone='last'}
 return{tactic,course,entrants:RC.field.filter(r=>!RC.out.has(r.id)).map(r=>({r})),fat:RC.fat,gcGap,stageRace:RC.stageRace,stageIdx:RC.stage,capId:RC.race.cap,week:RC.race.w};
}
const FIN_PTS_FLAT=[25,20,16,14,12,10,8,6,4,2],FIN_PTS_HILL=[20,16,12,10,8,6,4,3,2,1],FIN_PTS_TT=[10,8,6,4,2];
const KOM_PTS={HC:[20,15,12,10,8,6,4,2],'1':[10,8,6,4,2,1],'2':[5,3,2,1],'3':[3,2,1],'4':[1]};
function finishStage(RC,res,S,course){
 const road=ROAD(course.type);
 const sr={type:course.type,len:course.len,res,climbs:course.climbs,koms:[],sprint:[],otl:[]};
 if(road&&res.length>5){
  const t0=Math.min(...res.map(x=>x.time)),lim=t0*(1+(TIME_CUT[course.type]||0.15));
  const otl=res.filter(x=>x.time>lim);
  if(otl.length>res.length*0.2)sr.rescued=otl.length;
  else if(otl.length){res=res.filter(x=>x.time<=lim);sr.res=res;sr.otl=otl.map(x=>x.id);for(const x of otl)RC.out.add(x.id);
   const mine=otl.filter(x=>x.team==='t0');if(mine.length)NOTIFY(`Fuori tempo massimo: ${mine.map(x=>RID(x.id).name).join(', ')}`,'bad')}
 }
 for(const x of res)RC.gc[x.id].t+=x.time;
 if(RC.stageRace){RC.teamGc=RC.teamGc||{};const by={};
  for(const x of res){const k=RC.nat?'n_'+RID(x.id).nat:RID(x.id).team;(by[k]=by[k]||[]).push(x.time)}
  for(const k of new Set(RC.field.map(r=>RC.nat?'n_'+r.nat:r.team))){const ts=(by[k]||[]).sort((a,b)=>a-b);RC.teamGc[k]=ts.length>=3&&RC.teamGc[k]!==null?(RC.teamGc[k]||0)+ts[0]+ts[1]+ts[2]:null}}
 if(RC.stageRace&&road)[10,6,4].forEach((b,i)=>{if(res[i])RC.gc[res[i].id].t-=b});
 if(S){
  if(RC.stageRace&&S.sprint.length){[3,2,1].forEach((b,i)=>{if(S.sprint[i])RC.gc[S.sprint[i].id].t-=b});[6,4,2].forEach((p,i)=>{if(S.sprint[i])RC.gc[S.sprint[i].id].pts+=p})}
  course.climbs.forEach((cb,j)=>{const arr=S.kom[j]||[];(KOM_PTS[cb.cat]||[]).forEach((p,i)=>{if(arr[i])RC.gc[arr[i].id].kom+=p});sr.koms.push(arr.slice(0,3).map(x=>x.id))});
  sr.dnf=S.riders.filter(x=>x.dnf).map(x=>x.id);sr.crashes=S.crashes||0;sr.wx=S.wx||null;
  for(const x of S.riders){RC.fat[x.id]+=(100-x.E)*0.2*(1.2-x.r.rec/200);RC.kmFuga[x.id]+=x.kmFuga;
   if(x.dnf)RC.out.add(x.id);if(x.inj)injure(x.r,x.inj,RC.race.w+RC.race.dur-1)}
 }else for(const x of res)RC.fat[x.id]+=5;
 const fp=!road?FIN_PTS_TT:(course.type==='piatta'||course.type==='mossa')?FIN_PTS_FLAT:FIN_PTS_HILL;
 fp.forEach((p,i)=>{if(res[i])RC.gc[res[i].id].pts+=p});
 RC.stages.push(sr);RC.stage++;
}
function jerseys(RC){
 const ids=RC.field.map(r=>r.id),gc=gcOrder(RC);
 const best=f=>{let b=null,bv=0;for(const id of ids){const v=f(id);if(v>bv){bv=v;b=id}}return b};
 return{gc:gc[0]&&gc[0].id,pts:best(id=>RC.gc[id].pts),kom:best(id=>RC.gc[id].kom),young:RC.race.tier==='u23'?null:(gc.find(x=>RID(x.id).age<=22)||{}).id};
}
function applyOutcome(race,field,final,stagesRes,RC){
 const T=TIERS[race.tier],award={},add=(id,p)=>{if(p>0)award[id]=(award[id]||0)+Math.round(p)};
 if(T.win)POINTS_D.forEach((d,i)=>{if(final[i])add(final[i].id,T.win*d)});
 if(stagesRes.length>1&&T.st)for(const s of stagesRes)[1,0.4,0.25].forEach((d,i)=>{if(s[i])add(s[i].id,T.st*d)});
 for(const id in award)RID(id).pts+=award[id];
 const wins=[];
 if(stagesRes.length>1){for(const s of stagesRes)if(s[0])wins.push(s[0].id);if(final[0])wins.push(final[0].id)}else if(final[0])wins.push(final[0].id);
 for(const id of wins)RID(id).wins++;
 const days=race.stages.length,hard=race.stages.reduce((a,s)=>a+HARD[s.t],0);
 for(const r of field){
  r.days+=days;
  r.fat=clamp(r.fat+hard*(1.15-r.rec/200)*(r.days>70?1.4:1)*(days>1?0.75:1)+((RC&&RC.fat[r.id])||0)*0.15,0,100);
  r.form=clamp(r.form+days*(r.fat<45?0.005:r.fat<70?0.0005:-0.006),0.9,1.045);
  if(r.age<=22)r.wkg=+(r.wkg+days*(0.0015+0.0045*r.pot)).toFixed(4);
  if(!RC&&R()<0.002*days)injure(r,rint(1,4),race.w+race.dur-1);
  const pos=final.findIndex(x=>x.id===r.id)+1;
  if(r.team==='t0'||pos<=3){r.res.push({name:race.name,cls:race.lab,pos,n:final.length,w:wins.filter(w=>w===r.id).length});if(r.res.length>40)r.res.shift()}
 }
 race.status='done';
 race.result={top:final.slice(0,10).map(x=>({id:x.id,name:RID(x.id).name,team:TEAM(x.team).short,t:x.time})),winner:final[0]?RID(final[0].id).name:'',winnerTeam:final[0]?TEAM(final[0].team).name:'',
  stageW:stagesRes.length>1?stagesRes.map(s=>s[0]?RID(s[0].id).name:''):null,n:final.length};
 return{award,wins,final};
}
function finishMyRace(RC){
 const race=RC.race,T=TIERS[race.tier];
 const final=RC.stageRace?gcOrder(RC).map(x=>({id:x.id,team:x.team,time:x.t})):RC.stages[0].res;
 const{award,wins}=applyOutcome(race,RC.field,final,RC.stages.map(s=>s.res),RC);
 const mine=RC.field.filter(r=>r.team==='t0');
 const pos=id=>{const i=final.findIndex(x=>x.id===id);return i<0?999:i+1};
 const myPts=mine.reduce((a,r)=>a+(award[r.id]||0),0);
 const kmF=mine.reduce((a,r)=>a+RC.kmFuga[r.id],0);
 const bestPos=Math.min(...mine.map(r=>pos(r.id)));
 const myWins=wins.filter(id=>RID(id).team==='t0').length;
 const rel=T.win?myPts/T.win:(bestPos<=3?0.6:bestPos<=10?0.25:0);
 const dS=clamp(Math.round((Math.min(kmF,150)*0.02+rel*8+myWins*4-(bestPos>20?4:bestPos>10?1:0))*Math.sqrt(T.spf)),-8,15);
 const dR=clamp(rel*6*Math.pow(T.spf,0.7)+myWins*1.5-(bestPos>30?0.5:0),-2,10);
 const prize=T.prize?mine.reduce((a,r)=>a+(T.prize[pos(r.id)-1]||0),0):Math.round(myPts*120+myWins*800*T.spf);
 for(const r of mine){r.myRaces=(r.myRaces||0)+1;if(race.cap===r.id)r.capN=(r.capN||0)+1;const p=pos(r.id);if(wins.includes(r.id))r.mood=Math.min(100,(r.mood??65)+5);else if(p<=3)r.mood=Math.min(100,(r.mood??65)+2)}
 sponsorRaceUpdate(dS);G.rep=clamp(G.rep+dR,0,100);G.cash+=prize;G.kmFuga+=kmF;
 const st=G.st;st.wins=(st.wins||0)+myWins;st.fuga=(st.fuga||0)+kmF;
 if(race.ctry==='ITA')st.ita=(st.ita||0)+1;else G.exp[race.ctry]=(G.exp[race.ctry]||0)+1;
 st['ctry_'+race.ctry]=(st['ctry_'+race.ctry]||0)+1;
 if(RACE_REG[race.name])st['reg_'+RACE_REG[race.name]]=(st['reg_'+RACE_REG[race.name]]||0)+1;
 st.top10=(st.top10||0)+mine.filter(r=>pos(r.id)<=10).length;
 if(race.tier==='u23'&&bestPos<=3)st.u23pod=(st.u23pod||0)+1;
 if(race.tier==='pro')st.pro=(st.pro||0)+1;
 if(['gt','mon','uwt1','uwt2'].includes(race.tier))st.wt=(st.wt||0)+1;
 race.result.mine=mine.map(r=>({id:r.id,name:r.name,pos:pos(r.id),pts:award[r.id]||0,km:Math.round(RC.kmFuga[r.id])})).sort((a,b)=>a.pos-b.pos);
 let teamRank=null,teamTop=null;
 if(RC.stageRace&&RC.teamGc){const tg=teamGcOrder(RC);teamTop=tg.slice(0,5).map(o=>({name:TEAM(o.k).name,t:o.t,me:o.k==='t0'}));const i=tg.findIndex(o=>o.k==='t0');teamRank=i<0?null:i+1;
  if(teamRank===1){G.rep=clamp(G.rep+2,0,100);sponsorRaceUpdate(3);G.cash+=Math.round(2000*T.spf);mail('DS',`${race.name}: prima nella classifica a squadre`,'La squadra vince la classifica a squadre: reputazione e sponsor ne beneficiano.')}}
 Object.assign(race.result,{teamRank,teamTop,myPts,kmF:Math.round(kmF),dS,dR:+dR.toFixed(1),prize,myWins,bestPos,jer:RC.stageRace?jerseys(RC):null});
 if(myWins)mail('DS',`Vittoria a ${race.name}!`,`${wins.filter(id=>RID(id).team==='t0').map(id=>RID(id).name).join(', ')} porta a casa ${myWins>1?myWins+' vittorie':'la vittoria'}. Premi: ${eur(prize)}.`);
 checkSponsorObjectives();save();
 return race.result;
}
function quickRace(race){
 const field=buildField(race,null);
 if(field.length<10){race.status='done';race.result=null;return}
 const fat={},gc={};for(const r of field){fat[r.id]=0;gc[r.id]=0}
 const stagesRes=[],multi=race.stages.length>1;
 for(const st of race.stages){
  const res=quickStage(field,st.t,fat,race.w);
  for(const x of res)gc[x.id]+=x.time;
  if(multi&&ROAD(st.t))[10,6,4].forEach((b,i)=>{if(res[i])gc[res[i].id]-=b});
  stagesRes.push(res);for(const r of field)fat[r.id]+=HARD[st.t]*0.6;
 }
 const final=multi?field.map(r=>({id:r.id,team:r.team,time:gc[r.id]})).sort((a,b)=>a.time-b.time):stagesRes[0];
 applyOutcome(race,field,final,stagesRes,null);
}

/* ---------- settimana ---------- */
const TIER_ORDER={gt:0,mon:1,uwt2:2,uwt1:3,pro:4,c1:5,nc:6,c2:7,u23:8,jun:9};
function myPending(){return G.races.filter(r=>r.w===G.week&&r.status==='reg')}
function nextMyRace(){return G.races.filter(r=>r.status==='reg'&&r.w>=G.week).sort((a,b)=>a.w-b.w)[0]}
function advanceWeek(){
 if(G.phase!=='season')return false;
 if(myPending().length)return false;
 const w=G.week;
 for(const race of G.races.filter(r=>r.w===w&&r.status!=='done'&&r.tier!=='jun'&&r.tier!=='naz').sort((a,b)=>TIER_ORDER[a.tier]-TIER_ORDER[b.tier]))quickRace(race);
 for(const race of G.races.filter(r=>r.w===w&&r.tier==='jun'&&r.status==='open'))juniorRace(race);
 weekTick(w);
 if(typeof weeklyBids==='function')weeklyBids();
 G.week++;
 if(G.week>WEEK_END)endOfSeason();
 save();return true;
}
function advanceToNext(){
 let n=0;
 while(G.phase==='season'&&!myPending().length&&n<60){
  const w=G.week;advanceWeek();n++;
  if(G.camps.some(c=>c.to===w&&c.done&&!c.seen))break;
 }
 return n;
}
function weekTick(w){
 if(typeof weeklyTraining==='function')weeklyTraining(w);
 if(typeof weeklyMood==='function'&&w%6===0)weeklyMood(w);
 for(const id in G.riders){const r=G.riders[id];
  if(injured(r,w)){r.fat=Math.max(0,r.fat-recRate(r,w));r.form=Math.max(0.9,r.form-0.008)}
  else if(r.team==='t0'&&inCamp(r,w,w)){r.fat=Math.max(0,r.fat-recRate(r,w)*0.5);r.form=Math.min(1.045,r.form+0.004)}
  else{r.fat=Math.max(0,r.fat-recRate(r,w));r.form+=(0.972-r.form)*0.06;if(R()<0.0015)injure(r,rint(1,3),w)}
 }
 if(w<=WEEK_END)G.cash+=weeklyIncome()-weeklyCost();
 for(const c of G.camps)if(c.to===w&&!c.done)finishCamp(c);
 academyWeek();
 if(w>=31)poach();
 checkSponsorObjectives();
 weeklyOffers(false);
}

/* ---------- ritiri in altura ---------- */
function campCost(loc,weeks,n){return CAMPS.find(c=>c.id===loc).cost*weeks*n}
function bookCamp(loc,from,weeks,ids){
 const L=CAMPS.find(c=>c.id===loc),cost=campCost(loc,weeks,ids.length);
 G.cash-=cost;
 const c={id:'c'+(G.nextId++),loc,from,to:from+weeks-1,weeks,riders:ids.slice(),cost,done:false};
 G.camps.push(c);
 mail('Preparatore',`Ritiro prenotato: ${L.name}`,`${ids.length} corridori a ${L.alt} m dal ${weekLab(from)} per ${weeks} settimane. Costo ${eur(cost)}.\n\nIn ritiro non possono correre. Il picco di forma arriva 1–3 settimane dopo il rientro: programmalo prima degli obiettivi.`);
 save();return c;
}
function cancelCamp(c){if(c.from<=G.week)return;G.cash+=Math.round(c.cost*0.5);G.camps=G.camps.filter(x=>x!==c);save()}
function finishCamp(c){
 const L=CAMPS.find(x=>x.id===c.loc),lines=[];
 for(const id of c.riders){const r=RID(id);if(!r||r.team!=='t0')continue;
  const resp=R()<0.2?0.45:R()<0.35?0.75:1;
  const amt=(c.weeks>=3?0.045:0.03)*resp*(1+(L.alt-1800)/2000*0.4);
  r.alt={w:c.to+1,amt:+amt.toFixed(4)};
  if(r.age<=23)r.wkg=+(r.wkg+0.008+0.012*resp).toFixed(4);
  lines.push(`• ${r.name}: ${resp>=1?'risposta ottima':resp>=0.75?'buona risposta':'risposta scarsa'}, +${(amt*100).toFixed(1)}% di soglia al picco`);
 }
 c.done=true;
 mail('Preparatore',`Ritiro concluso: ${L.name}`,`${lines.join('\n')}\n\nIl picco arriva tra 1 e 3 settimane, poi l'effetto cala.`);
 NOTIFY(`Ritiro a ${L.name} concluso`,'ok');
}

/* ---------- scuola juniores ---------- */
function acadCap(){return 4+2*G.academy.level}
function acadJuniors(){return Object.values(G.riders).filter(r=>r.team==='acad')}
function upgradeAcademy(){
 const L=G.academy.level;if(L>=5)return false;const cost=ACAD_UP[L+1];
 if(G.cash<cost)return false;
 G.cash-=cost;G.academy.level++;
 if(L===0){intake();mail('Scuola','La scuola juniores è aperta',`I primi ragazzi sono arrivati. Ogni anno ne entrano di nuovi: più alto è il livello, più sono talentuosi. A 18 anni puoi farli passare in squadra come Under 23.`)}
 save();return true;
}
function intake(){
 const lv=G.academy.level,n=1+lv,room=acadCap()-acadJuniors().length;
 const got=[];
 for(let i=0;i<Math.min(n,room);i++){
  const nat=pick(ACAD_FOCUS[G.academy.focus]);
  const r=genRider({id:'acad',tier:'acad'},nat,pick(ARCH_MIX),pick([16,17]),lv*0.05+(R()<0.04*lv?0.3:0));
  r.joined={s:SEASON,wkg:r.wkg};G.riders[r.id]=r;got.push(r);
 }
 return got;
}
function academyWeek(){
 const lv=G.academy.level;if(!lv)return;
 for(const r of acadJuniors())r.wkg=+(r.wkg+0.0012*(1+0.15*lv)*(0.5+r.pot)).toFixed(4);
}
function juniorRace(race){
 race.status='done';
 const js=acadJuniors();if(!G.academy.level||!js.length){race.result=null;return}
 const t=race.stages[0].t;
 const ph=Array.from({length:90},()=>58+gauss()*7);
 const out=js.map(r=>{const s=suitType(r,t)+gauss()*5;return{r,pos:1+ph.filter(p=>p>s).length}}).sort((a,b)=>a.pos-b.pos);
 race.result={junior:out.map(o=>({name:o.r.name,pos:o.pos}))};
 const best=out[0];
 for(const o of out)o.r.res.push({name:race.name,cls:'MJ',pos:o.pos,n:91,w:o.pos===1?1:0});
 if(best.pos<=10){
  const line=`${best.r.name} ${best.pos}° a ${race.name}`;
  G.academy.log.unshift({s:SEASON,t:line});G.academy.log=G.academy.log.slice(0,20);
  if(best.pos<=3){G.rep=clamp(G.rep+1,0,100);mail('Scuola',line,`Bel risultato per la scuola juniores. La reputazione della squadra cresce.`)}
 }
}
function promoteJunior(r,sal,years){r.next={team:'t0',sal,cEnd:SEASON+years};save()}
function releaseJunior(r){delete G.riders[r.id];save()}

/* ---------- mercato ---------- */
function myRoster(){return ME().riders.length}
function incoming(){return Object.values(G.riders).filter(r=>r.next&&r.next.team==='t0')}
function nextRoster(){return ME().riders.map(RID).filter(r=>!r.leavingTo&&r.cEnd>SEASON).length+incoming().length}
function win(){
 const off=G.phase!=='season',cw=off?99:G.week;
 const now=off||cw<=7||(cw>=27&&cw<=34),next=off||cw>=31;
 let label=off?'Mercato di fine stagione: trattative aperte per il '+(SEASON+1):cw<=7?'Finestra invernale aperta fino a metà febbraio':(cw>=27&&cw<=34)?'Finestra estiva aperta fino a fine agosto':cw<27?'Trasferimenti chiusi: la finestra estiva apre a luglio':'Trasferimenti chiusi fino a fine stagione';
 if(!off&&next)label+=` · pre-contratti per il ${SEASON+1} aperti`;
 else if(!off&&cw<31)label+=' · rinnovi sempre possibili';
 return{now,next,off,label,id:SEASON+(off?'o':cw<=7?'w':cw<=34?'s':'a')};
}
function negMode(r){
 const w=win();
 if(r.team==='t0')return(r.cEnd===SEASON&&!r.renewed&&!r.leavingTo)?'renew':null;
 if(r.next||r.team==='acad')return null;
 if(r.team==='jr')return r.age>=18?'pre':null;
 if(r.team==='fa')return w.now?'sign':null;
 const t=TEAM(r.team);
 if(w.next&&r.cEnd===SEASON)return'pre';
 if(w.now&&t.tier!=='wt'&&TIER_RANK[t.tier]<=myCat().rank)return'buy';
 return null;
}
function whyNot(r){
 const w=win();
 if(r.team==='t0')return r.leavingTo?'Ha già firmato altrove':r.renewed?'Già rinnovato':`Contratto fino al ${r.cEnd}`;
 if(r.team==='acad')return'È nella tua scuola juniores';
 if(r.next)return r.next.team==='t0'?'Già firmato per te':'Ha già un accordo altrove';
 if(r.team==='jr')return'Gli juniores si firmano dai 18 anni';
 if(r.team==='fa')return'Finestra di mercato chiusa';
 const t=TEAM(r.team);
 if(t.tier==='wt'||TIER_RANK[t.tier]>myCat().rank)return`Squadra di categoria superiore: firmabile solo a contratto in scadenza`;
 return w.now?'':'Finestra chiusa';
}
function minSalFor(r){const c=myCat();return r.age<=22?c.neoSal:c.minSal}
function askSal(r,mode,years){
 let a=r.junior?8000+r.pot*16000:demand(r);
 a*=r.askMul||1;
 if(mode==='renew')a*=1+clamp(r.pts/300,0,0.5);
 else if(!r.junior){const t=TEAM(r.team);a*=t.tier==='wt'?2.4:t.tier==='pro'?1.6:1;a*=1+clamp((60-G.rep)/200,0,0.25);if(r.sal)a=Math.max(a,r.sal*1.02)}
 const pref=r.age<=24?3:r.age>=31?1:2;a*=1+0.05*Math.abs(years-pref);
 a*=1+0.04*(r.neg||0);
 return Math.max(minSalFor(r),Math.round(a/500)*500);
}
function feeAsk(r){const yl=Math.max(0.5,r.cEnd-SEASON+(G.phase!=='season'?0:0.5));return Math.round((r.sal*yl*0.9+(r.age<=22?r.pot*45000:0)+5000)/1000)*1000}
function poach(){
 for(const r of ME().riders.map(RID)){
  if(r.cEnd!==SEASON||r.renewed||r.leavingTo||ovr(r)<66)continue;
  if(R()<0.05){const t=pick(G.teams.filter(t=>t.tier==='pro'||t.tier==='wt'||t.tier==='conti'));r.leavingTo=t.id;addNews(`${r.name} firma con ${t.name} per il ${SEASON+1}`);mail('Mercato',`${r.name} ci lascia`,`Aveva il contratto in scadenza e ha firmato con ${t.name} per il ${SEASON+1}.`)}
 }
}
function releaseCost(r){return G.phase!=='season'?(r.cEnd>SEASON?r.sal*0.5:0):r.sal*remWeeks()/seasonWeeks()*0.5}
function doRelease(r){G.cash-=releaseCost(r);moveRider(r,'fa');r.cEnd=0;r.sal=0;r.renewed=false;r.leavingTo=null;delete r.nextSal;addNews(`${r.name} svincolato`);save()}
function aiFill(ns){
 const target={wt:25,pro:22,conti:13,dev:12};
 for(const t of G.teams){
  if(t.tier==='me')continue;const T=target[t.tier];
  while(t.riders.length>T+1){const worst=t.riders.map(RID).sort((a,b)=>ovr(a)-ovr(b))[0];moveRider(worst,'fa');worst.cEnd=0}
  let guard=0;
  while(t.riders.length<T&&guard++<40){
   let r=null;
   const u=t.riders.map(RID).filter(x=>x.age<=22).length;
   const needU23=t.tier==='dev'||u<TEAM_U23[t.tier];
   if(needU23||R()<0.3){const jr=Object.values(G.riders).filter(x=>x.team==='jr'&&!x.next).sort((a,b)=>b.pot-a.pot);if(jr.length)r=jr[Math.floor(R()*Math.min(5,jr.length))]}
   if(!r&&t.tier!=='dev'){const fa=Object.values(G.riders).filter(x=>x.team==='fa'&&!x.next).sort((a,b)=>ovr(b)-ovr(a));if(fa.length)r=fa[Math.floor(R()*Math.min(t.tier==='wt'?2:t.tier==='pro'?4:8,fa.length))]}
   if(!r){r=genRider(t,pick(t.nats),pick(ARCH_MIX),19);G.riders[r.id]=r}
   moveRider(r,t.id);r.junior=false;r.sal=Math.round(demand(r)*(SAL_MUL[t.tier]||1)/500)*500;r.cEnd=ns+rint(0,2);
  }
 }
}

/* ---------- fine stagione e licenze ---------- */
function endOfSeason(){
 G.phase='off';
 const rk=myCatRank();
 sponsorSeasonEnd();
 const L=licenceCheck();
 mail('DS',`Fine stagione ${SEASON}`,`Chiudi ${rk}ª tra le ${myCat().lab}. Soddisfazione media degli sponsor: ${sponsorSat()}%. Reputazione: ${Math.round(G.rep)}.\n\n`+(L?`Per la licenza ${CAT[L.to].lab} servono:\n${L.reqs.map(r=>(r.ok?'✓ ':'✗ ')+r.t).join('\n')}`:'Sei già al vertice: WorldTeam.')+`\n\nPrima di ripartire: rinnovi degli sponsor, mercato e promozioni dalla scuola juniores.`);
 NOTIFY('Stagione conclusa','gold');
}
function newSeason(acceptOffer){
 const ns=SEASON+1,out=[];
 const rk=myCatRank();
 G.history.push({season:SEASON,cat:G.cat,rank:rk,pts:teamPoints(ME()),wins:ME().riders.reduce((a,id)=>a+RID(id).wins,0)});
 const lc=licenceCheck(),up=acceptOffer&&lc&&lc.ok?{to:lc.to}:null;
 for(const r of Object.values(G.riders)){
  if(r.team==='t0'){
   if(r.leavingTo){out.push(`${r.name} passa a ${TEAM(r.leavingTo).name}`);moveRider(r,r.leavingTo);r.sal=Math.round(demand(r)/500)*500;r.cEnd=ns+rint(0,1)}
   else if(r.cEnd<ns){out.push(`${r.name} lascia la squadra: contratto scaduto`);moveRider(r,'fa');r.cEnd=0;r.sal=0}
  }else if(G.teams.some(t=>t.id===r.team)&&r.cEnd<ns&&!r.next){if(R()<0.72)r.cEnd=ns+rint(0,2);else{moveRider(r,'fa');r.cEnd=0}}
  if(r.next){const n=r.next;delete r.next;moveRider(r,n.team);r.sal=n.sal;r.cEnd=n.cEnd;r.junior=false;if(n.team==='t0')out.push(`Arriva ${r.name} (${ARCH[r.arch].lab}, ${r.age+1} anni)`)}
  if(r.nextSal){r.sal=r.nextSal;delete r.nextSal}
  r.renewed=false;r.leavingTo=null;
 }
 const lv=G.academy.level;
 for(const r of Object.values(G.riders)){
  r.age++;
  const coach=r.team==='acad'?1+lv*0.12:1;
  const dev=r.age<=23?(0.03+0.12*r.pot)*rnd(0.6,1.3)*coach:r.age<=27?rnd(-0.01,0.04):r.age<=30?rnd(-0.03,0.02):-rnd(0.02,0.07)*(r.age-29)/2;
  r.wkg=+(r.wkg+dev).toFixed(3);
  if(r.age<=23){r.endu=Math.min(99,r.endu+rint(1,4));r.rec=Math.min(99,r.rec+rint(0,3));r.spr+=rint(0,30)}
  if(r.age>=32)r.spr-=rint(5,25);
  if(r.age>22)r.pot=0;
  Object.assign(r,{listed:null,myRaces:0,capN:0,injUntil:0,injRec:0,days:0,fat:0,pts:0,wins:0,res:[],bF:0,bT:0,neg:0,alt:null,form:+rnd(0.95,0.99).toFixed(3),askMul:+rnd(0.92,1.1).toFixed(3),neo:r.age===19||r.age===23});
  if(r.team==='t0'&&r.age===23)out.push(`${r.name} compie 23 anni: passa tra gli Elite`);
 }
 // juniores della scuola: chi ha 19 anni e non è stato promosso se ne va
 for(const r of acadJuniors())if(r.age>=19){out.push(`${r.name} lascia la scuola juniores senza contratto`);moveRider(r,'fa');r.junior=false}
 for(const r of Object.values(G.riders)){
  if(r.team==='jr'||r.team==='acad')continue;
  if(r.age>=37||(r.age>=34&&R()<0.35)||(r.team==='fa'&&r.age>=31&&R()<0.4)){if(r.team==='t0')out.push(`${r.name} si ritira`);moveRider(r,'x');delete G.riders[r.id]}
 }
 if(up){G.cat=up.to;out.push(`Licenza ${CAT[up.to].lab} ottenuta!`)}
 const C=myCat();
 for(const r of ME().riders.map(RID)){const m=minSalFor(r);if(r.sal<m){r.sal=m}}
 while(myRoster()<C.min){
  const pool=Object.values(G.riders).filter(x=>x.team==='fa').sort((a,b)=>ovr(b)-ovr(a));
  let r=pool.length?pool[Math.floor(R()*Math.min(up?4:12,pool.length))]:null;
  if(!r){r=genRider({id:'fa',tier:'fa'},'ITA','gregario',24);G.riders[r.id]=r}
  moveRider(r,'t0');r.sal=Math.max(minSalFor(r),Math.round(demand(r)/500)*500);r.cEnd=ns+1;out.push(`Ingaggiato ${r.name} per arrivare a ${C.min} corridori`);
 }
 aiFill(ns);
 for(const r of Object.values(G.riders))if(r.team==='jr'){if(r.pot>0.55){r.team='fa';r.junior=false}else delete G.riders[r.id]}
 const fa=Object.values(G.riders).filter(x=>x.team==='fa').sort((a,b)=>ovr(b)-ovr(a));
 for(const r of fa.slice(40))delete G.riders[r.id];
 SEASON=ns;G.season=ns;
 for(let i=fa.length;i<22;i++){const r=genRider({id:'fa',tier:'fa'},pick(Object.keys(NAMES)),pick(ARCH_MIX),rint(22,32));G.riders[r.id]=r}
 genJuniors(16);
 if(lv){const got=intake();if(got.length)out.push(`Scuola juniores: entrano ${got.map(r=>r.name).join(', ')}`)}
 G.contracts=G.contracts.filter(c=>c.end>=ns);
 for(const c of G.contracts){c.done=false;c.base=0}
 G.offers=[];G.bids=[];
 const inc=incomeIn(ns),ms=G.contracts.find(c=>c.slot==='main'&&activeIn(c,ns));
 out.unshift(`Sponsor ${ns}: ${eur(inc)}${ms?` · main sponsor ${SP(ms.sid).name}`:' · nessun main sponsor!'}`);
 G.sponsor=sponsorSat();
 G.rep=Math.round(G.rep*0.8+8);
 G.week=5;G.phase='season';G.kmFuga=0;G.camps=[];G.st={};
 G.races=buildRaces();
 mail('DS',`Stagione ${ns}: si riparte`,out.join('\n')+'\n\nObiettivi degli sponsor:\n'+G.contracts.filter(c=>activeIn(c,ns)).map(c=>`• ${SP(c.sid).name}: ${c.obj.txt} → ${eur(c.bonus)}`).join('\n'));
 for(const t of out)addNews(t);
 save();return out;
}
