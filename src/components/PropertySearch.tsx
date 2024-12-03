/**
 * Main property search component that handles the search interface and results
 * Manages search parameters and property data fetching
 */
import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { Search, MapPin, Filter } from 'lucide-react';
import { searchProperties } from '../services/api';
import PropertyList from './PropertyList';
import SearchFilters from './SearchFilters';

const PropertySearch: React.FC = () => {
  // Main search parameters state
  const [searchParams, setSearchParams] = useState({
    location: '',
    state: '',
    propertyType: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    beds: '',
    baths: '',
    minSqft: '',
    maxSqft: '',
    homeType: [] as string[]
  });

  // State for storing agent details as they load
  const [agentDetails, setAgentDetails] = useState<Record<string, any>>({});
  const [isSearching, setIsSearching] = useState(false);

  // Query hook for fetching property data
  const { data, isLoading, error, refetch } = useQuery(
    ['properties', searchParams],
    () => searchProperties(searchParams),
    {
      enabled: false, // Don't fetch automatically on mount
      onSuccess: (data) => {
        data?.loadAgentDetails((propertyId, details) => {
          setAgentDetails(prev => ({
            ...prev,
            [propertyId]: details
          }));
        });
      },
      onError: (err) => {
        toast.error('Failed to fetch properties. Please check your API settings.');
      }
    }
  );

  /**
   * Handles the search submission
   * Validates required fields and triggers the search
   */
  const handleSearch = () => {
    if (!searchParams.location || !searchParams.state) {
      toast.warning('Please enter both city and state');
      return;
    }
    setIsSearching(true);
    setAgentDetails({}); // Reset agent details for new search
    refetch();
  };

  // Combine property data with loaded agent details
  const properties = data?.properties?.map(property => ({
    ...property,
    listingAgent: agentDetails[property.id] || property.listingAgent
  })) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Search Input Fields */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aires-gray h-5 w-5" />
              <input
                type="text"
                placeholder="Enter city"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aires-green focus:border-transparent"
                value={searchParams.location}
                onChange={(e) => setSearchParams({ ...searchParams, location: e.target.value })}
              />
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="State (e.g., CA)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aires-green focus:border-transparent"
              value={searchParams.state}
              onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value.toUpperCase() })}
              maxLength={2}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="flex items-center justify-center px-6 py-2 bg-aires-green text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-aires-green focus:ring-offset-2 disabled:opacity-50"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </button>
        </div>

        {/* Advanced Search Filters */}
        <SearchFilters searchParams={searchParams} setSearchParams={setSearchParams} />
      </div>

      {/* Property Results List */}
      <PropertyList
        properties={properties}
        loading={isLoading}
      />
    </div>
  );
};

export default PropertySearch;