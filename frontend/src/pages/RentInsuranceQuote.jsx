import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { rentInsuranceAPI } from '../services/api';
import { formatCurrency, coverageOptions } from '../utils/currency';

export default function RentInsuranceQuote() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState(() => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
  
    return {
      coverage_amount: '30000',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0], // un año después
      address: '',
      property_value: '',
      usage_type: 'residential',
      square_meters: ''
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
    let newData = { ...prev, [name]: value };

    // Si cambia fecha de inicio, recalcular fecha de fin +1 año
    if (name === 'start_date') {
      const start = new Date(value);
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      newData.end_date = end.toISOString().split('T')[0];
    }

    return newData;
  });
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
        property_value: parseInt(formData.property_value),
        usage_type: formData.usage_type
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
        coverage_amount: parseInt(formData.coverage_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        address: formData.address,
        property_value: parseInt(formData.property_value),
        usage_type: formData.usage_type,
        square_meters: parseInt(formData.square_meters)
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de la Propiedad</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field" placeholder="Calle 123, Lima" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor de la Propiedad</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="number" name="property_value" value={formData.property_value} onChange={handleChange} className="input-field pl-10" placeholder="150000" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metros Cuadrados</label>
                <input type="number" name="square_meters" value={formData.square_meters} onChange={handleChange} className="input-field" placeholder="80" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Uso</label>
                <select name="usage_type" value={formData.usage_type} onChange={handleChange} className="input-field" required>
                  <option value="residential">Residencial</option>
                  <option value="commercial">Comercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cobertura</label>
                <select name="coverage_amount" value={formData.coverage_amount} onChange={handleChange} className="input-field" required>
                  {coverageOptions.rent.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
                <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin</label>
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input-field bg-gray-100 cursor-not-allowed" readOnly />
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
              {quote.premium ? formatCurrency(quote.premium) : 'Consultar'}
            </p>
            <p className="text-sm text-gray-600 mt-2">Cobertura de {formatCurrency(formData.coverage_amount)}</p>
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
