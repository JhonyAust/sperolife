// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if the path is an admin route
  const isAdminRoute = path.startsWith('/admin/admin-portal-slrhs-25');
  
  if (isAdminRoute) {
    const token = request.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/admin-portal-slrhs-25/:path*',
};