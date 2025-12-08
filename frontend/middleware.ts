import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Privy maneja la autenticación del lado del cliente
  // El middleware solo redirige basado en el token JWT del backend si existe
  
  // Verificar autenticación para rutas protegidas
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Verificar token JWT del backend (almacenado en localStorage, no en cookies)
    // Como no podemos acceder a localStorage en middleware, dejamos que Privy lo maneje
    // El componente del dashboard verificará la autenticación
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};

