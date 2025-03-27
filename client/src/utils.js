/**
 * Utility functions for the Sparkgen client
 */

// Only attempt to log to development server if on localhost
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Logging system - only active in development
(function setupLogging() {
    // Skip logging setup in production environments
    if (!isDevelopment) return;

    const LOG_SERVER_URL = 'http://localhost:4444/logs';
    const logBuffer = [];
    const MAX_BUFFER_SIZE = 100; // Limit buffer size to prevent memory issues
    let lastSentHash = ''; // To track if logs have changed

    // Simple hash function for log content
    function hashLogs(logs) {
        return logs.map(log => `${log.timestamp}:${log.method}:${log.message.substring(0, 50)}`).join('|');
    }

    // Function to add a log to the buffer, keeping only the latest logs
    function addToBuffer(log) {
        // If buffer is full, remove the oldest entry (first item)
        if (logBuffer.length >= MAX_BUFFER_SIZE) {
            logBuffer.shift(); // Remove oldest log
        }

        // Add the new log
        logBuffer.push(log);

        // Reset hash when we add a new log
        lastSentHash = '';
    }

    function sendLogs() {
        if (logBuffer.length === 0) return;

        // Check if logs have changed since last send
        const currentHash = hashLogs(logBuffer);
        if (currentHash === lastSentHash) {
            return; // No changes, don't send
        }

        // Copy and clear the buffer
        const logsToSend = [...logBuffer];
        logBuffer.length = 0;

        // Update the hash
        lastSentHash = currentHash;

        fetch(LOG_SERVER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ logs: logsToSend }),
        }).catch((err) => {
            console.error("Failed to send logs:", err);
            // Put logs back in buffer if sending failed
            for (const log of logsToSend) {
                addToBuffer(log); // Use the addToBuffer function to respect size limits
            }
        });
    }

    const consoleMethods = ['log', 'error', 'warn', 'info', 'debug'];

    consoleMethods.forEach((method) => {
        const originalMethod = console[method];
        console[method] = function (...args) {
            const timestamp = new Date().toISOString();

            const message = args
                .map((arg) => {
                    if (arg instanceof Error) {
                        return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
                    } else if (typeof arg === 'object' && arg !== null) {
                        try {
                            // Handle React component stack traces specially
                            if (arg.componentStack) {
                                return `${String(arg.message)}\nComponent Stack:${arg.componentStack}`;
                            }
                            return JSON.stringify(arg);
                        } catch (e) {
                            return '[Circular]';
                        }
                    } else {
                        return String(arg);
                    }
                })
                .join(' ');

            addToBuffer({
                method,
                message: message.trim(),
                timestamp
            });

            originalMethod.apply(console, args);
        };
    });

    // Capture unhandled JavaScript errors
    window.onerror = function (message, source, lineno, colno, error) {
        const timestamp = new Date().toISOString();
        const errorName = error && error.name ? error.name : 'Error';

        addToBuffer({
            method: 'error',
            message: `${errorName}: ${message} at ${source}:${lineno}:${colno}`,
            timestamp,
        });
    };

    // Capture resource loading errors - using throttling to prevent overwhelming
    let lastResourceErrorTime = 0;
    window.addEventListener(
        'error',
        (event) => {
            const now = Date.now();
            if (now - lastResourceErrorTime < 500) return; // Throttle to max one per 500ms
            lastResourceErrorTime = now;

            if (
                event.target instanceof HTMLImageElement ||
                event.target instanceof HTMLScriptElement ||
                event.target instanceof HTMLLinkElement
            ) {
                const timestamp = new Date().toISOString();
                addToBuffer({
                    method: 'error',
                    message: `Resource error: ${event.target.tagName} failed to load. URL: ${event.target.src || event.target.href}`,
                    timestamp,
                });
            }
        },
        true
    );

    // Periodically send logs every 3 seconds
    setInterval(sendLogs, 3000);

    // Send remaining logs on page unload
    window.addEventListener('beforeunload', sendLogs);
})();

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