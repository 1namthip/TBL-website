import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Info,
  Clock,
  Check,
  Trash2,
  ArrowRight,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { EmptyState } from '../components/common/EmptyState';

export const Notifications = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, stats } = useLogistics();
  const { success } = useToast();
  const navigate = useNavigate();

  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'delay' | 'maintenance' | 'success' | 'info'

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (categoryFilter === 'all') return true;
      return n.type === categoryFilter;
    });
  }, [notifications, categoryFilter]);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    success('ทำเครื่องหมายว่าอ่านแล้ว', 'อัปเดตการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'delay':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'maintenance':
        return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationBg = (type, read) => {
    if (read) return 'bg-white border-slate-200/80 hover:bg-slate-50/70';
    switch (type) {
      case 'delay':
        return 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50/60';
      case 'maintenance':
        return 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/60';
      case 'success':
        return 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/60';
      default:
        return 'bg-blue-50/30 border-blue-200/80 hover:bg-blue-50/50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              ศูนย์การแจ้งเตือน (Notifications & Alerts)
            </h2>
            {stats.unreadNotificationsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                {stats.unreadNotificationsCount} ใหม่
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            รายงานเหตุฉุกเฉิน งานขนส่งล่าช้า และรอบซ่อมบำรุงยานพาหนะ
          </p>
        </div>

        {stats.unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-700" />
            <span>ทำเครื่องหมายว่าอ่านทั้งหมด</span>
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
        {[
          { id: 'all', label: 'ทั้งหมด' },
          { id: 'delay', label: 'งานล่าช้า (Delays)' },
          { id: 'maintenance', label: 'ซ่อมบำรุงรถ (Maintenance)' },
          { id: 'success', label: 'งานสำเร็จ (Completed)' },
          { id: 'info', label: 'ข้อมูลระบบ (System)' },
        ].map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="ไม่มีการแจ้งเตือนในหมวดนี้"
          description="ระบบของคุณทำงานอย่างราบรื่น ไม่มีการแจ้งเตือนใหม่ในขณะนี้"
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const isRead = notif.read;
            return (
              <div
                key={notif.id}
                className={`p-5 rounded-2xl border shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${getNotificationBg(
                  notif.type,
                  isRead
                )}`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2.5 rounded-xl bg-white shadow-xs border border-slate-200/60 shrink-0">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm font-bold ${!isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                      {formatDate(notif.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.taskId && (
                    <Link
                      to={`/tasks/${notif.taskId}`}
                      onClick={() => markNotificationRead(notif.id)}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>ดูงานขนส่ง</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {notif.vehicleId && (
                    <Link
                      to="/vehicles"
                      onClick={() => markNotificationRead(notif.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
                    >
                      <span>ดูข้อมูลรถ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {!isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="ทำเครื่องหมายว่าอ่านแล้ว"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
