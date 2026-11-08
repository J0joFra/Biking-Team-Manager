"use strict";
/* ============================================================
   ALLENAMENTI: due sedute a settimana nelle settimane senza gare
   ============================================================ */
function trainState(){if(!G.train)G.train={s1:'fondo',s2:'soglia',last:null};return G.train}
function trainGrowth(r){return r.age<=22?1.3*(0.5+(r.pot||0)):r.age<=27?0.7:r.age<=31?0.4:0.15}
function teamRacingWeek(w){return G.races.some(r=>(r.status==='reg'||(r.status==='done'&&r.result&&r.result.mine))&&r.w<=w&&r.w+r.dur-1>=w)}
function applySession(r,key){
 const T=TRAIN[key],e=T.eff,g=trainGrowth(r)*rnd(0.7,1.3);
 if(e.wkg)r.wkg=+(r.wkg+e.wkg*g*Math.max(0.2,(6.5-r.wkg)/1.2)).toFixed(4);
 if(e.spr)r.spr=Math.round(r.spr+e.spr*g*Math.max(0.2,(1850-r.spr)/500));
 if(e.endu)r.endu=Math.min(99,+(r.endu+e.endu*g).toFixed(2));
 if(e.tt)r.tt=Math.max(0.198,+(r.tt+e.tt*g).toFixed(4));
 if(e.mass)r.mass=Math.max(52,+(r.mass+e.mass*g).toFixed(2));
 r.fat=clamp(r.fat+T.fat*(T.fat>0?1.1-r.rec/250:1),0,100);
 if(T.fat>0){if(r.fat>60){r.form=Math.max(0.9,r.form-0.006);if(R()<0.004)injure(r,rint(1,2),G.week)}else r.form=Math.min(1.045,r.form+0.002)}
}
function weeklyTraining(w){
 const T=trainState();
 if(teamRacingWeek(w)){T.last={w,skip:true};return}
 const rs=ME().riders.map(RID).filter(r=>!injured(r,w)&&!inCamp(r,w,w)),before={},lines=[];
 for(const r of rs){before[r.id]=stats(r);applySession(r,T.s1);applySession(r,r.focus&&TRAIN[r.focus]?r.focus:T.s2)}
 for(const r of rs){const a=before[r.id],b=stats(r);const d=['sal','pia','cro','vol','res'].filter(k=>b[k]>a[k]).map(k=>`${k.toUpperCase()} +${b[k]-a[k]}`);if(d.length)lines.push(`${r.name}: ${d.join(', ')}`)}
 T.last={w,lines,s1:T.s1,s2:T.s2,n:rs.length};
}
function trainCard(){
 const T=trainState(),w=G.week,racing=teamRacingWeek(w);
 const opt=(k)=>Object.keys(TRAIN).map(x=>`<option value="${x}" ${T[k]===x?'selected':''}>${TRAIN[x].lab}</option>`).join('');
 const last=T.last&&T.last.w===w-1?T.last:null;
 return`<div class="card pad stack"><div class="sec-h" style="margin:0"><h3>Allenamenti · settimana ${w}</h3><span class="eyebrow">${racing?'settimana di gara':'2 sedute'}</span></div>
  ${racing?'<div class="note">La squadra corre questa settimana: niente sedute, solo recupero e rifinitura.</div>':`
  <div class="tgrid"><div class="field"><label class="eyebrow" for="ts1">Martedì</label><select id="ts1" data-tr="s1">${opt('s1')}</select><span class="note">${TRAIN[T.s1].desc}</span></div>
  <div class="field"><label class="eyebrow" for="ts2">Giovedì</label><select id="ts2" data-tr="s2">${opt('s2')}</select><span class="note">${TRAIN[T.s2].desc}</span></div></div>
  <div class="note">Valgono per tutti tranne infortunati e chi è in ritiro. Il giovedì un corridore può avere un programma individuale (dalla sua scheda). I giovani migliorano di più; troppa fatica abbassa la forma e aumenta il rischio d'infortunio.</div>`}
  ${last?last.skip?'':`<div class="note"><b>Settimana scorsa</b> (${TRAIN[last.s1].lab}, ${TRAIN[last.s2].lab}): ${last.lines.length?last.lines.slice(0,4).map(esc).join(' · ')+(last.lines.length>4?` e altri ${last.lines.length-4}`:''):'nessun miglioramento visibile, ma il lavoro si accumula.'}</div>`:''}
 </div>`;
}
function focusBlock(r){
 if(r.team!=='t0')return'';
 return`<div class="card pad stack"><div class="eyebrow">Programma individuale (seduta del giovedì)</div><select id="focus_${r.id}" data-focus="${r.id}"><option value="team" ${!r.focus||r.focus==='team'?'selected':''}>Come la squadra</option>${Object.keys(TRAIN).map(k=>`<option value="${k}" ${r.focus===k?'selected':''}>${TRAIN[k].lab}</option>`).join('')}</select><div class="note">Età ${r.age}: ${r.age<=22?'cresce molto con il lavoro specifico':r.age<=27?'margini di crescita buoni':r.age<=31?'mantiene, cresce poco':'serve a non calare'}.</div></div>`;
}
document.addEventListener('change',e=>{
 const t=e.target;
 if(t.dataset.tr){trainState()[t.dataset.tr]=t.value;save();render();return}
 if(t.dataset.focus){const r=RID(t.dataset.focus);r.focus=t.value==='team'?null:t.value;save();toast('Programma aggiornato','ok')}
});
