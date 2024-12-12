import { useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/ghlAuth';

export const useGHLAuth = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('ghl_access_token');
      const locationId = localStorage.getItem('ghl_location_id');
      
      setIsConnected(
        !!token && 
        !!locationId && 
        !isTokenExpired()
      );
    };

    checkAuthStatus();
    // Check auth status when window regains focus
    window.addEventListener('focus', checkAuthStatus);
    
    return () => {
      window.removeEventListener('focus', checkAuthStatus);
    };
  }, []);

  const disconnect = () => {
    localStorage.removeItem('ghl_access_token');
    localStorage.removeItem('ghl_location_id');
    localStorage.removeItem('ghl_token_expiry');
    setIsConnected(false);
  };

  return {
    isConnected,
    disconnect
  };
};

export default useGHLAuth;