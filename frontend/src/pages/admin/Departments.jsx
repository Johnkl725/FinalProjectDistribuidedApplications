import { useState, useEffect } from 'react';
import { Briefcase, Users } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api.config';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_ENDPOINTS.departments}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDepartments(response.data.data);
    } catch (err) {
      console.error('Error al cargar departamentos');
    } finally {
      setLoading(false);
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
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white mb-8">
        <div className="flex items-center">
          <Briefcase className="h-12 w-12 mr-4" />
          <div>
            <h1 className="text-3xl font-bold">Departamentos</h1>
            <p className="text-purple-100">Vista general de departamentos y sus empleados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="card hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <Briefcase className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold text-purple-600">{dept.employee_count}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
            <p className="text-sm text-gray-600 mb-3">{dept.description}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span>{dept.employee_count} {dept.employee_count === 1 ? 'empleado' : 'empleados'}</span>
            </div>
          </div>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="card text-center py-12">
          <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No hay departamentos disponibles</p>
        </div>
      )}
    </div>
  );
}
