import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function seed() {
  console.log('🌱 Starting database seeding for tbl_smart_logistics...');

  try {
    // 1. Seed Users
    const [userCount] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    let managerUserId = 1;
    if (userCount[0].cnt === 0) {
      console.log('👤 Seeding users...');
      const defaultPasswordHash = await bcrypt.hash('password123', 10);
      const adminPasswordHash = await bcrypt.hash('admin123456', 10);

      const [res1] = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role, phone, is_active)
         VALUES 
         (?, ?, ?, 'manager', '081-998-1234', 1),
         (?, ?, ?, 'staff', '082-334-5566', 1),
         (?, ?, ?, 'admin', '02-799-8800', 1)`,
        [
          'นันทวัฒน์ เกียรติเมธา',
          'manager@tbl-logistics.com',
          defaultPasswordHash,
          'ณิชาภัทร วงศ์เจริญ',
          'dispatcher@tbl-logistics.com',
          defaultPasswordHash,
          'ผู้ดูแลระบบ TBL',
          'admin@tbl-logistics.com',
          adminPasswordHash,
        ]
      );
      managerUserId = res1.insertId;
      console.log('✅ Users seeded successfully.');
    } else {
      console.log(`ℹ️ Users table already has ${userCount[0].cnt} rows. Skipping user seed.`);
      const [u] = await pool.query('SELECT id FROM users LIMIT 1');
      if (u.length > 0) managerUserId = u[0].id;
    }

    // 2. Seed Drivers
    const [driverCount] = await pool.query('SELECT COUNT(*) as cnt FROM drivers');
    if (driverCount[0].cnt === 0) {
      console.log('🚗 Seeding drivers...');
      await pool.query(
        `INSERT INTO drivers (employee_code, full_name, phone, license_number, status)
         VALUES
         ('EMP-701', 'สมศักดิ์ ใจบริการ', '081-456-7890', 'บ.2-589412', 'on_delivery'),
         ('EMP-702', 'ประสิทธิ์ มุ่งมั่น', '089-223-3445', 'บ.2-612458', 'on_delivery'),
         ('EMP-703', 'วิเชียร ขับขี่ดี', '086-778-9900', 'บ.3-441258', 'available'),
         ('EMP-704', 'อภิสิทธิ์ รวดเร็ว', '092-445-5667', 'บ.4-110293', 'on_delivery'),
         ('EMP-705', 'มานพ นำส่ง', '084-556-7788', 'บ.2-887412', 'available'),
         ('EMP-706', 'ชาญชัย มั่นคง', '083-990-1122', 'บ.1-992144', 'available'),
         ('EMP-707', 'ธีรเดช พร้อมเพรียง', '085-112-3344', 'บ.3-774411', 'off_duty')`
      );
      console.log('✅ Drivers seeded successfully.');
    } else {
      console.log(`ℹ️ Drivers table already has ${driverCount[0].cnt} rows.`);
    }

    // 3. Seed Vehicles
    const [vehicleCount] = await pool.query('SELECT COUNT(*) as cnt FROM vehicles');
    if (vehicleCount[0].cnt === 0) {
      console.log('🚚 Seeding vehicles...');
      await pool.query(
        `INSERT INTO vehicles (plate_number, vehicle_type, capacity_kg, status)
         VALUES
         ('70-4521 กทม.', 'รถ 4 ล้อตู้ทึบ (4-Wheel Box Truck)', 2500.00, 'unavailable'),
         ('71-8892 ชลบุรี', 'รถ 6 ล้อตู้ควบคุมอุณหภูมิ (Refrigerated 6-Wheeler)', 6500.00, 'unavailable'),
         ('70-1234 กทม.', 'รถ 10 ล้อตู้ทึบ (10-Wheel Cargo Truck)', 14000.00, 'available'),
         ('72-9981 ระยอง', 'รถหัวลากเทรลเลอร์ 18 ล้อ (18-Wheel Semi-Trailer)', 28000.00, 'unavailable'),
         ('70-6543 ปทุมธานี', 'รถ 4 ล้อกระบะตู้เย็น (Pickup Cold Chain)', 1500.00, 'maintenance'),
         ('71-3344 เชียงใหม่', 'รถ 6 ล้อเปิดข้าง (6-Wheel Side Curtain)', 7000.00, 'available'),
         ('1ฒฒ-4589 กทม.', 'รถกระบะทึบขนส่งด่วน (Express Van)', 1200.00, 'available'),
         ('70-9812 ขอนแก่น', 'รถ 10 ล้อพื้นเรียบ (10-Wheel Flatbed)', 15000.00, 'available')`
      );
      console.log('✅ Vehicles seeded successfully.');
    } else {
      console.log(`ℹ️ Vehicles table already has ${vehicleCount[0].cnt} rows.`);
    }

    // 4. Seed Delivery Tasks
    const [taskCount] = await pool.query('SELECT COUNT(*) as cnt FROM delivery_tasks');
    if (taskCount[0].cnt === 0) {
      console.log('📦 Seeding delivery tasks and timeline history...');
      const [drivers] = await pool.query('SELECT id, employee_code FROM drivers ORDER BY id ASC');
      const [vehicles] = await pool.query('SELECT id, plate_number FROM vehicles ORDER BY id ASC');

      const d1 = drivers[0]?.id || null;
      const d2 = drivers[1]?.id || null;
      const d3 = drivers[2]?.id || null;
      const d4 = drivers[3]?.id || null;
      const d5 = drivers[4]?.id || null;

      const v1 = vehicles[0]?.id || null;
      const v2 = vehicles[1]?.id || null;
      const v3 = vehicles[2]?.id || null;
      const v4 = vehicles[3]?.id || null;
      const v5 = vehicles[5]?.id || null;

      const tasksToInsert = [
        {
          task_code: 'TBL-8849102',
          recipient_name: 'บริษัท ไทยเทรดดิ้ง กรุ๊ป จำกัด',
          recipient_phone: '081-884-2311',
          delivery_address: '88/4 หมู่ 3 ต.ทุ่งสุขลา อ.ศรีราชา จ.ชลบุรี 20230',
          province: 'ชลบุรี',
          postal_code: '20230',
          item_description: 'ชิ้นส่วนอิเล็กทรอนิกส์และวงจรยานยนต์',
          weight_kg: 1250.00,
          status: 'in_transit',
          priority: 'high',
          scheduled_date: '2026-10-21 14:30:00',
          distance_km: 110.00,
          driver_id: d1,
          vehicle_id: v1,
        },
        {
          task_code: 'TBL-8849103',
          recipient_name: 'บริษัท โกลบอลฟู้ดส์ โปรดักส์ จำกัด',
          recipient_phone: '089-771-4455',
          delivery_address: '700/125 หมู่ 1 ต.ดอนหัวฬ่อ อ.เมือง จ.ชลบุรี 20000',
          province: 'ชลบุรี',
          postal_code: '20000',
          item_description: 'อาหารแปรรูปแช่แข็ง อุณหภูมิ -18°C',
          weight_kg: 4200.00,
          status: 'in_transit',
          priority: 'high',
          scheduled_date: '2026-10-21 13:00:00',
          distance_km: 85.00,
          driver_id: d2,
          vehicle_id: v2,
        },
        {
          task_code: 'TBL-8849104',
          recipient_name: 'บริษัท ออโตโมทีฟ พาร์ทส์ (ไทยแลนด์) จำกัด',
          recipient_phone: '086-443-1299',
          delivery_address: '9/2 ถนนไอ-สี่ นิคมอุตสาหกรรมมาบตาพุด ต.มาบตาพุด อ.เมือง จ.ระยอง 21150',
          province: 'ระยอง',
          postal_code: '21150',
          item_description: 'โครงแชสซีและชิ้นส่วนเหล็กโครงสร้าง',
          weight_kg: 18500.00,
          status: 'delayed',
          priority: 'normal',
          scheduled_date: '2026-10-21 11:30:00',
          distance_km: 175.00,
          driver_id: d4,
          vehicle_id: v4,
        },
        {
          task_code: 'TBL-8849100',
          recipient_name: 'โรงพยาบาลกรุงเทพพัทยา',
          recipient_phone: '038-259-999',
          delivery_address: '301 หมู่ 6 ถ.สุขุมวิท กม.143 ต.นาเกลือ อ.บางละมุง จ.ชลบุรี 20150',
          province: 'ชลบุรี',
          postal_code: '20150',
          item_description: 'เวชภัณฑ์และน้ำยาตรวจวิเคราะห์ทางชีวเคมี',
          weight_kg: 320.00,
          status: 'completed',
          priority: 'high',
          scheduled_date: '2026-10-21 09:45:00',
          delivered_at: '2026-10-21 09:46:00',
          distance_km: 125.00,
          driver_id: d1,
          vehicle_id: v1,
        },
        {
          task_code: 'TBL-8849108',
          recipient_name: 'บริษัท เคมีอุตสาหกรรมไทย จำกัด',
          recipient_phone: '02-398-1122',
          delivery_address: '55 หมู่ 2 ถ.เทพารักษ์ ต.บางเสาธง อ.บางเสาธง จ.สมุทรปราการ 10540',
          province: 'สมุทรปราการ',
          postal_code: '10540',
          item_description: 'เคมีภัณฑ์อุตสาหกรรม บรรจุถัง IBC',
          weight_kg: 5600.00,
          status: 'pending',
          priority: 'normal',
          scheduled_date: '2026-10-21 16:00:00',
          distance_km: 25.00,
          driver_id: null,
          vehicle_id: null,
        },
        {
          task_code: 'TBL-8849109',
          recipient_name: 'ศูนย์กระจายสินค้า โมเดิร์นเทรด วังน้อย',
          recipient_phone: '035-271-888',
          delivery_address: '188/9 หมู่ 4 ต.ลำไทร อ.วังน้อย จ.พระนครศรีอยุธยา 13170',
          province: 'พระนครศรีอยุธยา',
          postal_code: '13170',
          item_description: 'สินค้าอุปโภคบริโภคสำหรับซูเปอร์มาร์เก็ต',
          weight_kg: 6800.00,
          status: 'pending',
          priority: 'normal',
          scheduled_date: '2026-10-22 08:30:00',
          distance_km: 92.00,
          driver_id: d5,
          vehicle_id: v5,
        },
      ];

      for (const t of tasksToInsert) {
        const [res] = await pool.query(
          `INSERT INTO delivery_tasks
           (task_code, recipient_name, recipient_phone, delivery_address, province, postal_code,
            item_description, weight_kg, status, priority, scheduled_date, delivered_at,
            distance_km, driver_id, vehicle_id, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            t.task_code,
            t.recipient_name,
            t.recipient_phone,
            t.delivery_address,
            t.province,
            t.postal_code,
            t.item_description,
            t.weight_kg,
            t.status,
            t.priority,
            t.scheduled_date,
            t.delivered_at || null,
            t.distance_km,
            t.driver_id,
            t.vehicle_id,
            managerUserId,
          ]
        );

        const newTaskId = res.insertId;

        // Insert initial history
        await pool.query(
          `INSERT INTO delivery_history (task_id, status, description, location, recorded_by)
           VALUES (?, ?, ?, ?, ?)`,
          [
            newTaskId,
            t.status,
            `สร้างคำสั่งจัดส่ง ${t.task_code} (${t.recipient_name}) เรียบร้อยแล้ว`,
            'ศูนย์กระจายสินค้า TBL บางนา กม.19',
            managerUserId,
          ]
        );

        if (t.status === 'in_transit' || t.status === 'delayed' || t.status === 'completed') {
          await pool.query(
            `INSERT INTO delivery_history (task_id, status, description, location, recorded_by)
             VALUES (?, ?, ?, ?, ?)`,
            [
              newTaskId,
              t.status,
              t.status === 'completed'
                ? 'จัดส่งสินค้าถึงปลายทางและลงนามรับมอบเรียบร้อย'
                : t.status === 'delayed'
                ? 'การจราจรติดขัดรุนแรง ปรับเวลาประเมินใหม่'
                : 'ยานพาหนะออกจากศูนย์กระจายสินค้า เดินทางสู่ปลายทาง',
              t.delivery_address,
              managerUserId,
            ]
          );
        }
      }

      console.log('✅ Delivery tasks seeded successfully.');
    } else {
      console.log(`ℹ️ Delivery tasks table already has ${taskCount[0].cnt} rows.`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during database seeding:', err);
    process.exit(1);
  }
}

seed();
