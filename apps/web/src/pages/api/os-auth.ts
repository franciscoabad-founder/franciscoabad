export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const password = formData.get('password')?.toString() ?? '';

  const expectedPassword = import.meta.env.OS_PASSWORD;
  const authToken = import.meta.env.OS_AUTH_TOKEN;

  if (!expectedPassword || !authToken || password !== expectedPassword) {
    return redirect('/os/login?error=1');
  }

  cookies.set('os_auth', authToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return redirect('/os');
};

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  if (url.searchParams.get('action') === 'logout') {
    cookies.delete('os_auth', { path: '/' });
    return redirect('/os/login');
  }
  return redirect('/os');
};
