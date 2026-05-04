/*
  لوحة الإدارة (Supabase)
  - Login: username=admin password=1234 (حسب المطلوب)
  - يتم ربط الدخول مع Supabase Auth عبر ADMIN_EMAIL في config.js
  - CRUD على جدول products
  - QR + Copy Link + Download QR
*/

const SESSION_KEY = 'qrps_admin_authed_v2';

// Required UI credentials
const UI_USER = 'admin';
const UI_PASS = '1234';

function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
function safeText(v){ return (v ?? '').toString(); }

function cfg(){ return window.APP_CONFIG || {}; }

function hasConfig(){
  const c = cfg();
  return !!(c.SUPABASE_URL && c.SUPABASE_ANON_KEY && c.ADMIN_EMAIL);
}

function getClient(){
  const c = cfg();
  if (!c.SUPABASE_URL || !c.SUPABASE_ANON_KEY) return null;
  /* global supabase */
  return supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
}

function showLoginError(msg){
  qs('#loginError').innerHTML = msg ? `<div class="notice-warn">${msg}</div>` : '';
}

function showConfigWarn(){
  const box = qs('#configWarn');
  if (!hasConfig()){
    box.style.display = '';
    box.innerHTML = `<div class="notice-warn">أكمل إعدادات Supabase داخل assets/config.js ثم أعد تحميل الصفحة.</div>`;
  }else{
    box.style.display = 'none';
    box.innerHTML = '';
  }
}

function requireAuth(){
  const authed = sessionStorage.getItem(SESSION_KEY) === '1';
  qs('#loginModal').classList.toggle('open', !authed);
  qs('#dashboard').style.display = authed ? '' : 'none';
  return authed;
}

async function logout(){
  sessionStorage.removeItem(SESSION_KEY);
  const client = getClient();
  if (client) await client.auth.signOut();
  requireAuth();
}

function openForm(){ qs('#formModal').classList.add('open'); }
function closeForm(){ qs('#formModal').classList.remove('open'); }

function uid(len=6){
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i=0;i<len;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)];
  return out;
}

function ensureUniqueId(products){
  let id = uid(5);
  while (products.some(x=>x.id===id)) id = uid(6);
  return id;
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

function formatMoney(value){
  const n = Number(value);
  if (!isFinite(n)) return safeText(value);
  return `${n.toFixed(3)} د.ك`;
}

function indexUrlFor(id){
  const url = new URL('index.html', location.href);
  url.searchParams.set('p', id);
  return url.href;
}

function toggleDiscountFields(){
  const on = qs('#discountEnabled').checked;
  qs('#discountPrice').disabled = !on;
  qs('#discountEnd').disabled = !on;
  qs('#discountWrap').style.opacity = on ? '1' : '.65';
}

function toggleIgField(){
  const on = qs('#igEnabled').checked;
  qs('#igUrl').disabled = !on;
  qs('#igUrl').style.opacity = on ? '1' : '.65';
}

function fillForm(p){
  qs('#productId').value = p?.id || '';
  qs('#name').value = p?.name || '';
  qs('#price').value = (p?.price ?? '');
  qs('#description').value = p?.description || '';
  qs('#image').value = p?.image || '';

  const d = p?.discount || {enabled:false, newPrice:'', endDate:''};
  qs('#discountEnabled').checked = !!d.enabled;
  qs('#discountPrice').value = (d?.newPrice ?? '');
  qs('#discountEnd').value = (d?.endDate ?? '');

  const ig = p?.instagramVideo || {enabled:true, url:''};
  qs('#igEnabled').checked = ig.enabled !== false;
  qs('#igUrl').value = ig.url || '';

  toggleDiscountFields();
  toggleIgField();
}

function readForm(){
  const id = qs('#productId').value.trim();
  const name = qs('#name').value.trim();
  const price = Number(qs('#price').value);
  const description = qs('#description').value.trim();
  const image = qs('#image').value.trim();

  const discountEnabled = qs('#discountEnabled').checked;
  const newPriceRaw = qs('#discountPrice').value;
  const newPrice = newPriceRaw === '' ? '' : Number(newPriceRaw);
  const endDate = qs('#discountEnd').value;

  const igEnabled = qs('#igEnabled').checked;
  const igUrl = qs('#igUrl').value.trim();

  return {
    id,
    name,
    price: isFinite(price) ? price : '',
    discount: {
      enabled: !!discountEnabled,
      newPrice: (newPriceRaw === '' ? '' : (isFinite(newPrice) ? newPrice : '')),
      endDate: endDate || ''
    },
    description,
    image,
    instagramVideo: {
      enabled: !!igEnabled,
      url: igUrl
    }
  };
}

function validate(p){
  const errs = [];
  if (!p.name) errs.push('اسم المنتج مطلوب');
  if (p.price === '' || !isFinite(Number(p.price))) errs.push('السعر مطلوب');
  if (!p.image) errs.push('رابط الصورة مطلوب');
  if (!p.description) errs.push('الوصف مطلوب');

  if (p.instagramVideo.enabled && !p.instagramVideo.url) errs.push('رابط إنستجرام مطلوب عند تفعيل الفيديو');

  if (p.discount.enabled){
    if (p.discount.newPrice === '' || !isFinite(Number(p.discount.newPrice))) errs.push('سعر الخصم مطلوب');
    if (!p.discount.endDate) errs.push('تاريخ الخصم مطلوب');
    if (isFinite(Number(p.discount.newPrice)) && Number(p.discount.newPrice) >= Number(p.price)) errs.push('سعر الخصم يجب أن يكون أقل من السعر');
  }

  return errs;
}

function getQrDataUrl(qrBox){
  const canvas = qrBox.querySelector('canvas');
  if (canvas) return canvas.toDataURL('image/png');
  const img = qrBox.querySelector('img');
  if (img && img.src) return img.src;
  return null;
}

function downloadDataUrl(dataUrl, filename){
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function copyText(text){
  try{ await navigator.clipboard.writeText(text); }
  catch(e){ prompt('انسخ الرابط:', text); }
}

async function fetchProducts(){
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('products').select('*');
  if (error) return [];
  return data || [];
}

async function upsertProduct(p){
  const client = getClient();
  if (!client) throw new Error('NO_CLIENT');
  const { error } = await client.from('products').upsert(p);
  if (error) throw error;
}

async function deleteProduct(id){
  const client = getClient();
  if (!client) throw new Error('NO_CLIENT');
  const { error } = await client.from('products').delete().eq('id', id);
  if (error) throw error;
}

function renderList(products){
  const tbody = qs('#tbody');
  tbody.innerHTML = '';
  products.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));

  for (const p of products){
    const tr = document.createElement('tr');
    const link = indexUrlFor(p.id);
    const active = isDiscountActive(p);

    tr.innerHTML = `
      <td>
        <div style="font-weight:900;">${safeText(p.name)}</div>
        <div style="margin-top:4px; color:var(--muted); font-weight:900; font-size:12px;">
          ${safeText(p.id)} • ${formatMoney(p.price)}${active ? ` → <span style="color:#16a34a;">${formatMoney(p.discount.newPrice)}</span>` : ''}
        </div>
      </td>
      <td>
        <div class="qr-box">
          <div class="qr" data-qr="${safeText(p.id)}"></div>
          <div style="display:grid; gap:8px;">
            <div class="kbd">${link}</div>
            <div class="small-actions">
              <button class="btn" type="button" data-copy="${safeText(p.id)}">نسخ الرابط</button>
              <button class="btn" type="button" data-dl="${safeText(p.id)}">تحميل QR</button>
            </div>
          </div>
        </div>
      </td>
      <td>
        <div class="small-actions">
          <button class="btn" type="button" data-edit="${safeText(p.id)}">تعديل</button>
          <button class="btn danger" type="button" data-del="${safeText(p.id)}">حذف</button>
        </div>
      </td>
    `;

    tbody.appendChild(tr);

    const qrBox = tr.querySelector(`[data-qr="${CSS.escape(p.id)}"]`);
    qrBox.innerHTML = '';
    /* global QRCode */
    new QRCode(qrBox, { text: link, width: 104, height: 104, correctLevel: QRCode.CorrectLevel.M });
  }

  qsa('[data-edit]').forEach(btn=>btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-edit');
    const p = products.find(x=>x.id===id);
    qs('#formTitle').textContent = 'تعديل منتج';
    fillForm(p);
    openForm();
  }));

  qsa('[data-del]').forEach(btn=>btn.addEventListener('click', async ()=>{
    const id = btn.getAttribute('data-del');
    const p = products.find(x=>x.id===id);
    if (!p) return;
    if (!confirm(`حذف المنتج: ${p.name} ؟`)) return;
    await deleteProduct(id);
    const next = await fetchProducts();
    renderList(next);
  }));

  qsa('[data-copy]').forEach(btn=>btn.addEventListener('click', async ()=>{
    const id = btn.getAttribute('data-copy');
    await copyText(indexUrlFor(id));
    btn.textContent = 'تم النسخ';
    setTimeout(()=>btn.textContent='نسخ الرابط', 1200);
  }));

  qsa('[data-dl]').forEach(btn=>btn.addEventListener('click', ()=>{
    const id = btn.getAttribute('data-dl');
    const box = qs(`[data-qr="${CSS.escape(id)}"]`);
    const dataUrl = getQrDataUrl(box);
    if (!dataUrl) return alert('تعذر استخراج صورة الـ QR');
    downloadDataUrl(dataUrl, `QR_${id}.png`);
  }));
}

async function seedFromJson(){
  const client = getClient();
  if (!client) return;
  const res = await fetch('./data/products.json', {cache:'no-store'});
  if (!res.ok) return;
  const items = await res.json();
  // ensure shape
  for (const it of items){
    it.createdAt = it.createdAt || Date.now();
    if (!it.instagramVideo) it.instagramVideo = {enabled:false, url:''};
    if (!it.discount) it.discount = {enabled:false, newPrice:'', endDate:''};
  }
  const { error } = await client.from('products').upsert(items);
  if (error) alert('فشل رفع البيانات');
  else alert('تم رفع البيانات');
}

(async function init(){
  qs('#logoutBtn').addEventListener('click', logout);

  // Login
  qs('#loginBtn').addEventListener('click', async ()=>{
    const u = (qs('#username').value || '').trim();
    const p = (qs('#password').value || '').trim();

    if (u !== UI_USER || p !== UI_PASS){
      showLoginError('بيانات الدخول غير صحيحة');
      return;
    }

    if (!hasConfig()){
      showLoginError('أكمل إعدادات Supabase داخل assets/config.js');
      return;
    }

    // Supabase Auth session
    const client = getClient();
    const email = cfg().ADMIN_EMAIL;
    const { error } = await client.auth.signInWithPassword({ email, password: p });
    if (error){
      showLoginError('فشل تسجيل الدخول في Supabase Auth');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, '1');
    showLoginError('');
    requireAuth();
    location.reload();
  });

  ['username','password'].forEach(id=>{
    qs('#'+id).addEventListener('keydown', (e)=>{ if (e.key === 'Enter') qs('#loginBtn').click(); });
  });

  showConfigWarn();
  if (!requireAuth()) return;

  if (!hasConfig()){
    showConfigWarn();
    return;
  }

  // Ensure user session exists (optional guard)
  const client = getClient();
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session){
    // sessionStorage says authed but supabase session missing
    sessionStorage.removeItem(SESSION_KEY);
    requireAuth();
    return;
  }

  // Actions
  qs('#addBtn').addEventListener('click', ()=>{
    qs('#formTitle').textContent = 'إضافة منتج';
    fillForm(null);
    openForm();
  });

  qs('#refreshBtn').addEventListener('click', async ()=>{
    const items = await fetchProducts();
    renderList(items);
  });

  qs('#seedBtn').addEventListener('click', async ()=>{
    if (!confirm('سيتم رفع بيانات products.json إلى Supabase (Upsert). متابعة؟')) return;
    await seedFromJson();
    const items = await fetchProducts();
    renderList(items);
  });

  qs('#closeForm').addEventListener('click', closeForm);
  qs('#cancelBtn').addEventListener('click', closeForm);
  qs('#formModal').addEventListener('click', (e)=>{ if (e.target.id === 'formModal') closeForm(); });

  qs('#discountEnabled').addEventListener('change', toggleDiscountFields);
  qs('#igEnabled').addEventListener('change', toggleIgField);

  qs('#saveBtn').addEventListener('click', async ()=>{
    const data = readForm();

    if (!data.instagramVideo.enabled) data.instagramVideo.url = data.instagramVideo.url || '';

    // Auto-disable expired discount on save
    if (data.discount.enabled){
      const end = parseEndOfDay(data.discount.endDate);
      if (end && end.getTime() < Date.now()) data.discount.enabled = false;
    }

    const errors = validate(data);
    qs('#formError').innerHTML = errors.length
      ? `<div class="notice-warn">${errors.join('<br>')}</div>`
      : '';
    if (errors.length) return;

    const items = await fetchProducts();

    const now = Date.now();
    if (!data.id){
      data.id = ensureUniqueId(items);
      data.createdAt = now;
    }else{
      const prev = items.find(x=>x.id===data.id);
      data.createdAt = prev?.createdAt || now;
    }

    await upsertProduct(data);

    const next = await fetchProducts();
    renderList(next);
    closeForm();
  });

  // Initial render
  const products = await fetchProducts();
  renderList(products);
})();
