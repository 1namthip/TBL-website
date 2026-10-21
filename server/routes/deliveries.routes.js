import { Router } from 'express';
import pool from '../config/database.js';

const router = Router();

// Helper to resolve driver id from id or employee_code
const resolveDriverId = async (input) => {
  if (!input) return null;
  const num = Number(input);
  if (!isNaN(num) && num > 0) {
    const [rows] = await pool.query('SELECT id FROM drivers WHERE id = ?', [num]);
    if (rows.length > 0) return rows[0].id;
  }
  // Try match code like DRV-001 or EMP-701
  const [rows] = await pool.query(
    'SELECT id FROM drivers WHERE employee_code = ? OR id = ?',
    [String(input), String(input).replace(/\D/g, '') || 0]
  );
  return rows.length > 0 ? rows[0].id : null;
};

// Helper to resolve vehicle id from id or plate_number
const resolveVehicleId = async (input) => {
  if (!input) return null;
  const num = Number(input);
  if (!isNaN(num) && num > 0) {
    const [rows] = await pool.query('SELECT id FROM vehicles WHERE id = ?', [num]);
    if (rows.length > 0) return rows[0].id;
  }
  // Try match plate_number or VH-001
  const [rows] = await pool.query(
    'SELECT id FROM vehicles WHERE plate_number = ? OR id = ?',
    [String(input), String(input).replace(/\D/g, '') || 0]
  );
  return rows.length > 0 ? rows[0].id : null;
};

// Map priority UI to DB
const normalizePriorityToDb = (priority) => {
  if (!priority) return 'normal';
  const map = {
    economy: 'low',
    low: 'low',
    standard: 'normal',
    normal: 'normal',
    express: 'high',
    high: 'high',
  };
  return map[priority.toLowerCase()] || 'normal';
};

// Map priority DB to UI
const mapPriorityToUi = (priority) => {
  if (priority === 'low') return 'economy';
  if (priority === 'high') return 'express';
  return 'standard';
};

// Map status to Thai label for timeline
const mapStatusToThai = (status) => {
  const map = {
    pending: 'สร้างคำสั่งจัดส่ง',
    in_transit: 'กำลังจัดส่ง',
    completed: 'จัดส่งสำเร็จ',
    delayed: 'ล่าช้ากว่ากำหนด',
    cancelled: 'ยกเลิกรายการ',
  };
  return map[status] || 'อัปเดตสถานะ';
};

// Format delivery task to include UI-compatible and DB-compatible properties
const formatTask = (row, timeline = []) => ({
  id: row.id,
  task_code: row.task_code,
  trackingNumber: row.task_code,
  recipient_name: row.recipient_name,
  customerName: row.recipient_name,
  recipient_phone: row.recipient_phone,
  contactPhone: row.recipient_phone,
  delivery_address: row.delivery_address,
  destination: row.delivery_address,
  destinationAddress: row.delivery_address,
  province: row.province,
  postal_code: row.postal_code,
  origin: 'ศูนย์กระจายสินค้า TBL บางนา กม.19',
  item_description: row.item_description,
  itemDescription: row.item_description,
  itemCount: 1,
  weight_kg: Number(row.weight_kg) || 0,
  weightKg: Number(row.weight_kg) || 0,
  volumeCbm: 1.0,
  status: row.status,
  priority: mapPriorityToUi(row.priority),
  rawPriority: row.priority,
  distance_km: row.distance_km ? Number(row.distance_km) : null,
  costThb: row.distance_km ? Math.round(Number(row.distance_km) * 35) : 3500,
  driver_id: row.driver_id,
  assignedDriverId: row.driver_id ? `DRV-${String(row.driver_id).padStart(3, '0')}` : null,
  assignedDriverName: row.driver_name || null,
  assignedDriverPhone: row.driver_phone || null,
  vehicle_id: row.vehicle_id,
  assignedVehicleId: row.vehicle_id ? `VH-${String(row.vehicle_id).padStart(3, '0')}` : null,
  assignedVehiclePlate: row.plate_number || null,
  scheduled_date: row.scheduled_date,
  estimatedArrival: row.scheduled_date,
  delivered_at: row.delivered_at,
  completedAt: row.delivered_at,
  created_at: row.created_at,
  createdAt: row.created_at,
  updated_at: row.updated_at,
  timeline: timeline.map((t) => ({
    id: t.id,
    status: mapStatusToThai(t.status),
    rawStatus: t.status,
    description: t.description,
    location: t.location,
    timestamp: t.created_at,
    actor: t.recorder_name || 'เจ้าหน้าที่ระบบ TBL',
  })),
});

// GET /api/deliveries - List deliveries with search and filters
router.get('/', async (req, res) => {
  try {
    const { search, status, priority, driver_id, vehicle_id } = req.query;
    let query = `
      SELECT 
        dt.*,
        d.full_name AS driver_name,
        d.phone AS driver_phone,
        v.plate_number AS plate_number,
        v.vehicle_type AS vehicle_type
      FROM delivery_tasks dt
      LEFT JOIN drivers d ON dt.driver_id = d.id
      LEFT JOIN vehicles v ON dt.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (
        dt.task_code LIKE ? OR 
        dt.recipient_name LIKE ? OR 
        dt.delivery_address LIKE ? OR 
        dt.item_description LIKE ? OR
        d.full_name LIKE ? OR
        v.plate_number LIKE ?
      )`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term, term, term);
    }

    if (status && status !== 'all') {
      query += ` AND dt.status = ?`;
      params.push(status);
    }

    if (priority && priority !== 'all') {
      const dbPriority = normalizePriorityToDb(priority);
      query += ` AND dt.priority = ?`;
      params.push(dbPriority);
    }

    if (driver_id) {
      query += ` AND dt.driver_id = ?`;
      params.push(Number(driver_id));
    }

    if (vehicle_id) {
      query += ` AND dt.vehicle_id = ?`;
      params.push(Number(vehicle_id));
    }

    query += ` ORDER BY dt.id DESC`;

    const [rows] = await pool.query(query, params);
    const data = rows.map((r) => formatTask(r, []));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching delivery tasks:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลงานจัดส่ง' });
  }
});

// GET /api/deliveries/:id - Get delivery details including timeline
router.get('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    let taskRow = null;

    // Check by numeric id or task_code
    const numId = Number(rawId);
    if (!isNaN(numId) && numId > 0) {
      const [rows] = await pool.query(
        `SELECT 
          dt.*,
          d.full_name AS driver_name,
          d.phone AS driver_phone,
          v.plate_number AS plate_number,
          v.vehicle_type AS vehicle_type
        FROM delivery_tasks dt
        LEFT JOIN drivers d ON dt.driver_id = d.id
        LEFT JOIN vehicles v ON dt.vehicle_id = v.id
        WHERE dt.id = ?`,
        [numId]
      );
      if (rows.length > 0) taskRow = rows[0];
    }

    if (!taskRow) {
      const [rows] = await pool.query(
        `SELECT 
          dt.*,
          d.full_name AS driver_name,
          d.phone AS driver_phone,
          v.plate_number AS plate_number,
          v.vehicle_type AS vehicle_type
        FROM delivery_tasks dt
        LEFT JOIN drivers d ON dt.driver_id = d.id
        LEFT JOIN vehicles v ON dt.vehicle_id = v.id
        WHERE dt.task_code = ?`,
        [rawId]
      );
      if (rows.length > 0) taskRow = rows[0];
    }

    if (!taskRow) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลงานจัดส่ง' });
    }

    // Fetch delivery history timeline
    const [timelineRows] = await pool.query(
      `SELECT dh.*, u.full_name AS recorder_name
       FROM delivery_history dh
       LEFT JOIN users u ON dh.recorded_by = u.id
       WHERE dh.task_id = ?
       ORDER BY dh.created_at ASC`,
      [taskRow.id]
    );

    res.json({ success: true, data: formatTask(taskRow, timelineRows) });
  } catch (error) {
    console.error('Error fetching delivery details:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลรายละเอียดงานจัดส่ง' });
  }
});

// POST /api/deliveries - Create new delivery task
router.post('/', async (req, res) => {
  try {
    const {
      task_code,
      trackingNumber,
      recipient_name,
      customerName,
      recipient_phone,
      contactPhone,
      delivery_address,
      destination,
      destinationAddress,
      province,
      postal_code,
      item_description,
      itemDescription,
      weight_kg,
      weightKg,
      status = 'pending',
      priority = 'standard',
      scheduled_date,
      estimatedArrival,
      driver_id,
      assignedDriverId,
      vehicle_id,
      assignedVehicleId,
      created_by,
      notes,
    } = req.body;

    const recipient = (recipient_name || customerName || '').trim();
    if (!recipient) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อผู้รับ / ลูกค้า' });
    }

    const address = (delivery_address || destinationAddress || destination || '').trim();
    if (!address) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกที่อยู่ปลายทางสำหรับจัดส่ง' });
    }

    // Generate unique tracking task code if not given
    let code = (task_code || trackingNumber || '').trim();
    if (!code) {
      code = `TBL-${Math.floor(1000000 + Math.random() * 9000000)}`;
    }

    // Check duplicate task_code
    const [existingCode] = await pool.query('SELECT id FROM delivery_tasks WHERE task_code = ?', [code]);
    if (existingCode.length > 0) {
      code = `TBL-${Math.floor(1000000 + Math.random() * 9000000)}`;
    }

    const phone = (recipient_phone || contactPhone || '').trim() || null;
    const itemDesc = (item_description || itemDescription || notes || 'สินค้าทั่วไป').trim();
    const weight = Number(weight_kg !== undefined ? weight_kg : weightKg) || 0;
    const validStatuses = ['pending', 'in_transit', 'completed', 'delayed', 'cancelled'];
    const safeStatus = validStatuses.includes(status) ? status : 'pending';
    const safePriority = normalizePriorityToDb(priority);
    const scheduled = scheduled_date || estimatedArrival || null;

    // Resolve Foreign Keys
    const resolvedDriverId = await resolveDriverId(driver_id || assignedDriverId);
    const resolvedVehicleId = await resolveVehicleId(vehicle_id || assignedVehicleId);

    // Validate creator user id if given
    let validCreatorId = null;
    if (created_by) {
      const [uRows] = await pool.query('SELECT id FROM users WHERE id = ?', [Number(created_by)]);
      if (uRows.length > 0) validCreatorId = uRows[0].id;
    }

    const [result] = await pool.query(
      `INSERT INTO delivery_tasks 
       (task_code, recipient_name, recipient_phone, delivery_address, province, postal_code, item_description, weight_kg, status, priority, scheduled_date, driver_id, vehicle_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        recipient,
        phone,
        address,
        province || null,
        postal_code || null,
        itemDesc,
        weight,
        safeStatus,
        safePriority,
        scheduled,
        resolvedDriverId,
        resolvedVehicleId,
        validCreatorId,
      ]
    );

    const taskId = result.insertId;

    // Insert initial entry into delivery_history
    await pool.query(
      `INSERT INTO delivery_history (task_id, status, description, location, recorded_by)
       VALUES (?, ?, ?, ?, ?)`,
      [
        taskId,
        safeStatus,
        `สร้างคำสั่งจัดส่ง ${code} เรียบร้อยแล้ว`,
        'ศูนย์กระจายสินค้า TBL บางนา กม.19',
        validCreatorId,
      ]
    );

    // If vehicle assigned and status in_transit, update vehicle status to unavailable (in_use)
    if (resolvedVehicleId && safeStatus === 'in_transit') {
      await pool.query('UPDATE vehicles SET status = "unavailable" WHERE id = ?', [resolvedVehicleId]);
    }

    // If driver assigned and status in_transit, update driver status to on_delivery
    if (resolvedDriverId && safeStatus === 'in_transit') {
      await pool.query('UPDATE drivers SET status = "on_delivery" WHERE id = ?', [resolvedDriverId]);
    }

    // Fetch created task with joins
    const [createdRows] = await pool.query(
      `SELECT 
        dt.*,
        d.full_name AS driver_name,
        d.phone AS driver_phone,
        v.plate_number AS plate_number,
        v.vehicle_type AS vehicle_type
      FROM delivery_tasks dt
      LEFT JOIN drivers d ON dt.driver_id = d.id
      LEFT JOIN vehicles v ON dt.vehicle_id = v.id
      WHERE dt.id = ?`,
      [taskId]
    );

    const [timelineRows] = await pool.query(
      `SELECT dh.*, u.full_name AS recorder_name
       FROM delivery_history dh
       LEFT JOIN users u ON dh.recorded_by = u.id
       WHERE dh.task_id = ?
       ORDER BY dh.created_at ASC`,
      [taskId]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างงานจัดส่งเรียบร้อยแล้ว',
      data: formatTask(createdRows[0], timelineRows),
    });
  } catch (error) {
    console.error('Error creating delivery task:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกงานจัดส่ง' });
  }
});

// PUT /api/deliveries/:id - Update delivery task
router.put('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const numId = Number(rawId);

    // Look up task
    let taskRow = null;
    if (!isNaN(numId) && numId > 0) {
      const [rows] = await pool.query('SELECT * FROM delivery_tasks WHERE id = ?', [numId]);
      if (rows.length > 0) taskRow = rows[0];
    }
    if (!taskRow) {
      const [rows] = await pool.query('SELECT * FROM delivery_tasks WHERE task_code = ?', [rawId]);
      if (rows.length > 0) taskRow = rows[0];
    }

    if (!taskRow) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลงานจัดส่ง' });
    }

    const taskId = taskRow.id;
    const {
      recipient_name,
      customerName,
      recipient_phone,
      contactPhone,
      delivery_address,
      destination,
      destinationAddress,
      province,
      postal_code,
      item_description,
      itemDescription,
      weight_kg,
      weightKg,
      status,
      priority,
      scheduled_date,
      estimatedArrival,
      delivered_at,
      completedAt,
      driver_id,
      assignedDriverId,
      vehicle_id,
      assignedVehicleId,
      statusNote,
    } = req.body;

    const rawRecipient = recipient_name !== undefined ? recipient_name : customerName;
    const updatedRecipient = rawRecipient !== undefined ? rawRecipient.trim() : taskRow.recipient_name;

    const rawAddress = delivery_address !== undefined ? delivery_address : (destinationAddress || destination);
    const updatedAddress = rawAddress !== undefined ? rawAddress.trim() : taskRow.delivery_address;

    const rawPhone = recipient_phone !== undefined ? recipient_phone : contactPhone;
    const updatedPhone = rawPhone !== undefined ? (rawPhone ? rawPhone.trim() : null) : taskRow.recipient_phone;

    const rawDesc = item_description !== undefined ? item_description : itemDescription;
    const updatedDesc = rawDesc !== undefined ? (rawDesc ? rawDesc.trim() : null) : taskRow.item_description;

    const rawWeight = weight_kg !== undefined ? weight_kg : weightKg;
    const updatedWeight = rawWeight !== undefined ? Number(rawWeight) || 0 : taskRow.weight_kg;

    const validStatuses = ['pending', 'in_transit', 'completed', 'delayed', 'cancelled'];
    const updatedStatus = status && validStatuses.includes(status) ? status : taskRow.status;
    const updatedPriority = priority ? normalizePriorityToDb(priority) : taskRow.priority;

    const updatedScheduled = scheduled_date !== undefined ? scheduled_date : (estimatedArrival !== undefined ? estimatedArrival : taskRow.scheduled_date);
    let updatedDeliveredAt = delivered_at !== undefined ? delivered_at : (completedAt !== undefined ? completedAt : taskRow.delivered_at);

    if (updatedStatus === 'completed' && !updatedDeliveredAt) {
      updatedDeliveredAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    // Resolve Foreign Keys if provided
    let updatedDriverId = taskRow.driver_id;
    if (driver_id !== undefined || assignedDriverId !== undefined) {
      const targetDriver = driver_id !== undefined ? driver_id : assignedDriverId;
      updatedDriverId = targetDriver ? await resolveDriverId(targetDriver) : null;
    }

    let updatedVehicleId = taskRow.vehicle_id;
    if (vehicle_id !== undefined || assignedVehicleId !== undefined) {
      const targetVehicle = vehicle_id !== undefined ? vehicle_id : assignedVehicleId;
      updatedVehicleId = targetVehicle ? await resolveVehicleId(targetVehicle) : null;
    }

    await pool.query(
      `UPDATE delivery_tasks
       SET recipient_name = ?, recipient_phone = ?, delivery_address = ?, province = ?, postal_code = ?,
           item_description = ?, weight_kg = ?, status = ?, priority = ?, scheduled_date = ?,
           delivered_at = ?, driver_id = ?, vehicle_id = ?
       WHERE id = ?`,
      [
        updatedRecipient,
        updatedPhone,
        updatedAddress,
        province !== undefined ? province : taskRow.province,
        postal_code !== undefined ? postal_code : taskRow.postal_code,
        updatedDesc,
        updatedWeight,
        updatedStatus,
        updatedPriority,
        updatedScheduled,
        updatedDeliveredAt,
        updatedDriverId,
        updatedVehicleId,
        taskId,
      ]
    );

    // If status changed, log into delivery_history
    if (updatedStatus !== taskRow.status) {
      const note = statusNote || `เปลี่ยนสถานะเป็น ${mapStatusToThai(updatedStatus)}`;
      await pool.query(
        `INSERT INTO delivery_history (task_id, status, description, location)
         VALUES (?, ?, ?, ?)`,
        [taskId, updatedStatus, note, updatedAddress]
      );

      // Adjust driver/vehicle status if completed
      if (updatedStatus === 'completed') {
        if (updatedVehicleId) {
          await pool.query('UPDATE vehicles SET status = "available" WHERE id = ?', [updatedVehicleId]);
        }
        if (updatedDriverId) {
          await pool.query('UPDATE drivers SET status = "available" WHERE id = ?', [updatedDriverId]);
        }
      }
    }

    // Fetch updated task
    const [updatedRows] = await pool.query(
      `SELECT 
        dt.*,
        d.full_name AS driver_name,
        d.phone AS driver_phone,
        v.plate_number AS plate_number,
        v.vehicle_type AS vehicle_type
      FROM delivery_tasks dt
      LEFT JOIN drivers d ON dt.driver_id = d.id
      LEFT JOIN vehicles v ON dt.vehicle_id = v.id
      WHERE dt.id = ?`,
      [taskId]
    );

    const [timelineRows] = await pool.query(
      `SELECT dh.*, u.full_name AS recorder_name
       FROM delivery_history dh
       LEFT JOIN users u ON dh.recorded_by = u.id
       WHERE dh.task_id = ?
       ORDER BY dh.created_at ASC`,
      [taskId]
    );

    res.json({
      success: true,
      message: 'อัปเดตงานจัดส่งเรียบร้อยแล้ว',
      data: formatTask(updatedRows[0], timelineRows),
    });
  } catch (error) {
    console.error('Error updating delivery task:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขงานจัดส่ง' });
  }
});

// DELETE /api/deliveries/:id - Delete delivery task
router.delete('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const numId = Number(rawId);

    let taskId = null;
    if (!isNaN(numId) && numId > 0) {
      const [rows] = await pool.query('SELECT id FROM delivery_tasks WHERE id = ?', [numId]);
      if (rows.length > 0) taskId = rows[0].id;
    }
    if (!taskId) {
      const [rows] = await pool.query('SELECT id FROM delivery_tasks WHERE task_code = ?', [rawId]);
      if (rows.length > 0) taskId = rows[0].id;
    }

    if (!taskId) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลงานจัดส่ง' });
    }

    // Delete related records first to ensure foreign key integrity
    await pool.query('DELETE FROM delivery_history WHERE task_id = ?', [taskId]);
    await pool.query('DELETE FROM route_stops WHERE task_id = ?', [taskId]);
    await pool.query('DELETE FROM notifications WHERE task_id = ?', [taskId]);
    await pool.query('DELETE FROM delivery_tasks WHERE id = ?', [taskId]);

    res.json({ success: true, message: 'ลบข้อมูลงานจัดส่งเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting delivery task:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบงานจัดส่ง' });
  }
});

export default router;
