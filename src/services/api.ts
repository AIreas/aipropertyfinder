import axios, { AxiosError } from 'axios';
import { SearchParams } from '../types';

const RAPID_API_KEY = import.meta.env.VITE_RAPID_API_KEY;
const RAPID_API_HOST = import.meta.env.VITE_RAPID_API_HOST;

export const propertyApi = axios.create({
  baseURL: `https://${RAPID_API_HOST}`,
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': RAPID_API_HOST,
  },
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    throw {
      message: axiosError.message,
      status: axiosError.response?.status,
      data: axiosError.response?.data
    };
  }
  throw { message: 'An unexpected error occurred' };
};

// Property type mapping with API parameters
const propertyTypeMap = {
  'Houses': 'isSingleFamily',
  'Apartments': 'isApartment',
  'Condos': 'isCondo',
  'Townhomes': 'isTownhouse',
  'Manufactured': 'isManufactured',
  'Lots/Land': 'isLotLand',
  'Multi-family': 'isMultiFamily'
};

// All property type parameters
const allPropertyTypes = Object.values(propertyTypeMap);

const mapProperty = (property: any) => ({
  id: property.zpid,
  address: property.streetAddress,
  city: property.city,
  state: property.state,
  zipCode: property.zipcode,
  price: property.price || 0,
  beds: property.bedrooms || 0,
  baths: property.bathrooms || 0,
  sqft: property.livingArea || 0,
  imageUrl: property.imgSrc || 'https://via.placeholder.com/400x300?text=No+Image',
  propertyType: property.homeType,
  zestimate: property.zestimate,
  taxValue: property.taxAssessedValue,
  zillowLink: `https://www.zillow.com/homedetails/${property.zpid}`,
  lotSize: property.lotSize,
  yearBuilt: property.yearBuilt || null,
  description: property.description,
  listingAgent: {
    name: 'Loading...',
    brokerName: 'Loading...',
    phone: 'Loading...',
    email: 'Loading...',
    photo: null
  }
});

const getListingAgentDetails = async (zpid: string) => {
  try {
    await delay(500);
    const response = await propertyApi.get('/propertyV2', {
      params: { zpid }
    });

    const propertyData = response.data?.data || {};
    const yearBuilt = response.data?.yearBuilt;
    const attributionInfo = response.data?.attributionInfo || {};
    
    return {
      name: attributionInfo.agentName || 'N/A',
      brokerName: attributionInfo.brokerName || 'N/A',
      phone: attributionInfo.agentPhoneNumber || 'N/A',
      email: attributionInfo.agentEmail || 'N/A',
      photo: null,
      yearBuilt: yearBuilt || null
    };
  } catch (error) {
    console.warn('Failed to fetch agent details:', error);
    return {
      name: 'N/A',
      brokerName: 'N/A',
      phone: 'N/A',
      email: 'N/A',
      photo: null
    };
  }
};

export const searchProperties = async (params: SearchParams) => {
  try {
    // Initialize all property types as false
    const propertyTypeParams = Object.fromEntries(
      allPropertyTypes.map(type => [type, false])
    );

    // If specific types are selected, set only those to true
    if (params.homeType.length > 0) {
      params.homeType.forEach(type => {
        if (propertyTypeMap[type]) {
          propertyTypeParams[propertyTypeMap[type]] = true;
        }
      });
    } else {
      // If no types selected, set all to true to show everything
      Object.keys(propertyTypeParams).forEach(key => {
        propertyTypeParams[key] = true;
      });
    }

    const response = await propertyApi.get('/search', {
      params: {
        location: `${params.location}, ${params.state}`,
        status: 'forSale',
        page: '1',
        price_min: params.minPrice || '0',
        price_max: params.maxPrice || '10000000',
        beds_min: params.beds || '0',
        baths_min: params.baths || '0',
        sqft_min: params.minSqft || '0',
        sqft_max: params.maxSqft || '10000000',
        ...propertyTypeParams,
      }
    });

    const properties = (response.data.results || []).map(mapProperty);

    return {
      properties,
      total: response.data.totalResultCount || 0,
      loadAgentDetails: async (onAgentDetailsLoaded: (propertyId: string, agentDetails: any) => void) => {
        for (const property of properties) {
          const agentDetails = await getListingAgentDetails(property.id);
          if (agentDetails.yearBuilt) {
            property.yearBuilt = agentDetails.yearBuilt;
          }
          onAgentDetailsLoaded(property.id, agentDetails);
        }
      }
    };
  } catch (error) {
    handleError(error);
  }
};

export const getPropertyDetails = async (propertyId: string) => {
  try {
    const [propertyResponse, agentDetails] = await Promise.all([
      propertyApi.get('/propertyV2', {
        params: { zpid: propertyId }
      }),
      getListingAgentDetails(propertyId)
    ]);

    const data = propertyResponse.data?.data;
    return {
      id: propertyId,
      address: data?.address?.streetAddress,
      city: data?.address?.city,
      state: data?.address?.state,
      zipCode: data?.address?.zipcode,
      price: data?.list_price || 0,
      beds: data?.bedrooms,
      baths: data?.bathrooms,
      sqft: data?.living_area,
      lotSize: data?.lot_size,
      imageUrl: data?.photos?.[0] || 'https://via.placeholder.com/600x400?text=No+Image+Available',
      propertyType: data?.home_type,
      neighborhood: data?.address?.neighborhood,
      subdivision: data?.address?.subdivision,
      yearBuilt: data?.year_built,
      description: data?.description || 'No description available.',
      listingAgent: agentDetails
    };
  } catch (error) {
    handleError(error);
  }
};