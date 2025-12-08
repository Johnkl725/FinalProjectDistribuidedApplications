import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import { claimsAPI } from '../../services/api';

export default function ClaimsManagement() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await claimsAPI.getAllClaims();
      setClaims(response.data.data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (claimId, newStatus) => {
    if (!window.confirm(`¿Estás seguro de cambiar el estado a "${getStatusText(newStatus)}"?`)) {
      return;
    }

    setUpdating(true);
    try {
      await claimsAPI.updateClaimStatus(claimId, newStatus);
      await loadClaims();
      setSelectedClaim(null);
    } catch (error) {
      alert(error.response?.data?.error || 'Error al actualizar el estado');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      submitted: 'bg-yellow-100 text-yellow-700',
      under_review: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      paid: 'bg-purple-100 text-purple-700',
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <FileText className="h-4 w-4" />;
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      submitted: 'Enviado',
      under_review: 'En Revisión',
      approved: 'Aprobado',
      rejected: 'Rechazado',
      paid: 'Pagado',
    };
    return texts[status] || status;
  };

  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case 'submitted':
        return [
          { value: 'under_review', label: 'Marcar en Revisión', color: 'bg-blue-600 hover:bg-blue-700' },
          { value: 'approved', label: 'Aprobar', color: 'bg-green-600 hover:bg-green-700' },
          { value: 'rejected', label: 'Rechazar', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'under_review':
        return [
          { value: 'approved', label: 'Aprobar', color: 'bg-green-600 hover:bg-green-700' },
          { value: 'rejected', label: 'Rechazar', color: 'bg-red-600 hover:bg-red-700' }
        ];
      case 'approved':
        return [
          { value: 'paid', label: 'Marcar como Pagado', color: 'bg-purple-600 hover:bg-purple-700' }
        ];
      default:
        return [];
    }
  };

  const filteredClaims = filter === 'all'
    ? claims
    : claims.filter(c => c.status === filter);

  const stats = {
    total: claims.length,
    submitted: claims.filter(c => c.status === 'submitted').length,
    under_review: claims.filter(c => c.status === 'under_review').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length,
    paid: claims.filter(c => c.status === 'paid').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reclamos</h1>
        <p className="text-gray-600">Administra y revisa todos los reclamos del sistema</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
          <p className="text-sm text-gray-600">Enviados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.under_review}</p>
          <p className="text-sm text-gray-600">En Revisión</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          <p className="text-sm text-gray-600">Aprobados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          <p className="text-sm text-gray-600">Rechazados</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.paid}</p>
          <p className="text-sm text-gray-600">Pagados</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('submitted')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'submitted' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Enviados ({stats.submitted})
        </button>
        <button
          onClick={() => setFilter('under_review')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'under_review' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          En Revisión ({stats.under_review})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'approved' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Aprobados ({stats.approved})
        </button>
      </div>

      {/* Lista de Reclamos */}
      {filteredClaims.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No hay reclamos {filter !== 'all' ? 'con este filtro' : ''}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => (
            <div key={claim.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">{claim.claim_number}</h3>
                      <p className="text-sm text-gray-500">Póliza: {claim.policy_number}</p>
                      {claim.user_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          Cliente: {claim.user_name} ({claim.user_email})
                        </p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(claim.status)}`}>
                      {getStatusIcon(claim.status)}
                      {getStatusText(claim.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600 flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        Monto
                      </span>
                      <p className="font-semibold text-gray-900">
                        ${parseFloat(claim.claim_amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Fecha del Reclamo
                      </span>
                      <p className="text-sm text-gray-900">
                        {new Date(claim.claim_date).toLocaleDateString('es-PE')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Tipo de Seguro</span>
                      <p className="text-sm text-gray-900">
                        {claim.insurance_type_name === 'life' ? 'Vida' :
                         claim.insurance_type_name === 'vehicle' ? 'Vehículo' :
                         claim.insurance_type_name === 'rent' ? 'Renta' : claim.insurance_type_name}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-1">Descripción:</p>
                    <p className="text-sm text-gray-900">{claim.description}</p>
                  </div>
                </div>

                <div className="ml-4 flex flex-col space-y-2">
                  {selectedClaim?.id === claim.id ? (
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2 min-w-[200px]">
                      <p className="text-xs font-medium text-gray-700 mb-2">Cambiar Estado:</p>
                      {getNextStatusOptions(claim.status).map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusUpdate(claim.id, option.value)}
                          disabled={updating}
                          className={`w-full px-3 py-2 text-xs font-medium text-white rounded-lg ${option.color} disabled:opacity-50`}
                        >
                          {option.label}
                        </button>
                      ))}
                      <button
                        onClick={() => setSelectedClaim(null)}
                        className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      disabled={getNextStatusOptions(claim.status).length === 0}
                      className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Eye className="h-4 w-4 inline mr-1" />
                      Gestionar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

