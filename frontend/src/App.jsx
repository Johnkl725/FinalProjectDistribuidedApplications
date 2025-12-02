import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LifeInsuranceQuote from './pages/LifeInsuranceQuote';
import VehicleInsuranceQuote from './pages/VehicleInsuranceQuote';
import RentInsuranceQuote from './pages/RentInsuranceQuote';
import MyPolicies from './pages/MyPolicies';
import Profile from './pages/Profile';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import AdminStats from './pages/admin/AdminStats';

// Staff Pages
import AllPolicies from './pages/staff/AllPolicies';
import PendingPolicies from './pages/staff/PendingPolicies';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotes/life"
            element={
              <ProtectedRoute>
                <Layout>
                  <LifeInsuranceQuote />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotes/vehicle"
            element={
              <ProtectedRoute>
                <Layout>
                  <VehicleInsuranceQuote />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quotes/rent"
            element={
              <ProtectedRoute>
                <Layout>
                  <RentInsuranceQuote />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyPolicies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <Layout>
                  <UserManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeManagement />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute>
                <Layout>
                  <AdminStats />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <AllPolicies />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff/pending-policies"
            element={
              <ProtectedRoute>
                <Layout>
                  <PendingPolicies />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
