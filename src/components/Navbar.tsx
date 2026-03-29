import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const linkClass =
    'font-montserrat font-medium text-[13px] uppercase tracking-[1px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--ember))] transition-colors duration-300';
  const mobileLinkClass =
    'font-montserrat font-medium text-2xl uppercase tracking-[2px] text-[hsl(var(--text-primary))] hover:text-[hsl(var(--ember))] transition-colors duration-300';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[hsl(var(--bg-elevated))] backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center select-none">
            <img
              src="/fa_stacked_tagline_ember_3x.png"
              alt="Francisco Abad - Systems for Growth"
              style={{ height: '48px', width: 'auto' }}
            />
          </Link>

          {/* Desktop nav */}
          <ul className="hidden lg:flex items-center gap-8">
            <li>
              <Link to="/" className={linkClass}>HOME</Link>
            </li>
            <li>
              <Link to="/sobre-mi" className={linkClass}>SOBRE MÍ</Link>
            </li>
            <li>
              <Link to="/trabaja-conmigo" className={linkClass}>TRABAJA CONMIGO</Link>
            </li>
            <li>
              <Link to="/blog" className={linkClass}>BLOG</Link>
            </li>
            <li>
              <Link to="/contacto" className={linkClass}>CONTACTO</Link>
            </li>
          </ul>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-[hsl(var(--text-primary))] p-2"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <div
        className={`fixed inset-0 z-[100] bg-[hsl(var(--bg-primary))] flex flex-col items-center justify-center transition-all duration-300 ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          className="absolute top-5 right-6 text-[hsl(var(--text-primary))] p-2"
          onClick={() => setMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>

        <ul className="flex flex-col items-center gap-10">
          <li>
            <Link to="/" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              HOME
            </Link>
          </li>
          <li>
            <Link to="/sobre-mi" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              SOBRE MÍ
            </Link>
          </li>
          <li>
            <Link to="/trabaja-conmigo" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              TRABAJA CONMIGO
            </Link>
          </li>
          <li>
            <Link to="/blog" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              BLOG
            </Link>
          </li>
          <li>
            <Link to="/contacto" className={mobileLinkClass} onClick={() => setMenuOpen(false)}>
              CONTACTO
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default Navbar;
