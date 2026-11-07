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
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 check:'<path d="M5 12l5 5 9-10"/>'
};
const ic=(n,s=20)=>`<svg class="ic" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n]}</svg>`;
function jersey(c1,c2,s=36){return`<svg viewBox="0 0 40 40" width="${s}" height="${s}" aria-hidden="true"><path d="M13 4l-9 6 4 8 4-2v20h16V16l4 2 4-8-9-6c-1 3-4 5-7 5s-6-2-7-5z" fill="${c1}" stroke="rgba(0,0,0,.28)" stroke-width="1"/><path d="M12 19h16v5H12z" fill="${c2}"/><path d="M16.5 4.6c1 2.3 2.2 3.4 3.5 3.4s2.5-1.1 3.5-3.4" fill="none" stroke="${c2}" stroke-width="2"/></svg>`}
const myJersey=(s)=>jersey(G.jersey[0],G.jersey[1],s);
const ord=n=>n+'°';
function toast(t,kind=''){const box=$('#toasts');const d=document.createElement('div');d.className='toast '+kind;d.textContent=t;box.appendChild(d);setTimeout(()=>d.classList.add('out'),2600);setTimeout(()=>d.remove(),3100)}
NOTIFY=toast;
function openSheet(html,cls=''){const s=$('#sheet');s.innerHTML=`<div class="panel ${cls}" role="dialog" aria-modal="true">${html}</div>`;s.hidden=false}
function closeSheet(){$('#sheet').hidden=true;$('#sheet').innerHTML=''}
function sheetHead(eyebrow,title,sub='',close=true){return`<div class="ph wrap"><div style="min-width:0"><div class="eyebrow">${eyebrow}</div><h2>${title}</h2>${sub?`<div class="note">${sub}</div>`:''}</div>${close?'<button class="x" data-act="close" aria-label="Chiudi">×</button>':''}</div>`}
function busyOn(t){$('#busy').hidden=false;$('#busytxt').textContent=t}
function busyOff(){$('#busy').hidden=true}
let ROT='';
function rotBanner(){let off=false;try{off=localStorage.getItem('amm-rot')==='1'}catch(e){}ROT=off?'':`<div class="banner rotate"><span style="flex:1">Ammiraglia è pensata in orizzontale: gira il telefono per avere corsa e ordini affiancati.</span><button class="chip" data-act="rotok">Ok</button></div>`}

/* ---------- shell ---------- */
const TABS=[['home','Home','home'],['cal','Calendario','cal'],['team','Squadra','team'],['market','Mercato','market'],['base','Strutture','base'],['rank','Classifiche','rank']];
function render(){
 if(!G){renderIntro();return}
 $('#top').hidden=false;$('#tabs').hidden=false;
 renderTop();
 const unread=G.inbox.filter(m=>!m.read).length;
 $('#tabs').innerHTML=`<div class="tabin">${TABS.map(([k,l,i])=>`<button data-act="tab" data-v="${k}" aria-current="${G.tab===k}">${ic(i,22)}<span>${l}</span>${k==='home'&&unread?`<b class="badge">${unread}</b>`:''}</button>`).join('')}</div>`;
 const v=$('#view');
 ({home:renderHome,cal:renderCal,team:renderTeam,market:renderMarket,base:renderBase,rank:renderRank})[G.tab]();
 v.classList.remove('enter');void v.offsetWidth;v.classList.add('enter');
}
function renderTop(){
 const d=weekDate(G.week);
 $('#top').innerHTML=`<div class="wrap topin"><div class="crest">${myJersey(34)}</div>
  <div style="min-width:0"><div class="tn">${esc(G.name)}</div><div class="sub"><span class="chip cat">${myCat().lab}</span> ${G.phase==='season'?`Sett. ${G.week} · ${d.getDate()} ${MESI[d.getMonth()]} ${SEASON}`:`Fine stagione ${SEASON}`}</div></div>
  <div class="hud"><div><small>Cassa</small><b class="${G.cash<0?'neg':''}">${eurk(G.cash)}</b></div><div><small>Reputazione</small><b>${Math.round(G.rep)}</b></div><div class="hide-s"><small>Sponsor</small><b>${G.sponsor}%</b></div></div>
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
   <div class="field"><span class="eyebrow">Maglia</span><div class="jerseys">${JERSEYS.map((j,i)=>`<button class="jbtn" data-act="jer" data-v="${i}" aria-pressed="${i===sel}" aria-label="Maglia ${i+1}">${jersey(j[0],j[1],44)}</button>`).join('')}</div></div>
   <button class="btn primary big" data-act="start">Inizia la stagione 2027</button>
   <ul class="note list"><li>Corse Continental ed Under 23 subito; le ProSeries su invito; WorldTour e Grandi Giri solo da ProTeam o WorldTeam.</li><li>Ogni corsa costa: quota d'iscrizione più trasferta per corridore e giorno.</li><li>Il gioco salva da solo nel browser.</li></ul>
  </div></div>`;
}

/* ---------- home ---------- */
function renderHome(){
 const pend=myPending(),nx=nextMyRace();
 let hero;
 if(G.phase!=='season'){
  const o=G.offer;
  hero=`<div class="hero card"><div class="eyebrow">Stagione ${SEASON} conclusa</div><h2>${myCatRank()}ª tra le ${myCat().lab}</h2>
   <div class="kv"><div><small>Punti</small><b>${teamPoints(ME())}</b></div><div><small>Vittorie</small><b>${ME().riders.reduce((a,id)=>a+RID(id).wins,0)}</b></div><div><small>Km in fuga</small><b>${Math.round(G.kmFuga)}</b></div></div>
   ${o?`<div class="offer"><div class="eyebrow">Proposta di licenza</div><b>Diventa ${CAT[o.to].lab}</b><span class="note">Budget ${eur(o.budget)} · rosa da ${CAT[o.to].min} a ${CAT[o.to].max} corridori · ingaggio minimo ${eur(CAT[o.to].minSal)} · staff ${eurk(CAT[o.to].staff)}/anno</span></div>`:''}
   <div class="note">Mercato aperto: rinnova, firma svincolati e promuovi i tuoi juniores prima di ripartire.</div>
   <div class="row">${o?`<button class="btn primary big" data-act="nextseason" data-v="up">Accetta e passa al ${SEASON+1}</button><button class="btn ghost" data-act="nextseason" data-v="">Resta ${myCat().lab}</button>`:`<button class="btn primary big" data-act="nextseason" data-v="">Passa al ${SEASON+1}</button>`}<button class="btn ghost" data-act="tab" data-v="market">Mercato</button></div></div>`;
 }else if(pend.length){
  hero=`<div class="hero card go"><div class="eyebrow">Questa settimana</div>${pend.map(r=>`<div class="herorace"><div style="min-width:0"><h2>${esc(r.name)}</h2><div class="mt">${raceChips(r)}</div></div><button class="btn primary big" data-act="convoca" data-v="${r.id}">Convocazioni</button></div>`).join('')}</div>`;
 }else{
  hero=`<div class="hero card"><div class="eyebrow">Settimana ${G.week} · ${weekLab(G.week)}</div>
   <h2>${nx?`Prossima corsa: ${esc(nx.name)}`:'Nessuna corsa in programma'}</h2>
   <div class="note">${nx?`Tra ${nx.w-G.week} settiman${nx.w-G.week===1?'a':'e'} (${weekLab(nx.w)}).`:'Apri il Calendario e iscriviti alle corse adatte alla tua squadra.'}</div>
   <div class="row"><button class="btn primary big" data-act="adv1">Avanza di una settimana</button>${nx?`<button class="btn big" data-act="advnext">Vai alla prossima corsa</button>`:`<button class="btn big" data-act="tab" data-v="cal">Calendario</button>`}</div></div>`;
 }
 const objs=G.objectives.map(o=>{const v=Math.min(o.n,Math.round(G.st[o.k]||0));return`<div class="obj ${o.done?'done':''}"><div class="ol"><span>${esc(o.txt)}</span><b>${o.done?ic('check',16):eurk(o.reward)}</b></div><div class="bar ${o.done?'e':''}"><i style="width:${v/o.n*100}%"></i></div><small>${v}/${o.n}</small></div>`}).join('');
 const mails=G.inbox.slice(0,6).map(m=>`<button class="mail ${m.read?'':'unread'}" data-act="mail" data-v="${m.id}"><span class="from">${esc(m.from)}</span><span class="mt2">${esc(m.title)}</span><span class="wk">S${m.w}</span></button>`).join('')||'<div class="note">Nessun messaggio.</div>';
 const recent=G.races.filter(r=>r.status==='done'&&r.result&&r.result.winner&&r.tier!=='jun').sort((a,b)=>b.w-a.w||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]).slice(0,5);
 const camps=G.camps.filter(c=>!c.done);
 const proj=projected();
 $('#view').innerHTML=`${ROT}<div class="homegrid">
  <div class="col">${hero}
   <div class="card pad"><div class="sec-h"><h3>Obiettivi dello sponsor</h3><span class="eyebrow">${G.sponsor}% soddisfatto</span></div>${objs}</div>
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
const CALF=[['acc','Accessibili'],['reg','Iscritte'],['all','Tutte'],['ita','Italia'],['u23','Under 23'],['wt','WorldTour']];
function raceState(r){
 if(r.status==='done')return r.result&&r.result.mine?{cls:'done me',t:`${ord(r.result.mine[0].pos)} ${esc(r.result.mine[0].name.split(' ').slice(-1)[0])}`}:r.result&&r.result.winner?{cls:'done',t:esc(r.result.winner)}:r.result&&r.result.junior?{cls:'done',t:`Scuola: ${ord(r.result.junior[0].pos)}`}:{cls:'done',t:'Conclusa'};
 if(r.status==='reg')return{cls:'reg',t:`${ic('check',14)} Iscritto`};
 if(r.status==='declined')return{cls:'no',t:'Invito rifiutato'};
 const a=access(r);
 if(!a.ok)return{cls:'lock',t:`${ic('lock',13)} ${r.tier==='jun'?'Juniores':'Chiusa'}`};
 if(r.w<=G.week)return{cls:'lock',t:'Iscrizioni chiuse'};
 return a.mode==='invite'?{cls:'inv',t:`Invito · ${chanceLab(a.chance)}`}:{cls:'fee',t:eurk(feeOf(r))};
}
function renderCal(){
 const f=G.calf||'acc';
 const flt=r=>f==='all'?true:f==='reg'?r.status==='reg'||(r.status==='done'&&r.result&&r.result.mine):f==='ita'?r.ctry==='ITA':f==='u23'?(r.tier==='u23'||r.flag==='u23'||r.tier==='jun'):f==='wt'?['gt','mon','uwt1','uwt2'].includes(r.tier):(access(r).ok||r.status==='reg');
 const list=G.races.filter(flt).sort((a,b)=>a.w-b.w||TIER_ORDER[a.tier]-TIER_ORDER[b.tier]);
 let html=`<div class="toolbar"><div class="chips">${CALF.map(([k,l])=>`<button class="fchip" data-act="calf" data-v="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div><span class="note">${list.length} corse</span></div>`;
 let lw=-1;html+='<div class="callist">';
 for(const r of list){
  if(r.w!==lw){lw=r.w;html+=`<div class="wk ${r.w===G.week?'now':''}" ${r.w===G.week?'id="wknow"':''}><b>Sett. ${r.w}</b> ${weekLab(r.w)}${r.w===G.week?' · <span class="chip u23">adesso</span>':''}</div>`}
  const s=raceState(r);
  html+=`<button class="rrow ${r.w<G.week?'past':''}" data-act="race" data-v="${r.id}"><div class="rmain"><div class="rn">${esc(r.name)}</div><div class="mt">${raceChips(r)}</div></div><span class="pill ${s.cls}">${s.t}</span></button>`;
 }
 html+='</div>';
 $('#view').innerHTML=html;
 const now=$('#wknow');if(now&&G.calf!=='reg')now.scrollIntoView({block:'start'});
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
  `${R.mine?`<div class="msg ok">La tua squadra: ${R.mine.slice(0,3).map(m=>`${esc(m.name)} ${ord(m.pos)}`).join(' · ')} · ${R.myPts} punti · ${eur(R.prize)} di premi</div>`:''}
   <div class="card tbl"><table class="t">${R.top.map((x,i)=>`<tr class="${R.mine&&R.mine.some(m=>m.id===x.id)?'me':''}"><td class="n">${i+1}</td><td>${esc(x.name)} <span class="tm">${esc(x.team)}</span></td><td class="r">${i===0?fmtT(x.t||0):fmtGap(x.t-R.top[0].t)}</td></tr>`).join('')}</table></div>
   ${R.stageW?`<div class="note">Vincitori di tappa: ${R.stageW.map((n,i)=>`${i+1}. ${esc(n)}`).join(' · ')}</div>`:''}`;
 }else if(r.status==='reg'){
  info=`<div class="msg ok">Iscritto. Quota pagata: ${eur(r.fee||fee)}. Le convocazioni si fanno nella settimana della corsa.</div>`;
  if(r.w>G.week)act=`<button class="btn ghost" data-act="withdraw" data-v="${r.id}">Ritira l'iscrizione (rimborso 50%)</button>`;
 }else if(r.status==='declined')info=`<div class="msg no">L'organizzazione non ti ha invitato quest'anno.</div>`;
 else if(!a.ok)info=`<div class="msg no">${ic('lock',14)} ${esc(a.why)}.</div>`;
 else if(r.w<=G.week)info=`<div class="msg no">Iscrizioni chiuse: servono almeno 7 giorni di anticipo.</div>`;
 else{
  info=a.mode==='invite'?`<div class="msg">Serve un invito degli organizzatori. Probabilità ${chanceLab(a.chance)} (${Math.round(a.chance*100)}%): dipende da reputazione e nazionalità. Se ti invitano paghi la quota.</div>`:a.auto?`<div class="msg ok">Sei tra le prime due ProTeam: invito automatico.</div>`:'';
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
function riderCard(r){
 const c=condOf(r),ae=altEff(r,G.week),camp=inCamp(r,G.week,G.week);
 return`<button class="card rider" data-act="rider" data-v="${r.id}">
  <div class="ovr ${ovr(r)>=75?'hi':''}">${ovr(r)}</div>
  <div style="min-width:0"><div class="nm">${esc(r.name)}</div>
   <div class="tags"><span class="chip ${r.age<=22?'u23':''}">${catOf(r)}</span>${r.neo?'<span class="chip">1° anno</span>':''}<span>${ARCH[r.arch].lab} · ${r.age} anni · ${r.nat}</span></div></div>
  <div class="rr2"><span class="cond" style="--c:${c.c}">${c.t}</span><small>${r.days} gg</small></div>
  ${statRow(r)}
  <div class="cline">${camp?'<span class="chip amber">In altura</span>':''}${ae>0?`<span class="chip amber">Altura +${(ae*100).toFixed(1)}%</span>`:''}${contractLine(r)}</div>
 </button>`;
}
function renderTeam(){
 const rs=ME().riders.map(RID);
 const u=rs.filter(r=>r.age<=22).sort((a,b)=>ovr(b)-ovr(a)),e=rs.filter(r=>r.age>22).sort((a,b)=>ovr(b)-ovr(a));
 const inc=incoming();
 $('#view').innerHTML=`<div class="kv kv4"><div><small>Corridori</small><b>${rs.length}/${myCat().max}</b></div><div><small>Monte ingaggi</small><b>${eurk(payroll())}</b></div><div><small>Giorni di gara</small><b>${rs.reduce((a,r)=>a+r.days,0)}</b></div><div><small>Vittorie</small><b>${rs.reduce((a,r)=>a+r.wins,0)}</b></div></div>
  <div class="note" style="margin:8px 0 14px">SAL salita · PIA pianura · CRO cronometro · VOL volata · RES resistenza · REC recupero. Programma consigliato 50–70 giorni di corsa.</div>
  <div class="sec"><div class="sec-h"><h2>Under 23</h2><span class="eyebrow">19–22 anni</span></div><div class="cols">${u.map(riderCard).join('')||'<div class="note">Nessun Under 23.</div>'}</div></div>
  <div class="sec"><div class="sec-h"><h2>Elite</h2><span class="eyebrow">23 anni e oltre</span></div><div class="cols">${e.map(riderCard).join('')}</div></div>
  ${inc.length?`<div class="sec"><div class="sec-h"><h2>In arrivo nel ${SEASON+1}</h2></div><div class="cols">${inc.map(r=>mkRow(r,'inc')).join('')}</div></div>`:''}`;
}
function riderSheet(id){
 const r=RID(id);if(!r)return;
 const c=condOf(r),ftp=Math.round(r.mass*r.wkg);
 const pot=r.age<=22?'★'.repeat(1+Math.round(r.pot*4))+'☆'.repeat(4-Math.round(r.pot*4)):'—';
 const res=r.res.slice().reverse().map(x=>`<tr><td>${esc(x.name)} <span class="tm">${x.cls}</span></td><td class="r">${x.pos?ord(x.pos):'—'}${x.w?` <span class="chip amber">${x.w} vitt.</span>`:''}</td></tr>`).join('');
 const camp=G.camps.find(cp=>!cp.done&&cp.riders.includes(r.id));
 openSheet(sheetHead(`${ARCH[r.arch].lab} · ${catOf(r)}${r.neo?' · 1° anno':''}`,esc(r.name),`${r.age} anni · ${r.nat} · ${esc(TEAM(r.team).name)}`)+
 `<div class="pb wrap"><div class="negbox"><div class="stack">
  <div class="kv"><div><small>Valore</small><b>${ovr(r)}</b></div><div><small>Soglia</small><b>${ftp}</b> W</div><div><small>W/kg</small><b>${r.wkg.toFixed(2)}</b></div>
  <div><small>Peso</small><b>${r.mass.toFixed(1)}</b> kg</div><div><small>Volata</small><b>${r.spr}</b> W</div><div><small>Potenziale</small><b style="font-size:16px;color:var(--amber)">${pot}</b></div></div>
  <div class="card pad">${statRow(r)}</div>
  <div class="card pad two"><div><div class="eyebrow">Condizione</div><div class="cond" style="--c:${c.c};margin-top:4px">${c.t}</div>${altEff(r,G.week)>0?`<div class="note">Effetto altura +${(altEff(r,G.week)*100).toFixed(1)}%</div>`:''}${camp?`<div class="note">In ritiro: ${weekLab(camp.from)}–${weekLab(camp.to)}</div>`:''}</div>
   <div><div class="eyebrow">Fatica · giorni</div><div class="bar f" style="margin-top:6px"><i style="width:${r.fat}%"></i></div><div class="note">${Math.round(r.fat)}/100 · ${r.days} giorni di corsa</div></div></div>
 </div><div class="stack">
  ${r.team==='t0'?`<div class="card pad stack"><div class="eyebrow">Contratto</div><div>${eur(r.sal)} l'anno · fino al ${r.cEnd}${r.nextSal?` · dal ${SEASON+1}: ${eur(r.nextSal)}`:''}</div>${r.leavingTo?`<div class="note">Ha firmato con ${esc(TEAM(r.leavingTo).name)} per il ${SEASON+1}.</div>`:''}
   <div class="row">${negMode(r)==='renew'?`<button class="btn primary" data-act="neg" data-v="${r.id}">Rinnova</button>`:''}<button class="btn ghost" data-act="release" data-v="${r.id}">Svincola</button></div></div>`:''}
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
 if(mk.sub==='renew')list=ME().riders.map(RID).filter(r=>r.cEnd===SEASON);
 else if(mk.sub==='fa')list=all.filter(r=>r.team==='fa'&&!r.next);
 else if(mk.sub==='jr')list=all.filter(r=>r.team==='jr'&&!r.next);
 else list=all.filter(r=>G.teams.some(t=>t.id===r.team&&t.tier!=='me')&&!r.next);
 list=list.filter(filt).sort((a,b)=>mk.sub==='jr'?(b.pot-a.pot)||(ovr(b)-ovr(a)):(ovr(b)-ovr(a)));
 const total=list.length;list=list.slice(0,40);
 const news=G.news.filter(n=>n.s===SEASON).slice(0,4);
 const subs=[['renew','Rinnovi'],['fa','Svincolati'],['others','Altre squadre'],['jr','Juniores']];
 const roles=[['all','Tutti i ruoli']].concat(Object.keys(ARCH).map(k=>[k,ARCH[k].lab]));
 const hint={renew:`Contratti in scadenza nel ${SEASON}. Se non li rinnovi, a fine stagione se ne vanno; dal 1° agosto le altre squadre possono prenderli.`,
  fa:'Senza squadra: si firmano subito, senza indennizzo, a finestra aperta.',
  others:`Acquisto con indennizzo da squadre di categoria pari o inferiore (a finestra aperta). Chi ha il contratto in scadenza si firma a parametro zero dal 1° agosto.${myCat().minSal?` Ingaggio minimo ${myCat().lab}: ${eur(myCat().minSal)} (${eur(myCat().neoSal)} per gli Under 23).`:''}`,
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
  <div class="cols">${list.map(r=>mkRow(r)).join('')||'<div class="note">Nessun corridore.</div>'}</div>
 </div>`;
}
let NEG=null;
function openNeg(id){
 const r=RID(id),w=win();
 if(r.team==='acad'){riderSheet(id);return}
 if(r.negW!==w.id){r.negW=w.id;r.neg=0}
 const mode=negMode(r),years=r.age<=24?3:r.age>=31?1:2;
 NEG={id,mode,years,sal:0,fee:0,msg:null,done:false,feeHint:null};
 if(mode){NEG.sal=Math.max(minSalFor(r),Math.round(askSal(r,mode,years)*0.9/1000)*1000);if(mode==='buy')NEG.fee=Math.round(feeAsk(r)*0.85/1000)*1000}
 renderNeg();
}
function negCostNow(){const m=NEG.mode;if(m!=='sign'&&m!=='buy')return 0;return NEG.sal*remWeeks()/seasonWeeks()+(m==='buy'?NEG.fee:0)}
function endYear(y){return SEASON+y-((NEG.mode==='sign'||NEG.mode==='buy')&&!win().off?1:0)}
function renderNeg(){
 const r=RID(NEG.id),m=NEG.mode,o=ovr(r),w=win(),C=myCat();
 const title={renew:'Rinnovo del contratto',sign:'Ingaggio di uno svincolato',buy:'Acquisto con indennizzo',pre:r.junior?`Contratto da neoprofessionista per il ${SEASON+1}`:`Firma per il ${SEASON+1} a parametro zero`}[m]||'Trattativa non disponibile';
 const cost=negCostNow(),projA=projected(cost);
 const rosterOk=m==='renew'?true:(m==='pre'||w.off)?nextRoster()<C.max:myRoster()<C.max;
 const moneyOk=(m==='sign'||m==='buy')?projA>=0:true;
 const minOk=NEG.sal>=minSalFor(r);
 const blocked=!m||NEG.done||(r.neg||0)>=3||!rosterOk||!moneyOk||!minOk;
 const ask=m?Math.round(askSal(r,m,NEG.years)/1000)*1000:0;
 const pot=r.age<=22||r.junior?'★'.repeat(1+Math.round(r.pot*4))+'☆'.repeat(4-Math.round(r.pot*4)):'—';
 const cur=r.team!=='fa'&&r.team!=='jr'?`<div class="note">${r.team==='t0'?'Contratto attuale':'Contratto con '+esc(TEAM(r.team).name)}: ${eur(r.sal)} l'anno fino al ${r.cEnd}</div>`:'';
 openSheet(sheetHead(title,esc(r.name),`${catOf(r)} · ${ARCH[r.arch].lab} · ${r.age} anni · ${r.nat} · ${esc(TEAM(r.team).name)}`)+
 `<div class="pb wrap"><div class="negbox"><div class="stack">
   <div class="kv"><div><small>Valore</small><b>${o}</b></div><div><small>W/kg</small><b>${r.wkg.toFixed(2)}</b></div><div><small>Potenziale</small><b style="font-size:16px;color:var(--amber)">${pot}</b></div></div>
   <div class="card pad">${statRow(r)}</div>${cur}${r.pts?`<div class="note">${SEASON}: ${r.pts} punti, ${r.wins} vittorie, ${r.days} giorni di corsa</div>`:''}
  </div><div class="stack">
  ${m?`
   <div><div class="eyebrow">Ingaggio annuo</div><div class="stepper"><button data-act="negstep" data-v="sal:-1000" aria-label="Meno">−</button><output>${eur(NEG.sal)}</output><button data-act="negstep" data-v="sal:1000" aria-label="Più">+</button></div>
    <div class="note">Il procuratore chiede circa ${eur(ask)}${r.age<=24?' e preferisce un contratto lungo':r.age>=31?' e preferisce un anno solo':''}.${minSalFor(r)?` Minimo ${C.lab}: ${eur(minSalFor(r))}.`:''}</div></div>
   <div><div class="eyebrow">Durata</div><div class="seg">${[1,2,3].map(y=>`<button data-act="negyears" data-v="${y}" aria-pressed="${NEG.years===y}">fino al ${endYear(y)}</button>`).join('')}</div></div>
   ${m==='buy'?`<div><div class="eyebrow">Indennizzo a ${esc(TEAM(r.team).short)}</div><div class="stepper"><button data-act="negstep" data-v="fee:-5000" aria-label="Meno">−</button><output>${eur(NEG.fee)}</output><button data-act="negstep" data-v="fee:5000" aria-label="Più">+</button></div>${NEG.feeHint?`<div class="note">Chiedono circa ${eur(NEG.feeHint)}.</div>`:''}</div>`:''}
   <div class="note">${m==='sign'||m==='buy'?(w.off?`Pesa sul bilancio dal ${SEASON+1}.`:`Costo su questa stagione: <b>${eur(cost)}</b> · saldo previsto dopo: <b class="${projA<0?'neg':''}">${eur(projA)}</b>`):`Il nuovo ingaggio pesa sul bilancio dal ${SEASON+1}.`}</div>
   ${!rosterOk?`<div class="msg no">Rosa al completo (${C.max} corridori).</div>`:''}
   ${!moneyOk?`<div class="msg no">Non ci sono i soldi: il saldo di fine stagione andrebbe sotto zero.</div>`:''}
  `:`<div class="msg no">${esc(whyNot(r))}.</div>`}
  ${NEG.msg?`<div class="msg ${NEG.msg.ok?'ok':'no'}">${esc(NEG.msg.t)}</div>`:''}
  ${(r.neg||0)>0&&!NEG.done&&m?`<div class="note">Tentativi: ${r.neg}/3</div>`:''}
 </div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">${NEG.done?'Fatto':'Chiudi'}</button>${m&&!NEG.done?`<button class="btn primary" data-act="negoffer" ${blocked?'disabled':''}>Fai l'offerta</button>`:''}</div></div>`,'wide');
}
function negOffer(){
 const r=RID(NEG.id),m=NEG.mode;if(!m||NEG.done)return;
 const tr=TIER_RANK[TEAM(r.team).tier];
 if(tr!==undefined&&tr>myCat().rank&&ovr(r)>=70&&m!=='renew'){r.neg=3;NEG.msg={ok:false,t:`${r.name} non vuole scendere di categoria.`};return renderNeg()}
 if(m==='buy'){const fa=feeAsk(r),q=NEG.fee/fa;
  if(q<0.85||(q<0.97&&R()<0.5)){r.neg=(r.neg||0)+1;NEG.feeHint=Math.round(fa*rnd(0.98,1.06)/1000)*1000;NEG.msg={ok:false,t:`${TEAM(r.team).name} rifiuta l'indennizzo.`};return renderNeg()}}
 const a=askSal(r,m,NEG.years),q=NEG.sal/a;
 if(q>=1||(q>=0.93&&R()<0.4)){
  const y=endYear(NEG.years);
  if(m==='renew'){r.renewed=true;r.nextSal=NEG.sal;r.cEnd=y;NEG.msg={ok:true,t:`Accordo: ${r.name} rinnova fino al ${y}.`};addNews(`${r.name} rinnova fino al ${y}`)}
  else if(m==='pre'){r.next={team:'t0',sal:NEG.sal,cEnd:y};NEG.msg={ok:true,t:`Accordo: ${r.name} arriva nel ${SEASON+1}, contratto fino al ${y}.`};addNews(`Firmato ${r.name} per il ${SEASON+1}`)}
  else{if(m==='buy')G.cash-=NEG.fee;const from=TEAM(r.team).name;moveRider(r,'t0');r.sal=NEG.sal;r.cEnd=y;r.bF=0;r.bT=0;r.junior=false;
   NEG.msg={ok:true,t:`${r.name} è un tuo corridore, contratto fino al ${y}.`};addNews(m==='buy'?`${r.name} arriva da ${from} per ${eurk(NEG.fee)}`:`Ingaggiato lo svincolato ${r.name}`)}
  NEG.done=true;save();renderTop();toast('Accordo raggiunto','ok');return renderNeg();
 }
 r.neg=(r.neg||0)+1;r.askMul*=1.02;
 NEG.msg={ok:false,t:r.neg>=3?`${r.name} interrompe la trattativa fino alla prossima finestra.`:q<0.8?`Offerta lontana dalle richieste: ${r.name} non la considera.`:`${r.name} chiede di più.`};
 renderNeg();
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
 const sc=el.map(r=>({r,s:avgSuit(r,race)-r.fat*0.45-(r.days>65?12:0)+altEff(r,race.w)*300})).sort((a,b)=>b.s-a.s);
 SEL.ids=new Set(sc.slice(0,selSize(race)).map(o=>o.r.id));SEL.cap=sc[0]?sc[0].r.id:null;
}
function renderConvoca(){
 const race=SEL.race,size=selSize(race),min=race.tier==='nc'?1:4;
 const rs=ME().riders.map(RID).sort((a,b)=>avgSuit(b,race)-avgSuit(a,race));
 const n=SEL.ids.size,ok=n>=min&&n<=size&&SEL.cap;
 const pro=race.stages[0].t==='prologo';
 openSheet(sheetHead(`Convocazioni · ${race.lab} · ${weekLab(race.w)}`,esc(race.name),`${race.stages.map((s,i)=>(race.stages.length>1?(s.t==='prologo'?'P':i+(pro?0:1))+'. ':'')+TYPE_LAB[s.t]).join(' · ')}`)+
 `<div class="pb"><div class="wrap"><div class="card pickgrid">${rs.map(r=>{
   const why=whyCant(r,race),on=SEL.ids.has(r.id),c=condOf(r),fit=Math.round(avgSuit(r,race)),ae=altEff(r,race.w);
   return`<div class="pick ${why?'off':''}"><input type="checkbox" id="p_${r.id}" data-act="pick" data-v="${r.id}" ${on?'checked':''} ${why?'disabled':''} aria-label="Convoca ${esc(r.name)}">
    <label for="p_${r.id}" style="min-width:0"><div class="nm">${esc(r.name)} <span class="chip ${r.age<=22?'u23':''}">${catOf(r)}</span></div>
     <div class="sm"><span>${ARCH[r.arch].lab}</span><span class="cond" style="--c:${c.c}">${c.t}</span>${ae>0?`<span class="chip amber">altura +${(ae*100).toFixed(1)}%</span>`:''}<span>fatica ${Math.round(r.fat)}</span><span${r.days>65?' style="color:var(--danger)"':''}>${r.days} gg</span>${why?`<span>· ${why}</span>`:''}</div>
     <div class="sm"><span>Adatto</span><div class="bar fit"><i style="width:${fit}%"></i></div><span class="mono">${fit}</span></div></label>
    <button class="star" data-act="cap" data-v="${r.id}" aria-pressed="${SEL.cap===r.id}" ${!on?'disabled':''} title="Capitano">C</button></div>`}).join('')}</div>
  <div class="note" style="margin-top:8px">C = capitano: la squadra lavora per lui. Puoi cambiare gli ordini in corsa.</div></div></div>
 <div class="pf"><div class="wrap fr"><b class="cnt ${!ok?'neg':''}">${n}/${size}</b><button class="btn ghost" data-act="suggest">Proposta DS</button>${n<min?`<button class="btn ghost" data-act="forfeit">Non partire</button>`:''}<span style="flex:1"></span>
  <button class="btn" data-act="go" data-v="sim" ${ok?'':'disabled'}>Simula</button><button class="btn primary" data-act="go" data-v="live" ${ok?'':'disabled'}>In corsa</button></div></div>`,'wide');
}

/* ---------- gara ---------- */
let LIVE=null;
function launch(mode){
 const race=SEL.race;race.sel=[...SEL.ids];race.cap=SEL.cap;closeSheet();
 const RC=newRC(race);
 if(mode==='sim'){simAsync(RC);return}
 LIVE={RC,S:null,speed:25,playing:true,acc:0,last:0,lastUI:0,zoom:false,course:null};
 startStageLive();
}
function simAsync(RC){
 const n=RC.race.stages.length;busyOn(`Simulazione: ${RC.race.name}`);
 const step=()=>{
  if(RC.stage>=n){finishMyRace(RC);busyOff();render();showFinal(RC);return}
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
  <div class="eyebrow">${esc(RC.race.name)} · ${stageTitle()} · ${TYPE_LAB[c.type]}</div>
  <div class="kmbig"><div class="k" id="k2g">0<small>km all'arrivo</small></div>
   <div class="o"><div>Tempo<b id="rt">0'00"</b></div><div>Media<b id="ravg">—</b></div><div>Pendenza<b id="rgr">0%</b></div></div></div>
  <div class="prof"><canvas id="pc"></canvas><button class="chip zoom" data-act="zoom" id="zbtn">Zoom</button></div>
 </div></div>
 <div class="wrap rbody">
  <div><div class="eyebrow">Situazione corsa</div><div class="card groups" id="grps"></div></div>
  <div><div class="eyebrow">Radio corsa</div><div class="card radio" id="radio"></div></div>
 </div></section>
 <section class="rcol rr"><div class="wrap rbody"><div><div class="eyebrow">I tuoi corridori · ordini radio</div><div class="card" id="mine"></div></div></div></section></div>
 <div class="ctrl"><div class="wrap">
  <button class="btn play" data-act="play" id="playb" aria-label="Pausa">❚❚</button>
  <div class="sp" id="spd">${[[25,'1×'],[75,'3×'],[250,'10×']].map(([v,l])=>`<button data-act="speed" data-v="${v}" aria-pressed="${LIVE.speed===v}">${l}</button>`).join('')}</div>
  <span style="flex:1"></span><button class="btn ghost" data-act="jump">Finale</button><button class="btn ghost" data-act="end">Fine</button>
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
 $('#radio').innerHTML=S.log.slice(-8).reverse().map(l=>`<div><span class="km">${km1(l.km)}</span><span class="${l.me?'me':''}">${esc(l.txt)}</span></div>`).join('')||'<div><span class="km">—</span><span class="muted">Partenza. Il gruppo è compatto.</span></div>';
}
const ORD=[['auto','Auto'],['ruota','Ruota'],['tira','Tira'],['scatta','Scatta'],['scorta','Scorta']];
function renderMine(full){
 const S=LIVE.S;if(!S)return;
 const mine=S.byTeam['t0']||[],box=$('#mine'),capId=S.plans['t0']&&S.plans['t0'].lead&&S.plans['t0'].lead.id;
 if(full||box.children.length!==mine.length){
  box.innerHTML=mine.map(x=>`<div class="mr" id="m_${x.id}"><div class="l1"><span class="nm">${esc(x.r.name)}</span>${x.id===capId?'<span class="chip amber">Capitano</span>':''}<span class="where" id="w_${x.id}"></span></div>
   <div class="bars"><div><span>Energia</span><div class="bar e"><i id="be_${x.id}"></i></div></div><div><span>Riserva scatti</span><div class="bar w"><i id="bw_${x.id}"></i></div></div><div class="mono pwv" id="pw_${x.id}"></div></div>
   <div class="orders">${ORD.map(([k,l])=>`<button data-act="order" data-id="${x.id}" data-v="${k}" class="${k==='scatta'?'atk':''}">${l}</button>`).join('')}</div></div>`).join('');
 }
 const gd=S.clusters.length?groupsDisplay(S):[];
 for(const x of mine){
  const w=$('#w_'+x.id);if(!w)continue;
  let where;
  if(x.finished)where=`Arrivato ${ord(S.finish.indexOf(x)+1)}`;
  else if(x.stop>0)where='Foratura!';
  else{const g=gd.find(o=>o.rs.includes(x));where=g?`${g.name}${g===gd[0]?'':' '+fmtGap(g.g)}`:''}
  const it={attack:'scatto',follow:'in scia a uno scatto',pull:'in testa',ease:'si rialza',sprint:'volata'}[x.intent];
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
  const tr=(x,i)=>{const r=RID(x.id),t=timeOf(x);return`<tr class="${r.team==='t0'?'me':''}"><td class="n">${i+1}</td><td>${esc(r.name)} <span class="tm">${esc(TEAM(r.team).short)}</span></td><td class="r">${i===0?fmtT(t):fmtGap(t-timeOf(list[0]))}</td></tr>`};
  return top.map(tr).join('')+(mine.length?`<tr><td colspan="3" class="tm" style="text-align:center">…</td></tr>`+mine.map(o=>tr(o.x,o.i)).join(''):'')};
 let gcHtml='';
 if(RC.stageRace){const o=gcOrder(RC);gcHtml=`<div><div class="sec-h"><h3>Classifica generale</h3></div><div class="card tbl"><table class="t">${rows(o,x=>x.t,10)}</table></div><div class="jl">${jerLine(jerseys(RC))}</div></div>`}
 const win=RID(sr.res[0].id);
 openSheet(sheetHead(`${esc(RC.race.name)} · ordine d'arrivo`,`Vince ${esc(win.name)}`,`${esc(TEAM(win.team).name)} · ${km1(sr.len)} km in ${fmtT(t0)} · media ${(sr.len/(t0/3600)).toFixed(1).replace('.',',')} km/h`,false)+
 `<div class="pb wrap"><div class="negbox"><div><div class="card tbl"><table class="t">${rows(sr.res,x=>x.time,15)}</table></div></div>${gcHtml}</div></div>
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
 const mine=r.mine.map(m=>`<tr class="me"><td class="n">${m.pos}</td><td>${esc(m.name)}<div class="tm">${m.km} km in fuga</div></td><td class="r">${m.pts?m.pts+' pt':''}</td></tr>`).join('');
 openSheet(sheetHead(`Bilancio · ${race.lab}`,esc(race.name),`${RC.stageRace?'Vincitore finale':'Vincitore'}: <b>${esc(r.winner)}</b> (${esc(r.winnerTeam)})`)+
 `<div class="pb wrap"><div class="kv kv4"><div><small>Punti</small><b>${r.myPts}</b></div><div><small>Premi</small><b>${eurk(r.prize)}</b></div><div><small>Sponsor</small><b class="${r.dS>=0?'pos':'neg'}">${r.dS>=0?'+':''}${r.dS}</b></div><div><small>Reputazione</small><b class="${r.dR>=0?'pos':'neg'}">${r.dR>=0?'+':''}${r.dR}</b></div></div>
  <div class="negbox" style="margin-top:12px"><div><div class="sec-h"><h3>La tua squadra</h3></div><div class="card tbl"><table class="t">${mine}</table></div></div>
  <div><div class="sec-h"><h3>${RC.stageRace?'Classifica finale':'Ordine d\'arrivo'}</h3></div><div class="card tbl"><table class="t">${top}</table></div>${r.jer?`<div class="jl">${jerLine(r.jer)}</div>`:''}</div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Continua</button></div></div>`,'wide');
 if(r.myWins)toast(`${r.myWins} vittori${r.myWins>1?'e':'a'}! +${eurk(r.prize)}`,'gold');
}

/* ---------- eventi ---------- */
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 const a=t.dataset.act,v=t.dataset.v;
 switch(a){
  case'jer':window._jer=+v;document.querySelectorAll('.jbtn').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));break;
  case'start':{const n=($('#tname').value||'').trim()||'Ciclistica Valle Azzurra';busyOn('Si crea il mondo del ciclismo…');setTimeout(()=>{newGame(n,JERSEYS[window._jer||0]);busyOff();render()},30);break}
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
  case'nextseason':{busyOn('Si prepara la nuova stagione…');setTimeout(()=>{const out=newSeason(v==='up');busyOff();G.tab='home';render();openSheet(sheetHead(`Stagione ${SEASON}`,'Si riparte',`${myCat().lab} · budget ${eur(G.budget)}`)+`<div class="pb wrap"><ul class="note" style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px">${out.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Via!</button></div></div>`)},30);break}
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
  case'tt':{const ctx=LIVE.ctx;finishStage(LIVE.RC,simTT(ctx),null,ctx.course);showStageResult();break}
  case'nextstage':closeSheet();startStageLive();break;
  case'simrest':{closeSheet();const RC=LIVE.RC;closeRace();simAsync(RC);break}
  case'racedone':{const RC=LIVE.RC;finishMyRace(RC);closeRace();render();showFinal(RC);break}
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
render();
