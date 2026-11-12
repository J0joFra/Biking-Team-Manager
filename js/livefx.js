"use strict";
/* ============================================================
   GARA DAL VIVO: icone al posto del testo
   meteo, vento, prossimo traguardo, consigli, gruppi
   ============================================================ */
Object.assign(IC2,{
 battery:'<rect x="2" y="7" width="17" height="10" rx="2"/><path d="M22 10v4"/>',
 speed:'<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-6"/>',
 grade:'<path d="M3 19L21 7v12z"/>',
 radio:'<path d="M5 11a9 9 0 0 1 14 0M8 14a5 5 0 0 1 8 0"/><circle cx="12" cy="17" r="1.5"/>',
 team:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14.5c3 .2 5.5 2.6 5.5 5.5"/>',
 flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',finish:'<path d="M5 21V4"/><path d="M5 4h14v8H5"/><path d="M9 4v8M13 4v8M17 4v8M5 8h14"/>',
 warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',go:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
 clockw:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
});
/* ---------- meteo ---------- */
function wxIcon(k,s=18){
 const sun=(c='#F5B301')=>`<circle cx="12" cy="12" r="4.5" fill="${c}"/><g stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></g>`;
 const cloud=(c='#9AA3AF',y=0)=>`<path d="M7 ${18+y}a4.5 4.5 0 0 1-.4-9 6 6 0 0 1 11.5 1.6A3.7 3.7 0 0 1 17.5 ${18+y}z" fill="${c}"/>`;
 const drops=(n,c='#3B82F6')=>`<g stroke="${c}" stroke-width="2" stroke-linecap="round">${[[8,19],[12,20],[16,19],[10,22],[14,22]].slice(0,n).map(([x,y])=>`<path d="M${x} ${y}l-1 2.5"/>`).join('')}</g>`;
 const flake=(x,y,c='#60A5FA')=>`<g stroke="${c}" stroke-width="1.6" stroke-linecap="round"><path d="M${x} ${y-3}v6M${x-2.6} ${y-1.5}l5.2 3M${x-2.6} ${y+1.5}l5.2-3"/></g>`;
 const body={sole:sun(),caldo:sun('#EF6C00'),nuvole:`<g transform="translate(-2,-3) scale(.75)">${sun()}</g>`+cloud(),
  vento:cloud('#9AA3AF',-3)+'<g stroke="#64748B" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M3 19h11a2 2 0 1 0-2-2M3 22h15"/></g>',
  pioggia:`<g transform="translate(0,-3)">${cloud('#8B95A5')}</g>`+drops(3),diluvio:`<g transform="translate(0,-4)">${cloud('#5B6472')}</g>`+drops(5,'#2563EB')+'<path d="M13 13l-2 4h3l-2 4" stroke="#F5B301" stroke-width="1.8" fill="none" stroke-linejoin="round"/>',
  freddo:`<g transform="translate(0,-4)">${cloud('#8B95A5')}</g>`+drops(2)+flake(16,20),neve:`<g transform="translate(0,-5)">${cloud('#A3ADBC')}</g>`+flake(8,19)+flake(16,20)}[k]||sun();
 return`<svg class="wxic" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true">${body}</svg>`;
}
function windCol(w){return w>=30?'var(--danger)':w>=18?'var(--amber)':'var(--ok)'}
function windIcon(w,s=16){return`<span class="wnd" style="color:${windCol(w)}" title="Vento ${w} km/h"><svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 8h10a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/></svg><small>${w}</small></span>`}
function tempCol(t){return t<=6?'#3B82F6':t>=30?'var(--danger)':t>=24?'var(--amber)':'var(--ink)'}
wxChip=function(wx){if(!wx)return'';return`<span class="wxbox" title="${esc(wxText(wx))}">${wxIcon(wx.k)}<b style="color:${tempCol(wx.temp)}">${wx.temp}°</b>${windIcon(wx.wind)}${wxEffIcons(wx)}</span>`};
function wxEffIcons(wx){const W=WX[wx.k],o=[];
 if(W.crash>1)o.push(`<span class="wfx" title="Rischio cadute ×${W.crash}" style="color:${W.crash>=3?'var(--danger)':'var(--amber)'}">${ic2('warn',13)}×${W.crash}</span>`);
 if(W.draft<1)o.push(`<span class="wfx" title="Ventagli: la scia conta meno" style="color:var(--amber)">${ic2('team',13)}</span>`);
 if(W.drain>1.1)o.push(`<span class="wfx" title="Si consuma più energia" style="color:var(--amber)">${ic2('battery',13)}−</span>`);
 return o.join('')}
wxTip=function(){return null};
/* ---------- consigli: una frase, con icona ---------- */
const _dsTipsF=dsTips;
dsTips=function(S){return _dsTipsF(S).slice(0,2).map(t=>({k:t.k,t:(t.t.match(/^[^.!?:]*[.!?:]?(?=\s|$)/)||[t.t])[0].replace(/[:.]$/,'')}))};
/* ---------- prossimo traguardo e gruppi ---------- */
function nextHtml(S){
 const lead=S.clusters.length?S.clusters[0].front:0,c=S.course,out=[];
 const nc=nextClimb(S,lead);
 if(nc)out.push({km:Math.max(0,nc.start-lead),h:nc.start>lead?`${ic2('montagna',14)} <b>${nc.cat==='HC'?'HC':nc.cat+'ª'}</b> ${esc(nc.name)} · ${km1(nc.start-lead)} km <span class="tm">${km1(nc.len)} km · ${nc.avg.toFixed(1).replace('.',',')}%</span>`:`${ic2('montagna',14)} ${esc(nc.name)} · cima a ${km1(nc.top-lead)} km`});
 const i0=gi(S,lead);
 if(c.surf[i0])out.push({km:0,h:`${ic2(c.surf[i0]===1?'pave':'sterrato',14)} ${c.surf[i0]===1?'Pavé':'Sterrato'}`});
 else for(let i=i0;i<c.N;i++)if(c.surf[i]){out.push({km:(i-i0)/10,h:`${ic2(c.surf[i]===1?'pave':'sterrato',14)} ${km1((i-i0)/10)} km`});break}
 if(c.sprintKm&&c.sprintKm>lead)out.push({km:c.sprintKm-lead,h:`${ic2('flag',14)} Volante · ${km1(c.sprintKm-lead)} km`});
 out.sort((a,b)=>a.km-b.km);
 let h=out[0]?out[0].h:`${ic2('finish',14)} Arrivo · ${km1(S.len-lead)} km`;
 if(S.ptsLines&&S.ptsLines.length){const j=S.ptsLines.findIndex(k=>k>lead);h=`${ic2('flag',14)} ${j>=0?`Punti ${j+1}/${S.ptsLines.length} · ${km1(S.ptsLines[j]-lead)} km`:'Volata finale · punti doppi'}`}
 if(S.allow&&S.clusters.length>1){const late=(S.byTeam.t0||[]).filter(x=>!x.finished&&gapSec(S,x.pos)>S.allow*0.7);h+=` <span class="tcut" title="Tempo massimo">${ic2('clockw',13)} +${Math.round(S.allow/60)}'</span>`+(late.length?` <span class="neg">${ic2('warn',13)} ${late.map(rname).join(', ')}</span>`:'')}
 return h;
}
const _updateRaceUIF=updateRaceUI;
updateRaceUI=function(){
 _updateRaceUIF();
 const S=LIVE&&LIVE.S;if(!S)return;
 const np=$('#nextp');if(np)np.innerHTML=nextHtml(S);
 document.querySelectorAll('#grps .gn .gc').forEach(g=>{const m=g.textContent.match(/^(\d+) corridor/);if(m)g.innerHTML=`${ic2('team',12)} ${m[1]}`});
 const tips=$('#tips');if(tips)tips.innerHTML=dsTips(S).map(t=>`<div class="tip ${t.k}">${ic2(t.k==='warn'?'warn':t.k==='go'?'go':'flag',14)}<span>${esc(t.t)}</span></div>`).join('');
 const rad=$('#radio');if(rad&&rad.children.length>5)[...rad.children].slice(5).forEach(c=>c.remove());
};
/* fuga di squadra e ordini rapidi più corti */
tbButton=function(S){
 const active=(S.tbs||[]).find(b=>S.byId[b.ids[0]].isMe&&b.phase!=='end');
 if(active){const k=Math.max(...active.ids.map(id=>S.byId[id].pos))-active.start;return`<div class="tbstate">${ic2('go',14)} Fuga di squadra · ${active.phase==='go'?`${km1(Math.max(0,5-k))} km`:'oltre i 2\''}</div>`}
 const c=tbCandidates(S);
 return`<button class="btn tbbtn" data-act="teambreak" ${c.length<3?'disabled':''} title="${c.length>=3?esc(c.map(rname).join(', ')):'Servono 3 compagni nello stesso gruppo'}">${ic2('go',14)} Fuga di squadra${c.length>=3?` · ${c.length}`:''}</button>`;
};
const TORD_IC={prot:'shield',ritmo:'passista',risp:'battery',libero:'free'};
refreshTeamBar=function(){const b=$('#teambar');if(!b)return;b.innerHTML=TEAM_ORD.map(([k,l,d])=>`<button data-act="tord" data-v="${k}" aria-pressed="${LIVE.tord===k}" title="${esc(d)}">${ic2(TORD_IC[k],15)}<b>${l}</b></button>`).join('')};
/* etichette brevi per gli ordini di squadra */
{const L={prot:'Proteggi',ritmo:'Ritmo',risp:'Risparmio',libero:'Liberi'};for(const o of TEAM_ORD)if(L[o[0]])o[1]=L[o[0]]}
/* ---------- moto TV: bandierine, barra con icone ---------- */
function tvFlag(g,code,x,y){
 const f=FLAGS[code];const w=13,h=9;
 if(!f||!['v','h','h2','esp','col','por','x','x2','sui'].includes(f[0])){g.fillStyle='#9AA3AF';g.fillRect(x,y,w,h);return}
 const t=f[0];
 if(t==='v'){for(let i=0;i<3;i++){g.fillStyle=f[1+i];g.fillRect(x+i*w/3,y,w/3+0.5,h)}}
 else if(t==='h'){for(let i=0;i<3;i++){g.fillStyle=f[1+i];g.fillRect(x,y+i*h/3,w,h/3+0.5)}}
 else if(t==='h2'){g.fillStyle=f[1];g.fillRect(x,y,w,h/2);g.fillStyle=f[2];g.fillRect(x,y+h/2,w,h/2)}
 else if(t==='esp'){g.fillStyle=f[1];g.fillRect(x,y,w,h);g.fillStyle=f[2];g.fillRect(x,y+h/4,w,h/2)}
 else if(t==='col'){g.fillStyle=f[1];g.fillRect(x,y,w,h/2);g.fillStyle=f[2];g.fillRect(x,y+h/2,w,h/4);g.fillStyle=f[3];g.fillRect(x,y+h*3/4,w,h/4)}
 else if(t==='por'){g.fillStyle=f[1];g.fillRect(x,y,w*0.4,h);g.fillStyle=f[2];g.fillRect(x+w*0.4,y,w*0.6,h)}
 else{g.fillStyle=f[1];g.fillRect(x,y,w,h);g.fillStyle=f[2];g.fillRect(x+w*0.3,y,2,h);g.fillRect(x,y+h/2-1,w,2)}
 g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=0.5;g.strokeRect(x,y,w,h);
}
tvBar=function(){if(!LIVE||!LIVE.S)return'';const v=LIVE.view||'prof';
 return`<div class="tvbar"><div class="seg sm">${[['prof','montagna','Profilo'],['tv','bike','TV']].map(([k,i,l])=>`<button data-act="tvview" data-v="${k}" aria-pressed="${v===k}">${ic2(i,13)} ${l}</button>`).join('')}</div>${v==='tv'?`<div class="seg sm">${[['head','flag','Testa'],['main','team','Gruppo'],['mine','shield','Miei']].map(([k,i,l])=>`<button data-act="tvcam" data-v="${k}" aria-pressed="${LIVE.camMode===k&&!LIVE.camId}">${ic2(i,13)} ${l}</button>`).join('')}</div><span class="tvhud" id="tvhud"></span>`:''}</div>`};
const _updateRaceUIT=updateRaceUI;
updateRaceUI=function(){_updateRaceUIT();const h=$('#tvhud'),d=LIVE&&LIVE.tvHud;if(!h||!d||LIVE.view!=='tv')return;
 h.innerHTML=`<b>${esc(d.gname)}</b> ${ic2('team',12)}${d.n}${d.gap>0?` ${ic2('clockw',12)}${fmtGap(d.gap)}`:''} ${ic2('speed',12)}${d.v.toFixed(1).replace('.',',')} ${ic2('grade',12)}${d.gr>0?'+':''}${d.gr.toFixed(1).replace('.',',')}%${d.sf?' '+ic2(d.sf===1?'pave':'sterrato',12):''}`};

/* ---------- risultati con avatar, bandiere e maglie ---------- */
function resCell(id,team){const r=RID(id);if(!r)return'';return`<span class="pc">${avatar(r,22)}${flagSvg(r.nat,14)} <b>${esc(r.name)}</b> <span class="tm">${esc(TEAM(team||r.team).short)}</span></span>`}
let _nIdx=null,_nIdxT=0;function NAMEIDX(){if(!_nIdx||Date.now()-_nIdxT>3000){_nIdx={};for(const q of Object.values(G.riders))_nIdx[q.name]=q;_nIdxT=Date.now()}return _nIdx}
function decorateResults(root){
 if(!root)return;
 root.querySelectorAll('table.t tr').forEach(tr=>{
  if(tr.dataset.deco)return;const td=tr.children[1];if(!td||td.querySelector('.av'))return;
  const nm=(td.firstChild&&td.firstChild.nodeType===3?td.firstChild.textContent:'').trim();if(!nm)return;
  const r=NAMEIDX()[nm];
  if(r){td.innerHTML=td.innerHTML.replace(esc(r.name),`<span class="avh h-${CAT_CLS[catOf(r)]||'el'}">${avatar(r,22)}</span> ${flagSvg(r.nat,14)} <b>${esc(r.name)}</b>`);td.classList.add('rescell');tr.dataset.deco=1}
  /* medaglie, maglie delle squadre, km in fuga */
  const n=tr.querySelector('td.n');if(n&&/^[123]$/.test(n.textContent.trim()))n.innerHTML=`<span class="medal m${n.textContent.trim()}">${n.textContent.trim()}</span>`;
  td.querySelectorAll('.tm').forEach(t=>{const sh=t.textContent.trim(),tm=G.teams.find(x=>x.short===sh);if(tm&&!t.querySelector('svg'))t.innerHTML=`<span class="tjer">${tm.id==='t0'?myJersey(14):jersey(tm.color,'#fff',14)} ${esc(sh)}</span>`;
   const km=sh.match(/^(\d+) km in fuga$/);if(km)t.innerHTML=`<span class="tjer" title="km in fuga">${ic2('go',12)} ${km[1]} km</span>`});
 });
}
jerLine=function(j){
 const L=[],J=(c,b)=>`<svg viewBox="0 0 40 40" width="16" height="16" aria-hidden="true"><path d="M13 5h14l9 6-4 7-4-2v20H12V16l-4 2-4-7z" fill="${c}" stroke="${b||'rgba(0,0,0,.25)'}" stroke-width="2"/></svg>`;
 if(j.gc)L.push(`<span title="Classifica generale">${J('#F5C518')} ${esc(RID(j.gc).name)}</span>`);
 if(j.pts)L.push(`<span title="Classifica a punti">${J('#23804A')} ${esc(RID(j.pts).name)}</span>`);
 if(j.kom)L.push(`<span title="Gran premio della montagna">${J('#fff','#C2362C')} ${esc(RID(j.kom).name)}</span>`);
 if(j.young)L.push(`<span title="Miglior giovane">${J('#F5F5F5')} ${esc(RID(j.young).name)}</span>`);
 return L.join('');
};
for(const fn of ['showStageResult','showFinal','natFinalSheet','raceSheet','jrFinalSheet']){
 if(typeof window[fn]!=='function')continue;const orig=window[fn];
 window[fn]=function(...a){const out=orig.apply(this,a);decorateResults($('#sheet'));return out};
}
