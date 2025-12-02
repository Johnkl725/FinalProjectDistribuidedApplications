import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';

export default function PendingPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingPolicies();
  }, []);

  const fetchPendingPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoints = [
        'http://localhost:3000/api/life-insurance/policies',
        'http://localhost:3000/api/vehicle-insurance/policies',
        'http://localhost:3000/api/rent-insurance/policies'
      ];

      const responses = await Promise.all(
        endpoints.map((url, index) =>
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => ({
              data: res.data.data.filter(p => p.status === 'issued'),
              type: ['Vida', 'Vehículo', 'Renta'][index],
              endpoint: url
            }))
            .catch(() => ({ data: [], type: '', endpoint: '' }))
        )
      );

      const pendingPolicies = responses.flatMap(r =>
        r.data.map(p => ({ ...p, type: r.type, endpoint: r.endpoint }))
      );

      setPolicies(pendingPolicies);
    } catch (err) {
      console.error('Error al cargar pólizas pendientes', err);
    } finally {
      setLoading(false);
    }
  };

  const approvePolicy = async (policy) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${policy.endpoint}/${policy.id}/activate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Póliza aprobada exitosamente');
      fetchPendingPolicies();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al aprobar póliza');
      setTimeout(() => setError(''), 3000);
    }
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
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center">
          <Clock className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Pólizas Pendientes de Aprobación</h1>
            <p className="text-orange-100">Revisar y aprobar nuevas pólizas</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="card">
        {policies.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No hay pólizas pendientes de aprobación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Número de Póliza
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Prima
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cobertura
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha Creación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map((policy) => (
                  <tr key={`${policy.type}-${policy.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.policy_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(policy.premium_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(policy.coverage_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(policy.created_at).toLocaleDateString('es-PE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => approvePolicy(policy)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aprobar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
