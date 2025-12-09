import { useState, useEffect } from 'react';
import { BarChart3, Users, FileText, TrendingUp, Search, Heart, Car, Building } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';
import { lifeInsuranceAPI, vehicleInsuranceAPI, rentInsuranceAPI } from '../../services/api';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [policiesLoading, setPoliciesLoading] = useState(false);
  const [emailFilter, setEmailFilter] = useState('');
  const [activePolicies, setActivePolicies] = useState({
    life: [],
    vehicle: [],
    rent: []
  });

  useEffect(() => {
    fetchStats();
    fetchActivePolicies();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.stats, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.data);
    } catch (err) {
      console.error('Error al cargar estadísticas', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePolicies = async (email = '') => {
    try {
      setPoliciesLoading(true);
      const [lifeRes, vehicleRes, rentRes] = await Promise.all([
        lifeInsuranceAPI.getActivePoliciesSummary(email).catch(() => ({ data: { data: [] } })),
        vehicleInsuranceAPI.getActivePoliciesSummary(email).catch(() => ({ data: { data: [] } })),
        rentInsuranceAPI.getActivePoliciesSummary(email).catch(() => ({ data: { data: [] } })),
      ]);

      setActivePolicies({
        life: lifeRes.data.data || [],
        vehicle: vehicleRes.data.data || [],
        rent: rentRes.data.data || [],
      });
    } catch (err) {
      console.error('Error al cargar pólizas activas:', err);
    } finally {
      setPoliciesLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchActivePolicies(emailFilter);
  };

  const handleClearFilter = () => {
    setEmailFilter('');
    fetchActivePolicies('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center">
          <BarChart3 className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Estadísticas del Sistema</h1>
            <p className="text-purple-100">Panel de métricas y análisis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.customers || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Empleados</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.employees || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Administradores</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.admins || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Policies Summary Section */}
      <div className="mt-8">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Resumen de Pólizas Activas</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar por email..."
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Buscar
              </button>
              {emailFilter && (
                <button
                  type="button"
                  onClick={handleClearFilter}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Limpiar
                </button>
              )}
            </form>
          </div>

          {policiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Life Insurance */}
              {activePolicies.life.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Seguro de Vida ({activePolicies.life.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Póliza</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobertura</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activePolicies.life.map((policy, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{policy.first_name} {policy.last_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{policy.email}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{policy.policy_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(policy.premium_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(policy.coverage_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(policy.start_date).toLocaleDateString()} - {policy.end_date ? new Date(policy.end_date).toLocaleDateString() : 'Indefinido'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vehicle Insurance */}
              {activePolicies.vehicle.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <Car className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Seguro de Vehículo ({activePolicies.vehicle.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Póliza</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobertura</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activePolicies.vehicle.map((policy, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{policy.first_name} {policy.last_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{policy.email}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{policy.policy_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(policy.premium_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(policy.coverage_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(policy.start_date).toLocaleDateString()} - {policy.end_date ? new Date(policy.end_date).toLocaleDateString() : 'Indefinido'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Rent Insurance */}
              {activePolicies.rent.length > 0 && (
                <div>
                  <div className="flex items-center mb-3">
                    <Building className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Seguro de Renta ({activePolicies.rent.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Póliza</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prima</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cobertura</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activePolicies.rent.map((policy, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{policy.first_name} {policy.last_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{policy.email}</td>
                            <td className="px-4 py-3 text-sm font-mono text-gray-900">{policy.policy_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(policy.premium_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">${parseFloat(policy.coverage_amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(policy.start_date).toLocaleDateString()} - {policy.end_date ? new Date(policy.end_date).toLocaleDateString() : 'Indefinido'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No results message */}
              {activePolicies.life.length === 0 && activePolicies.vehicle.length === 0 && activePolicies.rent.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No se encontraron pólizas activas{emailFilter && ` para "${emailFilter}"`}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
