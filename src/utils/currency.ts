
export const formatCurrency = (amount: number, currency: 'USD' | 'EUR' | 'CAD') => {
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    CAD: 'C$'
  };

  const locales = {
    USD: 'en-US',
    EUR: 'fr-FR',
    CAD: 'en-CA'
  };

  return new Intl.NumberFormat(locales[currency], {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
