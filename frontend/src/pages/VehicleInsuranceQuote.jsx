import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, DollarSign, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { vehicleInsuranceAPI } from '../services/api';
import { formatCurrency, coverageOptions } from '../utils/currency';

export default function VehicleInsuranceQuote() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    coverage_amount: '50000',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    year: new Date().getFullYear(),
    make: '',
    model: '',
    vin: '',
    license_plate: ''
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
      const response = await vehicleInsuranceAPI.getQuote({
        coverage_amount: parseInt(formData.coverage_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        year: parseInt(formData.year)
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
      await vehicleInsuranceAPI.createPolicy({
        coverage_amount: parseInt(formData.coverage_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        vin: formData.vin,
        license_plate: formData.license_plate
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center">
          <Car className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Seguro de Vehículo</h1>
            <p className="text-blue-100">Protege tu inversión sobre ruedas</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Vehículo</h2>
          <form onSubmit={handleGetQuote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <input type="text" name="make" value={formData.make} onChange={handleChange} className="input-field" placeholder="Toyota" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} className="input-field" placeholder="Corolla" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                <input type="number" name="year" min="1900" max={new Date().getFullYear() + 1} value={formData.year} onChange={handleChange} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VIN (17 caracteres)</label>
                <input type="text" name="vin" value={formData.vin} onChange={handleChange} className="input-field" placeholder="1HGBH41JXMN109186" minLength="17" maxLength="17" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Placa</label>
                <input type="text" name="license_plate" value={formData.license_plate} onChange={handleChange} className="input-field" placeholder="ABC-123" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cobertura</label>
                <select name="coverage_amount" value={formData.coverage_amount} onChange={handleChange} className="input-field" required>
                  {coverageOptions.vehicle.map(option => (
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
                <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className="input-field" required />
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
            <p className="text-5xl font-bold text-primary-600">{formatCurrency(quote.premium)}</p>
            <p className="text-sm text-gray-600 mt-2">Cobertura de {formatCurrency(formData.coverage_amount)}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detalles del Vehículo</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-600">Marca:</p><p className="font-medium">{formData.make}</p></div>
              <div><p className="text-gray-600">Modelo:</p><p className="font-medium">{formData.model}</p></div>
              <div><p className="text-gray-600">Año:</p><p className="font-medium">{formData.year}</p></div>
              <div><p className="text-gray-600">VIN:</p><p className="font-medium">{formData.vin}</p></div>
              <div><p className="text-gray-600">Placa:</p><p className="font-medium">{formData.license_plate}</p></div>
            </div>
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
