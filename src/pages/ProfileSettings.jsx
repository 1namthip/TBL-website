import { useState } from 'react';
import {
  User,
  Building,
  Database,
  RotateCcw,
  Save,
  CheckCircle2,
  Server,
  ShieldCheck,
  Bell,
  Code,
  Layers,
  HardDrive,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ProfileSettings = () => {
  const { userProfile, companySettings, updateUserProfile, updateCompanySettings, resetToMockData } = useLogistics();
  const { user } = useAuth();
  const { success, info } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'company' | 'api' | 'data'

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    role: userProfile.role || '',
    department: userProfile.department || '',
    employeeId: userProfile.employeeId || '',
    branch: userProfile.branch || '',
  });

  // Company Form State
  const [companyForm, setCompanyForm] = useState({
    companyName: companySettings.companyName || '',
    englishName: companySettings.englishName || '',
    taxId: companySettings.taxId || '',
    headquarters: companySettings.headquarters || '',
    supportPhone: companySettings.supportPhone || '',
    supportEmail: companySettings.supportEmail || '',
  });

  // API Form State
  const [apiForm, setApiForm] = useState({
    apiBaseUrl: companySettings.apiBaseUrl === 'http://localhost:5000/api' ? 'http://localhost:3000/api' : (companySettings.apiBaseUrl || 'http://localhost:3000/api'),
    enableSmsAlerts: companySettings.enableSmsAlerts ?? true,
    enableEmailReports: companySettings.enableEmailReports ?? true,
  });

  // Reset Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(profileForm);
    success('บันทึกข้อมูลส่วนตัวเรียบร้อย', 'ข้อมูลผู้ใช้งานได้รับการอัปเดตแล้ว');
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    updateCompanySettings(companyForm);
    success('บันทึกข้อมูลองค์กรเรียบร้อย', 'ข้อมูลบริษัท TBL Logistics ได้รับการอัปเดตแล้ว');
  };

  const handleSaveApi = (e) => {
    e.preventDefault();
    updateCompanySettings(apiForm);
    success('บันทึกการตั้งค่าระบบเรียบร้อย', 'บันทึกการเชื่อมต่อ Endpoint สำหรับ Node.js สำเร็จ');
  };

  const handleTestApi = async () => {
    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const res = await fetch(`${apiForm.apiBaseUrl}/health`);
      const data = await res.json();
      if (res.ok && data.database === 'connected') {
        setApiTestResult({
          status: 'ready',
          message: `เชื่อมต่อ Node.js + Express API และฐานข้อมูล MySQL (${data.databaseName || 'tbl_smart_logistics'}) สำเร็จ!`,
          schemaCheck: 'สถานะ: Database Connected • พร้อมใช้งานตาราง delivery_tasks, vehicles, drivers, users',
        });
        success('เชื่อมต่อ API สำเร็จ', 'ระบบเชื่อมต่อ Backend Node.js และ MySQL เรียบร้อยแล้ว');
      } else {
        throw new Error(data.message || 'ไม่สามารถเชื่อมต่อฐานข้อมูลได้');
      }
    } catch (err) {
      setApiTestResult({
        status: 'error',
        message: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend API ได้',
        schemaCheck: `กรุณาตรวจสอบว่ารัน 'npm run dev' ในโฟลเดอร์ server ที่พอร์ต 3000 (${err.message})`,
      });
      error('การเชื่อมต่อล้มเหลว', 'ไม่สามารถเชื่อมต่อ Backend API กรุณาตรวจสอบสถานะเซิร์ฟเวอร์');
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleConfirmReset = () => {
    resetToMockData();
    success('รีเซ็ตข้อมูลสำเร็จ', 'ข้อมูลระบบจำลองถูกรีเซ็ตกลับเป็นค่าเริ่มต้นสมบูรณ์');
    setIsResetModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          ข้อมูลผู้ใช้และการตั้งค่าระบบ (Profile & System Settings)
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          จัดการข้อมูลส่วนตัว องค์กร การเชื่อมต่อฐานข้อมูล และการบริหารจัดการข้อมูลจำลอง
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 sm:space-x-4">
        {[
          { id: 'profile', label: 'ข้อมูลผู้ใช้งาน (Profile)', icon: User },
          { id: 'company', label: 'ข้อมูลองค์กร (Company)', icon: Building },
          { id: 'api', label: 'สถาปัตยกรรมระบบ (Backend & DB)', icon: Database },
          { id: 'data', label: 'จัดการข้อมูลจำลอง (Mock Data)', icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-4xl">
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white font-extrabold text-xl flex items-center justify-center shadow-md">
              {user?.avatar || 'NK'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{profileForm.name}</h3>
              <p className="text-xs sm:text-sm text-slate-500">{profileForm.role}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                รหัสพนักงาน: {profileForm.employeeId}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมลองค์กร
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ตำแหน่ง (Role)
                </label>
                <input
                  type="text"
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  แผนก / สังกัด
                </label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ศูนย์กระจายสินค้าประจำการ (Hub)
                </label>
                <input
                  type="text"
                  value={profileForm.branch}
                  onChange={(e) => setProfileForm({ ...profileForm, branch: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกการเปลี่ยนแปลง</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Company */}
      {activeTab === 'company' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-4xl">
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">
              ข้อมูลบริษัทและสำนักงานใหญ่ TBL Logistics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ข้อมูลนี้จะแสดงบนเอกสารใบกำกับการขนส่ง (Waybill) และรายงานของระบบ
            </p>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อบริษัท (ภาษาไทย)
                </label>
                <input
                  type="text"
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อบริษัท (English Name)
                </label>
                <input
                  type="text"
                  value={companyForm.englishName}
                  onChange={(e) => setCompanyForm({ ...companyForm, englishName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลขประจำตัวผู้เสียภาษี (Tax ID)
                </label>
                <input
                  type="text"
                  value={companyForm.taxId}
                  onChange={(e) => setCompanyForm({ ...companyForm, taxId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ส่วนกลาง
                </label>
                <input
                  type="text"
                  value={companyForm.supportPhone}
                  onChange={(e) => setCompanyForm({ ...companyForm, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมลติดต่อส่วนกลาง
                </label>
                <input
                  type="email"
                  value={companyForm.supportEmail}
                  onChange={(e) => setCompanyForm({ ...companyForm, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ที่อยู่สำนักงานใหญ่
              </label>
              <textarea
                rows={2}
                value={companyForm.headquarters}
                onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>บันทึกข้อมูลองค์กร</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Backend & Database Schema Spec */}
      {activeTab === 'api' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-4xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-700" />
              <h3 className="text-lg font-bold text-slate-900">
                สถาปัตยกรรมระบบสำหรับเชื่อมต่อ Node.js + Express.js + MySQL
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              โครงสร้างข้อมูลและ Endpoint ถูกออกแบบตามมาตรฐาน RESTful API เพื่อให้ต่อยอดสู่ระบบ Production ได้ง่าย
            </p>
          </div>

          <form onSubmit={handleSaveApi} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                API Base URL (Node.js & Express Service)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={apiForm.apiBaseUrl}
                  onChange={(e) => setApiForm({ ...apiForm, apiBaseUrl: e.target.value })}
                  placeholder="http://localhost:5000/api"
                  className="flex-1 px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={handleTestApi}
                  disabled={isTestingApi}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isTestingApi ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>ทดสอบเชื่อมต่อ (Test Connection)</span>
                </button>
              </div>
            </div>

            {apiTestResult && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {apiTestResult.message}
                </p>
                <p className="text-emerald-800 font-mono text-[11px]">
                  {apiTestResult.schemaCheck}
                </p>
              </div>
            )}
          </form>

          {/* MySQL Schema Spec Visualizer */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              <span>โครงสร้างตารางฐานข้อมูล MySQL (Database Tables Ready)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-900 text-sm block mb-1">
                  1. delivery_tasks
                </span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  id, tracking_number, customer_name, origin, destination, item_desc, weight_kg, status, priority, vehicle_id, driver_id, cost_thb, created_at
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-900 text-sm block mb-1">
                  2. vehicles
                </span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  id, plate_number, type, brand, capacity_kg, volume_cbm, fuel_level, mileage_km, status, assigned_driver_id
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-900 text-sm block mb-1">
                  3. drivers
                </span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  id, code, name, phone, email, license_type, license_number, experience_years, status, total_trips, rating
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-emerald-900 text-sm block mb-1">
                  4. delivery_timeline
                </span>
                <p className="text-slate-600 leading-relaxed font-mono text-[11px]">
                  id, task_id, status_title, description, actor, timestamp
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Mock Data Management */}
      {activeTab === 'data' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs max-w-4xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900">
              จัดการข้อมูลจำลอง (Mock Data State Management)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              ระบบนี้บันทึกข้อมูลใน Web Storage ของเบราว์เซอร์ เพื่อให้คุณสามารถทดสอบการเพิ่ม แก้ไข ลบข้อมูลได้จริง
            </p>
          </div>

          <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900">
            <h4 className="text-sm font-bold mb-1">ต้องการเริ่มต้นข้อมูลตัวอย่างใหม่หรือไม่?</h4>
            <p className="text-xs leading-relaxed mb-4">
              หากคุณได้ทดลองเพิ่ม แก้ไข หรือลบรายการงานจัดส่ง/ยานพาหนะ/พนักงานขับรถ แล้วต้องการกู้คืนข้อมูลตัวอย่างมาตรฐานสำหรับพรีเซนต์ Portfolio สามารถกดปุ่มรีเซ็ตด้านล่างได้ทันที
            </p>

            <button
              type="button"
              onClick={() => setIsResetModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตข้อมูลจำลองทั้งหมดกลับเป็นค่าเริ่มต้น</span>
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="ยืนยันการรีเซ็ตข้อมูลจำลอง"
        message="การดำเนินการนี้จะล้างข้อมูลงานจัดส่ง ยานพาหนะ และพนักงานที่คุณสร้างใหม่ และกู้คืนข้อมูลจำลองเริ่มต้นของ TBL Smart Logistics ทั้งหมด"
        confirmText="ยืนยันการรีเซ็ต"
        cancelText="ยกเลิก"
        type="warning"
      />
    </div>
  );
};
