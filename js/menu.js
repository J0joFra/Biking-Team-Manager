"use strict";
/* ============================================================
   MENU INIZIALE: continua, nuova partita, guida, impostazioni
   ============================================================ */
let MENU=true,NEWG=false;
function applyTheme(){let t='system';try{t=localStorage.getItem('amm-theme')||'system'}catch(e){}if(t==='system')delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme=t;return t}
applyTheme();
function renderMenu(){
 $('#top').hidden=true;$('#tabs').hidden=true;
 const has=!!G;
 const d=has?weekDate(G.week):null;
 $('#view').innerHTML=`<div class="menu">
  <div class="menuL"><div class="eyebrow">Gestionale di ciclismo</div><h1>Ammiraglia</h1>
   <p>Dalla Continental al WorldTour: sponsor del territorio, mercato, ritiri, scuola juniores, nazionali e corse da seguire dall'ammiraglia.</p>${ROT}</div>
  <div class="menuR">
   ${has?`<button class="card mbtn hi" data-act="mcont">${jersey(G.jersey[0],G.jersey[1],40)}<span><b>Continua</b><small>${esc(G.name)} · ${CAT[G.cat].lab} · ${G.phase==='season'?`${d.getDate()} ${MESI[d.getMonth()]} ${SEASON}`:`fine stagione ${SEASON}`}</small></span></button>`:''}
   <button class="card mbtn ${has?'':'hi'}" data-act="mnew"><span><b>Nuova partita</b><small>Scegli nome, sede e maglia della squadra</small></span></button>
   <button class="card mbtn" data-act="mhelp"><span><b>Come si gioca</b><small>Le basi in due minuti</small></span></button>
   <button class="card mbtn" data-act="mset"><span><b>Impostazioni</b><small>Tema e salvataggio</small></span></button>
  </div></div>`;
}
function helpSheet(){
 const sec=(h,b)=>`<div class="card pad"><h3>${h}</h3><div class="note gtx">${b}</div></div>`;
 openSheet(sheetHead('Guida','Come si gioca')+`<div class="pb wrap"><div class="guide">
  ${sec('La settimana','Dalla Home avanzi di una settimana o fino alla prossima corsa. Nelle settimane senza gare scegli le due sedute di allenamento. Le corse a cui sei iscritto vanno corse prima di andare avanti.')}
  ${sec('Le corse','Dal Calendario ti iscrivi pagando quota e trasferta. Le Continental corrono classe 1, classe 2 e Under 23; le ProSeries su invito; WorldTour e Grandi Giri solo da ProTeam o WorldTeam. Nelle corse di un giorno minori puoi mandare anche un solo corridore.')}
  ${sec('In corsa','Prima del via scegli la tattica: movimento, zona e momento d\'attacco di ogni corridore. In corsa usi gli ordini radio e i consigli dell\'ammiraglia. Il "?" in basso spiega tutto.')}
  ${sec('La squadra','Ruoli e specialità guidano le convocazioni. Fatica, forma, infortuni e morale contano. I giovani crescono con le corse, gli allenamenti, i ritiri in altura e le convocazioni in nazionale.')}
  ${sec('Soldi e sponsor','Gli sponsor pagano ogni settimana e hanno obiettivi. Si parte dal territorio della sede e si arriva ai grandi marchi. Per salire di categoria servono sponsor garantiti, reputazione e risultati.')}
  ${sec('Mercato','Finestre a febbraio e luglio–agosto; pre-contratti e juniores dai 18 anni. Nelle trattative contano ruolo promesso, clausole e motivazioni. Le altre squadre fanno offerte per i tuoi corridori.')}
 </div></div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Ho capito</button></div></div>`,'wide');
}
function settingsSheet(){
 const t=applyTheme();
 openSheet(sheetHead('Impostazioni','Preferenze')+`<div class="pb wrap stack">
  <div><div class="eyebrow">Tema</div><div class="seg">${[['system','Come il sistema'],['light','Chiaro'],['dark','Scuro']].map(([k,l])=>`<button data-act="mtheme" data-v="${k}" aria-pressed="${t===k}">${l}</button>`).join('')}</div></div>
  <div class="note">Il gioco salva da solo nel browser dopo ogni azione.</div>
  ${G?`<div class="card pad stack"><div class="eyebrow">Salvataggio</div><div class="note">${esc(G.name)} · stagione ${SEASON}</div><button class="btn ghost" data-act="mdel">Cancella la partita</button></div>`:''}
 </div><div class="pf"><div class="wrap fr"><button class="btn primary" data-act="close">Chiudi</button></div></div>`);
}
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-act]');if(!t)return;
 switch(t.dataset.act){
  case'mcont':MENU=false;render();break;
  case'mnew':if(G){openSheet(sheetHead('Nuova partita','Iniziare una nuova partita?','La partita salvata verrà sostituita quando inizi la nuova stagione.')+`<div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Annulla</button><button class="btn primary" data-act="mnewok">Nuova partita</button></div></div>`)}else{NEWG=true;MENU=false;render()}break;
  case'mnewok':closeSheet();NEWG=true;MENU=false;render();break;
  case'mback':NEWG=false;MENU=true;render();break;
  case'mhelp':helpSheet();break;
  case'mset':settingsSheet();break;
  case'mtheme':try{localStorage.setItem('amm-theme',t.dataset.v)}catch(err){}applyTheme();settingsSheet();break;
  case'mdel':openSheet(sheetHead('Salvataggio','Cancellare la partita?','Non si può annullare.')+`<div class="pf"><div class="wrap fr"><button class="btn ghost" data-act="close">Annulla</button><button class="btn primary" data-act="mdelok">Cancella</button></div></div>`);break;
  case'mdelok':try{localStorage.removeItem(SAVE_KEY)}catch(err){}G=null;closeSheet();MENU=true;render();break;
  case'menu':MENU=true;closeSheet();render();window.scrollTo(0,0);break;
 }
});
