/*
  صفحة المنتج (Public)
  - Minimal Arabic-only
  - Query param ?p=ID
  - Load from Supabase (public read) with localStorage fallback
  - No extra texts / no navigation
*/

const STORAGE_KEY = 'qrps_products_cache_v1';

function qs(sel, root=document){ return root.querySelector(sel); }
function getParam(name){ return new URL(location.href).searchParams.get(name); }
function safeText(v){ return (v ?? '').toString(); }

function formatMoney(value){
  const n = Number(value);
  if (!isFinite(n)) return safeText(value);
  return `${n.toFixed(3)} د.ك`;
}

function parseEndOfDay(dateStr){
  if (!dateStr) return null;
  return new Date(dateStr + 'T23:59:59');
}

function isDiscountActive(p){
  const d = p?.discount;
  if (!d || !d.enabled) return false;
  const newPrice = Number(d.newPrice);
  const oldPrice = Number(p.price);
  if (!isFinite(newPrice) || !isFinite(oldPrice)) return false;
  if (newPrice >= oldPrice) return false;
  const end = parseEndOfDay(d.endDate);
  if (!end) return false;
  return end.getTime() >= Date.now();
}

function saleNote(endDate){
  const end = parseEndOfDay(endDate);
  if (!end) return '';
  const diff = end.getTime() - Date.now();
  const days = Math.max(0, Math.floor(diff / (1000*60*60*24)));
  const hours = Math.max(0, Math.floor((diff % (1000*60*60*24)) / (1000*60*60)));
  if (diff <= 0) return `حتى ${endDate}`;
  if (days === 0) return `حتى ${endDate} • متبقي ${hours} ساعة`;
  return `حتى ${endDate} • متبقي ${days} يوم`;
}

function renderEmpty(){
  qs('#app').innerHTML = '';
}

function renderProduct(p){
  const active = isDiscountActive(p);

  let priceHtml = `<div class="price-row"><div class="price">${formatMoney(p.price)}</div></div>`;
  let saleHtml = '';

  if (active){
    priceHtml = `
      <div class="price-row">
        <div class="price old">${formatMoney(p.price)}</div>
        <div class="price new">${formatMoney(p.discount.newPrice)}</div>
      </div>
    `;

    saleHtml = `
      <div style="margin-top:10px; display:grid; gap:10px; justify-items:center;">
        <div class="sale-badge">🔥 عرض لفترة محدودة</div>
        <div class="sale-note">${saleNote(p.discount.endDate)}</div>
      </div>
    `;
  }

  const igEnabled = p?.instagramVideo?.enabled === true;
  const igUrl = safeText(p?.instagramVideo?.url).trim();
  const showIg = igEnabled && igUrl.length > 0;

  const igBtn = showIg
    ? `<a class="btn primary" href="${igUrl}" target="_blank" rel="noopener">مشاهدة طريقة الاستخدام</a>`
    : '';

  qs('#app').innerHTML = `
    <article class="card">
      <img src="${safeText(p.image)}" alt="${safeText(p.name)}" />
      <div class="card-body">
        <h1 class="name">${safeText(p.name)}</h1>
        ${priceHtml}
        ${saleHtml}
        ${igBtn}
      </div>
    </article>
  `;
}

function getSupabase(){
  const cfg = window.APP_CONFIG || {};
  if (!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return null;
  /* global supabase */
  return supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
}

async function loadFromSupabaseById(id){
  const client = getSupabase();
  if (!client) return null;
  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return data;
}

async function loadFromCache(){
  const local = localStorage.getItem(STORAGE_KEY);
  if (!local) return [];
  try{ return JSON.parse(local) || []; }catch(e){ return []; }
}

function saveCache(products){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

async function loadFromJsonFallback(){
  const res = await fetch('./data/products.json', {cache:'no-store'});
  if (!res.ok) return [];
  return await res.json();
}

(async function init(){
  const id = getParam('p');
  if (!id){ renderEmpty(); return; }

  // 1) Supabase first
  try{
    const p0 = await loadFromSupabaseById(id);
    if (p0){
      // cache refresh (store minimal list update)
      const cache = await loadFromCache();
      const idx = cache.findIndex(x => x.id === p0.id);
      if (idx === -1) cache.push(p0);
      else cache[idx] = p0;
      saveCache(cache);

      let p = p0;
      if (p.discount?.enabled && !isDiscountActive(p)){
        p = JSON.parse(JSON.stringify(p));
        p.discount.enabled = false;
      }
      renderProduct(p);
      return;
    }
  }catch(e){}

  // 2) cache
  const cache = await loadFromCache();
  const c = cache.find(x => x.id === id);
  if (c){
    let p = c;
    if (p.discount?.enabled && !isDiscountActive(p)){
      p = JSON.parse(JSON.stringify(p));
      p.discount.enabled = false;
    }
    renderProduct(p);
    return;
  }

  // 3) json fallback
  const products = await loadFromJsonFallback();
  const j = products.find(x => x.id === id);
  if (!j){ renderEmpty(); return; }
  let p = j;
  if (p.discount?.enabled && !isDiscountActive(p)){
    p = JSON.parse(JSON.stringify(p));
    p.discount.enabled = false;
  }
  renderProduct(p);
})();
