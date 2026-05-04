import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Input from '../components/Input'
import { signIn } from '../services/auth'
import { supabase } from '../services/supabase'

export default function LoginPage(){
  const nav = useNavigate()
  const [email, setEmail] = React.useState(import.meta.env.VITE_ADMIN_EMAIL || '')
  const [password, setPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(()=>{
    supabase.auth.getSession().then(({ data })=>{ if (data.session) nav('/') })
  }, [nav])

  async function submit(e){
    e.preventDefault()
    setError('')
    setBusy(true)
    try{ await signIn(email.trim(), password); nav('/') }
    catch (err){ setError(err?.message || 'فشل تسجيل الدخول') }
    finally { setBusy(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md rounded-[26px] border border-slate-200 bg-white p-6 shadow-soft">
        <div className="mb-5 grid gap-1 text-center">
          <div className="text-lg font-extrabold">تسجيل الدخول</div>
          <div className="text-xs font-bold text-slate-500">لوحة إدارة المنتجات</div>
        </div>
        {error ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-800">{error}</div> : null}
        <form className="grid gap-3" onSubmit={submit}>
          <div className="grid gap-2">
            <label className="text-xs font-extrabold">البريد الإلكتروني</label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-extrabold">كلمة المرور</label>
            <Input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          </div>
          <Button variant="primary" type="submit" disabled={busy} className="w-full">{busy ? 'جارٍ الدخول…' : 'دخول'}</Button>
        </form>
      </div>
    </div>
  )
}
