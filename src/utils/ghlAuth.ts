import axios from 'axios';
import { GHLTokenResponse } from '../types/ghl';

const GHL_CLIENT_ID = import.meta.env.VITE_GHL_CLIENT_ID;
const GHL_CLIENT_SECRET = import.meta.env.VITE_GHL_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

// Get the OAuth URL to authenticate users and let them select their sub-account (location)
export const getAuthUrl = () => {
  return `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=contacts.write locations.readonly`;
};

// Function to initiate the OAuth flow
export const initiateGHLAuth = () => {
  const authUrl = getAuthUrl();
  // Open the auth URL in the current window
  window.location.href = authUrl;
};

// Exchange authorization code for access token and location details
export const exchangeCodeForToken = async (code: string) => {
  try {
    // Create URLSearchParams for form-encoded data
    const params = new URLSearchParams();
    params.append('client_id', GHL_CLIENT_ID);
    params.append('client_secret', GHL_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('user_type', 'Location');
    params.append('redirect_uri', REDIRECT_URI);
    
    const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Full response:', response);
    console.log('Token response:', response.data);

    return response.data;
    
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Checks if the stored token is expired
 */
export const isTokenExpired = (): boolean => {
  const expiry = localStorage.getItem('ghl_token_expiry');
  if (!expiry) return true;
  
  return Date.now() > parseInt(expiry, 10);
};

export const hasValidGHLCredentials = () => {
  return !!(
    localStorage.getItem('ghl_access_token') && 
    localStorage.getItem('ghl_location_id')
  );
};