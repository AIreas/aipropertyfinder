import React from 'react';
import { Link } from 'lucide-react';
import { getAuthUrl } from '../../utils/ghlAuth';
import { useGHLAuth } from '../../hooks/useGHLAuth';

const ConnectToGHLButton: React.FC = () => {
  const { isConnected, disconnect } = useGHLAuth();

  const handleConnect = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <button
          onClick={disconnect}
          className="flex items-center px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
        >
          <Link className="w-4 h-4 mr-2" />
          Disconnect GHL
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center px-4 py-2 text-white bg-aires-green rounded-lg hover:bg-opacity-90"
        >
          <Link className="w-4 h-4 mr-2" />
          Connect to GHL
        </button>
      )}
    </div>
  );
};

export default ConnectToGHLButton;