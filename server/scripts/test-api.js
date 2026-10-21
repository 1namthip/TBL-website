async function testApi() {
  const BASE_URL = 'http://localhost:3000/api';
  console.log('🧪 Starting API Verification Tests against', BASE_URL);

  let passed = 0;
  let failed = 0;

  async function check(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Health
  await check('GET /api/health', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status !== 200 || data.database !== 'connected') {
      throw new Error(`Expected status 200 & database connected, got ${res.status}: ${JSON.stringify(data)}`);
    }
  });

  // 2. Users
  let testUserId = null;
  await check('GET /api/users', async () => {
    const res = await fetch(`${BASE_URL}/users`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) {
      throw new Error('Invalid users response');
    }
    // Verify password_hash is not returned!
    const hasPassword = data.data.some((u) => u.password_hash || u.password);
    if (hasPassword) throw new Error('Security violation: password_hash was exposed in users response!');
  });

  await check('POST /api/users', async () => {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'ทดสอบ ผู้ใช้ใหม่',
        email: `test_${Date.now()}@tbl.com`,
        password: 'securePassword123',
        role: 'staff',
        phone: '089-999-8888',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data?.id) {
      throw new Error(`Failed to create user: ${data.message}`);
    }
    testUserId = data.data.id;
  });

  await check('PUT /api/users/:id', async () => {
    const res = await fetch(`${BASE_URL}/users/${testUserId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'ทดสอบ ผู้ใช้แก้ไข',
        phone: '081-111-2222',
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.data?.full_name !== 'ทดสอบ ผู้ใช้แก้ไข') {
      throw new Error(`Failed to update user: ${data.message}`);
    }
  });

  await check('DELETE /api/users/:id', async () => {
    const res = await fetch(`${BASE_URL}/users/${testUserId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Failed to delete user: ${data.message}`);
  });

  // 3. Drivers
  let testDriverId = null;
  await check('GET /api/drivers', async () => {
    const res = await fetch(`${BASE_URL}/drivers`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) throw new Error('Invalid drivers response');
  });

  await check('POST /api/drivers', async () => {
    const res = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'พนักงาน ทดสอบ',
        phone: '081-000-1111',
        licenseNumber: `บ.2-${Date.now().toString().slice(-6)}`,
        status: 'available',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data?.id) throw new Error(`Failed to create driver: ${data.message}`);
    testDriverId = data.data.id;
  });

  await check('PUT /api/drivers/:id', async () => {
    const res = await fetch(`${BASE_URL}/drivers/${testDriverId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'พนักงาน ทดสอบแก้ไข',
        status: 'on_delivery',
      }),
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Failed to update driver: ${data.message}`);
  });

  await check('DELETE /api/drivers/:id', async () => {
    const res = await fetch(`${BASE_URL}/drivers/${testDriverId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Failed to delete driver: ${data.message}`);
  });

  // 4. Vehicles
  let testVehicleId = null;
  await check('GET /api/vehicles', async () => {
    const res = await fetch(`${BASE_URL}/vehicles`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) throw new Error('Invalid vehicles response');
  });

  await check('POST /api/vehicles', async () => {
    const res = await fetch(`${BASE_URL}/vehicles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plateNumber: `79-${Date.now().toString().slice(-4)} กทม.`,
        type: 'รถ 4 ล้อตู้ทึบ',
        capacityKg: 3000,
        status: 'available',
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data?.id) throw new Error(`Failed to create vehicle: ${data.message}`);
    testVehicleId = data.data.id;
  });

  await check('PUT /api/vehicles/:id', async () => {
    const res = await fetch(`${BASE_URL}/vehicles/${testVehicleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        capacityKg: 3500,
        status: 'maintenance',
      }),
    });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Failed to update vehicle: ${data.message}`);
  });

  await check('DELETE /api/vehicles/:id', async () => {
    const res = await fetch(`${BASE_URL}/vehicles/${testVehicleId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Failed to delete vehicle: ${data.message}`);
  });

  // 5. Deliveries
  let testDeliveryId = null;
  await check('GET /api/deliveries', async () => {
    const res = await fetch(`${BASE_URL}/deliveries`);
    const data = await res.json();
    if (res.status !== 200 || !Array.isArray(data.data)) throw new Error('Invalid deliveries response');
  });

  await check('POST /api/deliveries (with foreign keys)', async () => {
    const res = await fetch(`${BASE_URL}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'บริษัท ทดสอบ การจัดส่ง จำกัด',
        contactPhone: '081-222-3333',
        destinationAddress: '123 ถ.สุขุมวิท อ.เมือง จ.สมุทรปราการ',
        itemDescription: 'พัสดุและเอกสารสำคัญ',
        weightKg: 50,
        status: 'pending',
        priority: 'express',
        assignedDriverId: 1, // foreign key check
        assignedVehicleId: 1, // foreign key check
      }),
    });
    const data = await res.json();
    if (res.status !== 201 || !data.data?.id) throw new Error(`Failed to create delivery: ${data.message}`);
    testDeliveryId = data.data.id;
  });

  await check('GET /api/deliveries/:id (with timeline)', async () => {
    const res = await fetch(`${BASE_URL}/deliveries/${testDeliveryId}`);
    const data = await res.json();
    if (res.status !== 200 || !data.data?.timeline || data.data.timeline.length === 0) {
      throw new Error(`Expected delivery with timeline, got: ${JSON.stringify(data)}`);
    }
  });

  await check('PUT /api/deliveries/:id (update status)', async () => {
    const res = await fetch(`${BASE_URL}/deliveries/${testDeliveryId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'in_transit',
        statusNote: 'คนขับรับสินค้าขึ้นรถแล้ว',
      }),
    });
    const data = await res.json();
    if (res.status !== 200 || data.data?.status !== 'in_transit') {
      throw new Error(`Failed to update delivery status: ${data.message}`);
    }
  });

  await check('DELETE /api/deliveries/:id', async () => {
    const res = await fetch(`${BASE_URL}/deliveries/${testDeliveryId}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.status !== 200) throw new Error(`Failed to delete delivery: ${data.message}`);
  });

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================`);

  if (failed > 0) process.exit(1);
  process.exit(0);
}

testApi();
