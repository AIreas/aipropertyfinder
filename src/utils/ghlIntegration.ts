/**
 * Utility module for Go High Level (GHL) integration
 * Handles exporting property data to GHL via OAuth API
 */
import axios from 'axios';
import { PropertyData } from '../types';
import { isTokenExpired } from './ghlAuth';

const GHL_API_BASE = 'https://services.leadconnectorhq.com';

const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

/**
 * Creates an axios instance with authorization headers
 */
const createGHLClient = () => {
  const token = localStorage.getItem('ghl_access_token');
  
  return axios.create({
    baseURL: GHL_API_BASE,
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Version': '2021-07-28' // Required API version
    }
  });
};

/**
 * Formats a phone number to E.164 format
 */
const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add US country code if not present
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  return `+${cleaned}`;
};

/**
 * Exports property data to GHL as a contact
 */
export const exportToGHL = async (propertyData: PropertyData): Promise<void> => {
  const token = localStorage.getItem('ghl_access_token');
  const locationId = localStorage.getItem('ghl_location_id');

  if (!token || !locationId) {
    throw new Error('GHL authentication required');
  }

  if (isTokenExpired()) {
    throw new Error('GHL token expired');
  }

  const client = createGHLClient();

  // Split agent name into first and last name
  const [firstName = '', lastName = ''] = (propertyData.listingAgent.name || '').split(' ');

  try {
    await client.post('/contacts/', {
      // Contact Information (from Listing Agent)
      firstName,
      lastName,
      name: propertyData.listingAgent.name,
      //email: propertyData.listingAgent.email,
      phone: propertyData.listingAgent.phone !== 'N/A' 
        ? formatPhoneNumber(propertyData.listingAgent.phone)
        : null,
      
      // Location Details
      locationId,
      
      // Property Address
      address1: propertyData.address,
      city: propertyData.city,
      state: propertyData.state,
      postalCode: propertyData.zipCode,
      country: 'US',
      
      // Additional Details
      companyName: propertyData.listingAgent.brokerName || null,
      source: 'AIRES Property Finder',
      
      // Tags for categorization
      tags: ['Property Listing', propertyData.propertyType],

      
    });
  } catch (error) {
    console.error('Error exporting to GHL:', error);
    throw error;
  }
};
