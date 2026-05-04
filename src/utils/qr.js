import { makeQrLabelDataUrl } from './qrLabel'

export async function makeQrDataUrl(slug){
  return await makeQrLabelDataUrl(slug)
}

export function downloadDataUrl(dataUrl, filename){
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export function safeFileNameFromSlug(slug){
  return (slug || 'qr').toString().trim().replace(/[^a-z0-9-_؀-ۿ]/gi, '_')
}
