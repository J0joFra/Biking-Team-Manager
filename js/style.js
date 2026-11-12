"use strict";
/* ============================================================
   STILE UNICO DELLE TABELLE (come i contratti):
   una riga per voce, avatar/logo piccolo + nome in grassetto,
   informazioni secondarie accanto in grigio, stessa spaziatura
   ============================================================ */
function normTables(root){
 if(!root)return;
 root.querySelectorAll('table.t:not([data-norm])').forEach(t=>{
  t.dataset.norm=1;
  if(t.classList.contains('gtab'))return;
  t.classList.add('dt','one');
  const box=t.closest('.card');if(box)box.classList.add('tbl','dtw');
  /* seconda riga sotto il nome → accanto, in grigio */
  t.querySelectorAll('td div.tm, td div.pcs').forEach(d=>{
   if(!d.textContent.trim()&&!d.querySelector('svg,.chip,.gchip')){d.remove();return}
   const s=document.createElement('span');s.className='tm sub';s.innerHTML=d.innerHTML;s.title=d.textContent.trim();d.replaceWith(s);
  });
  /* intestazioni con <th> come le altre */
  const thr=t.querySelector('tr:first-child th');if(thr){const tr=thr.parentElement;tr.classList.add('th');[...tr.children].forEach(th=>{const td=document.createElement('td');td.className=th.className;td.innerHTML=th.innerHTML;th.replaceWith(td)})}
 });
}
let normQ=false;
new MutationObserver(()=>{if(normQ)return;normQ=true;requestAnimationFrame(()=>{normQ=false;normTables($('#view'));normTables($('#sheet'))})}).observe(document.body,{childList:true,subtree:true});
