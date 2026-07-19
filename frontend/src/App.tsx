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
        path="/panel"
        element={
          <ProtectedRoute>
            <EmployeePanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/yonetici"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <ManagerPanel />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/panel" replace />} />
      <Route path="*" element={<Navigate to="/panel" replace />} />
    </Routes>
  );
}

export default App;
