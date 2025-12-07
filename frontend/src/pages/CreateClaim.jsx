import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, DollarSign, Calendar, FileText, CheckCircle, XCircle } from 'lucide-react';
import { claimsAPI, lifeInsuranceAPI, vehicleInsuranceAPI, rentInsuranceAPI } from '../services/api';

export default function CreateClaim() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  const policyIdFromUrl = searchParams.get('policyId');

  const [formData, setFormData] = useState({
    policy_id: policyIdFromUrl || '',
    claim_date: new Date().toISOString().split('T')[0],
    claim_amount: '',
    description: ''
  });

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
        ...(lifeRes.data.data || []).map(p => ({ ...p, type: 'life' })),
        ...(vehicleRes.data.data || []).map(p => ({ ...p, type: 'vehicle' })),
        ...(rentRes.data.data || []).map(p => ({ ...p, type: 'rent' }))
      ].filter(p => p.status === 'issued' || p.status === 'active'); // Solo pólizas emitidas o activas

      setPolicies(allPolicies);
    } catch (error) {
      console.error('Error loading policies:', error);
      setError('Error al cargar las pólizas');
    } finally {
      setLoadingPolicies(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validaciones
      if (!formData.policy_id) {
        throw new Error('Debes seleccionar una póliza');
      }
      if (!formData.claim_amount || parseFloat(formData.claim_amount) <= 0) {
        throw new Error('El monto del reclamo debe ser mayor a 0');
      }
      if (!formData.description || formData.description.trim().length === 0) {
        throw new Error('La descripción es obligatoria');
      }
      if (!formData.claim_date) {
        throw new Error('La fecha del reclamo es obligatoria');
      }

      const claimData = {
        policy_id: parseInt(formData.policy_id),
        claim_date: formData.claim_date,
        claim_amount: parseFloat(formData.claim_amount),
        description: formData.description.trim()
      };

      const response = await claimsAPI.createClaim(claimData);

      setSuccess('Reclamo creado exitosamente');
      
      // Limpiar formulario
      setFormData({
        policy_id: '',
        claim_date: new Date().toISOString().split('T')[0],
        claim_amount: '',
        description: ''
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/claims');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al crear el reclamo');
    } finally {
      setLoading(false);
    }
  };

  const selectedPolicy = policies.find(p => p.id === parseInt(formData.policy_id));

  if (loadingPolicies) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nuevo Reclamo</h1>
        <p className="text-gray-600">Crea un nuevo reclamo para una de tus pólizas activas</p>
      </div>

      {policies.length === 0 ? (
        <div className="card text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600 mb-2">No tienes pólizas activas</p>
          <p className="text-gray-500 mb-6">Necesitas tener al menos una póliza activa para crear un reclamo</p>
          <button
            onClick={() => navigate('/policies')}
            className="btn-primary"
          >
            Ver Mis Pólizas
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <XCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>{success}</span>
            </div>
          )}

          {/* Seleccionar Póliza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Póliza *
            </label>
            <select
              name="policy_id"
              value={formData.policy_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">-- Selecciona una póliza --</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policy_number} - {policy.type === 'life' ? 'Vida' : policy.type === 'vehicle' ? 'Vehículo' : 'Renta'} - 
                  Cobertura: ${parseFloat(policy.coverage_amount).toLocaleString('es-PE')}
                </option>
              ))}
            </select>
            {selectedPolicy && (
              <div className="mt-2 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Póliza seleccionada:</span> {selectedPolicy.policy_number}
                </p>
                <p className="text-sm text-gray-600">
                  Cobertura total: ${parseFloat(selectedPolicy.coverage_amount).toLocaleString('es-PE')}
                </p>
              </div>
            )}
          </div>

          {/* Fecha del Reclamo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha del Reclamo *
            </label>
            <input
              type="date"
              name="claim_date"
              value={formData.claim_date}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Monto del Reclamo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Monto del Reclamo *
            </label>
            <input
              type="number"
              name="claim_amount"
              value={formData.claim_amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {selectedPolicy && formData.claim_amount && (
              <p className="mt-2 text-sm text-gray-600">
                {parseFloat(formData.claim_amount) > parseFloat(selectedPolicy.coverage_amount) ? (
                  <span className="text-red-600">
                    ⚠️ El monto excede la cobertura de la póliza (${parseFloat(selectedPolicy.coverage_amount).toLocaleString('es-PE')})
                  </span>
                ) : (
                  <span className="text-green-600">
                    ✓ Dentro del límite de cobertura
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="inline h-4 w-4 mr-1" />
              Descripción del Reclamo *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              placeholder="Describe detalladamente el incidente o motivo del reclamo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length} caracteres
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/claims')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Reclamo'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

