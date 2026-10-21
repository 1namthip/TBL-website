import { useState } from 'react';
import {
  MapPin,
  Navigation,
  Truck,
  User,
  Clock,
  Fuel,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Route as RouteIcon,
  ChevronRight,
  TrendingUp,
  RotateCw,
  Gauge,
} from 'lucide-react';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { formatNumber } from '../utils/formatters';

export const RoutePlanning = () => {
  const { routes, vehicles, drivers, addRoute, updateRoute } = useLogistics();
  const { success } = useToast();

  const [selectedRouteId, setSelectedRouteId] = useState(routes[0]?.id || null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Add route form state
  const [formData, setFormData] = useState({
    name: '',
    origin: 'ศูนย์กระจายสินค้า TBL บางนา กม.19',
    destination: '',
    totalDistanceKm: 150,
    estimatedDurationHours: 3.5,
    assignedVehiclePlate: '',
    assignedDriverName: '',
  });

  const handleAddRouteSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.destination.trim()) return;

    const newR = addRoute({
      ...formData,
      totalDistanceKm: Number(formData.totalDistanceKm) || 100,
      estimatedDurationHours: Number(formData.estimatedDurationHours) || 2,
    });

    success('เพิ่มเส้นทางสำเร็จ', `เส้นทาง ${newR.name} ถูกบันทึกเรียบร้อย`);
    setIsAddModalOpen(false);
    setSelectedRouteId(newR.id);
  };

  const toggleStopCompletion = (stopIndex) => {
    if (!activeRoute) return;
    const updatedStops = activeRoute.stops.map((stop, i) => {
      if (i === stopIndex) {
        return { ...stop, completed: !stop.completed };
      }
      return stop;
    });

    updateRoute(activeRoute.id, { stops: updatedStops });
    success('อัปเดตสถานะจุดแวะสำเร็จ', `บันทึกสถานะจุดที่ ${stopIndex + 1} เรียบร้อยแล้ว`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ระบบวางแผนและติดตามเส้นทาง (Route Planning & Optimization)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            จำลองเส้นทางหลัก คำนวณระยะทาง ปริมาณเชื้อเพลิง และจุดแวะส่งสินค้า (Waypoints)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>เพิ่มเส้นทางใหม่</span>
        </button>
      </div>

      {/* Main Layout: Route List Sidebar + Interactive Visual Route Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Route Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              เส้นทางขนส่งหลัก ({routes.length} เส้นทาง)
            </span>
            <span className="text-xs text-emerald-700 font-semibold">อัปเดต GPS ทุก 5 นาที</span>
          </div>

          <div className="space-y-3">
            {routes.map((route) => {
              const isSelected = route.id === selectedRouteId;
              const completedStops = route.stops?.filter((s) => s.completed).length || 0;
              const totalStops = route.stops?.length || 0;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRouteId(route.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-900 text-white border-emerald-800 shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200/80 hover:border-emerald-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {route.code}
                      </span>
                      <h4 className="text-sm font-bold mt-1.5 leading-snug">
                        {route.name}
                      </h4>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        route.status === 'in_progress'
                          ? isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          : isSelected ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {route.status === 'in_progress' ? 'กำลังเดินทาง' : 'ตามตารางนัด'}
                    </span>
                  </div>

                  <div
                    className={`text-xs space-y-1.5 my-3 pt-3 border-t ${
                      isSelected ? 'border-emerald-800/80 text-emerald-100/80' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>ระยะทางรวม:</span>
                      <span className="font-semibold">{formatNumber(route.totalDistanceKm)} กม.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>เวลาเดินทางโดยประมาณ:</span>
                      <span className="font-semibold">{route.estimatedDurationHours} ชม.</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>รถและพนักงาน:</span>
                      <span className="font-semibold">{route.assignedVehiclePlate} ({route.assignedDriverName})</span>
                    </div>
                  </div>

                  {/* Progress of stops */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] mb-1 font-medium">
                      <span>ความคืบหน้าจุดส่ง</span>
                      <span>{completedStops}/{totalStops} จุด</span>
                    </div>
                    <div
                      className={`h-1.5 rounded-full overflow-hidden ${
                        isSelected ? 'bg-emerald-950' : 'bg-slate-100'
                      }`}
                    >
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${(completedStops / (totalStops || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Route Detail & Visual Map Simulation (7 cols) */}
        {activeRoute && (
          <div className="lg:col-span-7 space-y-6">
            {/* Active Route Header Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {activeRoute.code}
                    </span>
                    <Badge variant={activeRoute.status === 'in_progress' ? 'info' : 'neutral'} dot>
                      {activeRoute.status === 'in_progress' ? 'กำลังเดินทาง (Active)' : 'เตรียมออกเดินทาง'}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{activeRoute.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      updateRoute(activeRoute.id, {
                        status: activeRoute.status === 'in_progress' ? 'completed' : 'in_progress',
                      });
                      success('ปรับปรุงสถานะเที่ยวรถ', 'สถานะเที่ยวเดินทางถูกอัปเดตเรียบร้อย');
                    }}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>
                      {activeRoute.status === 'in_progress' ? 'บันทึกจบรอบเส้นทาง' : 'เริ่มออกเดินทาง'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block mb-0.5">ระยะทางรวม</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    {formatNumber(activeRoute.totalDistanceKm)} กม.
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block mb-0.5">เวลาโดยประมาณ</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    {activeRoute.estimatedDurationHours} ชม.
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block mb-0.5">ประมาณการน้ำมัน</span>
                  <span className="font-bold text-slate-900 text-sm font-mono">
                    {activeRoute.fuelEstimateLiters} ลิตร
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400 block mb-0.5">อัตราบรรทุก (Load)</span>
                  <span className="font-bold text-emerald-700 text-sm font-mono">
                    {activeRoute.cargoLoadPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Waypoints & Visual Stops Timeline */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    ลำดับจุดแวะและส่งมอบสินค้า (Route Waypoints)
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คลิกที่จุดแวะเพื่อทำเครื่องหมายว่าผ่านจุดส่งหรือส่งมอบเรียบร้อยแล้ว
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {activeRoute.stops?.length} จุดแวะ
                </span>
              </div>

              {/* Visual Logistics Pathway */}
              <div className="relative pl-8 space-y-6 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-1 before:bg-emerald-100">
                {activeRoute.stops?.map((stop, index) => {
                  const isOrigin = stop.type === 'origin';
                  const isDestination = stop.type === 'destination';

                  return (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => toggleStopCompletion(index)}
                    >
                      {/* Check / Marker Dot */}
                      <div
                        className={`absolute -left-8 top-1 w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-white transition-all ${
                          stop.completed
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-white border-2 border-slate-300 text-slate-400 group-hover:border-emerald-500'
                        }`}
                      >
                        {stop.completed ? (
                          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        ) : (
                          <span className="text-xs font-bold font-mono">{index + 1}</span>
                        )}
                      </div>

                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          stop.completed
                            ? 'bg-emerald-50/40 border-emerald-200/70'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                  isOrigin
                                    ? 'bg-slate-200 text-slate-700'
                                    : isDestination
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {isOrigin ? 'ต้นทาง' : isDestination ? 'ปลายทาง' : `จุดแวะที่ ${index}`}
                              </span>
                              <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                ETA: {stop.eta}
                              </span>
                            </div>
                            <h5 className="text-sm font-bold text-slate-900">{stop.name}</h5>
                          </div>

                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                              stop.completed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {stop.completed ? 'ผ่านแล้ว / ส่งมอบแล้ว' : 'รอดำเนินการ'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Route Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="เพิ่มเส้นทางการขนส่งใหม่"
        subtitle="กำหนดเส้นทาง จุดเริ่มต้น จุดหมายปลายทาง และทรัพยากรประจำเส้นทาง"
      >
        <form onSubmit={handleAddRouteSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อเส้นทาง (Route Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น สายตะวันออกเฉียงเหนือตอนบน: กทม. - ขอนแก่น - อุดรฯ"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จุดต้นทาง (Origin)
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
                จุดปลายทาง (Destination) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="เช่น ศูนย์กระจายสินค้า ขอนแก่น"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระยะทางประมาณการ (กม.)
              </label>
              <input
                type="number"
                value={formData.totalDistanceKm}
                onChange={(e) => setFormData({ ...formData, totalDistanceKm: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เวลาเดินทางประมาณการ (ชั่วโมง)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.estimatedDurationHours}
                onChange={(e) => setFormData({ ...formData, estimatedDurationHours: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ยานพาหนะประจำเส้นทาง
              </label>
              <select
                value={formData.assignedVehiclePlate}
                onChange={(e) => setFormData({ ...formData, assignedVehiclePlate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- รอจัดสรร --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.plateNumber}>
                    {v.plateNumber} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                พนักงานขับรถ
              </label>
              <select
                value={formData.assignedDriverName}
                onChange={(e) => setFormData({ ...formData, assignedDriverName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 bg-white"
              >
                <option value="">-- รอจัดสรร --</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.name}>
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
              บันทึกเส้นทาง
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
