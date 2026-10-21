// TBL Smart Logistics - Backend API Service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = result?.message || `HTTP ${response.status}: เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์`;
      throw new ApiError(errorMsg, response.status, result);
    }

    return result;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'ไม่สามารถเชื่อมต่อกับ Backend API ได้ กรุณาตรวจสอบว่า Node.js Express เซิร์ฟเวอร์กำลังทำงานที่พอร์ต 3000',
      0,
      null
    );
  }
}

// 1. Health API
export const healthApi = {
  check: () => request('/health'),
};

// 2. Users API
export const usersApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/users${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/users/${id}`),
  create: (data) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/users/${id}`, {
      method: 'DELETE',
    }),
  login: (credentials) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// 3. Drivers API
export const driversApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/drivers${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/drivers/${id}`),
  create: (data) =>
    request('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/drivers/${id}`, {
      method: 'DELETE',
    }),
};

// 4. Vehicles API
export const vehiclesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/vehicles${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/vehicles/${id}`),
  create: (data) =>
    request('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/vehicles/${id}`, {
      method: 'DELETE',
    }),
};

// 5. Deliveries API
export const deliveriesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/deliveries${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/deliveries/${id}`),
  create: (data) =>
    request('/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    request(`/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id) =>
    request(`/deliveries/${id}`, {
      method: 'DELETE',
    }),
};

export default {
  health: healthApi,
  users: usersApi,
  drivers: driversApi,
  vehicles: vehiclesApi,
  deliveries: deliveriesApi,
};
