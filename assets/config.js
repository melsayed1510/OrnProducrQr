// إعدادات Supabase
// 1) ضع SUPABASE_URL و SUPABASE_ANON_KEY من لوحة Supabase
// 2) أنشئ مستخدم Auth (Email/Password) للإدارة
// 3) اكتب ADMIN_EMAIL هنا (الإيميل الذي أنشأته)

window.APP_CONFIG = {
  SUPABASE_URL: "https://rxeeapndmpakcvzhijdv.supabase.co/rest/v1/",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4ZWVhcG5kbXBha2N2emhpamR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4Nzk2NzYsImV4cCI6MjA5MzQ1NTY3Nn0.s1p6lUuP84CseAKNPr2DtXzRDFm8_FWCODzzw4mPHDw",

  // مطلوبة لربط تسجيل دخول الأدمن مع Supabase Auth
  // واجهة الدخول ستظل: username=admin و password=1234 حسب المطلوب
  ADMIN_EMAIL: "qahr2012@gmail.com",
};
