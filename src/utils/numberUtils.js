/**
 * Abbreviates a number in Indian numbering system (K, L, Cr)
 * @param {number} num - The number to abbreviate
 * @returns {string} - Abbreviated string
 */
export const abbreviateNumber = (num) => {
  if (num === 0) return '0';

  const absNum = Math.abs(num);
  let abbreviated = '';

  if (absNum >= 10000000) { 
    abbreviated = (absNum / 10000000).toFixed(2) + 'Cr';
  } else if (absNum >= 100000) { 
    abbreviated = (absNum / 100000).toFixed(2) + 'L';
  } else if (absNum >= 1000) { 
    abbreviated = (absNum / 1000).toFixed(2) + 'K';
  } else {
    abbreviated = absNum.toString();
  }

  return num < 0 ? '-' + abbreviated : abbreviated;
};

/**
 * Formats a number with Indian locale and currency symbol
 * @param {number} num - The number to format
 * @returns {string} - Formatted string
 */
export const formatCurrency = (num) => {
  return `₹ ${num.toLocaleString('en-IN')}`;
};
