import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';

// TODO: reemplazar URL de YouTube cuando Pancho confirme el canal real.
const socials = [
  { label: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/franciscoabad/' },
  { label: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/abadfrancisco/' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  { label: 'Email', icon: Mail, href: 'mailto:francisco@franciscoabad.com' },
];

const Footer = () => (
  <footer className="bg-[hsl(var(--bg-primary))] border-t border-[hsl(var(--border-subtle))] py-20">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex flex-col items-center gap-10">
      {/* Logo */}
      <img
        src="/fa_stacked_tagline_ember_3x.png"
        alt="Francisco Abad - Systems for Growth"
        style={{ height: '80px', width: 'auto', opacity: 0.95 }}
      />

      {/* Bio */}
      <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-[1.8] text-center max-w-[700px]">
        Francisco Abad ha construido, dirigido y transformado sistemas reales. Fundó CODEIS hace 10 años,
        dirigió el IESS (la institución pública más grande del Ecuador), y ha construido múltiples iniciativas
        en tech, educación y consultoría. Hoy diseña sistemas para que founders, executives y organizaciones
        operen con más claridad, ejecución y resultados.
      </p>

      {/* Social links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8">
        {socials.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-montserrat text-[12px] uppercase tracking-[1px] text-[hsl(var(--text-muted))] hover:text-[hsl(var(--ember))] transition-colors duration-300"
          >
            <Icon size={14} />
            {label}
          </a>
        ))}
      </div>

      {/* Copyright */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[hsl(var(--text-muted))] text-[12px]">
          © 2026 Francisco Abad. Todos los derechos reservados.
        </p>
        <p className="font-montserrat font-light italic text-[hsl(var(--text-muted))] text-[13px]">
          Systems for Growth.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
