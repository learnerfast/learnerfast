import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { siteId } = await params;
  const url = new URL(request.url);
  
  // Remove hash from URL if present
  if (url.hash) {
    const cleanUrl = new URL(`/api/preview/${siteId}/home`, `${url.protocol}//${url.host}`);
    return NextResponse.redirect(cleanUrl);
  }
  
  // Redirect to catch-all route for home page
  return NextResponse.redirect(new URL(`/api/preview/${siteId}/home`, `${url.protocol}//${url.host}`));
}