import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Printer,
  ChevronDown,
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useLogistics } from '../context/LogisticsContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const Reports = () => {
  const { stats, tasks, vehicles, drivers } = useLogistics();
  const { info } = useToast();

  const [timeframe, setTimeframe] = useState('month'); // 'today' | 'week' | 'month' | 'quarter'

  // Region performance data
  const regionData = [
    { region: 'กทม.และปริมณฑล', งานทั้งหมด: 42, ตรงเวลา: 40, ล่าช้า: 2, รายได้: 145000 },
    { region: 'ภาคตะวันออก (EEC)', งานทั้งหมด: 38, ตรงเวลา: 36, ล่าช้า: 2, รายได้: 198000 },
    { region: 'ภาคกลาง / อยุธยา', งานทั้งหมด: 25, ตรงเวลา: 25, ล่าช้า: 0, รายได้: 88000 },
    { region: 'ภาคอีสาน (ขอนแก่น/โคราช)', งานทั้งหมด: 19, ตรงเวลา: 18, ล่าช้า: 1, รายได้: 125000 },
    { region: 'ภาคเหนือ (เชียงใหม่)', งานทั้งหมด: 14, ตรงเวลา: 13, ล่าช้า: 1, รายได้: 110000 },
  ];

  // Monthly trend
  const monthlyTrendData = [
    { month: 'พ.ค.', จำนวนงาน: 120, ตรงเวลาเปอร์เซ็นต์: 94 },
    { month: 'มิ.ย.', จำนวนงาน: 135, ตรงเวลาเปอร์เซ็นต์: 95 },
    { month: 'ก.ค.', จำนวนงาน: 142, ตรงเวลาเปอร์เซ็นต์: 97 },
    { month: 'ส.ค.', จำนวนงาน: 158, ตรงเวลาเปอร์เซ็นต์: 96 },
    { month: 'ก.ย.', จำนวนงาน: 164, ตรงเวลาเปอร์เซ็นต์: 98 },
    { month: 'ต.ค. (ปัจจุบัน)', จำนวนงาน: 175, ตรงเวลาเปอร์เซ็นต์: 96.5 },
  ];

  // Priority Distribution for Pie
  const priorityDistribution = [
    { name: 'ด่วนพิเศษ (Express)', value: tasks.filter((t) => t.priority === 'express').length || 4, color: '#ef4444' },
    { name: 'ปกติ (Standard)', value: tasks.filter((t) => t.priority === 'standard').length || 6, color: '#3b82f6' },
    { name: 'ประหยัด (Economy)', value: tasks.filter((t) => t.priority === 'economy').length || 2, color: '#10b981' },
  ];

  const handleExport = (format) => {
    info(`กำลังดาวน์โหลดรายงาน (${format.toUpperCase()})`, 'ระบบกำลังสร้างไฟล์สรุปสถิติประจำรอบการทำงาน...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            รายงานและวิเคราะห์ข้อมูล (Logistics Performance Reports)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            สรุปผลการจัดส่ง อัตราความตรงต่อเวลา (On-Time Rate) และการวิเคราะห์รายได้
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Timeframe select */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="py-2 px-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
          >
            <option value="today">วันนี้ (Today)</option>
            <option value="week">7 วันล่าสุด (Last 7 Days)</option>
            <option value="month">เดือนนี้ (October 2026)</option>
            <option value="quarter">ไตรมาส 4 (Q4 2026)</option>
          </select>

          <button
            type="button"
            onClick={() => handleExport('excel')}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>อัตราจัดส่งตรงเวลา</span>
            <span className="text-emerald-700 font-bold">เป้าหมาย 95%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {stats.onTimeRate}%
            </span>
            <span className="text-xs text-emerald-700 font-semibold">↑ +1.2%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">คำนวณจากงานจัดส่งที่สำเร็จทั้งหมด</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>รายได้ค่าบริการสะสม</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono truncate">
              {formatCurrency(stats.totalRevenueThb)}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">ยอดประมาณการคำสั่งส่งทั้งหมด</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>น้ำหนักสินค้ารวม</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {formatNumber(stats.totalWeightKg)}
            </span>
            <span className="text-xs text-slate-500 font-medium">กก.</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">ปริมาณสินค้าที่ขนส่งผ่านศูนย์</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>ความพร้อมใช้งานกองรถ</span>
            <Truck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {Math.round((stats.availableVehicles / (stats.totalVehicles || 1)) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({stats.availableVehicles}/{stats.totalVehicles} คัน)
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">ยานพาหนะพร้อมรับงานใหม่ทันที</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Deliveries by Region Bar Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                สถิติการจัดส่งแยกตามภูมิภาค / สายการเดินรถ
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                เปรียบเทียบจำนวนงานตรงเวลาและงานล่าช้าในแต่ละเส้นทาง
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
              EEC Line ยอดสูงสุด
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val, name) => [val, name]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="ตรงเวลา" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ล่าช้า" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              สัดส่วนประเภทความสำคัญ
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-4">
              แบ่งตามประเภทงานบริการลูกค้า
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
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
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
            {priorityDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value} งาน</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Driver Performance Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              อันดับประสิทธิภาพการขับขี่พนักงาน (Driver Safety & Performance)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              วัดผลจากจำนวนเที่ยววิ่ง ความตรงต่อเวลา และคะแนนความปลอดภัย
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-4 sm:px-6">พนักงานขับรถ</th>
                <th className="py-3 px-4">ทะเบียนรถประจำ</th>
                <th className="py-3 px-4">เที่ยววิ่งสะสม</th>
                <th className="py-3 px-4">อุบัติเหตุ/ข้อร้องเรียน</th>
                <th className="py-3 px-4">คะแนนดาว (Rating)</th>
                <th className="py-3 px-4 sm:px-6 text-right">เกรดประเมิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.slice(0, 5).map((d, index) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-bold text-slate-900">{d.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{d.code}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                    {d.assignedVehiclePlate || 'รถสำรอง'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {formatNumber(d.totalTrips || 100)} เที่ยว
                  </td>
                  <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                    {d.incidentCount === 0 ? '0 ครั้ง (ยอดเยี่ยม)' : `${d.incidentCount} ครั้ง`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-600">
                    ★ {d.rating || 5.0} / 5.0
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-xs">
                      {d.rating >= 4.9 ? 'A+' : d.rating >= 4.7 ? 'A' : 'B+'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
