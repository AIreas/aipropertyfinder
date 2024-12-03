/**
 * Main application component
 * Handles the overall layout and state management for the property finder application
 */
import React, { useState } from 'react';
import { Building2, Settings, Database } from 'lucide-react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ApiSettings from './components/ApiSettings';
import PropertySearch from './components/PropertySearch';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App: React.FC = () => {
  // State for managing settings modal visibility
  const [showSettings, setShowSettings] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-aires-lightGray">
        {/* Application Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo and Title */}
              <div className="flex items-center space-x-3">
                <Building2 className="h-8 w-8 text-aires-green" />
                <div>
                  <h1 className="text-xl font-bold text-aires-darkGray">AIRES Property Finder</h1>
                  <p className="text-sm text-aires-gray">Zillow & MLS Data Integration</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-aires-gray hover:text-aires-darkGray hover:bg-aires-lightGray rounded-lg"
                  title="API Settings"
                >
                  <Settings className="h-6 w-6" />
                </button>
                <a
                  href="#"
                  className="flex items-center text-sm text-aires-gray hover:text-aires-darkGray"
                  title="View Documentation"
                >
                  <Database className="h-5 w-5 mr-1" />
                  Docs
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PropertySearch />
        </main>

        {/* Settings Modal */}
        {showSettings && (
          <ApiSettings onClose={() => setShowSettings(false)} />
        )}

        {/* Toast Notifications Container */}
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </QueryClientProvider>
  );
};

export default App;