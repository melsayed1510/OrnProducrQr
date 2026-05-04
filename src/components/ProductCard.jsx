import React from 'react'
import Button from './Button'
import Badge from './Badge'
import { formatMoney, isDiscountActive, discountPercent } from '../utils/format'

export default function ProductCard({ product, onEdit, onDelete, onQR, onDownloadQR }){
  const active = isDiscountActive(product)
  const pct = active ? discountPercent(product) : null

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="aspect-[16/11] w-full overflow-hidden bg-slate-100">
        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" loading="lazy" referrerPolicy="no-referrer" decoding="async" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://placehold.co/800x600?text=Image+Unavailable' }} />
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="grid gap-1">
            <div className="text-sm font-extrabold">{product.name}</div>
            <div className="text-xs font-bold text-slate-600">
              {active ? (
                <span>
                  <span className="ml-2 line-through text-slate-400">{formatMoney(product.price)}</span>
                  <span className="text-emerald-700">{formatMoney(product.discount_price)}</span>
                </span>
              ) : (
                <span>{formatMoney(product.price)}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {active ? (
              <div className="flex items-center gap-2">
                <Badge tone="sale">خصم     {pct != null ? <span className="text-xs font-extrabold text-rose-700">{pct}%</span> : null} </Badge>
                
              </div>
            ) : (
              <Badge tone="neutral">بدون خصم</Badge>
            )}
            <span className="font-mono text-[11px] text-slate-400">{product.slug}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="default" className="px-3 py-2 text-xs" onClick={()=>onEdit(product)}>تعديل</Button>
          <Button variant="danger" className="px-3 py-2 text-xs" onClick={()=>onDelete(product)}>حذف</Button>
          <Button variant="primary" className="px-3 py-2 text-xs" onClick={()=>onQR(product)}>QR</Button>
          <Button variant="default" className="px-3 py-2 text-xs" onClick={()=>onDownloadQR(product)}>تحميل الباركود</Button>
        </div>
      </div>
    </div>
  )
}
