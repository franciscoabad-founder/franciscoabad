import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

const BEEHIIV_PUBLICATION_ID = '';
const BEEHIIV_API = `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUBLICATION_ID}/subscriptions`;

type Stage = 'intro' | 'quiz' | 'email' | 'resultado';
type Category = 'execution' | 'strategy' | 'system' | 'team';

const questions = [
  {
    text: '¿Cuál es el mayor obstáculo en tu negocio o proyecto ahora mismo?',
    options: [
      { text: 'Sé qué hacer pero no logro ejecutarlo', category: 'execution' as Category },
      { text: 'No tengo claro hacia dónde voy', category: 'strategy' as Category },
      { text: 'Tengo claridad pero no tengo el sistema', category: 'system' as Category },
      { text: 'El equipo no rinde como debería', category: 'team' as Category },
    ],
  },
  {
    text: '¿Cómo describes tu ritmo de trabajo actual?',
    options: [
      { text: 'Reactivo: apago incendios todo el día', category: 'execution' as Category },
      { text: 'Ocupado pero sin avanzar en lo importante', category: 'system' as Category },
      { text: 'Claro pero solo, sin apoyo estructurado', category: 'strategy' as Category },
      { text: 'Inconsistente: hay semanas buenas y malas', category: 'execution' as Category },
    ],
  },
  {
    text: '¿Tienes un proceso claro para tomar decisiones importantes?',
    options: [
      { text: 'No, decido por intuición', category: 'strategy' as Category },
      { text: 'Tengo criterios pero no un sistema formal', category: 'system' as Category },
      { text: 'Sí, pero a veces lo salteo bajo presión', category: 'execution' as Category },
      { text: 'No sé si mis decisiones son las correctas', category: 'strategy' as Category },
    ],
  },
  {
    text: '¿Qué tan bien funciona tu negocio sin tu presencia directa?',
    options: [
      { text: 'No funciona, todo depende de mí', category: 'system' as Category },
      { text: 'Funciona poco, hay muchas dependencias', category: 'team' as Category },
      { text: 'Funciona regular, pero pierde calidad', category: 'system' as Category },
      { text: 'Funciona bien en operación, no en estrategia', category: 'strategy' as Category },
    ],
  },
  {
    text: '¿Cuándo fue la última vez que revisaste tu estrategia de forma estructurada?',
    options: [
      { text: 'Nunca lo he hecho formalmente', category: 'strategy' as Category },
      { text: 'Hace más de un año', category: 'strategy' as Category },
      { text: 'Hace algunos meses', category: 'system' as Category },
      { text: 'Lo hago regularmente', category: 'execution' as Category },
    ],
  },
  {
    text: 'Si tuvieras que resolver un solo problema este mes para desbloquear el crecimiento, ¿cuál sería?',
    options: [
      { text: 'Definir prioridades y mantenerlas', category: 'execution' as Category },
      { text: 'Tener una estrategia clara de 90 días', category: 'strategy' as Category },
      { text: 'Sistematizar los procesos clave', category: 'system' as Category },
      { text: 'Mejorar cómo trabaja mi equipo', category: 'team' as Category },
    ],
  },
];

const results: Record<Category, { title: string; description: string; cta: string }> = {
  execution: {
    title: 'Tu sistema de ejecución está roto',
    description:
      'Tienes claridad estratégica pero algo en el sistema de ejecución diario no está funcionando. No es motivación. Es arquitectura. El problema está en cómo está diseñado tu día, tus prioridades y tu sistema de decisiones.',
    cta: 'Quiero arreglar mi sistema de ejecución',
  },
  strategy: {
    title: 'No tienes una brújula estratégica clara',
    description:
      'Estás ejecutando con esfuerzo real, pero sin una dirección lo suficientemente clara. Cada decisión cuesta más energía de la que debería porque el marco de referencia no está definido.',
    cta: 'Quiero definir mi estrategia de 90 días',
  },
  system: {
    title: 'Tu negocio depende demasiado de ti',
    description:
      'El cuello de botella eres tú mismo. No porque seas el problema, sino porque el sistema no está diseñado para funcionar sin tu presencia constante. Eso limita el crecimiento y agota.',
    cta: 'Quiero sistematizar mi negocio',
  },
  team: {
    title: 'Tu equipo necesita un sistema de operación',
    description:
      'El potencial está ahí pero el sistema que convierte esfuerzo individual en resultado colectivo no existe todavía. No es un problema de personas. Es un problema de diseño.',
    cta: 'Quiero diseñar el sistema de mi equipo',
  },
};

function computeDiagnosis(answers: Category[]): Category {
  const counts: Record<Category, number> = { execution: 0, strategy: 0, system: 0, team: 0 };
  answers.forEach((a) => { counts[a]++; });
  return (Object.keys(counts) as Category[]).reduce((a, b) => (counts[a] >= counts[b] ? a : b));
}

const GrowthLab = () => {
  const [stage, setStage] = useState<Stage>('intro');
  const [visible, setVisible] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Category[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Category>('execution');
  const [introLines, setIntroLines] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
  }, []);

  useEffect(() => {
    if (stage === 'intro') {
      setIntroLines(0);
      const timers = [400, 800, 1200, 1600].map((delay, i) =>
        setTimeout(() => setIntroLines(i + 1), delay)
      );
      return () => timers.forEach(clearTimeout);
    }
  }, [stage]);

  const handleStart = () => {
    setStage('quiz');
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
  };

  const handleOption = (idx: number, category: Category) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    timerRef.current = setTimeout(() => {
      const newAnswers = [...answers, category];
      if (currentQ < questions.length - 1) {
        setAnswers(newAnswers);
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
      } else {
        setAnswers(newAnswers);
        setDiagnosis(computeDiagnosis(newAnswers));
        setStage('email');
      }
    }, 400);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError('Ingresa un email válido.');
      return;
    }
    setEmailError('');
    setSubmitting(true);

    try {
      if (BEEHIIV_PUBLICATION_ID) {
        await fetch(BEEHIIV_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, reactivate_existing: true }),
        });
      }

      await supabase.from('quiz_leads').insert({
        email,
        diagnosis,
        answers: answers,
      });
    } catch (_) {
      // silent fail, still show result
    }

    setSubmitting(false);
    setStage('resultado');
  };

  const handleReset = () => {
    setStage('intro');
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setEmail('');
    setEmailError('');
  };

  const resultData = results[diagnosis];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D0D0D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'Inter, sans-serif',
        transition: 'opacity 0.8s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      <div style={{ width: '100%', maxWidth: 560 }}>

        {/* INTRO */}
        {stage === 'intro' && (
          <div style={{ textAlign: 'center' }}>
            {introLines >= 1 && (
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 14,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: '#8A8279',
                  marginBottom: 32,
                  transition: 'opacity 0.6s ease',
                }}
              >
                THE GROWTH LAB
              </p>
            )}
            {introLines >= 2 && (
              <h1
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
                  color: '#F4EDE6',
                  lineHeight: 1.2,
                  marginBottom: 8,
                  transition: 'opacity 0.6s ease',
                }}
              >
                La mayoría de founders no tienen un problema de esfuerzo.
              </h1>
            )}
            {introLines >= 3 && (
              <h2
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 'clamp(1.6rem, 5vw, 2.5rem)',
                  color: '#9B3D28',
                  lineHeight: 1.2,
                  marginBottom: 24,
                  transition: 'opacity 0.6s ease',
                }}
              >
                Tienen un problema de sistema.
              </h2>
            )}
            {introLines >= 4 && (
              <p
                style={{
                  fontSize: 16,
                  color: '#8A8279',
                  lineHeight: 1.8,
                  marginBottom: 40,
                  transition: 'opacity 0.6s ease',
                }}
              >
                Responde 6 preguntas. Identifica exactamente qué está frenando tu crecimiento.
              </p>
            )}
            {introLines >= 4 && (
              <button
                onClick={handleStart}
                style={{
                  backgroundColor: '#9B3D28',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  width: '100%',
                  maxWidth: 360,
                  height: 52,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Comenzar diagnóstico
              </button>
            )}
          </div>
        )}

        {/* QUIZ */}
        {stage === 'quiz' && (
          <div>
            {/* Progress bar */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
              {questions.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: i <= currentQ ? '#9B3D28' : 'rgba(138,130,121,0.2)',
                    transition: 'background-color 0.3s ease',
                  }}
                />
              ))}
            </div>

            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                color: '#F4EDE6',
                lineHeight: 1.4,
                marginBottom: 28,
              }}
            >
              {questions[currentQ].text}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {questions[currentQ].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOption(i, opt.category)}
                  style={{
                    backgroundColor: selectedOption === i ? 'rgba(155, 61, 40,0.15)' : '#1A1A1A',
                    border: `1px solid ${selectedOption === i ? '#9B3D28' : 'rgba(138,130,121,0.2)'}`,
                    borderRadius: 6,
                    padding: '16px 20px',
                    textAlign: 'left',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    color: '#F4EDE6',
                    cursor: selectedOption !== null ? 'default' : 'pointer',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    lineHeight: 1.5,
                  }}
                  onMouseEnter={(e) => {
                    if (selectedOption === null) {
                      e.currentTarget.style.borderColor = '#9B3D28';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedOption !== i) {
                      e.currentTarget.style.borderColor = 'rgba(138,130,121,0.2)';
                    }
                  }}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EMAIL */}
        {stage === 'email' && (
          <div style={{ textAlign: 'center' }}>
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                color: '#F4EDE6',
                marginBottom: 12,
              }}
            >
              Tu diagnóstico está listo.
            </h2>
            <p style={{ color: '#8A8279', fontSize: 16, marginBottom: 32 }}>
              ¿A dónde te lo enviamos?
            </p>
            <form onSubmit={handleEmailSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  backgroundColor: '#1A1A1A',
                  border: `1px solid ${emailError ? '#9B3D28' : 'rgba(138,130,121,0.3)'}`,
                  borderRadius: 6,
                  padding: '14px 16px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  color: '#F4EDE6',
                  outline: 'none',
                  marginBottom: 12,
                }}
              />
              {emailError && (
                <p style={{ color: '#9B3D28', fontSize: 13, marginBottom: 12, textAlign: 'left' }}>
                  {emailError}
                </p>
              )}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  height: 52,
                  backgroundColor: '#9B3D28',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 14,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  marginBottom: 16,
                }}
              >
                {submitting ? 'Enviando...' : 'Ver mi diagnóstico'}
              </button>
              <p style={{ color: '#4A4541', fontSize: 12 }}>Sin spam. Solo sistemas.</p>
            </form>
          </div>
        )}

        {/* RESULTADO */}
        {stage === 'resultado' && (
          <div>
            <p
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#9B3D28',
                marginBottom: 16,
              }}
            >
              Tu diagnóstico
            </p>
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 'clamp(1.4rem, 5vw, 2rem)',
                color: '#F4EDE6',
                lineHeight: 1.25,
                marginBottom: 20,
              }}
            >
              {resultData.title}
            </h2>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 16,
                color: '#A3A3A3',
                lineHeight: 1.8,
                marginBottom: 36,
              }}
            >
              {resultData.description}
            </p>

            {/* CTA block */}
            <div
              style={{
                backgroundColor: '#1E1E1E',
                borderRadius: 8,
                padding: 24,
                marginBottom: 24,
              }}
            >
              <p
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#9B3D28',
                  marginBottom: 12,
                }}
              >
                ¿Qué sigue?
              </p>
              <p
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 15,
                  color: '#A3A3A3',
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                Agenda una sesión de diagnóstico de 30 minutos. Sin costo. Sin compromiso. Solo
                claridad sobre qué está pasando y qué hay que hacer.
              </p>
              <Link
                to="/trabaja-conmigo"
                style={{
                  display: 'block',
                  backgroundColor: '#9B3D28',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 6,
                  padding: '14px 24px',
                  textAlign: 'center',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                }}
              >
                Agendar diagnóstico gratuito
              </Link>
              <button
                onClick={handleReset}
                style={{
                  display: 'block',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#8A8279',
                  border: '1px solid rgba(138,130,121,0.3)',
                  borderRadius: 6,
                  padding: '12px 24px',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Volver a empezar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrowthLab;
