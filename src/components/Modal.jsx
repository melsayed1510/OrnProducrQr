import React from 'react'

export default function Modal({ open, onClose, title, children, footer }){
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-extrabold">{title}</h2>
          <button className="rounded-xl px-3 py-2 text-sm font-extrabold text-slate-600 hover:bg-slate-100" onClick={onClose}>إغلاق</button>
        </div>
        <div className="max-h-[70vh] overflow-auto p-5">{children}</div>
        {footer ? <div className="border-t border-slate-100 p-4">{footer}</div> : null}
      </div>
    </div>
  )
}
