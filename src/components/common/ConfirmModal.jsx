import { AlertTriangle, Trash2, Info } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'ยืนยันการทำรายการ',
  message = 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้ การกระทำนี้ไม่สามารถย้อนกลับได้',
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  type = 'danger', // danger | warning | primary
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <Trash2 className="w-6 h-6 text-rose-600" />,
      iconBg: 'bg-rose-100',
      btnBg: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-100',
      btnBg: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    primary: {
      icon: <Info className="w-6 h-6 text-emerald-600" />,
      iconBg: 'bg-emerald-100',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 focus:ring-emerald-600',
    },
  };

  const current = typeConfig[type] || typeConfig.danger;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="min-h-full flex items-center justify-center p-4 text-center">
        <div
          className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all border border-slate-200/80 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl ${current.iconBg} flex items-center justify-center shrink-0`}
            >
              {current.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-xs focus:outline-hidden focus:ring-2 focus:ring-offset-2 transition-colors ${current.btnBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
