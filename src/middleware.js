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
  const subdomain = hostname.replace(`.${mainDomain}`, '').replace(`www.`, '');
  
  // If subdomain exists and is not www or main domain
  if (subdomain && subdomain !== mainDomain && subdomain !== 'www' && !hostname.includes('localhost')) {
    // Rewrite to preview API
    const newUrl = url.clone();
    newUrl.pathname = `/api/subdomain/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(newUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
