import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const baseUrl = 'https://franciscoabad.com';

  const staticPages = [
    `${baseUrl}/`,
    `${baseUrl}/sobre-mi/`,
    `${baseUrl}/trabaja-conmigo/`,
    `${baseUrl}/contacto/`,
    `${baseUrl}/blog/`,
  ];

  const blogPages = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map(post => `${baseUrl}/blog/${post.data.slug}/`);

  const content = [
    '# llms-full.txt',
    '# Lista completa de URLs canónicas para crawlers de IA',
    '# Generado automaticamente desde content collections',
    '',
    ...staticPages,
    ...blogPages,
  ].join('\n');

  return new Response(content, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
