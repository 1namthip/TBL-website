import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Truck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('manager@tbl-logistics.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login, quickLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await login(email, password);
      setIsLoading(false);
      if (res.success) {
        success('เข้าสู่ระบบสำเร็จ', 'ยินดีต้อนรับสู่ระบบ TBL Smart Logistics');
        navigate(from, { replace: true });
      } else {
        error('เข้าสู่ระบบไม่สำเร็จ', res.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (err) {
      setIsLoading(false);
      error('เข้าสู่ระบบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  const handleQuickLogin = (role) => {
    quickLogin(role);
    success('เข้าสู่ระบบจำลองสำเร็จ', `เข้าใช้งานในฐานะ: ${role.toUpperCase()}`);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#062416] via-[#093520] to-[#041a10] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-950/20 relative z-10">
        {/* Left Side: Enterprise Branding & Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#09331e] to-[#052213] p-8 sm:p-10 text-white flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-[#14472c]">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-emerald-950/50">
                <Truck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight">TBL</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 font-semibold tracking-wider">
                    SMART
                  </span>
                </div>
                <p className="text-xs text-emerald-200/70 font-light">
                  Logistics Enterprise Platform
                </p>
              </div>
            </div>

            {/* Value Proposition */}
            <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-3 text-white">
              ระบบบริหารจัดการงานขนส่งและโลจิสติกส์
            </h2>
            <p className="text-sm text-emerald-100/75 leading-relaxed mb-6">
              แพลตฟอร์มส่วนกลางสำหรับติดตามสถานะการจัดส่ง ยานพาหนะ พนักงานขับรถ
              และการวางแผนเส้นทางอย่างมีประสิทธิภาพในระดับองค์กร
            </p>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>คำนวณแดชบอร์ดและ KPI แบบเรียลไทม์</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>จัดการตารางงาน กรอง และบันทึกประวัติ Timeline</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-emerald-100/90">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>จำลองการเชื่อมต่อ Node.js, Express และ MySQL</span>
              </div>
            </div>
          </div>

          {/* System Badge */}
          <div className="mt-8 pt-6 border-t border-[#164d30] flex items-center justify-between text-xs text-emerald-300/80">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              ระบบภายในองค์กร (Intranet)
            </span>
            <span className="font-mono text-[11px] text-emerald-400/80">v2.4.0</span>
          </div>
        </div>

        {/* Right Side: Login Form & Persona Switcher */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                เข้าสู่ระบบพนักงาน
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                กรุณากรอกบัญชีผู้ใช้งานเพื่อเข้าสู่แดชบอร์ดบริหารงาน
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  อีเมลพนักงาน (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@tbl-logistics.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    รหัสผ่าน (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword('password123')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    ใช้รหัสผ่านทดสอบ
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="แสดงรหัสผ่าน"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me & forgot */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-600">จดจำการเข้าสู่ระบบ</span>
                </label>
                <span className="text-xs text-slate-400">ติดต่อฝ่ายไอทีเพื่อรีเซ็ตรหัส</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-900/10 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>เข้าสู่ระบบ Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>เข้าสู่ระบบด่วนสำหรับการทดสอบ (Quick Persona Login)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('manager')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                    ผู้จัดการ
                  </p>
                  <p className="text-[10px] text-slate-500">Operations</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('dispatcher')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                    เจ้าหน้าที่รถ
                  </p>
                  <p className="text-[10px] text-slate-500">Dispatcher</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('driver')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                    พนักงานขับ
                  </p>
                  <p className="text-[10px] text-slate-500">Lead Driver</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
