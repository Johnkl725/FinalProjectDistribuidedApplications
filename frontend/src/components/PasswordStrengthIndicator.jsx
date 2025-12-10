import { Check, X } from 'lucide-react';
import {
    getPasswordStrength,
    getPasswordStrengthInfo,
    validatePassword
} from '../utils/FormValidation';

export default function PasswordStrengthIndicator({ password }) {
    if (!password) return null;

    const strength = getPasswordStrength(password);
    const { label, bgColor } = getPasswordStrengthInfo(strength);
    const errors = validatePassword(password);
    const requirements = [
        { text: 'Mínimo 8 caracteres', met: password.length >= 8 },
        { text: 'Una mayúscula', met: /[A-Z]/.test(password) },
        { text: 'Una minúscula', met: /[a-z]/.test(password) },
        { text: 'Un número', met: /\d/.test(password) },
    ];

    return (
        <div className="mt-2 space-y-2">
            {/* Barra de fortaleza */}
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">
                        Fortaleza de contraseña
                    </span>
                    <span className={`text-xs font-semibold ${strength < 40 ? 'text-red-600' :
                            strength < 70 ? 'text-yellow-600' :
                                'text-green-600'
                        }`}>
                        {label}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${bgColor}`}
                        style={{ width: `${strength}%` }}
                    />
                </div>
            </div>

            {/* Requisitos */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-xs font-medium text-gray-700 mb-2">Requisitos:</p>
                {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {req.met ? (
                            <Check className="h-4 w-4 text-green-600" />
                        ) : (
                            <X className="h-4 w-4 text-gray-400" />
                        )}
                        <span className={`text-xs ${req.met ? 'text-green-700 font-medium' : 'text-gray-600'
                            }`}>
                            {req.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
