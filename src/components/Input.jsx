import React from 'react'

export default function Input({ className='', ...props }){
  return (
    <input className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-sky-300 focus:ring-4 focus:ring-sky-100 ${className}`} {...props} />
  )
}
