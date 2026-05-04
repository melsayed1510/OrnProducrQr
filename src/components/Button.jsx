import React from 'react'

export default function Button({ variant='default', className='', ...props }){
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold transition active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed'
  const styles = {
    default: 'bg-white border border-slate-200 text-slate-900 hover:border-slate-300 shadow-soft',
    primary: 'bg-sky-500 text-white hover:bg-sky-600 shadow-soft',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200 hover:border-rose-300',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100'
  }
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />
}
