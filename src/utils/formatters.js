export const formatPrixFCFA = (prix) => {
  if (typeof prix !== 'number') return '';
  return prix.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }) + ' FCFA';
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}; 