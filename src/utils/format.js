export function formatMoney(value){
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value ?? '')
  return `${n.toFixed(3)} د.ك`
}

export function isDiscountActive(p){
  if (!p.discount_enabled) return false
  if (p.discount_price == null) return false
  const oldP = Number(p.price)
  const newP = Number(p.discount_price)
  if (!Number.isFinite(oldP) || !Number.isFinite(newP) || newP >= oldP) return false
  if (p.discount_permanent) return true
  if (!p.discount_end_date) return false
  const end = new Date(p.discount_end_date + 'T23:59:59')
  return end.getTime() >= Date.now()
}

export function discountPercent(p){
  if (!p.discount_enabled || p.discount_price == null) return null
  const oldP = Number(p.price)
  const newP = Number(p.discount_price)
  if (!Number.isFinite(oldP) || !Number.isFinite(newP) || newP >= oldP) return null
  const pct = Math.round(((oldP - newP) / oldP) * 100)
  return Number.isFinite(pct) ? pct : null
}

export function buildProductUrl(base, slug){
  const b = (base || '').replace(/\/+$/,'')
  return `${b}/${slug}`
}

export function resolveProductBase(){
  return import.meta.env.VITE_PRODUCT_BASE_URL || `${window.location.origin}/p`
}
