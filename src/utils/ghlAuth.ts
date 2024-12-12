import axios from 'axios';
import qs from 'qs';
import { GHLTokenResponse } from '../types/ghl';
import { Code } from 'lucide-react';

const GHL_CLIENT_ID = import.meta.env.VITE_GHL_CLIENT_ID;
const GHL_CLIENT_SECRET = import.meta.env.VITE_GHL_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

// Get the OAuth URL to authenticate users and let them select their sub-account (location)
export const getAuthUrl = () => {
  return `https://marketplace.leadconnectorhq.com/oauth/chooselocation?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=contacts.write locations.readonly`;
};
/*
// Function to initiate the OAuth flow
export const initiateGHLAuth = () => {
  const authUrl = getAuthUrl();
  // Open the auth URL in the current window
  window.location.href = authUrl;
};
*/
// Exchange authorization code for access token and location details
export const exchangeCodeForToken = async (code: string) => {
  const encodedParams = new URLSearchParams();
  encodedParams.set('client_id', GHL_CLIENT_ID);
  encodedParams.set('client_secret', GHL_CLIENT_SECRET);
  encodedParams.set('grant_type', 'authorization_code');
  encodedParams.set('code', code);
  encodedParams.set('user_type', 'Location');       // If user_type is needed, put the correct value (e.g. 'Location')
  encodedParams.set('redirect_uri', REDIRECT_URI);

  // Base64 encode the client ID and secret for the Authorization header
  const basicAuth = btoa(`${GHL_CLIENT_ID}:${GHL_CLIENT_SECRET}`);

  const options = {
    method: 'POST',
    url: 'https://services.leadconnectorhq.com/oauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${basicAuth}`, // Add the Basic Authorization header
      'Version': '2021-07-28' // Required API version 
    },
    data: encodedParams,
  };

  
  try {
    const { data } = await axios.request(options);
    console.log('Token Response:', data);
    return data;
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