import React, { useState } from 'react';
import { Building2, MapPin, Bed, Bath, Square, List, Grid, Download, ExternalLink, Phone, Mail, Calendar, Home } from 'lucide-react';
import { PropertyData } from '../types';
import PropertyDetails from './PropertyDetails';
import { exportToGHL } from '../utils/ghlIntegration';
import { hasValidGHLCredentials, getAuthUrl } from '../utils/ghlAuth';
import { toast } from 'react-toastify';

interface PropertyListProps {
  properties: PropertyData[];
  loading: boolean;
}

const PropertyList: React.FC<PropertyListProps> = ({ properties = [], loading }) => {
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);

  const handleExport = async (property: PropertyData) => {
    try {
      if (!hasValidGHLCredentials()) {
        window.location.href = getAuthUrl();
        return;
      }
      await exportToGHL(property);
      toast.success('Property exported to GHL successfully');
    } catch (error) {
      toast.error('Failed to export property to GHL');
    }
  };

  const handleExportAll = async () => {
    try {
      await Promise.all(properties.map(property => exportToGHL(property)));
      toast.success('All properties exported to GHL successfully');
    } catch (error) {
      toast.error('Failed to export properties to GHL');
    }
  };

  const formatPrice = (price: number = 0) => {
    return price.toLocaleString();
  };

  const formatNumber = (num: number = 0) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(properties) || properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No properties found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search parameters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewType('grid')}
            className={`p-2 rounded-lg ${viewType === 'grid' ? 'bg-aires-green text-white' : 'bg-gray-100'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewType('list')}
            className={`p-2 rounded-lg ${viewType === 'list' ? 'bg-aires-green text-white' : 'bg-gray-100'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
        <button
          onClick={handleExportAll}
          className="flex items-center px-4 py-2 bg-aires-green text-white rounded-lg hover:bg-opacity-90"
        >
          <Download className="h-4 w-4 mr-2" />
          Export All to GHL
        </button>
      </div>

      <div className={viewType === 'grid' ? 
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : 
        "space-y-4"
      }>
        {properties.map((property) => (
          <div 
            key={property.id} 
            className={`bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${
              viewType === 'list' ? 'flex' : ''
            }`}
            onClick={() => setSelectedProperty(property)}
          >
            <img
              src={property.imageUrl}
              alt={property.address}
              className={viewType === 'list' ? "w-48 h-32 object-cover" : "w-full h-48 object-cover"}
            />
            <div className="p-4 flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">${formatPrice(property.price)}</h3>
                  <div className="flex items-center text-gray-500 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <p className="text-sm">{property.address}, {property.city}, {property.state} {property.zipCode}</p>
                  </div>
                  <div className="flex items-center text-gray-500 mt-1">
                    <Home className="h-4 w-4 mr-1" />
                    <p className="text-sm">{property.propertyType}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(property);
                  }}
                  className="p-2 text-aires-gray hover:text-aires-green"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.beds} beds</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.baths} baths</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{formatNumber(property.sqft)} sqft</span>
                </div>
              </div>

              <div className="mt-2 flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Built {property.yearBuilt || 'N/A'}</span>
              </div>

              {property.listingAgent && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {property.listingAgent.name}
                  </p>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    {property.listingAgent.phone !== 'N/A' && (
                      <a 
                        href={`tel:${property.listingAgent.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center hover:text-aires-green"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        <span>Call</span>
                      </a>
                    )}
                    {property.listingAgent.email !== 'N/A' && (
                      <a 
                        href={`mailto:${property.listingAgent.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center hover:text-aires-green"
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        <span>Email</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedProperty && (
        <PropertyDetails
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onExport={handleExport}
        />
      )}
    </>
  );
};

export default PropertyList;