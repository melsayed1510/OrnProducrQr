import React from 'react'
import JSZip from 'jszip'
import Button from '../components/Button'
import ProductCard from '../components/ProductCard'
import ProductFormModal from '../components/ProductFormModal'
import QRModal from '../components/QRModal'
import Pagination from '../components/Pagination'
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../services/products'
import { signOut } from '../services/auth'
import { makeQrDataUrl, downloadDataUrl, safeFileNameFromSlug } from '../utils/qr'

export default function DashboardPage(){
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')

  const [pageIndex, setPageIndex] = React.useState(1)
  const PAGE_SIZE = 12

  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState(null)

  const [qrOpen, setQrOpen] = React.useState(false)
  const [qrProduct, setQrProduct] = React.useState(null)

  const [exportBusy, setExportBusy] = React.useState(false)

  async function load(){
    setError('')
    setLoading(true)
    try{
      const data = await fetchProducts()
      setProducts(data)
      setPageIndex(1)
    } catch (e){
      setError(e?.message || 'فشل تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(()=>{ load() }, [])

  function openAdd(){ setEditing(null); setFormOpen(true) }
  function openEdit(p){ setEditing(p); setFormOpen(true) }

  async function onSave(payload){
    if (editing) await updateProduct(editing.id, payload)
    else await createProduct(payload)
    await load()
  }

  async function onDelete(p){
    if (!confirm(`حذف المنتج: ${p.name} ؟`)) return
    await deleteProduct(p.id)
    await load()
  }

  function onQR(p){ setQrProduct(p); setQrOpen(true) }

  async function onDownloadQR(p){
    const { png } = await makeQrDataUrl(p.slug)
    downloadDataUrl(png, `${safeFileNameFromSlug(p.slug)}.png`)
  }

  async function exportAll(){
    if (!products.length) return
    setExportBusy(true)
    try{
      const zip = new JSZip()
      for (const p of products){
        const { png } = await makeQrDataUrl(p.slug)
        zip.file(`${safeFileNameFromSlug(p.slug)}.png`, png.split(',')[1], { base64:true })
      }
      const blob = await zip.generateAsync({ type:'blob' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'QR_All_Products.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=>URL.revokeObjectURL(url), 5000)
    } catch {
      alert('فشل تصدير QR')
    } finally {
      setExportBusy(false)
    }
  }

  async function logout(){
    await signOut()
    location.href = '/login'
  }

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const safePage = Math.min(pageIndex, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const pagedProducts = products.slice(start, start + PAGE_SIZE)

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="grid gap-0.5">
            <div className="text-sm font-extrabold">لوحة إدارة المنتجات</div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" onClick={load}>تحديث</Button>
            <Button variant="default" onClick={exportAll} disabled={exportBusy}>{exportBusy ? 'جارٍ التصدير…' : 'تصدير QR لكل المنتجات'}</Button>
            <Button variant="primary" onClick={openAdd}>إضافة منتج</Button>
            <Button variant="ghost" onClick={logout}>خروج</Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl p-4">
        {error ? <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-800">{error}</div> : null}

        {loading ? (
          <div className="grid place-items-center py-16 text-sm font-extrabold text-slate-500">جارٍ التحميل…</div>
        ) : products.length ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pagedProducts.map(p => (
                <ProductCard key={p.id} product={p} onEdit={openEdit} onDelete={onDelete} onQR={onQR} onDownloadQR={onDownloadQR} />
              ))}
            </div>
            <Pagination page={safePage} totalPages={totalPages} onPage={setPageIndex} />
          </>
        ) : (
          <div className="grid place-items-center rounded-3xl border border-slate-200 bg-white py-16 shadow-soft">
            <div className="text-sm font-extrabold text-slate-500">لا توجد منتجات بعد</div>
          </div>
        )}
      </main>

      <ProductFormModal open={formOpen} onClose={()=>setFormOpen(false)} initial={editing} onSave={onSave} />
      <QRModal open={qrOpen} onClose={()=>setQrOpen(false)} product={qrProduct} />
    </div>
  )
}
