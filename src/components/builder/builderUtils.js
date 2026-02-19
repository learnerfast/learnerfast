/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} - The debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to ensure a function is called at most once per interval
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} - The throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Show a toast notification (if available)
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, warning, info)
 */
export const showToast = (message, type = 'info') => {
  if (window.showToast) {
    window.showToast(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
};

/**
 * Safe element manipulation with error handling
 * @param {Function} operation - The operation to perform
 * @param {string} errorMessage - The error message to display if operation fails
 */
export const safeElementOperation = async (operation, errorMessage = 'Operation failed') => {
  try {
    await operation();
    return { success: true };
  } catch (error) {
    console.error(errorMessage, error);
    showToast(errorMessage, 'error');
    return { success: false, error };
  }
};

/**
 * Get computed styles from an element
 * @param {HTMLElement} element - The element to get styles from
 * @returns {Object} - Object containing computed styles
 */
export const getElementStyles = (element) => {
  if (!element) return {};
  
  const computed = window.getComputedStyle(element);
  const styles = {};
  
  // Extract commonly used styles
  const properties = [
    'color', 'backgroundColor', 'fontSize', 'fontFamily', 'fontWeight',
    'padding', 'margin', 'border', 'borderRadius', 'display', 'position',
    'width', 'height', 'textAlign', 'lineHeight'
  ];
  
  properties.forEach(prop => {
    styles[prop] = computed[prop];
  });
  
  return styles;
};

/**
 * Validate image file
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes (default 5MB)
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Please select an image file' };
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: `Image size must be less than ${maxSize / (1024 * 1024)}MB` };
  }
  
  return { valid: true };
};
