import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Instagram,
  Linkedin,
  Youtube,
  Briefcase,
  ShoppingBag,
  CalendarDays,
  FileEdit,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview',      to: '/admin',            icon: LayoutDashboard, end: true },
  { label: 'Instagram',     to: '/admin/instagram',  icon: Instagram },
  { label: 'LinkedIn',      to: '/admin/linkedin',   icon: Linkedin },
  { label: 'YouTube',       to: '/admin/youtube',    icon: Youtube },
  { label: 'Oportunidades', to: '/admin/oportunidades', icon: Briefcase },
  { label: 'Lemon Squeezy', to: '/admin/ventas',     icon: ShoppingBag },
  { label: 'Cal.com',       to: '/admin/sesiones',   icon: CalendarDays },
  { label: 'Blog Editor',   to: '/admin/blog',       icon: FileEdit },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#141414' }}>
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col fixed top-0 left-0 h-full z-10"
        style={{ backgroundColor: '#1E1E1E', borderRight: '1px solid #2A2A2A' }}
      >
        {/* Logo */}
        <div className="px-6 pt-8 pb-6 select-none">
          <svg
            viewBox="0 0 320 36"
            height="36"
            width="auto"
            style={{ display: 'block' }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <text
              x="0"
              y="27"
              fontFamily="Montserrat, Arial, sans-serif"
              fontWeight="200"
              fontSize="24"
              letterSpacing="4"
              fill="rgba(244,237,230,0.55)"
            >
              FRANCISCO
            </text>
            <text
              x="184"
              y="27"
              fontFamily="Montserrat, Arial, sans-serif"
              fontWeight="900"
              fontSize="28"
              letterSpacing="1"
              fill="#9B3D28"
            >
              ABAD
            </text>
          </svg>
        </div>

        <div style={{ borderTop: '1px solid #2A2A2A' }} className="mx-4 mb-4" />

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 overflow-y-auto">
          {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors"
              style={({ isActive }) => ({
                fontFamily: 'Inter, sans-serif',
                color: isActive ? '#F4EDE6' : '#8A8279',
                backgroundColor: isActive ? 'rgba(155, 61, 40,0.1)' : 'transparent',
                borderLeft: isActive ? '2px solid #9B3D28' : '2px solid transparent',
              })}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ borderTop: '1px solid #2A2A2A' }} className="mx-4 mt-2" />
        <div className="px-2 py-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors hover:bg-white/5"
            style={{ fontFamily: 'Inter, sans-serif', color: '#8A8279' }}
          >
            <LogOut size={16} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content area */}
      <main className="flex-1 ml-56 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
