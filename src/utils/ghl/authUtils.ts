import axios from 'axios';
import { GHLTokenResponse } from '../../types/ghl';

const GHL_CLIENT_ID = import.meta.env.VITE_GHL_CLIENT_ID;
const GHL_CLIENT_SECRET = import.meta.env.VITE_GHL_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

/**
 * Generates the GHL OAuth authorization URL
 */
export const getAuthUrl = () => {
  return `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&client_id=${GHL_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=contacts.write locations.readonly`;
};

/**
 * Exchanges the authorization code for an access token
 */
export const exchangeCodeForToken = async (code: string): Promise<GHLTokenResponse> => {
  try {
    const response = await axios.post('https://services.leadconnectorhq.com/oauth/token', {
      client_id: GHL_CLIENT_ID,
      client_secret: GHL_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
    });

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