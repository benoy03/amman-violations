import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Lock, User, AlertCircle, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 4}s`,
  duration: `${3 + Math.random() * 4}s`,
  size: `${4 + Math.random() * 8}px`,
  opacity: 0.08 + Math.random() * 0.12,
}));

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول، تأكد من صحة بيانات الدخول');
      const el = document.getElementById('login-form');
      el?.classList.add('animate-shake');
      setTimeout(() => el?.classList.remove('animate-shake'), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(135deg, #070e1c 0%, #0c1932 40%, #0d1f3c 70%, #081526 100%)' }}>
      
      {/* خلفية الأنماط الهندسية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* شبكة خطوط دقيقة */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* دوائر ضوئية */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2668e5 0%, transparent 70%)' }} />
        <div className="absolute -bottom-48 -left-24 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #0d9488 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />

        {/* جزيئات عائمة */}
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-brand-400"
            style={{
              left: p.left,
              bottom: '-20px',
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              animation: `float ${p.duration} ${p.delay} ease-in-out infinite alternate`,
            }}
          />
        ))}

        {/* خطوط متوهجة */}
        <div className="absolute top-0 left-1/4 w-px h-full opacity-10"
          style={{ background: 'linear-gradient(180deg, transparent 0%, #2668e5 50%, transparent 100%)' }} />
        <div className="absolute top-0 right-1/3 w-px h-full opacity-8"
          style={{ background: 'linear-gradient(180deg, transparent 0%, #0d9488 50%, transparent 100%)' }} />
      </div>

      {/* البطاقة الرئيسية */}
      <div
        className={`relative w-full max-w-md mx-4 transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* الهالة الضوئية خلف البطاقة */}
        <div className="absolute inset-0 rounded-4xl opacity-30 blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(38,104,229,0.4), rgba(13,148,136,0.2))' }} />

        <div className="relative bg-white/[0.06] backdrop-blur-2xl rounded-4xl border border-white/10 shadow-2xl overflow-hidden">
          {/* شريط لوني علوي */}
          <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #2668e5, #0d9488, #7c3aed, #2668e5)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }} />

          <div className="p-8 sm:p-10">
            {/* ترويسة */}
            <div
              className={`text-center mb-8 transition-all duration-500 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              {/* شعار النظام */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative mx-auto"
                style={{ background: 'linear-gradient(135deg, rgba(38,104,229,0.3), rgba(13,148,136,0.2))', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="absolute inset-0 rounded-3xl animate-pulse-glow" style={{ background: 'rgba(38,104,229,0.1)' }} />
                <Camera className="w-9 h-9 text-brand-300 relative z-10" />
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-px flex-1 max-w-12 bg-gradient-to-r from-transparent to-white/20" />
                <span className="text-xs font-bold text-blue-300 tracking-widest uppercase">المملكة الأردنية الهاشمية</span>
                <div className="h-px flex-1 max-w-12 bg-gradient-to-l from-transparent to-white/20" />
              </div>

              <h1 className="text-2xl font-black text-white mb-1">
                أمانة عمّان الكبرى
              </h1>
              <p className="text-sm font-bold text-brand-300">
                مديرية الرقابة الآلية والتحكم
              </p>
              <p className="text-xs text-slate-400 font-medium mt-1">
                نظام إدارة مخالفات الكاميرات الرقابية
              </p>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl border flex items-center gap-3 text-xs font-bold animate-slide-down"
                style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* نموذج الدخول */}
            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              {/* حقل اسم المستخدم */}
              <div className={`transition-all duration-500 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  اسم المستخدم
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل اسم المستخدم..."
                    className="w-full px-4 py-3 pr-11 rounded-xl text-sm font-bold text-white placeholder-slate-500 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={e => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(38,104,229,0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(38,104,229,0.15)';
                    }}
                    onBlur={e => {
                      e.target.style.background = 'rgba(255,255,255,0.07)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <User className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" style={{ width: '18px', height: '18px' }} />
                </div>
              </div>

              {/* حقل كلمة المرور */}
              <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور..."
                    className="w-full px-4 py-3 pr-11 pl-11 rounded-xl text-sm font-bold text-white placeholder-slate-500 outline-none transition-all duration-200"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                    onFocus={e => {
                      e.target.style.background = 'rgba(255,255,255,0.1)';
                      e.target.style.borderColor = 'rgba(38,104,229,0.6)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(38,104,229,0.15)';
                    }}
                    onBlur={e => {
                      e.target.style.background = 'rgba(255,255,255,0.07)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.12)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <Lock className="absolute right-3.5 top-3.5 text-slate-500" style={{ width: '18px', height: '18px' }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff style={{ width: '18px', height: '18px' }} /> : <Eye style={{ width: '18px', height: '18px' }} />}
                  </button>
                </div>
              </div>

              {/* زر الدخول */}
              <div className={`transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button
                  type="submit"
                  id="login-btn"
                  disabled={loading}
                  className="w-full py-3.5 px-4 font-black rounded-xl text-sm text-white transition-all duration-200 flex items-center justify-center gap-2.5 mt-2 ripple"
                  style={{
                    background: loading
                      ? 'rgba(38,104,229,0.5)'
                      : 'linear-gradient(135deg, #2668e5 0%, #1d52d2 100%)',
                    boxShadow: loading ? 'none' : '0 8px 25px -5px rgba(38,104,229,0.5)',
                  }}
                  onMouseEnter={e => !loading && (e.target.style.transform = 'translateY(-1px)')}
                  onMouseLeave={e => (e.target.style.transform = 'translateY(0)')}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري التحقق من البيانات...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>دخول إلى النظام</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* التذييل */}
            <div className={`mt-8 text-center transition-all duration-500 delay-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-bold">
                <Sparkles className="w-3 h-3 text-slate-600" />
                <span>نظام مؤمن ومشفر — للاستخدام الرسمي فقط</span>
              </div>
              <p className="text-[10px] text-slate-600 mt-1 font-medium">
                قسم المخالفات — مديرية الرقابة الآلية والتحكم
              </p>
            </div>
          </div>
        </div>

        {/* بطاقة معلومات النظام */}
        <div className={`mt-5 grid grid-cols-3 gap-3 transition-all duration-500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {[
            { label: 'تسجيل المخالفات', val: 'لحظي', color: '#2668e5' },
            { label: 'الكاميرات النشطة', val: 'متصلة', color: '#0d9488' },
            { label: 'الأمان', val: 'مشفر', color: '#7c3aed' },
          ].map((item) => (
            <div key={item.label} className="text-center py-3 px-2 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-xs font-black mb-0.5" style={{ color: item.color }}>{item.val}</div>
              <div className="text-[10px] text-slate-500 font-bold">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
