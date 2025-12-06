import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar autenticación para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    // Si no hay token, redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Si está en login y ya está autenticado, redirigir a dashboard
  if (request.nextUrl.pathname === '/login') {
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};

