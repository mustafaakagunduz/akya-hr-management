import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployeePanel } from './pages/EmployeePanel';
import { CreateLeaveRequest } from './pages/CreateLeaveRequest';
import { ManagerPanel } from './pages/ManagerPanel';
import { LeaveHistory } from './pages/LeaveHistory';
import { Profile } from './pages/Profile';
import { Users } from './pages/Users';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { useAuth } from './context/AuthContext';

function DefaultRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user.role === 'MANAGER' ? '/leave-requests' : '/my-leaves'}
      replace
    />
  );
}

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
        path="/create-leave"
        element={
          <ProtectedRoute>
            <CreateLeaveRequest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
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
      <Route
        path="/leave-history"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <LeaveHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['MANAGER']}>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

export default App;
