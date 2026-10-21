import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'ไม่พบข้อมูล',
  description = 'ไม่มีข้อมูลตรงตามเงื่อนไขที่คุณค้นหาหรือยังไม่มีรายการในขณะนี้',
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const LoadingSpinner = ({ text = 'กำลังโหลดข้อมูล...' }) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3">
      <div className="w-9 h-9 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
      <span className="text-sm font-medium text-slate-500">{text}</span>
    </div>
  );
};
