// utils.js - Utility functions for the SparkGen application

/**
 * Sending logs to the development server
 * This only works in development environment
 * @param {Object} logData - Data to be logged
 * @returns {Promise} - Promise resolving when logs are sent
 */
const sendLogs = async (logData) => {
  try {
    // Only attempt to send logs in development environment
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      const response = await fetch('http://localhost:4444/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          ...logData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.statusText}`);
      }
      
      return await response.json();
    }
    // In production, silently skip logging to external server
    return Promise.resolve();
  } catch (error) {
    // Log the error but don't throw to prevent app disruption
    console.error('Failed to send logs:', error);
    // Return a resolved promise to prevent chain breaking
    return Promise.resolve();
  }
};

/**
 * Intercept console methods to add remote logging in development
 */
const setupConsoleInterceptor = () => {
  if (typeof window === 'undefined') return; // Only run in browser
  
  const originalConsoleMethods = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };
  
  const consoleMethods = Object.keys(originalConsoleMethods);
  
  consoleMethods.forEach((method) => {
    console[method] = (...args) => {
      // Call the original method
      originalConsoleMethods[method](...args);
      
      // Only send logs in development
      if (process.env.NODE_ENV !== 'production') {
        // Send logs to development server
        sendLogs({
          level: method,
          message: args.map(arg => {
            try {
              if (typeof arg === 'object') {
                return JSON.stringify(arg);
              }
              return String(arg);
            } catch (e) {
              return 'Unable to stringify log argument';
            }
          }).join(' '),
        }).catch(error => {
          // Just log the error, don't interrupt the application flow
          originalConsoleMethods.error('Failed to send logs:', error);
        });
      }
    };
  });
};

/**
 * Format date to localized string
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} - Truncated text
 */
const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.substring(0, maxLength).trim()}...`;
};

/**
 * Initialize the utility functions
 */
const initUtils = () => {
  // Only setup console interceptor in development environment
  if (process.env.NODE_ENV !== 'production') {
    setupConsoleInterceptor();
  }
};

// Export utility functions
export {
  sendLogs,
  setupConsoleInterceptor,
  formatDate,
  truncateText,
  initUtils
};

// Initialize utilities when this module is loaded
if (typeof window !== 'undefined') {
  initUtils();
}