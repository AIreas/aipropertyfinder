/**
 * Utility module for Go High Level (GHL) integration
 * Handles exporting property data to GHL via OAuth API
 */

const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

export const exportToGHL = async (propertyData: any) => {
  const token = localStorage.getItem('ghl_access_token');
  const locationId = localStorage.getItem('ghl_location_id');
  //const token = 'pit-542a5d73-bb70-4f1f-8755-d801fe764986';
  //const locationId = "5YrB6A0F3YI4XSvjfD25";

  console.log('GHL Access Token:', token);
  console.log('GHL Location ID:', locationId);
  
  if (!token || !locationId) {
    throw new Error('GHL authentication required');
  }

  try {
    const response = await fetch(`${GHL_API_URL}?locationId=${locationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Version': "2021-07-28",
      },
      body: JSON.stringify({
        contact: {
          type: 'property_listing',
          address: propertyData.address,
          custom_field: {
            property_price: propertyData.price,
            beds: propertyData.beds,
            baths: propertyData.baths,
            sqft: propertyData.sqft,
            property_type: propertyData.propertyType,
            listing_agent_name: propertyData.listingAgent.name,
            listing_agent_phone: propertyData.listingAgent.phone,
            listing_agent_email: propertyData.listingAgent.email,
            property_image_url: propertyData.imageUrl,
            year_built: propertyData.yearBuilt
          },
        },
      }),
    });
    
    return response.json();
  } catch (error) {
    console.error('Error exporting to GHL:', error);
    throw error;
  }
};