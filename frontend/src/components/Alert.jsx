import { AlertCircle, X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Reusable Alert Component
 * Follows Single Responsibility Principle - only handles alert display
 */
export default function Alert({ type = 'error', message, onClose, dismissible = true }) {
  if (!message) return null;

  const config = {
    error: {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-700',
      icon: AlertCircle,
      iconColor: 'text-red-500',
    },
    success: {
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-700',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-700',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
    },
    info: {
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-700',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const { bgColor, borderColor, textColor, icon: Icon, iconColor } = config[type];

  return (
    <div className={`mb-4 ${bgColor} border-l-4 ${borderColor} p-4 rounded`} role="alert">
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${iconColor} mr-3 flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <p className={`text-sm ${textColor} leading-relaxed`}>{message}</p>
        </div>
        {dismissible && onClose && (
          <button
            onClick={onClose}
            className={`ml-3 ${iconColor} hover:opacity-75 transition-opacity flex-shrink-0`}
            aria-label="Cerrar alerta"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
