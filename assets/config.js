// إعدادات Supabase
// 1) ضع SUPABASE_URL و SUPABASE_ANON_KEY من لوحة Supabase
// 2) أنشئ مستخدم Auth (Email/Password) للإدارة
// 3) اكتب ADMIN_EMAIL هنا (الإيميل الذي أنشأته)

window.APP_CONFIG = {
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",

  // مطلوبة لربط تسجيل دخول الأدمن مع Supabase Auth
  // واجهة الدخول ستظل: username=admin و password=1234 حسب المطلوب
  ADMIN_EMAIL: "",
};
