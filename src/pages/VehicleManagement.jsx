import { useState, useMemo } from 'react';
import {
  Truck,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Trash2,
  Wrench,
  Fuel,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { vehicleStatusConfig, formatNumber, formatDate } from '../utils/formatters';

export const VehicleManagement = () => {
  const { vehicles, drivers, addVehicle, updateVehicle, deleteVehicle, stats } = useLogistics();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Form state
  const defaultFormData = {
    plateNumber: '',
    type: 'รถ 4 ล้อตู้ทึบ (4-Wheel Box Truck)',
    brand: '',
    capacityKg: 2500,
    volumeCbm: 12,
    fuelType: 'ดีเซล (B7)',
    status: 'available',
    assignedDriverId: '',
    currentLocation: 'ศูนย์กระจายสินค้า ลาดกระบัง',
    mileageKm: 50000,
    fuelLevelPercent: 90,
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        v.plateNumber?.toLowerCase().includes(q) ||
        v.brand?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.assignedDriverName?.toLowerCase().includes(q) ||
        v.currentLocation?.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || v.status === statusFilter;
      const matchType = typeFilter === 'all' || v.type.includes(typeFilter);

      return matchQuery && matchStatus && matchType;
    });
  }, [vehicles, searchQuery, statusFilter, typeFilter]);

  const handleOpenEdit = (v) => {
    setSelectedVehicle(v);
    setFormData({
      plateNumber: v.plateNumber || '',
      type: v.type || '',
      brand: v.brand || '',
      capacityKg: v.capacityKg || 0,
      volumeCbm: v.volumeCbm || 0,
      fuelType: v.fuelType || 'ดีเซล (B7)',
      status: v.status || 'available',
      assignedDriverId: v.assignedDriverId || '',
      currentLocation: v.currentLocation || '',
      mileageKm: v.mileageKm || 0,
      fuelLevelPercent: v.fuelLevelPercent || 80,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (v) => {
    setSelectedVehicle(v);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedVehicle) {
      try {
        await deleteVehicle(selectedVehicle.id);
        success('ลบข้อมูลสำเร็จ', `ยานพาหนะทะเบียน ${selectedVehicle.plateNumber} ถูกลบออกจากระบบแล้ว`);
      } catch (err) {
        error('ไม่สามารถลบยานพาหนะได้', err.message);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedVehicle(null);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plateNumber.trim()) {
      error('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุเลขทะเบียนรถ');
      return;
    }

    const assignedDriver = drivers.find((d) => String(d.id) === String(formData.assignedDriverId));

    try {
      const newV = await addVehicle({
        ...formData,
        capacityKg: Number(formData.capacityKg) || 0,
        volumeCbm: Number(formData.volumeCbm) || 0,
        mileageKm: Number(formData.mileageKm) || 0,
        fuelLevelPercent: Number(formData.fuelLevelPercent) || 100,
        assignedDriverName: assignedDriver ? (assignedDriver.name || assignedDriver.full_name) : 'ไม่มีผู้ขับขี่ที่มอบหมาย',
      });

      success('เพิ่มยานพาหนะสำเร็จ', `ยานพาหนะทะเบียน ${newV?.plateNumber || formData.plateNumber} ถูกเพิ่มเข้าระบบแล้ว`);
      setIsAddModalOpen(false);
      setFormData(defaultFormData);
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเพิ่มยานพาหนะ', err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plateNumber.trim()) {
      error('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุเลขทะเบียนรถ');
      return;
    }

    const assignedDriver = drivers.find((d) => String(d.id) === String(formData.assignedDriverId));

    try {
      await updateVehicle(selectedVehicle.id, {
        ...formData,
        capacityKg: Number(formData.capacityKg) || 0,
        volumeCbm: Number(formData.volumeCbm) || 0,
        mileageKm: Number(formData.mileageKm) || 0,
        fuelLevelPercent: Number(formData.fuelLevelPercent) || 0,
        assignedDriverName: assignedDriver ? (assignedDriver.name || assignedDriver.full_name) : 'ไม่มีผู้ขับขี่ที่มอบหมาย',
      });

      success('อัปเดตข้อมูลสำเร็จ', `ปรับปรุงข้อมูลยานพาหนะ ${selectedVehicle.plateNumber} เรียบร้อยแล้ว`);
      setIsEditModalOpen(false);
      setSelectedVehicle(null);
    } catch (err) {
      error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลยานพาหนะ', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ระบบบริหารจัดการยานพาหนะ (Vehicle Fleet Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ตรวจเช็กสถานะการใช้งาน ความจุ และรอบซ่อมบำรุงรถบรรทุกของบริษัท
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(defaultFormData);
            setIsAddModalOpen(true);
          }}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>เพิ่มยานพาหนะใหม่</span>
        </button>
      </div>

      {/* Fleet Stats Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">รถทั้งหมดในระบบ</span>
          <p className="text-2xl font-bold text-slate-900 font-mono">{stats.totalVehicles} คัน</p>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 block mb-1">พร้อมใช้งาน</span>
          <p className="text-2xl font-bold text-emerald-700 font-mono">{stats.availableVehicles} คัน</p>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 shadow-xs">
          <span className="text-xs font-semibold text-blue-800 block mb-1">กำลังวิ่งงาน</span>
          <p className="text-2xl font-bold text-blue-700 font-mono">{stats.inUseVehicles} คัน</p>
        </div>

        <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/70 shadow-xs">
          <span className="text-xs font-semibold text-rose-800 block mb-1">อยู่ระหว่างซ่อมบำรุง</span>
          <p className="text-2xl font-bold text-rose-700 font-mono">{stats.maintenanceVehicles} คัน</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาทะเบียนรถ, ยี่ห้อ, พนักงานขับรถ, พิกัดปัจจุบัน..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="available">พร้อมใช้งาน</option>
            <option value="in_use">กำลังวิ่งงาน</option>
            <option value="maintenance">ซ่อมบำรุง</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          >
            <option value="all">ประเภทรถทั้งหมด</option>
            <option value="4 ล้อ">4 ล้อ</option>
            <option value="6 ล้อ">6 ล้อ</option>
            <option value="10 ล้อ">10 ล้อ</option>
            <option value="18 ล้อ">18 ล้อ เทรลเลอร์</option>
            <option value="กระบะ">กระบะด่วน</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredVehicles.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="ไม่พบยานพาหนะที่ตรงกับเงื่อนไข"
            description="ลองค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อเพิ่มยานพาหนะใหม่"
            actionText="เพิ่มยานพาหนะใหม่"
            onAction={() => {
              setFormData(defaultFormData);
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 sm:px-6">ทะเบียนรถ / รหัส</th>
                  <th className="py-3 px-4">ยี่ห้อและประเภทรถ</th>
                  <th className="py-3 px-4">ความจุบรรทุก</th>
                  <th className="py-3 px-4">พนักงานขับรถ</th>
                  <th className="py-3 px-4">ระดับน้ำมัน & เลขไมล์</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 sm:px-6 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((vehicle) => {
                  const statusConf = vehicleStatusConfig[vehicle.status] || vehicleStatusConfig.available;
                  return (
                    <tr key={vehicle.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Plate */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 font-mono text-sm sm:text-base">
                          {vehicle.plateNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ID: {vehicle.id}
                        </div>
                      </td>

                      {/* Brand & Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {vehicle.brand}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {vehicle.type}
                        </div>
                      </td>

                      {/* Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">
                          {formatNumber(vehicle.capacityKg)} กก.
                        </div>
                        <div className="text-xs text-slate-500">
                          {vehicle.volumeCbm} CBM
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.assignedDriverName || 'ยังไม่มอบหมาย'}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                          ตำแหน่ง: {vehicle.currentLocation || '-'}
                        </div>
                      </td>

                      {/* Fuel & Mileage */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                vehicle.fuelLevelPercent > 40
                                  ? 'bg-emerald-500'
                                  : vehicle.fuelLevelPercent > 20
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${vehicle.fuelLevelPercent}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-semibold text-slate-700">
                            {vehicle.fuelLevelPercent}%
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          ไมล์: {formatNumber(vehicle.mileageKm)} กม.
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusConf.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(vehicle)}
                            title="แก้ไขข้อมูลรถ"
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(vehicle)}
                            title="ลบรายการ"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มยานพาหนะใหม่เข้ากองรถ"
        subtitle="บันทึกข้อมูลรถบรรทุกและกำหนดพนักงานขับรถประจำ"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ทะเบียนรถ (License Plate) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                placeholder="เช่น 70-5566 กทม."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยี่ห้อและรุ่นรถ (Brand / Model) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="เช่น Isuzu Giga FVZ 240"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทรถบรรทุก
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="รถ 4 ล้อตู้ทึบ (4-Wheel Box Truck)">รถ 4 ล้อตู้ทึบ (4-Wheel Box Truck)</option>
                <option value="รถ 6 ล้อตู้ควบคุมอุณหภูมิ (Refrigerated 6-Wheeler)">รถ 6 ล้อตู้ควบคุมอุณหภูมิ (Refrigerated 6-Wheeler)</option>
                <option value="รถ 6 ล้อเปิดข้าง (6-Wheel Side Curtain)">รถ 6 ล้อเปิดข้าง (6-Wheel Side Curtain)</option>
                <option value="รถ 10 ล้อตู้ทึบ (10-Wheel Cargo Truck)">รถ 10 ล้อตู้ทึบ (10-Wheel Cargo Truck)</option>
                <option value="รถ 10 ล้อพื้นเรียบ (10-Wheel Flatbed)">รถ 10 ล้อพื้นเรียบ (10-Wheel Flatbed)</option>
                <option value="รถหัวลากเทรลเลอร์ 18 ล้อ (18-Wheel Semi-Trailer)">รถหัวลากเทรลเลอร์ 18 ล้อ (18-Wheel Semi-Trailer)</option>
                <option value="รถกระบะทึบขนส่งด่วน (Express Van)">รถกระบะทึบขนส่งด่วน (Express Van)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะเริ่มต้น
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="available">พร้อมใช้งาน (Available)</option>
                <option value="in_use">กำลังวิ่งงาน (In Use)</option>
                <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ความจุบรรทุกสูงสุด (กก.)
              </label>
              <input
                type="number"
                value={formData.capacityKg}
                onChange={(e) => setFormData({ ...formData, capacityKg: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                พนักงานขับรถประจำ
              </label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ยังไม่มอบหมาย --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
            >
              บันทึกยานพาหนะ
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`แก้ไขข้อมูลยานพาหนะ: ${selectedVehicle?.plateNumber}`}
        subtitle="ปรับปรุงสถานะ คนขับ และข้อมูลทางเทคนิค"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ทะเบียนรถ
              </label>
              <input
                type="text"
                value={formData.plateNumber}
                onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยี่ห้อและรุ่นรถ
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะยานพาหนะ
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="available">พร้อมใช้งาน (Available)</option>
                <option value="in_use">กำลังวิ่งงาน (In Use)</option>
                <option value="maintenance">ซ่อมบำรุง (Maintenance)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                พนักงานขับรถประจำ
              </label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ยังไม่มอบหมาย --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับน้ำมันคงเหลือ (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.fuelLevelPercent}
                onChange={(e) => setFormData({ ...formData, fuelLevelPercent: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระยะทางสะสม (กม.)
              </label>
              <input
                type="number"
                value={formData.mileageKm}
                onChange={(e) => setFormData({ ...formData, mileageKm: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบยานพาหนะ"
        message={`คุณต้องการลบรถหมายเลขทะเบียน ${selectedVehicle?.plateNumber} (${selectedVehicle?.brand}) ออกจากระบบหรือไม่?`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  );
};
