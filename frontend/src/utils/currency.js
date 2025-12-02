/**
 * Formatea un número como moneda peruana (Soles)
 * @param {number} amount - Monto a formatear
 * @returns {string} - Monto formateado como "S/ 1,234.56"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'S/ 0.00';
  }

  return `S/ ${Number(amount).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Opciones de cobertura en Soles
 */
export const coverageOptions = {
  life: [
    { value: 50000, label: 'S/ 50,000' },
    { value: 100000, label: 'S/ 100,000' },
    { value: 150000, label: 'S/ 150,000' },
    { value: 200000, label: 'S/ 200,000' },
    { value: 300000, label: 'S/ 300,000' }
  ],
  vehicle: [
    { value: 25000, label: 'S/ 25,000' },
    { value: 50000, label: 'S/ 50,000' },
    { value: 75000, label: 'S/ 75,000' },
    { value: 100000, label: 'S/ 100,000' },
    { value: 150000, label: 'S/ 150,000' }
  ],
  rent: [
    { value: 20000, label: 'S/ 20,000' },
    { value: 30000, label: 'S/ 30,000' },
    { value: 50000, label: 'S/ 50,000' },
    { value: 75000, label: 'S/ 75,000' },
    { value: 100000, label: 'S/ 100,000' }
  ]
};
