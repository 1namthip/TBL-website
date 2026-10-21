import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  Download,
  MapPin,
  Calendar,
  Truck,
  User,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import {
  deliveryStatusConfig,
  priorityConfig,
  formatDate,
  formatCurrency,
  formatNumber,
} from '../utils/formatters';

export const DeliveryTasks = () => {
  const { tasks, vehicles, drivers, addTask, updateTask, deleteTask } = useLogistics();
  const { success, error, info } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(searchParams.get('create') === 'true');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Sync URL search params
  useEffect(() => {
    const s = searchParams.get('search');
    const st = searchParams.get('status');
    if (s !== null) setSearchQuery(s);
    if (st !== null) setStatusFilter(st);
  }, [searchParams]);

  // Form state for Add/Edit
  const defaultFormData = {
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

  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});

  // Filter tasks based on search & filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchQuery =
        !query ||
        task.trackingNumber?.toLowerCase().includes(query) ||
        task.customerName?.toLowerCase().includes(query) ||
        task.destination?.toLowerCase().includes(query) ||
        task.assignedDriverName?.toLowerCase().includes(query) ||
        task.assignedVehiclePlate?.toLowerCase().includes(query) ||
        task.itemDescription?.toLowerCase().includes(query);

      // Status match
      const matchStatus = statusFilter === 'all' || task.status === statusFilter;

      // Priority match
      const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;

      return matchQuery && matchStatus && matchPriority;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(start, start + itemsPerPage);
  }, [filteredTasks, currentPage, itemsPerPage]);

  // Open Edit Modal
  const handleOpenEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      customerName: task.customerName || '',
      contactPerson: task.contactPerson || '',
      contactPhone: task.contactPhone || '',
      origin: task.origin || '',
      destination: task.destination || '',
      destinationAddress: task.destinationAddress || '',
      itemDescription: task.itemDescription || '',
      itemCount: task.itemCount || 1,
      weightKg: task.weightKg || 0,
      volumeCbm: task.volumeCbm || 0,
      priority: task.priority || 'standard',
      status: task.status || 'pending',
      assignedVehicleId: task.assignedVehicleId || '',
      assignedDriverId: task.assignedDriverId || '',
      costThb: task.costThb || 0,
      notes: task.notes || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (task) => {
    setSelectedTask(task);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (selectedTask) {
      try {
        await deleteTask(selectedTask.id);
        success('ลบข้อมูลสำเร็จ', `งานจัดส่งรหัส ${selectedTask.trackingNumber || selectedTask.task_code} ถูกลบออกจากระบบแล้ว`);
      } catch (err) {
        error('ไม่สามารถลบงานจัดส่งได้', err.message);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedTask(null);
      }
    }
  };

  // Submit Edit
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.destination.trim()) {
      error('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อลูกค้าและปลายทาง');
      return;
    }

    const selectedVehicle = vehicles.find(
      (v) => String(v.id) === String(formData.assignedVehicleId) || v.plateNumber === formData.assignedVehicleId
    );
    const selectedDriver = drivers.find(
      (d) => String(d.id) === String(formData.assignedDriverId) || d.employee_code === formData.assignedDriverId
    );

    try {
      await updateTask(selectedTask.id, {
        ...formData,
        itemCount: Number(formData.itemCount) || 1,
        weightKg: Number(formData.weightKg) || 0,
        volumeCbm: Number(formData.volumeCbm) || 0,
        costThb: Number(formData.costThb) || 0,
        assignedVehiclePlate: selectedVehicle ? selectedVehicle.plateNumber : formData.assignedVehiclePlate || 'รอจัดสรร',
        assignedDriverName: selectedDriver ? (selectedDriver.name || selectedDriver.full_name) : formData.assignedDriverName || 'รอจัดสรร',
        assignedDriverPhone: selectedDriver ? selectedDriver.phone : '-',
      });

      success('อัปเดตงานจัดส่งสำเร็จ', `บันทึกการเปลี่ยนแปลงรหัส ${selectedTask.trackingNumber || selectedTask.task_code} เรียบร้อยแล้ว`);
      setIsEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      error('เกิดข้อผิดพลาดในการอัปเดตงานจัดส่ง', err.message);
    }
  };

  // Submit Add
  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (!formData.customerName.trim() || !formData.destination.trim()) {
      error('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อลูกค้าและปลายทาง');
      return;
    }

    const selectedVehicle = vehicles.find(
      (v) => String(v.id) === String(formData.assignedVehicleId) || v.plateNumber === formData.assignedVehicleId
    );
    const selectedDriver = drivers.find(
      (d) => String(d.id) === String(formData.assignedDriverId) || d.employee_code === formData.assignedDriverId
    );

    try {
      const newTask = await addTask({
        ...formData,
        itemCount: Number(formData.itemCount) || 1,
        weightKg: Number(formData.weightKg) || 0,
        volumeCbm: Number(formData.volumeCbm) || 0,
        costThb: Number(formData.costThb) || 0,
        assignedVehiclePlate: selectedVehicle ? selectedVehicle.plateNumber : 'รอจัดสรร',
        assignedDriverName: selectedDriver ? (selectedDriver.name || selectedDriver.full_name) : 'รอจัดสรร',
        assignedDriverPhone: selectedDriver ? selectedDriver.phone : '-',
      });

      success('สร้างงานจัดส่งสำเร็จ', `รหัสพัสดุ: ${newTask?.trackingNumber || newTask?.task_code || 'สำเร็จ'} ถูกสร้างเรียบร้อยแล้ว`);
      setIsAddModalOpen(false);
      setFormData(defaultFormData);
    } catch (err) {
      error('เกิดข้อผิดพลาดในการสร้างงานจัดส่ง', err.message);
    }
  };

  // Export CSV mock
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Tracking,Customer,Destination,Driver,Vehicle,Status,Priority,Cost\n"
      + filteredTasks.map(t => `${t.trackingNumber},"${t.customerName}","${t.destination}","${t.assignedDriverName}","${t.assignedVehiclePlate}",${t.status},${t.priority},${t.costThb}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `tbl_deliveries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    info('ดาวน์โหลดไฟล์ CSV เรียบร้อย', `ส่งออกข้อมูลงานจัดส่งจำนวน ${filteredTasks.length} รายการ`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              จัดการงานจัดส่งสินค้า (Delivery Tasks)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {filteredTasks.length} รายการ
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            ค้นหา ตรวจสอบ มอบหมายยานพาหนะ และอัปเดตสถานะการขนส่งสินค้า
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100/80 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData(defaultFormData);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>สร้างงานจัดส่ง</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ค้นหาเลขพัสดุ (TBL-...), ลูกค้า, ปลายทาง, คนขับ, สินค้า..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
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

          {/* Status Filter */}
          <div className="md:col-span-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="all">สถานะทั้งหมด (All Status)</option>
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="in_transit">กำลังจัดส่ง (In Transit)</option>
              <option value="completed">จัดส่งสำเร็จ (Completed)</option>
              <option value="delayed">ล่าช้ากว่ากำหนด (Delayed)</option>
              <option value="cancelled">ยกเลิก (Cancelled)</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-2 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="all">ความสำคัญทั้งหมด (All Priority)</option>
              <option value="express">ด่วนพิเศษ (Express)</option>
              <option value="standard">ปกติ (Standard)</option>
              <option value="economy">ประหยัด (Economy)</option>
            </select>
          </div>
        </div>

        {/* Quick status tabs pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 mr-1 text-[11px]">ทางลัดสถานะ:</span>
          {[
            { id: 'all', label: 'ทั้งหมด' },
            { id: 'pending', label: 'รอดำเนินการ' },
            { id: 'in_transit', label: 'กำลังส่ง' },
            { id: 'completed', label: 'สำเร็จ' },
            { id: 'delayed', label: 'ล่าช้า' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <EmptyState
            title="ไม่พบงานจัดส่งที่ตรงกับเงื่อนไข"
            description="ลองปรับคำค้นหาหรือเปลี่ยนตัวกรองสถานะ หรือกดปุ่มด้านล่างเพื่อสร้างงานใหม่"
            actionText="สร้างงานจัดส่งใหม่"
            onAction={() => {
              setFormData(defaultFormData);
              setIsAddModalOpen(true);
            }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">รหัสติดตาม</th>
                    <th className="py-3 px-4">ลูกค้า / ปลายทาง</th>
                    <th className="py-3 px-4">สินค้า / น้ำหนัก</th>
                    <th className="py-3 px-4">รถและพนักงานขับ</th>
                    <th className="py-3 px-4">ระดับความสำคัญ</th>
                    <th className="py-3 px-4">สถานะ</th>
                    <th className="py-3 px-4 sm:px-6 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTasks.map((task) => {
                    const statusConf = deliveryStatusConfig[task.status] || deliveryStatusConfig.pending;
                    const prioConf = priorityConfig[task.priority] || priorityConfig.standard;

                    return (
                      <tr key={task.id} className="hover:bg-slate-50/70 transition-colors group">
                        {/* Tracking Number */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="font-bold text-emerald-900 font-mono hover:text-emerald-700 hover:underline inline-block"
                          >
                            {task.trackingNumber}
                          </Link>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {formatDate(task.createdAt)}
                          </div>
                        </td>

                        {/* Customer & Destination */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 truncate max-w-xs">
                            {task.customerName}
                          </div>
                          <div className="text-xs text-slate-500 truncate max-w-xs flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{task.destination}</span>
                          </div>
                        </td>

                        {/* Cargo Info */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 truncate max-w-[180px]">
                            {task.itemDescription}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {formatNumber(task.weightKg)} กก. ({task.itemCount} ชิ้น)
                          </div>
                        </td>

                        {/* Vehicle & Driver */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-700 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{task.assignedVehiclePlate}</span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{task.assignedDriverName}</span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs border ${prioConf.color}`}>
                            {prioConf.label.split(' ')[0]}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <Badge variant={statusConf.badgeVariant} dot>
                            {statusConf.label}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/tasks/${task.id}`}
                              title="ดูรายละเอียด"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(task)}
                              title="แก้ไขข้อมูล"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDelete(task)}
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

            {/* Pagination Bar */}
            <div className="px-4 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <p>
                แสดงหน้า <span className="font-semibold text-slate-800">{currentPage}</span> จากทั้งหมด{' '}
                <span className="font-semibold text-slate-800">{totalPages}</span> หน้า (รวม {filteredTasks.length} รายการ)
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  ก่อนหน้า
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg font-medium transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-emerald-700 text-white'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  ถัดไป
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit Task Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`แก้ไขงานจัดส่ง: ${selectedTask?.trackingNumber}`}
        subtitle="ปรับปรุงข้อมูลผู้รับ สินค้า ยานพาหนะ และสถานะงาน"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อลูกค้า / บริษัท
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ต้นทาง (Origin)
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปลายทาง (Destination)
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ที่อยู่จัดส่งโดยละเอียด
            </label>
            <input
              type="text"
              value={formData.destinationAddress}
              onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดสินค้า
              </label>
              <input
                type="text"
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                น้ำหนัก (กก.)
              </label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนชิ้น
              </label>
              <input
                type="number"
                value={formData.itemCount}
                onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Vehicle & Driver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มอบหมายยานพาหนะ
              </label>
              <select
                value={formData.assignedVehicleId}
                onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ไม่ระบุ / รอจัดสรร --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มอบหมายพนักงานขับรถ
              </label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ไม่ระบุ / รอจัดสรร --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการจัดส่ง
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="in_transit">กำลังจัดส่ง (In Transit)</option>
                <option value="completed">จัดส่งสำเร็จ (Completed)</option>
                <option value="delayed">ล่าช้ากว่ากำหนด (Delayed)</option>
                <option value="cancelled">ยกเลิก (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความสำคัญ (Priority)
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="standard">ปกติ (Standard)</option>
                <option value="express">ด่วนพิเศษ (Express)</option>
                <option value="economy">ประหยัด (Economy)</option>
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

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="สร้างงานจัดส่งสินค้าใหม่"
        subtitle="บันทึกข้อมูลคำสั่งจัดส่ง มอบหมายรถและพนักงานขับรถลงฐานข้อมูล MySQL"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อลูกค้า / บริษัท <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="เช่น บริษัท สยามโลจิสติกส์ จำกัด"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เบอร์โทรศัพท์ติดต่อ
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ต้นทาง (Origin)
              </label>
              <input
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปลายทาง (Destination) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="เช่น นิคมฯ อมตะซิตี้ จ.ชลบุรี"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ที่อยู่จัดส่งโดยละเอียด
            </label>
            <input
              type="text"
              value={formData.destinationAddress}
              onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
              placeholder="เลขที่ หมู่บ้าน ซอย ถนน ตำบล อำเภอ จังหวัด"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดสินค้า
              </label>
              <input
                type="text"
                value={formData.itemDescription}
                onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                placeholder="เช่น อะไหล่ยานยนต์, อาหารแช่แข็ง"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                น้ำหนัก (กก.)
              </label>
              <input
                type="number"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนชิ้น
              </label>
              <input
                type="number"
                value={formData.itemCount}
                onChange={(e) => setFormData({ ...formData, itemCount: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Vehicle & Driver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มอบหมายยานพาหนะ
              </label>
              <select
                value={formData.assignedVehicleId}
                onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ไม่ระบุ / รอจัดสรร --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNumber || v.plate_number} ({v.type || v.vehicle_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                มอบหมายพนักงานขับรถ
              </label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- ไม่ระบุ / รอจัดสรร --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name || d.full_name} ({d.code || d.employee_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานะการจัดส่ง
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="pending">รอดำเนินการ (Pending)</option>
                <option value="in_transit">กำลังจัดส่ง (In Transit)</option>
                <option value="completed">จัดส่งสำเร็จ (Completed)</option>
                <option value="delayed">ล่าช้ากว่ากำหนด (Delayed)</option>
                <option value="cancelled">ยกเลิก (Cancelled)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความสำคัญ (Priority)
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="standard">ปกติ (Standard)</option>
                <option value="express">ด่วนพิเศษ (Express)</option>
                <option value="economy">ประหยัด (Economy)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              บันทึกงานจัดส่ง
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบงานจัดส่ง"
        message={`คุณต้องการลบงานจัดส่งรหัส ${selectedTask?.trackingNumber} (${selectedTask?.customerName}) หรือไม่? รายการนี้จะถูกลบออกจากฐานข้อมูล`}
        confirmText="ยืนยันการลบ"
        cancelText="ยกเลิก"
        type="danger"
      />
    </div>
  );
};
