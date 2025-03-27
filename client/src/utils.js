/**
 * Utility functions for the Sparkgen client
 */

// Check if we're in production environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

// Buffer to collect logs before sending them to the server
let logBuffer = [];
const MAX_BUFFER_SIZE = 50;
const LOG_SEND_INTERVAL = 5000; // 5 seconds

/**
 * Formats a log entry with timestamp and additional metadata
 * @param {string} level - Log level (info, warn, error)
 * @param {Array} args - The log arguments
 * @returns {Object} Formatted log entry
 */
const formatLogEntry = (level, args) => {
  const timestamp = new Date().toISOString();

  // Handle various types of log arguments and convert to strings
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  });

  return {
    timestamp,
    level,
    message: formattedArgs.join(' '),
    userAgent: navigator.userAgent,
    url: window.location.href
  };
};

/**
 * Sends collected logs to the development logging server
 * This is only used in development mode
 */
const sendLogs = async () => {
  // Skip sending logs if buffer is empty or we're in production
  if (logBuffer.length === 0 || isProduction) return;

  // Double check we're definitely in development mode before proceeding
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Clear buffer and don't attempt to send logs in production
    logBuffer = [];
    return;
  }

  const logsToSend = [...logBuffer];
  logBuffer = [];

  try {
    // Only attempt to send logs in development mode and if the server is likely running
    const response = await fetch('http://localhost:4444/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: logsToSend })
    });

    if (!response.ok) {
      throw new Error(`Failed to send logs: HTTP ${response.status}`);
    }
  } catch (error) {
    // Don't re-add logs to buffer to avoid infinite loops
    console.error('Failed to send logs:', error);
    
    // If we get connection refused errors repeatedly, we might want to disable logging
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Development logging server appears to be offline. Log sending will be paused.');
    }
  }
};

// Set up interval to send logs periodically in development mode only
let logSendInterval = null;
if (!isProduction) {
  logSendInterval = setInterval(sendLogs, LOG_SEND_INTERVAL);
  
  // If we're really sure we're in development, add a check after 30 seconds
  // to see if connection failures are consistent and disable if needed
  setTimeout(() => {
    if (logSendInterval && !isProduction && window.location.hostname === 'localhost') {
      console.log('Development logging is active');
    }
  }, 5000);
}

// Override console methods to capture logs
const originalConsole = {};
const consoleMethods = ['log', 'info', 'warn', 'error', 'debug'];

consoleMethods.forEach(method => {
  originalConsole[method] = console[method];

  console[method] = (...args) => {
    // Call the original console method
    originalConsole[method](...args);

    // In development, capture logs for the logging server
    if (!isProduction) {
      logBuffer.push(formatLogEntry(method, args));

      // If buffer gets too large, send logs immediately
      if (logBuffer.length >= MAX_BUFFER_SIZE) {
        sendLogs();
      }
    }
  };
});

// Handle page unload: try to send any remaining logs
window.addEventListener('beforeunload', () => {
  // Triple-check we're in development mode to prevent any attempts in production
  if (!isProduction && logBuffer.length > 0 && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      navigator.sendBeacon('http://localhost:4444/logs',
        JSON.stringify({ logs: logBuffer })
      );
    } catch (error) {
      // We can't do much on unload, but at least we tried
    }
  }
});

/**
 * Sleeps for the specified duration
 * @param {number} ms - Time in milliseconds
 * @returns {Promise} - Resolves after the time has passed
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Truncates text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Safely parses JSON, returning default value on error
 * @param {string} jsonString - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} - Parsed object or default value
 */
export const safeJsonParse = (jsonString, defaultValue = {}) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

/**
 * Debounces a function call
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
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

export default {
  sleep,
  truncateText,
  safeJsonParse,
  debounce
};