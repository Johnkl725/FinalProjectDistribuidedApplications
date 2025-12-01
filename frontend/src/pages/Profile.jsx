import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { authAPI } from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword({
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      });

      setMessage({ type: 'success', text: 'Contraseña actualizada exitosamente' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Error al cambiar la contraseña' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Perfil</h1>
        <p className="text-gray-600">Administra tu información personal</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button onClick={() => setActiveTab('info')} className={`px-6 py-4 font-medium transition-colors ${activeTab === 'info' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Información Personal
            </button>
            <button onClick={() => setActiveTab('security')} className={`px-6 py-4 font-medium transition-colors ${activeTab === 'security' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
              Seguridad
            </button>
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 pb-6 border-b">
                <div className="bg-primary-100 p-4 rounded-full">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.first_name} {user?.last_name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  {user?.role === 'admin' && (
                    <span className="inline-block mt-1 px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-100 rounded-full">
                      Administrador
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input type="text" value={user?.first_name || ''} readOnly className="input-field bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input type="text" value={user?.last_name || ''} readOnly className="input-field bg-gray-50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="email" value={user?.email || ''} readOnly className="input-field pl-10 bg-gray-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                  <input type="text" value={user?.role || ''} readOnly className="input-field bg-gray-50 capitalize" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Miembro desde</label>
                  <input type="text" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('es-PE') : ''} readOnly className="input-field bg-gray-50" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h3>

              {message.text && (
                <div className={`mb-6 border-l-4 p-4 rounded ${message.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                  <div className="flex items-center">
                    {message.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <p className={`text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="input-field pl-10" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="input-field pl-10" minLength="6" required />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field pl-10" required />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
