"use strict";
/* ============================================================
   TRASFERIMENTI: trattative, controproposte, offerte ricevute,
   cessioni, morale e ruolo promesso
   ============================================================ */
const moodOf=r=>r.mood??65;
function moodLab(m){return m>=75?{t:'Molto contento',c:'var(--ok)'}:m>=55?{t:'Sereno',c:'var(--ok)'}:m>=35?{t:'Scontento',c:'var(--amber)'}:{t:'Vuole andare via',c:'var(--danger)'}}
const PROMISE={cap:'Capitano',lib:'Libero',greg:'Gregario'};
function teamRankOf(r){const t=G.teams.find(x=>x.id===r.team);if(!t)return 99;return t.riders.map(RID).sort((a,b)=>ovr(b)-ovr(a)).indexOf(r)+1}
function isTopForMe(r){return ME().riders.map(RID).filter(x=>x!==r&&ovr(x)>ovr(r)).length<3}
/* richiesta d'ingaggio: dipende da valore, categoria, morale, interesse di altri e ruolo promesso */
function askSal(r,mode,years,promise){
 let a=r.junior?8000+r.pot*16000:demand(r);
 a*=r.askMul||1;
 if(mode==='renew'){a*=1+clamp(r.pts/300,0,0.5);a*=1+(60-moodOf(r))/200;if((G.bids||[]).some(b=>b.rid===r.id))a*=1.1}
 else if(!r.junior){const t=TEAM(r.team);a*=t.tier==='wt'?2.4:t.tier==='pro'?1.6:1;a*=1+clamp((60-G.rep)/200,0,0.25);
  if(r.sal){const up=TIER_RANK[t.tier]!==undefined&&TIER_RANK[t.tier]<myCat().rank;a=Math.max(a,r.sal*(up?0.95:1.1))}}
 const pref=r.age<=24?3:r.age>=31?1:2;a*=1+0.05*Math.abs(years-pref);
 if(promise){const top=isTopForMe(r);a*=promise==='cap'?(top?0.9:0.97):promise==='greg'?(top?1.12:1.02):1}
 a*=1+0.04*(r.neg||0);
 return Math.max(minSalFor(r),Math.round(a/500)*500);
}
/* indennizzo: i corridori chiave costano di più */
function feeAskFull(r){const k=teamRankOf(r);return Math.round(feeAsk(r)*(k<=2?1.7:k<=5?1.25:1)/1000)*1000}

/* ---------- trattativa ---------- */
let NEG=null;
function openNeg(id){
 const r=RID(id),w=win();
 if(r.team==='acad'){riderSheet(id);return}
 if(r.negW!==w.id){r.negW=w.id;r.neg=0}
 const mode=negMode(r),years=r.age<=24?3:r.age>=31?1:2;
 NEG={id,mode,years,promise:r.promise||'lib',sal:0,fee:0,msg:null,done:false,cSal:null,cFee:null};
 if(mode){NEG.sal=Math.max(minSalFor(r),Math.round(askSal(r,mode,years,NEG.promise)*0.9/1000)*1000);if(mode==='buy')NEG.fee=Math.round(feeAskFull(r)*0.85/1000)*1000}
 renderNeg();
}
function negCostNow(){const m=NEG.mode;if(m!=='sign'&&m!=='buy')return 0;return NEG.sal*remWeeks()/seasonWeeks()+(m==='buy'?NEG.fee:0)}
function endYear(y){return SEASON+y-((NEG.mode==='sign'||NEG.mode==='buy')&&!win().off?1:0)}
function negBlockReason(r,m){
 if(m==='renew'&&moodOf(r)<25)return`${r.name} è scontento e non vuole rinnovare: chiede di essere ceduto.`;
 if(m==='buy'&&teamRankOf(r)===1&&G.phase==='season')return`È il capitano di ${TEAM(r.team).name}: non lo cedono a stagione in corso.`;
 const tr=TIER_RANK[TEAM(r.team).tier];
 if(m!=='renew'&&tr!==undefined&&tr>myCat().rank&&ovr(r)>=70)return`${r.name} non vuole scendere di categoria.`;
 return'';
}
function renderNeg(){
 const r=RID(NEG.id),m=NEG.mode,o=ovr(r),w=win(),C=myCat();
 const title={renew:'Rinnovo del contratto',sign:'Ingaggio di uno svincolato',buy:'Acquisto con indennizzo',pre:r.junior?`Contratto da neoprofessionista per il ${SEASON+1}`:`Firma per il ${SEASON+1} a parametro zero`}[m]||'Trattativa non disponibile';
 const cost=negCostNow(),projA=projected(cost);
 const rosterOk=m==='renew'?true:(m==='pre'||w.off)?nextRoster()<C.max:myRoster()<C.max;
 const moneyOk=(m==='sign'||m==='buy')?projA>=0:true;
 const minOk=NEG.sal>=minSalFor(r),block=m?negBlockReason(r,m):'';
 const blocked=!m||NEG.done||(r.neg||0)>=3||!rosterOk||!moneyOk||!minOk||!!block;
 const ask=m?Math.round(askSal(r,m,NEG.years,NEG.promise)/1000)*1000:0;
 const pot=r.age<=22||r.junior?'★'.repeat(1+Math.round(r.pot*4))+'☆'.repeat(4-Math.round(r.pot*4)):'—';
 const cur=r.team!=='fa'&&r.team!=='jr'?`<div class="note">${r.team==='t0'?'Contratto attuale':'Contratto con '+esc(TEAM(r.team).name)}: ${eur(r.sal)} l'anno fino al ${r.cEnd}</div>`:'';
 const ml=moodLab(moodOf(r));
 const top=isTopForMe(r);
 openSheet(sheetHead(title,esc(r.name),`${catOf(r)} · ${ARCH[r.arch].lab} · ${r.age} anni · ${r.nat} · ${esc(TEAM(r.team).name)}`)+
 `<div class="pb wrap"><div class="negbox"><div class="stack">
   <div class="kv"><div><small>Valore</small><b>${o}</b></div><div><small>W/kg</small><b>${r.wkg.toFixed(2)}</b></div><div><small>Potenziale</small><b style="font-size:16px;color:var(--amber)">${pot}</b></div></div>
   <div class="card pad">${statRow(r)}</div>${cur}
   ${r.team==='t0'?`<div class="note"><span class="cond" style="--c:${ml.c}">${ml.t}</span> · ${r.myRaces||0} corse con noi${r.promise?` · promesso ${PROMISE[r.promise].toLowerCase()} (capitano ${r.capN||0} volte)`:''}</div>`:m==='buy'?`<div class="note">${teamRankOf(r)<=2?'Uno dei corridori più importanti della sua squadra: l\'indennizzo sale.':teamRankOf(r)<=5?'Corridore importante per la sua squadra.':'Non è tra i leader della sua squadra.'}</div>`:''}
   ${r.pts?`<div class="note">${SEASON}: ${r.pts} punti, ${r.wins} vittorie, ${r.days} giorni di corsa</div>`:''}
  </div><div class="stack">
  ${m&&!block?`
   <div><div class="eyebrow">Ruolo promesso</div><div class="seg">${Object.keys(PROMISE).map(k=>`<button data-act="negpromise" data-v="${k}" aria-pressed="${NEG.promise===k}">${PROMISE[k]}</button>`).join('')}</div>
    <div class="note">${top?'Per lui conta il ruolo: da capitano accetta meno soldi, da gregario ne chiede di più.':'Il ruolo pesa poco sulle sue richieste.'} Se prometti il ruolo di capitano e poi non lo fai correre da capitano, si scontenta.</div></div>
   <div><div class="eyebrow">Ingaggio annuo</div><div class="stepper"><button data-act="negstep" data-v="sal:-1000" aria-label="Meno">−</button><output>${eur(NEG.sal)}</output><button data-act="negstep" data-v="sal:1000" aria-label="Più">+</button></div>
    <div class="note">Il procuratore chiede circa ${eur(ask)}${r.age<=24?' e preferisce un contratto lungo':r.age>=31?' e preferisce un anno solo':''}.${minSalFor(r)?` Minimo ${C.lab}: ${eur(minSalFor(r))}.`:''}</div></div>
   <div><div class="eyebrow">Durata</div><div class="seg">${[1,2,3].map(y=>`<button data-act="negyears" data-v="${y}" aria-pressed="${NEG.years===y}">fino al ${endYear(y)}</button>`).join('')}</div></div>
   ${m==='buy'?`<div><div class="eyebrow">Indennizzo a ${esc(TEAM(r.team).short)}</div><div class="stepper"><button data-act="negstep" data-v="fee:-5000" aria-label="Meno">−</button><output>${eur(NEG.fee)}</output><button data-act="negstep" data-v="fee:5000" aria-label="Più">+</button></div></div>`:''}
   <div class="note">${m==='sign'||m==='buy'?(w.off?`Pesa sul bilancio dal ${SEASON+1}.`:`Costo su questa stagione: <b>${eur(cost)}</b> · saldo previsto dopo: <b class="${projA<0?'neg':''}">${eur(projA)}</b>`):`Il nuovo ingaggio pesa sul bilancio dal ${SEASON+1}.`}</div>
   ${!rosterOk?`<div class="msg no">Rosa al completo (${C.max} corridori).</div>`:''}
   ${!moneyOk?`<div class="msg no">Non ci sono i soldi: il saldo di fine stagione andrebbe sotto zero.</div>`:''}
  `:m?`<div class="msg no">${esc(block)}</div>`:`<div class="msg no">${esc(whyNot(r))}.</div>`}
  ${NEG.msg?`<div class="msg ${NEG.msg.ok?'ok':'no'}">${esc(NEG.msg.t)}</div>`:''}
  ${!NEG.done&&NEG.cFee?`<button class="btn" data-act="negcfee">Accetta l'indennizzo richiesto: ${eur(NEG.cFee)}</button>`:''}
  ${!NEG.done&&NEG.cSal?`<button class="btn" data-act="negcsal">Accetta la controproposta: ${eur(NEG.cSal.sal)} fino al ${endYear(NEG.cSal.y)}</button>`:''}
  ${(r.neg||0)>0&&!NEG.done&&m?`<div class="note">Tentativi: ${r.neg}/3</div>`:''}
 </div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">${NEG.done?'Fatto':'Chiudi'}</button>${m&&!NEG.done?`<button class="btn primary" data-act="negoffer" ${blocked?'disabled':''}>Fai l'offerta</button>`:''}</div></div>`,'wide');
}
function negClose(r,m){
 const y=endYear(NEG.years);r.promise=NEG.promise==='lib'?null:NEG.promise;
 if(m==='renew'){r.renewed=true;r.nextSal=NEG.sal;r.cEnd=y;r.mood=Math.min(100,moodOf(r)+8);NEG.msg={ok:true,t:`Accordo: ${r.name} rinnova fino al ${y}.`};addNews(`${r.name} rinnova fino al ${y}`)}
 else if(m==='pre'){r.next={team:'t0',sal:NEG.sal,cEnd:y};NEG.msg={ok:true,t:`Accordo: ${r.name} arriva nel ${SEASON+1}, contratto fino al ${y}.`};addNews(`Firmato ${r.name} per il ${SEASON+1}`)}
 else{if(m==='buy')G.cash-=NEG.fee;const from=TEAM(r.team).name;moveRider(r,'t0');r.sal=NEG.sal;r.cEnd=y;r.bF=0;r.bT=0;r.junior=false;r.mood=70;r.myRaces=0;r.capN=0;
  NEG.msg={ok:true,t:`${r.name} è un tuo corridore, contratto fino al ${y}.`};addNews(m==='buy'?`${r.name} arriva da ${from} per ${eurk(NEG.fee)}`:`Ingaggiato lo svincolato ${r.name}`)}
 NEG.done=true;NEG.cSal=null;NEG.cFee=null;save();renderTop();toast('Accordo raggiunto','ok');renderNeg();
}
function negOffer(){
 const r=RID(NEG.id),m=NEG.mode;if(!m||NEG.done)return;
 if(m==='buy'){const fa=feeAskFull(r),q=NEG.fee/fa;
  if(q<0.97){r.neg=(r.neg||0)+1;NEG.cFee=Math.round(fa*rnd(1,1.06)/1000)*1000;NEG.msg={ok:false,t:q<0.75?`${TEAM(r.team).name} considera l'offerta offensiva. Chiedono ${eur(NEG.cFee)}.`:`${TEAM(r.team).name} chiede ${eur(NEG.cFee)} di indennizzo.`};return renderNeg()}}
 const a=askSal(r,m,NEG.years,NEG.promise),q=NEG.sal/a;
 if(q>=1||(q>=0.95&&R()<0.5))return negClose(r,m);
 r.neg=(r.neg||0)+1;r.askMul*=1.02;
 if(r.team==='t0'&&q<0.85)r.mood=Math.max(0,moodOf(r)-4);
 const py=r.age<=24?3:r.age>=31?1:2;
 NEG.cSal=r.neg>=3?null:{sal:Math.round(askSal(r,m,py,NEG.promise)*rnd(1,1.03)/1000)*1000,y:py};
 NEG.msg={ok:false,t:r.neg>=3?`${r.name} interrompe la trattativa fino alla prossima finestra.`:q<0.8?`Offerta lontana dalle richieste. Il procuratore risponde: ${eur(NEG.cSal.sal)} per ${py} ${py>1?'anni':'anno'}.`:`Il procuratore controbatte: ${eur(NEG.cSal.sal)} per ${py} ${py>1?'anni':'anno'}.`};
 renderNeg();
}

/* ---------- offerte ricevute e cessioni ---------- */
function bidWindow(){const w=win();return w.now||w.off}
function weeklyBids(){
 G.bids=(G.bids||[]).filter(b=>b.exp>absWeek()&&RID(b.rid)&&RID(b.rid).team==='t0');
 if(!bidWindow())return;
 const myR=myCat().rank;
 for(const r of ME().riders.map(RID)){
  if(G.bids.some(b=>b.rid===r.id))continue;
  const o=ovr(r);if(!r.listed&&o<62)continue;
  const p=0.012+Math.max(0,o-64)/300+(r.listed?0.2:0)+r.wins*0.006+(moodOf(r)<35?0.05:0);
  if(R()>p)continue;
  const cap={wt:30,pro:28,conti:16,dev:14};
  const cands=G.teams.filter(t=>t.tier!=='me'&&t.tier!=='dev'&&(r.listed||TIER_RANK[t.tier]>=myR)&&t.riders.length<cap[t.tier]);
  if(!cands.length)continue;
  const t=pick(cands),up=TIER_RANK[t.tier]>myR;
  const base=r.listed||feeAsk(r)*(up?1.1:0.95);
  const fee=Math.round(base*rnd(0.75,1.08)/1000)*1000;
  const sal=Math.round(Math.max(r.sal*1.15,demand(r)*(SAL_MUL[t.tier]||1)*0.8)/500)*500;
  G.bids.push({id:'b'+(G.nextId++),rid:r.id,team:t.id,fee,sal,exp:absWeek()+2,round:0});
  mail('Mercato',`Offerta per ${r.name}`,`${t.name} offre ${eur(fee)} di indennizzo per ${r.name} e gli proporrebbe ${eur(sal)} l'anno (oggi ne prende ${eur(r.sal)}).\nPuoi accettare, rifiutare o chiedere di più dalla sezione Mercato, entro 2 settimane.`);
  NOTIFY(`${t.short} vuole ${r.name}: ${eurk(fee)}`,'ok');
 }
}
function acceptBid(b){
 const r=RID(b.rid),t=TEAM(b.team);
 if(myRoster()<=myCat().min)return{ok:false,msg:`Una ${myCat().lab} deve avere almeno ${myCat().min} corridori.`};
 G.cash+=b.fee;moveRider(r,t.id);
 Object.assign(r,{sal:b.sal,cEnd:SEASON+rint(1,2),listed:null,renewed:false,leavingTo:null,promise:null,focus:null});delete r.nextSal;
 G.bids=G.bids.filter(x=>x.rid!==r.id);G.camps.forEach(c=>c.riders=c.riders.filter(id=>id!==r.id));
 for(const race of G.races)if(race.sel&&race.status==='reg')race.sel=race.sel.filter(id=>id!==r.id);
 addNews(`${r.name} ceduto a ${t.name} per ${eurk(b.fee)}`);save();
 return{ok:true,msg:`${r.name} ceduto a ${t.name}: +${eurk(b.fee)}`};
}
function rejectBid(b){
 const r=RID(b.rid),t=TEAM(b.team);G.bids=G.bids.filter(x=>x!==b);
 if(TIER_RANK[t.tier]>myCat().rank&&b.sal>r.sal*1.25){r.mood=Math.max(0,moodOf(r)-12);mail('Mercato',`${r.name} è deluso`,`Sognava il salto in ${t.name}. Il morale cala e al rinnovo chiederà di più.`)}
 save();
}
function counterBid(b,mult){
 const r=RID(b.rid),ask=Math.round(b.fee*mult/1000)*1000,value=feeAsk(r)*(r.listed?1.15:1.35);b.round++;
 if(ask<=value*rnd(0.95,1.15)){b.fee=ask;b.agreed=true;save();return{ok:true,msg:`${TEAM(b.team).short} accetta ${eur(ask)}: conferma la cessione.`}}
 if(b.round>=2||R()<0.4){G.bids=G.bids.filter(x=>x!==b);save();return{ok:false,msg:`${TEAM(b.team).name} si ritira dalla trattativa.`}}
 b.fee=Math.round((b.fee+ask)/2/1000)*1000;save();return{ok:false,msg:`${TEAM(b.team).short} rilancia a ${eur(b.fee)}.`};
}
function weeklyMood(w){
 const rs=ME().riders.map(RID).sort((a,b)=>ovr(b)-ovr(a));
 rs.forEach((r,i)=>{
  const exp=(w-5)*(i<6?1.1:0.7);let m=moodOf(r);
  m+=(62-m)*0.1;
  if(!injured(r,w)){if(r.days<exp*0.55)m-=3;else m+=2}
  if(r.promise==='cap'&&(r.myRaces||0)>=4&&(r.capN||0)/(r.myRaces||1)<0.3){m-=8;if(m<45)mail('Mercato',`${r.name} vuole correre da capitano`,`Gli avevi promesso il ruolo di capitano ma lo è stato solo ${r.capN||0} volte su ${r.myRaces} corse.`)}
  const was=moodOf(r);r.mood=clamp(Math.round(m),0,100);
  if(was>=25&&r.mood<25)mail('Mercato',`${r.name} chiede la cessione`,`È scontento (poche corse o promesse non mantenute). Non rinnoverà e le altre squadre lo sanno: arriveranno offerte.`);
 });
}
function sellSheet(id){
 const r=RID(id);const def=r.listed||Math.round(feeAsk(r)*1.1/1000)*1000;
 window._sell={id,price:def};renderSell();
}
function renderSell(){
 const r=RID(window._sell.id),p=window._sell.price,w=win();
 openSheet(sheetHead('Cessione',`Mettere ${esc(r.name)} sul mercato?`,`Valore di mercato stimato ${eur(feeAsk(r))}. Le squadre interessate faranno offerte ${w.now||w.off?'nelle prossime settimane':'quando riapre la finestra di mercato'}.`)+
 `<div class="pb wrap stack"><div class="eyebrow">Prezzo richiesto</div><div class="stepper"><button data-act="sellstep" data-v="-10000" aria-label="Meno">−</button><output>${eur(p)}</output><button data-act="sellstep" data-v="10000" aria-label="Più">+</button></div>
 <div class="note">Più alto è il prezzo, meno offerte arriveranno. Un corridore sul mercato riceve offerte anche da squadre di categoria inferiore.</div></div>
 <div class="pf"><div class="wrap fr">${r.listed?'<button class="btn ghost" data-act="unsell">Togli dal mercato</button>':''}<button class="btn ghost" data-act="close">Annulla</button><button class="btn primary" data-act="sellok">Metti sul mercato</button></div></div>`);
}
function bidsList(){
 const bs=(G.bids||[]).filter(b=>RID(b.rid)&&RID(b.rid).team==='t0');
 const listed=ME().riders.map(RID).filter(r=>r.listed);
 return`${bs.length?bs.map(b=>{const r=RID(b.rid),t=TEAM(b.team),wk=Math.max(0,b.exp-absWeek());return`<div class="card bidrow"><div class="ovr ${ovr(r)>=75?'hi':''}">${ovr(r)}</div><div style="min-width:0"><div class="nm">${esc(r.name)} → ${esc(t.name)}</div>
  <div class="tags"><span class="chip">${({wt:'WorldTeam',pro:'ProTeam',conti:'Continental'})[t.tier]}</span><span>Indennizzo <b>${eur(b.fee)}</b> · a lui ${eurk(b.sal)}/anno (ora ${eurk(r.sal)}) · ${G.phase==='season'?`scade tra ${wk} sett.`:''}</span></div></div>
  <div class="row">${b.agreed?`<button class="btn primary sm" data-act="bidyes" data-v="${b.id}">Conferma cessione</button>`:`<button class="btn ghost sm" data-act="bidno" data-v="${b.id}">Rifiuta</button><button class="btn sm" data-act="bidup" data-v="${b.id}:1.15">Chiedi +15%</button><button class="btn sm" data-act="bidup" data-v="${b.id}:1.3">+30%</button><button class="btn primary sm" data-act="bidyes" data-v="${b.id}">Accetta</button>`}</div></div>`}).join(''):'<div class="note">Nessuna offerta per i tuoi corridori. Arrivano nelle finestre di mercato, soprattutto per chi va forte o è sul mercato.</div>'}
 ${listed.length?`<div class="eyebrow" style="margin-top:8px">Sul mercato</div>${listed.map(r=>`<button class="card mrow" data-act="sell" data-v="${r.id}"><div class="ovr">${ovr(r)}</div><div><div class="nm">${esc(r.name)}</div><div class="tags">${ARCH[r.arch].lab} · ${r.age} anni</div></div><div class="pr">${eurk(r.listed)}<small>prezzo richiesto</small></div></button>`).join('')}`:''}`;
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 const a=t.dataset.act,v=t.dataset.v;
 switch(a){
  case'negpromise':NEG.promise=v;renderNeg();break;
  case'negcfee':NEG.fee=NEG.cFee;NEG.cFee=null;NEG.msg=null;renderNeg();break;
  case'negcsal':{const r=RID(NEG.id);NEG.sal=NEG.cSal.sal;NEG.years=NEG.cSal.y;negClose(r,NEG.mode);break}
  case'bidyes':{const b=G.bids.find(x=>x.id===v);if(b){const res=acceptBid(b);toast(res.msg,res.ok?'gold':'bad')}render();break}
  case'bidno':{const b=G.bids.find(x=>x.id===v);if(b)rejectBid(b);render();break}
  case'bidup':{const[id,m]=v.split(':');const b=G.bids.find(x=>x.id===id);if(b){const res=counterBid(b,+m);toast(res.msg,res.ok?'ok':'')}render();break}
  case'sell':sellSheet(v);break;
  case'sellstep':window._sell.price=Math.max(10000,window._sell.price+(+v));renderSell();break;
  case'sellok':{const r=RID(window._sell.id);r.listed=window._sell.price;save();toast(`${r.name} è sul mercato`,'ok');closeSheet();render();break}
  case'unsell':{const r=RID(window._sell.id);r.listed=null;save();closeSheet();render();break}
 }
});
