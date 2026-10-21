import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { LogisticsProvider } from './context/LogisticsContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { DeliveryTasks } from './pages/DeliveryTasks';
import { DeliveryDetails } from './pages/DeliveryDetails';
import { VehicleManagement } from './pages/VehicleManagement';
import { DriverManagement } from './pages/DriverManagement';
import { RoutePlanning } from './pages/RoutePlanning';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { ProfileSettings } from './pages/ProfileSettings';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <LogisticsProvider>
            <Routes>
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected App Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<DeliveryTasks />} />
                <Route path="tasks/:id" element={<DeliveryDetails />} />
                <Route path="vehicles" element={<VehicleManagement />} />
                <Route path="drivers" element={<DriverManagement />} />
                <Route path="routes" element={<RoutePlanning />} />
                <Route path="reports" element={<Reports />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<ProfileSettings />} />
              </Route>

              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LogisticsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
