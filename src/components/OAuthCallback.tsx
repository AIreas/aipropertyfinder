import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForToken } from '../utils/ghlAuth';

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

        const tokenData = await exchangeCodeForToken(code);
        
        // Store the access token and location ID
        localStorage.setItem('ghl_access_token', tokenData.access_token);
        localStorage.setItem('ghl_location_id', tokenData.locationId);

        setStatus('Authorization successful! Redirecting...');
        navigate('/'); // Redirect to home page
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('Authorization failed. Please try again.');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            OAuth Callback
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
