import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  MapPin,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useLogistics } from '../../context/LogisticsContext';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { stats } = useLogistics();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: 'แดชบอร์ดภาพรวม',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'จัดการงานจัดส่ง',
      path: '/tasks',
      icon: Package,
      badge: stats.pendingTasks + stats.inTransitTasks,
      badgeColor: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      name: 'ข้อมูลยานพาหนะ',
      path: '/vehicles',
      icon: Truck,
      badge: `${stats.availableVehicles}/${stats.totalVehicles}`,
      badgeColor: 'bg-slate-700 text-slate-300',
    },
    {
      name: 'พนักงานขับรถ',
      path: '/drivers',
      icon: Users,
      badge: null,
    },
    {
      name: 'วางแผนเส้นทาง',
      path: '/routes',
      icon: MapPin,
      badge: null,
    },
    {
      name: 'รายงานและสถิติ',
      path: '/reports',
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'การแจ้งเตือน',
      path: '/notifications',
      icon: Bell,
      badge: stats.unreadNotificationsCount > 0 ? stats.unreadNotificationsCount : null,
      badgeColor: 'bg-rose-500 text-white font-bold',
    },
    {
      name: 'ตั้งค่าและโปรไฟล์',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#092d1c] text-white flex flex-col transition-transform duration-300 ease-in-out border-r border-[#13442c] lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-18 px-6 flex items-center gap-3.5 border-b border-[#13442c] bg-[#072416]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-950/40 shrink-0">
            <Truck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-white tracking-tight leading-none">
                TBL
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold tracking-wider">
                SMART
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70 truncate mt-0.5 font-light">
              Logistics Enterprise System
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="px-5 py-3 border-b border-[#13442c]/60">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0e3b25] text-xs">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-emerald-100 font-medium text-[11px]">ระบบขนส่งพร้อมทำงาน</span>
            </div>
            <span className="text-[10px] text-emerald-300/80 font-mono">TH-ONLINE</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-emerald-400/60 uppercase">
            เมนูหลักของระบบ
          </div>

          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/30'
                      : 'text-emerald-100/75 hover:bg-[#11422a] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-5 h-5 shrink-0 opacity-85 group-hover:opacity-100" />
                  <span className="truncate">{item.name}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      item.badgeColor || 'bg-emerald-500/20 text-emerald-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[11px] font-semibold tracking-wider text-emerald-400/60 uppercase">
            ข้อมูลจำลองระบบ
          </div>
          <div className="px-3.5 py-3 rounded-xl bg-[#0c3822] text-xs text-emerald-200/80 space-y-1.5 border border-[#14472d]">
            <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>โหมดต้นแบบ (Mock Ready)</span>
            </div>
            <p className="text-[11px] text-emerald-100/60 leading-relaxed">
              รองรับการเชื่อมต่อ REST API กับ Node.js + Express + MySQL ในอนาคต
            </p>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#13442c] bg-[#072416]">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#0e3b25] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/30 shadow-xs">
                {user?.avatar || 'TL'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.name || 'ผู้ดูแลระบบ'}
                </p>
                <p className="text-[11px] text-emerald-300/70 truncate">
                  {user?.roleThai || 'ผู้จัดการฝ่ายปฏิบัติการ'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="ออกจากระบบ"
              className="p-1.5 rounded-lg text-emerald-300/60 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
