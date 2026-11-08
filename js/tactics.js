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
 const lead=defaultLead(RC);
 if(!RC.tactic)plan=defaultTactic(RC,c,lead);
 TAC={RC,mode,c,plan,lead,lead2:RC.lead2&&!RC.out.has(RC.lead2)?RC.lead2:null};renderTactic();
}
function renderTactic(){
 const{RC,mode,c,plan}=TAC,race=RC.race;
 const zo=zoneOptions(c),mo=moveOptions(RC);
 const keys=[];
 c.climbs.forEach(cb=>keys.push(`<li><b>km ${Math.round(cb.start)}–${Math.round(cb.top)}</b> GPM ${cb.cat==='HC'?'HC':cb.cat+'ª'} ${esc(cb.name)}: ${km1(cb.len)} km al ${cb.avg.toFixed(1).replace('.',',')}%${cb.top>=c.len-0.2?' (arrivo in salita)':''}</li>`));
 if(c.secN)keys.push(`<li><b>${c.secN} settori</b> di ${c.type==='sterrato'?'sterrato':'pavé'}, i decisivi negli ultimi 60 km</li>`);
 if(c.sprintKm)keys.push(`<li><b>km ${c.sprintKm}</b> traguardo volante (abbuoni e punti)</li>`);
 if(c.pts)keys.push(`<li><b>${c.laps} giri</b> da ${km1(c.len/c.laps)} km · ${c.pts.length} traguardi a punti (5-3-2-1) ogni 2 giri · arrivo doppio (10-6-4-2). Vince chi fa più punti.</li>`);
 {const wx=makeWeather(RC.race,RC.stage);keys.unshift(`<li><b>Meteo</b>: ${esc(wxText(wx))}${wxEffects(wx).length?' — '+wxEffects(wx).join(', '):''}</li>`)}
 keys.push(`<li><b>Tempo massimo</b>: ${Math.round((TIME_CUT[c.type]||0.15)*100)}% sul tempo del vincitore</li>`);
 const ids=race.sel.filter(id=>!RC.out.has(id)).sort((a,b)=>(a===TAC.lead?-1:b===TAC.lead?1:a===TAC.lead2?-1:b===TAC.lead2?1:0));
 const opts=race.sel.filter(id=>!RC.out.has(id)).map(RID).sort((a,b)=>avgSuit(b,race)-avgSuit(a,race));
 const st=RC.stageRace?(race.stages[RC.stage].t==='prologo'?'Prologo':`Tappa ${RC.stage+(race.stages[0].t==='prologo'?0:1)}`):'';
 openSheet(sheetHead(`Tattica · ${esc(race.name)}${st?' · '+st:''} · ${TYPE_LAB[c.type]} · ${km1(c.len)} km`,'Il piano di corsa','Per ogni corridore: come muoversi, dove e quando attaccare. In corsa puoi sempre cambiare con gli ordini radio; "Piano" fa seguire questa tattica.',false)+
 `<div class="pb wrap"><div class="tacgrid"><div class="stack"><div class="card pad"><div class="eyebrow">Percorso</div>${profileSVG(c,320,60)}<ul class="keys">${keys.join('')}</ul></div>
  <div class="note">Consigli: attacca in salita negli ultimi 2–3 km (nel finale), sul pavé a metà dei settori decisivi, dalla fuga negli ultimi 10 km. In pianura gli attacchi lontani vengono ripresi. "Resta entro 1' dalla testa" fa inseguire il corridore se la corsa scappa.</div></div>
 <div class="stack"><div class="card pad leadbox"><div class="eyebrow">Su chi punta la squadra</div>
   <div class="tsel two2"><label><span class="eyebrow">Punta</span><select data-lead="1">${opts.map(r=>`<option value="${r.id}" ${TAC.lead===r.id?'selected':''}>${esc(r.name)} · ${ARCH[r.arch].lab}${r.id===race.cap?' (capitano)':''}${RC.stageRace&&RC.stage>0?' · '+gcGapTxt(RC,r.id):''}</option>`).join('')}</select></label>
   <label><span class="eyebrow">Seconda punta</span><select data-lead="2"><option value="">Nessuna</option>${opts.filter(r=>r.id!==TAC.lead).map(r=>`<option value="${r.id}" ${TAC.lead2===r.id?'selected':''}>${esc(r.name)} · ${ARCH[r.arch].lab}</option>`).join('')}</select></label></div>
   <div class="note">La squadra lavora per la punta: i gregari la scortano e tirano per lei. Non deve essere per forza il capitano: scegli chi è più adatto al percorso${RC.stageRace?' o meglio messo in classifica':''}. La seconda punta è libera di giocarsi la sua occasione.</div></div>
  ${ids.map(id=>{const r=RID(id),p=plan[id];return`<div class="card tacrow"><div class="tn2">${esc(r.name)} ${id===TAC.lead?'<span class="chip amber">Punta</span>':id===TAC.lead2?'<span class="chip u23">Seconda punta</span>':''}${id===race.cap&&id!==TAC.lead?'<span class="chip">Capitano</span>':''}<span class="note">${ARCH[r.arch].lab} · ${ovr(r)}</span></div>
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
 if(a==='tacgo'){const{RC,mode,plan}=TAC;RC.tactic=plan;RC.tacStage=RC.stage;RC.lead=TAC.lead;RC.lead2=TAC.lead2;TAC=null;closeSheet();proceedRace(RC,mode)}
 else if(a==='tacreset'){TAC.plan=defaultTactic(TAC.RC,TAC.c,TAC.lead);renderTactic()}
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
stageCtx=function(RC){const c=_stageCtxL(RC);if(RC.lead&&!RC.out.has(RC.lead))c.capId=RC.lead;c.lead2=RC.lead2&&!RC.out.has(RC.lead2)?RC.lead2:null;return c};
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
