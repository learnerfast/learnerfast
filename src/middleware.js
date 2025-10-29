import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  console.log('[MIDDLEWARE]', {
    method: request.method,
    pathname: url.pathname,
    hostname,
    origin: request.headers.get('origin')
  });
  
  // Skip API routes entirely - they handle their own CORS
  if (url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/assets') ||
      url.pathname.startsWith('/js') ||
      url.pathname.startsWith('/templates')) {
    console.log('[MIDDLEWARE] Skipping:', url.pathname);
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
    return NextResponse.rewrite(new URL(`/api/subdomain/${subdomain}${url.pathname}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
    '/((?!api/).*)',
  ],
};
