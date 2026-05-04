import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  Bold, Italic, Heading2, Heading3, Quote, Code2,
  List, ListOrdered, Link2, Minus, ArrowLeft,
} from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import TiptapLink from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { supabase } from '@/lib/supabase';
import type { BlogPost, BlogPostStatus } from '@/lib/supabase';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: BlogPostStatus; label: string }[] = [
  { value: 'draft',     label: 'Borrador' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived',  label: 'Archivado' },
];

const STATUS_BADGE: Record<BlogPostStatus, { color: string; bg: string; label: string }> = {
  draft:     { color: '#8A8279', bg: 'rgba(138,130,121,0.15)', label: 'Borrador' },
  published: { color: '#9B3D28', bg: 'rgba(155, 61, 40,0.12)',  label: 'Publicado' },
  archived:  { color: '#4A4541', bg: 'rgba(74,69,65,0.3)',     label: 'Archivado' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function calcReadingTime(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  return Math.ceil(Math.max(words, 1) / 200);
}

// ─── Shared input style ───────────────────────────────────────────────────────

const inputSx: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: '6px',
  backgroundColor: '#141414', border: '1px solid #2A2A2A',
  color: '#F4EDE6', fontSize: '14px', fontFamily: 'Inter, sans-serif',
  outline: 'none', boxSizing: 'border-box',
};

const labelSx: React.CSSProperties = {
  display: 'block', marginBottom: '4px',
  fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
  fontFamily: 'Montserrat, sans-serif', color: '#8A8279',
};

// ─── Form state ───────────────────────────────────────────────────────────────

interface MetaForm {
  title: string;
  slug: string;
  pillar: string;
  excerpt: string;
  cover_image_url: string;
  status: BlogPostStatus;
}

const EMPTY_META: MetaForm = {
  title: '', slug: '', pillar: '', excerpt: '',
  cover_image_url: '', status: 'draft',
};

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '5px 7px', borderRadius: '4px', cursor: 'pointer',
        color: active ? '#9B3D28' : '#8A8279',
        backgroundColor: active ? 'rgba(155, 61, 40,0.12)' : 'transparent',
        border: 'none',
      }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return (
    <span style={{ width: '1px', height: '18px', backgroundColor: '#2A2A2A', margin: '0 2px' }} />
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BlogPostStatus }) {
  const { color, bg, label } = STATUS_BADGE[status];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      backgroundColor: bg, color, fontSize: '12px', fontFamily: 'Inter, sans-serif',
    }}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BlogEditor() {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState<MetaForm>(EMPTY_META);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Refs for auto-save (always current without re-creating interval)
  const isDirtyRef = useRef(false);
  const formRef = useRef(form);
  formRef.current = form;
  const editingPostRef = useRef(editingPost);
  editingPostRef.current = editingPost;
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savePostRef = useRef<((opts?: { publish?: boolean }) => Promise<void>) | null>(null);

  // ── Tiptap editor ───────────────────────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      TiptapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Empieza a escribir tu post...' }),
    ],
    onUpdate: () => { isDirtyRef.current = true; },
  });

  const editorRef = useRef(editor);
  editorRef.current = editor;

  // Set editor content when post changes or editor mounts
  const prevPostIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (!editor || view !== 'editor') return;
    const incomingId = editingPost?.id ?? null;
    if (incomingId === prevPostIdRef.current) return;
    prevPostIdRef.current = incomingId;
    editor.commands.setContent((editingPost?.body_tiptap as object | null) ?? '');
    isDirtyRef.current = false;
  }, [editor, view, editingPost?.id]);

  // ── Data fetching ───────────────────────────────────────────────────────────

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setPosts(data as BlogPost[]);
    setLoading(false);
  }

  useEffect(() => { fetchPosts(); }, []);

  // ── Save function ───────────────────────────────────────────────────────────

  const savePost = async (opts?: { publish?: boolean }) => {
    const ed = editorRef.current;
    const f = formRef.current;
    const ep = editingPostRef.current;
    if (!ed) return;

    setSaveStatus('saving');

    const json = ed.getJSON();
    const html = ed.getHTML();
    const text = ed.getText();
    const readingTime = calcReadingTime(text);
    const isPublish = opts?.publish;
    const newStatus: BlogPostStatus = isPublish ? 'published' : f.status;
    const publishedAt = isPublish && !ep?.published_at
      ? new Date().toISOString()
      : ep?.published_at ?? null;

    const payload = {
      title: f.title.trim() || 'Sin título',
      slug: f.slug.trim() || toSlug(f.title) || `post-${Date.now()}`,
      pillar: f.pillar.trim() || null,
      excerpt: f.excerpt.trim() || null,
      cover_image_url: f.cover_image_url.trim() || null,
      status: newStatus,
      body_tiptap: json,
      body_html: html,
      reading_time: readingTime,
      published_at: publishedAt,
    };

    let error = null;
    if (ep) {
      ({ error } = await supabase.from('blog_posts').update(payload).eq('id', ep.id));
    } else {
      const { data, error: insertError } = await supabase
        .from('blog_posts').insert(payload).select().single();
      error = insertError;
      if (!insertError && data) {
        setEditingPost(data as BlogPost);
        editingPostRef.current = data as BlogPost;
      }
    }

    isDirtyRef.current = false;

    if (!error) {
      if (isPublish) setForm(f => ({ ...f, status: 'published' }));
      setSaveStatus('saved');
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('idle');
    }
  };

  // Keep savePostRef current on every render
  savePostRef.current = savePost;

  // ── Auto-save interval ──────────────────────────────────────────────────────

  useEffect(() => {
    if (view !== 'editor') return;
    const interval = setInterval(() => {
      const f = formRef.current;
      const ed = editorRef.current;
      if (isDirtyRef.current && (f.title.trim() || ed?.getText().trim())) {
        savePostRef.current?.();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [view]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  function openCreate() {
    setEditingPost(null);
    setForm(EMPTY_META);
    setSlugManuallyEdited(false);
    prevPostIdRef.current = undefined;
    setView('editor');
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      pillar: post.pillar ?? '',
      excerpt: post.excerpt ?? '',
      cover_image_url: post.cover_image_url ?? '',
      status: post.status,
    });
    setSlugManuallyEdited(true);
    prevPostIdRef.current = undefined;
    setView('editor');
  }

  function handleTitleChange(title: string) {
    setForm(f => ({
      ...f, title,
      slug: slugManuallyEdited ? f.slug : toSlug(title),
    }));
    isDirtyRef.current = true;
  }

  function handleSlugChange(slug: string) {
    setSlugManuallyEdited(true);
    setForm(f => ({ ...f, slug }));
  }

  async function quickChangeStatus(post: BlogPost) {
    if (post.status === 'draft') {
      await supabase.from('blog_posts').update({
        status: 'published',
        published_at: post.published_at ?? new Date().toISOString(),
      }).eq('id', post.id);
    } else if (post.status === 'published') {
      await supabase.from('blog_posts').update({ status: 'archived' }).eq('id', post.id);
    }
    fetchPosts();
  }

  function handleBack() {
    setView('list');
    fetchPosts();
  }

  // ── Toolbar helpers ─────────────────────────────────────────────────────────

  function handleLink() {
    if (!editor) return;
    const current = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt(
      editor.isActive('link')
        ? 'URL del enlace (vacío para eliminar):'
        : 'URL del enlace:',
      current ?? 'https://'
    );
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }

  // ── Render: list view ───────────────────────────────────────────────────────

  if (view === 'list') {
    return (
      <div className="p-8" style={{ minHeight: '100vh', backgroundColor: '#141414' }}>
        <div className="flex items-center justify-between mb-8">
          <h1 style={{ fontFamily: 'Montserrat, sans-serif', color: '#F4EDE6', fontSize: '22px', fontWeight: 600 }}>
            Blog Editor
          </h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#9B3D28', color: '#F4EDE6', fontFamily: 'Inter, sans-serif' }}
          >
            <Plus size={15} />
            Nuevo post
          </button>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #2A2A2A', backgroundColor: '#1E1E1E' }}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 rounded-full border-2 border-[#9B3D28] border-t-transparent animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p style={{ color: '#6B6B6B', fontFamily: 'Inter, sans-serif', fontSize: '14px' }}>
                No hay posts todavía
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  {['Título', 'Status', 'Pillar', 'Publicado', 'Lectura', ''].map((h, i) => (
                    <TableHead
                      key={i}
                      className="h-10"
                      style={{
                        color: '#8A8279', fontSize: '11px', letterSpacing: '0.08em',
                        textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif',
                        borderBottom: '1px solid #2A2A2A',
                      }}
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map(post => (
                  <TableRow
                    key={post.id}
                    className="border-0 hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid #232323' }}
                  >
                    <TableCell style={{ color: '#F4EDE6', fontFamily: 'Inter, sans-serif', fontSize: '14px', fontWeight: 500 }}>
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={post.status} />
                    </TableCell>
                    <TableCell style={{ color: '#8A8279', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                      {post.pillar ?? '—'}
                    </TableCell>
                    <TableCell style={{ color: '#8A8279', fontFamily: 'Inter, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {post.published_at
                        ? format(parseISO(post.published_at), 'dd MMM yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell style={{ color: '#8A8279', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
                      {post.reading_time ? `${post.reading_time} min` : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(post)}
                          className="px-3 py-1.5 rounded text-xs transition-colors hover:bg-white/10"
                          style={{ color: '#8A8279', border: '1px solid #2A2A2A', fontFamily: 'Inter, sans-serif' }}
                        >
                          Editar
                        </button>
                        {post.status !== 'archived' && (
                          <button
                            onClick={() => quickChangeStatus(post)}
                            className="px-3 py-1.5 rounded text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{
                              backgroundColor: post.status === 'draft' ? 'rgba(155, 61, 40,0.15)' : 'rgba(74,69,65,0.3)',
                              color: post.status === 'draft' ? '#9B3D28' : '#6B6B6B',
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            {post.status === 'draft' ? 'Publicar' : 'Archivar'}
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  }

  // ── Render: editor view ─────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#141414', display: 'flex', flexDirection: 'column' }}>

      {/* Sticky header */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          backgroundColor: '#141414', borderBottom: '1px solid #2A2A2A',
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm transition-colors hover:text-[#F4EDE6]"
          style={{ color: '#8A8279', fontFamily: 'Inter, sans-serif' }}
        >
          <ArrowLeft size={15} />
          Volver a lista
        </button>

        <div className="flex items-center gap-4">
          {saveStatus !== 'idle' && (
            <span style={{ color: '#8A8279', fontSize: '13px', fontFamily: 'Inter, sans-serif' }}>
              {saveStatus === 'saving' ? 'Guardando...' : 'Guardado'}
            </span>
          )}
          {form.status === 'draft' && (
            <button
              onClick={() => savePost({ publish: true })}
              className="px-4 py-1.5 rounded text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(155, 61, 40,0.15)', color: '#9B3D28', fontFamily: 'Inter, sans-serif' }}
            >
              Publicar
            </button>
          )}
          <button
            onClick={() => savePost()}
            className="px-4 py-1.5 rounded text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#9B3D28', color: '#F4EDE6', fontFamily: 'Inter, sans-serif' }}
          >
            Guardar
          </button>
        </div>
      </div>

      {/* Editor + Metadata */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: Tiptap editor (70%) */}
        <div style={{ flex: '0 0 70%', overflowY: 'auto', padding: '32px 40px' }}>

          {/* Toolbar */}
          <div
            className="flex items-center flex-wrap gap-0.5 mb-4 p-2 rounded-lg"
            style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(138,130,121,0.2)' }}
          >
            <ToolbarBtn
              title="Negrita" active={editor?.isActive('bold')}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Cursiva" active={editor?.isActive('italic')}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic size={15} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ToolbarBtn
              title="Encabezado 2" active={editor?.isActive('heading', { level: 2 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <Heading2 size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Encabezado 3" active={editor?.isActive('heading', { level: 3 })}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            >
              <Heading3 size={15} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ToolbarBtn
              title="Cita" active={editor?.isActive('blockquote')}
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            >
              <Quote size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Código" active={editor?.isActive('code')}
              onClick={() => editor?.chain().focus().toggleCode().run()}
            >
              <Code2 size={15} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ToolbarBtn
              title="Lista con viñetas" active={editor?.isActive('bulletList')}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Lista numerada" active={editor?.isActive('orderedList')}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={15} />
            </ToolbarBtn>

            <ToolbarDivider />

            <ToolbarBtn
              title="Enlace" active={editor?.isActive('link')}
              onClick={handleLink}
            >
              <Link2 size={15} />
            </ToolbarBtn>
            <ToolbarBtn
              title="Separador horizontal" active={false}
              onClick={() => editor?.chain().focus().setHorizontalRule().run()}
            >
              <Minus size={15} />
            </ToolbarBtn>
          </div>

          {/* Editor content */}
          <div
            className="tiptap-content rounded-lg p-6"
            style={{ backgroundColor: '#1E1E1E', border: '1px solid rgba(138,130,121,0.2)', minHeight: '60vh' }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Right: Metadata (30%) */}
        <div
          style={{
            flex: '0 0 30%', overflowY: 'auto', padding: '32px 24px',
            borderLeft: '1px solid #2A2A2A',
          }}
        >
          <div className="flex flex-col gap-4">

            <div>
              <label style={labelSx}>Título</label>
              <input
                type="text"
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                style={inputSx}
                placeholder="Título del post"
              />
            </div>

            <div>
              <label style={labelSx}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => handleSlugChange(e.target.value)}
                style={{ ...inputSx, color: '#8A8279' }}
                placeholder="url-del-post"
              />
            </div>

            <div>
              <label style={labelSx}>Pillar</label>
              <input
                type="text"
                value={form.pillar}
                onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}
                style={inputSx}
                placeholder="ej. Growth, Estrategia"
              />
            </div>

            <div>
              <label style={labelSx}>Excerpt</label>
              <textarea
                rows={3}
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                style={{ ...inputSx, resize: 'vertical' }}
                placeholder="Resumen corto del post..."
              />
            </div>

            <div>
              <label style={labelSx}>Cover image URL</label>
              <input
                type="text"
                value={form.cover_image_url}
                onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))}
                style={inputSx}
                placeholder="https://..."
              />
            </div>

            <div>
              <label style={labelSx}>Status</label>
              <Select
                value={form.status}
                onValueChange={v => setForm(f => ({ ...f, status: v as BlogPostStatus }))}
              >
                <SelectTrigger className="bg-[#141414] border-[#2A2A2A] text-[#F4EDE6] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1E1E1E] border-[#2A2A2A]">
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value} className="text-[#F4EDE6] focus:bg-white/10">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {editingPost?.published_at && (
              <p style={{ fontSize: '12px', color: '#6B6B6B', fontFamily: 'Inter, sans-serif' }}>
                Publicado el {format(parseISO(editingPost.published_at), 'dd MMM yyyy')}
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
