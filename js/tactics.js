"use strict";
/* ============================================================
   TATTICA PRE-GARA: dopo le convocazioni, prima del via
   ============================================================ */
let TAC=null;
function zoneOptions(c){
 const o=[['none','Nessun attacco']];
 if(c.climbs.length){const L=c.climbs[c.climbs.length-1];o.push(['last',`Ultima salita: ${L.name}`]);c.climbs.forEach((cb,i)=>{if(i<c.climbs.length-1&&cb.cat!=='4')o.push(['climb:'+i,`${cb.name} (km ${Math.round(cb.start)})`])})}
 if(c.secN)o.push(['pave',c.type==='sterrato'?'Settori di sterrato':'Settori di pavé']);
 o.push(['k25','Ultimi 25 km'],['k10','Ultimi 10 km'],['sprint',c.type==='circuito'?'Traguardi a punti e volata':'Volata finale']);
 return o;
}
function moveOptions(RC){return Object.keys(MOVES).filter(k=>k!=='maglia'||(RC.stageRace&&RC.stage>0))}
function defaultTactic(RC,c,lead){
 const cap=lead||RC.lead||RC.race.cap,t=c.type,plan={},capR=RID(cap),sprinter=stats(capR).vol>=62;
 const zone=t==='piatta'||t==='circuito'?(sprinter?'sprint':'k10'):t==='mossa'?(sprinter?'sprint':'last'):['pave','roubaix','sterrato'].includes(t)?'pave':c.climbs.length?'last':'k10';
 plan[cap]={move:'gruppo',zone,when:zone==='pave'?'mid':'end'};
 const doms=RC.race.sel.filter(id=>id!==cap&&!RC.out.has(id)).map(RID).sort((a,b)=>ovr(b)-ovr(a));
 doms.forEach((r,i)=>{
  let move='gruppo',z='none';
  if(t==='circuito')move=i===0?'fuga':'gruppo';
  else if(i<2)move='scorta';
  else if(i<4)move=sprinter||t==='montagna'||t==='collinare'?'tira':'copri';
  else if(['piatta','mossa','pave','sterrato'].includes(t))move='fuga';
  if(t==='circuito'&&i===0)z='sprint';
  plan[r.id]={move,zone:z,when:'mid'};
 });
 return plan;
}
function openTactic(RC,mode){
 if(RC.nat){proceedRace(RC,mode);return}
 const ctx=stageCtx(RC),c=ctx.course;
 if(!ROAD(c.type)){proceedRace(RC,mode);return}
 let plan;
 if(RC.tactic){plan=JSON.parse(JSON.stringify(RC.tactic));for(const id in plan)if(plan[id].zone.startsWith('climb:')&&RC.tacStage!==RC.stage)plan[id].zone='last';
  for(const id of RC.race.sel)if(!plan[id]&&!RC.out.has(id))plan[id]={move:'gruppo',zone:'none',when:'mid'}}
 if(RC.race.mode==='singles'){TAC={RC,mode,c,plan:RC.tactic?plan:singlesPlan(RC,c)};renderTactic();return}
 const lead=defaultLead(RC);
 TAC={RC,mode,c,plan,lead,lead2:RC.lead2&&!RC.out.has(RC.lead2)?RC.lead2:null,obj:RC.obj||suggestObj(c,lead),atk:null,atk2:null};
 if(!RC.tactic||RC.tacStage!==RC.stage){TAC.obj=suggestObj(c,lead);applyObj()}
 renderTactic();
}
const OBJ={volata:{lab:'Volata',d:'Squadra compatta, treno nel finale: la punta fa lo sprint'},attacco:{lab:'Attacco',d:'Selezione in salita o sul pavé: la punta attacca nel momento scelto'},fuga:{lab:'Fuga',d:'Due uomini in fuga da lontano, la punta aspetta coperta'},attesa:{lab:'Attesa',d:'Corsa coperta: si controllano i rivali senza rischi'}};
const ROLE_BTN=[['scorta','Scorta'],['tira','Tira'],['fuga','Fuga'],['copri','Copri'],['gruppo','Libero']];
const ROLE_HELP={scorta:'resta con la punta e la riporta sotto',tira:'tira per la punta nel finale',fuga:'prova ad andare in fuga',copri:'risponde agli scatti dei rivali',gruppo:'resta coperto e si gioca le sue carte',vicino:'resta entro 1\' dalla testa'};
function atkMoments(c){
 const o=[];
 if(['piatta','circuito','mossa'].includes(c.type))o.push(['sprint|end','Volata finale']);
 if(c.climbs.length){const L=c.climbs[c.climbs.length-1];o.push(['last|start',`Ai piedi dell'ultima salita`],['last|end',`Ultimi 2 km dell'ultima salita`]);
  c.climbs.forEach((cb,i)=>{if(i<c.climbs.length-1&&cb.cat!=='4'&&c.len-cb.top<70)o.push([`climb:${i}|mid`,`Su ${cb.name}`])})}
 if(c.secN)o.push(['pave|start','Primo settore decisivo'],['pave|end','Ultimo settore']);
 o.push(['k10|mid','Ultimi 10 km'],['none|mid','Nessun attacco']);
 return o;
}
function suggestObj(c,lead){const r=RID(lead),t=c.type,sp=stats(r).vol>=62;if(t==='piatta'||t==='circuito')return sp?'volata':'fuga';if(t==='mossa')return sp?'volata':'attacco';return'attacco'}
function defaultAtk(c,obj){if(obj==='volata')return'sprint|end';if(obj==='attesa')return'none|mid';if(['pave','roubaix','sterrato'].includes(c.type)&&c.secN)return'pave|end';if(c.climbs.length)return'last|end';return'k10|mid'}
function applyObj(){
 const{RC,c,obj,lead,lead2}=TAC,plan={};
 if(!TAC.atk)TAC.atk=defaultAtk(c,obj);
 const[z,w]=TAC.atk.split('|');
 plan[lead]={move:obj==='attesa'?'vicino':'gruppo',zone:z,when:w};
 if(lead2){const[z2,w2]=(TAC.atk2||'k10|mid').split('|');plan[lead2]={move:obj==='fuga'?'fuga':'gruppo',zone:obj==='volata'?'none':z2,when:w2}}
 const doms=RC.race.sel.filter(id=>id!==lead&&id!==lead2&&!RC.out.has(id)).map(RID).sort((a,b)=>ovr(b)-ovr(a));
 doms.forEach((r,i)=>{const m=obj==='volata'?(i<1?'scorta':i<3?'tira':'copri'):obj==='attacco'?(i<2?'scorta':i<4?'tira':'fuga'):obj==='fuga'?(i<2?'fuga':i<3?'scorta':'copri'):(i<2?'scorta':'copri');plan[r.id]={move:m,zone:'none',when:'mid'}});
 TAC.plan=plan;
}
function singlesPlan(RC,c){const plan={};for(const id of RC.race.sel){if(RC.out.has(id))continue;const r=RID(id),sp=stats(r).vol>=62&&['piatta','mossa','circuito'].includes(c.type);plan[id]={move:'gruppo',zone:sp?'sprint':c.climbs.length?'last':'k10',when:'end'}}return plan}
function chipRow(items,act,cur,extra=''){return`<div class="rchips">${items.map(([k,l,sub])=>`<button class="rchip" data-act="${act}" data-v="${k}" ${extra} aria-pressed="${cur===k}"><b>${esc(l)}</b>${sub?`<small>${esc(sub)}</small>`:''}</button>`).join('')}</div>`}
function renderTactic(){
 const{RC,mode,c,plan}=TAC,race=RC.race,singles=race.mode==='singles';
 const keys=[];
 {const wx=makeWeather(RC.race,RC.stage);keys.push(`<li><b>Meteo</b>: ${esc(wxText(wx))}${wxEffects(wx).length?' — '+wxEffects(wx).join(', '):''}</li>`)}
 c.climbs.forEach(cb=>keys.push(`<li><b>km ${Math.round(cb.start)}</b> ${esc(cb.name)}: ${km1(cb.len)} km al ${cb.avg.toFixed(1).replace('.',',')}%${cb.top>=c.len-0.2?' (arrivo in salita)':` · a ${Math.round(c.len-cb.top)} km dall'arrivo`}</li>`));
 if(c.secN)keys.push(`<li><b>${c.secN} settori</b> di ${c.type==='sterrato'?'sterrato':'pavé'}</li>`);
 if(c.pts)keys.push(`<li><b>${c.laps} giri</b>: traguardi a punti ogni 2 giri, arrivo doppio</li>`);
 const st=RC.stageRace?(race.stages[RC.stage].t==='prologo'?'Prologo':`Tappa ${RC.stage+(race.stages[0].t==='prologo'?0:1)}`):'';
 const riders=race.sel.filter(id=>!RC.out.has(id)).map(RID).sort((a,b)=>avgSuit(b,race)-avgSuit(a,race));
 const mom=atkMoments(c);
 const nm=r=>esc(r.name.split(' ').slice(-1)[0]);
 let right,below='';
 const sel=(act,v,opts,id)=>`<select class="tsel" data-tact="${act}"${id?` data-id="${id}"`:''}>${opts.map(([k,l])=>`<option value="${k}" ${v===k?'selected':''}>${esc(l)}</option>`).join('')}</select>`;
 const rad=(on,act,v)=>`<button class="tradio" data-act="${act}" data-v="${v}" aria-pressed="${on}"><span class="radio ${on?'on':''}"></span></button>`;
 if(singles){
  right='';below=`<div style="margin-top:12px"><div class="eyebrow">Piano dei singoli · ognuno corre per sé</div>${DT(TH([['Corridore'],['Come corre'],['Quando attacca']]),riders.map(r=>{const p=plan[r.id];return`<tr><td><b>${esc(r.name)}</b><div class="tm">${ARCH[r.arch].lab} · ${ovr(r)}</div></td>
   <td>${sel('tacrole',p.move,[['gruppo','Aspetta in gruppo'],['fuga','Va in fuga'],['copri','Marca i rivali']],r.id)}</td><td>${sel('tacatkr',`${p.zone}|${p.when}`,mom,r.id)}</td></tr>`}).join(''),'tac')}</div>`;
 }else{
  const lead=RID(TAC.lead),lead2=TAC.lead2?RID(TAC.lead2):null;
  const atkOn=TAC.obj!=='attesa',atk2On=lead2&&TAC.obj!=='volata';
  right=`<div><div class="eyebrow">1 · Obiettivo della corsa</div>${DT('',Object.keys(OBJ).map(k=>`<tr data-act="tacobj" data-v="${k}" class="${TAC.obj===k?'sel':''}"><td style="width:28px"><span class="radio ${TAC.obj===k?'on':''}"></span></td><td><b>${OBJ[k].lab}</b></td><td class="tm">${OBJ[k].d}</td></tr>`).join(''),'tac')}</div>
`;
  below=`<div style="margin-top:12px"><div class="eyebrow">2 · Piano dei corridori</div>${DT(TH([['Corridore'],['Punta','c'],['2ª','c'],['Compito'],['Attacco']]),riders.map(r=>{const isL=r.id===TAC.lead,isL2=r.id===TAC.lead2,p=plan[r.id]||{move:'gruppo'};
   const task=isL?'<b class="pos">Punta</b>':isL2?'<b>Seconda punta</b>':sel('tacrole',p.move,ROLE_BTN,r.id);
   const atk=isL&&atkOn?sel('tacatk',TAC.atk,mom):isL2&&atk2On?sel('tacatk2',TAC.atk2||'k10|mid',mom):'<span class="tm">—</span>';
   return`<tr class="${isL?'sel':''}"><td>${personCell(r)}<div class="tm pcs">${ARCH[r.arch].lab} · adatto ${Math.round(avgSuit(r,race))}${r.id===race.cap?' · capitano':''}${RC.stageRace&&RC.stage>0?' · '+gcGapTxt(RC,r.id):''}</div></td>
   <td class="c">${rad(isL,'taclead',r.id)}</td><td class="c">${isL?'':rad(isL2,'taclead2',isL2?'':r.id)}</td><td>${task}</td><td>${atk}</td></tr>`}).join(''),'tac')}</div>`;
 }
 openSheet(sheetHead(`Tattica · ${esc(race.name)}${st?' · '+st:''}`,singles?'Piano dei singoli':'Il piano di corsa',`${TYPE_LAB[c.type]} · ${km1(c.len)} km · tempo massimo +${Math.round((TIME_CUT[c.type]||0.15)*100)}%. In corsa puoi cambiare tutto con gli ordini radio.`,false)+
 `<div class="pb wrap"><div class="tacgrid"><div class="stack"><div><div class="eyebrow">Percorso</div><div class="card pad" style="padding:8px">${profileSVG(c,320,60)}</div>${DT('',keys.map(k=>k.replace(/^<li><b>(.*?)<\/b>:?\s*(.*)<\/li>$/,'<tr><td class="nowrap"><b>$1</b></td><td class="tm">$2</td></tr>')).join(''),'tac')}</div></div>
 <div class="stack">${right}</div></div>${below}</div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="tacreset">Piano consigliato</button>${RC.stage===0?'<button class="btn ghost" data-act="tacback">Convocazioni</button>':''}<span style="flex:1"></span><button class="btn primary big" data-act="tacgo">${mode==='sim'?'Simula la corsa':RC.stage===0?'Via!':'Via alla tappa'}</button></div></div>`,'wide');
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!TAC)return;
 const a=t.dataset.act,v=t.dataset.v,keep=()=>{const sc=$('#sheet .pb').scrollTop;renderTactic();$('#sheet .pb').scrollTop=sc};
 if(a==='tacobj'){TAC.obj=v;TAC.atk=null;applyObj();keep()}
 else if(a==='taclead'){TAC.lead=v;if(TAC.lead2===v)TAC.lead2=null;applyObj();keep()}
 else if(a==='taclead2'){TAC.lead2=v||null;applyObj();keep()}
 else if(a==='tacatk'){TAC.atk=v;const[z,w]=v.split('|');TAC.plan[TAC.lead].zone=z;TAC.plan[TAC.lead].when=w;keep()}
 else if(a==='tacatk2'){TAC.atk2=v;const[z,w]=v.split('|');if(TAC.lead2){TAC.plan[TAC.lead2].zone=z;TAC.plan[TAC.lead2].when=w}keep()}
 else if(a==='tacatkr'){const[z,w]=v.split('|');const p=TAC.plan[t.dataset.id];p.zone=z;p.when=w;keep()}
 else if(a==='tacrole'){TAC.plan[t.dataset.id].move=v;keep()}
});
function proceedRace(RC,mode){
 if(mode==='sim'){simAsync(RC);return}
 if(!LIVE)LIVE={RC,S:null,speed:25,playing:true,acc:0,last:0,lastUI:0,zoom:false,course:null};
 startStageLive();
}
document.addEventListener('change',e=>{
 const t=e.target;if(!t.dataset.tac||!TAC)return;
 TAC.plan[t.dataset.tac][t.dataset.k]=t.value;
 if(t.dataset.k==='zone'){const sc=$('#sheet .pb').scrollTop;renderTactic();$('#sheet .pb').scrollTop=sc}
});
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!TAC)return;
 const a=t.dataset.act;
 if(a==='tacgo'){const{RC,mode,plan}=TAC;RC.tactic=plan;RC.tacStage=RC.stage;RC.lead=TAC.lead||null;RC.lead2=TAC.lead2||null;RC.obj=TAC.obj;TAC=null;closeSheet();proceedRace(RC,mode)}
 else if(a==='tacreset'){if(TAC.RC.race.mode==='singles')TAC.plan=singlesPlan(TAC.RC,TAC.c);else{TAC.obj=suggestObj(TAC.c,TAC.lead);TAC.atk=null;TAC.atk2=null;applyObj()}renderTactic()}
 else if(a==='tacback'){const race=TAC.RC.race;for(const r of TAC.RC.field)if(r.team!=='t0'){r.bF=0;r.bT=0}TAC=null;SEL={race,ids:new Set(race.sel),cap:race.cap};renderConvoca()}
});

/* ---------- punta della corsa ---------- */
function gcGapTxt(RC,id){const o=gcOrder(RC);const i=o.findIndex(x=>x.id===id);return i<0?'':`${i+1}° a ${fmtGap(o[i].t-o[0].t)}`}
function defaultLead(RC){
 if(RC.lead&&!RC.out.has(RC.lead))return RC.lead;
 const race=RC.race,mine=race.sel.filter(id=>!RC.out.has(id));
 if(RC.stageRace&&RC.stage>0){const t=race.stages[RC.stage].t;const o=gcOrder(RC).filter(x=>mine.includes(x.id));
  if(['montagna','collinare','crono'].includes(t)&&o.length&&o[0].t-gcOrder(RC)[0].t<240)return o[0].id;
  if(t==='piatta'){const sp=mine.map(RID).sort((a,b)=>suitType(b,'piatta')-suitType(a,'piatta'))[0];if(sp)return sp.id}}
 return mine.includes(race.cap)?race.cap:mine[0];
}
const _stageCtxL=stageCtx;
stageCtx=function(RC){const c=_stageCtxL(RC);if(RC.race.mode==='singles'){c.entrants=c.entrants.map(e=>e.r.team==='t0'?{r:e.r,team:'si_'+e.r.id}:e);c.capId=null;c.lead2=null;return c}if(RC.lead&&!RC.out.has(RC.lead))c.capId=RC.lead;c.lead2=RC.lead2&&!RC.out.has(RC.lead2)?RC.lead2:null;return c};
const _createSimL=createSim;
createSim=function(ctx){
 const S=_createSimL(ctx);
 const L=ctx.capId&&S.byId[ctx.capId];
 if(L&&L.isMe){const p=S.plans[L.team];p.lead=L;for(const x of S.byTeam[L.team])x.role=x===L?'lead':x.id===ctx.lead2?'free':'dom';
  const t=S.type,st=stats(L.r);p.goal=t==='piatta'||t==='circuito'?(st.vol>=58?'sprint':'break'):t==='mossa'?((st.vol>=62&&st.sal<72)?'sprint':'hill'):t==='montagna'?'gc':'hill';
  if(S.stageRace&&L.gcGap<240&&['montagna','collinare','mossa','sterrato'].includes(t))p.goal='gc'}
 return S;
};
document.addEventListener('change',e=>{
 const t=e.target;if(!t.dataset.lead||!TAC)return;
 if(t.dataset.lead==='1'){TAC.lead=t.value;if(TAC.lead2===TAC.lead)TAC.lead2=null;TAC.plan=defaultTactic(TAC.RC,TAC.c,TAC.lead);if(TAC.lead2&&TAC.plan[TAC.lead2])TAC.plan[TAC.lead2]={move:'gruppo',zone:TAC.plan[TAC.lead].zone,when:'mid'}}
 else{TAC.lead2=t.value||null;if(TAC.lead2)TAC.plan[TAC.lead2]={move:'gruppo',zone:TAC.plan[TAC.lead]?TAC.plan[TAC.lead].zone:'k10',when:'mid'}}
 const sc=$('#sheet .pb').scrollTop;renderTactic();$('#sheet .pb').scrollTop=sc;
});

const _TEAMs=TEAM;
TEAM=function(id){if(typeof id==='string'&&id.startsWith('si_')){const r=RID(id.slice(3));return{id,name:(r?r.name:'Individuale')+' (individuale)',short:G.teams[0].short,tier:'si',nats:[]}}return _TEAMs(id)};

/* i menu a tendina della tattica usano le stesse azioni dei pulsanti */
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset||!t.dataset.tact||!TAC)return;const b=document.createElement('button');b.hidden=true;b.dataset.act=t.dataset.tact;b.dataset.v=t.value;if(t.dataset.id)b.dataset.id=t.dataset.id;$('#sheet').appendChild(b);b.click();b.remove()});
