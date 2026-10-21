import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Clock,
  Truck,
  User,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Edit,
  Share2,
  FileText,
  ShieldCheck,
  Send,
  Building,
  Scale,
  DollarSign,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import {
  deliveryStatusConfig,
  priorityConfig,
  formatDate,
  formatCurrency,
  formatNumber,
} from '../utils/formatters';

export const DeliveryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tasks, updateTask, updateTaskStatus, companySettings } = useLogistics();
  const { success, error, info } = useToast();

  const task = tasks.find(
    (t) => String(t.id) === String(id) || t.trackingNumber === id || t.task_code === id
  );

  // Status Change Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState(task?.status || 'pending');
  const [statusNote, setStatusNote] = useState('');

  // Print Waybill Preview Modal State
  const [isWaybillOpen, setIsWaybillOpen] = useState(false);

  if (!task) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">ไม่พบข้อมูลงานจัดส่งนี้</h3>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          รหัสอ้างอิงอาจไม่ถูกต้องหรือถูกลบออกจากระบบไปแล้ว
        </p>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับไปยังหน้ารายการงานจัดส่ง
        </Link>
      </div>
    );
  }

  const statusConf = deliveryStatusConfig[task.status] || deliveryStatusConfig.pending;
  const prioConf = priorityConfig[task.priority] || priorityConfig.standard;

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTaskStatus(task.id, newStatus, statusNote || `เปลี่ยนสถานะเป็น ${newStatus}`);
      success('อัปเดตสถานะสำเร็จ', `สถานะงาน ${task.trackingNumber || task.task_code} ถูกปรับปรุงเรียบร้อยแล้ว`);
      setIsStatusModalOpen(false);
      setStatusNote('');
    } catch (err) {
      error('เกิดข้อผิดพลาดในการอัปเดตสถานะ', err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumbs & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
          <Link to="/tasks" className="hover:text-emerald-700 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>จัดการงานจัดส่ง</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-800 font-mono">{task.trackingNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWaybillOpen(true)}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>ใบส่งของ (Waybill)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewStatus(task.status);
              setIsStatusModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-medium rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>อัปเดตสถานะงาน</span>
          </button>
        </div>
      </div>

      {/* Main Delivery Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider">
                WAYBILL ID
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {task.trackingNumber}
              </h2>
              <Badge variant={statusConf.badgeVariant} dot className="text-sm py-1 px-3">
                {statusConf.label}
              </Badge>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${prioConf.color}`}>
                {prioConf.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
              <span>สร้างคำสั่งเมื่อ: {formatDate(task.createdAt)}</span>
              {task.completedAt && (
                <>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">
                    สำเร็จเมื่อ: {formatDate(task.completedAt)}
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase">ค่าบริการขนส่ง</p>
              <p className="text-xl font-bold text-slate-900 font-mono">
                {formatCurrency(task.costThb)}
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase">ประมาณการถึง</p>
              <p className="text-sm font-semibold text-slate-800">
                {task.estimatedArrival ? formatDate(task.estimatedArrival) : 'ตามรอบปกติ'}
              </p>
            </div>
          </div>
        </div>

        {/* Route Visual Bar */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Origin */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/50">
            <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                จุดรับสินค้า (ORIGIN)
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{task.origin}</h4>
              <p className="text-xs text-slate-500 mt-1">คลังสินค้าส่วนกลาง TBL Logistics</p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                จุดส่งมอบสินค้า (DESTINATION)
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{task.destination}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {task.destinationAddress || 'ตามเอกสารใบกำกับการส่งสินค้า'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Customer & Cargo & Assigned Resource (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer & Recipient Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-700" />
              <span>ข้อมูลผู้รับและลูกค้า</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 block mb-0.5">บริษัท / ผู้รับ</span>
                <span className="font-bold text-slate-800">{task.customerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">บุคคลผู้ติดต่อ</span>
                <span className="font-semibold text-slate-800">{task.contactPerson || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">เบอร์โทรศัพท์</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {task.contactPhone || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ที่อยู่โดยละเอียด</span>
                <span className="text-slate-700 leading-relaxed block">{task.destinationAddress || '-'}</span>
              </div>
            </div>
          </div>

          {/* Cargo Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>รายละเอียดพัสดุและสินค้า</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm pb-4 border-b border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">ประเภทสินค้า</span>
                <span className="font-bold text-slate-800">{task.itemDescription}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">จำนวนพัสดุ</span>
                <span className="font-bold text-slate-800">{task.itemCount} ชิ้น/กล่อง</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">น้ำหนักสุทธิ</span>
                <span className="font-bold text-slate-800">{formatNumber(task.weightKg)} กก.</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">ปริมาตรโดยประมาณ</span>
                <span className="font-bold text-slate-800">{task.volumeCbm || 1.2} CBM</span>
              </div>
            </div>

            {task.notes && (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">หมายเหตุและข้อควรระวัง: </span>
                  <span>{task.notes}</span>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Fleet & Driver */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>ยานพาหนะและพนักงานขับรถ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vehicle info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">ยานพาหนะขนส่ง</span>
                  <Truck className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-base font-bold text-slate-900 font-mono">
                  {task.assignedVehiclePlate}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  รหัสรถ: {task.assignedVehicleId || 'รอผูกข้อมูล'}
                </p>
              </div>

              {/* Driver info */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500">พนักงานขับรถ</span>
                  <User className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-base font-bold text-slate-900">
                  {task.assignedDriverName}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {task.assignedDriverPhone || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tracking History Timeline (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ประวัติสถานะการจัดส่ง (Timeline)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  การอัปเดตและขั้นตอนการขนส่งแบบเรียลไทม์
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(true)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
              >
                + เพิ่มบันทึก
              </button>
            </div>

            {/* Timeline component */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
              {task.timeline && task.timeline.length > 0 ? (
                task.timeline.map((item, index) => {
                  const isLatest = index === task.timeline.length - 1;
                  return (
                    <div key={index} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                          isLatest
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              isLatest ? 'text-emerald-950 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {item.status}
                          </h4>
                          <span className="text-[11px] text-slate-400 shrink-0">
                            {formatDate(item.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                        {item.actor && (
                          <p className="text-[10px] text-slate-400 mt-1 italic">
                            โดย: {item.actor}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500">ยังไม่มีบันทึก Timeline ในขณะนี้</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="อัปเดตสถานะงานจัดส่ง"
        subtitle={`รหัสพัสดุ ${task.trackingNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              เลือกสถานะใหม่
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
            >
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="in_transit">กำลังจัดส่ง (In Transit)</option>
              <option value="completed">จัดส่งสำเร็จ (Completed)</option>
              <option value="delayed">ล่าช้ากว่ากำหนด (Delayed)</option>
              <option value="cancelled">ยกเลิกรายการ (Cancelled)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              บันทึกรายละเอียด / หมายเหตุสถานะ
            </label>
            <textarea
              rows={3}
              required
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="เช่น ยานพาหนะถึงจุดหมายปลายทาง และผู้รับลงนามเรียบร้อย..."
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
            >
              บันทึกสถานะ
            </button>
          </div>
        </form>
      </Modal>

      {/* Waybill Print Preview Modal */}
      <Modal
        isOpen={isWaybillOpen}
        onClose={() => setIsWaybillOpen(false)}
        title="ใบกำกับการขนส่งสินค้า (Waybill / Consignment Note)"
        subtitle="ตัวอย่างเอกสารสำหรับพิมพ์มอบให้ผู้รับและพนักงานขับรถ"
        maxWidth="max-w-2xl"
      >
        <div className="p-6 bg-white border border-slate-300 rounded-xl text-slate-800 font-sans space-y-4 print:p-0 print:border-none">
          {/* Header of paper waybill */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900">TBL SMART LOGISTICS</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">{companySettings.headquarters}</p>
              <p className="text-xs text-slate-500">โทร: {companySettings.supportPhone} | เลขประจำตัวผู้เสียภาษี: {companySettings.taxId}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-400 block uppercase">เอกสารต้นฉบับ</span>
              <p className="text-lg font-mono font-black text-slate-900">{task.trackingNumber}</p>
              <p className="text-xs text-slate-500">{formatDate(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Sender & Recipient table */}
          <div className="grid grid-cols-2 gap-4 text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p className="font-bold text-slate-900 uppercase">ผู้ส่ง (Shipper):</p>
              <p className="text-slate-800 font-semibold">{task.origin}</p>
              <p className="text-slate-600">ศูนย์คลังสินค้า TBL Logistics Hub</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase">ผู้รับ (Consignee):</p>
              <p className="text-slate-800 font-semibold">{task.customerName}</p>
              <p className="text-slate-600">{task.destinationAddress || task.destination}</p>
              <p className="text-slate-600">โทร: {task.contactPhone}</p>
            </div>
          </div>

          {/* Cargo spec */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">รายการพัสดุ</th>
                  <th className="p-2.5 text-center">จำนวน</th>
                  <th className="p-2.5 text-center">น้ำหนัก (กก.)</th>
                  <th className="p-2.5 text-right">ค่าบริการ</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-2.5 font-medium">{task.itemDescription}</td>
                  <td className="p-2.5 text-center">{task.itemCount}</td>
                  <td className="p-2.5 text-center">{formatNumber(task.weightKg)}</td>
                  <td className="p-2.5 text-right font-mono">{formatCurrency(task.costThb)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-8 text-center text-xs">
            <div className="border-t border-slate-300 pt-2">
              <p className="text-slate-400">........................................</p>
              <p className="font-semibold text-slate-700 mt-1">ผู้ส่งสินค้า</p>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <p className="text-slate-400">........................................</p>
              <p className="font-semibold text-slate-700 mt-1">พนักงานขับรถ ({task.assignedDriverName})</p>
            </div>
            <div className="border-t border-slate-300 pt-2">
              <p className="text-slate-400">........................................</p>
              <p className="font-semibold text-slate-700 mt-1">ผู้รับสินค้า / ตราประทับ</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsWaybillOpen(false)}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            ปิด
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl shadow-xs transition-colors inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            สั่งพิมพ์เอกสาร (Print)
          </button>
        </div>
      </Modal>
    </div>
  );
};
