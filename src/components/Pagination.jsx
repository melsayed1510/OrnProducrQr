import React from 'react'
import Button from './Button'

export default function Pagination({ page, totalPages, onPage }){
  if (totalPages <= 1) return null
  const pages = getPages(page, totalPages)

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Button variant="default" className="px-3 py-2 text-xs" onClick={()=>onPage(Math.max(1, page-1))} disabled={page===1}>السابق</Button>
      {pages.map((p, idx) =>
        p === '…'
          ? <span key={`e-${idx}`} className="px-2 text-xs font-extrabold text-slate-400">…</span>
          : <button key={p} onClick={()=>onPage(p)} className={`rounded-xl px-3 py-2 text-xs font-extrabold transition ${p===page ? 'bg-sky-500 text-white shadow-soft' : 'bg-white border border-slate-200 text-slate-800 hover:border-slate-300'}`}>{p}</button>
      )}
      <Button variant="default" className="px-3 py-2 text-xs" onClick={()=>onPage(Math.min(totalPages, page+1))} disabled={page===totalPages}>التالي</Button>
    </div>
  )
}

function getPages(current, total){
  const set = new Set([1, total, current, current-1, current+1, current-2, current+2])
  const nums = [...set].filter(n => n>=1 && n<=total).sort((a,b)=>a-b)
  const out = []
  for (let i=0;i<nums.length;i++){
    out.push(nums[i])
    const next = nums[i+1]
    if (next && next-nums[i] > 1) out.push('…')
  }
  return out
}
