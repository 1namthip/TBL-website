import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLogistics } from '../../context/LogisticsContext';
import { useToast } from '../../context/ToastContext';
import { PlusCircle, Package, Truck, User, Calendar, MapPin, AlertCircle } from 'lucide-react';

export const AppLayout = () => {
  const { isAuthenticated } = useAuth();
  const { addTask, vehicles, drivers } = useLogistics();
  const { success, error } = useToast();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  // New Task Form State
  const initialForm = {
    customerName: '',
    contactPerson: '',
    contactPhone: '',
    origin: 'ศูนย์กระจายสินค้า TBL บางนา กม.19',
    destination: '',
    destinationAddress: '',
    itemDescription: '',
    itemCount: 1,
    weightKg: 100,
    volumeCbm: 1.0,
    priority: 'standard',
    status: 'pending',
    assignedVehicleId: '',
    assignedDriverId: '',
    costThb: 3500,
    notes: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});

  // If user is not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!formData.customerName.trim()) errors.customerName = 'กรุณาระบุชื่อลูกค้าหรือบริษัท';
    if (!formData.destination.trim()) errors.destination = 'กรุณาระบุปลายทางจัดส่ง';
    if (!formData.itemDescription.trim()) errors.itemDescription = 'กรุณาระบุรายละเอียดสินค้า';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      error('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ถูกต้อง');
      return;
    }

    const selectedVehicle = vehicles.find((v) => v.id === formData.assignedVehicleId);
    const selectedDriver = drivers.find((d) => d.id === formData.assignedDriverId);

    const newTask = addTask({
      ...formData,
      itemCount: Number(formData.itemCount) || 1,
      weightKg: Number(formData.weightKg) || 0,
      volumeCbm: Number(formData.volumeCbm) || 0,
      costThb: Number(formData.costThb) || 0,
      assignedVehiclePlate: selectedVehicle ? selectedVehicle.plateNumber : 'รอจัดสรร',
      assignedDriverName: selectedDriver ? selectedDriver.name : 'รอจัดสรร',
      assignedDriverPhone: selectedDriver ? selectedDriver.phone : '-',
    });

    success('สร้างงานจัดส่งสำเร็จ', `รหัสพัสดุ: ${newTask.trackingNumber} ถูกบันทึกเรียบร้อย`);
    setIsNewTaskModalOpen(false);
    setFormData(initialForm);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col flex-1 min-w-0">
        <Topbar
          setIsMobileOpen={setIsMobileOpen}
          onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 TBL Smart Logistics - Enterprise Fleet Management System</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span>สถานะ: ระบบทำงานปกติ</span>
              <span>•</span>
              <span>REST API Spec Ready (Node.js/MySQL)</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Quick Add Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title="สร้างงานจัดส่งใหม่ (Create Delivery Task)"
        subtitle="บันทึกข้อมูลคำสั่งจัดส่งสินค้าและมอบหมายยานพาหนะ"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อลูกค้า / บริษัทผู้รับ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="เช่น บจก. สยามเทรดดิ้ง กรุ๊ป"
                className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 ${
                  formErrors.customerName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {formErrors.customerName && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.customerName}</p>
              )}
            </div>

            {/* Contact Person & Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรติดต่อผู้รับ
              </label>
              <input
                type="text"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            {/* Origin */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ต้นทาง (Origin Hub)
              </label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
                placeholder="ศูนย์กระจายสินค้า TBL บางนา"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปลายทางจัดส่ง <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                placeholder="เช่น นิคมฯ แหลมฉบัง จ.ชลบุรี"
                className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 ${
                  formErrors.destination ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {formErrors.destination && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.destination}</p>
              )}
            </div>
          </div>

          {/* Detailed Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ที่อยู่จัดส่งโดยละเอียด
            </label>
            <input
              type="text"
              name="destinationAddress"
              value={formData.destinationAddress}
              onChange={handleInputChange}
              placeholder="เลขที่, อาคาร, ซอย, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Item Description, Weight & Count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดสินค้า <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="itemDescription"
                value={formData.itemDescription}
                onChange={handleInputChange}
                placeholder="เช่น ชิ้นส่วนยานยนต์, พัสดุ"
                className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 ${
                  formErrors.itemDescription ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
                }`}
              />
              {formErrors.itemDescription && (
                <p className="text-xs text-rose-500 mt-1">{formErrors.itemDescription}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                น้ำหนักรวม (กก.)
              </label>
              <input
                type="number"
                name="weightKg"
                value={formData.weightKg}
                onChange={handleInputChange}
                placeholder="100"
                min="1"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนชิ้น/กล่อง
              </label>
              <input
                type="number"
                name="itemCount"
                value={formData.itemCount}
                onChange={handleInputChange}
                placeholder="1"
                min="1"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Vehicle and Driver Assign */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มอบหมายยานพาหนะ
              </label>
              <select
                name="assignedVehicleId"
                value={formData.assignedVehicleId}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- รอจัดสรรยานพาหนะภายหลัง --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} ({v.type}) - สถานะ: {v.status === 'available' ? 'พร้อมใช้งาน' : v.status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มอบหมายพนักงานขับรถ
              </label>
              <select
                name="assignedDriverId"
                value={formData.assignedDriverId}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- รอจัดสรรพนักงานขับรถภายหลัง --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code}) - {d.status === 'active' ? 'พร้อมทำงาน' : d.status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความสำคัญ (Priority)
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="standard">ปกติ (Standard)</option>
                <option value="express">ด่วนพิเศษ (Express)</option>
                <option value="economy">ประหยัด (Economy)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะเริ่มต้น
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="in_transit">กำลังจัดส่ง (In Transit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ค่าบริการขนส่ง (บาท)
              </label>
              <input
                type="number"
                name="costThb"
                value={formData.costThb}
                onChange={handleInputChange}
                placeholder="3500"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              หมายเหตุ / คำแนะนำพิเศษ
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="เช่น ระวังสินค้าแตกหัก หรือข้อควรระวังในการส่งมอบ"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewTaskModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              บันทึกงานจัดส่ง
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
