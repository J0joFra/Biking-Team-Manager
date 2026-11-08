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
function defaultTactic(RC,c){
 const cap=RC.race.cap,t=c.type,plan={},capR=RID(cap),sprinter=stats(capR).vol>=62;
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
 else plan=defaultTactic(RC,c);
 TAC={RC,mode,c,plan};renderTactic();
}
function renderTactic(){
 const{RC,mode,c,plan}=TAC,race=RC.race;
 const zo=zoneOptions(c),mo=moveOptions(RC);
 const keys=[];
 c.climbs.forEach(cb=>keys.push(`<li><b>km ${Math.round(cb.start)}–${Math.round(cb.top)}</b> GPM ${cb.cat==='HC'?'HC':cb.cat+'ª'} ${esc(cb.name)}: ${km1(cb.len)} km al ${cb.avg.toFixed(1).replace('.',',')}%${cb.top>=c.len-0.2?' (arrivo in salita)':''}</li>`));
 if(c.secN)keys.push(`<li><b>${c.secN} settori</b> di ${c.type==='sterrato'?'sterrato':'pavé'}, i decisivi negli ultimi 60 km</li>`);
 if(c.sprintKm)keys.push(`<li><b>km ${c.sprintKm}</b> traguardo volante (abbuoni e punti)</li>`);
 if(c.pts)keys.push(`<li><b>${c.laps} giri</b> da ${km1(c.len/c.laps)} km · ${c.pts.length} traguardi a punti (5-3-2-1) ogni 2 giri · arrivo doppio (10-6-4-2). Vince chi fa più punti.</li>`);
 keys.push(`<li><b>Tempo massimo</b>: ${Math.round((TIME_CUT[c.type]||0.15)*100)}% sul tempo del vincitore</li>`);
 const ids=race.sel.filter(id=>!RC.out.has(id)).sort((a,b)=>(a===race.cap?-1:b===race.cap?1:0));
 const st=RC.stageRace?(race.stages[RC.stage].t==='prologo'?'Prologo':`Tappa ${RC.stage+(race.stages[0].t==='prologo'?0:1)}`):'';
 openSheet(sheetHead(`Tattica · ${esc(race.name)}${st?' · '+st:''} · ${TYPE_LAB[c.type]} · ${km1(c.len)} km`,'Il piano di corsa','Per ogni corridore: come muoversi, dove e quando attaccare. In corsa puoi sempre cambiare con gli ordini radio; "Piano" fa seguire questa tattica.',false)+
 `<div class="pb wrap"><div class="tacgrid"><div class="stack"><div class="card pad"><div class="eyebrow">Percorso</div>${profileSVG(c,320,60)}<ul class="keys">${keys.join('')}</ul></div>
  <div class="note">Consigli: attacca in salita negli ultimi 2–3 km (nel finale), sul pavé a metà dei settori decisivi, dalla fuga negli ultimi 10 km. In pianura gli attacchi lontani vengono ripresi. "Resta entro 1' dalla testa" fa inseguire il corridore se la corsa scappa.</div></div>
 <div class="stack">${ids.map(id=>{const r=RID(id),p=plan[id];return`<div class="card tacrow"><div class="tn2">${esc(r.name)} ${id===race.cap?'<span class="chip amber">Capitano</span>':''}<span class="note">${ARCH[r.arch].lab} · ${ovr(r)}</span></div>
   <div class="tsel"><label><span class="eyebrow">Movimento</span><select data-tac="${id}" data-k="move">${mo.map(k=>`<option value="${k}" ${p.move===k?'selected':''}>${MOVES[k]}</option>`).join('')}</select></label>
   <label><span class="eyebrow">Attacco</span><select data-tac="${id}" data-k="zone">${zo.map(([k,l])=>`<option value="${k}" ${p.zone===k?'selected':''}>${esc(l)}</option>`).join('')}</select></label>
   <label><span class="eyebrow">Quando</span><select data-tac="${id}" data-k="when" ${p.zone==='none'||p.zone==='sprint'?'disabled':''}>${Object.keys(WHENS).map(k=>`<option value="${k}" ${p.when===k?'selected':''}>${WHENS[k]}</option>`).join('')}</select></label></div></div>`}).join('')}</div></div></div>
 <div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="tacreset">Piano dell'ammiraglia</button>${RC.stage===0?'<button class="btn ghost" data-act="tacback">Convocazioni</button>':''}<span style="flex:1"></span><button class="btn primary big" data-act="tacgo">${mode==='sim'?'Simula la corsa':RC.stage===0?'Via!':'Via alla tappa'}</button></div></div>`,'wide');
}
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
 if(a==='tacgo'){const{RC,mode,plan}=TAC;RC.tactic=plan;RC.tacStage=RC.stage;TAC=null;closeSheet();proceedRace(RC,mode)}
 else if(a==='tacreset'){TAC.plan=defaultTactic(TAC.RC,TAC.c);renderTactic()}
 else if(a==='tacback'){const race=TAC.RC.race;for(const r of TAC.RC.field)if(r.team!=='t0'){r.bF=0;r.bT=0}TAC=null;SEL={race,ids:new Set(race.sel),cap:race.cap};renderConvoca()}
});
