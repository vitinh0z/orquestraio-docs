/* shared.js — CMD palette + prev/next + auto-anchors + TOC + mobile sidebar + helpful widget */
(function(){

/* ── CMD PALETTE DATA ────────────────────────────────────── */
const CMD_ITEMS=[
  {label:'Introducao',          href:'index.html',               group:'Inicio',      sub:'visao geral, hero'},
  {label:'Primeiros Passos',    href:'quickstart.html',          group:'Inicio',      sub:'docker-compose, MOCK'},
  {label:'Autenticacao',        href:'autenticacao.html',        group:'Inicio',      sub:'x-api-key, Oz_live_, Oz_test_'},
  {label:'Glossario',           href:'glossario.html',           group:'Inicio',      sub:'tenant, smartrouter'},
  {label:'Changelog',           href:'changelog.html',           group:'Inicio',      sub:'v0.4.0, v0.3.2'},
  {label:'Referencia da API',   href:'referencia-api.html',      group:'API',         sub:'POST /v1/payments, schemas, tipos'},
  {label:'Processar Pagamento', href:'processar-pagamento.html', group:'API',         sub:'POST /v1/payments'},
  {label:'Metodos de Pagamento',href:'metodos-pagamento.html',   group:'API',         sub:'pix, boleto, card_token'},
  {label:'SmartRouter',         href:'smartrouter.html',         group:'API',         sub:'roteamento automatico'},
  {label:'Webhooks',            href:'webhooks.html',            group:'API',         sub:'HMAC, assinatura, eventos'},
  {label:'Erros & Status',      href:'erros-status.html',        group:'API',         sub:'400, 401, 403, 409, 429'},
  {label:'Rate Limiting',       href:'rate-limiting.html',       group:'API',         sub:'Bucket4j, Redis'},
  {label:'Resiliencia',         href:'resiliencia.html',         group:'Funcionalidades', sub:'Idempotencia, Circuit Breaker'},
  {label:'Seguranca',           href:'seguranca.html',           group:'Funcionalidades', sub:'AES-256, TLS, HMAC'},
  {label:'Sandbox & MOCK',      href:'sandbox.html',             group:'Guias',       sub:'gateway fake, testes'},
  {label:'Guia de Migracao',    href:'migracao.html',            group:'Guias',       sub:'Stripe, MercadoPago, diff, checklist'},
  {label:'Recipes',             href:'recipes.html',             group:'Guias',       sub:'e-commerce, SaaS, retry, webhook'},
];

/* Page order for prev/next */
const PAGE_ORDER=[
  {href:'index.html',               label:'Introducao'},
  {href:'quickstart.html',          label:'Primeiros Passos'},
  {href:'autenticacao.html',        label:'Autenticacao'},
  {href:'glossario.html',           label:'Glossario'},
  {href:'changelog.html',           label:'Changelog'},
  {href:'referencia-api.html',      label:'Referencia da API'},
  {href:'processar-pagamento.html', label:'Processar Pagamento'},
  {href:'metodos-pagamento.html',   label:'Metodos de Pagamento'},
  {href:'smartrouter.html',         label:'SmartRouter'},
  {href:'webhooks.html',            label:'Webhooks'},
  {href:'erros-status.html',        label:'Erros & Status'},
  {href:'rate-limiting.html',       label:'Rate Limiting'},
  {href:'resiliencia.html',         label:'Resiliencia'},
  {href:'seguranca.html',           label:'Seguranca'},
  {href:'sandbox.html',             label:'Sandbox & MOCK'},
  {href:'migracao.html',            label:'Guia de Migracao'},
  {href:'recipes.html',             label:'Recipes'},
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

/* ── INJECT MOBILE SIDEBAR TOGGLE ───────────────────────── */
const sidebar=document.querySelector('.sidebar');
if(sidebar && topnavRight){
  /* overlay */
  const overlay=document.createElement('div');
  overlay.id='sidebarOverlay';
  overlay.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(3px);z-index:399;';
  overlay.onclick=closeSidebar;
  document.body.appendChild(overlay);

  /* hamburger button */
  const ham=document.createElement('button');
  ham.className='topnav-icon-btn topnav-hamburger';
  ham.title='Menu';
  ham.innerHTML=`<svg id="hamIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  ham.onclick=toggleSidebar;
  topnavRight.appendChild(ham);

  /* style: only show ham on small screens */
  const hamStyle=document.createElement('style');
  hamStyle.textContent=`
    .topnav-hamburger{display:none;}
    @media(max-width:900px){
      .topnav-hamburger{display:flex;}
      .sidebar{transform:translateX(-100%);transition:transform 0.25s ease;z-index:450;}
      .sidebar.mob-open{transform:translateX(0);}
    }
  `;
  document.head.appendChild(hamStyle);
}
window.toggleSidebar=function(){
  const s=document.querySelector('.sidebar');
  const o=document.getElementById('sidebarOverlay');
  if(!s)return;
  const open=s.classList.toggle('mob-open');
  if(o)o.style.display=open?'block':'none';
};
window.closeSidebar=function(){
  const s=document.querySelector('.sidebar');
  const o=document.getElementById('sidebarOverlay');
  if(s)s.classList.remove('mob-open');
  if(o)o.style.display='none';
};

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

/* ── AUTO ANCHOR LINKS ON HEADINGS ───────────────────────── */
function slugify(text){
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g,'')
    .replace(/[^a-z0-9\s-]/g,'').trim()
    .replace(/\s+/g,'-');
}
const main=document.querySelector('.shell .main');
if(main){
  const anchStyle=document.createElement('style');
  anchStyle.textContent=`
    .anchor-link{
      opacity:0;margin-left:0.4em;color:var(--text-3);
      text-decoration:none;font-size:0.8em;font-weight:400;
      transition:opacity 0.15s ease;
      font-family:var(--font-mono);
    }
    h2:hover .anchor-link,h3:hover .anchor-link{opacity:1;}
  `;
  document.head.appendChild(anchStyle);

  main.querySelectorAll('h2,h3').forEach(h=>{
    const text=h.textContent.replace(/[#¶]/g,'').trim();
    const id=h.id||slugify(text);
    if(!h.id)h.id=id;
    const a=document.createElement('a');
    a.className='anchor-link';
    a.href='#'+id;
    a.textContent='#';
    a.title='Link direto para esta seção';
    h.appendChild(a);
  });
}

/* ── AUTO TOC ────────────────────────────────────────────── */
const tocEl=document.querySelector('.subpage-toc');
if(tocEl&&main){
  const headings=Array.from(main.querySelectorAll('h2[id],h3[id]'));
  if(headings.length>2){
    let tocHTML=`<div class="toc-label">Nesta página</div>`;
    headings.forEach(h=>{
      const isH3=h.tagName==='H3';
      const label=h.textContent.replace('#','').trim();
      tocHTML+=`<a class="toc-item${isH3?' toc-item-sub':''}" href="#${h.id}" style="${isH3?'padding-left:1rem;':''}">${label}</a>`;
    });
    tocEl.innerHTML=tocHTML;

    /* highlight active on scroll */
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const id=entry.target.id;
        const link=tocEl.querySelector(`[href="#${id}"]`);
        if(link)link.classList.toggle('active',entry.isIntersecting);
      });
    },{rootMargin:'-10% 0px -80% 0px'});
    headings.forEach(h=>observer.observe(h));
  } else {
    tocEl.style.display='none';
  }
}

/* ── PREV/NEXT NAV ───────────────────────────────────────── */
const currentPage=location.pathname.split('/').pop()||'index.html';
const currentIdx=PAGE_ORDER.findIndex(p=>p.href===currentPage);
if(currentIdx!==-1&&main){
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
  main.appendChild(nav);
}

/* ── HELPFUL WIDGET ──────────────────────────────────────── */
if(main){
  const widget=document.createElement('div');
  widget.className='helpful-widget';
  widget.innerHTML=`
    <span class="helpful-label">Esta página foi útil?</span>
    <div class="helpful-btns">
      <button class="helpful-btn yes" onclick="voteHelpful(this,true)">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
        Sim
      </button>
      <button class="helpful-btn no" onclick="voteHelpful(this,false)">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"/><path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"/></svg>
        Não
      </button>
    </div>
    <span class="helpful-github">Encontrou um erro? <a href="https://github.com/vitinh0z/orquestraio/issues" target="_blank" rel="noopener">Abrir issue →</a></span>
  `;
  /* insert before page-nav if exists, else append */
  const pageNav=main.querySelector('.page-nav');
  if(pageNav) main.insertBefore(widget,pageNav);
  else main.appendChild(widget);
}
window.voteHelpful=function(btn,positive){
  const widget=btn.closest('.helpful-widget');
  widget.innerHTML=`<span class="helpful-label" style="color:var(--brand);">${positive?'Obrigado pelo feedback! 🙌':'Obrigado — vamos melhorar esta página.'}</span>`;
};

})();
