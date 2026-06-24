import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  const pathname = url.pathname;
  const isOSRoute = pathname.startsWith('/os');
  const isBrainAPI = pathname.startsWith('/api/brain');
  const isOSAPI = pathname.startsWith('/api/os/');
  const isLoginPage = pathname === '/os/login' || pathname === '/os/login/';
  const isAuthAPI = pathname.startsWith('/api/os-auth');

  if ((isOSRoute || isBrainAPI || isOSAPI) && !isLoginPage && !isAuthAPI) {
    const token = cookies.get('os_auth')?.value;
    const expectedToken = import.meta.env.OS_AUTH_TOKEN;
    if (!expectedToken || !token || token !== expectedToken) {
      return redirect('/os/login');
    }
  }

  return next();
});
