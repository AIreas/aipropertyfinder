import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { exchangeCodeForToken } from '../../utils/ghl/authUtils';
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
          throw new Error('No authorization code received');
        }

        const tokenData = await exchangeCodeForToken(code);
        
        // Store tokens in localStorage
        localStorage.setItem('ghl_access_token', tokenData.access_token);
        localStorage.setItem('ghl_location_id', tokenData.locationId);
        localStorage.setItem('ghl_token_expiry', String(Date.now() + tokenData.expires_in * 1000));

        toast.success('Successfully connected to GHL!');
        navigate('/');
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error('Failed to connect to GHL. Please try again.');
        navigate('/');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-4 p-8 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-aires-green animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900">
            Connecting to GHL
          </h2>
          <p className="text-sm text-gray-600">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;