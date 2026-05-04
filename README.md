# لوحة إدارة المنتجات (React + Tailwind + Supabase)

## التشغيل
```bash
npm install
npm run dev
```

## قاعدة البيانات
نفّذ سكربت: `supabase/reset_and_create.sql`

## QR
- زر QR داخل المنتج يعرض نافذة فيها رابط قابل للضغط + زر معاينة + زر تحميل.
- زر (تصدير QR لكل المنتجات) يقوم بتنزيل ملف ZIP بأسماء الملفات = slug.

إذا كانت `VITE_PRODUCT_BASE_URL` فارغة سيتم استخدام:
`window.location.origin + "/p"`
