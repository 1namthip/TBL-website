# 🚚 TBL Smart Logistics - Enterprise Fleet & Delivery Management System

**TBL Smart Logistics** เป็นเว็บไซต์ต้นแบบระบบบริหารจัดการงานขนส่งและโลจิสติกส์สำหรับพนักงานภายในองค์กร (Internal Enterprise Logistics System) ออกแบบขึ้นเพื่อตอบสนองการดำเนินงานด้านโลจิสติกส์ยุคใหม่ ด้วยหน้าตาที่ดูเป็นมืออาชีพ ใช้งานง่าย มีฟังก์ชันครอบคลุม และคำนวณสถิติแบบไดนามิก เหมาะสำหรับนำไปจัดแสดงใน **Portfolio ฝึกงาน / สมัครงานสาย Frontend Developer & Fullstack Developer**

---

## 🌟 จุดเด่นของระบบ (Key Highlights)

- 🎨 **Enterprise Design System**: ออกแบบโดยใช้ชุดสี **เขียวเข้ม (Emerald/Forest Green)** ผสมผสานสีขาวและเทาอ่อน ให้ความรู้สึกน่าเชื่อถือ ปลอดภัย และเป็นทางการในระดับองค์กร
- 📐 **Desktop-First & Responsive**: ออกแบบอ้างอิงความละเอียด 1440 × 1024 px พร้อมรองรับหน้าจอ Tablet และ Mobile ด้วย Responsive Sidebar Drawer
- ⚡ **Dynamic Calculations**: ตัวเลขและตัวชี้วัด (KPIs) บน Dashboard คำนวณจากข้อมูลจริง (State/Mock Data) ไม่ใช้ตัวเลขลอย
- 🔄 **Full Interactive CRUD**: มีฟังก์ชันเพิ่ม แก้ไข เปลี่ยนสถานะ และลบข้อมูล (พร้อม Confirm Dialog และ Toast Notification)
- 💾 **State Persistence**: ข้อมูลจำลองบันทึกลงใน Web LocalStorage ทำให้รีเฟรชหน้าแล้วข้อมูลไม่หาย พร้อมปุ่ม **"รีเซ็ตข้อมูลจำลอง"** เพื่อคืนค่ามาตรฐานได้ตลอดเวลา
- 🔌 **Ready for Node.js + Express + MySQL**: มีหน้าจำลองการเชื่อมต่อ API Endpoint และแสดงโครงสร้าง Database Schema รองรับการต่อยอดเป็น Full-stack Production ในอนาคต

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| หมวดหมู่ | เทคโนโลยี |
|---|---|
| **Core Framework** | React.js (v19) + Vite (v8) |
| **Language** | JavaScript (ES6+ / JSX) |
| **Styling** | Tailwind CSS (v4) + Google Fonts (Prompt) |
| **Routing** | React Router DOM |
| **Icons** | Lucide React |
| **Data Visualization** | Recharts (Responsive Bar Chart, Area Chart, Donut Chart) |
| **Data Store** | React Context API + LocalStorage Persistence |

---

## 📑 รายละเอียดหน้าจอทั้ง 10 หน้า (10 Core Modules)

### 1. 🔐 เข้าสู่ระบบ (Login) — `/login`
- ฟอร์มเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน พร้อมปุ่มแสดง/ซ่อนรหัสผ่าน
- ระบบ **Quick Persona Login** เข้าใช้งานด่วน 3 บทบาท:
  - 👨‍💼 **ผู้จัดการฝ่ายปฏิบัติการ (Operations Manager)**
  - 🚚 **เจ้าหน้าที่จ่ายงานและติดตามรถ (Fleet Dispatcher)**
  - 🚛 **หัวหน้าพนักงานขับรถ (Lead Driver)**

### 2. 📊 แดชบอร์ดภาพรวม (Dashboard) — `/dashboard`
- **6 การ์ดสรุป KPI หลัก** ที่คำนวณสดจากข้อมูล:
  - งานจัดส่งทั้งหมด, รอดำเนินการ, กำลังจัดส่ง, จัดส่งสำเร็จ, ล่าช้ากว่ากำหนด, รถที่พร้อมใช้งาน
- แถบแจ้งเตือนงานจัดส่งล่าช้า (Delayed Shipment Alert Banner)
- กราฟแท่งเปรียบเทียบงานจัดส่งประจำสัปดาห์ (Weekly Shipments Trend)
- กราฟโดนัทแสดงสัดส่วนสถานะงานจัดส่ง (Status Distribution)
- วิดเจ็ตสถานะกองยานพาหนะ (Fleet Status Progress Bar)
- ตารางงานจัดส่ง 5 รายการล่าสุด พร้อมลิงก์ไปดูรายละเอียด

### 3. 📦 จัดการงานจัดส่ง (Delivery Tasks) — `/tasks`
- ตารางแสดงรายการงานขนส่งสินค้าทั้งหมด
- ช่องค้นหาแบบ Real-time (ค้นหาด้วยเลขพัสดุ TBL-..., ชื่อลูกค้า, ปลายทาง, พนักงานขับรถ, ชนิดสินค้า)
- ตัวกรองสถานะ (ทั้งหมด, รอดำเนินการ, กำลังจัดส่ง, สำเร็จ, ล่าช้า, ยกเลิก)
- ตัวกรองระดับความสำคัญ (ด่วนพิเศษ Express, ปกติ Standard, ประหยัด Economy)
- หน้าต่าง Modal สำหรับ **เพิ่มงานจัดส่งใหม่ (Add Task)** และ **แก้ไขงานจัดส่ง (Edit Task)**
- หน้าต่าง Modal ยืนยันการลบงานจัดส่ง (Confirm Delete Dialog)
- ปุ่มส่งออกข้อมูลเป็นไฟล์ **CSV (Export to CSV)**
- ระบบแบ่งหน้า (Pagination)

### 4. 📄 รายละเอียดงานจัดส่ง (Delivery Details) — `/tasks/:id`
- ข้อมูลผู้ส่ง (Origin Hub) และผู้รับปลายทาง (Destination)
- รายละเอียดสินค้า ปริมาตร (CBM) น้ำหนักรวม (กก.) และค่าบริการขนส่ง
- ข้อมูลรถบรรทุกและพนักงานขับรถที่ได้รับมอบหมาย
- **ประวัติการดำเนินงาน (Interactive Timeline)** แสดงลำดับขั้นตอนการจัดส่งพร้อมเวลาและชื่อผู้บันทึก
- ปุ่มอัปเดตสถานะงานจัดส่งพร้อมบันทึกหมายเหตุ
- **ระบบพิมพ์ใบส่งของ (Waybill / Consignment Note)** พร้อมฟังก์ชัน Print Preview

### 5. 🚛 ข้อมูลยานพาหนะ (Vehicle Management) — `/vehicles`
- ข้อมูลรถบรรทุก (4 ล้อตู้ทึบ, 6 ล้อตู้เย็น, 10 ล้อ, หัวลากเทรลเลอร์ 18 ล้อ, รถกระบะด่วน)
- สรุปรถพร้อมใช้งาน / กำลังวิ่งงาน / อยู่ระหว่างซ่อมบำรุง
- แสดงระดับน้ำมันคงเหลือ (Fuel Level Gauge) และเลขไมล์สะสม
- การเพิ่ม แก้ไข และลบข้อมูลยานพาหนะ

### 6. 👥 พนักงานขับรถ (Driver Management) — `/drivers`
- สถิติพนักงานทั้งหมด, พร้อมปฏิบัติงาน, กำลังจัดส่ง และลางาน
- สลับมุมมองได้ 2 แบบ: **มุมมองการ์ด (Grid View)** หรือ **มุมมองตาราง (Table View)**
- แสดงข้อมูลใบอนุญาตขับขี่ (ชนิดที่ 2, 3, 4), ประสบการณ์, คะแนนดาว (Safety Rating) และเที่ยววิ่งสะสม
- การเพิ่ม แก้ไข และลบข้อมูลพนักงานขับรถ

### 7. 🗺️ วางแผนเส้นทาง (Route Planning) — `/routes`
- เส้นทางขนส่งหลัก (เช่น ระเบียงเศรษฐกิจภาคตะวันออก EEC, สายเหนือ, วงแหวน กทม., สายอีสาน)
- การจำลองแผนผังจุดแวะส่งสินค้า (Waypoints Timeline)
- ฟังก์ชันคลิกอัปเดตสถานะจุดส่งสินค้า (ผ่านแล้ว / รอดำเนินการ) แบบ Interactive
- คำนวณระยะทางรวม เวลาโดยประมาณ ปริมาณเชื้อเพลิง และอัตราการบรรทุก (Cargo Load %)

### 8. 📈 รายงานและสถิติ (Reports) — `/reports`
- ตัวกรองช่วงเวลา: วันนี้, 7 วันล่าสุด, เดือนนี้, ไตรมาสนี้
- ตัวชี้วัดสำคัญ: อัตราการส่งตรงเวลา (On-Time Delivery Rate เช่น 96.8%), รายได้สะสม, ปริมาณสินค้ารวม
- กราฟแท่งสถิติการจัดส่งแยกตามภูมิภาค (Region Performance)
- กราฟสัดส่วนงานบริการแบ่งตามระดับความสำคัญ
- ตารางจัดอันดับประสิทธิภาพและความปลอดภัยของพนักงานขับรถ

### 9. 🔔 ศูนย์การแจ้งเตือน (Notifications) — `/notifications`
- รายการแจ้งเตือนแยกตามหมวดหมู่: งานล่าช้า, การซ่อมบำรุงรถ, งานส่งสำเร็จ, ข้อมูลระบบ
- ลิงก์ตรง (Direct Action Links) คลิกเพื่อเปิดงานที่ล่าช้าหรือหน้ารถคันที่ถึงรอบซ่อมบำรุงทันที
- ฟังก์ชันทำเครื่องหมายว่าอ่านแล้วรายข้อ หรือกดอ่านทั้งหมด (Mark all as read)

### 10. ⚙️ ข้อมูลผู้ใช้และการตั้งค่า (Profile & Settings) — `/settings`
- แก้ไขข้อมูลส่วนตัวพนักงาน (ชื่อ, ตำแหน่ง, แผนก, ศูนย์ประจำการ)
- ข้อมูลองค์กรและที่อยู่สำนักงานใหญ่สำหรับออกเอกสาร
- **สถาปัตยกรรมระบบ (Backend & DB Schema)**: แสดง Endpoint REST API และโครงสร้างตาราง MySQL สำหรับเตรียมเชื่อมต่อ Node.js + Express
- ปุ่ม **"รีเซ็ตข้อมูลจำลองทั้งหมด (Reset Mock Data)"** คืนค่าข้อมูลเริ่มต้น

---

## 🗄️ โครงสร้างฐานข้อมูลสำหรับต่อยอด Backend (MySQL Schema)

ระบบเตรียมรองรับตารางใน MySQL ไว้ดังนี้:

```sql
-- 1. ตารางงานจัดส่ง (delivery_tasks)
CREATE TABLE delivery_tasks (
  id VARCHAR(50) PRIMARY KEY,
  tracking_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  destination_address TEXT,
  item_description VARCHAR(255) NOT NULL,
  item_count INT DEFAULT 1,
  weight_kg DECIMAL(10,2) DEFAULT 0,
  volume_cbm DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'in_transit', 'completed', 'delayed', 'cancelled') DEFAULT 'pending',
  priority ENUM('express', 'standard', 'economy') DEFAULT 'standard',
  assigned_vehicle_id VARCHAR(50),
  assigned_driver_id VARCHAR(50),
  cost_thb DECIMAL(10,2) DEFAULT 0,
  estimated_arrival DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ตารางยานพาหนะ (vehicles)
CREATE TABLE vehicles (
  id VARCHAR(50) PRIMARY KEY,
  plate_number VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  capacity_kg DECIMAL(10,2) NOT NULL,
  volume_cbm DECIMAL(10,2) NOT NULL,
  fuel_type VARCHAR(50) DEFAULT 'ดีเซล (B7)',
  fuel_level_percent INT DEFAULT 100,
  mileage_km INT DEFAULT 0,
  status ENUM('available', 'in_use', 'maintenance') DEFAULT 'available',
  assigned_driver_id VARCHAR(50)
);

-- 3. ตารางพนักงานขับรถ (drivers)
CREATE TABLE drivers (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(100),
  license_type VARCHAR(100) NOT NULL,
  license_number VARCHAR(100),
  experience_years INT DEFAULT 1,
  rating DECIMAL(3,2) DEFAULT 5.0,
  total_trips INT DEFAULT 0,
  incident_count INT DEFAULT 0,
  status ENUM('active', 'on_duty', 'on_leave') DEFAULT 'active'
);

-- 4. ตารางบันทึกประวัติการส่ง (delivery_timeline)
CREATE TABLE delivery_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  task_id VARCHAR(50) NOT NULL,
  status_title VARCHAR(100) NOT NULL,
  description TEXT,
  actor VARCHAR(100),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES delivery_tasks(id) ON DELETE CASCADE
);
```

---

## 🚀 วิธีติดตั้งและเปิดใช้งาน (Installation & Setup)

### 1. ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) เวอร์ชัน 18.0 ขึ้นไป
- [npm](https://www.npmjs.com/) หรือ [yarn](https://yarnpkg.com/)

### 2. ติดตั้ง Dependencies
เปิด Terminal ในโฟลเดอร์โปรเจกต์ แล้วรันคำสั่ง:
```bash
npm install
```

### 3. เริ่มต้นรันเซิร์ฟเวอร์ทดสอบ (Development Server)
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่: **`http://localhost:5173/`**

### 4. ทดสอบสร้าง Production Bundle (Build)
```bash
npm run build
```
ทดสอบพรีวิวผลลัพธ์ของ Production Build:
```bash
npm run preview
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory Structure)

```text
c:/my-tbl/
├── index.html                   # ไฟล์ HTML หลักพร้อมฟอนต์ Prompt (Google Fonts)
├── package.json                 # การกำหนด dependencies และคำสั่ง scripts
├── vite.config.js               # การตั้งค่า Vite และ Tailwind CSS Plugin
├── src/
│   ├── main.jsx                 # Entry point ของ React application
│   ├── App.jsx                  # ระบบการตั้งค่า Router และ Context Providers
│   ├── index.css                # การกำหนดสไตล์ Tailwind CSS และ Scrollbar
│   ├── components/
│   │   ├── common/              # คอมโพเนนต์ที่นำกลับมาใช้ซ้ำ
│   │   │   ├── Badge.jsx        # ป้ายสถานะและระดับความสำคัญ
│   │   │   ├── StatCard.jsx     # การ์ดสรุป KPI ตัวชี้วัด
│   │   │   ├── Modal.jsx        # กล่องหน้าต่าง Popup Modal
│   │   │   ├── ConfirmModal.jsx # กล่องยืนยันการทำรายการลบ/รีเซ็ต
│   │   │   └── EmptyState.jsx   # สถานะเมื่อไม่พบข้อมูลการค้นหา
│   │   └── layout/              # โครงสร้างหน้าจอหลัก
│   │       ├── AppLayout.jsx    # โครงร่าง Sidebar + Topbar + Content
│   │       ├── Sidebar.jsx      # แถบนำทางด้านซ้ายสีเขียวเข้ม
│   │       └── Topbar.jsx       # แถบเมนูด้านบน ค้นหา และแจ้งเตือน
│   ├── context/                 # จัดการ State และ Mock Database
│   │   ├── AuthContext.jsx      # จำลองการเข้าสู่ระบบและสลับบทบาท
│   │   ├── LogisticsContext.jsx # ฐานข้อมูลจำลองและฟังก์ชัน CRUD
│   │   └── ToastContext.jsx     # ระบบแสดงข้อความแจ้งเตือน Toast
│   ├── data/
│   │   └── mockData.js          # ชุดข้อมูลจำลองงาน ยานพาหนะ และคนขับ
│   ├── pages/                   # หน้าจอทั้ง 10 หน้าของระบบ
│   │   ├── Login.jsx            # 1. หน้าเข้าสู่ระบบ
│   │   ├── Dashboard.jsx        # 2. หน้าแดชบอร์ดภาพรวม
│   │   ├── DeliveryTasks.jsx    # 3. หน้าจัดการงานจัดส่ง
│   │   ├── DeliveryDetails.jsx  # 4. หน้ารายละเอียดงานจัดส่ง & Timeline
│   │   ├── VehicleManagement.jsx# 5. หน้าจัดการยานพาหนะ
│   │   ├── DriverManagement.jsx # 6. หน้าจัดการพนักงานขับรถ
│   │   ├── RoutePlanning.jsx    # 7. หน้าวางแผนและติดตามเส้นทาง
│   │   ├── Reports.jsx          # 8. หน้ารายงานและวิเคราะห์ข้อมูล
│   │   ├── Notifications.jsx    # 9. หน้าศูนย์การแจ้งเตือน
│   │   ├── ProfileSettings.jsx  # 10. หน้าโปรไฟล์และการตั้งค่า
│   │   └── NotFound.jsx         # หน้า 404 เมื่อไม่พบ URL
│   └── utils/
│       └── formatters.js        # ฟังก์ชันแปลงตัวเลข วันที่ และสกุลเงินบาท
```

---

## 👨‍💻 พัฒนาสำหรับ Portfolio
โปรเจกต์นี้พัฒนาขึ้นตามหลักการ **Senior Frontend Engineering Practices**:
- Clean Code Architecture และแยก Concern ระหว่าง UI กับ State ชัดเจน
- ไม่ Hardcode ตัวเลข KPI แต่คำนวณจริงจาก Mock Data Array
- ออกแบบ UX สำหรับ Enterprise Intranet พร้อมระบบยืนยันความปลอดภัยก่อนลบข้อมูล
- รองรับการเชื่อมต่อ REST API กับ Node.js + Express.js + MySQL ได้ทันทีโดยไม่ต้องแก้โครงสร้างหน้าจอ
