import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MyLeaves } from './pages/MyLeaves';
import { CreateLeave } from './pages/CreateLeave';
import { LeaveRequests } from './pages/LeaveRequests';
import { LeaveHistory } from './pages/LeaveHistory';
import { Profile } from './pages/Profile';
import { Users } from './pages/Users';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { useAuth } from './context/AuthContext';
import { getDefaultRoute } from './utils/routing';

function DefaultRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate to={getDefaultRoute(user)} replace />
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
            <MyLeaves />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-leave"
        element={
          <ProtectedRoute>
            <CreateLeave />
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
            <LeaveRequests />
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
