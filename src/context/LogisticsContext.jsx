import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  initialVehicles,
  initialDrivers,
  initialDeliveryTasks,
  initialRoutes,
  initialNotifications,
  initialUserProfile,
  initialCompanySettings,
} from '../data/mockData';
import { healthApi, deliveriesApi, vehiclesApi, driversApi } from '../services/api';

const LogisticsContext = createContext(null);

const STORAGE_KEY = 'tbl_smart_logistics_data_v1';

export const LogisticsProvider = ({ children }) => {
  // Load state from localStorage or use initial mock data
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load logistics data from localStorage', e);
    }
    return {
      tasks: initialDeliveryTasks,
      vehicles: initialVehicles,
      drivers: initialDrivers,
      routes: initialRoutes,
      notifications: initialNotifications,
      userProfile: initialUserProfile,
      companySettings: initialCompanySettings,
    };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Sync to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save logistics data to localStorage', e);
    }
  }, [data]);

  // Fetch real data from Backend MySQL API
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      // 1. Health check
      const health = await healthApi.check();
      if (health.database === 'connected') {
        setIsBackendConnected(true);

        // 2. Fetch all collections in parallel
        const [tasksRes, vehiclesRes, driversRes] = await Promise.all([
          deliveriesApi.getAll(),
          vehiclesApi.getAll(),
          driversApi.getAll(),
        ]);

        setData((prev) => ({
          ...prev,
          tasks: Array.isArray(tasksRes?.data) ? tasksRes.data : prev.tasks,
          vehicles: Array.isArray(vehiclesRes?.data) ? vehiclesRes.data : prev.vehicles,
          drivers: Array.isArray(driversRes?.data) ? driversRes.data : prev.drivers,
        }));
      }
    } catch (err) {
      console.warn('Backend API connection warning (using local state fallback):', err.message);
      setIsBackendConnected(false);
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Tasks CRUD
  const addTask = async (taskInput) => {
    const now = new Date().toISOString();
    try {
      if (isBackendConnected) {
        const res = await deliveriesApi.create(taskInput);
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            tasks: [res.data, ...prev.tasks],
            notifications: [
              {
                id: `NOTIF-${Date.now()}`,
                type: 'info',
                title: 'เพิ่มงานจัดส่งใหม่',
                message: `สร้างงานจัดส่ง ${res.data.trackingNumber || res.data.task_code} ไปยัง ${res.data.destination} เรียบร้อยแล้ว`,
                timestamp: now,
                read: false,
                taskId: res.data.id,
              },
              ...prev.notifications,
            ],
          }));
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error creating task via API:', err);
      // If error, rethrow so caller toast can show error
      throw err;
    }

    // Local fallback
    const id = `TSK-${new Date().getFullYear()}-${String(data.tasks.length + 1).padStart(3, '0')}`;
    const trackingNumber = `TBL-${Math.floor(1000000 + Math.random() * 9000000)}`;

    const newTask = {
      id,
      trackingNumber,
      itemCount: 1,
      weightKg: 100,
      volumeCbm: 1.0,
      status: 'pending',
      priority: 'standard',
      createdAt: now,
      completedAt: null,
      costThb: 3500,
      timeline: [
        {
          status: 'สร้างคำสั่งจัดส่ง',
          description: 'บันทึกคำสั่งจัดส่งเข้าระบบเรียบร้อย',
          timestamp: now,
          actor: data.userProfile.name || 'เจ้าหน้าที่บันทึกข้อมูล',
        },
      ],
      ...taskInput,
    };

    setData((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    return newTask;
  };

  const updateTask = async (id, fields) => {
    const now = new Date().toISOString();
    try {
      if (isBackendConnected) {
        const res = await deliveriesApi.update(id, fields);
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === id || t.task_code === id ? { ...t, ...res.data } : t)),
          }));
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error updating task via API:', err);
      throw err;
    }

    // Local fallback
    setData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id === id || task.task_code === id) {
          const isNowCompleted = fields.status === 'completed' && task.status !== 'completed';
          const newTimeline = [...(task.timeline || [])];

          if (fields.status && fields.status !== task.status) {
            newTimeline.push({
              status:
                fields.status === 'completed'
                  ? 'จัดส่งสำเร็จ'
                  : fields.status === 'in_transit'
                  ? 'กำลังจัดส่ง'
                  : fields.status === 'delayed'
                  ? 'ล่าช้ากว่ากำหนด'
                  : fields.status === 'cancelled'
                  ? 'ยกเลิกรายการ'
                  : 'รอดำเนินการ',
              description: fields.statusNote || `อัปเดตสถานะเป็น ${fields.status}`,
              timestamp: now,
              actor: prev.userProfile.name || 'เจ้าหน้าที่',
            });
          }

          return {
            ...task,
            ...fields,
            timeline: newTimeline,
            completedAt: isNowCompleted ? now : task.completedAt,
          };
        }
        return task;
      });
      return { ...prev, tasks: updatedTasks };
    });
  };

  const deleteTask = async (id) => {
    try {
      if (isBackendConnected) {
        await deliveriesApi.delete(id);
      }
    } catch (err) {
      console.error('Error deleting task via API:', err);
      throw err;
    }

    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id && t.task_code !== id),
    }));
  };

  const updateTaskStatus = async (id, newStatus, note = '') => {
    return await updateTask(id, { status: newStatus, statusNote: note });
  };

  // Vehicles CRUD
  const addVehicle = async (vehicleInput) => {
    try {
      if (isBackendConnected) {
        const res = await vehiclesApi.create(vehicleInput);
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            vehicles: [...prev.vehicles, res.data],
          }));
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error creating vehicle via API:', err);
      throw err;
    }

    const id = `VH-${String(data.vehicles.length + 1).padStart(3, '0')}`;
    const newVehicle = {
      id,
      fuelType: 'ดีเซล (B7)',
      status: 'available',
      mileageKm: 0,
      fuelLevelPercent: 100,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      ...vehicleInput,
    };

    setData((prev) => ({
      ...prev,
      vehicles: [...prev.vehicles, newVehicle],
    }));
    return newVehicle;
  };

  const updateVehicle = async (id, fields) => {
    try {
      if (isBackendConnected) {
        const res = await vehiclesApi.update(id, fields);
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            vehicles: prev.vehicles.map((v) => (v.id === id ? { ...v, ...res.data } : v)),
          }));
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error updating vehicle via API:', err);
      throw err;
    }

    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.map((v) => (v.id === id ? { ...v, ...fields } : v)),
    }));
  };

  const deleteVehicle = async (id) => {
    try {
      if (isBackendConnected) {
        await vehiclesApi.delete(id);
      }
    } catch (err) {
      console.error('Error deleting vehicle via API:', err);
      throw err;
    }

    setData((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((v) => v.id !== id),
    }));
  };

  // Drivers CRUD
  const addDriver = async (driverInput) => {
    try {
      if (isBackendConnected) {
        const res = await driversApi.create(driverInput);
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            drivers: [...prev.drivers, res.data],
          }));
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error creating driver via API:', err);
      throw err;
    }

    const id = `DRV-${String(data.drivers.length + 1).padStart(3, '0')}`;
    const code = `EMP-${700 + data.drivers.length + 1}`;
    const newDriver = {
      id,
      code,
      rating: 5.0,
      totalTrips: 0,
      incidentCount: 0,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      ...driverInput,
    };

    setData((prev) => ({
      ...prev,
      drivers: [...prev.drivers, newDriver],
    }));
    return newDriver;
  };

  const updateDriver = async (id, fields) => {
    try {
      if (isBackendConnected) {
        const res = await driversApi.update(id, fields);
        if (res?.data) {
          setData((prev) => ({
            ...prev,
            drivers: prev.drivers.map((d) => (d.id === id ? { ...d, ...res.data } : d)),
          }));
          return res.data;
        }
      }
    } catch (err) {
      console.error('Error updating driver via API:', err);
      throw err;
    }

    setData((prev) => ({
      ...prev,
      drivers: prev.drivers.map((d) => (d.id === id ? { ...d, ...fields } : d)),
    }));
  };

  const deleteDriver = async (id) => {
    try {
      if (isBackendConnected) {
        await driversApi.delete(id);
      }
    } catch (err) {
      console.error('Error deleting driver via API:', err);
      throw err;
    }

    setData((prev) => ({
      ...prev,
      drivers: prev.drivers.filter((d) => d.id !== id),
    }));
  };

  // Routes CRUD
  const addRoute = (routeInput) => {
    const id = `RT-${String(data.routes.length + 1).padStart(3, '0')}`;
    const newRoute = {
      id,
      code: `ROUTE-NEW-${data.routes.length + 1}`,
      status: 'scheduled',
      fuelEstimateLiters: 50,
      cargoLoadPercent: 80,
      stops: [
        { name: routeInput.origin || 'ต้นทาง', eta: '08:00', type: 'origin', completed: false },
        { name: routeInput.destination || 'ปลายทาง', eta: '16:00', type: 'destination', completed: false },
      ],
      ...routeInput,
    };

    setData((prev) => ({
      ...prev,
      routes: [...prev.routes, newRoute],
    }));
    return newRoute;
  };

  const updateRoute = (id, fields) => {
    setData((prev) => ({
      ...prev,
      routes: prev.routes.map((r) => (r.id === id ? { ...r, ...fields } : r)),
    }));
  };

  const deleteRoute = (id) => {
    setData((prev) => ({
      ...prev,
      routes: prev.routes.filter((r) => r.id !== id),
    }));
  };

  // Notifications
  const markNotificationRead = (id) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const markAllNotificationsRead = () => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  // Profile & Settings
  const updateUserProfile = (fields) => {
    setData((prev) => ({
      ...prev,
      userProfile: { ...prev.userProfile, ...fields },
    }));
  };

  const updateCompanySettings = (fields) => {
    setData((prev) => ({
      ...prev,
      companySettings: { ...prev.companySettings, ...fields },
    }));
  };

  // Reset
  const resetToMockData = () => {
    const initial = {
      tasks: initialDeliveryTasks,
      vehicles: initialVehicles,
      drivers: initialDrivers,
      routes: initialRoutes,
      notifications: initialNotifications,
      userProfile: initialUserProfile,
      companySettings: initialCompanySettings,
    };
    setData(initial);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    } catch (e) {
      console.error(e);
    }
  };

  // Dynamic Metrics & Calculations
  const stats = useMemo(() => {
    const tasks = data.tasks || [];
    const vehicles = data.vehicles || [];
    const drivers = data.drivers || [];
    const notifications = data.notifications || [];

    const totalTasks = tasks.length;
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
    const inTransitTasks = tasks.filter((t) => t.status === 'in_transit').length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const delayedTasks = tasks.filter((t) => t.status === 'delayed').length;
    const cancelledTasks = tasks.filter((t) => t.status === 'cancelled').length;

    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter((v) => v.status === 'available').length;
    const inUseVehicles = vehicles.filter((v) => v.status === 'in_use' || v.status === 'unavailable').length;
    const maintenanceVehicles = vehicles.filter((v) => v.status === 'maintenance').length;

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.status === 'active' || d.status === 'available').length;
    const onDutyDrivers = drivers.filter((d) => d.status === 'on_duty' || d.status === 'on_delivery').length;
    const onLeaveDrivers = drivers.filter((d) => d.status === 'on_leave' || d.status === 'off_duty').length;

    const totalWeightKg = tasks.reduce((sum, t) => sum + (Number(t.weightKg || t.weight_kg) || 0), 0);
    const totalRevenueThb = tasks.reduce((sum, t) => sum + (Number(t.costThb) || 3500), 0);

    const nonCancelledCount = totalTasks - cancelledTasks;
    const onTimeRate =
      nonCancelledCount > 0
        ? Math.round(((totalTasks - delayedTasks - cancelledTasks) / (nonCancelledCount || 1)) * 100)
        : 100;

    const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

    return {
      totalTasks,
      pendingTasks,
      inTransitTasks,
      completedTasks,
      delayedTasks,
      cancelledTasks,
      totalVehicles,
      availableVehicles,
      inUseVehicles,
      maintenanceVehicles,
      totalDrivers,
      activeDrivers,
      onDutyDrivers,
      onLeaveDrivers,
      totalWeightKg,
      totalRevenueThb,
      onTimeRate,
      unreadNotificationsCount,
    };
  }, [data]);

  return (
    <LogisticsContext.Provider
      value={{
        tasks: data.tasks,
        vehicles: data.vehicles,
        drivers: data.drivers,
        routes: data.routes,
        notifications: data.notifications,
        userProfile: data.userProfile,
        companySettings: data.companySettings,
        stats,
        isLoading,
        isBackendConnected,
        apiError,
        refreshData,
        addTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addRoute,
        updateRoute,
        deleteRoute,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        updateCompanySettings,
        resetToMockData,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};
