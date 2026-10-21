import { createContext, useContext, useState, useEffect } from 'react';
import { usersApi } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 'USR-001',
  name: 'นันทวัฒน์ เกียรติเมธา',
  email: 'nantawat.k@tbl-logistics.com',
  role: 'Logistics Operations Manager',
  roleThai: 'ผู้จัดการฝ่ายปฏิบัติการและจัดส่ง',
  avatar: 'NK',
  branch: 'ศูนย์กระจายสินค้า บางนา กม.19',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('tbl_auth_user');
      return savedUser ? JSON.parse(savedUser) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedAuth = localStorage.getItem('tbl_is_auth');
      return savedAuth !== null ? JSON.parse(savedAuth) : true; // Default logged in for immediate convenience
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tbl_auth_user', JSON.stringify(user));
      localStorage.setItem('tbl_is_auth', JSON.stringify(isAuthenticated));
    } catch (e) {
      console.error('Error saving auth to localStorage', e);
    }
  }, [user, isAuthenticated]);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' };
    }

    try {
      // Try backend authentication
      const res = await usersApi.login({ email, password });
      if (res.success && res.data) {
        const u = res.data;
        const loggedInUser = {
          id: `USR-${String(u.id).padStart(3, '0')}`,
          dbId: u.id,
          name: u.full_name || u.name,
          email: u.email,
          role: u.role === 'manager' ? 'Logistics Operations Manager' : u.role === 'admin' ? 'System Administrator' : 'Operations Staff',
          roleThai: u.role === 'manager' ? 'ผู้จัดการฝ่ายปฏิบัติการและจัดส่ง' : u.role === 'admin' ? 'ผู้ดูแลระบบส่วนกลาง' : 'เจ้าหน้าที่ฝ่ายปฏิบัติการ',
          avatar: (u.full_name || u.email).slice(0, 2).toUpperCase(),
          branch: 'ศูนย์กระจายสินค้า บางนา กม.19',
        };
        setUser(loggedInUser);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend login attempt failed, falling back:', err.message);
    }

    // Fallback login
    const loggedInUser = {
      ...DEFAULT_USER,
      email: email,
      name: email.split('@')[0] || 'ผู้ใช้งานระบบ',
    };
    
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return { success: true };
  };

  const quickLogin = (presetRole = 'manager') => {
    if (presetRole === 'manager') {
      setUser({
        id: 'USR-001',
        name: 'นันทวัฒน์ เกียรติเมธา',
        email: 'manager@tbl-logistics.com',
        role: 'Operations Manager',
        roleThai: 'ผู้จัดการฝ่ายปฏิบัติการ',
        avatar: 'NK',
        branch: 'ศูนย์ควบคุมหลัก บางนา กม.19',
      });
    } else if (presetRole === 'dispatcher') {
      setUser({
        id: 'USR-002',
        name: 'ณิชาภัทร วงศ์เจริญ',
        email: 'dispatcher@tbl-logistics.com',
        role: 'Fleet Dispatcher',
        roleThai: 'เจ้าหน้าที่จ่ายงานและติดตามรถ',
        avatar: 'NW',
        branch: 'ศูนย์ควบคุมหลัก บางนา กม.19',
      });
    } else if (presetRole === 'driver') {
      setUser({
        id: 'USR-003',
        name: 'สมศักดิ์ ใจบริการ',
        email: 'driver@tbl-logistics.com',
        role: 'Lead Driver',
        roleThai: 'หัวหน้าพนักงานขับรถขนส่ง',
        avatar: 'SJ',
        branch: 'ศูนย์กระจายสินค้า ลาดกระบัง',
      });
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
