/**
 * Network utility functions for connectivity checking and network status management
 */

import { toast } from '@/components/ui/use-toast';

/**
 * Check if the internet connection is available
 * @returns {Promise<boolean>} - True if connection is available, false otherwise
 */
export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    // Use a reliable endpoint to check connectivity
    await fetch('https://www.google.com/favicon.ico', { 
      mode: 'no-cors',
      cache: 'no-store',
      timeout: 3000
    });
    console.log('Internet connection check: Connected');
    return true;
  } catch (error) {
    console.error('Internet connection check failed:', error);
    return false;
  }
};

/**
 * Notify the user about network status changes
 * @param {boolean} isOnline - Whether the network is online
 */
export const notifyNetworkStatus = (isOnline: boolean): void => {
  if (isOnline) {
    console.log('Network connection restored');
    toast({
      title: "Connected",
      description: "Your internet connection has been restored",
      variant: "default",
    });
  } else {
    console.warn('Network connection lost');
    toast({
      title: "Disconnected",
      description: "You are currently offline. Some features may be unavailable.",
      variant: "destructive",
    });
  }
};

/**
 * Setup network status event listeners
 */
export const setupNetworkListeners = (): void => {
  try {
    window.addEventListener('online', () => {
      console.log('Browser online event triggered');
      notifyNetworkStatus(true);
    });
    
    window.addEventListener('offline', () => {
      console.log('Browser offline event triggered');
      notifyNetworkStatus(false);
    });
    
    console.log('Network status listeners initialized');
  } catch (error) {
    console.error('Failed to setup network listeners:', error);
  }
};