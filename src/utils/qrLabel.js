import QRCode from 'qrcode'
import { buildProductUrl, resolveProductBase } from './format'

export async function makeQrLabelDataUrl(slug){
  const base = resolveProductBase()
  const url = buildProductUrl(base, slug)

  const qrDataUrl = await QRCode.toDataURL(url, {
    margin: 1,
    width: 1400,
    color: { dark: '#000000', light: '#FFFFFF' },
    errorCorrectionLevel: 'M'
  })

  const size = 2048
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, size, size)

  const pad = 84
  const cardX = pad
  const cardY = pad
  const cardW = size - pad*2
  const cardH = size - pad*2

  ctx.save()
  ctx.shadowColor = 'rgba(2,8,23,0.10)'
  ctx.shadowBlur = 52
  ctx.shadowOffsetY = 16
  ctx.shadowOffsetX = 0
  roundRect(ctx, cardX, cardY, cardW, cardH, 110)
  ctx.fillStyle = '#FFFFFF'
  ctx.fill()
  ctx.restore()

  ctx.save()
  roundRect(ctx, cardX, cardY, cardW, cardH, 110)
  ctx.strokeStyle = 'rgba(15,23,42,0.10)'
  ctx.lineWidth = 4
  ctx.stroke()
  ctx.restore()

  const qrSize = 1320
  const qrX = Math.round((size - qrSize) / 2)
  const qrY = 240

  const qrImg = await loadImage(qrDataUrl)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  const textY = qrY + qrSize + 170
  drawScanText(ctx, size/2, textY)

  return { url, png: canvas.toDataURL('image/png') }
}

function drawScanText(ctx, centerX, y){
  const text = 'Scan ORN'
  const fontSize = 118
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 ${fontSize}px Arial, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto`

  ctx.save()
  ctx.shadowColor = 'rgba(245,158,11,0.18)'
  ctx.shadowBlur = 12
  ctx.shadowOffsetY = 4
  ctx.fillStyle = '#0f172a'
  ctx.fillText(text, centerX, y)
  ctx.restore()
}

function roundRect(ctx, x, y, w, h, r){
  const radius = Math.min(r, w/2, h/2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function loadImage(src){
  return new Promise((resolve, reject)=>{
    const img = new Image()
    img.onload = ()=>resolve(img)
    img.onerror = reject
    img.src = src
  })
}
