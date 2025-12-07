import { useState, useEffect } from 'react';
import { FileText, Calendar, DollarSign, AlertCircle, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { claimsAPI } from '../services/api';

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      const response = await claimsAPI.getMyClaims();
      setClaims(response.data.data || []);
    } catch (error) {
      console.error('Error loading claims:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Reclamos</h1>
          <p className="text-gray-600">Gestiona todos tus reclamos de seguros</p>
        </div>
        <a
          href="/claims/create"
          className="btn-primary flex items-center"
        >
          <FileText className="h-4 w-4 mr-2" />
          Nuevo Reclamo
        </a>
      </div>

      {claims.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-600">No tienes reclamos registrados</p>
          <p className="text-gray-500 mt-2">Los reclamos aparecerán aquí cuando los crees</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="card hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{claim.claim_number}</h3>
                  <p className="text-sm text-gray-500">Póliza: {claim.policy_number}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(claim.status)}`}>
                  {getStatusIcon(claim.status)}
                  {getStatusText(claim.status)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Monto
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${parseFloat(claim.claim_amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Fecha del Reclamo
                  </span>
                  <span className="text-sm text-gray-900">
                    {new Date(claim.claim_date).toLocaleDateString('es-PE')}
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">Descripción:</p>
                  <p className="text-sm text-gray-900">{claim.description}</p>
                </div>

                {claim.insurance_type_name && (
                  <div className="pt-2">
                    <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded">
                      {claim.insurance_type_name === 'life' ? 'Vida' : 
                       claim.insurance_type_name === 'vehicle' ? 'Vehículo' : 
                       claim.insurance_type_name === 'rent' ? 'Renta' : claim.insurance_type_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

