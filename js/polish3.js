"use strict";
/* ============================================================
   RIFINITURA 3: revisione generale, via le ridondanze
   ============================================================ */
/* ---------- barra in alto: una sola indicazione della squadra attiva ---------- */
const _renderTopP3=renderTop;
renderTop=function(){
 _renderTopP3();
 if(!G||!G.other)return;
 const sub=$('#top .sub');if(sub){const ch=sub.querySelector(':scope > .chip.fem, :scope > .chip');if(ch&&/^(Uomini|Donne)$/i.test(ch.textContent.trim()))ch.remove()}
 const b=$('#top [data-act="side"]');if(b)b.innerHTML=`<b>${SIDE_LAB[G.side]}</b> <span class="tm">⇄ ${SIDE_LAB[G.other.side]}</span>`;
};
/* ---------- terreni del pacchetto: solo la barra, il dettaglio nel suggerimento ---------- */
mixBar=function(m){const t=Object.values(m).reduce((a,b)=>a+b,0)||1,col={salita:'var(--accent)',classiche:'var(--amber)',volate:'var(--ok)',crono:'var(--muted)'},L={salita:'Salita',classiche:'Classiche',volate:'Volate',crono:'Crono'};
 const tip=Object.entries(m).filter(([k,v])=>v).map(([k,v])=>`${L[k]||k} ${v}`).join(' · ');
 return`<div class="mixbar" title="${tip}">${Object.entries(m).filter(([k,v])=>v).map(([k,v])=>`<i style="width:${v/t*100}%;background:${col[k]}"></i>`).join('')}</div>`};
/* ---------- Home ---------- */
const _renderHomeP3=renderHome;
renderHome=function(){
 _renderHomeP3();
 const v=$('#view');
 /* banner dell'altra squadra: una riga */
 const sb=v.querySelector('.banner[data-act="side"]');
 if(sb&&G.other){const o=otherInfo(),t=sb.textContent.split(': ').slice(1).join(': ').replace(/\. Passa all'altra squadra per convocare\.?$/,'');
  sb.innerHTML=`<span class="chip ${o.side==='F'?'fem':''}">${SIDE_LAB[o.side]}</span>${ic2('flag',14)}<b class="rn1">${esc(t)}</b><span class="tm">${ic('team',13)} da convocare</span><span class="go">⇄</span>`;sb.classList.add('sideban')}
 if(G.phase!=='season')offHome(v);
};
/* fine stagione: niente doppione della Posta, cose da fare in tabella */
function offHome(v){
 const hero=v.querySelector('.hero');if(!hero)return;
 const banners=[...v.querySelectorAll('.banner')].filter(b=>!b.closest('.hero'));
 hero.querySelectorAll(':scope > .note').forEach(n=>n.remove());
 const kv=hero.querySelector('.kv');if(kv){const KI=[['Punti','chart'],['Vittorie','trophy'],['Sponsor','spon']];kv.outerHTML=`<div class="mkstat">${[...kv.children].map(d=>{const l=d.querySelector('small').textContent,val=d.querySelector('b').innerHTML,k=KI.find(([re])=>l.startsWith(re));return`<span class="kc" title="${esc(l)}">${k?icx(k[1],14):''}<b>${val}</b>${/Sponsor/.test(l)?`<span class="tm">${l.replace('Sponsor ','')}</span>`:''}</span>`}).join('')}</div>`}
 const off=hero.querySelector('.offer');if(off){off.querySelectorAll('.note').forEach(n=>n.remove())}
 const h=hero.querySelector('h2');if(h){const rk=myCatRank();h.innerHTML=`${rk<=3?medalOf(rk):''} ${h.innerHTML}`}
 const T=typeof todoList==='function'?todoList():[];
 const todo=T.length?`<div><div class="sec-h"><h3>${ic2('warn',15)} Da fare</h3></div>${DT('',T.map(([i,t,a,val])=>`<tr data-act="${a}" data-v="${val}"><td><span class="pc">${i}<b>${t}</b></span></td><td class="r tm">›</td></tr>`).join(''),'todo')}</div>`:'';
 const g=document.createElement('div');g.className='homegrid';
 g.innerHTML=`<div class="col hc1"></div><div class="col hc2">${todo}${standMini()}${typeof recentMini==='function'?recentMini():''}</div>`;
 banners.forEach(b=>g.firstChild.appendChild(b));g.firstChild.appendChild(hero);
 v.innerHTML='';v.appendChild(g);
}
/* ---------- Calendario: filtri per tipo a sola icona ---------- */
const _renderCalP3=renderCal;
renderCal=function(){
 _renderCalP3();
 const v=$('#view');
 v.querySelectorAll('.fchip[data-act="calt"]').forEach(b=>{if(b.getAttribute('aria-pressed')==='true'||b.dataset.v==='all')return;const s=b.querySelector('svg');if(!s)return;b.title=b.textContent.trim();b.innerHTML='';b.appendChild(s);b.classList.add('ico')});
 const n=v.querySelector('.toolbar > .note');if(n&&/corse/.test(n.textContent)){n.outerHTML=`<span class="kc">${ic('cal',13)}<b>${n.textContent.match(/\d+/)?n.textContent.match(/\d+/)[0]:0}</b></span>`}
};
/* ---------- Scheda corsa: tappe in tabella, costi a icone ---------- */
const _raceSheetP3=raceSheet;
raceSheet=function(id){
 const o=_raceSheetP3(id);const r=G.races.find(x=>x.id===id),s=$('#sheet');if(!r||!s)return o;
 const st=s.querySelector('.stages');
 if(st&&r.tier!=='track'&&r.stages.length>1){const pro=r.stages[0].t==='prologo';
  st.innerHTML=DT(TH([['#','n'],['Tappa'],[ic2('go',12),'r'],[ic2('montagna',12),'r hs'],['','hm']]),r.stages.map((x,i)=>{const c=genCourse(x.t,x.seed,x.km,raceLf(r)),cl=c.climbs.filter(q=>q.cat!=='4').length;
   return`<tr><td class="n">${x.t==='prologo'?'P':i+(pro?0:1)}</td><td><span class="pc">${typeIc(x.t,14)}<b>${TYPE_LAB[x.t]}</b>${c.secN?`<span class="tm" title="Settori">${ic2('pave',11)}${c.secN}</span>`:''}</span></td><td class="r nowrap">${km1(c.len)}</td><td class="r hs">${cl||'<span class="tm">—</span>'}</td><td class="hm stprof">${profileSVG(c,140,22)}</td></tr>`}).join(''),'stt')}
 const cost=[...s.querySelectorAll('.rsside .eyebrow')].find(e=>/Costi/.test(e.textContent));
 if(cost){const n=cost.parentElement.querySelector('.note');if(n){const T=TIERS[r.tier];n.outerHTML=`<div class="mkstat"><span class="kc" title="Iscrizione">${ic2('contract',12)}<b>${eurk(T.fee)}</b></span><span class="kc" title="Trasferta per corridore al giorno">${ic('team',12)}<b>${eurk(T.prd)}</b>/gg</span>${r.ctry!=='ITA'?`<span class="kc" title="Trasferta all'estero">${flagSvg(r.ctry,12)}<b>+20%</b></span>`:''}</div>`}}
 const sw=[...s.querySelectorAll('.note')].find(n=>/^Vincitori di tappa/.test(n.textContent.trim()));
 if(sw&&r.result&&r.result.stageW){sw.outerHTML=`<div class="sec-h" style="margin-top:8px"><h3>${ic2('tappe',14)} Tappe</h3></div>`+DT('',r.result.stageW.map((n,i)=>{const rr=riderByName(n);return`<tr><td class="n">${i+1}</td><td>${rr?personCell(rr):esc(n)}</td></tr>`}).join(''))}
 return o;
};
/* ---------- note e messaggi lunghi (anche .msg) ---------- */
NOTE_SHORT.push(
 [/^Serve un invito degli organizzatori\. Probabilità [^(]*\((\d+)%\).*/,m=>`${ic2('inbox',13)} Su invito · probabilità ${m[1]}%`],
 [/^Iscrizione anche individuale: puoi schierare da 1 a (\d+) corridori.*/,m=>`${ic('team',13)} Squadra o singoli · 1–${m[1]}`],
 [/^Squadra: corrono insieme.*/,()=>null],
 [/^Si corre come squadra: almeno (\d+) corridori\.?/,m=>`${ic('team',13)} Solo squadra · almeno ${m[1]}`],
 [/^Iscrizioni chiuse.*/,()=>`${ic('lock',13)} Iscrizioni chiuse`],
 [/^Gara juniores: corrono i ragazzi della tua scuola.*/,()=>`${ic2('svil',13)} Corrono i ragazzi della scuola juniores`],
 [/^Corsa per nazionali.*/,()=>`${ic2('flag',13)} Corsa per nazionali: convocano i CT`],
 [/^\* stagione in corso$/,()=>null],
 [/^Sei tra le prime due ProTeam.*/,()=>`${ic('check',13)} Invito automatico`],
 [/^(Main sponsor|Co-sponsor|Partner) dal (\d+) al (\d+): (€\s?[\d.]+) l'anno\. Soddisfazione (\d+)%\.?/,m=>`${ic('spon',13)} ${m[1]} · ${ic2('calendar',12)} ${m[2]}–${m[3]} · ${ic2('euro',12)} ${m[4]} · ${m[5]}%`]
);
{const run=()=>{for(const id of ['view','sheet']){const r=document.getElementById(id);if(!r)continue;r.querySelectorAll('.msg:not([data-ns])').forEach(n=>{n.dataset.ns='1';const t=n.textContent.trim();for(const[re,f]of NOTE_SHORT){const m=t.match(re);if(m){const h=f(m);if(h===null)n.remove();else n.innerHTML=h;break}}})}};
 let pend=false;new MutationObserver(()=>{if(!pend){pend=true;requestAnimationFrame(()=>{pend=false;if(G)run()})}}).observe(document.body,{childList:true,subtree:true})}
/* ---------- titoli: più icone ---------- */
Object.assign(LAB_IC,{'Squadre':'team','Corridori':'bike','Ordine d\'arrivo':'finish','Carriera':'calendar','Risultati':'finish','Pagelle':'cap','La tua squadra':'team','Classifica a squadre':'team','Licenza ProTeam':'contract','Licenza WorldTeam':'contract','Licenza Continental':'contract','Gare':'flag','Specialità':'pista'});
/* ---------- scheda corridore: contratto a icone, risultati con medaglie ---------- */
const _riderSheetP3=riderSheet;
riderSheet=function(id){
 _riderSheetP3(id);const r=RID(id),s=$('#sheet');if(!r||!s)return;
 const eb=[...s.querySelectorAll('.eyebrow')].find(e=>/Contratto/.test(e.textContent));
 if(eb&&r.team==='t0'){const d=eb.nextElementSibling;if(d&&!d.classList.contains('mkstat')&&/l'anno/.test(d.textContent))d.outerHTML=`<div class="mkstat"><span class="kc" title="Ingaggio">${ic2('euro',12)}<b>${eurk(r.sal)}</b></span><span class="kc" title="Scadenza">${ic2('calendar',12)}<b>${r.cEnd}</b></span>${r.nextSal?`<span class="kc" title="Dal ${SEASON+1}">${ic2('go',12)}<b>${eurk(r.nextSal)}</b></span>`:''}${r.leavingTo?`<span class="kc neg">${tJer(TEAM(r.leavingTo),12)}<b>${esc(TEAM(r.leavingTo).short)}</b></span>`:''}</div>`;
  eb.parentElement.querySelectorAll('.note').forEach(n=>{if(/^Ha firmato con/.test(n.textContent.trim()))n.remove()})}
 const rh=[...s.querySelectorAll('.eyebrow')].find(e=>/^Risultati \d{4}/.test(e.textContent.trim()));
 if(rh){const tb=rh.parentElement.querySelector('table');if(tb)tb.querySelectorAll('tr').forEach(tr=>{const td=tr.lastElementChild;if(!td)return;const m=td.textContent.trim().match(/^(\d+)°/);if(m&&+m[1]<=3)td.innerHTML=td.innerHTML.replace(/^\s*\d+°/,medalOf(+m[1]))})}
};
if(G)render();
