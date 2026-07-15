import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, request }, next) => {
  const pathname = url.pathname;
  const isOSRoute = pathname.startsWith('/os');
  const isBrainAPI = pathname.startsWith('/api/brain');
  const isOSAPI = pathname.startsWith('/api/os/');
  const isLoginPage = pathname === '/os/login' || pathname === '/os/login/';
  const isAuthAPI = pathname.startsWith('/api/os-auth');

  if ((isOSRoute || isBrainAPI || isOSAPI) && !isLoginPage && !isAuthAPI) {
    // Acceso server-to-server (n8n, Hermes): Bearer con OS_API_TOKEN u OS_AUTH_TOKEN,
    // o header X-OS-Token con OS_API_TOKEN (escrituras externas: balanza Renpho, Fitbit).
    if (isOSAPI || isBrainAPI) {
      const auth = request.headers.get('authorization') ?? '';
      const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      const xToken = request.headers.get('x-os-token');
      const apiToken = import.meta.env.OS_API_TOKEN;
      const authToken = import.meta.env.OS_AUTH_TOKEN;
      if (bearer && ((apiToken && bearer === apiToken) || (authToken && bearer === authToken))) {
        return next();
      }
      if (xToken && apiToken && xToken === apiToken) {
        return next();
      }
    }

    const token = cookies.get('os_auth')?.value;
    const expectedToken = import.meta.env.OS_AUTH_TOKEN;
    if (!expectedToken || !token || token !== expectedToken) {
      return redirect('/os/login');
    }
  }

  return next();
});
