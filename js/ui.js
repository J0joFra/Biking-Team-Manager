"use strict";
/* ============================================================
   INTERFACCIA
   ============================================================ */
const ICON={
 home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 team:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2c2.9.3 5.5 2.6 5.5 5.8"/>',
 market:'<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
 base:'<path d="M2 20l7-12 4 6 3-4 6 10z"/><path d="M9 8l-1.5 3"/>',
 rank:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1A3.5 3.5 0 0 0 8 10.5M16 6h3.5v1a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8.5 21h7M10 17h4v4h-4z"/>',
 full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 spon:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7M3 13h18M11 13v2h2v-2"/>',
 pin:'<path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 check:'<path d="M5 12l5 5 9-10"/>'
};
const ic=(n,s=20)=>`<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
function jersey(c1,c2,s=36){return`<svg viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true"><path d="M13 4l-9 6 4 8 4-2v20h16V16l4 2 4-8-9-6c-1 3-4 5-7 5s-6-2-7-5z" fill="${c1}" stroke="rgba(0,0,0,.28)" stroke-width="1"/><path d="M12 19h16v5H12z" fill="${c2}"/><path d="M16.5 4.6c1 2.3 2.2 3.4 3.5 3.4s2.5-1.1 3.5-3.4" fill="none" stroke="${c2}" stroke-width="2"/></svg>`}
const myJersey=(s)=>jersey(G.jersey[0],G.jersey[1],s);
const ord=n=>n+'°';
function toast(t,kind=''){const box=$('#toasts');while(box.children.length>=3)box.firstChild.remove();const d=document.createElement('div');d.className='toast '+kind;d.textContent=t;box.appendChild(d);setTimeout(()=>d.classList.add('out'),2600);setTimeout(()=>d.remove(),3100)}
NOTIFY=toast;
function openSheet(html,cls=''){const s=$('#sheet');s.innerHTML=`<div class="panel ${cls}" role="dialog" aria-modal="true">${html}</div>`;s.hidden=false}
function closeSheet(){$('#sheet').hidden=true;$('#sheet').innerHTML=''}
function sheetHead(eyebrow,title,sub='',close=true){return`<div class="ph wrap"><div style="min-width:0"><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${sub?`<div class="note">${sub}</div>`:''}</div>${close?'<button class="x" data-act="close" aria-label="Chiudi">×</button>':''}</div>`}
function busyOn(t){$('#busy').hidden=false;$('#busytxt').textContent=t}
function busyOff(){$('#busy').hidden=true}
let ROT='';
function rotBanner(){let off=false;try{off=localStorage.getItem('amm-rot')==='1'}catch(e){}ROT=off?'':`<div class="banner rotate"><span style="flex:1">Ammiraglia è pensata in orizzontale: gira il telefono per avere corsa e ordini affiancati.</span><button class="chip" data-act="rotok">Ok</button></div>`}

/* ---------- shell ---------- */
const TABS=[['home','Home','home'],['cal','Corse','cal'],['team','Squadra','team'],['market','Mercato','market'],['spon','Sponsor','spon'],['base','Strutture','base'],['rank','Classifica','rank']];
function render(){
 if(!G){renderIntro();return}
 $('#top').hidden=false;$('#tabs').hidden=false;
 renderTop();
 const unread=G.inbox.filter(m=>!m.read).length,offs=G.offers.length;
 $('#tabs').innerHTML=`<div class="tabin">${TABS.map(([k,l,i])=>`<button data-act="tab" data-v="${k}" aria-current="${G.tab===k}">${ic(i,22)}<span>${l}</span>${k==='home'&&unread?`<b class="badge">${unread}</b>`:''}${k==='spon'&&offs?`<b class="badge">${offs}</b>`:''}</button>`).join('')}</div>`;
 const v=$('#view');
 ({home:renderHome,cal:renderCal,team:renderTeam,market:renderMarket,spon:renderSponsor,base:renderBase,rank:renderRank})[G.tab]();
 v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter');
}
function renderTop(){
 const d=weekDate(G.week);
 $('#top').innerHTML=`<div class="wrap topin"><div class="crest">${myJersey(34)}</div>
  <div style="min-width:0"><div class="tn">${esc(G.name)}</div><div class="sub"><span class="chip cat">${myCat().lab}</span> ${G.phase==='season'?`Sett. ${G.week} · ${d.getDate()} ${MESI[d.getMonth()]} ${SEASON}`:`Fine stagione ${SEASON}`}<span class="hide-s">· ${esc(G.sede.city)}</span></div></div>
  <div class="hud"><div><small>Cassa</small><b class="${G.cash<0?'neg':''}">${eurk(G.cash)}</b></div><div><small>Reputazione</small><b>${Math.round(G.rep)}</b></div><div class="hide-s"><small>Sponsor</small><b>${sponsorSat()}%</b></div></div>
  <button class="iconbtn" data-act="fullscreen" aria-label="Schermo intero">${ic('full',20)}</button></div>`;
}
function renderIntro(){
 $('#top').hidden=true;$('#tabs').hidden=true;
 const sel=window._jer||0;
 $('#view').innerHTML=`<div class="intro">
  <div class="introL">
   <div class="eyebrow">Gestionale di ciclismo</div>
   <h1>Ammiraglia</h1>
   <p>Fondi una squadra Continental e portala fino al WorldTour. Iscriviti alle corse vere d'Italia e d'Europa, programma i ritiri in altura, cresci i talenti nella tua scuola juniores e guida le tappe dall'ammiraglia.</p>
   ${ROT}
  </div>
  <div class="card introR">
   <div class="field"><label for="tname" class="eyebrow">Nome della squadra</label><input id="tname" maxlength="34" value="Ciclistica Valle Azzurra"></div>
   <div class="field"><label for="tsede" class="eyebrow">Sede della squadra</label><select id="tsede">${Object.keys(REGIONS).map(k=>`<optgroup label="${REGIONS[k].n}">${REGIONS[k].c.map(c=>`<option value="${k}|${c[0]}" ${c[0]==='Torino'?'selected':''}>${c[0]}</option>`).join('')}</optgroup>`).join('')}</select><span class="note">Gli sponsor vicini alla sede sono i più propensi a sostenerti.</span></div>
   <div class="field"><span class="eyebrow">Maglia</span><div class="jerseys">${JERSEYS.map((j,i)=>`<button class="jbtn" data-act="jer" data-v="${i}" aria-pressed="${i===sel}" aria-label="Maglia ${i+1}">${jersey(j[0],j[1],44)}</button>`).join('')}</div></div>
   <button class="btn primary big" data-act="start">Inizia la stagione 2027</button>
   <ul class="note list"><li>Corse Continental ed Under 23 subito; le ProSeries su invito; WorldTour e Grandi Giri solo da ProTeam o WorldTeam.</li><li>Ogni corsa costa: quota d'iscrizione più trasferta per corridore e giorno.</li><li>I primi sponsor arrivano dal territorio. Con risultati e reputazione arrivano offerte da tutta Italia e dall'estero, fino al main sponsor che porta al WorldTour.</li><li>Il gioco salva da solo nel browser.</li></ul>
  </div></div>`;
}

/* ---------- home ---------- */
function renderHome(){
 const pend=myPending(),nx=nextMyRace();
 let hero;
 if(G.phase!=='season'){
  const L=licenceCheck(),inc=incomeIn(SEASON+1),nextMain=G.contracts.some(c=>c.slot==='main'&&activeIn(c,SEASON+1));
  hero=`<div class="hero card"><div class="eyebrow">Stagione ${SEASON} conclusa</div><h2>${myCatRank()}ª tra le ${myCat().lab}</h2>
   <div class="kv"><div><small>Punti</small><b>${teamPoints(ME())}</b></div><div><small>Vittorie</small><b>${ME().riders.reduce((a,id)=>a+RID(id).wins,0)}</b></div><div><small>Sponsor ${SEASON+1}</small><b>${eurk(inc)}</b></div></div>
   ${L?`<div class="offer"><div class="eyebrow">Licenza ${CAT[L.to].lab}</div>${L.reqs.map(r=>`<span class="req ${r.ok?'ok':''}">${ic(r.ok?'check':'lock',14)} ${esc(r.t)}</span>`).join('')}<span class="note">${CAT[L.to].lab}: rosa da ${CAT[L.to].min} a ${CAT[L.to].max} corridori · ingaggio minimo ${eur(CAT[L.to].minSal)} · staff ${eurk(CAT[L.to].staff)}/anno</span></div>`:''}
   ${!nextMain?`<div class="msg no">Non hai ancora un main sponsor per il ${SEASON+1}: cercalo nella sezione Sponsor.</div>`:''}
   <div class="note">Prima di ripartire: rinnovi degli sponsor, mercato e promozioni dalla scuola juniores.</div>
   <div class="row">${L&&L.ok?`<button class="btn primary big" data-act="nextseason" data-v="up">Diventa ${CAT[L.to].lab} e passa al ${SEASON+1}</button><button class="btn ghost" data-act="nextseason" data-v="">Resta ${myCat().lab}</button>`:`<button class="btn primary big" data-act="nextseason" data-v="">Passa al ${SEASON+1}</button>`}<button class="btn ghost" data-act="tab" data-v="spon">Sponsor${G.offers.length?` (${G.offers.length})`:''}</button></div></div>`;
 }else if(pend.length){
  hero=`<div class="hero card go"><div class="eyebrow">Questa settimana</div>${pend.map(r=>r.tier==='jun'?jrHero(r):r.tier==='naz'?natHero(r):`<div class="herorace"><div style="min-width:0"><h2>${esc(r.name)}</h2><div class="mt">${raceChips(r)}</div></div><button class="btn primary big" data-act="convoca" data-v="${r.id}">Convocazioni</button></div>`).join('')}</div>`;
 }else{
  hero=`<div class="hero card"><div class="eyebrow">Settimana ${G.week} · ${weekLab(G.week)}</div>
   <h2>${nx?`Prossima corsa: ${esc(nx.name)}`:'Nessuna corsa in programma'}</h2>
   <div class="note">${nx?`Tra ${nx.w-G.week} settiman${nx.w-G.week===1?'a':'e'} (${weekLab(nx.w)}).`:'Apri il Calendario e iscriviti alle corse adatte alla tua squadra.'}</div>
   <div class="row"><button class="btn primary big" data-act="adv1">Avanza di una settimana</button>${nx?`<button class="btn big" data-act="advnext">Vai alla prossima corsa</button>`:`<button class="btn big" data-act="tab" data-v="cal">Calendario</button>`}</div></div>`;
 }
 const objs=G.contracts.filter(c=>activeIn(c,SEASON)).sort((a,b)=>b.amount-a.amount).slice(0,5).map(c=>{const v=Math.min(c.obj.n,Math.round(contractProg(c)));return`<div class="obj ${c.done?'done':''}"><div class="ol"><span><b class="sn">${esc(SP(c.sid).name)}</b> ${esc(c.obj.txt)}</span><b>${c.done?ic('check',16):eurk(c.bonus)}</b></div><div class="bar ${c.done?'e':''}"><i style="width:${v/c.obj.n*100}%"></i></div><small>${v}/${c.obj.n}</small></div>`}).join('')||'<div class="note">Nessuno sponsor attivo.</div>';
 const mails=G.inbox.slice(0,6).map(m=>`<button class="mail ${m.read?'':'unread'}" data-act="mail" data-v="${m.id}"><span class="from">${esc(m.from)}</span><span class="mt2">${esc(m.title)}</span><span class="wk">S${m.w}</span></button>`).join('')||'<div class="note">Nessun messaggio.</div>';
 const recent=G.races.filter(r=>r.status==='done'&&r.result&&r.result.winner&&r.tier!=='jun').sort((a,b)=>b.w-a.w||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]).slice(0,5);
 const camps=G.camps.filter(c=>!c.done);
 const proj=projected();
 $('#view').innerHTML=`${ROT}<div class="homegrid">
  <div class="col">${callupBanner()}${hero}
   ${G.phase==='season'?trainCard():''}
   ${G.offers.length?`<button class="banner" data-act="tab" data-v="spon">${ic('spon',18)}<span><b>${G.offers.length} propost${G.offers.length>1?'e':'a'} di sponsorizzazione</b> da valutare</span></button>`:''}
   <div class="card pad"><div class="sec-h"><h3>Obiettivi degli sponsor</h3><span class="eyebrow">${sponsorSat()}% soddisfatti</span></div>${objs}</div>
   <div class="kv kv4"><div><small>Saldo a fine stagione</small><b class="${proj<0?'neg':''}">${eurk(proj)}</b></div><div><small>Classifica</small><b>${myCatRank()}ª</b></div><div><small>Punti</small><b>${teamPoints(ME())}</b></div><div><small>Rosa</small><b>${myRoster()}/${myCat().max}</b></div></div>
  </div>
  <div class="col">
   <div class="card pad"><div class="sec-h"><h3>${ic('mail',18)} Posta</h3><span class="eyebrow">${G.inbox.filter(m=>!m.read).length} da leggere</span></div><div class="mails">${mails}</div></div>
   ${camps.length?`<div class="card pad"><div class="sec-h"><h3>Ritiri in corso</h3></div>${camps.map(c=>{const L=CAMPS.find(x=>x.id===c.loc);return`<div class="note">${esc(L.name)} · ${c.riders.length} corridori · ${weekLab(c.from)}–${weekLab(c.to)}${c.from<=G.week?' · in corso':''}</div>`}).join('')}</div>`:''}
   ${recent.length?`<div class="card pad"><div class="sec-h"><h3>Risultati recenti</h3></div>${recent.map(r=>`<button class="recent" data-act="race" data-v="${r.id}"><span class="chip cls">${r.lab}</span><span class="rn">${esc(r.name)}</span><span class="muted">${esc(r.result.winner)}</span></button>`).join('')}</div>`:''}
  </div></div>`;
}
function raceChips(r){return`<span class="chip cls">${r.lab}</span><span class="chip">${r.ctry}</span>${r.tier==='u23'||r.flag==='u23'?'<span class="chip u23">U23</span>':''}<span class="muted">${r.stages.length>1?r.stages.length+' tappe':TYPE_LAB[r.stages[0].t]+(r.stages[0].km?' · '+r.stages[0].km+' km':'')}</span>${stBars(r)}`}
function stBars(r){return`<span class="stbars" aria-hidden="true">${r.stages.slice(0,21).map(s=>`<i class="${ROAD(s.t)?'':'tt'} ${['pave','roubaix','sterrato'].includes(s.t)?'pv':''}" style="height:${TYPE_H[s.t]}px"></i>`).join('')}</span>`}
function mailSheet(id){
 const m=G.inbox.find(x=>x.id===id);if(!m)return;m.read=true;save();
 openSheet(sheetHead(`${esc(m.from)} · settimana ${m.w}`,esc(m.title))+`<div class="pb wrap"><div class="mailbody">${esc(m.body).replace(/\n/g,'<br>')}</div></div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Ok</button></div></div>`);
}

/* ---------- calendario ---------- */
const CALF=[['acc','Accessibili'],['reg','Iscritte'],['all','Tutte'],['ita','Italia'],['u23','Under 23'],['wt','WorldTour'],['naz','Nazionali'],['done','Concluse']];
function raceState(r){
 if(r.status==='done')return r.result&&r.result.mine?{cls:'done me',t:`${ord(r.result.mine[0].pos)} ${esc(r.result.mine[0].name.split(' ').slice(-1)[0])}`}:r.result&&r.result.winner?{cls:'done',t:esc(r.result.winner)}:r.result&&r.result.junior?{cls:'done',t:`Scuola: ${ord(r.result.junior[0].pos)}`}:{cls:'done',t:'Conclusa'};
 if(r.status==='reg')return{cls:'reg',t:`${ic('check',14)} Iscritto`};
 if(r.tier==='naz'){const n=(G.callups||[]).filter(c=>c.status==='accepted'&&c.keys.includes(r.key)).length;return{cls:n?'reg':'inv',t:n?`${n} convocat${n>1?'i':'o'}`:'Nazionali'}}
 if(r.status==='declined')return{cls:'no',t:'Invito rifiutato'};
 const a=access(r);
 if(!a.ok)return{cls:'lock',t:`${ic('lock',13)} ${r.tier==='jun'?'Juniores':'Chiusa'}`};
 if(r.w<=G.week)return{cls:'lock',t:'Iscrizioni chiuse'};
 return a.mode==='invite'?{cls:'inv',t:`Invito · ${chanceLab(a.chance)}`}:{cls:'fee',t:eurk(feeOf(r))};
}
function renderCal(){
 const f=G.calf||'acc';
 const past=r=>r.status==='done'||r.w<G.week||G.phase!=='season';
 const flt=r=>f==='done'?past(r)&&r.status==='done':past(r)?false:f==='all'?true:f==='reg'?r.status==='reg':f==='ita'?r.ctry==='ITA':f==='u23'?(r.tier==='u23'||r.flag==='u23'||r.tier==='jun'):f==='wt'?['gt','mon','uwt1','uwt2'].includes(r.tier):f==='naz'?r.tier==='naz':(access(r).ok||r.status==='reg'||r.tier==='naz');
 const list=G.races.filter(flt).sort((a,b)=>f==='done'?(b.w-a.w||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]):(a.w-b.w||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]));
 let html=`<div class="toolbar"><div class="chips">${CALF.map(([k,l])=>`<button class="fchip" data-act="calf" data-v="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div><span class="note">${list.length} corse${f==='done'?' concluse':''}</span></div>${!list.length?`<div class="note">${f==='done'?'Nessuna corsa conclusa finora.':G.phase!=='season'?'Stagione finita: il nuovo calendario arriva con la prossima stagione.':'Nessuna corsa in programma con questo filtro.'}</div>`:''}`;
 let lw=-1;html+='<div class="callist">';
 for(const r of list){
  if(r.w!==lw){lw=r.w;html+=`<div class="wk ${r.w===G.week?'now':''}" ${r.w===G.week?'id="wknow"':''}><b>Sett. ${r.w}</b> ${weekLab(r.w)}${r.w===G.week?' · <span class="chip u23">adesso</span>':''}</div>`}
  const s=raceState(r);
  html+=`<button class="rrow ${f==='done'?'past':''}" data-act="race" data-v="${r.id}"><div class="rmain"><div class="rn">${esc(r.name)}</div><div class="mt">${raceChips(r)}</div></div><span class="pill ${s.cls}">${s.t}</span></button>`;
 }
 html+='</div>';
 $('#view').innerHTML=html;
 window.scrollTo(0,0);
}
function profileSVG(c,w=260,h=46){
 const n=60,pts=[];let mn=c.mn,mx=Math.max(c.mx,c.mn+150);
 for(let i=0;i<=n;i++){const k=Math.round(i/n*c.N);pts.push(`${(i/n*w).toFixed(1)},${(h-2-(c.alt[k]-mn)/(mx-mn)*(h-6)).toFixed(1)}`)}
 let secs='';for(let i=0;i<c.N;i++)if(c.surf[i]&&(i===0||!c.surf[i-1])){let j=i;while(j<c.N&&c.surf[j])j++;secs+=`<rect x="${(i/c.N*w).toFixed(1)}" y="${h-3}" width="${Math.max(1.5,(j-i)/c.N*w).toFixed(1)}" height="3" class="${c.surf[i]===1?'sv-pave':'sv-grav'}"/>`}
 return`<svg class="minip" viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,${h} ${pts.join(' ')} ${w},${h}" class="sv-t"/><polyline points="${pts.join(' ')}" class="sv-l"/>${secs}</svg>`;
}
function raceSheet(id){
 const r=G.races.find(x=>x.id===id);if(!r)return;
 const T=TIERS[r.tier],a=access(r),fee=feeOf(r);
 const pro=r.stages[0].t==='prologo';
 const stg=r.stages.map((s,i)=>{const c=genCourse(s.t,s.seed,s.km,T.lf);const climbs=c.climbs.filter(x=>x.cat!=='4').length;
  return`<div class="stage"><div class="sl"><b>${r.stages.length>1?(s.t==='prologo'?'P':i+(pro?0:1)):''}</b><span>${TYPE_LAB[s.t]} · ${km1(c.len)} km${climbs?` · ${climbs} GPM`:''}${c.secN?` · ${c.secN} settori`:''}</span></div>${profileSVG(c)}</div>`}).join('');
 let act='',info='';
 if(r.status==='done'&&r.result){
  const R=r.result;
  info=R.junior?`<div class="card tbl"><table class="t">${R.junior.map(j=>`<tr class="me"><td class="n">${j.pos}</td><td>${esc(j.name)}</td></tr>`).join('')}</table></div>`:
  `${R.mine?`<div class="msg ok">${R.nat?'I tuoi corridori in nazionale':'La tua squadra'}: ${R.mine.slice(0,3).map(m=>`${esc(m.name)} ${ord(m.pos)}`).join(' · ')}${R.nat?'':` · ${R.myPts} punti · ${eur(R.prize)} di premi`}</div>`:''}
   <div class="card tbl"><table class="t">${R.top.map((x,i)=>`<tr class="${R.mine&&R.mine.some(m=>m.id===x.id)?'me':''}"><td class="n">${i+1}</td><td>${esc(x.name)} <span class="tm">${esc(x.team)}</span></td><td class="r">${i===0?fmtT(x.t||0):fmtGap(x.t-R.top[0].t)}</td></tr>`).join('')}</table></div>
   ${R.stageW?`<div class="note">Vincitori di tappa: ${R.stageW.map((n,i)=>`${i+1}. ${esc(n)}`).join(' · ')}</div>`:''}`;
 }else if(r.status==='reg'){
  info=`<div class="msg ok">Iscritto. Quota pagata: ${eur(r.fee||fee)}. Le convocazioni si fanno nella settimana della corsa.</div>`;
  if(r.w>G.week)act=`<button class="btn ghost" data-act="withdraw" data-v="${r.id}">Ritira l'iscrizione (rimborso 50%)</button>`;
 }else if(r.status==='declined')info=`<div class="msg no">L'organizzazione non ti ha invitato quest'anno.</div>`;
 else if(r.tier==='jun'){info=`<div class="msg">Gara juniores: corrono i ragazzi della tua scuola${G.academy.level?'':' (costruisci la scuola nelle Strutture)'}. Nella settimana della gara puoi seguirla dal vivo o saltarla.</div>`}
 else if(r.tier==='naz'){const cs=(G.callups||[]).filter(c=>c.keys.includes(r.key)&&RID(c.rid));info=`<div class="msg">Corsa per nazionali${r.cat?' · '+CAT_LAB[r.cat]:''}. I commissari tecnici convocano i corridori in forma e con buoni risultati, 3–4 settimane prima; la richiesta arriva nella tua posta e nella Home.</div>${cs.length?`<div class="note">${cs.map(c=>`${esc(RID(c.rid).name)}: ${c.status==='accepted'?'convocato':c.status==='declined'?'convocazione rifiutata':'in attesa di risposta'}`).join(' · ')}</div>`:''}`}
 else if(!a.ok)info=`<div class="msg no">${ic('lock',14)} ${esc(a.why)}.</div>`;
 else if(r.w<=G.week)info=`<div class="msg no">Iscrizioni chiuse: servono almeno 7 giorni di anticipo.</div>`;
 else{
  info=a.mode==='invite'?`<div class="msg">Serve un invito degli organizzatori. Probabilità ${chanceLab(a.chance)} (${Math.round(a.chance*100)}%): dipende da reputazione e nazionalità. Se ti invitano paghi la quota.</div>`:a.auto?`<div class="msg ok">Sei tra le prime due ProTeam: invito automatico.</div>`:'';
  info+=`<div class="note">${r.stages.length>1?'Corsa a tappe: si corre solo come squadra (almeno 4 corridori), con classifica individuale e classifica a squadre.':indivOk(r)?`Iscrizione anche individuale: puoi schierare da 1 a ${selSize(r)} corridori; la trasferta dei posti vuoti ti viene rimborsata.`:'Si corre come squadra: almeno 4 corridori.'}</div>`;
  act=`<button class="btn primary big" data-act="register" data-v="${r.id}" ${G.cash<fee?'disabled':''}>${a.mode==='invite'?'Chiedi l\'invito':'Iscriviti'} · ${eur(fee)}</button>`;
 }
 const dl=r.dur>1?`${weekLab(r.w)} – ${weekLab(r.w+r.dur-1)}`:weekLab(r.w);
 openSheet(sheetHead(`${r.lab} · ${T.lab} · ${COUNTRY[r.ctry]||r.ctry} · ${dl}`,esc(r.name),`${r.stages.length>1?r.stages.length+' tappe':'Corsa di un giorno'} · ${T.win?`${T.win} punti UCI al vincitore`:'Gara giovanile'}${T.size&&r.tier!=='jun'?` · squadre da ${T.size}`:''}`)+
 `<div class="pb wrap"><div class="rsgrid"><div class="stages">${stg}</div><div class="rsside">
   ${r.tier!=='jun'&&r.status!=='done'?`<div class="card pad"><div class="eyebrow">Costi</div><div class="big2">${eur(fee)}</div><div class="note">Iscrizione ${eur(T.fee)} + trasferta ${eur(T.prd)} per corridore al giorno${r.ctry!=='ITA'?' · +20% per la trasferta all\'estero':''}</div></div>`:''}
   ${info}<div class="row">${act}</div></div></div></div>`,'wide');
}

/* ---------- squadra ---------- */
function condOf(r){
 const c=r.form*(1-r.fat/260)*(1+altEff(r,G.week));
 if(c>=1.0)return{t:'Ottima',c:'var(--ok)'};
 if(c>=0.972)return{t:'Buona',c:'var(--ok)'};
 if(c>=0.94)return{t:'Discreta',c:'var(--amber)'};
 return{t:'Affaticato',c:'var(--danger)'};
}
function statRow(r){const s=stats(r);return`<div class="statrow">${[['SAL',s.sal],['PIA',s.pia],['CRO',s.cro],['VOL',s.vol],['RES',s.res],['REC',s.rec]].map(([k,v])=>`<div class="stat"><small>${k}</small><b>${v}</b><div class="bar"><i style="width:${v}%"></i></div></div>`).join('')}</div>`}
function contractLine(r){
 if(r.team!=='t0')return'';
 let tag='';
 if(r.leavingTo)tag=`<span class="chip red">Va a ${esc(TEAM(r.leavingTo).short)}</span>`;
 else if(r.renewed)tag='<span class="chip u23">Rinnovato</span>';
 else if(r.cEnd===SEASON)tag='<span class="chip red">In scadenza</span>';
 return`<span>${eurk(r.sal)}/anno · fino al ${r.cEnd}</span>${tag}`;
}
function riderSheet(id){
 const r=RID(id);if(!r)return;
 const c=condOf(r),ftp=Math.round(r.mass*r.wkg);
 const pot=r.age<=22?'★'.repeat(1+Math.round(r.pot*4))+'☆'.repeat(4-Math.round(r.pot*4)):'—';
 const res=r.res.slice().reverse().map(x=>`<tr><td>${esc(x.name)} <span class="tm">${x.cls}</span></td><td class="r">${x.pos?ord(x.pos):'—'}${x.w?` <span class="chip amber">${x.w} vitt.</span>`:''}</td></tr>`).join('');
 const camp=G.camps.find(cp=>!cp.done&&cp.riders.includes(r.id));
 openSheet(sheetHead(`${ARCH[r.arch].lab} · ${catOf(r)}${r.neo?' · 1° anno':''}`,esc(r.name),`${r.age} anni · ${r.nat} · ${esc(TEAM(r.team).name)}`)+
 `<div class="pb wrap"><div class="negbox"><div class="stack">
  ${(r.titles||[]).length?`<div class="titles">${r.titles.map(t=>`<span class="chip amber">${esc(t)}</span>`).join('')}</div>`:''}${r.natB&&r.natB[1]>=G.week?`<div class="msg">In nazionale dal ${weekLab(r.natB[0])} al ${weekLab(r.natB[1]+1)}</div>`:''}
  <div class="kv"><div><small>Valore</small><b>${ovr(r)}</b></div><div><small>Soglia</small><b>${ftp}</b> W</div><div><small>W/kg</small><b>${r.wkg.toFixed(2)}</b></div>
  <div><small>Peso</small><b>${r.mass.toFixed(1)}</b> kg</div><div><small>Volata</small><b>${r.spr}</b> W</div><div><small>Potenziale</small><b style="font-size:16px;color:var(--amber)">${pot}</b></div></div>
  <div class="card pad">${statRow(r)}</div>
  <div class="card pad two"><div><div class="eyebrow">Condizione</div><div class="cond" style="--c:${c.c};margin-top:4px">${c.t}</div>${altEff(r,G.week)>0?`<div class="note">Effetto altura +${(altEff(r,G.week)*100).toFixed(1)}%</div>`:''}${camp?`<div class="note">In ritiro: ${weekLab(camp.from)}–${weekLab(camp.to)}</div>`:''}</div>
   <div><div class="eyebrow">Fatica · giorni</div><div class="bar f" style="margin-top:6px"><i style="width:${r.fat}%"></i></div><div class="note">${Math.round(r.fat)}/100 · ${recDays(r)?`recupero completo in ~${recDays(r)} giorni`:'riposato'} · ${r.days} giorni di corsa</div>${injured(r)?`<div class="msg no" style="margin-top:6px">Infortunato fino al ${weekLab(r.injUntil)}</div>`:r.injRec&&G.week<=r.injRec?'<div class="note">Appena rientrato da un infortunio: recupera la fatica più lentamente.</div>':''}</div></div>
 </div><div class="stack">
  ${r.team==='t0'?`<div class="card pad stack"><div class="eyebrow">Contratto</div><div>${eur(r.sal)} l'anno · fino al ${r.cEnd}${r.nextSal?` · dal ${SEASON+1}: ${eur(r.nextSal)}`:''}</div>${r.leavingTo?`<div class="note">Ha firmato con ${esc(TEAM(r.leavingTo).name)} per il ${SEASON+1}.</div>`:''}
   <div class="note"><span class="cond" style="--c:${moodLab(moodOf(r)).c}">${moodLab(moodOf(r)).t}</span>${r.promise?` · ruolo promesso: ${PROMISE[r.promise].toLowerCase()} (capitano ${r.capN||0} su ${r.myRaces||0} corse)`:''}${r.listed?` · sul mercato a ${eurk(r.listed)}`:''}</div>
   <div class="row">${negMode(r)==='renew'?`<button class="btn primary" data-act="neg" data-v="${r.id}">Rinnova</button>`:''}<button class="btn" data-act="sell" data-v="${r.id}">${r.listed?'Prezzo di vendita':'Metti sul mercato'}</button><button class="btn ghost" data-act="release" data-v="${r.id}">Svincola</button></div></div>${roleBlock(r)}${focusBlock(r)}`:''}
  <div><div class="eyebrow" style="margin-bottom:4px">Risultati ${SEASON}</div>${res?`<div class="card tbl"><table class="t">${res}</table></div>`:'<div class="note">Nessuna corsa disputata.</div>'}</div>
 </div></div></div>`,'wide');
}

/* ---------- strutture: altura e scuola juniores ---------- */
let CAMPSEL=null;
function renderBase(){
 const A=G.academy,js=acadJuniors().sort((a,b)=>b.age-a.age||b.pot-a.pot);
 const camps=G.camps.slice().sort((a,b)=>b.from-a.from);
 const w=win();
 $('#view').innerHTML=`<div class="basegrid">
 <div class="col"><div class="sec-h"><h2>Ritiri in altura</h2><span class="eyebrow">picco 1–3 settimane dopo</span></div>
  <div class="note">Due o tre settimane in quota alzano la soglia per qualche settimana dopo il rientro. Programmali prima degli obiettivi: in ritiro i corridori non corrono.</div>
  <div class="camps">${CAMPS.map(L=>{const ok=G.phase==='season'&&G.week+1<=L.to;return`<div class="card camp"><div class="cm"><b>${L.name}</b><span class="note">${L.place}</span></div><div class="ca"><span class="alt">${L.alt} m</span><span class="note">${eur(L.cost)} a corridore/settimana · ${weekLab(L.from)}–${weekLab(Math.min(L.to,52))}</span></div><button class="btn" data-act="campbook" data-v="${L.id}" ${ok?'':'disabled'}>Prenota</button></div>`}).join('')}</div>
  ${camps.length?`<div class="card tbl"><table class="t">${camps.map(c=>{const L=CAMPS.find(x=>x.id===c.loc);return`<tr><td>${esc(L.name)} <div class="tm">${c.riders.length} corridori · ${c.weeks} settimane</div></td><td>${weekLab(c.from)}–${weekLab(c.to)}</td><td class="r">${c.done?'Concluso':c.from<=G.week?'In corso':`<button class="chip" data-act="campcancel" data-v="${c.id}">Annulla</button>`}</td></tr>`}).join('')}</table></div>`:''}
 </div>
 <div class="col"><div class="sec-h"><h2>Scuola juniores</h2><span class="eyebrow">${A.level?`livello ${A.level}/5`:'da costruire'}</span></div>
  <div class="card pad stack">
   <div class="levels">${[1,2,3,4,5].map(i=>`<i class="${i<=A.level?'on':''}"></i>`).join('')}</div>
   <div class="note">${A.level?`Posti ${js.length}/${acadCap()} · ${1+A.level} nuovi ragazzi a stagione · costo ${eur(academyCost())}/anno. Più alto il livello, più talento e più crescita.`:'Una scuola tua: ogni anno arrivano ragazzi di 16–17 anni da far crescere. A 18 anni puoi farli passare in squadra.'}</div>
   ${A.level<5?`<button class="btn primary" data-act="acadup" ${G.cash<ACAD_UP[A.level+1]?'disabled':''}>${A.level?'Migliora':'Costruisci'} · ${eur(ACAD_UP[A.level+1])}</button>`:''}
   <div class="field"><label class="eyebrow" for="afocus">Osservatori</label><select id="afocus" data-act="afocus">${Object.keys(ACAD_FOCUS).map(k=>`<option value="${k}" ${A.focus===k?'selected':''}>${ACAD_FOCUS_LAB[k]}</option>`).join('')}</select></div>
  </div>
  ${js.length?`<div class="cols1">${js.map(r=>{const g=r.joined?r.wkg-r.joined.wkg:0;const canPro=r.age>=18&&!r.next&&(w.next);return`<div class="card jrow"><div class="ovr ${ovr(r)>=70?'hi':''}">${ovr(r)}</div><div style="min-width:0"><div class="nm">${esc(r.name)}</div><div class="tags"><span>${ARCH[r.arch].lab} · ${r.age} anni · ${r.nat}</span><span style="color:var(--amber)">${'★'.repeat(1+Math.round(r.pot*4))}</span>${g>0.005?`<span class="chip u23">+${g.toFixed(2)} W/kg</span>`:''}${r.next?'<span class="chip u23">Promosso</span>':''}</div></div>
    <div class="row">${canPro?`<button class="btn primary sm" data-act="promote" data-v="${r.id}">Promuovi</button>`:''}<button class="btn ghost sm" data-act="rider" data-v="${r.id}">Scheda</button></div></div>`}).join('')}</div>`:''}
  ${A.log.length?`<div class="card pad"><div class="eyebrow">Risultati juniores</div>${A.log.slice(0,5).map(l=>`<div class="note">${l.s} · ${esc(l.t)}</div>`).join('')}</div>`:''}
  <div class="note">I ragazzi di 18 anni si promuovono dal 1° agosto: passano in squadra la stagione dopo come Under 23 al primo anno. Chi non viene promosso lascia la scuola.</div>
 </div></div>`;
}
function campSheet(){
 const L=CAMPS.find(x=>x.id===CAMPSEL.loc);
 const mine=ME().riders.map(RID).sort((a,b)=>ovr(b)-ovr(a));
 const from=CAMPSEL.from,to=from+CAMPSEL.weeks-1;
 const cost=campCost(L.id,CAMPSEL.weeks,CAMPSEL.ids.size);
 openSheet(sheetHead(`Ritiro in altura · ${L.alt} m`,esc(L.name),L.place)+`<div class="pb wrap"><div class="negbox"><div class="stack">
  <div><div class="eyebrow">Partenza</div><div class="stepper"><button data-act="campstep" data-v="-1" aria-label="Prima">−</button><output>${weekLab(from)} (sett. ${from})</output><button data-act="campstep" data-v="1" aria-label="Dopo">+</button></div></div>
  <div><div class="eyebrow">Durata</div><div class="seg">${[2,3].map(n=>`<button data-act="campweeks" data-v="${n}" aria-pressed="${CAMPSEL.weeks===n}">${n} settimane</button>`).join('')}</div></div>
  <div class="note">Rientro il ${weekLab(to+1)}: il picco arriva tra ${weekLab(to+2)} e ${weekLab(to+4)}. Tre settimane danno un effetto più forte.</div>
  <div class="card pad"><div class="big2">${eur(cost)}</div><div class="note">${CAMPSEL.ids.size} corridori × ${CAMPSEL.weeks} settimane × ${eur(L.cost)}</div></div>
 </div><div class="card">${mine.map(r=>{const conflict=inCamp(r,from,to)?'Già in ritiro':(r.bT>=from&&r.bF<=to)?'Ha una corsa':'';
  return`<label class="pick ${conflict?'off':''}"><input type="checkbox" data-act="camppick" data-v="${r.id}" ${CAMPSEL.ids.has(r.id)?'checked':''} ${conflict?'disabled':''}><div style="min-width:0"><div class="nm">${esc(r.name)}</div><div class="sm"><span>${ARCH[r.arch].lab}</span><span>${catOf(r)}</span>${conflict?`<span>· ${conflict}</span>`:''}</div></div><span class="mono">${ovr(r)}</span></label>`}).join('')}</div></div></div>
 <div class="pf"><div class="wrap fr"><span class="note">Max 8 corridori</span><button class="btn ghost" data-act="close">Annulla</button><button class="btn primary" data-act="campok" ${!CAMPSEL.ids.size||G.cash<cost?'disabled':''}>Prenota</button></div></div>`,'wide');
}
function promoteSheet(id){
 const r=RID(id),c=myCat();
 const sal=Math.max(c.neoSal,Math.round((8000+r.pot*14000)/500)*500);
 openSheet(sheetHead('Scuola juniores',`Promuovere ${esc(r.name)}?`,`Firma un contratto da Under 23 al primo anno: arriva in squadra nel ${SEASON+1}.`)+`<div class="pb wrap stack"><div class="kv"><div><small>Valore</small><b>${ovr(r)}</b></div><div><small>Potenziale</small><b style="color:var(--amber)">${'★'.repeat(1+Math.round(r.pot*4))}</b></div><div><small>Ingaggio</small><b>${eurk(sal)}</b></div></div>
 <div class="note">Contratto di 3 anni fino al ${SEASON+3}. Il ragazzo è cresciuto da te: accetta senza trattativa.</div></div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="jrrelease" data-v="${r.id}">Lascialo andare</button><button class="btn primary" data-act="promoteok" data-v="${r.id}" data-s="${sal}" ${nextRoster()>=c.max?'disabled':''}>Firma</button></div></div>`);
}

/* ---------- mercato ---------- */
function mkRow(r,mode){
 const o=ovr(r),s=stats(r);
 const key=[['SAL',s.sal],['VOL',s.vol],['CRO',s.cro],['PIA',s.pia]].sort((a,b)=>b[1]-a[1])[0];
 const pot=r.age<=22?' · '+'★'.repeat(1+Math.round(r.pot*4)):'';
 let pr='',sm='';
 const m=negMode(r),py=r.age<=24?3:r.age>=31?1:2;
 if(mode==='inc'){pr=eurk(r.next.sal);sm=`fino al ${r.next.cEnd}`}
 else if(r.team==='t0'){pr=r.leavingTo?'—':r.renewed?eurk(r.nextSal):'~'+eurk(askSal(r,'renew',py));sm=r.leavingTo?'firmato altrove':r.renewed?`fino al ${r.cEnd}`:'richiesta'}
 else if(m==='buy'){pr='~'+eurk(feeAsk(r));sm='indennizzo'}
 else if(m==='pre'){pr='~'+eurk(askSal(r,'pre',py));sm=r.junior?'ingaggio':'parametro zero'}
 else if(m==='sign'){pr='~'+eurk(askSal(r,'sign',py));sm='ingaggio'}
 else{pr='—';sm=whyNot(r)}
 const team=r.team==='t0'?'':r.team==='fa'?'Svincolato':r.team==='jr'?'Juniores':`${esc(TEAM(r.team).short)} · fino al ${r.cEnd}`;
 return`<button class="card mrow" data-act="neg" data-v="${r.id}"><div class="ovr ${o>=75?'hi':''}">${o}</div>
  <div style="min-width:0"><div class="nm">${esc(r.name)}</div><div class="tags"><span class="chip ${r.age<=22||r.junior?'u23':''}">${r.junior?'Juniores':catOf(r)}</span><span>${ARCH[r.arch].lab} · ${r.age} anni · ${key[0]} ${key[1]}${pot}</span>${team?`<span>· ${team}</span>`:''}</div></div>
  <div class="pr">${pr}<small>${esc(sm)}</small></div></button>`;
}
function expiringAlert(){
 const ex=ME().riders.map(RID).filter(r=>r.cEnd===SEASON&&!r.renewed&&!r.leavingTo);
 if(!ex.length)return'';
 return`<button class="banner closed" data-act="tab" data-v="market"><span class="chip red">${ex.length}</span><span>Contratti in scadenza nel ${SEASON}: ${ex.slice(0,3).map(r=>esc(r.name)).join(', ')}${ex.length>3?'…':''}.</span></button>`;
}
function renderMarket(){
 const w=win(),mk=G.mk;
 const proj=projected(),all=Object.values(G.riders);
 const filt=r=>(mk.cat==='all'||(mk.cat==='u23'?(r.age<=22||r.junior):(r.age>22&&!r.junior)))&&(mk.role==='all'||r.arch===mk.role);
 let list;
 if(mk.sub==='bids')list=[];
 else if(mk.sub==='renew')list=ME().riders.map(RID).filter(r=>r.cEnd===SEASON);
 else if(mk.sub==='fa')list=all.filter(r=>r.team==='fa'&&!r.next);
 else if(mk.sub==='jr')list=all.filter(r=>r.team==='jr'&&!r.next);
 else list=all.filter(r=>G.teams.some(t=>t.id===r.team&&t.tier!=='me')&&!r.next);
 list=list.filter(filt).sort((a,b)=>mk.sub==='jr'?(b.pot-a.pot)||(ovr(b)-ovr(a)):(ovr(b)-ovr(a)));
 const total=list.length;list=list.slice(0,40);
 const news=G.news.filter(n=>n.s===SEASON).slice(0,4);
 const nb=(G.bids||[]).length;
 const subs=[['bids',`Offerte ricevute${nb?' ('+nb+')':''}`],['renew','Rinnovi'],['fa','Svincolati'],['others','Altre squadre'],['jr','Juniores']];
 const roles=[['all','Tutti i ruoli']].concat(Object.keys(ARCH).map(k=>[k,ARCH[k].lab]));
 const hint={renew:`Contratti in scadenza nel ${SEASON}. Se non li rinnovi, a fine stagione se ne vanno; dal 1° agosto le altre squadre possono prenderli.`,
  fa:'Senza squadra: si firmano subito, senza indennizzo, a finestra aperta.',
  others:`Acquisto con indennizzo da squadre di categoria pari o inferiore (a finestra aperta). Chi ha il contratto in scadenza si firma a parametro zero dal 1° agosto.${myCat().minSal?` Ingaggio minimo ${myCat().lab}: ${eur(myCat().minSal)} (${eur(myCat().neoSal)} per gli Under 23).`:''}`,
  bids:'Offerte delle altre squadre per i tuoi corridori. Puoi accettare, rifiutare o chiedere di più. Se rifiuti il salto in una squadra più grande, il corridore si scontenta.',
  jr:`Diciottenni di altre società: si firmano dal 1° agosto e arrivano nel ${SEASON+1} come Under 23 al primo anno.`}[mk.sub];
 $('#view').innerHTML=`<div class="sec">
  <div class="kv kv4"><div><small>Cassa</small><b>${eurk(G.cash)}</b></div><div><small>Saldo a fine stagione</small><b class="${proj<0?'neg':''}">${eurk(proj)}</b></div><div><small>Monte ingaggi</small><b>${eurk(payroll())}</b></div><div><small>Rosa ${w.off?SEASON+1:SEASON}</small><b>${w.off?nextRoster():myRoster()}/${myCat().max}</b></div></div>
  <div class="banner ${w.now||w.next?'':'closed'}"><span class="chip ${w.now||w.next?'u23':''}">${w.now||w.next?'Aperto':'Chiuso'}</span><span>${w.label}</span></div>
  ${expiringAlert()}
  ${news.length?`<div class="card pad"><div class="eyebrow">Notizie di mercato</div>${news.map(n=>`<div class="note">• ${esc(n.t)}</div>`).join('')}</div>`:''}
 </div>
 <div class="sec">
  <div class="seg">${subs.map(([k,l])=>`<button data-act="mksub" data-v="${k}" aria-pressed="${mk.sub===k}">${l}</button>`).join('')}</div>
  <div class="filters"><select id="mkcat" data-act="mkf" data-k="cat" aria-label="Categoria">${[['all','Tutte le categorie'],['u23','Under 23'],['elite','Elite']].map(([k,l])=>`<option value="${k}" ${mk.cat===k?'selected':''}>${l}</option>`).join('')}</select>
   <select id="mkrole" data-act="mkf" data-k="role" aria-label="Ruolo">${roles.map(([k,l])=>`<option value="${k}" ${mk.role===k?'selected':''}>${l}</option>`).join('')}</select>
   <span class="note">${total} corridori${total>40?' · primi 40 per valore':''}</span></div>
  <div class="note">${hint}</div>
  ${mk.sub==='bids'?`<div class="cols1">${bidsList()}</div>`:`<div class="cols">${list.map(r=>mkRow(r)).join('')||'<div class="note">Nessun corridore.</div>'}</div>`}
 </div>`;
}
function releaseSheet(id){
 const r=RID(id),c=releaseCost(r),ok=myRoster()>myCat().min;
 openSheet(sheetHead('Svincolo',`Liberare ${esc(r.name)}?`,`Paghi metà dell'ingaggio che resta su questa stagione: ${eur(c)}. Da quel momento non pesa più sul monte ingaggi.`)+(ok?'':`<div class="pb wrap"><div class="msg no">Una ${myCat().lab} deve avere almeno ${myCat().min} corridori.</div></div>`)+
 `<div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Annulla</button><button class="btn primary" data-act="releaseok" data-v="${r.id}" ${ok?'':'disabled'}>Svincola</button></div></div>`);
}

/* ---------- classifiche ---------- */
function renderRank(){
 const f=G.rankf||'mine';
 const tier=f==='mine'?G.cat:f==='all'?null:f;
 const tr=teamRanking(tier);
 const riders=Object.values(G.riders).filter(r=>r.pts>0&&G.teams.some(t=>t.id===r.team)).sort((a,b)=>b.pts-a.pts).slice(0,30);
 const u23=riders.length?Object.values(G.riders).filter(r=>r.pts>0&&r.age<=22&&G.teams.some(t=>t.id===r.team)).sort((a,b)=>b.pts-a.pts).slice(0,10):[];
 const row=(r,i)=>`<tr class="${r.team==='t0'?'me':''}"><td class="n">${i+1}</td><td>${esc(r.name)} <div class="tm">${esc(TEAM(r.team).name)} · ${catOf(r)}</div></td><td class="r">${r.wins?r.wins+'V · ':''}${r.pts}</td></tr>`;
 const lab=t=>({wt:'WorldTeam',pro:'ProTeam',conti:'Continental',dev:'Development U23'})[tierOfTeam(t)];
 $('#view').innerHTML=`<div class="toolbar"><div class="chips">${[['mine','La mia categoria'],['wt','WorldTeam'],['pro','ProTeam'],['conti','Continental'],['all','Tutte']].map(([k,l])=>`<button class="fchip" data-act="rankf" data-v="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div></div>
 <div class="basegrid"><div class="col"><div class="sec-h"><h2>Squadre</h2><span class="eyebrow">punti UCI ${SEASON}</span></div>
  <div class="card tbl"><table class="t">${tr.map((o,i)=>`<tr class="${o.t.id==='t0'?'me':''}"><td class="n">${i+1}</td><td>${esc(o.t.name)} <div class="tm">${lab(o.t)}</div></td><td class="r">${o.p}</td></tr>`).join('')}</table></div></div>
 <div class="col"><div class="sec-h"><h2>Corridori</h2><span class="eyebrow">top 30</span></div>${riders.length?`<div class="card tbl"><table class="t">${riders.map(row).join('')}</table></div>`:'<div class="note">La classifica si riempie con le prime corse.</div>'}
  ${u23.length?`<div class="sec-h" style="margin-top:14px"><h2>Under 23</h2></div><div class="card tbl"><table class="t">${u23.map(row).join('')}</table></div>`:''}
  ${G.history.length?`<div class="sec-h" style="margin-top:14px"><h2>Albo della squadra</h2></div><div class="card tbl"><table class="t">${G.history.slice().reverse().map(h=>`<tr><td class="n">${h.season}</td><td>${CAT[h.cat].lab} · ${h.rank}ª · ${h.wins} vittorie</td><td class="r">${h.pts} pt</td></tr>`).join('')}</table></div>`:''}
 </div></div>`;
}

/* ---------- convocazioni ---------- */
let SEL=null;
function openConvoca(id){
 const race=G.races.find(r=>r.id===id);
 SEL={race,ids:new Set(),cap:null};suggest();renderConvoca();
}
function selSize(race){return race.tier==='nc'?8:TIERS[race.tier].size}
function suggest(){
 const race=SEL.race;
 const el=ME().riders.map(RID).filter(r=>!whyCant(r,race));
 autoRoles();
 const sc=el.map(r=>({r,s:avgSuit(r,race)-r.fat*0.45-(r.days>65?12:0)+altEff(r,race.w)*300+roleBonus(r,race)})).sort((a,b)=>b.s-a.s);
 const pickd=sc.slice(0,selSize(race)).map(o=>o.r);
 SEL.ids=new Set(pickd.map(r=>r.id));
 const sp=raceSpec(race),capC=pickd.filter(r=>r.role==='cap'&&r.spec===sp).sort((a,b)=>avgSuit(b,race)-avgSuit(a,race))[0]||pickd.filter(r=>r.role==='cap').sort((a,b)=>avgSuit(b,race)-avgSuit(a,race))[0]||pickd.slice().sort((a,b)=>avgSuit(b,race)-avgSuit(a,race))[0];
 SEL.cap=capC?capC.id:null;
}
function renderConvoca(){
 const race=SEL.race,size=selSize(race),min=minRiders(race);
 const rs=ME().riders.map(RID).sort((a,b)=>avgSuit(b,race)-avgSuit(a,race));
 const n=SEL.ids.size,ok=n>=min&&n<=size&&SEL.cap;
 const pro=race.stages[0].t==='prologo';
 openSheet(sheetHead(`Convocazioni · ${race.lab} · ${weekLab(race.w)}`,esc(race.name),`${race.stages.map((s,i)=>(race.stages.length>1?(s.t==='prologo'?'P':i+(pro?0:1))+'. ':'')+TYPE_LAB[s.t]).join(' · ')}`)+
 `<div class="pb"><div class="wrap"><div class="card pickgrid">${rs.map(r=>{
   const why=whyCant(r,race),on=SEL.ids.has(r.id),c=condOf(r),fit=Math.round(avgSuit(r,race)),ae=altEff(r,race.w);
   return`<div class="pick ${why?'off':''}"><input type="checkbox" id="p_${r.id}" data-act="pick" data-v="${r.id}" ${on?'checked':''} ${why?'disabled':''} aria-label="Convoca ${esc(r.name)}">
    <label for="p_${r.id}" style="min-width:0"><div class="nm">${esc(r.name)} <span class="chip ${r.age<=22?'u23':''}">${catOf(r)}</span>${r.role?`<span class="chip ${r.role==='cap'?'amber':''}">${ROLES[r.role].lab}${(r.role==='cap'||r.role==='luog')&&r.spec?' · '+SPEC[r.spec]:''}</span>`:''}</div>
     <div class="sm"><span>${ARCH[r.arch].lab}</span><span class="cond" style="--c:${c.c}">${c.t}</span>${ae>0?`<span class="chip amber">altura +${(ae*100).toFixed(1)}%</span>`:''}<span>fatica ${Math.round(r.fat)}${recDays(r)?` · recupero ${recDays(r)} gg`:''}</span><span${r.days>65?' style="color:var(--danger)"':''}>${r.days} gg</span>${why?`<span>· ${why}</span>`:''}</div>
     <div class="sm"><span>Adatto</span><div class="bar fit"><i style="width:${fit}%"></i></div><span class="mono">${fit}</span></div></label>
    <button class="star" data-act="cap" data-v="${r.id}" aria-pressed="${SEL.cap===r.id}" ${!on?'disabled':''} title="Capitano">C</button></div>`}).join('')}</div>
  <div class="note" style="margin-top:8px">C = capitano: la squadra lavora per lui. La proposta del DS segue i ruoli: per questa corsa (${SPEC[raceSpec(race)].toLowerCase()}) propone il capitano con quella specialità.</div></div></div>
 <div class="pf"><div class="wrap fr"><b class="cnt ${!ok?'neg':''}">${n}/${size}</b><button class="btn ghost" data-act="suggest">Proposta DS</button>${n<min?`<button class="btn ghost" data-act="forfeit">Non partire</button>`:''}<span style="flex:1"></span>
  <button class="btn" data-act="go" data-v="sim" ${ok?'':'disabled'}>Simula</button><button class="btn primary" data-act="go" data-v="live" ${ok?'':'disabled'}>In corsa</button></div></div>`,'wide');
}

/* ---------- gara ---------- */
let LIVE=null;
function launch(mode){
 const race=SEL.race;race.sel=[...SEL.ids];race.cap=SEL.cap;closeSheet();
 if(indivOk(race)&&race.sel.length<selSize(race)&&race.tier!=='nc'){const T=TIERS[race.tier],ref=Math.round(T.prd*(selSize(race)-race.sel.length)*race.stages.length*(race.ctry==='ITA'?1:1.2));if(ref>0){G.cash+=ref;toast(`Partecipazione con ${race.sel.length} corridor${race.sel.length>1?'i':'e'}: rimborsati ${eurk(ref)} di trasferta`,'ok')}}
 const RC=newRC(race);LIVE=null;
 openTactic(RC,mode);
}
function simAsync(RC){
 const n=RC.race.stages.length;busyOn(`Simulazione: ${RC.race.name}`);
 const step=()=>{
  if(RC.stage>=n){busyOff();if(RC.jr){jrFinish(RC);render();jrFinalSheet(RC);return}if(RC.nat){natFinish(RC);render();natFinalSheet(RC);return}finishMyRace(RC);render();showFinal(RC);return}
  $('#busytxt').textContent=n>1?`${RC.race.name} · tappa ${RC.stage+1} di ${n}`:RC.race.name;
  setTimeout(()=>{const ctx=stageCtx(RC);
   if(!ROAD(ctx.course.type))finishStage(RC,simTT(ctx),null,ctx.course);
   else{const S=createSim(ctx);while(!S.done)tick(S);finishStage(RC,stageResults(S),S,ctx.course)}
   step()},30);
 };step();
}
function startStageLive(){
 const RC=LIVE.RC,ctx=stageCtx(RC);LIVE.course=ctx.course;
 $('#race').hidden=false;document.body.style.overflow='hidden';
 if(!ROAD(ctx.course.type)){LIVE.S=null;LIVE.ctx=ctx;renderTTIntro();return}
 LIVE.S=createSim(ctx);LIVE.playing=true;renderRaceSkeleton();
 LIVE.last=performance.now();requestAnimationFrame(loop);
}
function stageTitle(){const RC=LIVE.RC,r=RC.race,st=r.stages[RC.stage],pro=r.stages[0].t==='prologo';return RC.stageRace?(st.t==='prologo'?'Prologo':`Tappa ${RC.stage+(pro?0:1)} di ${r.stages.length-(pro?1:0)}`):'Corsa di un giorno'}
function renderTTIntro(){
 const c=LIVE.course;
 $('#race').innerHTML=`<div class="race-grid"><section class="rcol rl"><div class="race-h"><div class="wrap"><div class="eyebrow">${esc(LIVE.RC.race.name)} · ${stageTitle()}</div>
  <div class="rh1"><h2>${TYPE_LAB[c.type]} individuale · ${km1(c.len)} km</h2></div><div class="prof"><canvas id="pc"></canvas></div></div></div></section>
  <section class="rcol rr"><div class="wrap rbody"><div class="note">Nella cronometro ognuno parte da solo: niente scia, contano soglia e aerodinamica (CRO). Gli ordini radio non servono.</div><button class="btn primary big" data-act="tt">Via alla cronometro</button></div></section></div>`;
 drawProfile();
}
function renderRaceSkeleton(){
 const c=LIVE.course,RC=LIVE.RC;
 $('#race').innerHTML=`<div class="race-grid"><section class="rcol rl"><div class="race-h"><div class="wrap">
  <div class="eyebrow">${esc(RC.race.name)} · ${stageTitle()} · ${TYPE_LAB[c.type]}${c.shortened?' · accorciata per maltempo':''} ${wxChip(LIVE.S&&LIVE.S.wx)}</div>
  <div class="kmbig"><div class="k" id="k2g">0<small>km all'arrivo</small></div>
   <div class="o"><div>Tempo<b id="rt">0'00"</b></div><div>Media<b id="ravg">—</b></div><div>Pendenza<b id="rgr">0%</b></div></div></div>
  <div class="nextp" id="nextp"></div>
  <div class="prof"><canvas id="pc"></canvas><button class="chip zoom" data-act="zoom" id="zbtn">Zoom</button></div>
 </div></div>
 <div class="wrap rbody">
  <div><div class="eyebrow">Situazione corsa</div><div class="card groups" id="grps"></div></div>
  <div><div class="eyebrow">Radio corsa</div><div class="card radio" id="radio"></div></div>
 </div></section>
 <section class="rcol rr"><div class="wrap rbody"><div><div class="eyebrow">Consigli dell'ammiraglia</div><div class="tips" id="tips"></div></div><div><div class="eyebrow">I tuoi corridori · ordini radio</div><div class="card" id="mine"></div></div></div></section></div>
 <div class="ctrl"><div class="wrap">
  <button class="btn play" data-act="play" id="playb" aria-label="Pausa">❚❚</button>
  <div class="sp" id="spd">${[[25,'1×'],[75,'3×'],[250,'10×']].map(([v,l])=>`<button data-act="speed" data-v="${v}" aria-pressed="${LIVE.speed===v}">${l}</button>`).join('')}</div>
  <span style="flex:1"></span><button class="btn ghost" data-act="guide" aria-label="Guida tattica">?</button><button class="btn ghost" data-act="jump">Finale</button><button class="btn ghost" data-act="end">Fine</button>
 </div></div>`;
 renderMine(true);updateRaceUI();
}
function loop(now){
 if(!LIVE||!LIVE.S)return;
 const S=LIVE.S,el=Math.min(0.1,(now-LIVE.last)/1000);LIVE.last=now;
 if(LIVE.playing&&!S.done){LIVE.acc+=el*LIVE.speed;let n=0;while(LIVE.acc>=1&&!S.done&&n<400){tick(S);LIVE.acc-=1;n++}}
 drawProfile();
 if(now-LIVE.lastUI>300){LIVE.lastUI=now;updateRaceUI()}
 if(S.done){updateRaceUI();endStageLive();return}
 requestAnimationFrame(loop);
}
function groupsDisplay(S){
 const out=[];
 for(const cl of S.clusters){const g=gapSec(S,cl.front),last=out[out.length-1];
  if(last&&g-last.gEnd<5){last.rs.push(...cl.rs);last.gEnd=g;if(cl===S.main)last.main=true}
  else out.push({rs:cl.rs.slice(),g,gEnd:g,main:cl===S.main,front:cl.front})}
 const mi=out.findIndex(o=>o.main);
 out.forEach((o,i)=>{
  if(o.main)o.name='Gruppo';
  else if(i<mi)o.name=i===0?(S.breakFormed?'Fuga':'Testa'):(o.rs.length<=2&&i===mi-1?'Inseguitori':'Contrattacco');
  else o.name=(o.rs.length>=8&&i===out.length-1)?'Gruppetto':'Staccati';
  if(i===0&&o.rs.length===1&&!o.main)o.name='In testa';
 });
 return out;
}
function updateRaceUI(){
 const S=LIVE.S;if(!S)return;
 const lead=S.clusters.length?S.clusters[0].front:S.len,k2g=Math.max(0,S.len-lead);
 $('#k2g').innerHTML=`${km1(k2g)}<small>km all'arrivo</small>`;
 $('#rt').textContent=fmtT(S.t);
 $('#ravg').textContent=S.t>60?(lead/(S.t/3600)).toFixed(1).replace('.',',')+' km/h':'—';
 const i=gi(S,lead),gr=S.course.g[i];$('#rgr').textContent=(gr>0?'+':'')+gr.toFixed(1).replace('.',',')+'%'+(S.course.surf[i]===1?' · pavé':S.course.surf[i]===2?' · sterrato':'');
 const gd=S.clusters.length?groupsDisplay(S):[];
 $('#grps').innerHTML=gd.slice(0,7).map(o=>{
  const mine=o.rs.filter(x=>x.isMe);
  const notable=o.rs.length<=6&&!o.main?o.rs.map(x=>`${rname(x)} <span class="muted">${tshort(x)}</span>`).join(', '):'';
  return`<div class="grp"><span class="dot" style="background:${mine.length?'var(--accent)':o.main?'var(--muted)':'var(--amber)'}"></span>
   <div style="min-width:0"><div class="gn">${o.name} <span class="gc">${o.rs.length} corridor${o.rs.length===1?'e':'i'}</span></div>${notable?`<div class="gc">${notable}</div>`:''}</div>
   <div class="gg">${o===gd[0]?'—':fmtGap(o.g)}</div>${mine.length?`<div class="mine">${mine.map(x=>`<span class="chip u23">${esc(rname(x))}</span>`).join('')}</div>`:''}</div>`}).join('')+(gd.length>7?`<div class="grp"><span></span><div class="gc">+ altri ${gd.length-7} gruppetti</div><span></span></div>`:'')+(S.finish.length?`<div class="grp"><span class="dot" style="background:var(--ok)"></span><div class="gn">Arrivati <span class="gc">${S.finish.length}</span></div><span></span></div>`:'');
 renderMine(false);
 let np=nextPoint(S,lead);
 if(S.ptsLines.length){const j=S.ptsLines.findIndex(k=>k>lead);const top=Object.entries(S.prPts).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([id,p])=>`${rname(S.byId[id])} ${p}`).join(', ');np=(j>=0?`Traguardo a punti ${j+1}/${S.ptsLines.length} tra ${km1(S.ptsLines[j]-lead)} km`:'Ultimo giro: volata finale a punti doppi')+(top?` · Punti: ${top}`:'')}
 if(S.allow&&S.clusters.length>1){np+=` · Tempo massimo ≈ +${Math.round(S.allow/60)}'`;const late=(S.byTeam.t0||[]).filter(x=>!x.finished&&gapSec(S,x.pos)>S.allow*0.7);if(late.length)np+=` · ${late.map(rname).join(', ')} a rischio!`}
 $('#nextp').textContent=np;
 $('#tips').innerHTML=dsTips(S).map(t=>`<div class="tip ${t.k}">${esc(t.t)}</div>`).join('');
 $('#radio').innerHTML=S.log.slice(-8).reverse().map(l=>`<div><span class="km">${km1(l.km)}</span><span class="${l.me?'me':''}">${esc(l.txt)}</span></div>`).join('')||'<div><span class="km">—</span><span class="muted">Partenza. Il gruppo è compatto.</span></div>';
}
const ORD=[['auto','Piano'],['ruota','Ruota'],['copri','Copri'],['tira','Tira'],['scatta','Scatta'],['scorta','Scorta']];
function renderMine(full){
 const S=LIVE.S;if(!S)return;
 const mine=S.riders.filter(x=>x.isMe),box=$('#mine'),myPlan=mine.length?S.plans[mine[0].team]:null,capId=myPlan&&myPlan.lead&&myPlan.lead.id;
 if(full||box.children.length!==mine.length){
  box.innerHTML=mine.map(x=>`<div class="mr" id="m_${x.id}"><div class="l1"><span class="nm">${esc(x.r.name)}</span>${x.id===capId?'<span class="chip amber">Capitano</span>':''}<span class="where" id="w_${x.id}"></span></div>
   <div class="bars"><div><span>Energia</span><div class="bar e"><i id="be_${x.id}"></i></div></div><div><span>Riserva scatti</span><div class="bar w"><i id="bw_${x.id}"></i></div></div><div class="mono pwv" id="pw_${x.id}"></div></div>
   <div class="orders">${ORD.map(([k,l])=>`<button data-act="order" data-id="${x.id}" data-v="${k}" class="${k==='scatta'?'atk':''}">${l}</button>`).join('')}</div></div>`).join('');
 }
 const gd=S.clusters.length?groupsDisplay(S):[];
 for(const x of mine){
  const w=$('#w_'+x.id);if(!w)continue;
  let where;
  if(x.dnf)where='Ritirato dopo una caduta';
  else if(x.finished)where=`Arrivato ${ord(S.finish.indexOf(x)+1)}`;
  else if(x.stop>0)where='Foratura!';
  else{const g=gd.find(o=>o.rs.includes(x));where=g?`${g.name}${g===gd[0]?'':' '+fmtGap(g.g)}`:''}
  const it=x.dnf?'ritirato':{attack:'scatto',follow:'risponde a uno scatto',pull:'in testa',ease:'si rialza',sprint:'volata'}[x.intent];
  w.textContent=where+(it&&!x.finished?' · '+it:'');
  $('#be_'+x.id).style.width=x.E+'%';$('#bw_'+x.id).style.width=(x.W/x.Wmax*100)+'%';
  $('#pw_'+x.id).textContent=x.finished?'':Math.round(x.P)+' W';
  document.querySelectorAll(`#m_${x.id} .orders button`).forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.v===x.order));b.disabled=x.finished||(b.dataset.v==='scorta'&&x.id===capId)});
 }
}
function cssVar(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function drawProfile(){
 const cv=$('#pc');if(!cv||!LIVE)return;
 const c=LIVE.course,S=LIVE.S;
 const dpr=window.devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;
 if(!W||!H)return;
 if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
 const lead=S&&S.clusters.length?S.clusters[0].front:0;
 let a=0,b=c.len;
 if(LIVE.zoom&&S){a=Math.max(0,lead-22);b=Math.min(c.len,a+32);a=Math.max(0,b-32)}
 const ia=Math.floor(a*10),ib=Math.min(c.N,Math.ceil(b*10));
 let mn=Infinity,mx=-Infinity;for(let i=ia;i<=ib;i++){mn=Math.min(mn,c.alt[i]);mx=Math.max(mx,c.alt[i])}
 if(mx-mn<120)mx=mn+120;
 const top=26,bot=H-18,X=km=>(km-a)/(b-a)*W,Y=al=>bot-(al-mn)/(mx-mn)*(bot-top);
 const col={t:cssVar('--terrain'),e:cssVar('--terrain-edge'),ink:cssVar('--ink'),mu:cssVar('--muted'),ac:cssVar('--accent'),am:cssVar('--amber'),k:cssVar('--kom'),bg:cssVar('--bg'),pv:cssVar('--pave'),gr:cssVar('--gravel')};
 const step=Math.max(1,Math.floor((ib-ia)/W));
 g.beginPath();g.moveTo(X(a),bot);for(let i=ia;i<=ib;i+=step)g.lineTo(X(i/10),Y(c.alt[i]));g.lineTo(X(ib/10),Y(c.alt[ib]));g.lineTo(X(b),bot);g.closePath();g.fillStyle=col.t;g.fill();
 g.strokeStyle=col.e;g.lineWidth=1.5;g.beginPath();for(let i=ia;i<=ib;i+=step){const xx=X(i/10),yy=Y(c.alt[i]);i===ia?g.moveTo(xx,yy):g.lineTo(xx,yy)}g.stroke();
 for(let i=Math.max(1,ia);i<ib;i++)if(c.surf[i]&&!c.surf[i-1]){let j=i;while(j<ib&&c.surf[j])j++;g.fillStyle=c.surf[i]===1?col.pv:col.gr;g.fillRect(X(i/10),bot-4,Math.max(2,X(j/10)-X(i/10)),4)}
 if(S&&lead>a){g.save();g.beginPath();g.rect(0,0,X(Math.min(lead,b)),H);g.clip();g.globalAlpha=0.16;g.fillStyle=col.ink;g.fillRect(0,top-4,W,bot-top+4);g.restore()}
 g.fillStyle=col.mu;g.font='11px "IBM Plex Mono", monospace';
 const tk=(b-a)>150?50:(b-a)>100?25:(b-a)>40?10:5;
 for(let k=Math.ceil(a/tk)*tk;k<=b;k+=tk){const xx=X(k);g.fillRect(xx,bot,1,4);if(xx>12&&xx<W-24)g.fillText(String(k),xx-6,H-3)}
 g.font='600 11px "Barlow Condensed", sans-serif';
 for(const cb of c.climbs){if(cb.top<a||cb.top>b)continue;const xx=X(cb.top),yy=Y(c.alt[Math.round(cb.top*10)]);
  g.fillStyle=col.k;g.beginPath();g.moveTo(xx,yy-3);g.lineTo(xx-4,yy-10);g.lineTo(xx+4,yy-10);g.closePath();g.fill();g.fillText(cb.cat,clamp(xx-3,0,W-14),yy-13)}
 if(c.sprintKm&&c.sprintKm>=a&&c.sprintKm<=b){const xx=X(c.sprintKm);g.fillStyle=col.ac;g.fillRect(xx-0.5,top-6,1.5,bot-top+6);g.fillText('TV',clamp(xx+3,0,W-14),top+4)}
 if(b>=c.len-0.01){const xx=W-1.5;g.fillStyle=col.ink;g.fillRect(xx-1,top-12,2,bot-top+12);g.fillText('ARRIVO',xx-38,top-4)}
 if(S&&S.clusters.length){const gd=groupsDisplay(S);
  for(let i=gd.length-1;i>=0;i--){const o=gd[i],p=o.rs[0].pos;if(p<a||p>b)continue;
   const xx=X(p),yy=Y(c.alt[Math.min(c.N,Math.round(p*10))]),mine=o.rs.some(x=>x.isMe),r=clamp(3+Math.sqrt(o.rs.length)*1.1,3.5,12);
   g.beginPath();g.arc(xx,yy-r-1,r,0,Math.PI*2);g.fillStyle=mine?col.ac:o.main?col.mu:col.am;g.fill();g.lineWidth=1.5;g.strokeStyle=col.bg;g.stroke()}}
}
function endStageLive(){const S=LIVE.S,RC=LIVE.RC;finishStage(RC,stageResults(S),S,LIVE.course);LIVE.S=null;showStageResult()}
function closeRace(){$('#race').hidden=true;$('#race').innerHTML='';document.body.style.overflow='';LIVE=null}
function showStageResult(){
 const RC=LIVE.RC,sr=RC.stages[RC.stages.length-1],last=RC.stage>=RC.race.stages.length,t0=sr.res[0].time;
 const rows=(list,timeOf,lim)=>{const top=list.slice(0,lim),mine=list.map((x,i)=>({x,i})).filter(o=>RID(o.x.id).team==='t0'&&o.i>=lim);
  const tr=(x,i)=>{const r=RID(x.id),t=timeOf(x);return`<tr class="${r.team==='t0'||(RC.nat&&r.team==='acad')?'me':''}"><td class="n">${i+1}</td><td>${esc(r.name)} <span class="tm">${esc(TEAM(x.team||r.team).short)}</span></td><td class="r">${x.pts!==undefined?x.pts+' pt':i===0?fmtT(t):fmtGap(t-timeOf(list[0]))}</td></tr>`};
  return top.map(tr).join('')+(mine.length?`<tr><td colspan="3" class="tm" style="text-align:center">…</td></tr>`+mine.map(o=>tr(o.x,o.i)).join(''):'')};
 let gcHtml='';
 if(RC.stageRace){const o=gcOrder(RC),tg=teamGcOrder(RC),myT=RC.nat?null:tg.findIndex(x=>x.k==='t0');
  gcHtml=`<div><div class="sec-h"><h3>Classifica generale</h3></div><div class="card tbl"><table class="t">${rows(o,x=>x.t,10)}</table></div><div class="jl">${jerLine(jerseys(RC))}</div>
  ${tg.length?`<div class="sec-h" style="margin-top:10px"><h3>Classifica a squadre</h3><span class="eyebrow">somma dei 3 migliori tempi</span></div><div class="card tbl"><table class="t">${tg.slice(0,5).map((x,i)=>`<tr class="${x.k==='t0'?'me':''}"><td class="n">${i+1}</td><td>${esc(TEAM(x.k).name)}</td><td class="r">${i===0?fmtT(x.t):fmtGap(x.t-tg[0].t)}</td></tr>`).join('')}${myT>=5?`<tr class="me"><td class="n">${myT+1}</td><td>${esc(G.name)}</td><td class="r">${fmtGap(tg[myT].t-tg[0].t)}</td></tr>`:''}</table></div>`:''}</div>`}
 const win=RID(sr.res[0].id);
 openSheet(sheetHead(`${esc(RC.race.name)} · ordine d'arrivo`,`Vince ${esc(win.name)}`,`${esc(TEAM(win.team).name)} · ${km1(sr.len)} km in ${fmtT(t0)} · media ${(sr.len/(t0/3600)).toFixed(1).replace('.',',')} km/h`,false)+
 `<div class="pb wrap"><div class="negbox"><div><div class="card tbl"><table class="t">${rows(sr.res,x=>x.time,15)}</table></div>${sr.wx||sr.dnf&&sr.dnf.length||sr.crashes?`<div class="note" style="margin-top:8px">${sr.wx?'Meteo: '+esc(wxText(sr.wx))+'. ':''}${sr.crashes?`${sr.crashes} cadut${sr.crashes>1?'e':'a'} di gruppo. `:''}${sr.dnf&&sr.dnf.length?`Ritirati: ${sr.dnf.length}${sr.dnf.some(id=>RID(id).team==='t0')?` (dei nostri: ${sr.dnf.filter(id=>RID(id).team==='t0').map(id=>esc(RID(id).name)).join(', ')})`:''}.`:''}</div>`:''}${sr.otl&&sr.otl.length?`<div class="msg no" style="margin-top:8px">Fuori tempo massimo (${sr.otl.length}): ${sr.otl.map(id=>esc(RID(id).name)+(RID(id).team==='t0'?' ★':'')).join(', ')}</div>`:''}${sr.rescued?`<div class="note" style="margin-top:8px">${sr.rescued} corridori oltre il tempo massimo, ripescati dalla giuria perché troppi.</div>`:''}</div>${gcHtml}</div></div>
 <div class="pf"><div class="wrap fr">${last?`<button class="btn primary" data-act="racedone">Bilancio della corsa</button>`:`<button class="btn" data-act="simrest">Simula il resto</button><button class="btn primary" data-act="nextstage">Tappa successiva</button>`}</div></div>`,'wide');
 if(win.team==='t0')toast(`Vittoria di ${win.name}!`,'gold');
}
function jerLine(j){
 const L=[];
 if(j.gc)L.push(`<span><i class="jer" style="background:var(--amber)"></i> Leader: ${esc(RID(j.gc).name)}</span>`);
 if(j.pts)L.push(`<span><i class="jer" style="background:var(--ok)"></i> Punti: ${esc(RID(j.pts).name)}</span>`);
 if(j.kom)L.push(`<span><i class="jer" style="background:var(--kom)"></i> Scalatori: ${esc(RID(j.kom).name)}</span>`);
 if(j.young)L.push(`<span><i class="jer" style="background:var(--surface);border:1px solid var(--line)"></i> Giovani: ${esc(RID(j.young).name)}</span>`);
 return L.join('');
}
function showFinal(RC){
 const race=RC.race,r=race.result;
 const top=r.top.map((x,i)=>`<tr class="${RID(x.id)&&RID(x.id).team==='t0'?'me':''}"><td class="n">${i+1}</td><td>${esc(x.name)} <span class="tm">${esc(x.team)}</span></td><td class="r">${i===0?fmtT(x.t):fmtGap(x.t-r.top[0].t)}</td></tr>`).join('');
 const mine=r.mine.map(m=>`<tr class="me"><td class="n">${m.pos>=999?'rit.':m.pos}</td><td>${esc(m.name)}<div class="tm">${m.km} km in fuga</div></td><td class="r">${m.pts?m.pts+' pt':''}</td></tr>`).join('');
 openSheet(sheetHead(`Bilancio · ${race.lab}`,esc(race.name),`${RC.stageRace?'Vincitore finale':'Vincitore'}: <b>${esc(r.winner)}</b> (${esc(r.winnerTeam)})`)+
 `<div class="pb wrap"><div class="kv kv4"><div><small>Punti</small><b>${r.myPts}</b></div><div><small>Premi</small><b>${eurk(r.prize)}</b></div><div><small>Sponsor</small><b class="${r.dS>=0?'pos':'neg'}">${r.dS>=0?'+':''}${r.dS}</b></div><div><small>Reputazione</small><b class="${r.dR>=0?'pos':'neg'}">${r.dR>=0?'+':''}${r.dR}</b></div></div>
  <div class="negbox" style="margin-top:12px"><div><div class="sec-h"><h3>La tua squadra</h3></div><div class="card tbl"><table class="t">${mine}</table></div></div>
  <div><div class="sec-h"><h3>${RC.stageRace?'Classifica finale':'Ordine d\'arrivo'}</h3></div><div class="card tbl"><table class="t">${top}</table></div>${r.jer?`<div class="jl">${jerLine(r.jer)}</div>`:''}${r.teamTop?`<div class="sec-h" style="margin-top:10px"><h3>Classifica a squadre</h3><span class="eyebrow">${r.teamRank?'la tua squadra: '+r.teamRank+'ª':''}</span></div><div class="card tbl"><table class="t">${r.teamTop.map((x,i)=>`<tr class="${x.me?'me':''}"><td class="n">${i+1}</td><td>${esc(x.name)}</td><td class="r">${i===0?fmtT(x.t):fmtGap(x.t-r.teamTop[0].t)}</td></tr>`).join('')}</table></div>`:''}</div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Continua</button></div></div>`,'wide');
 if(r.myWins)toast(`${r.myWins} vittori${r.myWins>1?'e':'a'}! +${eurk(r.prize)}`,'gold');
}


/* ---------- sponsor ---------- */
let SPN=null;
function spLogo(s,sz=40){const col=s.sector==='estero'?'#4B5563':SECTORS[s.sector].col;const ini=s.name.replace(/[^A-Za-zÀ-ÿ ]/g,' ').split(/\s+/).filter(w=>w.length>2&&!['di','del','della'].includes(w.toLowerCase())).slice(0,2).map(w=>w[0]).join('').toUpperCase();return`<span class="slogo" style="background:${col};width:${sz}px;height:${sz}px">${ini}</span>`}
function sectorLab(s){return s.sector==='estero'?'Estero':SECTORS[s.sector].lab}
function myContract(s){return G.contracts.find(c=>c.sid===s.id&&c.end>=SEASON)}
function spRow(s){
 const c=myContract(s),it=interest(s,'partner'),off=G.offers.find(o=>o.sid===s.id);
 let right;
 if(c)right=`<span class="pill reg">${SLOTS[c.slot].lab}</span>`;
 else if(off)right=`<span class="pill inv">Proposta</span>`;
 else if(it.p<=0)right=`<span class="lockt">${ic('lock',13)} rep. ${s.req}</span>`;
 else right=`<div class="pr">fino a ${eurk(amountFor(s,'main'))}<div class="bar ib"><i style="width:${Math.round(it.p*100)}%"></i></div><small>propensione ${Math.round(it.p*100)}%</small></div>`;
 return`<button class="card srow" data-act="sponsor" data-v="${s.id}">${spLogo(s)}<div style="min-width:0"><div class="nm">${esc(s.name)}</div><div class="tags"><span class="chip ${s.size==='internazionale'||s.size==='nazionale'?'amber':''}">${SPONSOR_SIZE[s.size].lab}</span><span>${sectorLab(s)} · ${esc(s.city)} · ${spDist(s)} km</span></div></div>${right}</button>`;
}
function areaHeat(code){const ss=G.sponsors.filter(s=>s.area===code&&!myContract(s));if(!ss.length)return 0;return Math.max(...ss.map(s=>interest(s,'partner').p))}
function renderSponsor(){
 G.spArea=G.spArea||G.sede.reg;G.spTab=G.spTab||'area';
 const seasonView=G.phase==='season'?SEASON:SEASON+1;
 const tiles=Object.keys(REGIONS).map(k=>{const Rg=REGIONS[k],h=areaHeat(k),n=G.sponsors.filter(s=>s.area===k).length,mine=G.sponsors.filter(s=>s.area===k&&myContract(s)).length;
  return`<button class="tile ${G.spArea===k?'sel':''} ${G.sede.reg===k?'home':''}" style="grid-column:${Rg.x+1};grid-row:${Rg.y+1};--h:${Math.round(h*100)}%" data-act="sparea" data-v="${k}" aria-label="${Rg.n}"><b>${k}</b><small>${n}${mine?` · ${mine}${ic('check',10)}`:''}</small>${G.sede.reg===k?`<span class="pin">${ic('pin',14)}</span>`:''}</button>`}).join('');
 const foreign=Object.keys(FOREIGN).map(k=>{const ss=G.sponsors.filter(s=>s.area===k),open=ss.some(s=>G.rep>=s.req),h=areaHeat(k);
  return`<button class="ftile ${G.spArea===k?'sel':''} ${open?'':'locked'}" style="--h:${Math.round(h*100)}%" data-act="sparea" data-v="${k}">${open?'':ic('lock',12)}<span>${FOREIGN[k].n}</span></button>`}).join('');
 const area=G.spArea,list=G.sponsors.filter(s=>s.area===area).sort((a,b)=>(myContract(b)?1:0)-(myContract(a)?1:0)||interest(b).p-interest(a).p||b.pot-a.pot);
 const contracts=G.contracts.filter(c=>c.end>=SEASON).sort((a,b)=>['main','co','partner'].indexOf(a.slot)-['main','co','partner'].indexOf(b.slot)||b.amount-a.amount);
 const tabs=[['area',areaName(area)],['mine',`Contratti (${contracts.length})`],['offers',`Proposte (${G.offers.length})`]];
 let body='';
 if(G.spTab==='area')body=`<div class="note">${isForeign(area)?`Gli sponsor esteri guardano reputazione e corse disputate nel loro paese (${(G.exp[area]||0)} finora).`:area===G.sede.reg?'La tua regione: qui ti conoscono, la propensione è più alta.':`A ${list.length?spDist(list[0]):'?'} km circa dalla sede: più sei lontano, più servono risultati.`}</div><div class="cols1">${list.map(spRow).join('')||'<div class="note">Nessuno sponsor.</div>'}</div>`;
 else if(G.spTab==='mine')body=`<div class="cols1">${contracts.map(c=>{const sp=SP(c.sid),v=Math.min(c.obj.n,Math.round(contractProg(c)));return`<button class="card crow" data-act="sponsor" data-v="${sp.id}">${spLogo(sp)}<div style="min-width:0"><div class="nm">${esc(sp.name)} <span class="chip ${c.slot==='main'?'cat':''}">${SLOTS[c.slot].lab}</span></div>
   <div class="tags"><span>${eur(c.amount)}/anno · ${c.from===c.end?c.from:c.from+'–'+c.end}${c.from>SEASON?' · inizia nel '+c.from:''}</span></div>
   ${activeIn(c,SEASON)?`<div class="cobj"><span>${esc(c.obj.txt)} · bonus ${eurk(c.bonus)}</span><div class="bar ${c.done?'e':''}"><i style="width:${v/c.obj.n*100}%"></i></div><small>${c.done?'Raggiunto':v+'/'+c.obj.n}</small></div>`:''}</div>
   <div class="sat"><small>Soddisfazione</small><b>${c.sat}%</b></div></button>`}).join('')||'<div class="note">Nessun contratto.</div>'}</div>`;
 else body=`<div class="cols1">${G.offers.map(o=>{const sp=SP(o.sid),wk=Math.max(0,o.exp-absWeek());return`<div class="card orow">${spLogo(sp)}<div style="min-width:0"><div class="nm">${esc(sp.name)} ${o.renew?'<span class="chip u23">Rinnovo</span>':''}</div><div class="tags"><span>${SLOTS[o.slot].lab} · ${eur(o.amount)}/anno · ${o.years} ${o.years>1?'anni':'anno'} dal ${o.from}</span><span>· ${esc(sp.city)}, ${spDist(sp)} km</span>${G.phase==='season'?`<span>· scade tra ${wk} settiman${wk===1?'a':'e'}</span>`:''}</div></div>
   <div class="row"><button class="btn ghost sm" data-act="offno" data-v="${o.id}">Rifiuta</button><button class="btn primary sm" data-act="offyes" data-v="${o.id}">Accetta</button></div></div>`}).join('')||'<div class="note">Nessuna proposta in arrivo. Più cresce la reputazione, più sponsor si fanno avanti da soli.</div>'}</div>`;
 $('#view').innerHTML=`<div class="spgrid">
 <div class="col"><div class="card pad"><div class="sec-h"><h3>${ic('pin',18)} ${esc(G.sede.city)}, ${REGIONS[G.sede.reg].n}</h3><span class="eyebrow">più scuro = più interessati</span></div>
  <div class="itmap">${tiles}</div>
  <div class="eyebrow" style="margin:12px 0 6px">Estero</div><div class="fmap">${foreign}</div></div></div>
 <div class="col">
  <div class="kv kv4"><div><small>Sponsor ${SEASON}</small><b>${eurk(incomeIn(SEASON))}</b></div><div><small>Garantiti ${SEASON+1}</small><b>${eurk(incomeIn(SEASON+1))}</b></div><div><small>Reputazione</small><b>${Math.round(G.rep)}</b></div><div><small>Ruoli ${seasonView}</small><b class="slots">${slotUsed('main',seasonView)}/1 · ${slotUsed('co',seasonView)}/2 · ${slotUsed('partner',seasonView)}/8</b></div></div>
  <div class="seg">${tabs.map(([k,l])=>`<button data-act="sptab" data-v="${k}" aria-pressed="${G.spTab===k}">${esc(l)}</button>`).join('')}</div>
  ${body}
 </div></div>`;
}
function sponsorSheet(id){
 const s=SP(id);if(!s)return;
 if(!SPN||SPN.id!==id){const fs=['main','co','partner'].find(k=>slotStart(k)!==null&&interest(s,k).p>0)||'partner';SPN={id,slot:fs,years:2,msg:null}}
 const c=myContract(s),off=G.offers.find(o=>o.sid===s.id);
 const slots=['main','co','partner'].map(k=>{const st=slotStart(k),it=interest(s,k);return{k,st,it,am:amountFor(s,k)}});
 const sel=slots.find(x=>x.k===SPN.slot);
 const cooling=(s.cool||0)>absWeek();
 let act='';
 if(c)act=`<div class="msg ok">${SLOTS[c.slot].lab} dal ${c.from} al ${c.end}: ${eur(c.amount)} l'anno. Soddisfazione ${c.sat}%.</div>`;
 else if(off)act=`<div class="msg">Ti ha fatto una proposta: ${SLOTS[off.slot].lab.toLowerCase()} a ${eur(off.amount)} l'anno. La trovi in Proposte.</div>`;
 else act=`<div><div class="eyebrow">Ruolo nella squadra</div><div class="slotpick">${slots.map(x=>`<button data-act="spslot" data-v="${x.k}" aria-pressed="${SPN.slot===x.k}" ${x.st===null?'disabled':''}><b>${SLOTS[x.k].lab}</b><span>${eurk(x.am)}/anno</span><small>${x.st===null?'nessun posto':x.it.p>0?`propensione ${Math.round(x.it.p*100)}%`:'non interessato'}${x.st&&x.st>SEASON&&G.phase==='season'?` · dal ${x.st}`:''}</small></button>`).join('')}</div></div>
  <div><div class="eyebrow">Durata</div><div class="seg">${[1,2,3].map(y=>`<button data-act="spyears" data-v="${y}" aria-pressed="${SPN.years===y}">${y} ${y>1?'anni':'anno'}</button>`).join('')}</div></div>
  ${sel.it.p<=0?`<div class="msg no">${ic('lock',14)} ${esc(sel.it.why||'Non interessato')}.</div>`:''}
  ${cooling?`<div class="msg no">Ti ha già detto di no: riprova tra ${s.cool-absWeek()} settimane.</div>`:''}`;
 openSheet(sheetHead(`${SPONSOR_SIZE[s.size].lab} · ${sectorLab(s)}`,esc(s.name),`${esc(s.city)}, ${areaName(s.area)} · ${spDist(s)} km dalla sede`)+
 `<div class="pb wrap"><div class="negbox"><div class="stack">
   <div class="spbig">${spLogo(s,64)}<div><div class="eyebrow">Potenziale come main sponsor</div><div class="big2">${eur(amountFor(s,'main'))}</div><div class="note">Co-sponsor ${eurk(amountFor(s,'co'))} · partner ${eurk(amountFor(s,'partner'))} l'anno</div></div></div>
   <div class="note">${s.size==='locale'?'Azienda del territorio: punta su chi le è vicino e chiede obiettivi semplici, come correre nella sua regione.':s.size==='regionale'?'Azienda importante nella sua regione: vuole visibilità e qualche risultato.':s.size==='nazionale'?'Marchio nazionale: chiede reputazione e risultati, la distanza conta poco.':'Grande gruppo internazionale: guarda solo reputazione, categoria e risultati.'}</div>
   <div class="kv"><div><small>Reputazione richiesta</small><b>${s.req}</b></div><div><small>La tua</small><b>${Math.round(G.rep)}</b></div><div><small>Distanza</small><b>${spDist(s)}</b> km</div></div>
  </div><div class="stack">${act}${SPN.msg?`<div class="msg ${SPN.msg.ok?'ok':'no'}">${esc(SPN.msg.t)}</div>`:''}</div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Chiudi</button>${!c&&!off?`<button class="btn primary" data-act="sppropose" ${sel.st===null||sel.it.p<=0||cooling?'disabled':''}>Proponi la sponsorizzazione</button>`:''}</div></div>`,'wide');
}


/* ---------- consigli dell'ammiraglia e guida tattica ---------- */
function nextClimb(S,pos){const cs=S.course.climbs;for(let i=0;i<cs.length;i++)if(cs[i].top>pos)return Object.assign({last:i===cs.length-1},cs[i]);return null}
function nextPoint(S,pos){
 const c=S.course,out=[];
 const nc=nextClimb(S,pos);
 if(nc)out.push({km:Math.max(0,nc.start-pos),t:nc.start>pos?`GPM ${nc.cat==='HC'?'HC':nc.cat+'ª'} ${nc.name} tra ${km1(nc.start-pos)} km (${km1(nc.len)} km al ${nc.avg.toFixed(1).replace('.',',')}%)`:`In salita: ${nc.name}, cima tra ${km1(nc.top-pos)} km`});
 const i0=gi(S,pos);
 if(c.surf[i0])out.push({km:0,t:c.surf[i0]===1?'Sul pavé: il gruppo si allunga, rischio cadute e forature':'Sullo sterrato: il gruppo si allunga, rischio forature'});
 else for(let i=i0;i<c.N;i++)if(c.surf[i]){out.push({km:(i-i0)/10,t:`${c.surf[i]===1?'Pavé':'Sterrato'} tra ${km1((i-i0)/10)} km`});break}
 if(c.sprintKm&&c.sprintKm>pos)out.push({km:c.sprintKm-pos,t:`Traguardo volante tra ${km1(c.sprintKm-pos)} km`});
 out.sort((a,b)=>a.km-b.km);
 return out[0]?out[0].t:`Arrivo tra ${km1(S.len-pos)} km`;
}
function dsTips(S){
 const tips=[],me=S.riders.filter(x=>x.isMe&&!x.finished);if(!me.length||!S.clusters.length)return tips;
 const plan=S.plans[me[0].team],cap=plan&&plan.lead,main=S.main,lead=S.clusters[0].front,k2g=S.len-lead;
 const nm=x=>x.r.name.split(' ').slice(-1)[0];
 const inBreak=me.filter(x=>x.cl&&x.cl.idx<main.idx);
 if(!S.breakFormed&&lead<45&&!inBreak.length)tips.push({k:'info',t:'Si lotta per la fuga. Un gregario con "Scatta" può entrarci: in fuga guadagni visibilità per gli sponsor e punti GPM, e il capitano risparmia energie in gruppo.'});
 if(inBreak.length){const g=main.idx>0?gapSec(S,main.front)-gapSec(S,inBreak[0].pos):0;
  tips.push({k:'go',t:k2g<12?`${inBreak.map(nm).join(', ')} in fuga a ${km1(k2g)} km dall'arrivo: se la riserva scatti è sopra il 60%, "Scatta" per staccare i compagni di fuga.`:`${inBreak.map(nm).join(', ')} in fuga con ${fmtGap(g)} sul gruppo. "Tira" per difendere il vantaggio, "Ruota" per risparmiarsi se dietro c'è il capitano.`})}
 if(cap&&!cap.finished){
  const capOk=cap.cl===main||cap.cl.idx<main.idx,wr=cap.W/cap.Wmax;
  if(!capOk&&cap.stop<=0)tips.push({k:'warn',t:`${nm(cap)} (capitano) è staccato di ${fmtGap(Math.max(0,gapSec(S,cap.pos)-gapSec(S,main.front)))}. Metti uno o due gregari su "Scorta": lo aspettano e lo riportano sotto.`});
  const atk=S.attacks.find(a=>a.cl===cap.cl&&S.t-a.t<40&&S.byId[a.id].intent==='attack'&&S.byId[a.id].team!=='t0');
  if(atk){const ax=S.byId[atk.id];tips.push({k:'warn',t:`Scatta ${ax.r.name} (${tshort(ax)})! Se è pericoloso "Copri" con ${nm(cap)} o con un compagno fresco; se è lontano in classifica o stanco, lascialo andare.`})}
  const nc=nextClimb(S,cap.pos);
  if(plan.goal==='sprint'||S.type==='piatta'){
   if(k2g<15&&k2g>1&&capOk)tips.push({k:'go',t:`Finale da volata: i gregari su "Tira" tengono chiusa la corsa, ${nm(cap)} resta a "Ruota". Lo sprint parte da solo negli ultimi 250 m.`});
   else if(S.breakFormed&&main.idx>0&&k2g<70&&gapSec(S,main.front)>k2g*3)tips.push({k:'warn',t:`La fuga ha ${fmtGap(gapSec(S,main.front))} a ${Math.round(k2g)} km: se vuoi la volata metti un gregario su "Tira" per chiudere.`});
  }else if(nc&&nc.last&&capOk){
   if(nc.start>cap.pos&&nc.start-cap.pos<15)tips.push({k:'info',t:`Ultima salita tra ${km1(nc.start-cap.pos)} km (${km1(nc.len)} km al ${nc.avg.toFixed(1).replace('.',',')}%). ${nm(cap)} a "Ruota" per risparmiare, un gregario su "Tira" per fare selezione.`});
   else if(cap.pos>=nc.start&&cap.pos<nc.top){const left=nc.top-cap.pos;
    if(wr>0.55&&left<3.5)tips.push({k:'go',t:`Mancano ${km1(left)} km alla cima e ${nm(cap)} ha il ${Math.round(wr*100)}% di riserva: è il momento di "Scatta".`});
    else if(wr<0.3)tips.push({k:'warn',t:`${nm(cap)} ha poca riserva (${Math.round(wr*100)}%): resta a "Ruota" e rispondi solo agli scatti dei rivali diretti.`});
    else tips.push({k:'info',t:`In salita con ${km1(left)} km alla cima: aspetta gli ultimi 2–3 km per attaccare, prima rischi di saltare.`});}
  }else if(S.course.surf[gi(S,cap.pos)]||['pave','roubaix','sterrato'].includes(S.type)&&k2g<S.finaleKm&&capOk)tips.push({k:'info',t:`Settori decisivi: sul pavé e sullo sterrato il gruppo si spezza. Stai davanti e prova "Scatta" su un settore o un muro se ${nm(cap)} ha energia.`});
 }
 {const wt=wxTip(S);if(wt&&S.t<1800)tips.push(wt)}
 for(const x of me)if(x.E<22&&x.intent==='pull'){tips.push({k:'warn',t:`${nm(x)} è quasi senza energia (${Math.round(x.E)}%): toglilo dalla testa con "Ruota" o rischia la crisi.`});break}
 if(!tips.length)tips.push({k:'info',t:'Corsa tranquilla: i corridori seguono il piano. Tienili a "Piano" o "Ruota" per risparmiare: le energie servono nel finale.'});
 return tips.slice(0,3);
}
function guideSheet(){
 if(LIVE&&LIVE.S){LIVE.playing=false;const b=$('#playb');if(b){b.textContent='▶';b.setAttribute('aria-label','Riprendi')}}
 const sec=(h,b)=>`<div class="card pad"><h3>${h}</h3><div class="note gtx">${b}</div></div>`;
 openSheet(sheetHead('Guida tattica','Come si legge la corsa','La gara è in pausa. Riprendila con il pulsante play.')+`<div class="pb wrap"><div class="guide">
 ${sec('Le due barre','<b>Energia</b> (verde) è il serbatoio della giornata: cala sempre, di più se tiri o attacchi. Sotto il 30% il corridore va in crisi e perde molti watt.<br><b>Riserva scatti</b> (gialla) è la benzina per andare oltre la soglia: si svuota in pochi minuti di scatto o di salita al limite e si ricarica pedalando tranquillo. Senza riserva non si risponde agli attacchi.')}
 ${sec('Gli ordini','<b>Piano</b>: segue la tattica decisa prima del via (movimento, zona e momento d\'attacco); se non c\'è un piano decide l\'ammiraglia.<br><b>Ruota</b>: resta coperto in scia, consuma fino al 40% in meno.<br><b>Copri</b>: resta coperto ma risponde subito agli scatti dei rivali nel suo gruppo.<br><b>Tira</b>: va in testa a fare il ritmo; consuma molto ma tiene chiusa la corsa o allunga la fuga.<br><b>Scatta</b>: attacco secco di 1–2 minuti, poi continua a tirare.<br><b>Scorta</b>: il gregario resta con il capitano, lo aspetta se è staccato e lo riporta sotto.')}
 ${sec('Quando attaccare','In <b>salita</b>, negli ultimi 2–3 km prima della cima o dell\'arrivo: in salita la scia conta poco e contano i W/kg.<br>Sui <b>muri e sul pavé</b>: il gruppo si spezza e chi è dietro fatica a rientrare.<br>Dalla <b>fuga</b>, negli ultimi 10 km, per staccare i compagni.<br>In <b>pianura</b> un attacco lontano dall\'arrivo di solito viene ripreso: il gruppo in scia va più veloce di un corridore da solo.<br>Prima di attaccare guarda la riserva scatti: sopra il 60%.')}
 ${sec('Quando coprire','Usa <b>Copri</b> quando scatta un rivale pericoloso: un uomo di classifica vicino in generale o uno scalatore forte nel finale. Non serve coprire chi è lontano in classifica o scatta a 100 km dall\'arrivo: costa riserva e il gruppo lo riprenderà.')}
 ${sec('La fuga','Va via nei primi chilometri: manda un gregario con <b>Scatta</b>. In fuga guadagni visibilità per gli sponsor e punti GPM. Le squadre dei velocisti la tengono a qualche minuto e la chiudono nel finale; nelle tappe dure può arrivare.')}
 ${sec('La volata','Negli ultimi chilometri i gregari su <b>Tira</b> fanno il treno e il velocista resta a <b>Ruota</b>. Negli ultimi 250 m lo sprint parte da solo: vince chi ha più potenza e più riserva rimasta.')}
 ${sec('Imprevisti','Forature e cadute capitano di più sul pavé, in discesa e nelle volate di gruppo. Se il capitano resta indietro, metti uno o due gregari su <b>Scorta</b>. Dopo una caduta grave il corridore si ritira e salta qualche settimana.')}
 </div></div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close-guide">Ho capito</button></div></div>`,'wide');
}

/* ---------- eventi ---------- */
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 const a=t.dataset.act,v=t.dataset.v;
 switch(a){
  case'jer':window._jer=+v;document.querySelectorAll('.jbtn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));break;
  case'start':{const n=($('#tname').value||'').trim()||'Ciclistica Valle Azzurra';const[rg,ct]=$('#tsede').value.split('|');const cc=REGIONS[rg].c.find(c=>c[0]===ct);busyOn('Si crea il mondo del ciclismo…');setTimeout(()=>{newGame(n,JERSEYS[window._jer||0],{city:ct,reg:rg,lat:cc[1],lon:cc[2]});busyOff();render()},30);break}
  case'tab':G.tab=v;save();closeSheet();render();window.scrollTo(0,0);break;
  case'fullscreen':{const el=document.documentElement;const p=el.requestFullscreen?el.requestFullscreen():null;if(p&&p.then)p.then(()=>{try{screen.orientation.lock('landscape').catch(()=>{})}catch(err){}}).catch(()=>toast('Schermo intero non disponibile qui'));else toast('Schermo intero non disponibile qui');break}
  case'rotok':try{localStorage.setItem('amm-rot','1')}catch(err){}ROT='';document.querySelectorAll('.rotate').forEach(x=>x.remove());break;
  case'adv1':{if(advanceWeek()){render();const p=myPending();if(p.length)toast(`Settimana ${G.week}: si corre ${p[0].name}`,'ok')}break}
  case'advnext':{busyOn('Le settimane passano…');setTimeout(()=>{const n=advanceToNext();busyOff();render();toast(`Avanzato di ${n} settiman${n===1?'a':'e'}`)},30);break}
  case'mail':mailSheet(v);render();break;
  case'calf':G.calf=v;renderCal();break;
  case'rankf':G.rankf=v;renderRank();break;
  case'race':raceSheet(v);break;
  case'register':{const race=G.races.find(x=>x.id===v);const res=register(race);toast(res.msg,res.ok?'ok':res.declined?'bad':'');raceSheet(v);renderTop();if(G.tab==='cal')renderCal();break}
  case'withdraw':{const race=G.races.find(x=>x.id===v);withdraw(race);toast('Iscrizione ritirata');raceSheet(v);renderTop();if(G.tab==='cal')renderCal();break}
  case'rider':riderSheet(v);break;
  case'close':closeSheet();render();break;
  case'convoca':openConvoca(v);break;
  case'suggest':suggest();renderConvoca();break;
  case'cap':if(SEL.ids.has(v)){SEL.cap=v;renderConvoca()}break;
  case'forfeit':{SEL.race.status='open';G.rep=Math.max(0,G.rep-3);mail('Organizzatori',`Assenza a ${SEL.race.name}`,'La squadra non si è presentata al via. Quota persa e reputazione in calo.');closeSheet();save();render();break}
  case'go':launch(v);break;
  case'nextseason':{busyOn('Si prepara la nuova stagione…');setTimeout(()=>{const out=newSeason(v==='up');busyOff();G.tab='home';render();openSheet(sheetHead(`Stagione ${SEASON}`,'Si riparte',`${myCat().lab} · sponsor ${eur(incomeIn(SEASON))}`)+`<div class="pb wrap"><ul class="note" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">${out.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Via!</button></div></div>`)},30);break}
  case'newgame':openSheet(sheetHead('Nuova partita','Ricominciare da capo?','Rosa, calendario e classifiche verranno generati di nuovo.')+`<div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Annulla</button><button class="btn primary" data-act="reset">Ricomincia</button></div></div>`);break;
  case'reset':try{localStorage.removeItem(SAVE_KEY)}catch(err){}G=null;closeSheet();render();break;
  case'play':LIVE.playing=!LIVE.playing;t.textContent=LIVE.playing?'❚❚':'▶';t.setAttribute('aria-label',LIVE.playing?'Pausa':'Riprendi');break;
  case'speed':LIVE.speed=+v;document.querySelectorAll('#spd button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));break;
  case'zoom':LIVE.zoom=!LIVE.zoom;t.textContent=LIVE.zoom?'Tutto':'Zoom';drawProfile();break;
  case'jump':{const S=LIVE.S;if(!S)break;const target=S.len-Math.max(25,Math.min(S.finaleKm+3,60));let n=0;while(!S.done&&S.clusters.length&&S.clusters[0].front<target&&n<20000){tick(S);n++}LIVE.zoom=true;$('#zbtn').textContent='Tutto';updateRaceUI();break}
  case'end':{const S=LIVE.S;if(!S)break;while(!S.done)tick(S);break}
  case'order':{const S=LIVE.S;if(!S)break;const x=S.byId[t.dataset.id];if(!x||x.finished)break;
   if(v==='scatta'){if(x.intent!=='attack'&&x.W>0.1*x.Wmax){x.order='scatta';startAttack(S,x,1.3,rnd(50,80))}}
   else{x.order=v;if(x.intent==='attack')x.atkUntil=0;decide(S,x)}
   renderMine(false);break}
  case'sparea':G.spArea=v;G.spTab='area';renderSponsor();break;
  case'sptab':G.spTab=v;renderSponsor();break;
  case'sponsor':SPN=null;sponsorSheet(v);break;
  case'spslot':SPN.slot=v;SPN.msg=null;sponsorSheet(SPN.id);break;
  case'spyears':SPN.years=+v;sponsorSheet(SPN.id);break;
  case'sppropose':{const sp=SP(SPN.id);const res=propose(sp,SPN.slot,SPN.years);SPN.msg={ok:res.ok,t:res.msg};toast(res.msg,res.ok?'gold':'');sponsorSheet(SPN.id);renderTop();break}
  case'offyes':{const o=G.offers.find(x=>x.id===v);if(o){const res=acceptOffer(o);toast(res.msg,res.ok?'gold':'bad')}render();break}
  case'offno':{const o=G.offers.find(x=>x.id===v);if(o)declineOffer(o);render();break}
  case'guide':guideSheet();break;
  case'close-guide':closeSheet();break;
  case'tt':{const ctx=LIVE.ctx;finishStage(LIVE.RC,simTT(ctx),null,ctx.course);showStageResult();break}
  case'nextstage':closeSheet();openTactic(LIVE.RC,'live');break;
  case'simrest':{closeSheet();const RC=LIVE.RC;closeRace();simAsync(RC);break}
  case'racedone':{const RC=LIVE.RC;if(RC.jr){jrFinish(RC);closeRace();render();jrFinalSheet(RC);break}if(RC.nat){natFinish(RC);closeRace();render();natFinalSheet(RC);break}finishMyRace(RC);closeRace();render();showFinal(RC);break}
  case'neg':openNeg(v);break;
  case'negyears':NEG.years=+v;renderNeg();break;
  case'negstep':{const[k,d]=v.split(':');NEG[k]=Math.max(0,NEG[k]+(+d));renderNeg();break}
  case'negoffer':negOffer();break;
  case'release':releaseSheet(v);break;
  case'releaseok':doRelease(RID(v));closeSheet();render();break;
  case'mksub':G.mk.sub=v;renderMarket();break;
  case'campbook':{const L=CAMPS.find(x=>x.id===v);CAMPSEL={loc:v,from:Math.max(G.week+1,L.from),weeks:3,ids:new Set()};campSheet();break}
  case'campstep':{const L=CAMPS.find(x=>x.id===CAMPSEL.loc);CAMPSEL.from=clamp(CAMPSEL.from+(+v),Math.max(G.week+1,L.from),L.to-CAMPSEL.weeks+1);campSheet();break}
  case'campweeks':CAMPSEL.weeks=+v;campSheet();break;
  case'campok':{bookCamp(CAMPSEL.loc,CAMPSEL.from,CAMPSEL.weeks,[...CAMPSEL.ids]);toast('Ritiro prenotato','ok');closeSheet();render();break}
  case'campcancel':{const c=G.camps.find(x=>x.id===v);if(c){cancelCamp(c);toast('Ritiro annullato, rimborso 50%')}render();break}
  case'acadup':if(upgradeAcademy()){toast(G.academy.level===1?'Scuola juniores aperta!':'Scuola migliorata','gold');render()}break;
  case'promote':promoteSheet(v);break;
  case'promoteok':{promoteJunior(RID(v),+t.dataset.s,3);toast('Contratto firmato','ok');closeSheet();render();break}
  case'jrrelease':releaseJunior(RID(v));closeSheet();render();break;
 }
});
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.act==='mkf'){G.mk[t.dataset.k]=t.value;renderMarket();return}
 if(t.dataset.act==='afocus'){G.academy.focus=t.value;save();return}
 if(t.dataset.act==='camppick'){if(t.checked){if(CAMPSEL.ids.size>=8){t.checked=false;return}CAMPSEL.ids.add(t.dataset.v)}else CAMPSEL.ids.delete(t.dataset.v);const sc=$('#sheet .pb').scrollTop;campSheet();$('#sheet .pb').scrollTop=sc;return}
 if(t.dataset.act!=='pick')return;
 const id=t.dataset.v;
 if(t.checked){if(SEL.ids.size>=selSize(SEL.race)){t.checked=false;return}SEL.ids.add(id);if(!SEL.cap)SEL.cap=id}
 else{SEL.ids.delete(id);if(SEL.cap===id)SEL.cap=[...SEL.ids][0]||null}
 const sc=$('#sheet .pb').scrollTop;renderConvoca();$('#sheet .pb').scrollTop=sc;
});
window.addEventListener('resize',()=>{if(LIVE)drawProfile()});
rotBanner();
G=load();
if(G)natMigrate();
render();
