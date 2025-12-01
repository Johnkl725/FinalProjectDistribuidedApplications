import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart,
  Car,
  Building,
  TrendingUp,
  Shield,
  FileText,
  ArrowRight,
  Calendar,
  DollarSign
} from 'lucide-react';
import { lifeInsuranceAPI, vehicleInsuranceAPI, rentInsuranceAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState({
    life: [],
    vehicle: [],
    rent: []
  });
  const [loading, setLoading] = useState(true);

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

      setPolicies({
        life: lifeRes.data.data || [],
        vehicle: vehicleRes.data.data || [],
        rent: rentRes.data.data || []
      });
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPolicies = policies.life.length + policies.vehicle.length + policies.rent.length;
  const activePolicies = [
    ...policies.life,
    ...policies.vehicle,
    ...policies.rent
  ].filter(p => p.status === 'active' || p.status === 'issued').length;

  const totalPremiums = [
    ...policies.life,
    ...policies.vehicle,
    ...policies.rent
  ].reduce((sum, p) => sum + parseFloat(p.premium_amount || 0), 0);

  const insuranceTypes = [
    {
      name: 'Seguro de Vida',
      icon: Heart,
      color: 'bg-red-500',
      description: 'Protege a tu familia',
      link: '/quotes/life',
      count: policies.life.length
    },
    {
      name: 'Seguro de Vehículo',
      icon: Car,
      color: 'bg-blue-500',
      description: 'Cubre tu automóvil',
      link: '/quotes/vehicle',
      count: policies.vehicle.length
    },
    {
      name: 'Seguro de Renta',
      icon: Building,
      color: 'bg-green-500',
      description: 'Asegura tu hogar',
      link: '/quotes/rent',
      count: policies.rent.length
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.first_name}! 👋
        </h1>
        <p className="text-primary-100">
          Administra tus seguros y cotiza nuevas pólizas
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pólizas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPolicies}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link to="/policies" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center">
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pólizas Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{activePolicies}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Protegido</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Primas Totales</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalPremiums.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Anuales
          </div>
        </div>
      </div>

      {/* Insurance Types */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cotiza un Nuevo Seguro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {insuranceTypes.map((type) => (
            <Link
              key={type.name}
              to={type.link}
              className="insurance-card hover:scale-105"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${type.color} p-3 rounded-lg`}>
                  <type.icon className="h-8 w-8 text-white" />
                </div>
                {type.count > 0 && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                    {type.count} activa{type.count > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{type.name}</h3>
              <p className="text-gray-600 mb-4">{type.description}</p>
              <div className="flex items-center text-primary-600 font-medium">
                Cotizar ahora
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Policies */}
      {totalPolicies > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pólizas Recientes</h2>
            <Link to="/policies" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              Ver todas
            </Link>
          </div>

          <div className="space-y-4">
            {[...policies.life, ...policies.vehicle, ...policies.rent]
              .slice(0, 3)
              .map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      {policy.insurance_type_name === 'life' && <Heart className="h-5 w-5 text-red-600" />}
                      {policy.insurance_type_name === 'vehicle' && <Car className="h-5 w-5 text-blue-600" />}
                      {policy.insurance_type_name === 'rent' && <Building className="h-5 w-5 text-green-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{policy.policy_number}</p>
                      <p className="text-sm text-gray-500">
                        Cobertura: ${parseFloat(policy.coverage_amount).toLocaleString('es-PE')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      policy.status === 'active' || policy.status === 'issued'
                        ? 'bg-green-100 text-green-700'
                        : policy.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {policy.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      ${parseFloat(policy.premium_amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}/año
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
