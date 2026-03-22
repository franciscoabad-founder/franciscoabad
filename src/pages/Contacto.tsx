import { useState } from 'react';
import { Linkedin, Instagram, Youtube, Mail } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/sections/Footer';

const socials = [
  { label: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
  { label: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  { label: 'YouTube', icon: Youtube, href: 'https://youtube.com' },
];

const subjects = ['Consultoría', 'Speaking', 'Productos', 'Otro'];

const Contacto = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: connect to backend
    console.log(formData);
  };

  const inputClass =
    'w-full bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border-subtle))] rounded-md px-4 py-3 font-inter text-[hsl(var(--text-primary))] text-[14px] placeholder:text-[hsl(var(--text-muted))] focus:outline-none focus:border-[hsl(var(--ember))] transition-colors duration-300';

  const labelClass =
    'block font-montserrat font-semibold text-[hsl(var(--text-secondary))] text-[11px] uppercase tracking-[1.5px] mb-2';

  return (
    <div className="bg-[hsl(var(--bg-primary))] min-h-screen">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left side */}
            <div className="space-y-12">
              <div>
                <h1 className="font-montserrat font-bold text-[hsl(var(--text-primary))] text-[40px] md:text-[52px] leading-tight mb-6">
                  Let's Work<br />Together
                </h1>
                <p className="font-inter text-[hsl(var(--text-secondary))] text-[16px] leading-relaxed max-w-[420px]">
                  Si estás construyendo algo que importa y necesitas claridad, sistemas, o alguien
                  que ya haya estado en el campo — hablemos.
                </p>
              </div>

              <div>
                <a
                  href="mailto:hola@franciscoabad.com"
                  className="inline-flex items-center gap-3 font-inter text-[hsl(var(--text-primary))] text-[16px] hover:text-[hsl(var(--ember))] transition-colors duration-300"
                >
                  <Mail size={18} className="text-[hsl(var(--ember))]" />
                  hola@franciscoabad.com
                </a>
              </div>

              <div>
                <p className="font-montserrat font-semibold text-[hsl(var(--text-muted))] text-[11px] uppercase tracking-[2px] mb-5">
                  Sígueme
                </p>
                <div className="flex flex-col gap-4">
                  {socials.map(({ label, icon: Icon, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 font-montserrat text-[13px] uppercase tracking-[1px] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--ember))] transition-colors duration-300"
                    >
                      <Icon size={16} />
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side — form */}
            <div className="bg-[hsl(var(--bg-elevated))] rounded-lg border border-[hsl(var(--border-subtle))] p-8 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className={labelClass}>Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@email.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Asunto</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={inputClass + ' appearance-none cursor-pointer'}
                  >
                    <option value="" disabled>Selecciona un asunto</option>
                    {subjects.map((s) => (
                      <option key={s} value={s} className="bg-[#242424]">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Mensaje</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Cuéntame sobre tu proyecto o lo que necesitas..."
                    className={inputClass + ' resize-none'}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[hsl(var(--ember))] text-white font-montserrat font-semibold text-[13px] uppercase tracking-[1.5px] py-4 rounded-md hover:opacity-90 transition-opacity duration-300"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contacto;
