import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, DollarSign, Calendar, User, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { lifeInsuranceAPI } from '../services/api';

export default function LifeInsuranceQuote() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    coverage_amount: '100000',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    age: '',
    medical_history: '',
    smoker: false,
    beneficiaries: [{ name: '', relationship: '', percentage: 100 }]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleBeneficiaryChange = (index, field, value) => {
    const newBeneficiaries = [...formData.beneficiaries];
    newBeneficiaries[index][field] = value;
    setFormData({
      ...formData,
      beneficiaries: newBeneficiaries
    });
  };

  const addBeneficiary = () => {
    setFormData({
      ...formData,
      beneficiaries: [...formData.beneficiaries, { name: '', relationship: '', percentage: 0 }]
    });
  };

  const removeBeneficiary = (index) => {
    const newBeneficiaries = formData.beneficiaries.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      beneficiaries: newBeneficiaries
    });
  };

  const handleGetQuote = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await lifeInsuranceAPI.getQuote({
        coverage_amount: parseInt(formData.coverage_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        age: parseInt(formData.age),
        smoker: formData.smoker
      });

      setQuote(response.data.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener la cotización');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await lifeInsuranceAPI.createPolicy({
        coverage_amount: parseInt(formData.coverage_amount),
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        age: parseInt(formData.age),
        medical_history: formData.medical_history,
        smoker: formData.smoker,
        beneficiaries: formData.beneficiaries
      });

      setSuccess('¡Póliza creada exitosamente!');
      setTimeout(() => {
        navigate('/policies');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear la póliza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center mb-4">
          <Heart className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Seguro de Vida</h1>
            <p className="text-red-100">Protege a quienes más amas</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className={`flex items-center ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Datos</span>
          </div>
          <div className={`w-16 sm:w-32 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Cotización</span>
          </div>
          <div className={`w-16 sm:w-32 h-1 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2 font-medium hidden sm:inline">Beneficiarios</span>
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

      {step === 1 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Información Básica</h2>
          <form onSubmit={handleGetQuote} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de Cobertura
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="coverage_amount"
                    value={formData.coverage_amount}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  >
                    <option value="50000">$50,000</option>
                    <option value="100000">$100,000</option>
                    <option value="250000">$250,000</option>
                    <option value="500000">$500,000</option>
                    <option value="1000000">$1,000,000</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tu Edad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="35"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="input-field pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="smoker"
                id="smoker"
                checked={formData.smoker}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="smoker" className="ml-2 block text-sm text-gray-700">
                Soy fumador
              </label>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Calculando...' : 'Obtener Cotización'}
              </button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && quote && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tu Cotización</h2>

          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8 mb-8">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Prima Anual</p>
              <p className="text-5xl font-bold text-primary-600">
                ${quote.premium.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Cobertura de ${parseInt(formData.coverage_amount).toLocaleString('es-PE')}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Detalles de la Cotización</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Edad:</p>
                <p className="font-medium">{formData.age} años</p>
              </div>
              <div>
                <p className="text-gray-600">Fumador:</p>
                <p className="font-medium">{formData.smoker ? 'Sí' : 'No'}</p>
              </div>
              <div>
                <p className="text-gray-600">Duración:</p>
                <p className="font-medium">{quote.details.duration_months} meses</p>
              </div>
              <div>
                <p className="text-gray-600">Prima Mensual:</p>
                <p className="font-medium">${(quote.premium / 12).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="btn-secondary"
            >
              Modificar
            </button>
            <button
              onClick={() => setStep(3)}
              className="btn-primary"
            >
              Continuar con Beneficiarios
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Beneficiarios</h2>

          <form onSubmit={handleCreatePolicy} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Historial Médico
              </label>
              <textarea
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                rows={4}
                className="input-field"
                placeholder="Describe tu historial médico (enfermedades previas, cirugías, medicamentos, etc.)"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lista de Beneficiarios</h3>
                <button
                  type="button"
                  onClick={addBeneficiary}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  + Agregar Beneficiario
                </button>
              </div>

              {formData.beneficiaries.map((beneficiary, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-700">Beneficiario {index + 1}</span>
                    {formData.beneficiaries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBeneficiary(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={beneficiary.name}
                        onChange={(e) => handleBeneficiaryChange(index, 'name', e.target.value)}
                        className="input-field"
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parentesco
                      </label>
                      <select
                        value={beneficiary.relationship}
                        onChange={(e) => handleBeneficiaryChange(index, 'relationship', e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="">Seleccionar</option>
                        <option value="spouse">Cónyuge</option>
                        <option value="child">Hijo/a</option>
                        <option value="parent">Padre/Madre</option>
                        <option value="sibling">Hermano/a</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={beneficiary.percentage}
                        onChange={(e) => handleBeneficiaryChange(index, 'percentage', parseInt(e.target.value))}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-sm text-gray-600 mt-2">
                Total: {formData.beneficiaries.reduce((sum, b) => sum + (parseInt(b.percentage) || 0), 0)}%
                {formData.beneficiaries.reduce((sum, b) => sum + (parseInt(b.percentage) || 0), 0) !== 100 && (
                  <span className="text-red-600 ml-2">(Debe sumar 100%)</span>
                )}
              </p>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary"
              >
                Regresar
              </button>
              <button
                type="submit"
                disabled={loading || formData.beneficiaries.reduce((sum, b) => sum + (parseInt(b.percentage) || 0), 0) !== 100}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creando Póliza...' : 'Crear Póliza'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
