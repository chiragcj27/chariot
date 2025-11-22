import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    
    console.log(`[Next.js API] Download request for productId: ${productId}`);
    
    // Get the access token from Authorization header
    const authHeader = req.headers.get('authorization');
    let accessToken = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    
    if (!accessToken) {
      console.log('[Next.js API] No access token provided');
      return NextResponse.json({ 
        message: 'No token provided - please login again',
        needsLogin: true
      }, { status: 401 });
    }

    // Forward the request to the backend API
    const baseBackendUrl = process.env.BACKEND_API_URL || 'http://localhost:3001';
    
    if (!process.env.BACKEND_API_URL) {
      console.error('[Next.js API] BACKEND_API_URL environment variable is not set!');
      return NextResponse.json(
        { 
          message: 'Server configuration error: Backend API URL not configured',
          error: 'BACKEND_API_URL environment variable is missing'
        },
        { status: 500 }
      );
    }
    
    const backendUrl = `${baseBackendUrl}/api/assets/digital-product/${productId}/download`;
    
    console.log(`[Next.js API] Forwarding request to: ${backendUrl}`);
    
    let response: Response;
    let timeoutId: NodeJS.Timeout | null = null;
    try {
      // Add timeout to fetch request (30 seconds)
      const controller = new AbortController();
      timeoutId = setTimeout(() => controller.abort(), 30000);
      
      response = await fetch(backendUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      if (timeoutId) clearTimeout(timeoutId);
    } catch (fetchError: unknown) {
      if (timeoutId) clearTimeout(timeoutId);
      
      const error = fetchError as Error & { code?: string; name?: string };
      
      if (error.name === 'AbortError') {
        console.error('[Next.js API] Request timeout when connecting to backend');
        return NextResponse.json(
          { 
            message: 'Request timeout: Backend server did not respond in time',
            error: 'Connection timeout'
          },
          { status: 504 }
        );
      }
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        console.error('[Next.js API] Connection refused - backend server may be down:', backendUrl);
        return NextResponse.json(
          { 
            message: 'Cannot connect to backend server',
            error: 'Connection refused. Please check if the backend API is running.',
            backendUrl: process.env.NODE_ENV === 'development' ? backendUrl : undefined
          },
          { status: 503 }
        );
      }
      
      console.error('[Next.js API] Fetch error:', {
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      
      throw fetchError;
    }

    // Try to parse response, but handle cases where response might not be JSON
    let data: unknown;
    try {
      const text = await response.text();
      if (!text) {
        data = {};
      } else {
        data = JSON.parse(text);
      }
    } catch (parseError) {
      console.error('[Next.js API] Failed to parse backend response:', parseError);
      return NextResponse.json(
        { 
          message: 'Invalid response from backend server',
          error: 'Response parsing failed'
        },
        { status: 500 }
      );
    }
    
    if (!response.ok) {
      console.error(`[Next.js API] Backend error (${response.status}):`, data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`[Next.js API] Successfully forwarded download request`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Next.js API] Error in digital product download route:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      productId: await params.then(p => p.productId).catch(() => 'unknown')
    });
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
