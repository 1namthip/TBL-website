import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  PlusCircle,
  FileText,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  Eye,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { useLogistics } from '../context/LogisticsContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import {
  deliveryStatusConfig,
  priorityConfig,
  formatDate,
  formatCurrency,
  formatNumber,
} from '../utils/formatters';

export const Dashboard = () => {
  const { tasks, vehicles, stats, resetToMockData } = useLogistics();
  const navigate = useNavigate();

  // Weekly Trend Chart Mock Data computed based on tasks
  const weeklyTrendData = [
    { day: 'จันทร์', สำเร็จ: 18, กำลังส่ง: 4, ล่าช้า: 1 },
    { day: 'อังคาร', สำเร็จ: 22, กำลังส่ง: 6, ล่าช้า: 0 },
    { day: 'พุธ (วันนี้)', สำเร็จ: stats.completedTasks, กำลังส่ง: stats.inTransitTasks, ล่าช้า: stats.delayedTasks },
    { day: 'พฤหัสฯ (คาดการณ์)', สำเร็จ: 20, กำลังส่ง: 5, ล่าช้า: 0 },
    { day: 'ศุกร์ (คาดการณ์)', สำเร็จ: 25, กำลังส่ง: 8, ล่าช้า: 1 },
    { day: 'เสาร์', สำเร็จ: 12, กำลังส่ง: 3, ล่าช้า: 0 },
    { day: 'อาทิตย์', สำเร็จ: 8, กำลังส่ง: 2, ล่าช้า: 0 },
  ];

  // Status Distribution Data for Pie Chart
  const statusPieData = [
    { name: 'จัดส่งสำเร็จ', value: stats.completedTasks || 1, color: '#10b981' },
    { name: 'กำลังจัดส่ง', value: stats.inTransitTasks || 1, color: '#3b82f6' },
    { name: 'รอดำเนินการ', value: stats.pendingTasks || 1, color: '#f59e0b' },
    { name: 'ล่าช้ากว่ากำหนด', value: stats.delayedTasks || 0, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  // Recent 5 Tasks
  const recentTasks = tasks.slice(0, 5);

  // Find delayed tasks for alert banner
  const delayedTasks = tasks.filter((t) => t.status === 'delayed');

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium mb-3 border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ระบบติดตามและบริหารงานโลจิสติกส์อัจฉริยะ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ศูนย์ควบคุมการขนส่ง TBL Logistics
          </h2>
          <p className="text-sm text-emerald-100/80 max-w-xl mt-1.5 leading-relaxed">
            ติดตามสถานะรถบรรทุก งานจัดส่งสินค้า และตัวชี้วัดประสิทธิภาพ (KPI) แบบเรียลไทม์
            ประจำศูนย์ปฏิบัติการหลัก
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            to="/tasks"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-xs border border-white/20 transition-all inline-flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>ตารางงานทั้งหมด</span>
          </Link>
          <Link
            to="/routes"
            className="px-4 py-2.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-emerald-700" />
            <span>ดูแผนที่เส้นทาง</span>
          </Link>
        </div>
      </div>

      {/* Delayed Alert Banner (Shows when there are delayed tasks) */}
      {delayedTasks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                พบงานจัดส่งที่ล่าช้ากว่ากำหนด ({delayedTasks.length} รายการ)
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                รหัส {delayedTasks.map((t) => t.trackingNumber).join(', ')} กำลังล่าช้าเนื่องจากสภาพการจราจร
              </p>
            </div>
          </div>
          <Link
            to={`/tasks/${delayedTasks[0].id}`}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 inline-flex items-center gap-1"
          >
            <span>ตรวจสอบทันที</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 6 Key Performance Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tasks */}
        <StatCard
          title="งานจัดส่งทั้งหมด"
          value={formatNumber(stats.totalTasks)}
          subtitle="คำสั่งจัดส่งทั้งหมดในระบบ"
          icon={Package}
          colorVariant="emerald"
          onClick={() => navigate('/tasks')}
        />

        {/* Pending Tasks */}
        <StatCard
          title="รอดำเนินการ"
          value={formatNumber(stats.pendingTasks)}
          subtitle="รอรับสินค้า / จัดสรรรถ"
          icon={Clock}
          colorVariant="amber"
          onClick={() => navigate('/tasks?status=pending')}
        />

        {/* In Transit Tasks */}
        <StatCard
          title="กำลังจัดส่ง"
          value={formatNumber(stats.inTransitTasks)}
          subtitle="ยานพาหนะอยู่ระหว่างทาง"
          icon={Truck}
          colorVariant="blue"
          onClick={() => navigate('/tasks?status=in_transit')}
        />

        {/* Completed Tasks */}
        <StatCard
          title="จัดส่งสำเร็จ"
          value={formatNumber(stats.completedTasks)}
          subtitle="ส่งมอบและลงนามแล้ว"
          icon={CheckCircle2}
          colorVariant="emerald"
          onClick={() => navigate('/tasks?status=completed')}
        />

        {/* Delayed Tasks */}
        <StatCard
          title="ล่าช้ากว่ากำหนด"
          value={formatNumber(stats.delayedTasks)}
          subtitle="เกินเวลาประมาณการ"
          icon={AlertTriangle}
          colorVariant="rose"
          onClick={() => navigate('/tasks?status=delayed')}
        />

        {/* Available Vehicles */}
        <StatCard
          title="รถพร้อมใช้งาน"
          value={`${stats.availableVehicles}/${stats.totalVehicles}`}
          subtitle={`มีรถซ่อมบำรุง ${stats.maintenanceVehicles} คัน`}
          icon={Truck}
          colorVariant="purple"
          onClick={() => navigate('/vehicles')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deliveries Weekly Trend Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                แนวโน้มงานจัดส่งประจำสัปดาห์ (Shipments Trend)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบจำนวนงานจัดส่งสำเร็จ กำลังส่ง และงานล่าช้าในแต่ละวัน
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                สำเร็จ
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                กำลังส่ง
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                ล่าช้า
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="สำเร็จ" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="กำลังส่ง" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ล่าช้า" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart & Fleet Overview */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Donut */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex-1">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              สัดส่วนสถานะงานจัดส่ง
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              อัตราส่วนงานปัจจุบันในระบบ
            </p>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} รายการ`, 'จำนวน']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100">
              {statusPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                  <span className="font-bold text-slate-800 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Fleet Summary Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold">สถานะกองยานพาหนะ (Fleet)</h4>
              </div>
              <Link to="/vehicles" className="text-xs text-emerald-400 hover:underline">
                จัดการรถ
              </Link>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>พร้อมใช้งาน</span>
                  <span className="font-semibold text-emerald-400">{stats.availableVehicles} คัน</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(stats.availableVehicles / (stats.totalVehicles || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>กำลังวิ่งงาน</span>
                  <span className="font-semibold text-blue-400">{stats.inUseVehicles} คัน</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(stats.inUseVehicles / (stats.totalVehicles || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>ซ่อมบำรุง</span>
                  <span className="font-semibold text-rose-400">{stats.maintenanceVehicles} คัน</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all"
                    style={{
                      width: `${(stats.maintenanceVehicles / (stats.totalVehicles || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:px-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              รายการงานจัดส่งล่าสุด (Recent Deliveries)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดง 5 รายการล่าสุดในระบบ พร้อมสถานะการจัดส่ง
            </p>
          </div>
          <Link
            to="/tasks"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline"
          >
            ดูทั้งหมด ({stats.totalTasks} รายการ)
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4 sm:px-6">รหัสติดตามพัสดุ</th>
                <th className="py-3 px-4">ลูกค้า / ปลายทาง</th>
                <th className="py-3 px-4">ยานพาหนะและคนขับ</th>
                <th className="py-3 px-4">ระดับความสำคัญ</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 sm:px-6 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTasks.map((task) => {
                const statusConf = deliveryStatusConfig[task.status] || deliveryStatusConfig.pending;
                const prioConf = priorityConfig[task.priority] || priorityConfig.standard;

                return (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-emerald-900 font-mono">
                        {task.trackingNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatDate(task.createdAt)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 truncate max-w-xs">
                        {task.customerName}
                      </div>
                      <div className="text-xs text-slate-500 truncate max-w-xs flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{task.destination}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">
                        {task.assignedVehiclePlate}
                      </div>
                      <div className="text-xs text-slate-500">
                        {task.assignedDriverName}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs border ${prioConf.color}`}>
                        {prioConf.label.split(' ')[0]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={statusConf.badgeVariant} dot>
                        {statusConf.label}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>รายละเอียด</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
