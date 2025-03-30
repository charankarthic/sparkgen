// Network status utility functions

// Check if the browser is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Set up network status event listeners
export const setupNetworkListeners = (
  onlineCallback: () => void,
  offlineCallback: () => void
): () => void => {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);

  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onlineCallback);
    window.removeEventListener('offline', offlineCallback);
  };
};

// Check if a server is reachable
export const checkServerReachable = async (url: string): Promise<boolean> => {
  try {
    // Use a HEAD request for minimal data transfer
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    });

    return true;
  } catch (error) {
    console.error('Server unreachable:', error);
    return false;
  }
};