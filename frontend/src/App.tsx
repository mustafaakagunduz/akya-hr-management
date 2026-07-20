import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployeePanel } from './pages/EmployeePanel';
import { ManagerPanel } from './pages/ManagerPanel';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/my-leaves"
        element={
          <ProtectedRoute>
            <EmployeePanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-requests"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerPanel />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/my-leaves" replace />} />
      <Route path="*" element={<Navigate to="/my-leaves" replace />} />
    </Routes>
  );
}

export default App;
