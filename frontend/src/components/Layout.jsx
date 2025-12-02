import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Home,
  FileText,
  Calculator,
  User,
  LogOut,
  Menu,
  X,
  Heart,
  Car,
  Building,
  Users,
  BarChart3,
  Clock
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAdmin, isEmployee, isStaff } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
  ];

  // Opciones para usuarios comunes
  if (!isStaff) {
    navigation.push(
      {
        name: 'Cotizar Seguros',
        icon: Calculator,
        submenu: [
          { name: 'Seguro de Vida', href: '/quotes/life', icon: Heart },
          { name: 'Seguro de Vehículo', href: '/quotes/vehicle', icon: Car },
          { name: 'Seguro de Renta', href: '/quotes/rent', icon: Building },
        ]
      },
      { name: 'Mis Pólizas', href: '/policies', icon: FileText }
    );
  }

  // Opciones para empleados y admins
  if (isStaff) {
    navigation.push(
      { name: 'Todas las Pólizas', href: '/staff/policies', icon: FileText },
      { name: 'Pólizas Pendientes', href: '/staff/pending-policies', icon: Clock }
    );
  }

  // Opciones solo para admins
  if (isAdmin) {
    navigation.push(
      { name: 'Gestión de Usuarios', href: '/admin/users', icon: Users },
      { name: 'Gestión de Empleados', href: '/admin/employees', icon: Users },
      { name: 'Departamentos', href: '/admin/departments', icon: Building },
      { name: 'Estadísticas', href: '/admin/stats', icon: BarChart3 }
    );
  }

  // Perfil disponible para todos
  navigation.push({ name: 'Mi Perfil', href: '/profile', icon: User });

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex items-center ml-4 lg:ml-0">
                <Shield className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Seguros Premium</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                    Admin
                  </span>
                )}
                {isEmployee && (
                  <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                    Empleado
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out mt-16 lg:mt-0`}
        >
          <nav className="mt-5 px-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                {item.submenu ? (
                  <div>
                    <div className="flex items-center px-4 py-3 text-sm font-medium text-gray-700">
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </div>
                    <div className="ml-8 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.name}
                          to={subitem.href}
                          className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                            isActive(subitem.href)
                              ? 'bg-primary-50 text-primary-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <subitem.icon className="mr-3 h-4 w-4" />
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
