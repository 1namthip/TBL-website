import { Router } from 'express';
import pool from '../config/database.js';

const router = Router();

// Map UI status to DB status
const normalizeStatusToDb = (status) => {
  if (!status) return 'available';
  const map = {
    available: 'available',
    in_use: 'unavailable',
    unavailable: 'unavailable',
    maintenance: 'maintenance',
  };
  return map[status.toLowerCase()] || 'available';
};

// Map DB vehicle to frontend friendly format
const formatVehicle = (row) => ({
  ...row,
  plateNumber: row.plate_number,
  type: row.vehicle_type,
  capacityKg: Number(row.capacity_kg) || 0,
});

// GET /api/vehicles - List vehicles with search and status filter
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT id, plate_number, vehicle_type, capacity_kg, status, created_at, updated_at
      FROM vehicles
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (plate_number LIKE ? OR vehicle_type LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    if (status && status !== 'all') {
      const dbStatus = normalizeStatusToDb(status);
      query += ` AND status = ?`;
      params.push(dbStatus);
    }

    query += ` ORDER BY id ASC`;

    const [rows] = await pool.query(query, params);
    const data = rows.map(formatVehicle);

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลยานพาหนะ' });
  }
});

// GET /api/vehicles/:id - Get vehicle by id
router.get('/:id', async (req, res) => {
  try {
    const vehicleId = Number(req.params.id);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ success: false, message: 'รหัสยานพาหนะไม่ถูกต้อง' });
    }

    const [rows] = await pool.query(
      `SELECT id, plate_number, vehicle_type, capacity_kg, status, created_at, updated_at
       FROM vehicles WHERE id = ?`,
      [vehicleId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลยานพาหนะ' });
    }

    res.json({ success: true, data: formatVehicle(rows[0]) });
  } catch (error) {
    console.error('Error fetching vehicle by id:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลยานพาหนะ' });
  }
});

// POST /api/vehicles - Create new vehicle
router.post('/', async (req, res) => {
  try {
    const {
      plate_number,
      plateNumber,
      vehicle_type,
      type,
      capacity_kg,
      capacityKg,
      status,
    } = req.body;

    const plate = (plate_number || plateNumber || '').trim();
    if (!plate) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกหมายเลขทะเบียนรถ' });
    }

    const vType = (vehicle_type || type || 'รถ 4 ล้อตู้ทึบ (4-Wheel Box Truck)').trim();
    const capacity = Number(capacity_kg !== undefined ? capacity_kg : capacityKg) || 0;
    const dbStatus = normalizeStatusToDb(status);

    // Check duplicate plate_number
    const [existing] = await pool.query('SELECT id FROM vehicles WHERE plate_number = ?', [plate]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: `หมายเลขทะเบียน ${plate} มีอยู่ในระบบแล้ว` });
    }

    const [result] = await pool.query(
      `INSERT INTO vehicles (plate_number, vehicle_type, capacity_kg, status)
       VALUES (?, ?, ?, ?)`,
      [plate, vType, capacity, dbStatus]
    );

    const [newVehicle] = await pool.query(
      `SELECT id, plate_number, vehicle_type, capacity_kg, status, created_at, updated_at
       FROM vehicles WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลยานพาหนะเรียบร้อยแล้ว',
      data: formatVehicle(newVehicle[0]),
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลยานพาหนะ' });
  }
});

// PUT /api/vehicles/:id - Update vehicle by id
router.put('/:id', async (req, res) => {
  try {
    const vehicleId = Number(req.params.id);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ success: false, message: 'รหัสยานพาหนะไม่ถูกต้อง' });
    }

    const [existing] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลยานพาหนะ' });
    }

    const current = existing[0];
    const {
      plate_number,
      plateNumber,
      vehicle_type,
      type,
      capacity_kg,
      capacityKg,
      status,
    } = req.body;

    const rawPlate = plate_number !== undefined ? plate_number : plateNumber;
    const updatedPlate = rawPlate !== undefined ? rawPlate.trim() : current.plate_number;

    const rawType = vehicle_type !== undefined ? vehicle_type : type;
    const updatedType = rawType !== undefined ? rawType.trim() : current.vehicle_type;

    const rawCapacity = capacity_kg !== undefined ? capacity_kg : capacityKg;
    const updatedCapacity = rawCapacity !== undefined ? Number(rawCapacity) || 0 : current.capacity_kg;

    const updatedStatus = status ? normalizeStatusToDb(status) : current.status;

    // Check duplicate plate if changed
    if (updatedPlate !== current.plate_number) {
      const [dup] = await pool.query('SELECT id FROM vehicles WHERE plate_number = ? AND id != ?', [updatedPlate, vehicleId]);
      if (dup.length > 0) {
        return res.status(409).json({ success: false, message: `หมายเลขทะเบียน ${updatedPlate} มีอยู่ในระบบแล้ว` });
      }
    }

    await pool.query(
      `UPDATE vehicles
       SET plate_number = ?, vehicle_type = ?, capacity_kg = ?, status = ?
       WHERE id = ?`,
      [updatedPlate, updatedType, updatedCapacity, updatedStatus, vehicleId]
    );

    const [updated] = await pool.query(
      `SELECT id, plate_number, vehicle_type, capacity_kg, status, created_at, updated_at
       FROM vehicles WHERE id = ?`,
      [vehicleId]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลยานพาหนะเรียบร้อยแล้ว',
      data: formatVehicle(updated[0]),
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลยานพาหนะ' });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const vehicleId = Number(req.params.id);
    if (isNaN(vehicleId)) {
      return res.status(400).json({ success: false, message: 'รหัสยานพาหนะไม่ถูกต้อง' });
    }

    const [existing] = await pool.query('SELECT id FROM vehicles WHERE id = ?', [vehicleId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลยานพาหนะ' });
    }

    // Check active delivery assignments
    const [assignedTasks] = await pool.query(
      'SELECT id, task_code FROM delivery_tasks WHERE vehicle_id = ? AND status IN ("pending", "in_transit")',
      [vehicleId]
    );
    if (assignedTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถลบได้ เนื่องจากรถคันนี้มีงานจัดส่งที่กำลังดำเนินการอยู่ (${assignedTasks.length} งาน)`,
      });
    }

    await pool.query('DELETE FROM vehicles WHERE id = ?', [vehicleId]);

    res.json({ success: true, message: 'ลบข้อมูลยานพาหนะเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล (อาจมีการอ้างอิงในงานจัดส่ง)' });
  }
});

export default router;
