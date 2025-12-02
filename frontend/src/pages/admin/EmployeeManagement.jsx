import { useState, useEffect } from 'react';
import { UserPlus, Users, Trash2, AlertCircle, CheckCircle, Edit, X } from 'lucide-react';
import axios from 'axios';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    department_id: '',
    phone: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmployees(response.data.data);
    } catch (err) {
      setError('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/auth/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.data);
    } catch (err) {
      console.error('Error al cargar departamentos');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      department_id: '',
      phone: ''
    });
    setEditingEmployee(null);
    setShowForm(false);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      email: employee.email,
      password: '',
      first_name: employee.first_name,
      last_name: employee.last_name,
      department_id: employee.department_id || '',
      phone: employee.phone || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (editingEmployee) {
        // Actualizar empleado
        const updateData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          department_id: formData.department_id || null,
          phone: formData.phone || null
        };

        await axios.put(
          `http://localhost:3000/api/auth/employees/${editingEmployee.id}`,
          updateData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Empleado actualizado exitosamente');
      } else {
        // Crear empleado
        await axios.post(
          'http://localhost:3000/api/auth/employees',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Empleado creado exitosamente');
      }

      resetForm();
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar empleado');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteEmployee = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Empleado eliminado exitosamente');
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar empleado');
      setTimeout(() => setError(''), 3000);
    }
  };

  const assignDepartment = async (employeeId, departmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:3000/api/auth/employees/${employeeId}/department`,
        { department_id: departmentId || null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Departamento asignado exitosamente');
      fetchEmployees();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error al asignar departamento');
      setTimeout(() => setError(''), 3000);
    }
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-12 w-12 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Gestión de Empleados</h1>
              <p className="text-blue-100">Administra el equipo de empleados y sus asignaciones</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-white text-blue-700 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center"
          >
            {showForm ? <X className="h-5 w-5 mr-2" /> : <UserPlus className="h-5 w-5 mr-2" />}
            {showForm ? 'Cancelar' : 'Nuevo Empleado'}
          </button>
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

      {showForm && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingEmployee ? 'Editar Empleado' : 'Crear Nuevo Empleado'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="+51 999 999 999"
                />
              </div>
              {!editingEmployee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingEmployee}
                    minLength="8"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="input-field"
                >
                  <option value="">Sin asignar</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingEmployee ? 'Actualizar Empleado' : 'Crear Empleado'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Lista de Empleados ({employees.length})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Departamento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No hay empleados registrados
                  </td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={employee.department_id || ''}
                        onChange={(e) => assignDepartment(employee.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="">Sin asignar</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
