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

          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
