import { useState, useEffect } from 'react';
import { FileText, Eye } from 'lucide-react';
import axios from 'axios';
import { formatCurrency } from '../../utils/currency';

export default function AllPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllPolicies();
  }, []);

  const fetchAllPolicies = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoints = [
        'http://localhost:3000/api/life-insurance/policies',
        'http://localhost:3000/api/vehicle-insurance/policies',
        'http://localhost:3000/api/rent-insurance/policies'
      ];

      const responses = await Promise.all(
        endpoints.map(url =>
          axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
            .catch(() => ({ data: { data: [] } }))
        )
      );

      const allPolicies = [
        ...responses[0].data.data.map(p => ({ ...p, type: 'Vida' })),
        ...responses[1].data.data.map(p => ({ ...p, type: 'Vehículo' })),
        ...responses[2].data.data.map(p => ({ ...p, type: 'Renta' }))
      ];

      setPolicies(allPolicies);
    } catch (err) {
      console.error('Error al cargar pólizas', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const getStatusBadge = (status) => {
    const colors = {
      issued: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      issued: 'Emitida',
      active: 'Activa',
      cancelled: 'Cancelada'
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
        {labels[status]}
      </span>
    );
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
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center">
          <FileText className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Todas las Pólizas</h1>
            <p className="text-teal-100">Ver y gestionar todas las pólizas del sistema</p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">Todas</option>
            <option value="issued">Emitidas</option>
            <option value="active">Activas</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      <div className="card">
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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Prima
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cobertura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha de Inicio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pólizas
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.policy_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(policy.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(policy.premium_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(policy.coverage_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(policy.start_date).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
