import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  
  // Rutas que requieren protección
  const isAdminPath = url.pathname.startsWith('/admin');
  
  // Protegemos mutaciones en /api/battles y /api/teams
  // Los GET a estas rutas seguirán siendo públicos para que la app principal funcione.
  const isProtectedApi = 
    (url.pathname.startsWith('/api/battles') || url.pathname.startsWith('/api/teams')) && 
    (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE');

  if (isAdminPath || isProtectedApi) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Leemos de variables de entorno, NUNCA hardcodeado
      const expectedUser = process.env.ADMIN_USERNAME;
      const expectedPwd = process.env.ADMIN_PASSWORD;

      // Si las variables de entorno están configuradas y coinciden
      if (expectedUser && expectedPwd && user === expectedUser && pwd === expectedPwd) {
        return NextResponse.next();
      }
    }
    
    // Si no hay auth o es incorrecto, pedimos credenciales (popup nativo)
    return new NextResponse('Auth required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  // Optimizamos el matcher para que el middleware solo se ejecute en estas rutas clave
  matcher: ['/admin/:path*', '/api/battles/:path*', '/api/teams/:path*'],
};
