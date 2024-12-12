import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { exchangeCodeForToken } from '../utils/ghlAuth';
import { toast } from 'react-toastify';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing OAuth callback...');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        if (!code) {
          setStatus('Error: No authorization code received');
          return;
        }

        // Add error handling and logging
        console.log('Exchanging code for token...');
        const tokenData = await exchangeCodeForToken(code);
        // Add error handling and logging
        console.log('Token received:', tokenData);
        
        // Store the access token and location ID
        localStorage.setItem('ghl_access_token', tokenData.access_token);
        localStorage.setItem('ghl_location_id', tokenData.locationId);
        localStorage.setItem('ghl_token_expiry', String(Date.now() + tokenData.expires_in * 1000));

        setStatus('Authorization successful! Redirecting...');
        navigate('/'); // Redirect to home page
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('Authorization failed. Please try again.');
        navigate('/');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
          Connecting to GHL
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;
