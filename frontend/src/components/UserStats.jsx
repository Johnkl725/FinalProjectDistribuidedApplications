import { useState, useEffect } from 'react';
import { lifeInsuranceAPI, vehicleInsuranceAPI, rentInsuranceAPI } from '../services/api';
import { TrendingUp, FileText, DollarSign, AlertCircle } from 'lucide-react';

export default function UserStats() {
  const [stats, setStats] = useState(null);
  const [policiesByType, setPoliciesByType] = useState({
    life: { total: 0, active: 0, premium: 0 },
    vehicle: { total: 0, active: 0, premium: 0 },
    rent: { total: 0, active: 0, premium: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Get overall stats from ONE service (all services return the same data)
      const statsRes = await lifeInsuranceAPI.getUserStats();
      setStats(statsRes.data.data);

      // Get policies by type to calculate breakdown
      const [lifePolicies, vehiclePolicies, rentPolicies] = await Promise.all([
        lifeInsuranceAPI.getCurrentPolicies().catch(() => ({ data: { data: [] } })),
        vehicleInsuranceAPI.getCurrentPolicies().catch(() => ({ data: { data: [] } })),
        rentInsuranceAPI.getCurrentPolicies().catch(() => ({ data: { data: [] } })),
      ]);

      const lifeData = lifePolicies.data.data || [];
      const vehicleData = vehiclePolicies.data.data || [];
      const rentData = rentPolicies.data.data || [];

      console.log('Life policies:', lifeData);
      console.log('Vehicle policies:', vehicleData);
      console.log('Rent policies:', rentData);

      setPoliciesByType({
        life: {
          total: lifeData.length,
          active: lifeData.filter(p => p.status === 'active').length,
          premium: lifeData.filter(p => p.status === 'active').reduce((sum, p) => sum + parseFloat(p.premium_amount || 0), 0),
        },
        vehicle: {
          total: vehicleData.length,
          active: vehicleData.filter(p => p.status === 'active').length,
          premium: vehicleData.filter(p => p.status === 'active').reduce((sum, p) => sum + parseFloat(p.premium_amount || 0), 0),
        },
        rent: {
          total: rentData.length,
          active: rentData.filter(p => p.status === 'active').length,
          premium: rentData.filter(p => p.status === 'active').reduce((sum, p) => sum + parseFloat(p.premium_amount || 0), 0),
        },
      });
    } catch (err) {
      console.error('Error loading stats:', err);
      setError('No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-center">
        <AlertCircle className="text-red-500 mr-3" size={20} />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  const totalPolicies = parseInt(stats?.total_policies || 0);
  const activePolicies = parseInt(stats?.active_policies || 0);
  const totalPremium = parseFloat(stats?.total_premium || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Policies */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium">Total de Pólizas</p>
            <p className="text-3xl font-bold mt-1">{totalPolicies}</p>
          </div>
          <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
            <FileText size={24} />
          </div>
        </div>
        <div className="text-blue-100 text-xs">
          Vida: {policiesByType.life.total} | Vehículo: {policiesByType.vehicle.total} | Hogar: {policiesByType.rent.total}
        </div>
      </div>

      {/* Active Policies */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm font-medium">Pólizas Activas</p>
            <p className="text-3xl font-bold mt-1">{activePolicies}</p>
          </div>
          <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="text-green-100 text-xs">
          Vida: {policiesByType.life.active} | Vehículo: {policiesByType.vehicle.active} | Hogar: {policiesByType.rent.active}
        </div>
      </div>

      {/* Total Premium */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-purple-100 text-sm font-medium">Prima Total</p>
            <p className="text-3xl font-bold mt-1">${totalPremium.toFixed(2)}</p>
          </div>
          <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="text-purple-100 text-xs">
          Vida: ${policiesByType.life.premium.toFixed(2)} | 
          Vehículo: ${policiesByType.vehicle.premium.toFixed(2)} | 
          Hogar: ${policiesByType.rent.premium.toFixed(2)}
        </div>
      </div>
    </div>
  );
}
