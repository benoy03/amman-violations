import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Lock, User, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل تسجيل الدخول، تأكد من صحة اسم المستخدم وكلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100 relative overflow-hidden">
        {/* شريط جمالي علوي */}
        <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-600 via-brand-600 to-slate-900"></div>

        {/* رأس النموذج */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-brand-50 text-brand-700 rounded-2xl border border-brand-100 mb-3 shadow-inner">
            <Camera className="w-8 h-8" />
          </div>
          <div className="flex items-center justify-center gap-1 text-xs font-bold text-brand-700 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>المملكة الأردنية الهاشمية</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">أمانة عمّان الكبرى</h2>
          <p className="text-sm font-extrabold text-brand-800 mt-0.5">
            مديرية الرقابة الآلية والتحكم — قسم المخالفات
          </p>
          <p className="text-xs text-slate-500 mt-1">
            نظام كشف وتعديل مخالفات الكاميرات الرقابية
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-xs font-bold animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              اسم المستخدم
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium outline-none transition"
                placeholder="أدخل اسم المستخدم..."
              />
              <User className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 text-sm font-medium outline-none transition"
                placeholder="أدخل كلمة المرور..."
              />
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-xl transition-all duration-150 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{loading ? 'جاري التحقق...' : 'دخول إلى النظام'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
