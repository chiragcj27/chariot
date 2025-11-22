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
    const backendUrl = `${baseBackendUrl}/api/assets/digital-product/${productId}/download`;
    
    console.log(`[Next.js API] Forwarding request to: ${backendUrl}`);
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
    });

    const data = await response.json();
    
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
