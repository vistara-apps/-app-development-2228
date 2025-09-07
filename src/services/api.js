import axios from 'axios';

// Base API configuration
const createApiClient = (baseURL, headers = {}) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    timeout: 10000,
  });
};

// OpenAI API client
export const openaiClient = createApiClient('https://api.openai.com/v1', {
  'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
});

// Supabase API client
export const supabaseClient = createApiClient(import.meta.env.VITE_SUPABASE_URL, {
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
});

// Football Data API client
export const footballClient = createApiClient(import.meta.env.VITE_FOOTBALL_API_URL, {
  'X-Auth-Token': import.meta.env.VITE_FOOTBALL_API_KEY,
});

// Payment API client
export const paymentClient = createApiClient(import.meta.env.VITE_PAYMENT_API_URL);

// Error handler for API calls
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    throw new Error(data?.message || `API Error: ${status}`);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error('Network error: Please check your connection');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

// Generic API call wrapper with error handling
export const apiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
