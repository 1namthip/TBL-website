import { Router } from 'express';
import pool from '../config/database.js';

const router = Router();

// Map UI status to DB status
const normalizeStatusToDb = (status) => {
  if (!status) return 'available';
  const map = {
    active: 'available',
    available: 'available',
    on_duty: 'on_delivery',
    on_delivery: 'on_delivery',
    on_leave: 'off_duty',
    off_duty: 'off_duty',
  };
  return map[status.toLowerCase()] || 'available';
};

// Map DB driver to frontend friendly format while keeping raw DB fields
const formatDriver = (row) => ({
  ...row,
  code: row.employee_code,
  name: row.full_name,
  licenseNumber: row.license_number,
});

// GET /api/drivers - List drivers with search and status filter
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT id, employee_code, full_name, phone, license_number, status, created_at, updated_at
      FROM drivers
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR employee_code LIKE ? OR phone LIKE ? OR license_number LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'all') {
      const dbStatus = normalizeStatusToDb(status);
      query += ` AND status = ?`;
      params.push(dbStatus);
    }

    query += ` ORDER BY id ASC`;

    const [rows] = await pool.query(query, params);
    const data = rows.map(formatDriver);

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงานขับรถ' });
  }
});

// GET /api/drivers/:id - Get driver by id
router.get('/:id', async (req, res) => {
  try {
    const driverId = Number(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ success: false, message: 'รหัสพนักงานขับรถไม่ถูกต้อง' });
    }

    const [rows] = await pool.query(
      `SELECT id, employee_code, full_name, phone, license_number, status, created_at, updated_at
       FROM drivers WHERE id = ?`,
      [driverId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลพนักงานขับรถ' });
    }

    res.json({ success: true, data: formatDriver(rows[0]) });
  } catch (error) {
    console.error('Error fetching driver by id:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงานขับรถ' });
  }
});

// POST /api/drivers - Create new driver
router.post('/', async (req, res) => {
  try {
    const {
      employee_code,
      code,
      full_name,
      name,
      phone,
      license_number,
      licenseNumber,
      status,
    } = req.body;

    const driverName = (full_name || name || '').trim();
    if (!driverName) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อ-นามสกุลพนักงานขับรถ' });
    }

    let driverCode = (employee_code || code || '').trim();
    if (!driverCode) {
      // Auto generate code if not provided: EMP-7xx
      const [countResult] = await pool.query('SELECT COUNT(*) as cnt FROM drivers');
      const count = countResult[0].cnt + 1;
      driverCode = `EMP-${700 + count}`;
    }

    // Check duplicate employee_code
    const [existingCode] = await pool.query('SELECT id FROM drivers WHERE employee_code = ?', [driverCode]);
    if (existingCode.length > 0) {
      return res.status(409).json({ success: false, message: `รหัสพนักงาน ${driverCode} มีอยู่ในระบบแล้ว` });
    }

    const driverPhone = phone ? phone.trim() : null;
    const license = (license_number || licenseNumber || '').trim() || null;

    if (license) {
      const [existingLic] = await pool.query('SELECT id FROM drivers WHERE license_number = ?', [license]);
      if (existingLic.length > 0) {
        return res.status(409).json({ success: false, message: `เลขที่ใบอนุญาต ${license} มีอยู่ในระบบแล้ว` });
      }
    }

    const dbStatus = normalizeStatusToDb(status);

    const [result] = await pool.query(
      `INSERT INTO drivers (employee_code, full_name, phone, license_number, status)
       VALUES (?, ?, ?, ?, ?)`,
      [driverCode, driverName, driverPhone, license, dbStatus]
    );

    const [newDriver] = await pool.query(
      `SELECT id, employee_code, full_name, phone, license_number, status, created_at, updated_at
       FROM drivers WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'เพิ่มข้อมูลพนักงานขับรถเรียบร้อยแล้ว',
      data: formatDriver(newDriver[0]),
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลพนักงานขับรถ' });
  }
});

// PUT /api/drivers/:id - Update driver by id
router.put('/:id', async (req, res) => {
  try {
    const driverId = Number(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ success: false, message: 'รหัสพนักงานขับรถไม่ถูกต้อง' });
    }

    const [existing] = await pool.query('SELECT * FROM drivers WHERE id = ?', [driverId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลพนักงานขับรถ' });
    }

    const current = existing[0];
    const {
      employee_code,
      code,
      full_name,
      name,
      phone,
      license_number,
      licenseNumber,
      status,
    } = req.body;

    const updatedCode = (employee_code || code !== undefined ? (employee_code || code).trim() : current.employee_code);
    const updatedName = (full_name || name !== undefined ? (full_name || name).trim() : current.full_name);
    const updatedPhone = (phone !== undefined ? (phone ? phone.trim() : null) : current.phone);
    const rawLicense = license_number !== undefined ? license_number : licenseNumber;
    const updatedLicense = rawLicense !== undefined ? (rawLicense ? rawLicense.trim() : null) : current.license_number;
    const updatedStatus = status ? normalizeStatusToDb(status) : current.status;

    // Check duplicate code if changed
    if (updatedCode !== current.employee_code) {
      const [dupCode] = await pool.query('SELECT id FROM drivers WHERE employee_code = ? AND id != ?', [updatedCode, driverId]);
      if (dupCode.length > 0) {
        return res.status(409).json({ success: false, message: `รหัสพนักงาน ${updatedCode} มีอยู่ในระบบแล้ว` });
      }
    }

    // Check duplicate license if changed
    if (updatedLicense && updatedLicense !== current.license_number) {
      const [dupLic] = await pool.query('SELECT id FROM drivers WHERE license_number = ? AND id != ?', [updatedLicense, driverId]);
      if (dupLic.length > 0) {
        return res.status(409).json({ success: false, message: `เลขที่ใบอนุญาต ${updatedLicense} มีอยู่ในระบบแล้ว` });
      }
    }

    await pool.query(
      `UPDATE drivers
       SET employee_code = ?, full_name = ?, phone = ?, license_number = ?, status = ?
       WHERE id = ?`,
      [updatedCode, updatedName, updatedPhone, updatedLicense, updatedStatus, driverId]
    );

    const [updated] = await pool.query(
      `SELECT id, employee_code, full_name, phone, license_number, status, created_at, updated_at
       FROM drivers WHERE id = ?`,
      [driverId]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลพนักงานขับรถเรียบร้อยแล้ว',
      data: formatDriver(updated[0]),
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลพนักงานขับรถ' });
  }
});

// DELETE /api/drivers/:id - Delete driver
router.delete('/:id', async (req, res) => {
  try {
    const driverId = Number(req.params.id);
    if (isNaN(driverId)) {
      return res.status(400).json({ success: false, message: 'รหัสพนักงานขับรถไม่ถูกต้อง' });
    }

    const [existing] = await pool.query('SELECT id FROM drivers WHERE id = ?', [driverId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลพนักงานขับรถ' });
    }

    // Check if assigned in delivery_tasks
    const [assignedTasks] = await pool.query(
      'SELECT id, task_code FROM delivery_tasks WHERE driver_id = ? AND status IN ("pending", "in_transit")',
      [driverId]
    );
    if (assignedTasks.length > 0) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถลบได้ เนื่องจากพนักงานขับรถมีงานจัดส่งที่อยู่ระหว่างดำเนินการ (${assignedTasks.length} งาน)`,
      });
    }

    await pool.query('DELETE FROM drivers WHERE id = ?', [driverId]);

    res.json({ success: true, message: 'ลบข้อมูลพนักงานขับรถเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูล (อาจมีการอ้างอิงในงานจัดส่ง)' });
  }
});

export default router;
