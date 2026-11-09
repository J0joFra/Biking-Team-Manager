"use strict";
/* ============================================================
   MOTO TV: la corsa vista dall'alto, un pallino per corridore
   ============================================================ */
const hashId=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h)};
function riderColors(x){
 if(x.isMe)return[G.jersey[0],G.jersey[1]];
 const t=TEAM(x.team);
 if(t.color&&!String(t.color).startsWith('var'))return[t.color,'#ffffff'];
 const h=hashId(String(x.team))%360;return[`hsl(${h} 55% 48%)`,'#ffffff'];
}
function tvTarget(S){
 const id=LIVE.camId,x=id&&S.byId[id];
 if(x&&!x.finished&&x.cl)return x.cl;
 if(LIVE.camMode==='head')return S.clusters[0];
 if(LIVE.camMode==='mine'){const m=S.riders.find(y=>y.isMe&&!y.finished&&y.cl);if(m)return m.cl}
 return S.main||S.clusters[0];
}
/* posizione visiva in gruppo: chi tira davanti, poi gli altri in file */
function formation(S,cl){
 const rs=cl.rs.filter(x=>!x.finished).slice();
 const pri=x=>x.intent==='attack'?-2:x.intent==='sprint'?-1:x.intent==='pull'?0:x.intent==='follow'?1:2;
 rs.sort((a,b)=>pri(a)-pri(b)||(hashId(a.id)%97)-(hashId(b.id)%97));
 const n=rs.length,w=Math.max(1,Math.min(6,Math.ceil(Math.sqrt(n*0.7)))),wind=S.W&&S.W.draft<1;
 const out=[];
 rs.forEach((x,i)=>{
  let row,col;
  if(i<Math.min(2,n)&&pri(x)<=0){row=i===0?0:1;col=0}
  else{const k=i;row=Math.floor(k/w)+1;col=k%w-(w-1)/2}
  const back=row*2.5+(hashId(x.id)%10)/12;
  const lat=wind?(-3+row*0.5+col*0.3):(col*0.75+((hashId(x.id)>>3)%10-5)/25);
  out.push({x,dm:back,lat:clamp(lat,-3.2,3.2)});
 });
 return out;
}
function drawTV(){
 const cv=$('#pc');if(!cv||!LIVE||!LIVE.S)return;
 const S=LIVE.S,c=S.course;
 const dpr=window.devicePixelRatio||1,W=cv.clientWidth,H=cv.clientHeight;if(!W||!H)return;
 if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
 const col={bg:cssVar('--terrain'),road:cssVar('--sunk'),ink:cssVar('--ink'),mu:cssVar('--muted'),ac:cssVar('--accent'),am:cssVar('--amber'),pv:cssVar('--pave'),gr:cssVar('--gravel'),line:cssVar('--surface'),danger:cssVar('--danger')};
 if(!S.clusters.length){g.fillStyle=col.bg;g.fillRect(0,0,W,H);return}
 const tgt=tvTarget(S);
 const span=Math.max(110,Math.min(280,(tgt.front-tgt.last)*1000+tgt.rs.length*0.45+60));
 const offT=span*0.42;
 LIVE.camOff=LIVE.camOff==null?offT:LIVE.camOff+(offT-LIVE.camOff)*0.12;
 LIVE.camSpan=LIVE.camSpan==null?span:LIVE.camSpan+(span-LIVE.camSpan)*0.12;
 const cam=tgt.front*1000-LIVE.camOff,ppm=W/LIVE.camSpan;
 const roadH=Math.min(H*0.62,120),ry=(H-roadH)/2,mpy=roadH/8;
 const X=m=>(m-cam)*ppm,Y=lat=>ry+roadH/2+lat*mpy;
 const i0=gi(S,tgt.front),sf=c.surf[i0],gr=c.g[i0];
 g.fillStyle=col.bg;g.fillRect(0,0,W,H);
 g.fillStyle=sf===1?col.pv:sf===2?col.gr:col.road;g.fillRect(0,ry,W,roadH);
 if(sf===1){g.fillStyle='rgba(0,0,0,.18)';for(let m=Math.floor(cam/2)*2;m<cam+span;m+=2)for(let k=0;k<6;k++)g.fillRect(X(m)+(k%2)*ppm,ry+k*roadH/6+2,ppm*0.8,roadH/6-4)}
 g.strokeStyle=col.line;g.lineWidth=2;g.setLineDash([14,12]);g.lineDashOffset=cam*ppm%26;
 g.beginPath();g.moveTo(0,ry+roadH/2);g.lineTo(W,ry+roadH/2);g.stroke();g.setLineDash([]);
 g.fillStyle=col.line;g.fillRect(0,ry,W,2);g.fillRect(0,ry+roadH-2,W,2);
 // cartelli dei km
 g.font='600 12px "IBM Plex Mono", monospace';g.fillStyle=col.ink;
 for(let m=Math.ceil(cam/50)*50;m<cam+W/ppm;m+=50){const xx=X(m);g.fillRect(xx,ry-8,1.5,8);const left=S.len-m/1000;if(left>=0&&Math.round(m)%100===0)g.fillText(left.toFixed(1).replace('.',','),xx+3,ry-10)}
 const fin=S.len*1000;if(fin>cam&&fin<cam+span){const xx=X(fin);for(let k=0;k<8;k++){g.fillStyle=k%2?'#fff':'#111';g.fillRect(xx,ry+k*roadH/8,6,roadH/8)}}
 // corridori
 const vis=S.clusters.filter(cl=>cl.front*1000>cam-60&&cl.front*1000-(cl.rs.length*0.6)<cam+span+20);
 const labels=[];
 for(const cl of vis){
  for(const f of formation(S,cl)){
   const m=cl.front*1000-f.dm;if(m<cam-5||m>cam+span+5)continue;
   const xx=X(m),yy=Y(f.lat),r=Math.max(3.2,Math.min(6.5,ppm*0.55))*(f.x.isMe?1.25:1);
   const[c1,c2]=riderColors(f.x);
   g.beginPath();g.arc(xx,yy,r,0,Math.PI*2);g.fillStyle=c1;g.fill();
   if(f.x.isMe){g.lineWidth=2;g.strokeStyle=c2;g.stroke();const pl=S.plans[f.x.team];if((pl&&pl.lead===f.x)||f.x.intent==='attack'||f.x.intent==='pull'||f.x.intent==='sprint')labels.push({xx,yy,r,t:f.x.r.name.split(' ').slice(-1)[0],att:f.x.intent==='attack'})}
   else if(f.x.intent==='attack'){g.lineWidth=2;g.strokeStyle=col.danger;g.stroke()}
   if(f.x.stop>0){g.fillStyle=col.danger;g.fillText('!',xx-2,yy-r-2)}
  }
 }
 g.font='700 13px "Barlow Condensed", sans-serif';
 labels.forEach((l,i)=>{const up=i%2===0;g.fillStyle=l.att?col.danger:col.ink;g.fillText(l.t.toUpperCase(),l.xx+l.r+3,up?l.yy-l.r-2:l.yy+l.r+11)});
 // gruppi fuori campo
 const gd=groupsDisplay(S);
 const ahead=gd.filter(o=>o.front*1000>cam+span).pop(),behind=gd.find(o=>o.front*1000<cam-40);
 const tg=gapSec(S,tgt.front);
 g.font='700 13px "Barlow Condensed", sans-serif';
 const tag=(o,right)=>{const d=gapSec(S,o.front)-tg;const t=`${right?'':'◀ '}${o.name} ${o.rs.length} · ${d<0?'−':'+'}${fmtGap(Math.abs(d)).replace('+','')}${right?' ▶':''}`;const w=g.measureText(t).width+12;const xx=right?W-w-4:4,yy=H-8;g.fillStyle=col.ink;g.globalAlpha=0.85;g.fillRect(xx,yy-16,w,20);g.globalAlpha=1;g.fillStyle=col.line;g.fillText(t,xx+6,yy-1)};
 if(ahead)tag(ahead,true);if(behind)tag(behind,false);
 // intestazione
 const gname=(gd.find(o=>o.rs.includes(tgt.rs[0]))||{name:'Gruppo'}).name;
 g.fillStyle=col.ink;g.globalAlpha=0.85;g.fillRect(4,4,Math.min(W-8,310),22);g.globalAlpha=1;g.fillStyle=col.line;
 g.fillText(`MOTO TV · ${gname} (${tgt.rs.length}) · ${tg>0?fmtGap(tg)+' · ':''}${(tgt.v*3.6||0).toFixed(1).replace('.',',')} km/h · ${gr>0?'+':''}${gr.toFixed(1).replace('.',',')}%${sf===1?' · pavé':sf===2?' · sterrato':''}`,10,20);
}
const _drawProfileTV=drawProfile;
drawProfile=function(){if(LIVE&&LIVE.view==='tv'&&LIVE.S)drawTV();else _drawProfileTV()};
function tvBar(){if(!LIVE||!LIVE.S)return'';const v=LIVE.view||'prof';return`<div class="tvbar"><div class="seg sm">${[['prof','Profilo'],['tv','Moto TV']].map(([k,l])=>`<button data-act="tvview" data-v="${k}" aria-pressed="${v===k}">${l}</button>`).join('')}</div>${v==='tv'?`<div class="seg sm">${[['head','Testa'],['main','Gruppo'],['mine','I miei']].map(([k,l])=>`<button data-act="tvcam" data-v="${k}" aria-pressed="${LIVE.camMode===k&&!LIVE.camId}">${l}</button>`).join('')}</div>`:''}</div>`}
function refreshTvBar(){const el=$('#tvbar');if(el)el.innerHTML=tvBar();const pr=$('#race .prof');if(pr)pr.classList.toggle('tv',LIVE&&LIVE.view==='tv')}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t||!LIVE)return;
 const a=t.dataset.act,v=t.dataset.v;
 if(a==='tvview'){LIVE.view=v;LIVE.camPos=null;if(v==='tv'&&!LIVE.camMode)LIVE.camMode='main';refreshTvBar();drawProfile()}
 else if(a==='tvcam'){LIVE.camMode=v;LIVE.camId=null;LIVE.camPos=null;refreshTvBar()}
 else if(a==='tvgroup'){LIVE.view='tv';LIVE.camId=v;LIVE.camPos=null;refreshTvBar()}
});
