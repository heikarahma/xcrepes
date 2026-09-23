/**
 * Date utility functions for consistent timezone handling across XCrepes POS.
 * Always formats YYYY-MM-DD based on local browser/device time instead of UTC to avoid date shifting.
 */

/**
 * Returns YYYY-MM-DD string in local device time.
 * @param {Date|string|number} d 
 * @returns {string} e.g. "2026-09-23"
 */
export const getLocalDateStr = (d = new Date()) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats date to Indonesian display format.
 * @param {Date|string|number} d 
 * @returns {string} e.g. "23 September 2026"
 */
export const formatDateIndonesian = (d = new Date()) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Formats datetime to Indonesian display format with WIB.
 * @param {Date|string|number} d 
 * @returns {string} e.g. "23 September 2026 14:30 WIB"
 */
export const formatDateTimeIndonesian = (d = new Date()) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date.getTime())) return '';
  const datePart = date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timePart = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `${datePart} ${timePart} WIB`;
};
