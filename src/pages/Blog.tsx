import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';
import { blogPosts as fallbackPosts } from '@/data/blogPosts';
import { supabase, SupabaseBlogPost } from '@/lib/supabase';

interface DisplayPost {
  slug: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  excerpt: string;
  coverImageUrl?: string | null;
}

function toDisplayPost(p: SupabaseBlogPost): DisplayPost {
  return {
    slug: p.slug,
    category: p.pillar,
    title: p.title,
    date: new Date(p.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    readTime: p.read_time,
    excerpt: p.excerpt,
    coverImageUrl: p.cover_image_url,
  };
}

const TABS = [
  { label: 'Todos', value: '' },
  { label: 'Systems Thinking', value: 'Systems Thinking' },
  { label: 'Founder Systems', value: 'Founder Systems' },
  { label: 'Liderazgo', value: 'Liderazgo' },
];

const Blog = () => {
  const [posts, setPosts] = useState<DisplayPost[]>(
    fallbackPosts.map((p) => ({
      slug: p.slug,
      category: p.category,
      title: p.title,
      date: p.date,
      readTime: p.readTime,
      excerpt: p.excerpt,
    }))
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setPosts((data as SupabaseBlogPost[]).map(toDisplayPost));
        }
        setLoading(false);
      });
  }, []);

  const filtered = activeTab ? posts.filter((p) => p.category === activeTab) : posts;

  return (
    <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
      <Helmet>
        <title>Blog | Francisco Abad</title>
        <meta name="description" content="Ideas sobre sistemas, crecimiento y ejecución aplicada para founders y operators." />
      </Helmet>
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] md:text-[44px] mb-3">
              Dentro del Sistema
            </h1>
            <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] max-w-[560px] leading-relaxed">
              Ideas sobre sistemas, crecimiento y ejecución. Basadas en experiencia real, no en teoría.
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="font-montserrat font-medium text-[12px] uppercase tracking-[1px] px-4 py-2 rounded-full border transition-colors duration-200"
                style={{
                  backgroundColor: activeTab === tab.value ? '#9B3D28' : 'transparent',
                  borderColor: activeTab === tab.value ? '#9B3D28' : 'rgba(138,130,121,0.3)',
                  color: activeTab === tab.value ? '#fff' : '#8A8279',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-[hsl(var(--bg-elevated))] rounded-lg border border-[hsl(var(--border-subtle))] overflow-hidden animate-pulse"
                >
                  <div className="aspect-video bg-[hsl(var(--border-subtle))]" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-24 bg-[hsl(var(--border-subtle))] rounded-full" />
                    <div className="h-4 w-full bg-[hsl(var(--border-subtle))] rounded" />
                    <div className="h-4 w-4/5 bg-[hsl(var(--border-subtle))] rounded" />
                    <div className="h-3 w-28 bg-[hsl(var(--border-subtle))] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((post) => (
                <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                  <article className="bg-[hsl(var(--bg-elevated))] rounded-lg overflow-hidden border border-[hsl(var(--border-subtle))] hover:border-[hsl(var(--ember))] transition-colors duration-300 h-full">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="aspect-video w-full object-cover border-b border-[hsl(var(--border-subtle))]"
                      />
                    ) : (
                      <div className="aspect-video bg-[hsl(var(--bg-primary))] border-b border-[hsl(var(--border-subtle))]" />
                    )}
                    <div className="p-6 space-y-3">
                      <span className="inline-block bg-[hsl(var(--ember))] text-[hsl(var(--text-primary))] font-montserrat font-semibold text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full">
                        {post.category}
                      </span>
                      <h3 className="font-montserrat font-semibold text-[hsl(var(--text-primary))] text-[16px] leading-snug group-hover:text-[hsl(var(--ember))] transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-relaxed">
                        {post.excerpt}
                      </p>
                      <p className="font-inter text-[hsl(var(--text-muted))] text-[12px] tracking-wide">
                        {post.date} · {post.readTime} de lectura
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
              {filtered.length === 0 && (
                <p className="font-inter text-[hsl(var(--text-muted))] text-[14px] col-span-2 py-8">
                  No hay posts en esta categoría todavía.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
