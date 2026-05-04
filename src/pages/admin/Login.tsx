import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
      setLoading(false);
    } else {
      navigate('/admin');
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#141414' }}
    >
      {/* Logo */}
      <div className="mb-10 text-center select-none">
        <p
          className="text-2xl tracking-[0.25em] uppercase leading-none"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 200, color: 'rgba(244,237,230,0.5)' }}
        >
          Francisco
        </p>
        <p
          className="text-2xl tracking-[0.25em] uppercase leading-none mt-0.5"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, color: '#9B3D28' }}
        >
          Abad
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgba(244,237,230,0.5)' }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-md text-sm outline-none focus:ring-1 transition"
            style={{
              backgroundColor: '#1E1E1E',
              border: '1px solid #2E2E2E',
              color: '#F4EDE6',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#9B3D28')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2E2E2E')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs tracking-widest uppercase"
            style={{ fontFamily: 'Montserrat, sans-serif', color: 'rgba(244,237,230,0.5)' }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-md text-sm outline-none transition"
            style={{
              backgroundColor: '#1E1E1E',
              border: '1px solid #2E2E2E',
              color: '#F4EDE6',
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = '#9B3D28')}
            onBlur={e => (e.currentTarget.style.borderColor = '#2E2E2E')}
          />
        </div>

        {error && (
          <p className="text-sm text-center" style={{ color: '#E05C3A', fontFamily: 'Inter, sans-serif' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-3 rounded-md text-sm font-semibold tracking-widest uppercase transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: '#9B3D28',
            color: '#F4EDE6',
            fontFamily: 'Montserrat, sans-serif',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
