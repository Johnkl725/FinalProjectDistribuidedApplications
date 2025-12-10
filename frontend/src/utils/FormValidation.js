// ===============================================
// FORM VALIDATION UTILITIES
// ===============================================

/**
 * Validate email format
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Password validation requirements
 */
export const PASSWORD_REQUIREMENTS = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false, // Optional for now
};

/**
 * Validate password and return specific errors
 */
export const validatePassword = (password) => {
    const errors = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
        errors.push(`Mínimo ${PASSWORD_REQUIREMENTS.minLength} caracteres`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Al menos una mayúscula');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Al menos una minúscula');
    }

    if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
        errors.push('Al menos un número');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Al menos un carácter especial');
    }

    return errors;
};

/**
 * Calculate password strength (0-100)
 */
export const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;

    return Math.min(strength, 100);
};

/**
 * Get password strength label and color
 */
export const getPasswordStrengthInfo = (strength) => {
    if (strength < 40) {
        return { label: 'Débil', color: 'red', bgColor: 'bg-red-500' };
    } else if (strength < 70) {
        return { label: 'Media', color: 'yellow', bgColor: 'bg-yellow-500' };
    } else {
        return { label: 'Fuerte', color: 'green', bgColor: 'bg-green-500' };
    }
};

/**
 * Validate form field
 */
export const validateField = (name, value, formData = {}) => {
    switch (name) {
        case 'email':
            if (!value) return 'El correo es requerido';
            if (!validateEmail(value)) return 'Formato de correo inválido';
            return '';

        case 'password':
            if (!value) return 'La contraseña es requerida';
            const errors = validatePassword(value);
            return errors.length > 0 ? errors[0] : '';

        case 'confirmPassword':
            if (!value) return 'Confirma tu contraseña';
            if (value !== formData.password) return 'Las contraseñas no coinciden';
            return '';

        case 'first_name':
        case 'last_name':
            if (!value) return 'Este campo es requerido';
            if (value.length < 2) return 'Mínimo 2 caracteres';
            return '';

        default:
            return '';
    }
};
