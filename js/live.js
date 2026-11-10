"use strict";
/* ============================================================
   GARA DAL VIVO PIÙ COINVOLGENTE
   - momenti chiave: la corsa si ferma e chiede una decisione
   - ordini rapidi alla squadra
   - pagelle dei corridori a fine tappa
   ============================================================ */
function buzz(ms=40){try{if(navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
function liveCtx(S){
 const mine=(S.byTeam.t0||[]).filter(x=>!x.finished&&!x.dnf);if(!mine.length)return null;
 const plan=S.plans[mine[0].team],capR=plan&&plan.lead;
 const cap=capR&&!capR.finished&&!capR.dnf?capR:mine.slice().sort((a,b)=>ovr(b.r)-ovr(a.r))[0];
 const gd=S.clusters.length?groupsDisplay(S):[];
 const lead=S.clusters.length?S.clusters[0].front:0;
 return{mine,cap,doms:mine.filter(x=>x!==cap),gd,lead,k2g:S.len-lead,capG:gd.find(o=>o.rs.includes(cap)),main:gd.find(o=>o.main)};
}
const shortN=x=>esc(x.r.name.split(' ').slice(-1)[0]);
function ordr(S,x,o){if(!x||x.finished)return;if(o==='scatta'){if(x.W>0.1*x.Wmax){x.order='scatta';startAttack(S,x,1.3,rnd(50,80))}}else{x.order=o;if(x.intent==='attack')x.atkUntil=0;decide(S,x)}}
function bestDom(list){return list.slice().sort((a,b)=>(b.W/b.Wmax+b.E/100)-(a.W/a.Wmax+a.E/100))[0]}
/* individua un momento chiave */
function momFind(S){
 const C=liveCtx(S);if(!C)return null;
 const M=LIVE.mom||(LIVE.mom={done:{},last:-999});
 if(S.t-M.last<200)return null;
 const can=(k,cd=1e9)=>!(M.done[k]!==undefined&&S.t-M.done[k]<cd);
 const{cap,doms,gd,lead,k2g,capG,main}=C;
 const inCap=capG?doms.filter(x=>capG.rs.includes(x)):[];
 const flatFin=['piatta','circuito','mossa'].includes(S.type);
 /* foratura o caduta del capitano */
 if(cap.stop>2&&k2g>3&&can('pun',300)&&doms.length)return{k:'pun',ico:'⚠',t:`${cap.r.name} è fermo!`,s:'Foratura o caduta: il gruppo non aspetta.',
  o:[{l:'Due gregari lo aspettano',d:'Lo riportano sotto',f:()=>doms.slice().sort((a,b)=>b.E-a.E).slice(0,2).forEach(x=>ordr(S,x,'scorta'))},{l:'Rientra da solo',d:'Risparmi i gregari',f:()=>{}}],def:0,rec:k2g>20?0:1};
 /* fuga di giornata */
 if(!S.breakFormed&&lead<S.len*0.35&&S.t>240&&can('fuga')&&doms.length&&S.riders.some(x=>!x.isMe&&x.intent==='attack')){const d=bestDom(doms);
  return{k:'fuga',ico:'➜',t:'Sta partendo la fuga',s:'Un uomo davanti porta visibilità agli sponsor.',
  o:[{l:`Manda ${shortN(d)}`,d:'All\'attacco con i fuggitivi',f:()=>ordr(S,d,'scatta')},{l:'Restiamo coperti',d:'Energie per il finale',f:()=>{}}],def:1,rec:flatFin&&stats(cap.r).vol>=62?1:0}}
 /* il capitano perde le ruote */
 if(capG&&main&&!capG.main&&capG.g>main.g+15&&k2g>12&&can('drop',500)){const help=doms.filter(x=>main.rs.includes(x));
  return{k:'drop',ico:'↘',t:`${cap.r.name} ha perso le ruote`,s:`${fmtGap(capG.g-main.g)} dal gruppo, ${km1(k2g)} km all'arrivo.`,
  o:[...(inCap.length?[{l:'Tutti a tirare per lui',d:`${inCap.length} compagn${inCap.length>1?'i':'o'} con lui`,f:()=>{inCap.forEach(x=>ordr(S,x,'tira'));ordr(S,cap,'ruota')}}]:[]),
     ...(help.length?[{l:`${shortN(bestDom(help))} torna indietro`,d:'Si rialza dal gruppo e lo scorta',f:()=>ordr(S,bestDom(help),'scorta')}]:[]),
     {l:'Gestisce da solo',d:'Pensa alla prossima tappa',f:()=>ordr(S,cap,'ruota')}],def:0,rec:0}}
 /* attacco di un rivale */
 if(k2g<55&&can('riv',420)){
  const ahead=S.riders.filter(x=>!x.isMe&&x.intent==='attack'&&!x.finished&&(x.role==='lead'||ovr(x.r)>=ovr(cap.r)-2)&&capG&&(capG.rs.includes(x)||(x.pos>cap.pos&&gapSec(S,cap.pos)-gapSec(S,x.pos)<25)));
  const a=ahead.sort((p,q)=>ovr(q.r)-ovr(p.r))[0];
  if(a){const w=inCap.length?bestDom(inCap):null;
   return{k:'riv',ico:'⚡',t:`Attacca ${a.r.name}!`,s:`${TEAM(a.team).short} · valore ${ovr(a.r)} · ${km1(k2g)} km all'arrivo`,
   o:[{l:`${shortN(cap)} risponde`,d:`Riserva scatti ${Math.round(cap.W/cap.Wmax*100)}%`,f:()=>{if(cap.W>0.35*cap.Wmax)startAttack(S,cap,1.15,rnd(25,40));else ordr(S,cap,'copri')}},
      ...(w?[{l:`Chiude ${shortN(w)}`,d:'Il gregario tira, il capitano a ruota',f:()=>{ordr(S,w,'tira');ordr(S,cap,'copri')}}]:[]),
      {l:'Lascia andare',d:'Troppo presto o troppo forte',f:()=>{}}],def:w?1:0,rec:k2g<15?0:w?1:2}}}
 /* ultima salita */
 const lc=S.course.climbs[S.course.climbs.length-1];
 if(lc&&!flatFin&&can('climb')&&lead>lc.start-1.5&&lead<lc.start+(lc.top-lc.start)*0.5&&capG&&capG===gd[0]&&cap.W>0.45*cap.Wmax){
  return{k:'climb',ico:'▲',t:`Ultima salita: ${lc.name||'il GPM'}`,s:`${km1(lc.top-lc.start)} km al ${lc.avg?(+lc.avg).toFixed(1).replace('.',','):'?'}% · ${shortN(cap)} con i migliori`,
  o:[{l:'Attacca adesso!',d:`Riserva ${Math.round(cap.W/cap.Wmax*100)}%`,f:()=>ordr(S,cap,'scatta')},
     ...(inCap.length?[{l:'Ritmo dei gregari',d:'Selezione da dietro, attacco dopo',f:()=>{inCap.forEach(x=>ordr(S,x,'tira'));ordr(S,cap,'copri')}}]:[]),
     {l:'Aspetta l\'ultimo km',d:'Copre e risponde agli scatti',f:()=>ordr(S,cap,'copri')}],def:inCap.length?1:2,rec:stats(cap.r).sal>=stats(cap.r).vol?0:2}}
 /* volata */
 if(flatFin&&k2g<6&&k2g>1.5&&can('spr')&&capG&&(capG.main||capG===gd[0])){
  return{k:'spr',ico:'≫',t:'Si prepara la volata',s:`${km1(k2g)} km · ${inCap.length} compagn${inCap.length===1?'o':'i'} con ${shortN(cap)}`,
  o:[...(inCap.length?[{l:'Treno in testa',d:'Tutti a tirare, il velocista a ruota',f:()=>{inCap.forEach(x=>ordr(S,x,'tira'));ordr(S,cap,'ruota')}}]:[]),
     {l:'Ognuno per sé',d:'Ruota delle squadre forti',f:()=>ordr(S,cap,'ruota')},
     ...(inCap.length?[{l:`Anticipa ${shortN(bestDom(inCap))}`,d:'Attacco a sorpresa',f:()=>ordr(S,bestDom(inCap),'scatta')}]:[])],def:0,rec:stats(cap.r).vol>=62?0:inCap.length?2:1}}
 /* nostro uomo in fuga che sta per essere ripreso */
 const fr=gd[0]&&!gd[0].main?gd[0].rs.find(x=>x.isMe):null;
 if(fr&&main&&k2g<25&&k2g>2&&main.g<70&&can('brk')){
  return{k:'brk',ico:'⏱',t:`${fr.r.name}: la fuga sta per finire`,s:`Gruppo a ${fmtGap(main.g)}, ${km1(k2g)} km`,
  o:[{l:'Attacca i compagni',d:`Riserva ${Math.round(fr.W/fr.Wmax*100)}%`,f:()=>ordr(S,fr,'scatta')},{l:'Insiste a tirare',d:'Tiene vivo il vantaggio',f:()=>ordr(S,fr,'tira')},{l:'Si rialza',d:'Aiuterà il capitano',f:()=>ordr(S,fr,'ruota')}],def:0,rec:main.g>35?0:2}}
 return null;
}
function momShow(ev){
 const S=LIVE.S;LIVE.mo=ev;LIVE.mom.last=S.t;LIVE.mom.done[ev.k]=S.t;
 LIVE.wasPlaying=LIVE.playing;LIVE.playing=false;buzz(60);
 const ds=stB('ds'),rec=ds>0.15?(R()<0.55+0.45*ds?ev.rec:rint(0,ev.o.length-1)):-1;
 const box=document.createElement('div');box.id='mom';box.className='mom';
 box.innerHTML=`<div class="momc"><div class="momh"><span class="mi">${ev.ico}</span><div><b>${esc(ev.t)}</b><small>${ev.s}</small></div></div>
  <div class="momo">${ev.o.map((o,i)=>`<button class="momb ${i===rec?'rec':''}" data-act="momgo" data-v="${i}"><b>${esc(o.l)}</b><small>${esc(o.d)}</small>${i===rec?'<span class="chip amber">Consiglio del DS</span>':''}</button>`).join('')}</div>
  <div class="momt"><i id="momt"></i></div></div>`;
 $('#race').appendChild(box);
 const t0=performance.now(),dur=9000;
 LIVE.moTimer=setInterval(()=>{const p=(performance.now()-t0)/dur,el=$('#momt');if(el)el.style.width=Math.max(0,100-p*100)+'%';if(p>=1)momGo(ev.def,true)},100);
}
function momGo(i,auto){
 const ev=LIVE&&LIVE.mo;if(!ev)return;clearInterval(LIVE.moTimer);
 try{ev.o[i].f()}catch(e){}
 const b=$('#mom');if(b)b.remove();LIVE.mo=null;
 slog(LIVE.S,`Ammiraglia: ${ev.o[i].l}${auto?' (scelta automatica)':''}`,true);
 LIVE.playing=LIVE.wasPlaying!==false;const pb=$('#playb');if(pb){pb.textContent=LIVE.playing?'❚❚':'▶'}
 buzz(25);renderMine(false);
}
const _updateRaceUIL=updateRaceUI;
updateRaceUI=function(){
 _updateRaceUIL();
 const S=LIVE&&LIVE.S;if(!S||S.done||LIVE.mo||!LIVE.playing||LIVE.noMom)return;
 const ev=momFind(S);if(ev)momShow(ev);
};

/* ---------- ordini rapidi alla squadra ---------- */
const TEAM_ORD=[['prot','Proteggi il capitano','I gregari restano con lui'],['ritmo','Fate il ritmo','Gregari in testa al gruppo'],['risp','Risparmiate','Tutti a ruota'],['libero','Liberi','Segue il piano']];
function teamOrder(k){
 const S=LIVE.S;const C=liveCtx(S);if(!C)return;
 if(k==='prot'){C.doms.forEach(x=>ordr(S,x,'scorta'));ordr(S,C.cap,'ruota')}
 else if(k==='ritmo'){C.doms.forEach(x=>ordr(S,x,'tira'));ordr(S,C.cap,'ruota')}
 else if(k==='risp'){C.mine.forEach(x=>ordr(S,x,'ruota'))}
 else C.mine.forEach(x=>ordr(S,x,'auto'));
 LIVE.tord=k;buzz(20);renderMine(false);refreshTeamBar();
}
function refreshTeamBar(){const b=$('#teambar');if(!b)return;b.innerHTML=TEAM_ORD.map(([k,l,d])=>`<button data-act="tord" data-v="${k}" aria-pressed="${LIVE.tord===k}"><b>${l}</b><small>${d}</small></button>`).join('')}
const _renderRaceSkeletonL=renderRaceSkeleton;
renderRaceSkeleton=function(){
 _renderRaceSkeletonL();
 const m=$('#mine');if(m)m.insertAdjacentHTML('beforebegin',`<div class="teambar" id="teambar"></div>`);
 const c=$('#race .ctrl .wrap');if(c)c.insertAdjacentHTML('afterbegin',`<button class="btn ghost momsw" data-act="momsw" aria-pressed="${!LIVE.noMom}" title="Momenti chiave">${LIVE.noMom?'Decisioni: off':'Decisioni: on'}</button>`);
 refreshTeamBar();
};

/* ---------- pagelle ---------- */
function grades(S){
 return(S.byTeam.t0||[]).map(x=>{
  const p=S.finish.indexOf(x)+1,plan=S.plans[x.team],isLead=plan&&plan.lead===x;
  let v=6,why=[];
  if(x.dnf){v=4.5;why.push('ritirato')}
  else{if(p===1){v+=3.5;why.push('vittoria')}else if(p<=3){v+=2.5;why.push('podio')}else if(p<=10){v+=1.5;why.push('top 10')}else if(p<=25)v+=0.5;
   if(!isLead){const work=(100-x.E)/50;if(work>0.8){v+=Math.min(1.5,work);why.push('tanto lavoro')}}
   else if(p>20){v-=1;why.push('sottotono')}
   if(x.kmFuga>15){v+=Math.min(1.5,x.kmFuga/40);why.push(`${Math.round(x.kmFuga)} km in fuga`)}}
  return{name:x.r.name,v:Math.max(4,Math.min(10,Math.round(v*2)/2)),why:why.join(', '),lead:isLead};
 }).sort((a,b)=>b.v-a.v);
}
const _endStageLiveL=endStageLive;
endStageLive=function(){if(LIVE&&LIVE.S)LIVE.grades=grades(LIVE.S);const b=$('#mom');if(b)b.remove();if(LIVE&&LIVE.moTimer)clearInterval(LIVE.moTimer);_endStageLiveL()};
const _showStageResultL=showStageResult;
showStageResult=function(){
 _showStageResultL();
 const g=LIVE&&LIVE.grades;if(!g||!g.length)return;
 const col=$('#sheet .negbox > div');if(!col)return;
 col.insertAdjacentHTML('afterbegin',`<div class="card pad pag"><div class="sec-h" style="margin:0 0 6px"><h3>Pagelle</h3><span class="eyebrow">migliore: ${esc(g[0].name.split(' ').slice(-1)[0])}</span></div>
  ${g.map(x=>`<div class="pr"><b class="pv ${x.v>=7.5?'hi':x.v<5.5?'lo':''}">${String(x.v).replace('.',',')}</b><span>${esc(x.name)}${x.lead?' <span class="chip amber">C</span>':''}</span><small>${esc(x.why)}</small></div>`).join('')}</div>`);
 LIVE.grades=null;
};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!LIVE)return;const a=t.dataset.act;
 if(a==='momgo')momGo(+t.dataset.v,false);
 else if(a==='tord'&&LIVE.S)teamOrder(t.dataset.v);
 else if(a==='momsw'){LIVE.noMom=!LIVE.noMom;t.textContent=LIVE.noMom?'Decisioni: off':'Decisioni: on';t.setAttribute('aria-pressed',String(!LIVE.noMom))}
});
