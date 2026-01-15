import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Handle OPTIONS requests for CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
  
  // Skip API routes entirely - they handle their own CORS
  if (url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/js') ||
      url.pathname.startsWith('/templates')) {
    return NextResponse.next();
  }
  
  // Check if it's a subdomain (not www or main domain)
  const mainDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || 'learnerfast.com';
  const isProduction = hostname.includes(mainDomain);
  const subdomain = isProduction 
    ? hostname.replace(`.${mainDomain}`, '').replace(`www.`, '')
    : hostname.split('.')[0];
  
  // If subdomain exists and is not www or main domain
  if (subdomain && subdomain !== mainDomain && subdomain !== 'www' && !hostname.includes('localhost')) {
    // Redirect root to /home, otherwise rewrite to subdomain API
    if (url.pathname === '/') {
      return NextResponse.redirect(new URL(`https://${hostname}/home`, request.url));
    }
    const response = NextResponse.rewrite(new URL(`/api/subdomain/${subdomain}${url.pathname}`, request.url));
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://checkout.razorpay.com blob:; connect-src 'self' https://*.supabase.co https://www.learnerfast.com https://learnerfast.com https://api.razorpay.com https://lumberjack-cx.razorpay.com wss://*.supabase.co; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; frame-src 'self';");
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
