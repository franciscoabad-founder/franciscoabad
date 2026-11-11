import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const baseUrl = 'https://franciscoabad.com';
  const buildDate = new Date().toISOString();

  const staticPages = [
    { url: `${baseUrl}/`,                   priority: '1.0', changefreq: 'weekly',  lastmod: buildDate },
    { url: `${baseUrl}/blog/`,              priority: '0.9', changefreq: 'weekly',  lastmod: buildDate },
    { url: `${baseUrl}/about/`, priority: '0.8', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/portfolio/`, priority: '0.8', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/talks/`, priority: '0.7', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/work-with-me/`, priority: '0.7', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/contact/`, priority: '0.7', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/es/`, priority: '0.6', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/es/sobre-mi/`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/es/trabaja-conmigo/`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/es/portafolio/`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/es/blog/`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
    { url: `${baseUrl}/es/contacto/`, priority: '0.5', changefreq: 'monthly', lastmod: buildDate },
  ];

  const blogPages = posts
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map(post => ({
      url:        `${baseUrl}/blog/${post.data.slug}/`,
      priority:   '0.8',
      changefreq: 'monthly',
      lastmod:    post.data.pubDate.toISOString(),
    }));

  const allPages = [...staticPages, ...blogPages];

  const urls = allPages
    .map(
      p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(content, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
