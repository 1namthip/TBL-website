// Format currency to Thai Baht
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format number with commas
export const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH').format(num);
};

// Format date in Thai locale
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format short date (day/month/year)
export const formatShortDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

// Status labels & color map for Deliveries
export const deliveryStatusConfig = {
  pending: {
    label: 'รอดำเนินการ',
    color: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20',
    dot: 'bg-amber-500',
    badgeVariant: 'warning',
  },
  in_transit: {
    label: 'กำลังจัดส่ง',
    color: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20',
    dot: 'bg-blue-500',
    badgeVariant: 'info',
  },
  completed: {
    label: 'จัดส่งสำเร็จ',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    badgeVariant: 'success',
  },
  delayed: {
    label: 'ล่าช้ากว่ากำหนด',
    color: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20',
    dot: 'bg-rose-500',
    badgeVariant: 'danger',
  },
  cancelled: {
    label: 'ยกเลิก',
    color: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20',
    dot: 'bg-slate-400',
    badgeVariant: 'neutral',
  },
};

// Status labels & color map for Vehicles
export const vehicleStatusConfig = {
  available: {
    label: 'พร้อมใช้งาน',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  in_use: {
    label: 'กำลังวิ่งงาน',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  maintenance: {
    label: 'ซ่อมบำรุง',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

// Status labels & color map for Drivers
export const driverStatusConfig = {
  active: {
    label: 'พร้อมปฏิบัติงาน',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  on_duty: {
    label: 'กำลังจัดส่งงาน',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  on_leave: {
    label: 'ลางาน/พักผ่อน',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  },
};

// Priority configuration
export const priorityConfig = {
  express: {
    label: 'ด่วนพิเศษ (Express)',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  standard: {
    label: 'ปกติ (Standard)',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
  },
  economy: {
    label: 'ประหยัด (Economy)',
    color: 'bg-teal-50 text-teal-700 border-teal-200',
  },
};
