import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl;
  
  // Skip if already on API route or static files
  if (url.pathname.startsWith('/api') || 
      url.pathname.startsWith('/_next') || 
      url.pathname.startsWith('/assets') ||
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
    // Rewrite to subdomain API
    return NextResponse.rewrite(new URL(`/api/subdomain/${subdomain}${url.pathname}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
  ],
};
