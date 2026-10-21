import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  PlusCircle,
  Calendar,
  Check,
  ChevronDown,
  User,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Truck,
  Database,
} from 'lucide-react';
import { useLogistics } from '../../context/LogisticsContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatters';

export const Topbar = ({ setIsMobileOpen, onOpenNewTaskModal }) => {
  const { notifications, stats, markNotificationRead, markAllNotificationsRead, isBackendConnected } = useLogistics();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  // Map route to page title
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/tasks/')) return 'รายละเอียดงานจัดส่ง';
    switch (pathname) {
      case '/dashboard':
      case '/':
        return 'แดชบอร์ดภาพรวมการดำเนินงาน';
      case '/tasks':
        return 'ระบบจัดการงานจัดส่งสินค้า';
      case '/vehicles':
        return 'ระบบบริหารจัดการยานพาหนะ';
      case '/drivers':
        return 'ระบบจัดการข้อมูลพนักงานขับรถ';
      case '/routes':
        return 'ระบบวางแผนและติดตามเส้นทาง';
      case '/reports':
        return 'รายงานและวิเคราะห์ข้อมูลประสิทธิภาพ';
      case '/notifications':
        return 'ศูนย์การแจ้งเตือนและเหตุฉุกเฉิน';
      case '/settings':
        return 'ข้อมูลผู้ใช้และการตั้งค่าระบบ';
      default:
        return 'TBL Smart Logistics';
    }
  };

  const todayThai = new Intl.DateTimeFormat('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <header className="sticky top-0 z-30 h-18 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
          aria-label="เปิดเมนูนำทาง"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">
              {getPageTitle(location.pathname)}
            </h1>
            <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Hub บางนา
            </span>
            {isBackendConnected && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-300">
                <Database className="w-3 h-3 text-emerald-700" />
                <span>MySQL Live</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayThai}</span>
          </p>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเลขพัสดุ (TBL-...), ลูกค้า, ทะเบียนรถ, พนักงาน..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all placeholder:text-slate-400"
          />
        </form>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Task Button */}
        <button
          type="button"
          onClick={() => {
            if (onOpenNewTaskModal) {
              onOpenNewTaskModal();
            } else {
              navigate('/tasks?create=true');
            }
          }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-all duration-150"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">สร้างงานจัดส่ง</span>
          <span className="sm:hidden">สร้าง</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="การแจ้งเตือน"
          >
            <Bell className="w-5 h-5" />
            {stats.unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                {stats.unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Notification Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">การแจ้งเตือน</h4>
                  <p className="text-xs text-slate-500">
                    มี {stats.unreadNotificationsCount} รายการใหม่ที่ยังไม่ได้อ่าน
                  </p>
                </div>
                {stats.unreadNotificationsCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
                  >
                    อ่านทั้งหมด
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markNotificationRead(notif.id);
                      if (notif.taskId) navigate(`/tasks/${notif.taskId}`);
                      else if (notif.vehicleId) navigate('/vehicles');
                      setIsNotifOpen(false);
                    }}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notif.read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1.5 block">
                      {formatDate(notif.timestamp)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  ดูการแจ้งเตือนทั้งหมด
                  <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">
              {user?.avatar || 'TL'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {user?.name?.split(' ')[0] || 'ผู้ใช้งาน'}
              </p>
              <p className="text-[10px] text-slate-500 leading-none">
                {user?.roleThai || 'ผู้จัดการ'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Popover */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <div className="mt-2 text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60 inline-block">
                  {user?.roleThai}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  โปรไฟล์ของฉัน
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  ตั้งค่าระบบ TBL
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
