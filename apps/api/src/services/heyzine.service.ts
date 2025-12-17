import axios from "axios";

const clientId = process.env.HEYZINE_CLIENT_ID;
const isDevelopment = process.env.NODE_ENV === 'development';

// Interface for Heyzine API response
interface HeyzineResponse {
  url?: string;
  error?: string;
  success?: boolean;
}

export const heyzineService = {
  async generateFlipbook(pdfUrl: string): Promise<HeyzineResponse> {
    try {
      
      const response = await axios.post(`https://heyzine.com/api1/rest`, {
        pdf: pdfUrl,
        client_id: clientId,
        full_screen: true,
        download: true,
      });

      if (response.data && response.data.url) {
        return {
          url: response.data.url,
          success: true
        };
      } else {
        console.warn('Heyzine API response does not contain URL:', response.data);
        return {
          error: 'No URL in response',
          success: false
        };
      }
    } catch (error: unknown) {
      console.error('Error generating flipbook:', error);
      
      if (axios.isAxiosError(error)) {
        return {
          error: error.response?.data?.message || error.message,
          success: false
        };
      }
      
      return {
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }
};