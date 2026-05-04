import React from 'react'

export default function Badge({ tone='neutral', children }){
  const tones = {
    neutral: 'bg-slate-100 text-slate-700',
    sale: 'bg-rose-50 text-rose-700 border border-rose-200',
  }
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ${tones[tone]}`}>{children}</span>
}
