import { Link } from 'react-router-dom';
import { Truck, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <Truck className="w-8 h-8" />
        </div>
        <span className="font-mono text-3xl font-extrabold text-slate-900 block mb-1">
          404
        </span>
        <h3 className="text-lg font-bold text-slate-800 mb-2">
          ไม่พบหน้าที่คุณต้องการ
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
          หน้าที่คุณกำลังค้นหาอาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่ในระบบ TBL Smart Logistics
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>กลับไปยังแดชบอร์ดหลัก</span>
        </Link>
      </div>
    </div>
  );
};
