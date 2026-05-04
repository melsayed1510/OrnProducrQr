import React from 'react'
import Modal from './Modal'
import Input from './Input'
import Textarea from './Textarea'
import Switch from './Switch'
import Button from './Button'
import { normalizeSlug } from '../utils/slug'
import { isSlugTaken } from '../services/products'
import { discountPercent } from '../utils/format'

const empty = {
  slug: '', name: '', price: '',
  discount_enabled: false, discount_permanent: false, discount_price: '', discount_end_date: '',
  description: '', image_url: '',
  instagram_enabled: false, instagram_video_url: ''
}

function normalizeUrl(u){
  const v = (u ?? '').toString().trim()
  if (!v) return v
  if (/^https?:\/\//i.test(v)) return v
  if (v.startsWith('//')) return `https:${v}`
  return `https://${v}`
}

export default function ProductFormModal({ open, onClose, initial, onSave }){
  const [form, setForm] = React.useState(empty)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(()=>{
    if (!open) return
    if (initial){
      setForm({
        slug: initial.slug || '',
        name: initial.name || '',
        price: initial.price ?? '',
        discount_enabled: !!initial.discount_enabled,
        discount_permanent: !!initial.discount_permanent,
        discount_price: initial.discount_price ?? '',
        discount_end_date: initial.discount_end_date ?? '',
        description: initial.description ?? '',
        image_url: initial.image_url || '',
        instagram_enabled: !!initial.instagram_enabled,
        instagram_video_url: initial.instagram_video_url ?? '',
      })
    } else {
      setForm(empty)
    }
    setError('')
  }, [open, initial])

  function update(patch){ setForm(prev => ({...prev, ...patch})) }

  async function submit(){
    setError('')
    const slug = normalizeSlug(form.slug)
    const name = form.name.trim()
    const image = normalizeUrl(form.image_url)

    if (!name) return setError('اسم المنتج مطلوب')
    if (!slug) return setError('Slug مطلوب')
    if (form.price === '' || !Number.isFinite(Number(form.price))) return setError('السعر مطلوب')
    if (!image) return setError('رابط الصورة مطلوب')

    if (form.discount_enabled){
      if (form.discount_price === '' || !Number.isFinite(Number(form.discount_price))) return setError('سعر الخصم مطلوب')
      if (Number(form.discount_price) >= Number(form.price)) return setError('سعر الخصم يجب أن يكون أقل من السعر')
      if (!form.discount_permanent && !form.discount_end_date) return setError('تاريخ انتهاء الخصم مطلوب')
    }

    if (form.instagram_enabled && !form.instagram_video_url.trim()) return setError('رابط فيديو إنستجرام مطلوب')

    setBusy(true)
    try{
      const taken = await isSlugTaken(slug, initial?.id || null)
      if (taken){ setError('Slug مستخدم بالفعل'); setBusy(false); return }

      const payload = {
        slug,
        name,
        price: Number(form.price),
        discount_enabled: !!form.discount_enabled,
        discount_permanent: form.discount_enabled ? !!form.discount_permanent : false,
        discount_price: form.discount_enabled ? Number(form.discount_price) : null,
        discount_end_date: form.discount_enabled ? (form.discount_permanent ? null : form.discount_end_date) : null,
        description: form.description.trim() || null,
        image_url: image,
        instagram_enabled: !!form.instagram_enabled,
        instagram_video_url: form.instagram_enabled ? form.instagram_video_url.trim() : null,
      }

      await onSave(payload)
      onClose()
    } catch(e){
      setError(e?.message || 'حدث خطأ')
    } finally {
      setBusy(false)
    }
  }

  const pct = discountPercent({
    price: form.price,
    discount_enabled: form.discount_enabled,
    discount_price: form.discount_price,
    discount_permanent: form.discount_permanent,
    discount_end_date: form.discount_end_date,
  })

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'تعديل منتج' : 'إضافة منتج'}
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={submit} disabled={busy}>{busy ? 'جارٍ الحفظ…' : 'حفظ'}</Button>
          <Button variant="ghost" onClick={onClose}>إلغاء</Button>
        </div>
      }
    >
      {error ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-800">{error}</div> : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-extrabold">اسم المنتج *</label>
          <Input value={form.name} onChange={e=>update({name:e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold">Slug *</label>
          <Input value={form.slug} onChange={e=>update({slug:e.target.value})} onBlur={()=>update({slug: normalizeSlug(form.slug)})} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold">السعر *</label>
          <Input type="number" step="0.001" value={form.price} onChange={e=>update({price:e.target.value})} />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-extrabold">رابط الصورة *</label>
          <Input value={form.image_url} onChange={e=>update({image_url:e.target.value})} />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <Switch checked={form.discount_enabled} onChange={v=>update({discount_enabled:v})} title="تفعيل الخصم" subtitle="" />
        {form.discount_enabled ? (
          <>
            <Switch checked={form.discount_permanent} onChange={v=>update({discount_permanent:v})} title="خصم دائم" subtitle="" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-extrabold">سعر الخصم *</label>
                <Input type="number" step="0.001" value={form.discount_price} onChange={e=>update({discount_price:e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-extrabold">نسبة الخصم</label>
                <Input value={pct==null? '' : `${pct}%`} readOnly />
              </div>
            </div>
            {!form.discount_permanent ? (
              <div className="space-y-2">
                <label className="text-xs font-extrabold">تاريخ انتهاء الخصم *</label>
                <Input type="date" value={form.discount_end_date} onChange={e=>update({discount_end_date:e.target.value})} />
              </div>
            ) : null}
          </>
        ) : null}

        <Switch checked={form.instagram_enabled} onChange={v=>update({instagram_enabled:v})} title="تفعيل فيديو إنستجرام" subtitle="" />
        {form.instagram_enabled ? (
          <div className="space-y-2">
            <label className="text-xs font-extrabold">رابط فيديو إنستجرام *</label>
            <Input value={form.instagram_video_url} onChange={e=>update({instagram_video_url:e.target.value})} />
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-xs font-extrabold">الوصف</label>
          <Textarea value={form.description} onChange={e=>update({description:e.target.value})} />
        </div>
      </div>
    </Modal>
  )
}
