import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { rentInsuranceAPI } from '../services/api';

export default function RentInsuranceQuote() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    coverage_amount: '30000',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    monthly_rent: '',
    property_type: 'apartment',
    property_address: '',
    lease_term_months: '12'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleGetQuote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await rentInsuranceAPI.getQuote({
        coverage_amount: parseInt(formData.coverage_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        monthly_rent: parseInt(formData.monthly_rent),
        property_type: formData.property_type
      });

      setQuote(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener la cotización');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    setLoading(true);
    setError('');

    try {
      await rentInsuranceAPI.createPolicy({
        ...formData,
        coverage_amount: parseInt(formData.coverage_amount),
        monthly_rent: parseInt(formData.monthly_rent),
        lease_term_months: parseInt(formData.lease_term_months)
      });

      setSuccess('¡Póliza creada exitosamente!');
      setTimeout(() => navigate('/policies'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la póliza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center">
          <Building className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Seguro de Renta</h1>
            <p className="text-green-100">Protege tu hogar y tranquilidad</p>
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

      {!quote ? (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de la Propiedad</h2>
          <form onSubmit={handleGetQuote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Propiedad</label>
                <select name="property_type" value={formData.property_type} onChange={handleChange} className="input-field" required>
                  <option value="apartment">Apartamento</option>
                  <option value="house">Casa</option>
                  <option value="studio">Estudio</option>
                  <option value="condo">Condominio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Renta Mensual</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" name="monthly_rent" value={formData.monthly_rent} onChange={handleChange} className="input-field pl-10" placeholder="1500" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cobertura</label>
                <select name="coverage_amount" value={formData.coverage_amount} onChange={handleChange} className="input-field" required>
                  <option value="20000">$20,000</option>
                  <option value="30000">$30,000</option>
                  <option value="50000">$50,000</option>
                  <option value="75000">$75,000</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración del Contrato (meses)</label>
                <input type="number" name="lease_term_months" min="1" max="60" value={formData.lease_term_months} onChange={handleChange} className="input-field" required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input type="text" name="property_address" value={formData.property_address} onChange={handleChange} className="input-field" placeholder="Calle 123, Lima" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin (Opcional)</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input-field" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? 'Calculando...' : 'Obtener Cotización'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tu Cotización</h2>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8 mb-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Prima Anual</p>
            <p className="text-5xl font-bold text-primary-600">
              ${quote.premium ? quote.premium.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : 'Consultar'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Cobertura de ${parseInt(formData.coverage_amount).toLocaleString('es-PE')}</p>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setQuote(null)} className="btn-secondary">Modificar</button>
            <button onClick={handleCreatePolicy} disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Creando...' : 'Crear Póliza'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
