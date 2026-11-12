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
 const head=riderTable(rs.slice(0,1));const th=head.match(/<tr class="th">[\s\S]*?<\/tr>/)[0];
 const body=ROLE_ORD.map(k=>{const g=rs.filter(r=>r.role===k).sort((a,b)=>ovr(b)-ovr(a));if(!g.length)return'';
  return`<tr class="wkr"><td colspan="12">${ROLES[k].lab} · ${g.length}</td></tr>`+g.map(r=>riderTable([r],{trend:true}).match(/<tr data-act="rider"[\s\S]*?<\/tr>/)[0]).join('')}).join('');
 return`<div class="card tbl dtw"><table class="t dt">${th}${body}</table></div>`;
}
function covStrip(){return`<div class="kv covs">${coverage().map(({k,best})=>`<div><small>${SPEC[k]}</small><b class="${best.v<60?'neg':best.v>=75?'pos':''}">${best.v}</b><span class="tm">${esc(best.r.name.split(' ').slice(-1)[0])}</span></div>`).join('')}</div>`}
const _renderTeamX=renderTeam;
renderTeam=function(){
 if(!['rosa','gruppi','futuro'].includes(G.teamView))G.teamView='rosa';
 _renderTeamX();
 /* riepilogo senza ripetere il monte ingaggi (è in Mercato e Finanze) */
 const kv=$('#view > .kv');if(kv){const c=[...kv.children].find(d=>/ingaggi/i.test(d.textContent));if(c)c.remove();kv.classList.remove('kv4')}
 if(G.teamView==='rosa'){autoRoles();const rs=ME().riders.map(RID);
  const seg=$('#view .teamseg');let n=seg?seg.nextElementSibling:null;while(n){const x=n.nextElementSibling;n.remove();n=x}
  $('#view').insertAdjacentHTML('beforeend',covStrip()+rosaTable(rs));
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
