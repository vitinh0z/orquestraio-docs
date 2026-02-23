/* shared.js — CMD palette + prev/next nav injected into all doc subpages */
(function(){

/* ── CMD PALETTE DATA ────────────────────────────────────── */
const CMD_ITEMS=[
  {label:'Introducao',          href:'index.html',               group:'Inicio',          sub:'visao geral, hero'},
  {label:'Primeiros Passos',    href:'quickstart.html',          group:'Inicio',          sub:'docker-compose, MOCK'},
  {label:'Autenticacao',        href:'autenticacao.html',        group:'Inicio',          sub:'x-api-key, Oz_live_, Oz_test_'},
  {label:'Glossario',           href:'glossario.html',           group:'Inicio',          sub:'tenant, smartrouter'},
  {label:'Changelog',           href:'changelog.html',           group:'Inicio',          sub:'v0.4.0, v0.3.2'},
  {label:'Processar Pagamento', href:'processar-pagamento.html', group:'API',             sub:'POST /v1/payments'},
  {label:'Metodos de Pagamento',href:'metodos-pagamento.html',   group:'API',             sub:'pix, boleto, card_token'},
  {label:'SmartRouter',         href:'smartrouter.html',         group:'API',             sub:'roteamento automatico'},
  {label:'Webhooks',            href:'webhooks.html',            group:'API',             sub:'HMAC, assinatura, eventos'},
  {label:'Erros & Status',      href:'erros-status.html',        group:'API',             sub:'400, 401, 403, 409, 429'},
  {label:'Rate Limiting',       href:'rate-limiting.html',       group:'API',             sub:'Bucket4j, Redis'},
  {label:'Resiliencia',         href:'resiliencia.html',         group:'Funcionalidades', sub:'Idempotencia, Circuit Breaker'},
  {label:'Seguranca',           href:'seguranca.html',           group:'Funcionalidades', sub:'AES-256, TLS, HMAC'},
  {label:'Sandbox & MOCK',      href:'sandbox.html',             group:'Guias',           sub:'gateway fake, testes'},
];

/* Page order for prev/next */
const PAGE_ORDER=[
  {href:'index.html',               label:'Introducao'},
  {href:'quickstart.html',          label:'Primeiros Passos'},
  {href:'autenticacao.html',        label:'Autenticacao'},
  {href:'glossario.html',           label:'Glossario'},
  {href:'changelog.html',           label:'Changelog'},
  {href:'processar-pagamento.html', label:'Processar Pagamento'},
  {href:'metodos-pagamento.html',   label:'Metodos de Pagamento'},
  {href:'smartrouter.html',         label:'SmartRouter'},
  {href:'webhooks.html',            label:'Webhooks'},
  {href:'erros-status.html',        label:'Erros & Status'},
  {href:'rate-limiting.html',       label:'Rate Limiting'},
  {href:'resiliencia.html',         label:'Resiliencia'},
  {href:'seguranca.html',           label:'Seguranca'},
  {href:'sandbox.html',             label:'Sandbox & MOCK'},
];

/* ── INJECT CMD PALETTE HTML ─────────────────────────────── */
const cmdHTML=`
<div class="cmd-overlay" id="cmdOverlay" onclick="closeCmdIfBg(event)">
  <div class="cmd-modal">
    <div class="cmd-search">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="cmd-input" id="cmdInput" placeholder="Buscar secoes, endpoints, conceitos..." oninput="filterCmd(this.value)" onkeydown="handleCmdKey(event)">
      <span class="cmd-esc" onclick="closeCmd()">ESC</span>
    </div>
    <div class="cmd-results" id="cmdResults"></div>
    <div class="cmd-footer">
      <span class="cmd-hint"><kbd>↑↓</kbd> navegar</span>
      <span class="cmd-hint"><kbd>Enter</kbd> ir</span>
      <span class="cmd-hint"><kbd>Esc</kbd> fechar</span>
    </div>
  </div>
</div>`;
document.body.insertAdjacentHTML('afterbegin', cmdHTML);

/* ── INJECT SEARCH BUTTON IN TOPNAV ─────────────────────── */
const topnavRight=document.querySelector('.topnav-right');
if(topnavRight){
  const searchBtn=document.createElement('button');
  searchBtn.className='topnav-icon-btn topnav-search-btn';
  searchBtn.title='Buscar (Ctrl+K)';
  searchBtn.onclick=openCmd;
  searchBtn.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
  topnavRight.insertBefore(searchBtn,topnavRight.firstChild);
}

/* ── CMD LOGIC ───────────────────────────────────────────── */
let fuse,focusedIdx=0,filteredItems=[...CMD_ITEMS];
if(typeof Fuse!=='undefined'){
  fuse=new Fuse(CMD_ITEMS,{keys:['label','sub','group'],threshold:0.4});
}

function renderCmd(q){
  q=(q||'').trim();
  filteredItems=q?(fuse?fuse.search(q).map(r=>r.item):CMD_ITEMS.filter(i=>i.label.toLowerCase().includes(q.toLowerCase()))):CMD_ITEMS;
  focusedIdx=0;
  const groups={};
  filteredItems.forEach(item=>{if(!groups[item.group])groups[item.group]=[];groups[item.group].push(item);});
  let html='',gi=0;
  Object.entries(groups).forEach(([group,items])=>{
    html+=`<div class="cmd-section-label">${group}</div>`;
    items.forEach(item=>{
      const idx=gi++;
      html+=`<div class="cmd-item${idx===0?' focused':''}" data-idx="${idx}" onclick="gotoCmd('${item.href}')">
        <span class="cmd-item-label">${item.label}</span>
        <span class="cmd-item-sub">${item.sub}</span>
      </div>`;
    });
  });
  document.getElementById('cmdResults').innerHTML=html||'<div style="padding:1rem;text-align:center;color:var(--text-3);font-size:0.8rem;">Nenhum resultado</div>';
}
window.openCmd=function(){
  document.getElementById('cmdOverlay').classList.add('open');
  const inp=document.getElementById('cmdInput');inp.value='';
  renderCmd('');setTimeout(()=>inp.focus(),50);
};
window.closeCmd=function(){document.getElementById('cmdOverlay').classList.remove('open');};
window.closeCmdIfBg=function(e){if(e.target===document.getElementById('cmdOverlay'))closeCmd();};
window.gotoCmd=function(href){closeCmd();location.href=href;};
window.filterCmd=function(val){renderCmd(val);};
window.handleCmdKey=function(e){
  const items=document.querySelectorAll('.cmd-item');
  if(e.key==='ArrowDown'){e.preventDefault();focusedIdx=Math.min(focusedIdx+1,filteredItems.length-1);}
  else if(e.key==='ArrowUp'){e.preventDefault();focusedIdx=Math.max(focusedIdx-1,0);}
  else if(e.key==='Enter'){if(filteredItems[focusedIdx])gotoCmd(filteredItems[focusedIdx].href);return;}
  else if(e.key==='Escape'){closeCmd();return;}
  items.forEach((el,i)=>el.classList.toggle('focused',i===focusedIdx));
  if(items[focusedIdx])items[focusedIdx].scrollIntoView({block:'nearest'});
};
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();
    document.getElementById('cmdOverlay').classList.contains('open')?closeCmd():openCmd();}
  if(e.key==='Escape'&&document.getElementById('cmdOverlay').classList.contains('open'))closeCmd();
});
renderCmd('');

/* ── PREV/NEXT NAV ───────────────────────────────────────── */
const currentPage=location.pathname.split('/').pop()||'index.html';
const currentIdx=PAGE_ORDER.findIndex(p=>p.href===currentPage);
if(currentIdx!==-1){
  const prev=PAGE_ORDER[currentIdx-1]||null;
  const next=PAGE_ORDER[currentIdx+1]||null;
  const nav=document.createElement('nav');
  nav.className='page-nav';
  nav.innerHTML=`
    ${prev?`<a href="${prev.href}" class="page-nav-btn page-nav-prev">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      <span><span class="page-nav-label">Anterior</span><span class="page-nav-title">${prev.label}</span></span>
    </a>`:'<span></span>'}
    ${next?`<a href="${next.href}" class="page-nav-btn page-nav-next">
      <span><span class="page-nav-label">Proximo</span><span class="page-nav-title">${next.label}</span></span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
    </a>`:'<span></span>'}
  `;
  /* inject after main content */
  const main=document.querySelector('.shell .main');
  if(main) main.appendChild(nav);
}

})();
