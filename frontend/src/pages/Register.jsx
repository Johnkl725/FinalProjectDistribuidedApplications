import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, AlertCircle } from 'lucide-react';
import Alert from '../components/Alert';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { validateField, validatePassword } from '../utils/FormValidation';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field if it has been touched
    if (touched[name]) {
      const fieldError = validateField(name, value, formData);
      setErrors({
        ...errors,
        [name]: fieldError,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });

    // Validate on blur
    const fieldError = validateField(name, value, formData);
    setErrors({
      ...errors,
      [name]: fieldError,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });

    // Additional password validation
    const passwordErrors = validatePassword(formData.password);
    if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join(', ');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setError('');
  };

  const isFormValid = () => {
    return Object.keys(errors).length === 0 &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.first_name &&
      formData.last_name;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-bold text-gray-900">
            Seguros Premium
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Crea tu cuenta y protege tu futuro
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl">
          <div className="mb-6">
            <h3 className="text-2xl font-semibold text-gray-900 text-center">
              Crear Cuenta
            </h3>
            <p className="mt-1 text-sm text-gray-500 text-center">
              Completa tus datos para registrarte
            </p>
          </div>

          <Alert
            type="error"
            message={error}
            onClose={handleCloseAlert}
            dismissible={true}
          />

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`input-field pl-10 ${errors.first_name && touched.first_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Juan"
                  />
                </div>
                {errors.first_name && touched.first_name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.first_name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field ${errors.last_name && touched.last_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Pérez"
                />
                {errors.last_name && touched.last_name && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.last_name}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field pl-10 ${errors.email && touched.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="tu@email.com"
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field pl-10 ${errors.password && touched.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
              <PasswordStrengthIndicator password={formData.password} />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input-field pl-10 ${errors.confirmPassword && touched.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Acepto los{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                  términos y condiciones
                </a>{' '}
                y la{' '}
                <a href="#" className="text-primary-600 hover:text-primary-500 font-medium">
                  política de privacidad
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  ¿Ya tienes una cuenta?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Inicia sesión aquí
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600">
          © 2024 Seguros Premium. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
