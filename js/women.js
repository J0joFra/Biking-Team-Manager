"use strict";
/* ============================================================
   SQUADRA FEMMINILE
   Due "mondi" separati (uomini e donne) con squadre, atlete,
   calendario e categoria propri. Cassa, sponsor, reputazione e
   posta sono condivisi: un solo budget per due squadre.
   ============================================================ */
const AI_TEAMS_F=[
 ['Aurora Grid Women','AUW','wt',['NED','BEL','GER']],['Nordwind Women Racing','NWW','wt',['NOR','DEN','GBR']],
 ['Lumen Women Pro','LUW','wt',['FRA','BEL']],['Halcyon Women','HAW','wt',['GBR','NED']],
 ['Meridian Donne','MED','wt',['ITA','SLO','ESP']],['Kestrel Women','KEW','wt',['BEL','NED']],
 ['Cordillera Femenino','CRF','wt',['ESP','COL']],['Polaris Women','PLW','wt',['DEN','POL','NOR']],
 ['Vortex Ladies','VXL','wt',['GER','AUT','SUI']],['Gallia Féminin','GAF','wt',['FRA']],
 ['Flandria Ladies','FLL','wt',['BEL']],['Orizzonte Donne','ORD','wt',['ITA']],
 ['Basalt Women','BAW','wt',['SUI','GER']],['Tramontana Femenino','TRF','wt',['ESP','POR']],
 ['Appennino Women','APW','pro',['ITA']],['Polder Ladies','PLL','pro',['NED','BEL']],
 ['Bretagne Féminin','BRF','pro',['FRA']],['Alpenrose Women','ALW','pro',['AUT','SUI','GER']],
 ['Thames Women Racing','THW','pro',['GBR']],['Laguna Donne','LGD','pro',['ITA']],
 ['Iberia Femenino','IBF','pro',['ESP','POR']],['Karst Women','KAW','pro',['SLO','ITA']],
 ['Valdarno Donne','VAD','conti',['ITA']],['Veneto Rosa Team','VRT','conti',['ITA']],
 ['Marche Women Cycling','MWC','conti',['ITA']],['Brabant Ladies','BRL','conti',['BEL','NED']],
 ['Zuid Ladies Cycling','ZLC','conti',['NED']],['Meseta Femenino','MEF','conti',['ESP']],
 ['Fjord Women','FJW','conti',['NOR','DEN']],['Lombardia Rosa','LRO','conti',['ITA']],
 ['Loire Féminin','LOF','conti',['FRA']],['Tirol Ladies','TIL','conti',['AUT','GER']],
 ['Mazovia Women','MAW','conti',['POL']],['Andes Femenino','ANF','conti',['COL']],
 ['Sicilia Donne Team','SDT','conti',['ITA']],['Highlands Women','HIW','conti',['GBR']]
];
/* calendario femminile: corse vere d'Italia e d'Europa */
const RACES_F=[
 ['Setmana Ciclista Valenciana','ESP',6,'2.1','4:H'],
 ['Omloop Het Nieuwsblad Women','BEL',7,'1.WWT','pave:130'],
 ['Omloop van het Hageland','BEL',7,'1.1','pave:125'],
 ['Strade Bianche Donne','ITA',8,'1.WWT','sterrato:136'],
 ['Trofeo Oro in Euro','ITA',8,'1.1','collinare:118'],
 ['Trofeo Ponente in Rosa','ITA',9,'2.2','3:H'],
 ['GP Oetingen','BEL',9,'1.2','piatta:118'],
 ['Danilith Nokere Koerse','BEL',10,'1.1','mossa:124'],
 ['Ronde van Drenthe','NED',10,'1.WWT','mossa:152'],
 ['Trofeo Alfredo Binda','ITA',11,'1.WWT','collinare:140'],
 ['Piccolo Trofeo Binda Juniores','ITA',11,'MJ','collinare:78'],
 ['Classic Brugge-De Panne','BEL',11,'1.WWT','piatta:150'],
 ['Gent-Wevelgem Women','BEL',12,'1.WWT','pave:160'],
 ['Dwars door Vlaanderen Women','BEL',12,'1.1','pave:125'],
 ['Ronde van Vlaanderen Women','BEL',13,'1.WWT','pave:160'],
 ['Grand Prix Féminin de Chambéry','FRA',13,'1.2','collinare:110'],
 ['Paris-Roubaix Femmes','FRA',14,'1.WWT','roubaix:148'],
 ['Scheldeprijs Women','BEL',14,'1.1','piatta:130'],
 ['Giro Mediterraneo Rosa','ITA',15,'2.2','4:H'],
 ['Amstel Gold Race Women','NED',15,'1.WWT','collinare:155'],
 ['Brabantse Pijl Women','BEL',15,'1.1','collinare:130'],
 ['La Flèche Wallonne Femmes','BEL',16,'1.WWT','collinare:140'],
 ['Liège-Bastogne-Liège Femmes','BEL',16,'1.WWT','collinare:150'],
 ['GP della Liberazione Donne','ITA',17,'1.2','piatta:92'],
 ['Vuelta a Burgos Féminas','ESP',17,'2.WWT','4:H'],
 ['La Vuelta Femenina','ESP',18,'GTF','7:M'],
 ['Ronde de Mouscron','BEL',18,'1.1','piatta:130'],
 ['Itzulia Women','ESP',19,'2.WWT','3:H'],
 ['Emakumeen Nafarroako Klasikoa','ESP',19,'1.1','collinare:120'],
 ['Durango-Durango Emakumeen Saria','ESP',20,'1.1','collinare:115'],
 ['Tour de Bretagne Féminin','FRA',20,'2.1','5:M'],
 ['Tour de Suisse Women','SUI',21,'2.WWT','4:A'],
 ['Tour de Normandie Féminin','FRA',21,'2.2','3:M'],
 ['Tour of Britain Women','GBR',22,'2.WWT','5:M'],
 ['Thüringen Ladies Tour','GER',23,'2.1','6:M'],
 ['Ronde van Gelderland','NED',23,'1.2','piatta:120'],
 ['Campionato Italiano Donne a cronometro','ITA',24,'CN','crono:26'],
 ['Campionato Italiano Donne','ITA',24,'CN','collinare:130'],
 ['Giro d\'Italia Women','ITA',26,'GTF','8:A'],
 ['Gent-Wevelgem Juniores Women','BEL',27,'MJ','pave:75'],
 ['Tour de France Femmes','FRA',29,'GTF','8:A'],
 ['Tour of Scandinavia','NOR',31,'2.WWT','5:M'],
 ['Classic Lorient Agglomération','FRA',32,'1.WWT','mossa:155'],
 ['Simac Ladies Tour','NED',33,'2.WWT','5:F'],
 ['Watersley Ladies Challenge','NED',33,'2.2','3:F'],
 ['Tour de l\'Ardèche','FRA',34,'2.1','6:A'],
 ['Tour de Romandie Féminin','SUI',35,'2.WWT','3:A'],
 ['Giro della Toscana Femminile','ITA',36,'2.2','3:H'],
 ['Tre Valli Varesine Women','ITA',37,'1.1','collinare:128'],
 ['Coppa dei Laghi · Trofeo Almar','ITA',37,'1.2','mossa:112'],
 ['Giro dell\'Emilia Donne','ITA',38,'1.1','collinare:118'],
 ['Chrono des Nations Femmes','FRA',40,'1.1','crono:24']
];
Object.assign(CLS_TIER,{'1.WWT':'uwt1','2.WWT':'uwt2','GTF':'gt'});
Object.assign(CLS_LAB,{'GTF':'2.WWT'});
Object.assign(RACE_REG,{'Strade Bianche Donne':'TOS','Trofeo Oro in Euro':'TOS','Trofeo Ponente in Rosa':'LIG','Trofeo Alfredo Binda':'LOM','Piccolo Trofeo Binda Juniores':'LOM','Giro Mediterraneo Rosa':'SIC','GP della Liberazione Donne':'LAZ','Campionato Italiano Donne a cronometro':'EMR','Campionato Italiano Donne':'EMR','Giro della Toscana Femminile':'TOS','Tre Valli Varesine Women':'LOM','Coppa dei Laghi · Trofeo Almar':'LOM',"Giro dell'Emilia Donne":'EMR'});
/* categorie e licenze: valori diversi per le squadre femminili */
const CAT_SIDE={M:JSON.parse(JSON.stringify(CAT)),F:{
 conti:{lab:'Continental',min:8,max:15,staff:180000,minSal:0,neoSal:0,rank:1},
 pro:{lab:'ProTeam',min:10,max:20,staff:700000,minSal:20000,neoSal:16000,rank:2},
 wt:{lab:'WorldTeam',min:12,max:20,staff:1800000,minSal:35000,neoSal:28000,rank:3}}};
const LIC_SIDE={M:JSON.parse(JSON.stringify(LICENCE)),F:{pro:{income:1500000,rep:40,rank:5},wt:{income:4000000,rep:65,rank:3}}};
function applySideConsts(){const s=(G&&G.side)||'M';for(const k in CAT)Object.assign(CAT[k],CAT_SIDE[s][k]);for(const k in LICENCE)Object.assign(LICENCE[k],LIC_SIDE[s][k])}
const SIDE_LAB={M:'Uomini',F:'Donne'},SIDE_LONG={M:'squadra maschile',F:'squadra femminile'};
const FOUND_COST=80000;

/* ---------- i due mondi ---------- */
const W_KEYS=['teams','riders','races','cat','callups','natSel','camps','bids','academy','history','kmFuga','train','groups','palm','teamView'];
function swapWorld(){
 const o=G.other;
 for(const k of W_KEYS){const t=G[k];G[k]=o[k];o[k]=t}
 const s=G.side;G.side=o.side;o.side=s;
 applySideConsts();
}
/* esegue fn nel mondo dell'altra squadra e torna indietro */
function withOther(fn){
 if(!G||!G.other||G._inOther)return undefined;
 swapWorld();G._inOther=true;
 try{return fn()}finally{G._inOther=false;swapWorld()}
}
function foundOther(){
 if(G.other)return{ok:false,msg:'Hai già due squadre.'};
 if(G.cash<FOUND_COST)return{ok:false,msg:`Servono ${eur(FOUND_COST)} per fondare la squadra.`};
 const side=G.side==='F'?'M':'F';
 G.cash-=FOUND_COST;
 G.other={side,teams:[],riders:{},races:[],cat:'conti',callups:[],natSel:{},camps:[],bids:[],academy:{level:0,focus:(G.academy&&G.academy.focus)||'ITA',log:[]},history:[],kmFuga:0,train:{s1:'fondo',s2:'soglia',last:null},groups:[],palm:null,teamView:'ruoli'};
 swapWorld();
 genWorld();
 G.races=G.races.filter(r=>r.w>G.week);
 const n=ME().riders.length;
 swapWorld();
 mail('DS',`Nasce la ${SIDE_LONG[side]}`,`La ${SIDE_LONG[side]} è iscritta come Continental con ${n} ${side==='F'?'atlete':'corridori'}. Costo di fondazione ${eur(FOUND_COST)}.\n\nAttenzione: sponsor e cassa sono gli stessi. Ingaggi e staff di tutte e due le squadre si pagano con lo stesso budget: controlla il saldo previsto prima di fare mercato.\n\nPassi da una squadra all'altra con il pulsante in alto.`);
 addNews(`Fondata la ${SIDE_LONG[side]}`);
 save();return{ok:true,msg:`${SIDE_LONG[side][0].toUpperCase()+SIDE_LONG[side].slice(1)} fondata`};
}
function switchSide(){if(!G.other||LIVE)return;closeSheet();SEL=null;swapWorld();save();render();window.scrollTo(0,0);toast(`Ora gestisci la ${SIDE_LONG[G.side]}`,'ok')}
function otherInfo(){return withOther(()=>({side:G.side,cat:myCat().lab,n:ME().riders.length,cost:worldCost(),pend:myPending().map(r=>r.name)}))}

/* stagione: anche l'altra squadra passa all'anno nuovo (sale di categoria da sola se ha la licenza) */
const _newSeasonW=newSeason;
newSeason=function(up){
 let oUp=false;
 if(G.other)withOther(()=>{const L=licenceCheck();oUp=!!(L&&L.ok)});
 const out=_newSeasonW(up);
 if(G.other){const o2=withOther(()=>_newSeasonW(oUp))||[];const lab=SIDE_LAB[G.other.side];for(const t of o2){out.push(`${lab}: ${t}`);addNews(`${lab}: ${t}`)}save()}
 return out;
};
/* fine stagione: resoconto anche per l'altra squadra */
const _endOfSeasonW=endOfSeason;
endOfSeason=function(){_endOfSeasonW();if(G.other){const t=withOther(()=>{const L=licenceCheck();return`${SIDE_LONG[G.side]}: ${myCatRank()}ª tra le ${myCat().lab}.`+(L?` Licenza ${CAT[L.to].lab}: ${L.ok?'requisiti raggiunti, la salita è automatica':'requisiti non raggiunti'}.`:'')});mail('DS','Fine stagione: l\'altra squadra',t)}};

/* nazionali femminili: stessi campionati, percorsi più corti, niente Avenir */
const _natRacesW=natRaces;
natRaces=function(season){
 const a=_natRacesW(season);if(!G||G.side!=='F')return a;
 return a.filter(e=>e.champ!=='avenir').map(e=>({...e,f:true,id:e.id+'_f',name:e.name.replace('Elite','Donne Elite').replace('Under 23','Donne Under 23').replace('Juniores','Donne Juniores'),stages:e.stages.map(s=>s.km?{...s,km:Math.round(s.km*(s.t==='crono'?0.7:0.62))}:s),size:Math.min(e.size,6)}));
};
/* le Continental femminili possono essere invitate alle WorldTour di un giorno e brevi */
const _accessW=access;
access=function(race){
 if(race.f&&G.cat==='conti'&&(race.tier==='uwt1'||race.tier==='uwt2'))return{ok:true,mode:'invite',chance:clamp(0.08+G.rep/140+(race.ctry==='ITA'?0.15:0),0.05,0.8)};
 return _accessW(race);
};

/* ---------- interfaccia ---------- */
const _renderTopW=renderTop;
renderTop=function(){
 _renderTopW();
 const sub=$('#top .sub');if(sub&&(G.other||G.side==='F'))sub.insertAdjacentHTML('afterbegin',`<span class="chip ${G.side==='F'?'fem':''}">${SIDE_LAB[G.side]}</span> `);
 if(G.other){const m=$('#top [data-act="menu"]');if(m)m.insertAdjacentHTML('beforebegin',`<button class="btn sidebtn" data-act="side" aria-label="Passa alla ${SIDE_LONG[G.other.side]}">${SIDE_LAB[G.other.side]} ⇄</button>`)}
};
const _renderHomeW=renderHome;
renderHome=function(){
 _renderHomeW();
 if(!G.other)return;
 const o=otherInfo();if(!o||!o.pend.length)return;
 const v=$('#view');v.insertAdjacentHTML('afterbegin',`<button class="banner" data-act="side" style="margin-bottom:12px"><span class="chip ${o.side==='F'?'fem':''}">${SIDE_LAB[o.side]}</span><span><b>La ${SIDE_LONG[o.side]} corre questa settimana</b>: ${o.pend.map(esc).join(', ')}. Passa all'altra squadra per convocare.</span></button>`);
};
function sideCard(){
 if(G.other){const o=otherInfo();
  return`<div class="card pad stack sidecard"><div class="sec-h" style="margin:0"><h3>Le tue due squadre</h3><span class="eyebrow">un solo budget</span></div>
   <div class="kv"><div><small>${SIDE_LAB[G.side]} (ora)</small><b>${myCat().lab}</b><span class="note">${ME().riders.length} · ${eurk(worldCost())}/anno</span></div><div><small>${SIDE_LAB[o.side]}</small><b>${o.cat}</b><span class="note">${o.n} · ${eurk(o.cost)}/anno</span></div><div><small>Sponsor ${SEASON}</small><b>${eurk(incomeIn(SEASON))}</b></div></div>
   <div class="note">Ingaggi, staff e scuola di tutte e due le squadre escono dalla stessa cassa. Le corse di tutte e due vanno corse prima di avanzare.</div>
   <button class="btn" data-act="side">Passa alla ${SIDE_LONG[o.side]}</button></div>`}
 const side=G.side==='F'?'M':'F',C=CAT_SIDE[side].conti;
 return`<div class="card pad stack sidecard"><div class="sec-h" style="margin:0"><h3>Fonda la ${SIDE_LONG[side]}</h3><span class="eyebrow">facoltativo</span></div>
  <div class="note">Puoi gestire anche una ${SIDE_LONG[side]} con calendario, ${side==='F'?'atlete':'corridori'} e categoria propri. <b>Il budget resta uno solo</b>: gli stessi sponsor devono pagare ingaggi e staff di tutte e due. Si parte da Continental (${C.min}–${C.max} ${side==='F'?'atlete':'corridori'}, staff ${eurk(C.staff)}/anno).</div>
  <div class="note">Costo di fondazione ${eur(FOUND_COST)} · costo stimato ${eurk(C.staff+(side==='F'?90000:280000))}/anno · saldo previsto ora ${eur(projected())}</div>
  <button class="btn primary" data-act="foundother" ${G.cash<FOUND_COST?'disabled':''}>Fonda la ${SIDE_LONG[side]}</button></div>`;
}
const _renderBaseW=renderBase;
renderBase=function(){_renderBaseW();$('#view').insertAdjacentHTML('afterbegin',`<div style="margin-bottom:14px">${sideCard()}</div>`)};

/* nuova partita: scelta maschile / femminile */
const _renderIntroW=renderIntro;
renderIntro=function(){
 _renderIntroW();
 const s=window._side||'M';
 const j=$('#view .introR .field:nth-of-type(3)');
 const html=`<div class="field"><span class="eyebrow">Si parte con</span><div class="seg"><button data-act="pickside" data-v="M" aria-pressed="${s==='M'}">Squadra maschile</button><button data-act="pickside" data-v="F" aria-pressed="${s==='F'}">Squadra femminile</button></div>
  <span class="note">Più avanti puoi fondare anche l'altra squadra, ma il budget degli sponsor è uno solo: con gli stessi soldi gestirai due rose, due calendari e due staff.</span></div>`;
 if(j)j.insertAdjacentHTML('afterend',html);else{const r=$('#view .introR');if(r)r.insertAdjacentHTML('afterbegin',html)}
};
const _helpSheetW=helpSheet;
helpSheet=function(){
 _helpSheetW();
 const g=$('#sheet .guide');if(g)g.insertAdjacentHTML('beforeend',`<div class="card pad"><h3>Squadra maschile e femminile</h3><div class="note gtx">All'inizio scegli se partire con la squadra maschile o con quella femminile. Dalle Strutture puoi fondare anche l'altra: ha calendario, atlete o corridori, categoria e licenze propri, ma <b>cassa e sponsor sono gli stessi</b>. Due rose costano di più e il budget non raddoppia: conviene farlo quando gli sponsor bastano per tutte e due.<br>Le corse femminili sono più corte e le squadre più piccole: 6 atlete nelle corse di un giorno, 7 in quelle a tappe. Una Continental femminile ha da 8 a 15 atlete.</div></div>`);
};
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 const a=t.dataset.act;
 if(a==='pickside'){window._side=t.dataset.v;document.querySelectorAll('[data-act="pickside"]').forEach(b=>b.setAttribute('aria-pressed',String(b===t)))}
 else if(a==='side'&&G){switchSide()}
 else if(a==='foundother'&&G){const r=foundOther();toast(r.msg,r.ok?'gold':'bad');render()}
});
if(G){G._inOther=false;G.side=G.side||'M';G.other=G.other||null;applySideConsts();if(G.side==='F'||G.other)render()}
