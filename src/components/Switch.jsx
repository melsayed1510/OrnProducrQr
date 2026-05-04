import React from 'react'

export default function Switch({ checked, onChange, title, subtitle }){
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-3">
      <div className="grid gap-1">
        <div className="text-sm font-extrabold">{title}</div>
        {subtitle ? <div className="text-xs font-bold text-slate-500">{subtitle}</div> : null}
      </div>
      <button type="button" onClick={()=>onChange(!checked)} className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-sky-500' : 'bg-slate-200'}`} role="switch" aria-checked={checked}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'right-1' : 'right-6'}`} />
      </button>
    </div>
  )
}
