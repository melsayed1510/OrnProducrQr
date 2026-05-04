export function normalizeSlug(input){
  const s = (input ?? '').toString().trim().toLowerCase()
  let out = s.replace(/\s+/g, '-')
  out = out.replace(/[^؀-ۿa-z0-9-]/g, '')
  out = out.replace(/-+/g, '-')
  out = out.replace(/^-+|-+$/g, '')
  return out
}
