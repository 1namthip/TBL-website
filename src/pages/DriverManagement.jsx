import { useState, useMemo } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Filter,
  Phone,
  Mail,
  Award,
  Star,
  Truck,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutGrid,
  List,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { driverStatusConfig, formatNumber } from '../utils/formatters';

export const DriverManagement = () => {
  const { drivers, vehicles, addDriver, updateDriver, deleteDriver, stats } = useLogistics();
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // Form state
  const defaultFormData = {
    name: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenseType: 'ชนิดที่ 2 (รถบรรทุก 4-6 ล้อ)',
    experienceYears: 5,
    assignedVehiclePlate: '',
    status: 'active',
    emergencyContact: '',
  };

  const [formData, setFormData] = useState(defaultFormData);

  // Filtered drivers
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q) ||
        d.licenseNumber?.toLowerCase().includes(q) ||
        d.assignedVehiclePlate?.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || d.status === statusFilter;

      return matchQuery && matchStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  const handleOpenEdit = (d) => {
    setSelectedDriver(d);
    setFormData({
      name: d.name || '',
      phone: d.phone || '',
      email: d.email || '',
      licenseNumber: d.licenseNumber || '',
      licenseType: d.licenseType || 'ชนิดที่ 2 (รถบรรทุก 4-6 ล้อ)',
      experienceYears: d.experienceYears || 1,
      assignedVehiclePlate: d.assignedVehiclePlate || '',
      status: d.status || 'active',
      emergencyContact: d.emergencyContact || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (d) => {
    setSelectedDriver(d);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedDriver) {
      try {
        await deleteDriver(selectedDriver.id);
        success('ลบข้อมูลสำเร็จ', `ลบข้อมูลพนักงาน ${selectedDriver.name || selectedDriver.full_name} ออกจากระบบแล้ว`);
      } catch (err) {
        error('ไม่สามารถลบข้อมูลพนักงานขับรถได้', err.message);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedDriver(null);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      error('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อ-นามสกุล และเบอร์โทรศัพท์');
      return;
    }

    try {
      const newD = await addDriver({
        ...formData,
        experienceYears: Number(formData.experienceYears) || 1,
        email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@tbl-logistics.com`,
      });

      success('เพิ่มพนักงานสำเร็จ', `เพิ่มข้อมูลคุณ ${newD?.name || formData.name} (${newD?.code || 'สำเร็จ'}) เรียบร้อยแล้ว`);
      setIsAddModalOpen(false);
      setFormData(defaultFormData);
    } catch (err) {
      error('เกิดข้อผิดพลาดในการเพิ่มพนักงาน', err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      error('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อ-นามสกุล และเบอร์โทรศัพท์');
      return;
    }

    try {
      await updateDriver(selectedDriver.id, {
        ...formData,
        experienceYears: Number(formData.experienceYears) || 1,
      });

      success('อัปเดตข้อมูลสำเร็จ', `ปรับปรุงข้อมูลพนักงาน ${selectedDriver.name || selectedDriver.full_name} เรียบร้อยแล้ว`);
      setIsEditModalOpen(false);
      setSelectedDriver(null);
    } catch (err) {
      error('เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงาน', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ระบบจัดการพนักงานขับรถ (Driver Management)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ฐานข้อมูลพนักงานขับรถขนส่ง ใบอนุญาตขับขี่ ทะเบียนรถประจำ และประวัติการปฏิบัติงาน
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
          <span>เพิ่มพนักงานขับรถ</span>
        </button>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block mb-1">พนักงานทั้งหมด</span>
          <p className="text-2xl font-bold text-slate-900 font-mono">{stats.totalDrivers} คน</p>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 block mb-1">พร้อมปฏิบัติงาน</span>
          <p className="text-2xl font-bold text-emerald-700 font-mono">{stats.activeDrivers} คน</p>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 shadow-xs">
          <span className="text-xs font-semibold text-blue-800 block mb-1">กำลังจัดส่งงาน</span>
          <p className="text-2xl font-bold text-blue-700 font-mono">{stats.onDutyDrivers} คน</p>
        </div>

        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-600 block mb-1">ลางาน / พักผ่อน</span>
          <p className="text-2xl font-bold text-slate-700 font-mono">{stats.onLeaveDrivers} คน</p>
        </div>
      </div>

      {/* Search, Filter & View Toggle */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อพนักงาน, รหัส EMP, เบอร์โทร, ใบขับขี่, ทะเบียนรถ..."
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

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="active">พร้อมปฏิบัติงาน</option>
            <option value="on_duty">กำลังจัดส่งงาน</option>
            <option value="on_leave">ลางาน / พักผ่อน</option>
          </select>

          {/* Grid vs Table View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="มุมมองการ์ด"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="มุมมองตาราง"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Driver List Display */}
      {filteredDrivers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="ไม่พบข้อมูลพนักงานขับรถ"
          description="ลองค้นหาด้วยคำอื่น หรือกดปุ่มด้านล่างเพื่อเพิ่มพนักงานใหม่"
          actionText="เพิ่มพนักงานขับรถใหม่"
          onAction={() => {
            setFormData(defaultFormData);
            setIsAddModalOpen(true);
          }}
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.map((driver) => {
            const statusConf = driverStatusConfig[driver.status] || driverStatusConfig.active;
            const initials = driver.name.split(' ').map((n) => n[0]).join('');

            return (
              <div
                key={driver.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 leading-tight">
                          {driver.name}
                        </h4>
                        <span className="text-xs font-mono text-emerald-800 font-semibold">
                          {driver.code}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border ${statusConf.color}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                      {statusConf.label}
                    </span>
                  </div>

                  {/* Details List */}
                  <div className="space-y-2 text-xs text-slate-600 py-3 border-y border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">เบอร์โทรศัพท์:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        {driver.phone}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ใบขับขี่:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]" title={driver.licenseType}>
                        {driver.licenseType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">รถประจำการ:</span>
                      <span className="font-bold text-slate-800 font-mono flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        {driver.assignedVehiclePlate || 'ไม่มี'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">ประสบการณ์ขับรถ:</span>
                      <span className="font-medium text-slate-800">{driver.experienceYears} ปี</span>
                    </div>
                  </div>

                  {/* Stats snippet */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 uppercase block">เที่ยววิ่งสะสม</span>
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        {formatNumber(driver.totalTrips || 0)} เที่ยว
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50">
                      <span className="text-[10px] text-slate-400 uppercase block">คะแนนความปลอดภัย</span>
                      <span className="text-sm font-bold text-emerald-700 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {driver.rating || 5.0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(driver)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDelete(driver)}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ลบ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4 sm:px-6">รหัส / ชื่อพนักงาน</th>
                  <th className="py-3 px-4">เบอร์โทรติดต่อ</th>
                  <th className="py-3 px-4">ใบอนุญาตขับขี่</th>
                  <th className="py-3 px-4">รถประจำการ</th>
                  <th className="py-3 px-4">สถิติเที่ยววิ่ง</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 sm:px-6 text-right">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrivers.map((driver) => {
                  const statusConf = driverStatusConfig[driver.status] || driverStatusConfig.active;
                  return (
                    <tr key={driver.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900">{driver.name}</div>
                        <div className="text-xs font-mono text-emerald-800 mt-0.5">{driver.code}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{driver.phone}</div>
                        <div className="text-xs text-slate-400">{driver.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800">{driver.licenseType}</div>
                        <div className="text-xs text-slate-400">เลขที่: {driver.licenseNumber}</div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {driver.assignedVehiclePlate || '-'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 font-mono">
                          {formatNumber(driver.totalTrips || 0)} เที่ยว
                        </div>
                        <div className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{driver.rating || 5.0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${statusConf.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(driver)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(driver)}
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
        </div>
      )}

      {/* Add Driver Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มพนักงานขับรถใหม่"
        subtitle="บันทึกข้อมูลส่วนบุคคล ใบขับขี่ และยานพาหนะประจำการ"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น สมพร รักการขับ"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="เช่น 081-998-7766"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ประเภทใบอนุญาตขับขี่
              </label>
              <select
                value={formData.licenseType}
                onChange={(e) => setFormData({ ...formData, licenseType: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="ชนิดที่ 2 (รถบรรทุก 4-6 ล้อ)">ชนิดที่ 2 (รถบรรทุก 4-6 ล้อ)</option>
                <option value="ชนิดที่ 3 (รถบรรทุก 10 ล้อ)">ชนิดที่ 3 (รถบรรทุก 10 ล้อ)</option>
                <option value="ชนิดที่ 4 (รถเทรลเลอร์/สารอันตราย)">ชนิดที่ 4 (รถเทรลเลอร์/สารอันตราย)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลขที่ใบอนุญาตขับขี่
              </label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                placeholder="เช่น บ.3-889901"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รถประจำการ (ถ้ามี)
              </label>
              <select
                value={formData.assignedVehiclePlate}
                onChange={(e) => setFormData({ ...formData, assignedVehiclePlate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ยังไม่มีรถประจำ --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plateNumber}>
                    {v.plateNumber} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการทำงาน
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="active">พร้อมปฏิบัติงาน (Active)</option>
                <option value="on_duty">กำลังจัดส่งงาน (On Duty)</option>
                <option value="on_leave">ลางาน / พักผ่อน (On Leave)</option>
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
              บันทึกพนักงาน
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Driver Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`แก้ไขข้อมูลพนักงาน: ${selectedDriver?.name}`}
        subtitle={`รหัสพนักงาน: ${selectedDriver?.code}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการทำงาน
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="active">พร้อมปฏิบัติงาน (Active)</option>
                <option value="on_duty">กำลังจัดส่งงาน (On Duty)</option>
                <option value="on_leave">ลางาน / พักผ่อน (On Leave)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รถประจำการ
              </label>
              <select
                value={formData.assignedVehiclePlate}
                onChange={(e) => setFormData({ ...formData, assignedVehiclePlate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ไม่มีรถประจำ --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plateNumber}>
                    {v.plateNumber} ({v.type})
                  </option>
                ))}
              </select>
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

      {/* Delete Driver Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบข้อมูลพนักงาน"
        message={`คุณต้องการลบข้อมูลคุณ ${selectedDriver?.name} (${selectedDriver?.code}) ออกจากระบบหรือไม่?`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  );
};
