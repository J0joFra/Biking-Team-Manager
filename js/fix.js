"use strict";
/* ============================================================
   RIORDINO: niente informazioni ripetute tra le pagine
   ============================================================ */
/* ---------- Home: solo ciò che serve adesso ---------- */
const _renderHomeX=renderHome;
renderHome=function(){
 _renderHomeX();
 const v=$('#view');if(G.phase!=='season')return;
 const pick=sel=>[...v.querySelectorAll(sel)];
 const banners=pick('.banner').filter(b=>!b.closest('.hero,.pkhero'));
 const hero=v.querySelector('.pkhero')||v.querySelector('.hero');
 const obj=pick('.homegrid h3').find(h=>/Obiettivi/.test(h.textContent));const objBox=obj?obj.closest('.homegrid .col > div'):null;
 if(hero&&hero.classList.contains('pkhero')){v.innerHTML='';banners.forEach(b=>v.appendChild(b));v.appendChild(hero);return}
 const grid=document.createElement('div');grid.className='homegrid';
 grid.innerHTML=`<div class="col hc1"></div><div class="col hc2"></div>`;
 const c1=grid.firstChild,c2=grid.lastChild;
 banners.forEach(b=>c1.appendChild(b));if(hero)c1.appendChild(hero);
 c1.insertAdjacentHTML('beforeend',trainMini());
 c2.insertAdjacentHTML('beforeend',standMini());if(objBox)c2.appendChild(objBox);
 v.innerHTML='';v.appendChild(grid);
};
/* ---------- Squadra: una sola Rosa divisa per ruolo ---------- */
function riderRow(r,opts={}){return riderTable([r],opts).replace(/^[\s\S]*?<\/tr>/,'').replace(/<\/table><\/div>$/,'')}
function rosaTable(rs){
 const head=riderTable(rs.slice(0,1));let th=head.match(/<tr class="th">[\s\S]*?<\/tr>/)[0];
 const on=sqOn(),A=on?groups().active:[];
 if(on)th=th.replace(/<\/tr>$/,`<td class="c">Gruppi</td></tr>`);
 const caps=groups().caps;const gcell=r=>{const m=sqOf(r);return`<td class="gcell">${A.map(k=>`<button class="gtg ${caps[k]===r.id?'gcap':''}" data-act="gtog" data-id="${r.id}" data-v="${k}" aria-pressed="${m.includes(k)}" style="--gc:${GSPEC_COL[k]}" title="${GSPEC[k]} · ${gScore(r,k)}${caps[k]===r.id?' · capitano':''} (tieni premuto: capitano)">${ic2(GSPEC_IC[k],12)}</button>`).join('')}</td>`};
 const cols=12+(on?1:0);
 const body=ROLE_ORD.map(k=>{const g=rs.filter(r=>r.role===k).sort((a,b)=>ovr(b)-ovr(a));if(!g.length)return'';
  return`<tr class="wkr"><td colspan="${cols}">${ROLES[k].lab} · ${g.length}</td></tr>`+g.map(r=>{let row=riderTable([r],{trend:true}).match(/<tr data-act="rider"[\s\S]*?<\/tr>/)[0];if(on)row=row.replace(/<\/tr>$/,gcell(r)+'</tr>');return row}).join('')}).join('');
 return`<div class="card tbl dtw"><table class="t dt ${on?'withg':''}">${th}${body}</table></div>`;
}
function groupsBar(){
 const g=groups(),A=g.active;
 return`<div class="toolbar gbar"><span class="eyebrow">Gruppi</span><div class="seg sm">${[[0,'Off'],[1,'On']].map(([v,l])=>`<button data-act="gon" data-v="${v}" aria-pressed="${!!g.on===!!v}">${l}</button>`).join('')}</div>
 ${g.on?`<div class="chips">${Object.keys(GSPEC).map(k=>{const n=ME().riders.map(RID).filter(r=>sqOf(r).includes(k)).length;return`<button class="fchip" data-act="gspec" data-v="${k}" aria-pressed="${A.includes(k)}" title="${GSPEC[k]}">${gChip(k)}${A.includes(k)?` ${n}`:''}</button>`}).join('')}</div><button class="btn sm" data-act="gauto">Auto</button>`:''}<span class="hlg"><i class="h-el"></i>Elite<i class="h-u23"></i>U23<i class="h-rk"></i>Rookie</span></div>`;
}
function covStrip(){return`<div class="kv covs">${coverage().map(({k,best})=>`<div><small>${SPEC[k]}</small><b class="${best.v<60?'neg':best.v>=75?'pos':''}">${best.v}</b><span class="tm">${esc(best.r.name.split(' ').slice(-1)[0])}</span></div>`).join('')}</div>`}
const _renderTeamX=renderTeam;
renderTeam=function(){
 if(!['rosa','futuro'].includes(G.teamView))G.teamView='rosa';
 _renderTeamX();
 /* riepilogo senza ripetere il monte ingaggi (è in Mercato e Finanze) */
 const kv=$('#view > .kv'),th=$('#view .teamhead');
 if(kv&&th){const rs=ME().riders.map(RID);th.insertAdjacentHTML('beforeend',`<span class="thstat">${ic2('team',13)} ${rs.length}/${myCat().max} · ${(rs.reduce((a,r)=>a+r.age,0)/rs.length).toFixed(1)} anni · ${ic2('trophy',13)} ${rs.reduce((a,r)=>a+r.wins,0)}</span>`);kv.remove()}
 if(G.teamView==='rosa'){autoRoles();const rs=ME().riders.map(RID);
  const seg=$('#view .teamseg');let n=seg?seg.nextElementSibling:null;while(n){const x=n.nextElementSibling;n.remove();n=x}
  $('#view').insertAdjacentHTML('beforeend',groupsBar()+covStrip()+rosaTable(rs));
 }
};
/* ---------- riepiloghi in alto: niente doppioni della barra superiore ---------- */
function dropKv(re){const kv=$('#view .kv');if(!kv)return;[...kv.children].filter(d=>re.test((d.querySelector('small')||{}).textContent||'')).forEach(d=>d.remove());kv.classList.remove('kv4')}
const _renderMarketX=renderMarket;renderMarket=function(){_renderMarketX();dropKv(/^Cassa$/i)};
const _renderSponsorX=renderSponsor;renderSponsor=function(){_renderSponsorX();dropKv(/^Reputazione$|^Sponsor \d+$/i)};
/* ---------- Classifica: Squadre e Corridori; la storia va nel Palmarès ---------- */
function teamsRank(){
 const f=G.rankf||'mine',tier=f==='mine'?G.cat:f==='all'?null:f,tr=teamRanking(tier);
 const lab=t=>({wt:'WorldTeam',pro:'ProTeam',conti:'Continental',dev:'Development',me:CAT[G.cat].lab})[tierOfTeam(t)]||'';
 return`<div class="toolbar"><div class="chips">${[['mine','La mia categoria'],['wt','WorldTeam'],['pro','ProTeam'],['conti','Continental'],['all','Tutte']].map(([k,l])=>`<button class="fchip" data-act="rankf" data-v="${k}" aria-pressed="${f===k}">${l}</button>`).join('')}</div></div>
 ${DT(TH([['#','n'],['Squadra'],['Categoria','hm'],['Corridori','r hs'],['Vittorie','r'],['Punti','r']]),tr.map((o,i)=>`<tr class="${o.t.id==='t0'?'me':''}"><td class="n">${i+1}</td><td><span class="pc">${o.t.id==='t0'?myJersey(22):jersey(o.t.color,'#fff',22)}<b>${esc(o.t.id==='t0'?G.name:o.t.name)}</b> ${flagSvg(o.t.nats?o.t.nats[0]:'ITA',14)}</span></td><td class="hm tm">${lab(o.t)}</td><td class="r hs">${o.t.riders.length}</td><td class="r">${o.t.riders.reduce((a,id)=>a+((RID(id)&&RID(id).wins)||0),0)}</td><td class="r"><b>${o.p}</b></td></tr>`).join(''))}`;
}
renderRank=function(){
 const v=G.rkView==='riders'?'riders':'teams',o=G.other,other=o&&G.rkSide==='o';
 const draw=()=>(v==='riders'?riderRanking():teamsRank());
 let body=other?withOther(draw):draw();
 const side=o?`<div class="seg sm rkside">${[['m',G.side],['o',o.side]].map(([k,s])=>`<button data-act="rkside" data-v="${k}" aria-pressed="${(G.rkSide==='o')===(k==='o')}">${SIDE_LAB[s]}</button>`).join('')}</div>`:'';
 $('#view').innerHTML=`<div class="toolbar">${side}<div class="seg rkseg">${[['teams','Squadre'],['riders','Corridori']].map(([k,l])=>`<button data-act="rkview" data-v="${k}" aria-pressed="${v===k}">${l}</button>`).join('')}</div></div>`+body;
 if(other)document.querySelectorAll('#view [data-act="rider"]').forEach(el=>el.removeAttribute('data-act'));
};

/* tieni premuta l'icona di un gruppo: il corridore diventa capitano di quel gruppo */
{let lp=null,lpDone=false;
 document.addEventListener('pointerdown',e=>{const b=e.target.closest('.gtg');if(!b)return;lpDone=false;clearTimeout(lp);lp=setTimeout(()=>{lpDone=true;const r=RID(b.dataset.id);if(r&&setGroupCap(r,b.dataset.v)){toast(groups().caps[b.dataset.v]===r.id?`${r.name.split(' ').slice(-1)[0]}: capitano ${GSPEC[b.dataset.v]}`:'Capitano tolto','ok');const vs=$('#view .vscroll'),sc=vs?vs.scrollTop:0;renderTeam();const v2=$('#view .vscroll');if(v2)v2.scrollTop=sc;if(navigator.vibrate)try{navigator.vibrate(30)}catch(x){}}},450)});
 ['pointerup','pointercancel','pointerleave'].forEach(ev=>document.addEventListener(ev,()=>clearTimeout(lp)));
 document.addEventListener('click',e=>{if(lpDone&&e.target.closest('.gtg')){e.stopImmediatePropagation();e.preventDefault();lpDone=false}},true);
 document.addEventListener('contextmenu',e=>{const b=e.target.closest('.gtg');if(!b)return;e.preventDefault();const r=RID(b.dataset.id);if(r&&setGroupCap(r,b.dataset.v))renderTeam()});
}
