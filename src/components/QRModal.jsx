import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { resolveProductBase, buildProductUrl } from '../utils/format'
import { makeQrDataUrl, downloadDataUrl, safeFileNameFromSlug } from '../utils/qr'

export default function QRModal({ open, onClose, product }){
  const [dataUrl, setDataUrl] = React.useState('')
  const [link, setLink] = React.useState('')

  React.useEffect(()=>{
    let alive = true
    async function run(){
      if (!open || !product) return
      const { url, png } = await makeQrDataUrl(product.slug)
      if (!alive) return
      setLink(url)
      setDataUrl(png)
    }
    run()
    return ()=>{ alive = false }
  }, [open, product])

  function download(){
    if (!dataUrl || !product) return
    downloadDataUrl(dataUrl, `${safeFileNameFromSlug(product.slug)}.png`)
  }

  function preview(){
    if (!link) return
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  const base = resolveProductBase()
  const visibleLink = link || buildProductUrl(base, product?.slug || '')

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="QR"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-500">
            <a className="underline" href={visibleLink} target="_blank" rel="noreferrer">{visibleLink}</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" className="px-3 py-2 text-xs" onClick={preview}>معاينة</Button>
            <Button variant="primary" className="px-3 py-2 text-xs" onClick={download}>تحميل</Button>
          </div>
        </div>
      }
    >
      {product ? (
        <div className="grid place-items-center gap-4">
          <div className="text-sm font-extrabold">{product.name}</div>
          <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-soft">
            {dataUrl ? <img src={dataUrl} alt="QR" className="h-72 w-72" /> : null}
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
