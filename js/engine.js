"use strict";
/* ============================================================
   MOTORE: utilità, percorsi, fisica, simulazione di gara
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s);
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=Math.random;
const rnd=(a,b)=>a+(b-a)*R();
const rint=(a,b)=>Math.floor(a+(b-a+1)*R());
const pick=a=>a[Math.floor(R()*a.length)];
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
function gauss(){let u=1-R(),v=R();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function fmtT(s){s=Math.round(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+'h':'')+String(m).padStart(h?2:1,'0')+"'"+String(x).padStart(2,'0')+'"'}
function fmtGap(s){s=Math.round(s);if(s<=0)return's.t.';const m=Math.floor(s/60),x=s%60;return'+'+(m?m+"'"+String(x).padStart(2,'0')+'"':x+'"')}
const km1=v=>v.toFixed(1).replace('.',',');

/* ---------- caratteristiche ---------- */
function stats(r){
 const ftp=r.mass*r.wkg;
 return{
  sal:Math.round(clamp(40+(r.wkg-4.6)/1.6*55,1,99)),
  pia:Math.round(clamp(45+(ftp-320)/120*47,1,99)),
  cro:Math.round(clamp(45+(ftp/r.tt-1250)/700*47,1,99)),
  vol:Math.round(clamp(35+(r.spr-900)/800*57,1,99)),
  res:Math.round(r.endu),rec:Math.round(r.rec)
 };
}
function suitType(r,t){
 const s=stats(r);
 switch(t){
  case'piatta':return 0.7*s.vol+0.3*s.pia;
  case'circuito':return 0.6*s.vol+0.4*s.pia;
  case'mossa':return 0.35*s.sal+0.35*s.vol+0.3*s.pia;
  case'collinare':return 0.65*s.sal+0.25*s.vol+0.1*s.res;
  case'montagna':return 0.85*s.sal+0.15*s.res;
  case'pave':return 0.4*s.pia+0.3*s.vol+0.15*s.res+0.15*s.sal;
  case'roubaix':return 0.55*s.pia+0.25*s.vol+0.2*s.res;
  case'sterrato':return 0.45*s.sal+0.25*s.pia+0.15*s.vol+0.15*s.res;
  default:return s.cro;
 }
}
function ovr(r){return Math.round(Math.max(suitType(r,'piatta'),suitType(r,'mossa'),suitType(r,'collinare'),suitType(r,'montagna'),suitType(r,'crono'),suitType(r,'pave')))}

/* ---------- percorsi ---------- */
const CLIMB_NAMES=['Colle della Croce','Passo del Lupo','Salita di Montebello','Muro di Sant\'Anna','Colle San Rocco','Passo delle Fate','Côte de Ville-Haute','Alto del Pinar','Muro dei Cappuccini','Colle dei Pini','Passo Lungo','Salita del Castello','Strappo di Borgo Alto','Alto de la Cruz','Kriški vrh','Colle del Vento','Passo di Valfredda','Salita di Torrebruna','Côte des Granges','Muro di Ca\' Bianca','Kapelmuur','Côte de la Redoute','Alto de Jaizkibel','Col de la Lombarde'];
const ROAD=t=>t!=='crono'&&t!=='prologo';
function genCourse(type,seed,km,lf=1){
 const r=mulberry32(seed),ra=(a,b)=>a+(b-a)*r();
 const def={circuito:ra(90,110),prologo:ra(4.5,7.5),crono:ra(18,36),piatta:ra(168,202),mossa:ra(160,190),collinare:ra(150,178),montagna:ra(138,170),pave:ra(185,215),roubaix:ra(230,258),sterrato:ra(170,200)}[type];
 let len=km||def*lf;len=type==='prologo'?+len.toFixed(1):Math.round(len);
 const N=Math.round(len*10),g=new Float32Array(N),surf=new Uint8Array(N);
 const amp=['piatta','prologo','roubaix'].includes(type)?0.7:type==='crono'?1.2:type==='pave'?1.0:1.6;
 for(let i=0;i<N;){const L=Math.round(ra(12,45)),v=ra(-amp,amp);for(let j=0;j<L&&i<N;j++,i++)g[i]=v}
 const marks=[];
 const put=(top,L,avg,desc=true)=>{
  const s=Math.max(0,Math.round((top-L)*10)),e=Math.min(N,Math.round(top*10));
  for(let k=s;k<e;k++)g[k]=avg+Math.sin(k*0.9+seed%7)*0.9+(r()-0.5)*1.4;
  marks.push([s,e]);
  if(desc){const dl=L*ra(1.0,1.4),de=Math.min(N,e+Math.round(dl*10)),dg=-avg*L/dl;for(let k=e;k<de;k++)g[k]=dg*ra(0.8,1.15)}
 };
 const flat=(from,to)=>{for(let k=Math.max(0,Math.round(from*10));k<Math.min(N,Math.round(to*10));k++)g[k]=ra(-0.4,0.5)};
 const sector=(from,L,kind)=>{for(let k=Math.max(0,Math.round(from*10));k<Math.min(N,Math.round((from+L)*10));k++)surf[k]=kind};
 let pts=null,laps=0;
 if(type==='circuito'){laps=Math.max(6,Math.round(len/ra(8,12)));const lap=len/laps,NL=Math.round(lap*10),one=new Float32Array(NL),hs=Math.round(NL*ra(0.3,0.6)),hl=Math.round(ra(4,8)),hg=ra(2.5,5);
  for(let k=0;k<NL;k++)one[k]=ra(-0.5,0.5);for(let k=hs;k<hs+hl&&k<NL;k++)one[k]=hg;for(let k=hs+hl;k<hs+2*hl&&k<NL;k++)one[k]=-hg;
  for(let i=0;i<N;i++)g[i]=one[i%NL];pts=[];for(let k=2;k<laps;k+=2)pts.push(+(k*lap).toFixed(1))}
 else if(type==='piatta'){if(r()<0.65)put(len*ra(0.3,0.55),ra(2,4),ra(3,4.5));flat(len-30,len)}
 else if(type==='mossa'){const n=r()<0.5?3:4,last=len-ra(8,22);
  for(let i=0;i<n;i++){const top=i===n-1?last:len*0.22+(last-len*0.22-18)*i/(n-1);put(top,ra(2.5,6),ra(4.5,7))}
  flat(len-3,len)}
 else if(type==='collinare'){put(len*0.35,ra(3,6),ra(4.5,6.5));put(len*0.62,ra(3,6),ra(4.5,6.5));
  const L=ra(1.5,3.2);flat(len-L-10,len-L);put(len,L,ra(6.5,9.5),false)}
 else if(type==='montagna'){const n=r()<0.5?2:3;
  for(let i=0;i<n-1;i++)put(len*(0.25+0.32*i/Math.max(1,n-2)),ra(7,12),ra(5.5,7.5));
  if(r()<0.6){const L=ra(9,15);put(len,L,ra(6.5,8.5),false)}
  else{const L=ra(8,13);put(len-ra(13,20),L,ra(6.5,8.2));flat(len-2,len)}}
 else if(type==='crono'){if(r()<0.5)put(len*ra(0.4,0.7),ra(1.5,3),ra(3.5,6))}
 else if(type==='pave'){const n=Math.round(ra(7,11));
  for(let i=0;i<n;i++){const top=len*0.45+(len-14-len*0.45)*i/(n-1),L=ra(0.6,1.8);put(top,L,ra(6,11));if(r()<0.5)sector(top-L,L,1)}
  for(let i=0;i<Math.round(ra(8,12));i++)sector(ra(len*0.35,len-12),ra(1,2.5),1);
  flat(len-6,len)}
 else if(type==='roubaix'){for(let i=0;i<Math.round(ra(24,29));i++)sector(len*0.38+(len-8-len*0.38)*i/28+ra(-1,1),ra(0.9,3.7),1);flat(len-3,len)}
 else if(type==='sterrato'){const n=Math.round(ra(4,6));
  for(let i=0;i<n;i++)put(len*(0.2+0.62*i/n),ra(1,3),ra(5,9));
  for(let i=0;i<Math.round(ra(9,11));i++)sector(len*0.15+(len-28-len*0.15)*i/10,ra(1.5,8),2);
  flat(len-12,len-0.8);put(len,0.8,ra(10,13),false)}
 const alt=new Float32Array(N+1);alt[0]=ra(20,380);
 for(let i=0;i<N;i++)alt[i+1]=alt[i]+g[i];
 let mn=Infinity,mx=-Infinity;for(const a of alt){mn=Math.min(mn,a);mx=Math.max(mx,a)}
 if(mn<5){for(let i=0;i<=N;i++)alt[i]+=5-mn;mx+=5-mn;mn=5}
 const climbs=[];let ni=Math.floor(r()*CLIMB_NAMES.length);
 for(const[s,e]of marks){
  const L=(e-s)/10;if(L<0.5)continue;
  const avg=(alt[e]-alt[s])/(L*1000)*100,sc=avg*avg*L;
  const cat=sc>=900?'HC':sc>=430?'1':sc>=200?'2':sc>=85?'3':sc>=25?'4':null;
  if(!cat)continue;
  climbs.push({start:s/10,top:e/10,len:L,avg,cat,name:CLIMB_NAMES[ni++%CLIMB_NAMES.length]});
 }
 climbs.sort((a,b)=>a.top-b.top);
 const sin=new Float32Array(N),cos=new Float32Array(N),crr=new Float32Array(N);
 for(let i=0;i<N;i++){const th=Math.atan(g[i]/100);sin[i]=Math.sin(th);cos[i]=Math.cos(th);crr[i]=surf[i]===1?0.011:surf[i]===2?0.0085:0.0045}
 let sprintKm=null;
 if(ROAD(type)&&type!=='circuito'){sprintKm=Math.round(len*ra(0.52,0.66));for(const c of climbs)if(sprintKm>c.start-1&&sprintKm<c.top+2)sprintKm=Math.round(c.start-3)}
 let secN=0;for(let i=1;i<N;i++)if(surf[i]&&!surf[i-1])secN++;
 return{type,len,N,g,alt,sin,cos,crr,surf,secN,climbs,sprintKm,mn,mx,pts,laps};
}

/* ---------- fisica ---------- */
const RHO=1.18,GRAV=9.81,BIKE=8,ETA=0.97,VMAX=20.5;
function pw(v,m,s,c,cda,crr){return v*(0.5*RHO*cda*v*v+(m+BIKE)*GRAV*(s+crr*c))/ETA}
function spd(P,m,s,c,cda,crr){
 if(pw(VMAX,m,s,c,cda,crr)<=P)return VMAX;
 let lo=0.3,hi=VMAX;
 for(let k=0;k<24;k++){const mid=(lo+hi)/2;if(pw(mid,m,s,c,cda,crr)<P)lo=mid;else hi=mid}
 return(lo+hi)/2;
}
const dScale=v=>clamp((v*3.6-14)/18,0,1);
const dBase=n=>n<=1?0:n===2?0.27:n<=5?0.33:n<=15?0.38:0.44;
const eMult=E=>E>=30?0.88+0.12*(E-30)/70:0.62+0.26*E/30;
const ftpE=x=>x.ftp*eMult(x.E);
/* effetto del ritiro in altura: picco 1–3 settimane dopo il rientro */
function altEff(r,w){if(!r.alt)return 0;const d=w-r.alt.w;const f=[0.7,1,1,0.85,0.6,0.35,0.15][d];return f?r.alt.amt*f:0}
function dayFtp(r,fs,w){return r.mass*r.wkg*r.form*(1-r.fat/260)*(1-fs/220)*(1+altEff(r,w))}

/* ---------- simulazione ---------- */
function createSim(ctx){
 const c=ctx.course;
 const S={course:c,len:c.len,type:c.type,t:0,dt:5,tick:0,done:false,riders:[],byId:{},byTeam:{},plans:{},
  clusters:[],main:null,breakFormed:false,breakCaught:false,attacks:[],log:[],finish:[],
  kom:c.climbs.map(()=>[]),sprint:[],passT:new Float64Array(c.N+2).fill(-1),passIdx:-1,
  stageRace:ctx.stageRace,lastAtkLog:-99,finalKmLogged:false,ctx,lastSector:-1};
 S.passT[0]=0;S.passIdx=0;
 for(const e of ctx.entrants){
  const r=e.r,fs=(ctx.fat&&ctx.fat[r.id])||0;
  const x={id:r.id,r,team:r.team,isMe:r.team==='t0',pos:0,E:100,
   ftp:dayFtp(r,fs,ctx.week)*(1+gauss()*0.012),
   m:r.mass,cda:0.30+(r.mass-60)*0.0025,Wmax:15000+(r.spr-900)*14,spr:r.spr,endF:1.25-r.endu*0.005,
   order:'auto',intent:'sit',I:0,easeI:0.4,v:0,P:0,stop:0,finished:false,ft:0,kmFuga:0,luck:gauss()*0.035,
   atkUntil:0,followId:null,gcGap:(ctx.gcGap&&ctx.gcGap[r.id])||0,role:'dom',wasMain:true,lastDrop:-999,cl:null};
  x.W=x.Wmax;
  S.riders.push(x);S.byId[x.id]=x;(S.byTeam[x.team]=S.byTeam[x.team]||[]).push(x);
 }
 const lc=c.climbs.length?c.climbs[c.climbs.length-1]:null;
 S.finaleKm=c.type==='piatta'?5:c.type==='pave'?45:c.type==='roubaix'?55:lc?Math.max(8,c.len-lc.start+1):15;
 if(c.type==='mossa')S.finaleKm=Math.max(S.finaleKm,25);
 if(c.type==='sterrato')S.finaleKm=Math.max(S.finaleKm,30);
 const suits=S.riders.map(x=>suitType(x.r,c.type)).sort((a,b)=>b-a);
 const top5=suits.slice(0,5).reduce((a,b)=>a+b,0)/5;
 let gcLeader=null;
 if(ctx.stageRace&&ctx.gcGap){let best=Infinity;for(const x of S.riders)if(x.gcGap<best){best=x.gcGap;gcLeader=x}}
 S.gcLeaderTeam=gcLeader&&ctx.stageIdx>0?gcLeader.team:null;
 const hilly=['montagna','collinare','mossa','sterrato'];
 for(const t in S.byTeam){
  const rs=S.byTeam[t];
  const sc=rs.map(x=>({x,s:suitType(x.r,c.type)})).sort((a,b)=>b.s-a.s);
  let lead=sc[0].x,goal;const gt=c.type;
  if(ctx.stageRace&&ctx.stageIdx>0&&hilly.includes(gt)){const g=rs.slice().sort((a,b)=>a.gcGap-b.gcGap)[0];if(g.gcGap<240){lead=g;goal='gc'}}
  if(t==='t0'&&ctx.capId&&S.byId[ctx.capId])lead=S.byId[ctx.capId];
  if(!goal||t==='t0'){const st=stats(lead.r);
   goal=gt==='piatta'?(st.vol>=58?'sprint':'break'):gt==='mossa'?((st.vol>=62&&st.sal<72)?'sprint':'hill'):(gt==='montagna')?'gc':'hill';
   if(t!=='t0'&&suitType(lead.r,gt)<top5-12)goal='break';
   if(t==='t0'&&ctx.stageRace&&ctx.stageIdx>0&&hilly.includes(gt)&&lead.gcGap<240)goal='gc';
  }
  const ls=suitType(lead.r,gt);
  for(const o of sc)o.x.role=o.x===lead?'lead':(o.s>=ls-4||(ctx.stageRace&&o.x.gcGap<90))?'free':'dom';
  S.plans[t]={lead,goal,pullers:[],I:0.85};
 }
 S.gcLeader=gcLeader&&ctx.stageIdx>0?gcLeader:null;
 S.ptsLines=c.pts?c.pts.slice():[];S.prPts={};S.prCross=S.ptsLines.map(()=>[]);
 for(const x of S.riders){x.prElig=x.role!=='dom'||x.r.spr>1350;const t=ctx.tactic&&ctx.tactic[x.id];if(t){x.tac=t;x.win=tacWindow(c,t.zone,t.when);if(x.isMe)x.prElig=t.zone==='sprint'||x.role==='lead'||t.move==='fuga'}}
 return S;
}
function tacWindow(c,zone,when){
 if(!zone||zone==='none'||zone==='sprint')return null;
 const len=c.len,w3=(a,b)=>{const L=Math.max(0.5,b-a);return when==='start'?[a,a+L*0.35]:when==='mid'?[a+L*0.4,a+L*0.7]:[Math.max(a,b-2.2),b-0.1]};
 if(zone==='last'||zone.startsWith('climb:')){let cb=zone==='last'?c.climbs[c.climbs.length-1]:c.climbs[+zone.slice(6)];if(!cb)cb=c.climbs[c.climbs.length-1];if(!cb)return w3(len-10,len-0.6);return w3(cb.start,Math.min(cb.top,len-0.2))}
 if(zone==='k10')return w3(len-10,len-0.6);
 if(zone==='k25')return w3(len-25,len-0.6);
 if(zone==='pave'){const secs=[];for(let i=1;i<c.N;i++)if(c.surf[i]&&!c.surf[i-1]&&i/10>len-80)secs.push(i/10);if(!secs.length)return w3(len-25,len-0.6);const s=when==='start'?secs[0]:when==='mid'?secs[Math.floor(secs.length/2)]:secs[secs.length-1];return[s,s+1.5]}
 return null;
}
function planDecide(S,x){
 const t=x.tac,c=x.cl,main=S.main,k2g=S.len-x.pos;
 if(x.win&&x.pos>=x.win[0]&&x.pos<=x.win[1]&&(x.tacAtk||0)<2&&x.W>(x.tacAtk?0.35:0.5)*x.Wmax&&x.E>15){x.tacAtk=(x.tacAtk||0)+1;startAttack(S,x,1.3,rnd(45,80));return true}
 switch(t.move){
  case'fuga':
   if(c.idx<main.idx){x.intent='pull';x.I=0.86;return true}
   if(!S.breakFormed&&x.pos>1&&k2g>40&&x.E>55&&R()<0.07){startAttack(S,x,1.3,rnd(50,90));return true}
   if(S.breakFormed&&!S.breakCaught&&main.idx>0&&gapSec(S,main.front)<50&&k2g>40&&x.E>55&&R()<0.04){startAttack(S,x,1.3,rnd(50,80));return true}
   x.intent='sit';return true;
  case'scorta':escort(S,x);return true;
  case'tira':{const cap=S.plans[x.team].lead;
   if(cap&&cap!==x&&!cap.finished){if(cap.cl===c){if(k2g<S.finaleKm+15&&x.E>12){x.intent='pull';x.I=0.93}else x.intent='sit'}else escort(S,x);return true}
   x.intent='sit';return true}
  case'copri':coverCheck(S,x);return true;
  case'vicino':if(gapSec(S,x.pos)>60&&x.E>10){x.intent='pull';x.I=0.95}else x.intent='sit';return true;
  case'maglia':{const L=S.gcLeader;
   if(L&&!L.finished&&L!==x&&L.cl.idx<c.idx&&x.E>10){x.intent='pull';x.I=0.95}
   else if(L&&L.cl===c&&L.intent==='attack'&&x.W>0.2*x.Wmax){x.intent='follow';x.followId=L.id}
   else x.intent='sit';return true}
  case'gruppo':if(c.idx>main.idx&&x.E>10){x.intent='pull';x.I=0.93}else x.intent='sit';return true;
 }
 return false;
}
const gi=(S,pos)=>Math.min(S.course.N-1,Math.max(0,Math.floor(pos*10)));
function gapSec(S,pos){const i=Math.min(S.passIdx,Math.max(0,Math.floor(pos*10)));const t=S.passT[i];return t<0?0:Math.max(0,S.t-t)}
function slog(S,txt,me=false){const lead=S.clusters.length?S.clusters[0].front:0;S.log.push({km:Math.max(0,S.len-lead),txt,me})}
const rname=x=>x.r.name.split(' ').slice(1).join(' ')||x.r.name;
const tshort=x=>TEAM(x.team).short;
function startAttack(S,x,I,dur){
 x.intent='attack';x.I=I;x.atkUntil=S.t+dur;
 S.attacks.push({id:x.id,cl:x.cl,t:S.t});
 for(const y of S.riders)if(y.isMe&&y.order==='copri'&&y.cl===x.cl&&y.team!==x.team&&!y.finished&&y.intent!=='attack')coverCheck(S,y);
 const k2g=S.len-x.pos;
 if(x.isMe)slog(S,`Scatta ${x.r.name}!`,true);
 else if((k2g<35||x.role==='lead')&&S.t-S.lastAtkLog>40&&S.breakFormed){S.lastAtkLog=S.t;slog(S,`Attacco di ${x.r.name} (${tshort(x)})`)}
}
function updatePlans(S){
 const main=S.main;if(!main)return;
 const k2g=S.len-main.front;
 const ahead=main.idx>0,gap=ahead?gapSec(S,main.front):0;
 const i=gi(S,main.front),gr=S.course.g[i];
 const onClimb=gr>3.5||S.course.surf[i]>0;
 let ws=0,n=0;for(const x of main.rs){ws+=x.r.wkg;n++}S.mainWkg=ws/Math.max(1,n);
 for(const t in S.plans){
  const p=S.plans[t];p.pullers=[];
  const lead=p.lead;if(!lead||lead.finished||lead.cl!==main)continue;
  const hasAhead=S.byTeam[t].some(y=>!y.finished&&y.cl&&y.cl.idx<main.idx);
  let k=0,I=0.85;
  if(p.goal==='sprint'){
   if(ahead&&!hasAhead){const allow=k2g>90?330:k2g*3.0+15;if(gap>allow){k=Math.min(3,1+Math.floor((gap-allow)/40));I=0.9}else if(gap>45&&S.breakFormed){k=1;I=0.8}}
   if(k2g<14&&(!hasAhead||!ahead)){k=Math.max(k,2);I=0.95}
   if(k2g<2.6){k=4;I=1.12}
  }else if(p.goal==='gc'){
   if(S.gcLeaderTeam===t&&ahead&&!hasAhead&&gap>200){k=1;I=0.82}
   if(onClimb&&k2g<S.finaleKm+20){k=2;I=0.96}
   if(ahead&&!hasAhead&&k2g<S.finaleKm+25&&gap>50){k=Math.max(k,2);I=Math.max(I,0.93)}
  }else if(p.goal==='hill'){
   if(ahead&&!hasAhead){const allow=k2g>80?300:k2g*2.4+10;if(gap>allow){k=2;I=0.9}}
   if(k2g<S.finaleKm+5&&(!hasAhead||!ahead)){k=Math.max(k,1);I=Math.max(I,0.93)}
   if(onClimb&&k2g<S.finaleKm){k=Math.max(k,2);I=0.97}
  }
  if(!k)continue;
  const doms=S.byTeam[t].filter(y=>y!==lead&&!y.finished&&y.cl===main&&y.E>12&&y.role!=='free'&&!(y.isMe&&y.order!=='auto')).sort((a,b)=>b.E-a.E);
  p.pullers=doms.slice(0,k);p.I=I;
 }
}
function escort(S,x){
 const cap=S.plans[x.team].lead;
 if(!cap||cap===x||cap.finished){x.intent='sit';return}
 if(cap.cl===x.cl){
  const k2g=S.len-x.pos;
  if(x.cl.idx>0){const gapAhead=gapSec(S,x.cl.front)-gapSec(S,S.clusters[x.cl.idx-1].front);
   if(gapAhead<150||k2g<40){x.intent='pull';x.I=0.92;return}}
  x.intent='sit';
 }else if(x.pos>cap.pos){x.intent='ease';x.easeI=0.35}
 else{x.intent='pull';x.I=0.95}
}
function coverCheck(S,x){
 for(const a of S.attacks){const at=S.byId[a.id];
  if(a.cl!==x.cl||at===x||at.team===x.team||S.t-a.t>40||at.intent!=='attack'||at.finished)continue;
  if(x.W>0.2*x.Wmax&&x.E>10){x.intent='follow';x.followId=at.id;slog(S,`${x.r.name} risponde allo scatto di ${at.r.name}`,true);return}
 }
 x.intent='sit';
}
function applyOrder(S,x){
 switch(x.order){case'ruota':x.intent='sit';break;case'copri':coverCheck(S,x);break;case'tira':x.intent='pull';x.I=0.9;break;case'scorta':escort(S,x);break}
}
function decide(S,x){
 if(x.finished||x.stop>0||x.intent==='sprint')return;
 if(x.intent==='attack'){if(S.t<x.atkUntil&&x.W>0.15*x.Wmax)return;x.intent='pull';x.I=0.9;if(x.isMe&&x.order==='scatta')x.order='tira'}
 if(x.intent==='follow'){const t=S.byId[x.followId];if(t&&t.intent==='attack'&&!t.finished)return;x.intent='sit'}
 if(x.isMe&&x.order!=='auto'){applyOrder(S,x);return}
 if(x.tac&&planDecide(S,x))return;
 aiDecide(S,x);
}
function aiDecide(S,x){
 const c=x.cl,main=S.main,plan=S.plans[x.team],lead=plan.lead;
 const k2g=S.len-x.pos;
 const i=gi(S,x.pos),gr=S.course.g[i],hard=gr>3.5||S.course.surf[i]>0;
 const inFront=c.idx<main.idx,inMain=c===main;
 if(x.E>18&&x.W>0.35*x.Wmax&&(x.role!=='dom'||inFront)){
  for(const a of S.attacks){
   if(a.cl!==c||a.id===x.id||S.t-a.t>35)continue;
   const at=S.byId[a.id];if(at.intent!=='attack'||at.team===x.team)continue;
   let threat=!S.breakFormed&&k2g>40?0.04:k2g<35?0.55:0.2;
   if(S.stageRace&&at.gcGap<120&&x.role!=='dom')threat=0.85;
   if(inFront)threat=Math.max(threat,0.45);
   const rel=clamp((x.r.wkg/at.r.wkg-0.9)*4,0.1,1.3);
   if(R()<threat*rel){x.intent='follow';x.followId=at.id;return}
  }
 }
 if(inFront){
  if(lead&&lead!==x&&!lead.finished&&lead.cl.idx>c.idx&&plan.goal!=='break'&&x.role==='dom'&&k2g<60){x.intent='sit';return}
  if(x.E<12){x.intent='sit';return}
  if(k2g<30&&c.rs.length>1&&x.W>0.5*x.Wmax){
   const p=0.018*(k2g<10?3:1)*(hard?2:1)*clamp(Math.pow(x.r.wkg/5.3,4),0.4,2);
   if(R()<p){startAttack(S,x,1.25,rnd(40,80));return}
  }
  x.intent='pull';x.I=c.rs.length===1?0.9:0.86;return;
 }
 if(inMain){
  if(plan.pullers.includes(x)){x.intent='pull';x.I=plan.I;return}
  if(x.role==='dom'&&lead&&lead!==x&&!lead.finished&&lead.cl.idx>c.idx&&x.E>20){
   const gl=gapSec(S,lead.pos)-gapSec(S,x.pos);
   const helpers=S.byTeam[x.team].filter(y=>y.role==='dom'&&y.cl===main).slice(0,2);
   if(gl<70&&helpers.includes(x)&&k2g>3){x.intent='ease';x.easeI=0.35;return}
  }
  if(!S.breakFormed&&x.pos>1.5&&k2g>45&&x.role!=='lead'&&x.E>70&&!(S.stageRace&&x.gcGap<60)){
   const pr=plan.goal==='break'?0.007:x.r.arch==='velocista'?0.0008:0.003;
   if(R()<pr){startAttack(S,x,1.3,rnd(50,100));return}
  }
  if(S.breakFormed&&!S.breakCaught&&main.idx>0&&gapSec(S,main.front)<75&&k2g>45&&x.role!=='lead'&&x.E>65&&R()<0.0015){startAttack(S,x,1.3,rnd(50,90));return}
  if((x.role==='lead'||x.role==='free')&&x.W>0.55*x.Wmax&&x.E>22){
   let p=0;const st=S.type;
   if(hard&&k2g<S.finaleKm)p=0.03*clamp(Math.pow(x.r.wkg/(S.mainWkg||5.3),8),0.15,3)*(S.course.surf[i]?clamp(x.r.mass/68,0.7,1.3):1);
   else if(!hard&&k2g<7&&st!=='piatta'&&x.r.arch!=='velocista'&&k2g>0.6)p=0.01;
   else if(st==='piatta'&&k2g<4&&k2g>1&&x.r.arch!=='velocista')p=0.003;
   if(S.stageRace&&x.gcGap>300&&hard)p*=0.4;
   if(p&&R()<p){startAttack(S,x,1.3,rnd(40,90));return}
  }
  x.intent='sit';return;
 }
 if(x.role==='lead'||(x.role==='free'&&k2g<60)){if(x.E>8){x.intent='pull';x.I=0.95;return}}
 if(x.role==='dom'&&lead&&lead!==x&&!lead.finished){
  if(lead.cl===c&&x.E>12){x.intent='pull';x.I=0.92;return}
  if(lead.pos<x.pos&&gapSec(S,lead.pos)-gapSec(S,x.pos)<60&&x.E>20){x.intent='ease';x.easeI=0.35;return}
 }
 x.intent='sit';
}
function clusterize(S){
 const act=S.riders.filter(x=>!x.finished);
 act.sort((a,b)=>b.pos-a.pos);
 const cl=[];let cur=null;
 for(const x of act){
  if(!cur||cur.last-x.pos>0.025){cur={rs:[],front:x.pos,last:x.pos,idx:cl.length};cl.push(cur)}
  cur.rs.push(x);cur.last=x.pos;x.cl=cur;
 }
 S.clusters=cl;
 let m=null;for(const c of cl)if(!m||c.rs.length>m.rs.length)m=c;
 S.main=m;return act;
}
function tick(S){
 const dt=S.dt,c=S.course;
 const act=clusterize(S);
 if(!act.length){S.done=true;return}
 const main=S.main;
 if(!S.breakFormed&&main.idx>0&&gapSec(S,main.front)>=40){
  let n=0;for(let i=0;i<main.idx;i++)n+=S.clusters[i].rs.length;
  if(n<=14){S.breakFormed=true;const mine=[];for(let i=0;i<main.idx;i++)for(const x of S.clusters[i].rs)if(x.isMe)mine.push(x.r.name);
   slog(S,`Fuga di ${n} corridor${n===1?'e':'i'} al km ${Math.round(S.clusters[0].front)}`+(mine.length?`: c'è ${mine.join(' e ')}!`:''),mine.length>0)}
 }
 if(S.breakFormed&&!S.breakCaught&&!S.finish.length&&main.idx===0&&S.len-main.front>1){S.breakCaught=true;slog(S,`Fuga ripresa a ${Math.round(S.len-main.front)} km dall'arrivo`)}
 if(!S.finalKmLogged&&S.clusters[0].front>=S.len-1){S.finalKmLogged=true;slog(S,'Triangolo rosso: ultimo chilometro')}
 const fi=gi(S,S.clusters[0].front);
 if(c.surf[fi]&&(fi===0||!c.surf[fi-1])&&S.lastSector!==fi){S.lastSector=fi;const k2g=S.len-S.clusters[0].front;if(k2g<90)slog(S,c.surf[fi]===1?`Settore di pavé a ${Math.round(k2g)} km`:`Sterrato a ${Math.round(k2g)} km`)}
 if(S.tick%6===0){updatePlans(S);for(const x of act)decide(S,x);S.attacks=S.attacks.filter(a=>S.t-a.t<60)}
 for(const x of act){
  if(x.intent!=='sprint'&&S.len-x.pos<0.28&&x.stop<=0){
   const lead=S.plans[x.team].lead;
   const domWithLead=x.role==='dom'&&lead&&lead!==x&&lead.cl===x.cl&&!lead.finished;
   const meNo=x.isMe&&(x.order==='tira'||x.order==='scorta')&&lead!==x;
   if(!domWithLead&&!meNo&&x.E>4)x.intent='sprint';
   else if(x.intent!=='ease'){x.intent='ease';x.easeI=0.5}
  }
 }
 if(S.ptsLines.length)for(const x of act){
  const j=S.ptsLines.findIndex(k=>k>x.pos);
  if(x.prLine!=null&&x.pos>=x.prLine){if(x.intent==='sprint')x.intent='sit';x.prLine=null}
  if(j>=0&&x.prElig&&S.ptsLines[j]-x.pos<0.25&&x.intent!=='attack'&&x.intent!=='sprint'&&x.W>0.4*x.Wmax&&x.stop<=0&&!(x.isMe&&(x.order==='tira'||x.order==='scorta'))){x.intent='sprint';x.prLine=S.ptsLines[j]}
 }
 for(const x of act){
  if(x.stop>0||x.finished)continue;
  const i=gi(S,x.pos);let pc=1.2e-6;
  if(c.surf[i])pc*=6;if(c.g[i]<-5)pc*=4;if(x.cl&&x.cl.rs.length>30)pc*=1.5;if(S.len-x.pos<0.6&&x.cl&&x.cl.rs.length>10)pc*=25;
  if(R()<pc){const roll=R();
   if(roll<0.1){x.dnf=true;x.finished=true;x.inj=rint(2,6);x.v=0;x.P=0;slog(S,`Caduta: ${x.r.name} (${tshort(x)}) si ritira`,x.isMe)}
   else{x.stop=rint(3,10);if(roll<0.3)x.inj=rint(1,2);if(x.isMe||x.role==='lead')slog(S,`Caduta per ${x.r.name} (${tshort(x)})${x.inj?': si rialza dolorante':''}`,x.isMe)}}
 }
 for(const x of act){
  if(x.finished)continue;
  if(x.stop>0){x.stop--;x.v=0;x.P=0;continue}
  const sf=c.surf[gi(S,x.pos)];
  if(R()<4e-6*(sf?9:1)&&S.len-x.pos>3){x.stop=rint(4,8);x.v=0;x.P=0;
   if(x.isMe||x.role==='lead')slog(S,`Foratura per ${x.r.name} (${tshort(x)})`,x.isMe)}
 }
 for(const x of act){
  if(x.stop>0)continue;
  const i=gi(S,x.pos),s=c.sin[i],co=c.cos[i],cr=c.crr[i];
  if(x.intent==='attack'){const fe=ftpE(x);x.P=x.W>200?x.I*fe:fe;x.v=spd(x.P,x.m,s,co,x.cda,cr)}
  else if(x.intent==='sprint'){x.P=x.spr*(0.6+0.4*x.W/x.Wmax)*eMult(x.E)*(1+x.luck);x.v=spd(x.P,x.m,s,co,x.cda*0.85,cr)}
 }
 for(const cl of S.clusters){
  const mem=cl.rs.filter(x=>x.stop<=0&&x.intent!=='attack'&&x.intent!=='sprint');
  if(!mem.length)continue;
  const i=gi(S,cl.front),s=c.sin[i],co=c.cos[i],gr=c.g[i],cr=c.crr[i];
  const n=cl.rs.length,db=dBase(n)*(c.surf[i]?0.6:1);
  const ws=mem.filter(x=>x.intent==='pull');
  let v;const k2g=S.len-cl.front;
  let cI=cl===main?((!S.breakFormed&&k2g>40)?0.69:0.6):0.62;if(gr>3)cI+=0.12;if(c.surf[i])cI+=0.08;
  if(cl.idx>main.idx&&S.allow){const gp=gapSec(S,cl.front);if(gp>S.allow*0.4)cI+=0.12;if(gp>S.allow*0.7)cI+=0.08}
  let fs=0,ms=0;for(const x of mem){fs+=ftpE(x);ms+=x.m}
  const vC=spd(cI*fs/mem.length,ms/mem.length,s,co,0.32,cr);
  if(ws.length){
   const k=ws.length,dk=dBase(k);
   let tgt=0;for(const w of ws)tgt+=w.I*ftpE(w);
   const rot=(w,vv)=>{const a=Math.max(0,pw(vv,w.m,s,co,w.cda,cr));if(k===1)return a;const b=Math.max(0,pw(vv,w.m,s,co,w.cda*(1-dk*dScale(vv)),cr));return(a+(k-1)*b)/k};
   let lo=0.3,hi=VMAX;
   if(ws.reduce((a,w)=>a+rot(w,hi),0)<=tgt)v=hi;
   else{for(let it=0;it<22;it++){const mid=(lo+hi)/2;let sum=0;for(const w of ws)sum+=rot(w,mid);if(sum<tgt)lo=mid;else hi=mid}v=(lo+hi)/2}
   v=Math.max(v,vC);
   for(const x of mem)x._req=ws.includes(x)?rot(x,v):null;
  }else{v=vC;for(const x of mem)x._req=null}
  cl.v=v;
  for(const x of mem){
   let vv=v,req;const df=1-db*dScale(v);
   if(x.intent==='follow'){const t=S.byId[x.followId];if(t&&!t.finished&&t.v>0)vv=t.v+clamp((t.pos-x.pos)*1000/dt*0.4,-1,1.5)}
   else if(x.intent==='ease')vv=Math.min(v,spd(x.easeI*ftpE(x),x.m,s,co,x.cda*df,cr));
   else vv=v+clamp((cl.front-x.pos)*1000/dt*0.3,0,1.2);
   req=x._req!==null&&x.intent==='pull'?x._req:Math.max(0,pw(vv,x.m,s,co,x.cda*(x.intent==='follow'?(1-0.3*dScale(vv)):df),cr));
   const fe=ftpE(x),allow=x.W>300?fe*1.7:fe;
   if(req>allow){x.P=allow;vv=spd(allow,x.m,s,co,x.cda*df,cr)}else x.P=req;
   x.v=vv;
  }
 }
 for(const x of act){
  if(x.dnf)continue;
  const fe=ftpE(x);
  if(x.P>fe)x.W-=(x.P-fe)*dt;else x.W=Math.min(x.Wmax,x.W+(fe-x.P)*dt*0.3);
  if(x.W<0)x.W=0;
  x.E=Math.max(0,x.E-dt*(0.0006+0.0075*Math.pow(Math.max(0,x.P/x.ftp),2.5))*x.endF);
  const prev=x.pos;x.pos+=x.v*dt/1000;
  if(x.cl&&x.cl.idx<main.idx)x.kmFuga+=x.pos-prev;
  c.climbs.forEach((cb,j)=>{if(prev<cb.top&&x.pos>=cb.top&&cb.top<S.len){S.kom[j].push(x);if(S.kom[j].length===1)slog(S,`GPM ${cb.cat==='HC'?'HC':cb.cat+'ª cat.'} ${cb.name}: primo ${x.r.name} (${tshort(x)})`,x.isMe)}});
  S.ptsLines.forEach((k,j)=>{if(prev<k&&x.pos>=k){const arr=S.prCross[j];arr.push(x);if(arr.length<=PR_PTS.length){S.prPts[x.id]=(S.prPts[x.id]||0)+PR_PTS[arr.length-1];if(arr.length===1)slog(S,`Traguardo a punti ${j+1}/${S.ptsLines.length}: primo ${x.r.name} (${tshort(x)})`,x.isMe)}}});
  if(c.sprintKm&&prev<c.sprintKm&&x.pos>=c.sprintKm){S.sprint.push(x);if(S.sprint.length===1)slog(S,`Traguardo volante: primo ${x.r.name} (${tshort(x)})`,x.isMe)}
  const ix=Math.min(c.N,Math.floor(Math.min(x.pos,S.len)*10));
  while(S.passIdx<ix){S.passIdx++;const f=x.v>0?clamp((S.passIdx/10-prev)/(x.pos-prev),0,1):1;S.passT[S.passIdx]=S.t+f*dt}
  if(x.pos>=S.len){x.finished=true;x.ft=S.t+(x.v>0?(S.len-prev)/(x.v/1000):dt);x.pos=S.len;S.finish.push(x);
   if(S.finish.length===1)slog(S,`Vince ${x.r.name} (${TEAM(x.team).name})!`,x.isMe)}
 }
 if(S.tick%6===3){
  for(const x of act){if(!x.isMe||x.finished)continue;
   const inM=x.cl===main||x.cl.idx<main.idx;
   if(x.wasMain&&!inM&&gapSec(S,x.pos)-gapSec(S,main.front)>8&&S.t-x.lastDrop>300&&x.stop<=0){x.lastDrop=S.t;slog(S,`${x.r.name} perde contatto dal gruppo`,true)}
   x.wasMain=inM}
 }
 S.t+=dt;S.tick++;
 if(S.clusters.length&&S.clusters[0].front>15)S.allow=(TIME_CUT[S.type]||0.15)*S.t*S.len/S.clusters[0].front;
 if(S.riders.every(x=>x.finished))S.done=true;
 if(S.t>10*3600){for(const x of S.riders)if(!x.finished){x.finished=true;x.ft=S.t+(S.len-x.pos)*90;S.finish.push(x)}S.done=true}
}
function stageResults(S){
 const fin=S.finish.slice().sort((a,b)=>a.ft-b.ft);
 let gt=0,prev=-1e9;
 const res=fin.map(x=>{if(x.ft-prev>1.0)gt=x.ft;prev=x.ft;return{id:x.id,team:x.team,time:Math.round(gt)}});
 if(S.type==='circuito'){
  res.forEach((x,i)=>{x.pts=(S.prPts[x.id]||0)+(PR_FIN[i]||0);x.fo=i});
  res.sort((a,b)=>b.pts-a.pts||a.fo-b.fo);
 }
 return res;
}
function simTT(ctx){
 const c=ctx.course;
 return ctx.entrants.map(e=>{const r=e.r,fs=(ctx.fat&&ctx.fat[r.id])||0;
  const P=dayFtp(r,fs,ctx.week)*(1+gauss()*0.015)*(c.type==='prologo'?1.12:1.0)*(1-Math.min(0.06,c.len/600));
  let t=0;for(let i=0;i<c.N;i++)t+=100/spd(P,r.mass,c.sin[i],c.cos[i],r.tt,c.crr[i]);
  return{id:r.id,team:r.team,time:Math.round(t*10)/10};
 }).sort((a,b)=>a.time-b.time);
}
/* Simulazione rapida (statistica) per le corse a cui non partecipi */
const QN={circuito:7,piatta:7,mossa:6,collinare:4.5,montagna:4,pave:6,roubaix:6.5,sterrato:5,crono:2.5,prologo:3};
const QS={circuito:0,piatta:0,mossa:2.5,collinare:3.5,montagna:10,pave:8,roubaix:9,sterrato:6,crono:4.5,prologo:1};
function quickStage(field,type,fat,week){
 const sc=field.map(r=>({r,s:suitType(r,type)*r.form*(1-r.fat/260)*(1-(fat[r.id]||0)/220)*(1+altEff(r,week))+gauss()*QN[type]})).sort((a,b)=>b.s-a.s);
 const top=sc[0].s;let prev=0;
 return sc.map((o,i)=>{
  let gap=(top-o.s)*QS[type];
  if(type==='piatta')gap=i<sc.length*0.8?0:60+(top-o.s)*20;
  if(gap<prev)gap=prev;if(gap-prev<2&&QS[type]>0&&type!=='crono'&&type!=='prologo')gap=prev;
  prev=gap;return{id:o.r.id,team:o.r.team,time:Math.round(gap)};
 });
}
