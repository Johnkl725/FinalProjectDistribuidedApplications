import { useState, useEffect } from 'react';
import { Heart, Car, Building, FileText, Calendar, DollarSign } from 'lucide-react';
import { lifeInsuranceAPI, vehicleInsuranceAPI, rentInsuranceAPI } from '../services/api';

export default function MyPolicies() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const [lifeRes, vehicleRes, rentRes] = await Promise.all([
        lifeInsuranceAPI.getMyPolicies(),
        vehicleInsuranceAPI.getMyPolicies(),
        rentInsuranceAPI.getMyPolicies()
      ]);

      const allPolicies = [
        ...(lifeRes.data.data || []).map(p => ({ ...p, type: 'life', icon: Heart, color: 'red' })),
        ...(vehicleRes.data.data || []).map(p => ({ ...p, type: 'vehicle', icon: Car, color: 'blue' })),
        ...(rentRes.data.data || []).map(p => ({ ...p, type: 'rent', icon: Building, color: 'green' }))
      ];

      setPolicies(allPolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = filter === 'all'
    ? policies
    : policies.filter(p => p.type === filter);

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      issued: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pólizas</h1>
        <p className="text-gray-600">Administra todas tus pólizas de seguro</p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          Todas ({policies.length})
        </button>
        <button onClick={() => setFilter('life')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'life' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          Vida ({policies.filter(p => p.type === 'life').length})
        </button>
        <button onClick={() => setFilter('vehicle')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'vehicle' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          Vehículo ({policies.filter(p => p.type === 'vehicle').length})
        </button>
        <button onClick={() => setFilter('rent')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'rent' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
          Renta ({policies.filter(p => p.type === 'rent').length})
        </button>
      </div>

      {/* Policies Grid */}
      {filteredPolicies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No tienes pólizas todavía</p>
          <p className="text-gray-500 mt-2">¡Cotiza y contrata tu primer seguro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPolicies.map((policy) => (
            <div key={policy.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`bg-${policy.color}-100 p-3 rounded-lg mr-4`}>
                    <policy.icon className={`h-6 w-6 text-${policy.color}-600`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{policy.policy_number}</h3>
                    <p className="text-sm text-gray-500 capitalize">{policy.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(policy.status)}`}>
                  {policy.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Cobertura
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(policy.coverage_amount).toLocaleString('es-PE')}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Prima Anual
                  </span>
                  <span className="font-semibold text-primary-600">
                    ${parseFloat(policy.premium_amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Inicio
                  </span>
                  <span className="text-sm text-gray-900">
                    {new Date(policy.start_date).toLocaleDateString('es-PE')}
                  </span>
                </div>
              </div>

              {/* Policy Details */}
              {policy.life_details && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Beneficiarios: {policy.life_details.beneficiaries?.length || 0}</p>
                </div>
              )}

              {policy.vehicle_details && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    {policy.vehicle_details.vehicle_brand} {policy.vehicle_details.vehicle_model} ({policy.vehicle_details.vehicle_year})
                  </p>
                </div>
              )}

              {policy.rent_details && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    {policy.rent_details.property_type} - ${policy.rent_details.monthly_rent}/mes
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
