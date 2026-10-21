import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const router = Router();

// GET /api/users - List users with optional search and filters
router.get('/', async (req, res) => {
  try {
    const { search, role, is_active } = req.query;
    let query = `
      SELECT id, full_name, email, role, phone, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (role && ['admin', 'staff', 'manager'].includes(role)) {
      query += ` AND role = ?`;
      params.push(role);
    }

    if (is_active !== undefined) {
      query += ` AND is_active = ?`;
      params.push(is_active === 'true' || is_active === '1' ? 1 : 0);
    }

    query += ` ORDER BY id DESC`;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});

// GET /api/users/:id - Get single user by id
router.get('/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง' });
    }

    const [rows] = await pool.query(
      `SELECT id, full_name, email, role, phone, is_active, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error('Error fetching user by id:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { full_name, email, password, role = 'staff', phone = null, is_active = 1 } = req.body;

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกชื่อ-นามสกุล' });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลที่ถูกต้อง' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
    }

    const validRoles = ['admin', 'staff', 'manager'];
    const safeRole = validRoles.includes(role) ? role : 'staff';

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้วในระบบ' });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), email.trim(), password_hash, safeRole, phone ? phone.trim() : null, is_active ? 1 : 0]
    );

    const [newUser] = await pool.query(
      `SELECT id, full_name, email, role, phone, is_active, created_at, updated_at
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'สร้างผู้ใช้ใหม่เรียบร้อยแล้ว',
      data: newUser[0],
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้' });
  }
});

// PUT /api/users/:id - Update user by id
router.put('/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง' });
    }

    const [existing] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' });
    }

    const currentUser = existing[0];
    const { full_name, email, password, role, phone, is_active } = req.body;

    const updatedName = full_name !== undefined ? full_name.trim() : currentUser.full_name;
    const updatedEmail = email !== undefined ? email.trim() : currentUser.email;
    const validRoles = ['admin', 'staff', 'manager'];
    const updatedRole = role && validRoles.includes(role) ? role : currentUser.role;
    const updatedPhone = phone !== undefined ? (phone ? phone.trim() : null) : currentUser.phone;
    const updatedIsActive = is_active !== undefined ? (is_active ? 1 : 0) : currentUser.is_active;

    // Check duplicate email if email changed
    if (updatedEmail !== currentUser.email) {
      const [duplicate] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [updatedEmail, userId]);
      if (duplicate.length > 0) {
        return res.status(409).json({ success: false, message: 'อีเมลนี้ถูกใช้งานโดยผู้ใช้อื่นแล้ว' });
      }
    }

    let passwordHash = currentUser.password_hash;
    if (password && password.trim().length >= 6) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await pool.query(
      `UPDATE users
       SET full_name = ?, email = ?, password_hash = ?, role = ?, phone = ?, is_active = ?
       WHERE id = ?`,
      [updatedName, updatedEmail, passwordHash, updatedRole, updatedPhone, updatedIsActive, userId]
    );

    const [updatedUser] = await pool.query(
      `SELECT id, full_name, email, role, phone, is_active, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลผู้ใช้เรียบร้อยแล้ว',
      data: updatedUser[0],
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้' });
  }
});

// DELETE /api/users/:id - Delete user by id
router.delete('/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'รหัสผู้ใช้ไม่ถูกต้อง' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ success: true, message: 'ลบข้อมูลผู้ใช้เรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการลบข้อมูลผู้ใช้ (อาจมีข้อมูลอ้างอิงอยู่)' });
  }
});

// POST /api/users/login - User authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'บัญชีนี้ถูกปิดการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const userProfile = {
      id: user.id,
      full_name: user.full_name,
      name: user.full_name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      is_active: user.is_active,
    };

    res.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ', data: userProfile });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  }
});

export default router;
