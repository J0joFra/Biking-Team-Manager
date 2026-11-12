"use strict";
/* ============================================================
   GRAFICA: bandiere, avatar dei corridori, icone di tipo,
   ruolo, morale e terreno
   ============================================================ */
/* ---------- bandiere (30×20) ---------- */
const FLAGS={
 ITA:['v','#009246','#fff','#CE2B37'],FRA:['v','#0055A4','#fff','#EF4135'],BEL:['v','#000','#FDDA24','#EF3340'],ROU:['v','#002B7F','#FCD116','#CE1126'],
 NED:['h','#AE1C28','#fff','#21468B'],GER:['h','#000','#DD0000','#FFCE00'],AUT:['h','#ED2939','#fff','#ED2939'],HUN:['h','#CD2A3E','#fff','#436F4D'],
 LUX:['h','#ED2939','#fff','#00A1DE'],CRO:['h','#FF0000','#fff','#171796'],SLO:['h','#fff','#0000FF','#FF0000'],POL:['h2','#fff','#DC143C'],
 ESP:['esp','#AA151B','#F1BF00'],COL:['col','#FCD116','#003893','#CE1126'],POR:['por','#006600','#FF0000'],
 DEN:['x','#C8102E','#fff'],NOR:['x2','#BA0C2F','#fff','#00205B'],SUI:['sui','#DA291C','#fff'],GBR:['gbr'],USA:['usa'],UAE:['uae']
};
function flagSvg(code,w=18){
 const f=FLAGS[code],h=Math.round(w*2/3);let b='';
 if(!f)b=`<rect width="30" height="20" fill="#9AA3AF"/><text x="15" y="14" font-size="9" text-anchor="middle" fill="#fff" font-family="sans-serif">${esc(String(code||'?').slice(0,3))}</text>`;
 else switch(f[0]){
  case'v':b=`<rect width="10" height="20" fill="${f[1]}"/><rect x="10" width="10" height="20" fill="${f[2]}"/><rect x="20" width="10" height="20" fill="${f[3]}"/>`;break;
  case'h':b=`<rect width="30" height="7" fill="${f[1]}"/><rect y="6.6" width="30" height="7" fill="${f[2]}"/><rect y="13.3" width="30" height="6.7" fill="${f[3]}"/>`;break;
  case'h2':b=`<rect width="30" height="10" fill="${f[1]}"/><rect y="10" width="30" height="10" fill="${f[2]}"/>`;break;
  case'esp':b=`<rect width="30" height="20" fill="${f[1]}"/><rect y="5" width="30" height="10" fill="${f[2]}"/>`;break;
  case'col':b=`<rect width="30" height="10" fill="${f[1]}"/><rect y="10" width="30" height="5" fill="${f[2]}"/><rect y="15" width="30" height="5" fill="${f[3]}"/>`;break;
  case'por':b=`<rect width="12" height="20" fill="${f[1]}"/><rect x="12" width="18" height="20" fill="${f[2]}"/><circle cx="12" cy="10" r="3.5" fill="#FFE000"/>`;break;
  case'x':b=`<rect width="30" height="20" fill="${f[1]}"/><rect x="9" width="3.5" height="20" fill="${f[2]}"/><rect y="8.25" width="30" height="3.5" fill="${f[2]}"/>`;break;
  case'x2':b=`<rect width="30" height="20" fill="${f[1]}"/><rect x="8" width="5" height="20" fill="${f[2]}"/><rect y="7.5" width="30" height="5" fill="${f[2]}"/><rect x="9.25" width="2.5" height="20" fill="${f[3]}"/><rect y="8.75" width="30" height="2.5" fill="${f[3]}"/>`;break;
  case'sui':b=`<rect width="30" height="20" fill="${f[1]}"/><rect x="13" y="4" width="4" height="12" fill="${f[2]}"/><rect x="9" y="8" width="12" height="4" fill="${f[2]}"/>`;break;
  case'gbr':b=`<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.5"/><rect x="12" width="6" height="20" fill="#fff"/><rect y="7" width="30" height="6" fill="#fff"/><rect x="13" width="4" height="20" fill="#C8102E"/><rect y="8" width="30" height="4" fill="#C8102E"/>`;break;
  case'usa':b=`<rect width="30" height="20" fill="#fff"/>${[0,4,8,12,16].map(y=>`<rect y="${y*1.0}" width="30" height="1.6" fill="#B22234"/>`).join('')}<rect width="13" height="10" fill="#3C3B6E"/>`;break;
  case'uae':b=`<rect width="30" height="7" fill="#00732F"/><rect y="6.6" width="30" height="7" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#000"/><rect width="8" height="20" fill="#FF0000"/>`;break;
 }
 return`<svg class="flag" viewBox="0 0 30 20" width="${w}" height="${h}" aria-label="${esc(COUNTRY[code]||code||'')}" role="img">${b}<rect width="30" height="20" fill="none" stroke="rgba(0,0,0,.18)"/></svg>`;
}
/* ---------- avatar (generato dal nome, sempre uguale) ---------- */
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
const SKIN={ITA:[1,2,3],ESP:[1,2,3],FRA:[0,1,2,4],BEL:[0,1],NED:[0,1],GER:[0,1],DEN:[0,1],NOR:[0,1],GBR:[0,1,4],COL:[2,3,4],POR:[1,2,3],SLO:[0,1],POL:[0,1],SUI:[0,1],AUT:[0,1]};
const SKINC=['#F3D2B8','#E8BC98','#D19C76','#B27A54','#7A4E33'],HAIRC=['#1F1A17','#3B2A1E','#6B4A2E','#A5763E','#D6B56E','#8C8C8C','#B5452B'];
function teamCols(r){if(!r||r.team==='t0'||r.team==='acad')return G&&G.jersey?G.jersey:['#1D4ED1','#F2C14E'];const t=G.teams.find(x=>x.id===r.team);const c=t?t.color:'#64748B';return[c,'#ffffff']}
function avatar(r,s=30){
 if(!r)return'';
 const h=hashStr(r.name+(r.id||'')),sk=SKINC[(SKIN[r.nat]||[0,1,2])[h%((SKIN[r.nat]||[0,1,2]).length)]],hc=HAIRC[(h>>3)%HAIRC.length],st=(h>>6)%4,[c1,c2]=teamCols(r);
 const old=r.age>=34&&!r.f?HAIRC[5]:hc;
 let hair='';
 if(r.f)hair=st%2?`<path d="M13 21c0-9 5-13 11-13s11 4 11 13v10h-4V20c-2-4-12-4-14 0v11h-4z" fill="${old}"/>`:`<path d="M13 22c0-9 5-14 11-14s11 5 11 14c-1 0-2-5-6-6-4 2-10 2-12 0-3 1-4 6-4 6z" fill="${old}"/><circle cx="33" cy="22" r="4" fill="${old}"/>`;
 else hair=st===0?`<path d="M14 21c0-8 4-12 10-12s10 4 10 12c-2-3-5-5-10-5s-8 2-10 5z" fill="${old}"/>`:st===1?`<path d="M14 20c1-8 6-11 11-11 6 0 9 4 9 10-3-3-6-3-9-2-4 1-8 1-11 3z" fill="${old}"/>`:st===2?`<path d="M14 18h20v-3c0-3-4-6-10-6s-10 3-10 6z" fill="${c2}"/><path d="M13 18h22" stroke="${c1}" stroke-width="2"/>`:`<path d="M15 19c0-6 4-9 9-9s9 3 9 9c-2-1-5-2-9-2s-7 1-9 2z" fill="${old}"/>`;
 return`<svg class="av" viewBox="0 0 48 48" width="${s}" height="${s}" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="${c1}" opacity=".18"/><path d="M8 48c1-9 7-13 16-13s15 4 16 13z" fill="${c1}"/><path d="M18 36l6 5 6-5" fill="none" stroke="${c2}" stroke-width="2"/><rect x="20" y="29" width="8" height="7" fill="${sk}"/><ellipse cx="24" cy="22" rx="10" ry="11" fill="${sk}"/>${hair}<circle cx="20" cy="23" r="1.2" fill="#1F1A17"/><circle cx="28" cy="23" r="1.2" fill="#1F1A17"/><path d="M21 28c2 1.4 4 1.4 6 0" fill="none" stroke="#7A4E33" stroke-width="1.2" stroke-linecap="round"/></svg>`;
}
/* ---------- icone (16px) ---------- */
const IC2={
 scalatore:'<path d="M2 20l7-12 4 6 3-4 6 10z"/>',puncheur:'<path d="M2 18c4-8 7-8 10 0s6 4 10-6"/>',velocista:'<path d="M13 2L5 14h6l-1 8 8-12h-6z"/>',
 passista:'<path d="M3 12h18M15 6l6 6-6 6"/>',cronoman:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',gregario:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
 cap:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',free:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/>',svil:'<path d="M12 21V11M12 11c0-4 3-6 7-6 0 4-3 6-7 6zM12 14c0-3-2-5-6-5 0 3 2 5 6 5z"/>',
 montagna:'<path d="M2 20l7-12 4 6 3-4 6 10z"/>',collinare:'<path d="M2 18c4-8 7-8 10 0s6 4 10-6"/>',mossa:'<path d="M2 15c3-4 5-4 7 0s5 3 7-1 4-3 6 1"/>',piatta:'<path d="M2 14h20"/>',
 crono:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',prologo:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M10 2h4"/>',pave:'<path d="M3 8h6v5H3zM10 8h6v5h-6zM17 8h4v5h-4zM6 14h6v5H6zM13 14h6v5h-6z"/>',
 roubaix:'<path d="M3 8h6v5H3zM10 8h6v5h-6zM17 8h4v5h-4zM6 14h6v5H6zM13 14h6v5h-6z"/>',sterrato:'<path d="M3 16h18"/><circle cx="6" cy="11" r="1"/><circle cx="11" cy="9" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="19" cy="8" r="1"/>',
 circuito:'<rect x="3" y="7" width="18" height="10" rx="5"/>',pista:'<rect x="3" y="7" width="18" height="10" rx="5"/><rect x="7" y="10" width="10" height="4" rx="2"/>',tappe:'<path d="M4 4v16M4 5h12l-2 4 2 4H4"/>',
 injury:'<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/>',contract:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',alt:'<path d="M2 20l7-12 4 6 3-4 6 10z"/><path d="M16 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z"/>',
 euro:'<path d="M17 6a7 7 0 1 0 0 12M4 10h9M4 14h9"/>',trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8"/>',bike:'<circle cx="6" cy="16" r="4"/><circle cx="18" cy="16" r="4"/><path d="M6 16l4-8h5l3 8M10 8l3 8"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',inbox:'<path d="M3 13l3-8h12l3 8v6H3z"/><path d="M3 13h5l1 2h6l1-2h5"/>',chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'
};
function ic2(n,s=16,cls=''){const p=IC2[n];if(!p)return'';const fill=['cap','velocista'].includes(n)?'currentColor':'none';return`<svg class="ic2 ${cls}" viewBox="0 0 24 24" width="${s}" height="${s}" fill="${fill}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
function archIc(r,s=15){return`<span class="aic" title="${ARCH[r.arch].lab}">${ic2(r.arch,s)}</span>`}
function roleIc(r,s=14){if(!r.role)return'';const k=r.role==='cap'?'cap':r.role==='luog'?'cap':r.role==='free'?'free':r.role==='svil'?'svil':'gregario';return`<span class="ric r_${r.role}" title="${ROLES[r.role].lab}">${ic2(k,s)}</span>`}
function moodIc(r,s=16){const m=moodOf(r),c=m>=75?'var(--ok)':m>=55?'#7CB342':m>=35?'var(--amber)':'var(--danger)',mouth=m>=55?'M8 14c2 2.5 6 2.5 8 0':m>=35?'M8 15h8':'M8 16c2-2.5 6-2.5 8 0';return`<svg class="ic2" viewBox="0 0 24 24" width="${s}" height="${s}" aria-label="Morale ${m}"><circle cx="12" cy="12" r="10" fill="${c}"/><circle cx="9" cy="10" r="1.3" fill="#fff"/><circle cx="15" cy="10" r="1.3" fill="#fff"/><path d="${mouth}" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg>`}
function fitBar(r){const c=r.form*(1-r.fat/260)*(1+altEff(r,G.week)),p=clamp((c-0.88)/0.17*100,4,100),col=c>=1?'var(--ok)':c>=0.972?'#7CB342':c>=0.94?'var(--amber)':'var(--danger)';return`<span class="fit2" title="${condOf(r).t}"><i style="width:${p}%;background:${col}"></i></span>`}
function typeIc(t,s=15){return`<span class="tic" title="${TYPE_LAB[t]||t}">${ic2(t,s)}</span>`}
function raceIc(r,s=15){return r.tier==='track'?typeIc('pista',s):r.stages.length>1?`<span class="tic" title="${r.stages.length} tappe">${ic2('tappe',s)}</span>`:typeIc(r.stages[0].t,s)}
/* cella "persona": avatar + bandiera + nome */
function personCell(r,extra=''){return`<span class="pc">${avatar(r,30)}<span class="pcn"><span class="pcl">${flagSvg(r.nat,16)} <b>${esc(r.name)}</b>${extra}</span></span></span>`}
