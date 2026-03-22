import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
  body: string;
  coverImageUrl?: string | null;
}

function toDisplayPost(p: SupabaseBlogPost): DisplayPost {
  return {
    slug: p.slug,
    category: p.pillar,
    title: p.title,
    date: new Date(p.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    readTime: p.read_time,
    body: p.body,
    coverImageUrl: p.cover_image_url,
  };
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<DisplayPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setPost(toDisplayPost(data as SupabaseBlogPost));
        } else {
          // Fall back to hardcoded data
          const fallback = fallbackPosts.find((p) => p.slug === slug);
          if (fallback) {
            setPost({
              slug: fallback.slug,
              category: fallback.category,
              title: fallback.title,
              date: fallback.date,
              readTime: fallback.readTime,
              body: fallback.body,
            });
          } else {
            setNotFound(true);
          }
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
        <Navbar />
        <div className="pt-32 pb-24">
          <div className="max-w-[780px] mx-auto px-6 lg:px-8 animate-pulse space-y-6">
            <div className="h-4 w-16 bg-[hsl(var(--border-subtle))] rounded" />
            <div className="h-8 w-3/4 bg-[hsl(var(--border-subtle))] rounded" />
            <div className="h-8 w-1/2 bg-[hsl(var(--border-subtle))] rounded" />
            <div className="h-3 w-32 bg-[hsl(var(--border-subtle))] rounded" />
            <div className="aspect-video bg-[hsl(var(--border-subtle))] rounded-lg" />
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-[hsl(var(--border-subtle))] rounded w-full" />
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
        <Navbar />
        <div className="pt-32 pb-24 max-w-[1200px] mx-auto px-6 lg:px-8 text-center">
          <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[36px] mb-6">
            Post no encontrado
          </h1>
          <Link
            to="/blog"
            className="font-montserrat text-[13px] uppercase tracking-[1px] text-[hsl(var(--ember))] hover:opacity-80 transition-opacity"
          >
            ← Volver al blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
      <Navbar />

      <article className="pt-32 pb-24">
        <div className="max-w-[780px] mx-auto px-6 lg:px-8">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-montserrat text-[13px] uppercase tracking-[1px] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--ember))] transition-colors duration-300 mb-12"
          >
            <ArrowLeft size={14} />
            Blog
          </Link>

          {/* Header */}
          <div className="mb-10">
            <span className="inline-block bg-[hsl(var(--ember))] text-[hsl(var(--text-primary))] font-montserrat font-semibold text-[10px] uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-6">
              {post.category}
            </span>
            <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[32px] md:text-[40px] leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 font-inter text-[hsl(var(--text-muted))] text-[13px]">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime} de lectura</span>
            </div>
          </div>

          {/* Cover image or placeholder */}
          {post.coverImageUrl ? (
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-lg border border-[hsl(var(--border-subtle))] mb-12"
            />
          ) : (
            <div className="aspect-video bg-[hsl(var(--bg-elevated))] rounded-lg border border-[hsl(var(--border-subtle))] mb-12" />
          )}

          {/* Body */}
          <div className="font-inter text-[hsl(var(--text-secondary))] text-[17px] leading-[1.85] space-y-6">
            {post.body.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default BlogPost;
