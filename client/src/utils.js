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
    const STORAGE_KEY = 'sparkgen_log_buffer';
    const MAX_RETRY_ATTEMPTS = 5;
    let isRetrying = false;
    let retryCount = 0;
    let retryTimeout = null;

    // Keep track of logging server availability
    let logServerAvailable = true;
    let lastServerCheckTime = 0;
    const SERVER_CHECK_INTERVAL = 30000; // Check server every 30 seconds

    // Load any unsent logs from local storage
    try {
        const storedLogs = localStorage.getItem(STORAGE_KEY);
        if (storedLogs) {
            const parsedLogs = JSON.parse(storedLogs);
            if (Array.isArray(parsedLogs)) {
                parsedLogs.forEach(log => {
                    // Only add logs that are less than 24 hours old
                    const logTime = new Date(log.timestamp).getTime();
                    const now = Date.now();
                    if (now - logTime < 24 * 60 * 60 * 1000) {
                        addToBuffer(log, false); // Add without saving to avoid loop
                    }
                });
                localStorage.removeItem(STORAGE_KEY); // Clear after loading
            }
        }
    } catch (err) {
        // Just continue if local storage can't be accessed
    }

    // Calculate backoff time based on retry count
    function getBackoffTime() {
        // Exponential backoff: 1s, 2s, 4s, 8s, 16s (capped at 30s)
        return Math.min(1000 * Math.pow(2, retryCount), 30000);
    }

    // Check if log server is available
    function checkLogServerAvailability() {
        const now = Date.now();
        // Only check periodically to avoid excessive requests
        if (!logServerAvailable && now - lastServerCheckTime < SERVER_CHECK_INTERVAL) {
            return Promise.resolve(false);
        }

        lastServerCheckTime = now;
        return fetch(`${LOG_SERVER_URL}/ping`, {
            method: 'HEAD',
            // Use AbortController to timeout if it takes too long
            signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        .then(() => {
            // Server is available
            logServerAvailable = true;
            return true;
        })
        .catch(() => {
            // Server is not available
            logServerAvailable = false;
            return false;
        });
    }

    // Simple hash function for log content
    function hashLogs(logs) {
        return logs.map(log => `${log.timestamp}:${log.method}:${log.message.substring(0, 50)}`).join('|');
    }

    // Function to add a log to the buffer, keeping only the latest logs
    function addToBuffer(log, saveToStorage = true) {
        // If buffer is full, remove the oldest entry (first item)
        if (logBuffer.length >= MAX_BUFFER_SIZE) {
            logBuffer.shift(); // Remove oldest log
        }

        // Add the new log
        logBuffer.push(log);

        // Reset hash when we add a new log
        lastSentHash = '';

        // Save to local storage as backup if needed
        if (saveToStorage) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(logBuffer));
            } catch (e) {
                // If localStorage is full, just continue without saving
            }
        }
    }

    function saveBufferToStorage() {
        if (logBuffer.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(logBuffer));
            } catch (e) {
                // If localStorage is full, just continue without saving
            }
        }
    }

    function sendLogs(forceSend = false) {
        // If already retrying, no logs to send, or server known to be unavailable, skip
        if (isRetrying || logBuffer.length === 0 || (!forceSend && !logServerAvailable)) {
            return Promise.resolve(false);
        }

        // Check if logs have changed since last send and we're not forcing
        const currentHash = hashLogs(logBuffer);
        if (!forceSend && currentHash === lastSentHash) {
            return Promise.resolve(false); // No changes, don't send
        }

        // Update the hash before sending
        lastSentHash = currentHash;

        // Copy the buffer (don't clear yet until successful)
        const logsToSend = [...logBuffer];

        isRetrying = true;

        // First check if the server is available (only if we're not sure or it's been a while)
        let serverCheckPromise;
        if (forceSend || logServerAvailable) {
            // Skip check if forcing or we believe it's available
            serverCheckPromise = Promise.resolve(true);
        } else {
            serverCheckPromise = checkLogServerAvailability();
        }

        return serverCheckPromise.then(serverAvailable => {
            if (!serverAvailable) {
                // Server not available, save to storage and exit
                saveBufferToStorage();
                isRetrying = false;
                return false;
            }

            // Server seems available, try to send logs
            return fetch(LOG_SERVER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ logs: logsToSend }),
                // Add a timeout to the fetch request
                signal: AbortSignal.timeout(5000)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with ${response.status}`);
                }
                // Success - clear the logs we just sent
                logBuffer.length = 0;
                retryCount = 0;
                logServerAvailable = true;

                // Clear from local storage
                try {
                    localStorage.removeItem(STORAGE_KEY);
                } catch (e) {
                    // Ignore local storage errors
                }
                return true;
            })
            .catch((err) => {
                // Don't spam the console with these network errors
                if (retryCount === 0) {
                    // Only log on first retry
                    const errorMsg = `Log server error: ${err.message || 'Network error'}`;

                    // Use the original console method to avoid recursion
                    const originalError = console.__originalError || console.error;
                    originalError.call(console, errorMsg);
                }

                // If it's a network error, mark server as unavailable
                if (err.name === 'TypeError' && err.message.includes('fetch')) {
                    logServerAvailable = false;
                }

                // Implement exponential backoff for retries
                if (retryCount < MAX_RETRY_ATTEMPTS) {
                    const backoffTime = getBackoffTime();
                    retryCount++;

                    // Schedule retry with backoff
                    clearTimeout(retryTimeout);
                    retryTimeout = setTimeout(() => {
                        isRetrying = false;
                        sendLogs(true); // Force send on retry
                    }, backoffTime);

                    // Save to local storage for persistence between page loads
                    saveBufferToStorage();
                } else {
                    // Max retries reached, keep in buffer for next regular attempt
                    isRetrying = false;
                    retryCount = 0;

                    // Save to storage as backup
                    saveBufferToStorage();
                }
                return false;
            })
            .finally(() => {
                if (retryCount === 0) {
                    isRetrying = false;
                }
            });
        });
    }

    const consoleMethods = ['log', 'error', 'warn', 'info', 'debug'];

    // Store original methods to avoid recursion issues
    const originalConsoleMethods = {};
    consoleMethods.forEach(method => {
        originalConsoleMethods[method] = console[method];
        console[`__original${method.charAt(0).toUpperCase() + method.slice(1)}`] = console[method];
    });

    consoleMethods.forEach((method) => {
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

            // Skip logging our own logging errors to avoid recursion
            if (!message.includes('Failed to send logs')) {
                addToBuffer({
                    method,
                    message: message.trim(),
                    timestamp
                });
            }

            // Call original method
            originalConsoleMethods[method].apply(console, args);
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

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const timestamp = new Date().toISOString();
        const reason = event.reason;

        let message = 'Unhandled Promise Rejection';
        if (reason instanceof Error) {
            message = `${message}: ${reason.name}: ${reason.message}\n${reason.stack || ''}`;
        } else if (typeof reason === 'string') {
            message = `${message}: ${reason}`;
        } else if (reason && typeof reason === 'object') {
            try {
                message = `${message}: ${JSON.stringify(reason)}`;
            } catch (e) {
                message = `${message}: [Object cannot be stringified]`;
            }
        }

        addToBuffer({
            method: 'error',
            message,
            timestamp,
        });
    });

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

    // Handle online/offline status
    window.addEventListener('online', () => {
        // When we come back online, try sending logs immediately
        logServerAvailable = true; // Reset this flag when we come back online
        sendLogs(true);
    });

    window.addEventListener('offline', () => {
        // When offline, make sure we save logs to localStorage
        logServerAvailable = false;
        saveBufferToStorage();
    });

    // Check connection status on page load
    if (navigator.onLine === false) {
        logServerAvailable = false;
        saveBufferToStorage();
    } else {
        // Check if log server is available on startup
        checkLogServerAvailability();
    }

    // Periodically send logs every 5 seconds (increased from 3 to reduce frequency)
    setInterval(() => {
        if (navigator.onLine) {
            sendLogs();
        } else {
            saveBufferToStorage();
        }
    }, 5000);

    // Send remaining logs on page unload
    window.addEventListener('beforeunload', () => {
        if (navigator.onLine && logServerAvailable) {
            // For beforeunload, try using sendBeacon which is more reliable for exit events
            if (navigator.sendBeacon && logBuffer.length > 0) {
                try {
                    navigator.sendBeacon(
                        LOG_SERVER_URL,
                        JSON.stringify({ logs: logBuffer })
                    );
                    // Clear logs if sendBeacon successful
                    logBuffer.length = 0;
                    localStorage.removeItem(STORAGE_KEY);
                } catch (e) {
                    // Fall back to saving in localStorage if sendBeacon fails
                    saveBufferToStorage();
                }
            } else {
                // Fallback to saving in storage (sync XHR is unreliable during unload)
                saveBufferToStorage();
            }
        } else {
            // Make sure logs are saved if we're offline
            saveBufferToStorage();
        }
    });
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

/**
 * Detect network connectivity changes
 * @param {Function} onOnline - Callback when online
 * @param {Function} onOffline - Callback when offline
 * @returns {Function} - Function to remove event listeners
 */
export const detectConnectivity = (onOnline, onOffline) => {
  const handleOnline = () => {
    if (typeof onOnline === 'function') onOnline();
  };

  const handleOffline = () => {
    if (typeof onOffline === 'function') onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return function to clean up listeners
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

export default {
  sleep,
  truncateText,
  safeJsonParse,
  debounce,
  detectConnectivity
};