import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';

const socials = [
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
  { label: 'Email', icon: Mail, href: 'mailto:hola@franciscoabad.com' },
];

const Footer = () => (
  <footer className="bg-[hsl(var(--bg-primary))] border-t border-[hsl(var(--border-subtle))] py-20">
    <div className="max-w-[1200px] mx-auto px-6 lg:px-8 flex flex-col items-center gap-10">
      {/* Bio */}
      <p className="font-inter text-[hsl(var(--text-secondary))] text-[14px] leading-[1.8] text-center max-w-[700px]">
        Francisco Abad ha construido, dirigido y transformado sistemas reales. Fundó CODEIS hace 9 años,
        dirigió el IESS (la institución pública más grande del Ecuador), y ha construido múltiples iniciativas
        en tech, educación y consultoría. Hoy diseña sistemas para que founders, executives y organizaciones
        operen con más claridad, ejecución y resultados.
      </p>

      {/* Social links */}
      <div className="flex items-center gap-8">
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
