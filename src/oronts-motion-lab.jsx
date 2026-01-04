'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback, memo, createContext, useContext } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, useMotionValue, useReducedMotion } from 'framer-motion';

/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗ ██████╗  ██████╗ ███╗   ██╗████████╗███████╗                       ║
║  ██╔═══██╗██╔══██╗██╔═══██╗████╗  ██║╚══██╔══╝██╔════╝                       ║
║  ██║   ██║██████╔╝██║   ██║██╔██╗ ██║   ██║   ███████╗                       ║
║  ██║   ██║██╔══██╗██║   ██║██║╚██╗██║   ██║   ╚════██║                       ║
║  ╚██████╔╝██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████║                       ║
║   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝                       ║
║                                                                              ║
║   MOTION LAB - Premium Animation Showcase                                    ║
║   https://oronts.com                                                         ║
║                                                                              ║
║   40+ PRODUCTION-READY SCROLL & SVG ANIMATIONS                               ║
║   Each effect includes AI prompts for instant reproduction                   ║
║                                                                              ║
║   SCROLL EFFECTS (15):                                                       ║
║   ✅ Parallax Images          ✅ Hero Reveal (clip-path)                     ║
║   ✅ Apple Zoom Section       ✅ Horizontal Scroll                           ║
║   ✅ Slide Panels             ✅ Split Screen Scroll                         ║
║   ✅ Zoom Gallery             ✅ Sticky Sections                             ║
║   ✅ Scale on Scroll          ✅ Rotate on Scroll                            ║
║   ✅ Fade Sections            ✅ Pin & Reveal                                ║
║   ✅ Progress Indicator       ✅ Velocity Effects                            ║
║   ✅ Scroll Snap                                                             ║
║                                                                              ║
║   SVG ANIMATIONS (10):                                                       ║
║   ✅ Line Drawing             ✅ Morphing Shapes                             ║
║   ✅ Animated Blob            ✅ Wave Animation                              ║
║   ✅ Gradient Orbs            ✅ Geometric Patterns                          ║
║   ✅ Animated Icons           ✅ Path Following                              ║
║   ✅ Pulse Rings              ✅ Logo Reveal                                 ║
║                                                                              ║
║   TEXT EFFECTS (10):                                                         ║
║   ✅ Typewriter               ✅ Text Scramble                               ║
║   ✅ Glitch Text              ✅ Split Text                                  ║
║   ✅ Outline to Fill          ✅ Gradient Text                               ║
║   ✅ Cinematic Reveal         ✅ Character Reveal                            ║
║   ✅ Text Wave                ✅ Rotating 3D Text                            ║
║                                                                              ║
║   COMPONENTS (10):                                                           ║
║   ✅ Magnetic Buttons         ✅ Card Carousel                               ║
║   ✅ Card Stack (FLIP)        ✅ Infinite Marquee                            ║
║   ✅ Counter Animation        ✅ Staggered Grid                              ║
║   ✅ 3D Tilt Cards            ✅ Hover Effects                               ║
║   ✅ Modal Animations         ✅ Tab Transitions                             ║
║                                                                              ║
║   Built by Oronts GmbH - AI-First Technology Solutions                       ║
║   GPU Accelerated • 120fps Ready • SSR Safe • Accessible                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/

// ═══════════════════════════════════════════════════════════════════════════
// SSR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  return hasMounted;
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
};

const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ═══════════════════════════════════════════════════════════════════════════
// ORONTS BRAND COLORS
// ═══════════════════════════════════════════════════════════════════════════

const COLORS = {
  bg: '#1d233a',
  bgDark: '#111523',
  bgDarker: '#0a0c12',
  bgCard: 'rgba(29, 35, 58, 0.85)',
  bgCardHover: 'rgba(40, 48, 75, 0.9)',
  
  accent: '#7432ff',
  accentLight: '#8b5cf6',
  accentDark: '#5d29cc',
  
  teal: '#2DD4BF',
  orange: '#FFA500',
  pink: '#f5576c',
  blue: '#4facfe',
  green: '#10b981',
  yellow: '#fbbf24',
  red: '#ef4444',
  cyan: '#00f2fe',
  
  text: '#ffffff',
  textMuted: 'rgba(255, 255, 255, 0.7)',
  textSubtle: 'rgba(255, 255, 255, 0.4)',
  
  border: 'rgba(255, 255, 255, 0.08)',
  borderHover: 'rgba(255, 255, 255, 0.15)',
  glow: 'rgba(116, 50, 255, 0.25)',
  
  gradientAccent: 'linear-gradient(135deg, #7432ff 0%, #8b5cf6 100%)',
  gradientWarm: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
  gradientCool: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  gradientTeal: 'linear-gradient(135deg, #2DD4BF 0%, #14b8a6 100%)',
  gradientSunset: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  gradientNight: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientFire: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
  gradientOcean: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
};

const EASE = { smooth: [0.25, 0.1, 0.25, 1], out: [0.16, 1, 0.3, 1], inOut: [0.76, 0, 0.24, 1], bounce: [0.68, -0.55, 0.265, 1.55] };
const SPRING = { smooth: { stiffness: 60, damping: 20, mass: 1 }, snappy: { stiffness: 400, damping: 35, mass: 0.8 }, gentle: { stiffness: 40, damping: 15, mass: 1.2 }, bounce: { stiffness: 300, damping: 20, mass: 0.6 } };
const TRANSITION = { fast: { duration: 0.2, ease: EASE.out }, medium: { duration: 0.4, ease: EASE.out }, slow: { duration: 0.8, ease: EASE.out } };

// ═══════════════════════════════════════════════════════════════════════════
// SMOOTH SCROLL CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const SmoothScrollContext = createContext({ scrollY: null, scrollYSmooth: null, velocity: null, progress: null, isReady: false });

const SmoothScrollProvider = memo(({ children }) => {
  const scrollY = useMotionValue(0);
  const scrollYSmooth = useMotionValue(0);
  const velocity = useMotionValue(0);
  const progress = useMotionValue(0);
  const [isReady, setIsReady] = useState(false);
  const targetY = useRef(0);
  const currentY = useRef(0);
  const lastY = useRef(0);
  const rafId = useRef(null);
  
  useEffect(() => {
    setIsReady(true);
    const handleScroll = () => {
      targetY.current = window.scrollY;
      scrollY.set(window.scrollY);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.set(docHeight > 0 ? window.scrollY / docHeight : 0);
    };
    const animate = () => {
      const diff = targetY.current - currentY.current;
      currentY.current += diff * 0.08;
      velocity.set(currentY.current - lastY.current);
      lastY.current = currentY.current;
      scrollYSmooth.set(currentY.current);
      rafId.current = requestAnimationFrame(animate);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    rafId.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener('scroll', handleScroll); if (rafId.current) cancelAnimationFrame(rafId.current); };
  }, [scrollY, scrollYSmooth, velocity, progress]);
  
  const value = useMemo(() => ({ scrollY, scrollYSmooth, velocity, progress, isReady }), [scrollY, scrollYSmooth, velocity, progress, isReady]);
  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
});

SmoothScrollProvider.displayName = 'SmoothScrollProvider';
const useSmoothScroll = () => useContext(SmoothScrollContext);

// ═══════════════════════════════════════════════════════════════════════════
// AI PROMPT BOX
// ═══════════════════════════════════════════════════════════════════════════

const AIPromptBox = memo(({ prompt, title }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={TRANSITION.medium}
      style={{ background: `${COLORS.accent}08`, border: `1px solid ${COLORS.accent}30`, borderRadius: '16px', padding: '1.25rem', margin: '2rem auto', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expanded ? '1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🤖</span>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: COLORS.accent, fontWeight: 600 }}>AI PROMPT: {title}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setExpanded(!expanded)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', color: '#fff', fontSize: '0.75rem', cursor: 'pointer' }}>
            {expanded ? '▼ Hide' : '▶ Show'}
          </button>
          <button onClick={handleCopy} style={{ background: copied ? COLORS.teal : COLORS.accent, border: 'none', borderRadius: '8px', padding: '0.4rem 0.8rem', color: '#fff', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500, transition: 'all 0.3s' }}>
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.pre initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            style={{ background: COLORS.bgDark, padding: '1rem', borderRadius: '10px', fontSize: '0.8rem', lineHeight: 1.6, overflow: 'auto', whiteSpace: 'pre-wrap', color: COLORS.textMuted, margin: 0, maxHeight: '400px' }}>
            {prompt}
          </motion.pre>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

AIPromptBox.displayName = 'AIPromptBox';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

const SectionLabel = memo(({ children, color = COLORS.accent, number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={TRANSITION.medium} style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
    {number && <span style={{ fontSize: '0.65rem', opacity: 0.3, display: 'block', marginBottom: '0.25rem' }}>#{number.toString().padStart(2, '0')}</span>}
    <span style={{ fontSize: '0.65rem', letterSpacing: '0.25em', color, fontWeight: 500, textTransform: 'uppercase' }}>{children}</span>
  </motion.div>
));

SectionLabel.displayName = 'SectionLabel';

const SectionTitle = memo(({ children }) => (
  <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={TRANSITION.medium} style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '1rem' }}>{children}</motion.h3>
));

SectionTitle.displayName = 'SectionTitle';

// ═══════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON
// ═══════════════════════════════════════════════════════════════════════════

const MagneticButton = memo(({ children, onClick, variant = 'primary', size = 'md' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const hasMounted = useHasMounted();
  const prefersReducedMotion = useReducedMotion();
  const springX = useSpring(x, SPRING.snappy);
  const springY = useSpring(y, SPRING.snappy);
  
  const handleMouseMove = useCallback((e) => {
    if (!hasMounted || prefersReducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * 0.3);
    y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
  }, [x, y, hasMounted, prefersReducedMotion]);
  
  const handleMouseLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);
  const isPrimary = variant === 'primary';
  const sizes = { sm: { padding: '0.5rem 1.25rem', fontSize: '0.8rem' }, md: { padding: '0.75rem 2rem', fontSize: '0.9rem' }, lg: { padding: '1rem 2.5rem', fontSize: '1rem' } };
  
  return (
    <motion.button ref={ref} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ x: hasMounted ? springX : 0, y: hasMounted ? springY : 0, background: isPrimary ? COLORS.gradientAccent : 'transparent', color: isPrimary ? '#fff' : COLORS.accent, border: isPrimary ? 'none' : `1px solid ${COLORS.accent}50`, ...sizes[size], fontWeight: 600, borderRadius: '100px', cursor: 'pointer', position: 'relative', overflow: 'hidden', fontFamily: 'inherit', boxShadow: isPrimary ? `0 10px 40px ${COLORS.glow}` : 'none' }}
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', ...SPRING.snappy }}>
      <motion.span style={{ position: 'relative', zIndex: 1 }}>{children}</motion.span>
    </motion.button>
  );
});

MagneticButton.displayName = 'MagneticButton';

// ═══════════════════════════════════════════════════════════════════════════
// AMBIENT PARTICLES
// ═══════════════════════════════════════════════════════════════════════════

const AmbientParticles = memo(({ count = 30, color = COLORS.accent, seed = 42 }) => {
  const hasMounted = useHasMounted();
  const prefersReducedMotion = useReducedMotion();
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({ id: i, x: seededRandom(seed + i) * 100, y: seededRandom(seed + i + 1000) * 100, size: seededRandom(seed + i + 2000) * 3 + 1, duration: seededRandom(seed + i + 3000) * 5 + 4, delay: seededRandom(seed + i + 4000) * 4 })), [count, seed]);
  if (!hasMounted || prefersReducedMotion) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
      {particles.map(p => (
        <motion.div key={p.id} animate={{ y: [0, -30, 0], opacity: [0.15, 0.5, 0.15], scale: [1, 1.3, 1] }} transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: color }} />
      ))}
    </div>
  );
});

AmbientParticles.displayName = 'AmbientParticles';

// ═══════════════════════════════════════════════════════════════════════════
// 1. HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════

const LuxuryHero = memo(({ onOpenDemo, onOpenDocs }) => {
  const ref = useRef(null);
  const hasMounted = useHasMounted();
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.4], [1, 0]), SPRING.gentle);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.4], [1, 0.95]), SPRING.gentle);
  const y = useSpring(useTransform(scrollYProgress, [0, 0.4], [0, 100]), SPRING.gentle);
  
  return (
    <motion.section ref={ref} style={hasMounted ? { opacity, scale, y } : {}} className="hero-section">
      <motion.div animate={!prefersReducedMotion ? { scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] } : {}} transition={{ duration: 8, repeat: Infinity }} style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '90vw', height: '90vw', background: `radial-gradient(ellipse, ${COLORS.accent} 0%, transparent 70%)`, opacity: 0.15, pointerEvents: 'none' }} />
      <AmbientParticles count={30} seed={42} />
      
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '2rem' }}>
        {/* Oronts Logo/Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSITION.medium, delay: 0.1 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', background: `${COLORS.accent}15`, borderRadius: '100px', marginBottom: '2rem', border: `1px solid ${COLORS.accent}30` }}>
          <motion.span animate={prefersReducedMotion ? {} : { scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS.accent, boxShadow: `0 0 15px ${COLORS.accent}` }} />
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: COLORS.accent, fontWeight: 500 }}>ORONTS.COM • MOTION LAB</span>
        </motion.div>
        
        <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSITION.slow, delay: 0.2 }} style={{ fontSize: 'clamp(2.5rem, 12vw, 7rem)', fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.95, marginBottom: '1.5rem' }}>
          <span style={{ display: 'block', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Motion</span>
          <span style={{ display: 'block', background: COLORS.gradientAccent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lab</span>
        </motion.h1>
        
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ ...TRANSITION.medium, delay: 0.4 }} style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          40+ production-ready scroll & SVG animations with AI prompts for instant reproduction. Built by <strong style={{ color: COLORS.accent }}>Oronts GmbH</strong> for modern web experiences.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSITION.medium, delay: 0.5 }} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <MagneticButton onClick={onOpenDemo} variant="primary" size="lg">⚡ Fullscreen Demo</MagneticButton>
          <MagneticButton onClick={onOpenDocs} variant="secondary" size="lg">📖 All Prompts</MagneticButton>
        </motion.div>
        
        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
          {[{ num: '40+', label: 'Effects' }, { num: '120', label: 'FPS Ready' }, { num: '100%', label: 'SSR Safe' }].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.accent }}>{s.num}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.4, letterSpacing: '0.1em' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.2em', opacity: 0.3 }}>SCROLL</span>
        <motion.div style={{ width: '1px', height: '50px', background: `linear-gradient(to bottom, ${COLORS.accent}, transparent)`, transformOrigin: 'top' }} animate={prefersReducedMotion ? {} : { scaleY: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity }} />
      </motion.div>
      
      <style>{`.hero-section { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; }`}</style>
    </motion.section>
  );
});

LuxuryHero.displayName = 'LuxuryHero';

// ═══════════════════════════════════════════════════════════════════════════
// 2. SVG LINE DRAWING
// ═══════════════════════════════════════════════════════════════════════════

const SVGLineDrawing = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  
  return (
    <section ref={ref} style={{ padding: '5rem 2rem' }}>
      <SectionLabel number={1}>SVG LINE DRAWING</SectionLabel>
      <SectionTitle>Path Animation on Scroll</SectionTitle>
      
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
        {[
          { d: "M50 5 L61 35 L95 35 L68 57 L79 90 L50 70 L21 90 L32 57 L5 35 L39 35 Z", color: COLORS.accent, delay: 0 },
          { d: "M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z", color: COLORS.teal, delay: 0.2 },
          { d: "M50 10 A40 40 0 1 1 49.99 10", color: COLORS.pink, delay: 0.4 },
          { d: "M10 90 Q30 10 50 50 T90 10", color: COLORS.orange, delay: 0.6 },
          { d: "M50 10 L10 90 L90 90 Z M50 30 L30 70 L70 70 Z", color: COLORS.blue, delay: 0.8 },
        ].map((shape, i) => (
          <svg key={i} width="100" height="100" viewBox="0 0 100 100" fill="none">
            <motion.path d={shape.d} stroke={shape.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={isInView ? { pathLength: 1 } : { pathLength: 0 }} transition={{ duration: 2, ease: "easeInOut", delay: shape.delay }} />
          </svg>
        ))}
      </div>
      
      <AIPromptBox title="SVG Line Drawing" prompt={`Create SVG line drawing animation with Framer Motion:

1. Use motion.path with pathLength animation
2. Trigger on scroll with useInView hook
3. Add staggered delays for multiple shapes

<motion.path
  d="M50 5 L61 35 L95 35..."
  stroke="#7432ff"
  strokeWidth="2"
  strokeLinecap="round"
  initial={{ pathLength: 0 }}
  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
  transition={{ duration: 2, ease: "easeInOut" }}
/>

Key: pathLength animates the stroke from 0% to 100% drawn.`} />
    </section>
  );
});

SVGLineDrawing.displayName = 'SVGLineDrawing';

// ═══════════════════════════════════════════════════════════════════════════
// 3. SVG MORPHING
// ═══════════════════════════════════════════════════════════════════════════

const SVGMorphing = memo(() => {
  const [shapeIndex, setShapeIndex] = useState(0);
  const shapes = useMemo(() => ["M50,10 L90,90 L10,90 Z", "M10,10 L90,10 L90,90 L10,90 Z", "M50,10 L90,35 L75,90 L25,90 L10,35 Z", "M50,10 A40,40 0 1,1 49.99,10 Z"], []);
  const colors = [COLORS.accent, COLORS.teal, COLORS.pink, COLORS.orange];
  
  useEffect(() => { const i = setInterval(() => setShapeIndex(p => (p + 1) % shapes.length), 2000); return () => clearInterval(i); }, [shapes.length]);
  
  return (
    <section style={{ padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SectionLabel number={2}>SVG MORPHING</SectionLabel>
      <SectionTitle>Shape Transformation</SectionTitle>
      
      <svg width="180" height="180" viewBox="0 0 100 100" style={{ marginBottom: '1.5rem' }}>
        <motion.path d={shapes[shapeIndex]} fill={colors[shapeIndex]} animate={{ d: shapes[shapeIndex], fill: colors[shapeIndex] }} transition={{ duration: 0.8, ease: "easeInOut" }} />
      </svg>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {shapes.map((_, i) => (<button key={i} onClick={() => setShapeIndex(i)} style={{ width: '10px', height: '10px', borderRadius: '50%', border: 'none', background: i === shapeIndex ? colors[i] : 'rgba(255,255,255,0.2)', cursor: 'pointer' }} />))}
      </div>
      
      <AIPromptBox title="SVG Morphing" prompt={`Create morphing SVG shapes:

const shapes = [
  "M50,10 L90,90 L10,90 Z",     // Triangle
  "M10,10 L90,10 L90,90 L10,90 Z", // Square
  "M50,10 A40,40 0 1,1 49.99,10 Z" // Circle
];

<motion.path
  d={shapes[index]}
  fill={colors[index]}
  animate={{ d: shapes[index], fill: colors[index] }}
  transition={{ duration: 0.8, ease: "easeInOut" }}
/>

Tip: Paths with similar point counts morph more smoothly.`} />
    </section>
  );
});

SVGMorphing.displayName = 'SVGMorphing';

// ═══════════════════════════════════════════════════════════════════════════
// 4. ANIMATED BLOB
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedBlob = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const [pathIndex, setPathIndex] = useState(0);
  const blobPaths = useMemo(() => [
    "M45.5,-51.2C59.1,-41.8,70.4,-27.3,73.2,-11.1C76,5.1,70.4,22.9,59.8,36.1C49.2,49.3,33.7,58,17.3,62.1C0.9,66.2,-16.4,65.8,-31.4,59.1C-46.4,52.5,-59.2,39.6,-66.2,23.6C-73.2,7.6,-74.5,-11.6,-67.6,-27.3C-60.7,-43,-45.6,-55.2,-29.8,-63.8C-14,-72.4,2.5,-77.4,18.2,-73.3C33.9,-69.2,48.8,-56,45.5,-51.2Z",
    "M41.9,-47.2C54.1,-38.7,63.6,-25.1,67.5,-9.4C71.4,6.3,69.7,24.1,60.4,37.1C51.1,50.1,34.2,58.2,17.1,61.8C0,65.4,-17.3,64.4,-32.8,57.8C-48.3,51.2,-62,39,-68.5,23.5C-75,8,-74.3,-10.9,-66.8,-26.3C-59.3,-41.7,-45,-53.7,-30.3,-61.4C-15.6,-69.1,-.4,-72.5,13.3,-70.1C27,-67.7,39.2,-59.5,41.9,-47.2Z",
  ], []);
  
  useEffect(() => { if (prefersReducedMotion) return; const i = setInterval(() => setPathIndex(p => (p + 1) % blobPaths.length), 3000); return () => clearInterval(i); }, [blobPaths.length, prefersReducedMotion]);
  
  return (
    <section style={{ padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SectionLabel number={3}>ANIMATED BLOB</SectionLabel>
      <SectionTitle>Organic Motion</SectionTitle>
      
      <div style={{ position: 'relative', width: '300px', height: '300px', marginBottom: '2rem' }}>
        <svg viewBox="-100 -100 200 200" style={{ width: '100%', height: '100%' }}>
          <defs><linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor={COLORS.accent} /><stop offset="50%" stopColor={COLORS.pink} /><stop offset="100%" stopColor={COLORS.teal} /></linearGradient></defs>
          <motion.path d={blobPaths[pathIndex]} fill="url(#blobGrad)" animate={{ d: blobPaths[pathIndex], rotate: [0, 360] }} transition={{ d: { duration: 2 }, rotate: { duration: 20, repeat: Infinity, ease: "linear" } }} style={{ transformOrigin: 'center' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '3rem' }}>🎨</span></div>
      </div>
      
      <AIPromptBox title="Animated Blob" prompt={`Create organic blob animation:

const blobPaths = [
  "M45.5,-51.2C59.1,-41.8...",
  "M41.9,-47.2C54.1,-38.7...",
];

<svg viewBox="-100 -100 200 200">
  <defs>
    <linearGradient id="blobGrad">
      <stop offset="0%" stopColor="#7432ff" />
      <stop offset="100%" stopColor="#2DD4BF" />
    </linearGradient>
  </defs>
  <motion.path
    d={blobPaths[index]}
    fill="url(#blobGrad)"
    animate={{ d: blobPaths[index], rotate: [0, 360] }}
    transition={{
      d: { duration: 2, ease: "easeInOut" },
      rotate: { duration: 20, repeat: Infinity, ease: "linear" }
    }}
  />
</svg>

Tool: https://www.blobmaker.app/ for blob paths`} />
    </section>
  );
});

AnimatedBlob.displayName = 'AnimatedBlob';

// ═══════════════════════════════════════════════════════════════════════════
// 5. WAVE ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

const WaveAnimation = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <section style={{ padding: '4rem 0', position: 'relative', overflow: 'hidden' }}>
      <SectionLabel number={4}>WAVE ANIMATION</SectionLabel>
      <SectionTitle>Layered SVG Waves</SectionTitle>
      
      <div style={{ position: 'relative', height: '220px', marginBottom: '2rem' }}>
        {[0, 1, 2].map(i => (
          <motion.svg key={i} viewBox="0 0 1440 320" style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', height: '100%' }} animate={prefersReducedMotion ? {} : { x: [0, '-50%'] }} transition={{ duration: 10 + i * 5, repeat: Infinity, ease: 'linear' }}>
            <path fill={i === 0 ? COLORS.accent : i === 1 ? COLORS.teal : COLORS.pink} fillOpacity={0.3 - i * 0.08} d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3C672,171,768,213,864,218.7C960,224,1056,192,1152,165.3C1248,139,1344,117,1392,106.7L1440,96L1440,320L0,320Z" />
          </motion.svg>
        ))}
      </div>
      
      <AIPromptBox title="Wave Animation" prompt={`Create layered wave animation:

{[0, 1, 2].map(i => (
  <motion.svg
    viewBox="0 0 1440 320"
    style={{ 
      position: 'absolute', 
      bottom: 0, 
      width: '200%'  // Double for seamless loop
    }}
    animate={{ x: [0, '-50%'] }}
    transition={{ 
      duration: 10 + i * 5,  // Different speeds
      repeat: Infinity, 
      ease: 'linear' 
    }}
  >
    <path
      fill={colors[i]}
      fillOpacity={0.3 - i * 0.08}
      d="M0,160L48,170.7..."
    />
  </motion.svg>
))}

Tool: https://getwaves.io/ for wave paths`} />
    </section>
  );
});

WaveAnimation.displayName = 'WaveAnimation';

// ═══════════════════════════════════════════════════════════════════════════
// 6. PULSE RINGS
// ═══════════════════════════════════════════════════════════════════════════

const PulseRings = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <section style={{ padding: '5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SectionLabel number={5}>PULSE RINGS</SectionLabel>
      <SectionTitle>Expanding Circles</SectionTitle>
      
      <div style={{ position: 'relative', width: '250px', height: '250px', marginBottom: '2rem' }}>
        {[0, 1, 2, 3].map(i => (
          <motion.div key={i}
            animate={prefersReducedMotion ? {} : { scale: [0.5, 2], opacity: [0.8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', inset: 0, border: `2px solid ${COLORS.accent}`, borderRadius: '50%' }} />
        ))}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: COLORS.gradientAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', boxShadow: `0 0 40px ${COLORS.glow}` }}>⚡</div>
        </div>
      </div>
      
      <AIPromptBox title="Pulse Rings" prompt={`Create expanding pulse rings:

{[0, 1, 2, 3].map(i => (
  <motion.div
    animate={{
      scale: [0.5, 2],
      opacity: [0.8, 0]
    }}
    transition={{
      duration: 2,
      repeat: Infinity,
      delay: i * 0.5,  // Stagger rings
      ease: 'easeOut'
    }}
    style={{
      position: 'absolute',
      inset: 0,
      border: '2px solid #7432ff',
      borderRadius: '50%'
    }}
  />
))}

Center element stays static while rings pulse outward.`} />
    </section>
  );
});

PulseRings.displayName = 'PulseRings';

// ═══════════════════════════════════════════════════════════════════════════
// 7. TYPEWRITER EFFECT
// ═══════════════════════════════════════════════════════════════════════════

const TypewriterEffect = memo(() => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.8 });
  const hasMounted = useHasMounted();
  const phrases = useMemo(() => ["Building the future...", "Crafting experiences...", "Animating dreams..."], []);
  
  useEffect(() => {
    if (!hasMounted || !isInView) return;
    let charIndex = 0;
    let isDeleting = false;
    const phrase = phrases[currentIndex];
    const type = () => {
      if (!isDeleting) { setDisplayText(phrase.slice(0, charIndex + 1)); charIndex++; if (charIndex === phrase.length) { setTimeout(() => { isDeleting = true; type(); }, 2000); return; } }
      else { setDisplayText(phrase.slice(0, charIndex - 1)); charIndex--; if (charIndex === 0) { isDeleting = false; setCurrentIndex(p => (p + 1) % phrases.length); return; } }
      setTimeout(type, isDeleting ? 50 : 100);
    };
    const t = setTimeout(type, 500);
    return () => clearTimeout(t);
  }, [hasMounted, isInView, currentIndex, phrases]);
  
  return (
    <section ref={ref} style={{ padding: '5rem 2rem', textAlign: 'center' }}>
      <SectionLabel number={6}>TYPEWRITER EFFECT</SectionLabel>
      <div style={{ minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 700 }}>
          {displayText}<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ color: COLORS.accent }}>|</motion.span>
        </h3>
      </div>
      
      <AIPromptBox title="Typewriter Effect" prompt={`Create typewriter text effect:

const [displayText, setDisplayText] = useState('');
const phrases = ["Hello...", "World..."];

useEffect(() => {
  let charIndex = 0;
  let isDeleting = false;
  const phrase = phrases[index];
  
  const type = () => {
    if (!isDeleting) {
      setDisplayText(phrase.slice(0, charIndex + 1));
      charIndex++;
      if (charIndex === phrase.length) {
        setTimeout(() => { isDeleting = true; type(); }, 2000);
        return;
      }
    } else {
      setDisplayText(phrase.slice(0, charIndex - 1));
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        setIndex(p => (p + 1) % phrases.length);
        return;
      }
    }
    setTimeout(type, isDeleting ? 50 : 100);
  };
  
  setTimeout(type, 500);
}, [index]);

// Blinking cursor
<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>`} />
    </section>
  );
});

TypewriterEffect.displayName = 'TypewriterEffect';

// ═══════════════════════════════════════════════════════════════════════════
// 8. TEXT SCRAMBLE
// ═══════════════════════════════════════════════════════════════════════════

const TextScramble = memo(() => {
  const [text, setText] = useState('HOVER ME');
  const [isHovered, setIsHovered] = useState(false);
  const hasMounted = useHasMounted();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';
  
  useEffect(() => {
    if (!hasMounted) return;
    const target = isHovered ? 'AMAZING!' : 'HOVER ME';
    let iteration = 0;
    const interval = setInterval(() => {
      setText(target.split('').map((c, i) => i < iteration ? target[i] : chars[Math.floor(Math.random() * chars.length)]).join(''));
      iteration += 1/3;
      if (iteration >= target.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [isHovered, hasMounted]);
  
  return (
    <section style={{ padding: '5rem 2rem', textAlign: 'center' }}>
      <SectionLabel number={7}>TEXT SCRAMBLE</SectionLabel>
      <motion.h3 onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} whileHover={{ scale: 1.05 }}
        style={{ fontSize: 'clamp(2rem, 7vw, 4rem)', fontWeight: 700, cursor: 'pointer', color: isHovered ? COLORS.accent : COLORS.text, transition: 'color 0.3s', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '2rem' }}>
        {text}
      </motion.h3>
      
      <AIPromptBox title="Text Scramble" prompt={`Create text scramble on hover:

const [text, setText] = useState('HOVER ME');
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*';

useEffect(() => {
  const target = isHovered ? 'AMAZING!' : 'HOVER ME';
  let iteration = 0;
  
  const interval = setInterval(() => {
    setText(
      target.split('').map((c, i) => 
        i < iteration ? target[i] : chars[Math.floor(Math.random() * chars.length)]
      ).join('')
    );
    iteration += 1/3;
    if (iteration >= target.length) clearInterval(interval);
  }, 30);
  
  return () => clearInterval(interval);
}, [isHovered]);

Use fontFamily: 'monospace' for consistent character widths.`} />
    </section>
  );
});

TextScramble.displayName = 'TextScramble';

// ═══════════════════════════════════════════════════════════════════════════
// 9. GLITCH TEXT
// ═══════════════════════════════════════════════════════════════════════════

const GlitchText = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <section style={{ padding: '5rem 2rem', textAlign: 'center', overflow: 'hidden' }}>
      <SectionLabel number={8}>GLITCH TEXT</SectionLabel>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: 'clamp(3rem, 12vw, 6rem)', fontWeight: 700 }}>GLITCH</h3>
        {!prefersReducedMotion && (
          <>
            <motion.h3 animate={{ x: [-2, 2, -1, 1, 0], opacity: [0, 1, 0.5, 1, 0] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }} style={{ fontSize: 'clamp(3rem, 12vw, 6rem)', fontWeight: 700, position: 'absolute', top: 0, left: 0, color: COLORS.accent, clipPath: 'inset(0 0 50% 0)' }} aria-hidden="true">GLITCH</motion.h3>
            <motion.h3 animate={{ x: [2, -2, 1, -1, 0], opacity: [0, 1, 0.5, 1, 0] }} transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3, delay: 0.1 }} style={{ fontSize: 'clamp(3rem, 12vw, 6rem)', fontWeight: 700, position: 'absolute', top: 0, left: 0, color: COLORS.teal, clipPath: 'inset(50% 0 0 0)' }} aria-hidden="true">GLITCH</motion.h3>
          </>
        )}
      </div>
      
      <AIPromptBox title="Glitch Text" prompt={`Create glitch text effect:

<div style={{ position: 'relative' }}>
  <h3>GLITCH</h3>
  
  {/* Top half - cyan */}
  <motion.h3
    animate={{ x: [-2, 2, -1, 1, 0], opacity: [0, 1, 0.5, 1, 0] }}
    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
    style={{
      position: 'absolute', top: 0, left: 0,
      color: '#7432ff',
      clipPath: 'inset(0 0 50% 0)'  // Top half
    }}
  >GLITCH</motion.h3>
  
  {/* Bottom half - teal */}
  <motion.h3
    animate={{ x: [2, -2, 1, -1, 0], opacity: [0, 1, 0.5, 1, 0] }}
    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3, delay: 0.1 }}
    style={{
      position: 'absolute', top: 0, left: 0,
      color: '#2DD4BF',
      clipPath: 'inset(50% 0 0 0)'  // Bottom half
    }}
  >GLITCH</motion.h3>
</div>`} />
    </section>
  );
});

GlitchText.displayName = 'GlitchText';

// ═══════════════════════════════════════════════════════════════════════════
// 10. PARALLAX IMAGE
// ═══════════════════════════════════════════════════════════════════════════

const ParallaxImage = memo(() => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [-80, 80]), SPRING.smooth);
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]), SPRING.smooth);
  
  return (
    <section style={{ padding: '2rem 0' }}>
      <SectionLabel number={9}>PARALLAX IMAGE</SectionLabel>
      <SectionTitle>Scroll-Linked Movement</SectionTitle>
      
      <div ref={ref} style={{ height: '50vh', overflow: 'hidden', position: 'relative', margin: '0 2rem', borderRadius: '20px', marginBottom: '2rem' }}>
        <motion.div style={{ y, scale, position: 'absolute', inset: '-15%', background: `linear-gradient(135deg, ${COLORS.accent}50, ${COLORS.pink}50, ${COLORS.teal}50)` }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 25% 25%, ${COLORS.accent}40 2px, transparent 2px)`, backgroundSize: '50px 50px' }} />
          <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 6, repeat: Infinity }} style={{ position: 'absolute', top: '25%', left: '25%', width: '120px', height: '120px', borderRadius: '24px', background: `${COLORS.accent}70`, backdropFilter: 'blur(10px)' }} />
          <motion.div animate={{ y: [0, 25, 0] }} transition={{ duration: 7, repeat: Infinity }} style={{ position: 'absolute', top: '45%', right: '30%', width: '80px', height: '80px', borderRadius: '50%', background: `${COLORS.teal}70` }} />
        </motion.div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, background: 'rgba(0,0,0,0.25)' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 700, textShadow: '0 4px 40px rgba(0,0,0,0.8)' }}>Parallax</h2>
        </div>
      </div>
      
      <AIPromptBox title="Parallax Image" prompt={`Create parallax scrolling:

const ref = useRef(null);
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start end", "end start"]
});

const y = useSpring(
  useTransform(scrollYProgress, [0, 1], [-80, 80]),
  { stiffness: 60, damping: 20 }
);

<div ref={ref} style={{ height: '50vh', overflow: 'hidden' }}>
  <motion.div style={{
    y,
    position: 'absolute',
    inset: '-15%'  // Extra size for movement room
  }}>
    <img src="..." style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </motion.div>
</div>

The -15% inset makes the image larger so movement doesn't show gaps.`} />
    </section>
  );
});

ParallaxImage.displayName = 'ParallaxImage';

// ═══════════════════════════════════════════════════════════════════════════
// 11. HERO REVEAL
// ═══════════════════════════════════════════════════════════════════════════

const HeroReveal = memo(() => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const smoothProgress = useSpring(scrollYProgress, SPRING.smooth);
  
  const clipPath = useTransform(smoothProgress, [0, 0.4, 1], ["inset(35% 30% 35% 30% round 32px)", "inset(5% 5% 5% 5% round 40px)", "inset(0% 0% 0% 0% round 0px)"]);
  const scale = useTransform(smoothProgress, [0, 0.4, 1], [0.6, 0.95, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);
  
  return (
    <section>
      <SectionLabel number={10}>HERO REVEAL</SectionLabel>
      <div ref={ref} style={{ height: '250vh', position: 'relative' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <motion.div style={{ clipPath, scale, opacity, position: 'absolute', inset: 0, background: COLORS.gradientAccent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 700, color: '#fff', textShadow: '0 4px 60px rgba(0,0,0,0.3)' }}>Hero Reveal</h2>
          </motion.div>
        </div>
      </div>
      
      <AIPromptBox title="Hero Reveal (Apple-style)" prompt={`Create Apple-style hero reveal:

const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end start"]
});

const clipPath = useTransform(
  scrollYProgress,
  [0, 0.4, 1],
  [
    "inset(35% 30% 35% 30% round 32px)",  // Small
    "inset(5% 5% 5% 5% round 40px)",      // Medium
    "inset(0% 0% 0% 0% round 0px)"        // Full
  ]
);

<div ref={ref} style={{ height: '250vh' }}>
  <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
    <motion.div style={{ clipPath, scale }}>
      Content
    </motion.div>
  </div>
</div>

The clipPath "inset()" with "round" creates animated rounded rectangles.`} />
    </section>
  );
});

HeroReveal.displayName = 'HeroReveal';

// ═══════════════════════════════════════════════════════════════════════════
// 12. HORIZONTAL SCROLL
// ═══════════════════════════════════════════════════════════════════════════

const HorizontalScroll = memo(() => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  
  const items = useMemo(() => [
    { title: "Horizontal", bg: COLORS.gradientAccent },
    { title: "Scrolling", bg: COLORS.gradientWarm },
    { title: "Experience", bg: COLORS.gradientCool },
    { title: "Amazing", bg: COLORS.gradientTeal },
  ], []);
  
  const x = useSpring(useTransform(scrollYProgress, [0, 1], ["5%", `-${(items.length - 1) * 100 + 5}%`]), SPRING.smooth);
  
  return (
    <section>
      <SectionLabel number={11}>HORIZONTAL SCROLL</SectionLabel>
      <div ref={ref} style={{ height: `${items.length * 100}vh` }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          <motion.div style={{ x, display: 'flex', height: '100%' }}>
            {items.map((item, i) => (
              <div key={i} style={{ minWidth: '100vw', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: item.bg, flexShrink: 0 }}>
                <h2 style={{ fontSize: 'clamp(3rem, 10vw, 6rem)', fontWeight: 700, color: '#fff' }}>{item.title}</h2>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      
      <AIPromptBox title="Horizontal Scroll" prompt={`Create horizontal scroll on vertical scroll:

const ref = useRef(null);
const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end end"]
});

const items = ['One', 'Two', 'Three', 'Four'];

const x = useSpring(
  useTransform(
    scrollYProgress,
    [0, 1],
    ["5%", \`-\${(items.length - 1) * 100 + 5}%\`]
  ),
  { stiffness: 60, damping: 20 }
);

<div ref={ref} style={{ height: \`\${items.length * 100}vh\` }}>
  <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
    <motion.div style={{ x, display: 'flex' }}>
      {items.map((item, i) => (
        <div style={{ minWidth: '100vw', flexShrink: 0 }}>
          {item}
        </div>
      ))}
    </motion.div>
  </div>
</div>

Height = items.length * 100vh gives scroll room for all panels.`} />
    </section>
  );
});

HorizontalScroll.displayName = 'HorizontalScroll';

// ═══════════════════════════════════════════════════════════════════════════
// 13. SLIDE PANELS
// ═══════════════════════════════════════════════════════════════════════════

const SlidePanels = memo(() => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  
  const panels = useMemo(() => [
    { color: COLORS.accent, text: '1', from: 'left' },
    { color: COLORS.pink, text: '2', from: 'right' },
    { color: COLORS.teal, text: '3', from: 'top' },
    { color: COLORS.blue, text: '4', from: 'bottom' },
  ], []);
  
  return (
    <section>
      <SectionLabel number={12}>SLIDE PANELS</SectionLabel>
      <div ref={ref} style={{ height: '400vh' }}>
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          {panels.map((panel, i) => {
            const start = i / panels.length;
            const end = start + 0.2;
            const fromX = panel.from === 'left' ? '-100%' : panel.from === 'right' ? '100%' : '0%';
            const fromY = panel.from === 'top' ? '-100%' : panel.from === 'bottom' ? '100%' : '0%';
            return (
              <motion.div key={i} style={{ x: useTransform(scrollYProgress, [start, end], [fromX, '0%']), y: useTransform(scrollYProgress, [start, end], [fromY, '0%']), position: 'absolute', inset: 0, background: panel.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: i }}>
                <span style={{ fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{panel.text}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      <AIPromptBox title="Slide Panels" prompt={`Create directional slide panels:

const panels = [
  { color: '#7432ff', text: '1', from: 'left' },
  { color: '#f5576c', text: '2', from: 'right' },
  { color: '#2DD4BF', text: '3', from: 'top' },
  { color: '#4facfe', text: '4', from: 'bottom' },
];

{panels.map((panel, i) => {
  const start = i / panels.length;
  const end = start + 0.2;
  
  const fromX = panel.from === 'left' ? '-100%' 
    : panel.from === 'right' ? '100%' : '0%';
  const fromY = panel.from === 'top' ? '-100%' 
    : panel.from === 'bottom' ? '100%' : '0%';
  
  return (
    <motion.div
      style={{
        x: useTransform(scrollYProgress, [start, end], [fromX, '0%']),
        y: useTransform(scrollYProgress, [start, end], [fromY, '0%']),
        position: 'absolute', inset: 0,
        zIndex: i
      }}
    >
      {panel.text}
    </motion.div>
  );
})}

Each panel slides from its direction as you scroll.`} />
    </section>
  );
});

SlidePanels.displayName = 'SlidePanels';

// ═══════════════════════════════════════════════════════════════════════════
// 14. CINEMATIC TEXT
// ═══════════════════════════════════════════════════════════════════════════

const CinematicText = memo(({ text, highlight = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.6 });
  const words = useMemo(() => text.split(' '), [text]);
  
  return (
    <section style={{ padding: 'clamp(4rem, 10vw, 8rem) 2rem' }}>
      <SectionLabel number={13}>CINEMATIC TEXT</SectionLabel>
      <h2 ref={ref} style={{ fontSize: 'clamp(1.8rem, 6vw, 4rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.2, textAlign: 'center', maxWidth: '900px', margin: '0 auto 2rem' }}>
        {words.map((word, i) => (
          <motion.span key={i} initial={{ opacity: 0, y: 80, rotateX: -60 }} animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}} transition={{ duration: 0.8, delay: i * 0.04, ease: EASE.out }} style={{ display: 'inline-block', marginRight: '0.25em', color: highlight && word.toLowerCase().includes(highlight.toLowerCase()) ? COLORS.accent : '#fff', transformStyle: 'preserve-3d' }}>
            {word}
          </motion.span>
        ))}
      </h2>
      
      <AIPromptBox title="Cinematic Text" prompt={`Create word-by-word cinematic reveal:

const words = text.split(' ');
const isInView = useInView(ref, { amount: 0.6 });

{words.map((word, i) => (
  <motion.span
    initial={{ opacity: 0, y: 80, rotateX: -60 }}
    animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
    transition={{
      duration: 0.8,
      delay: i * 0.04,  // Stagger
      ease: [0.16, 1, 0.3, 1]
    }}
    style={{
      display: 'inline-block',
      marginRight: '0.25em',
      transformStyle: 'preserve-3d'
    }}
  >
    {word}
  </motion.span>
))}

The rotateX creates a 3D flip-up effect for each word.`} />
    </section>
  );
});

CinematicText.displayName = 'CinematicText';

// ═══════════════════════════════════════════════════════════════════════════
// 15. CARD CAROUSEL
// ═══════════════════════════════════════════════════════════════════════════

const CardCarousel = memo(() => {
  const [current, setCurrent] = useState(0);
  const cards = useMemo(() => [
    { id: 1, title: "Performance", color: COLORS.accent, icon: "⚡" },
    { id: 2, title: "Smooth", color: COLORS.teal, icon: "🌊" },
    { id: 3, title: "Creative", color: COLORS.pink, icon: "🎨" },
    { id: 4, title: "Responsive", color: COLORS.blue, icon: "📱" },
  ], []);
  
  const handleDragEnd = useCallback((_, info) => {
    if (info.offset.x < -50 && current < cards.length - 1) setCurrent(p => p + 1);
    else if (info.offset.x > 50 && current > 0) setCurrent(p => p - 1);
  }, [current, cards.length]);
  
  return (
    <section style={{ padding: '4rem 0', overflow: 'hidden' }}>
      <SectionLabel number={14}>CARD CAROUSEL</SectionLabel>
      <SectionTitle>Draggable Cards</SectionTitle>
      <p style={{ textAlign: 'center', marginBottom: '1.5rem', opacity: 0.3, fontSize: '0.7rem', letterSpacing: '0.15em' }}>DRAG TO NAVIGATE</p>
      
      <div style={{ position: 'relative', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
        <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.1} onDragEnd={handleDragEnd} animate={{ x: -current * 280 }} transition={{ type: 'spring', ...SPRING.snappy }} style={{ display: 'flex', gap: '16px', cursor: 'grab', padding: '0 calc(50vw - 130px)' }}>
          {cards.map((card, i) => (
            <motion.div key={card.id} animate={{ scale: current === i ? 1 : 0.85, opacity: current === i ? 1 : 0.4 }} style={{ minWidth: '260px', height: '280px', borderRadius: '20px', background: `${card.color}20`, border: `1px solid ${card.color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', flexShrink: 0 }}>
              <span style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{card.icon}</span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: card.color }}>{card.title}</h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '2rem' }}>
        {cards.map((_, i) => (<button key={i} onClick={() => setCurrent(i)} style={{ width: current === i ? '20px' : '8px', height: '8px', borderRadius: '4px', border: 'none', background: current === i ? COLORS.accent : 'rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />))}
      </div>
      
      <AIPromptBox title="Card Carousel" prompt={`Create draggable card carousel:

const [current, setCurrent] = useState(0);

const handleDragEnd = (_, info) => {
  if (info.offset.x < -50 && current < cards.length - 1) 
    setCurrent(p => p + 1);
  else if (info.offset.x > 50 && current > 0) 
    setCurrent(p => p - 1);
};

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.1}
  onDragEnd={handleDragEnd}
  animate={{ x: -current * cardWidth }}
  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
>
  {cards.map((card, i) => (
    <motion.div
      animate={{
        scale: current === i ? 1 : 0.85,
        opacity: current === i ? 1 : 0.4
      }}
    >
      {card.content}
    </motion.div>
  ))}
</motion.div>`} />
    </section>
  );
});

CardCarousel.displayName = 'CardCarousel';

// ═══════════════════════════════════════════════════════════════════════════
// 16. CARD STACK
// ═══════════════════════════════════════════════════════════════════════════

const CardStack = memo(() => {
  const [cards, setCards] = useState([
    { id: 1, color: COLORS.accent, num: 1 },
    { id: 2, color: COLORS.teal, num: 2 },
    { id: 3, color: COLORS.pink, num: 3 },
    { id: 4, color: COLORS.blue, num: 4 },
  ]);
  
  const handleClick = useCallback(() => {
    setCards(p => { const n = [...p]; const f = n.shift(); if (f) n.push(f); return n; });
  }, []);
  
  return (
    <section style={{ padding: '5rem 2rem' }}>
      <SectionLabel number={15}>CARD STACK (FLIP)</SectionLabel>
      <SectionTitle>Click to Shuffle</SectionTitle>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <div onClick={handleClick} style={{ position: 'relative', width: '200px', height: '280px', cursor: 'pointer' }}>
          {cards.map((card, i) => (
            <motion.div key={card.id} layout animate={{ x: i * 6, y: i * -6, zIndex: cards.length - i, rotate: i === 0 ? 0 : (i % 2 === 0 ? 2 : -2) }} transition={{ type: 'spring', ...SPRING.bounce }} style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '16px', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{card.num}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <AIPromptBox title="Card Stack (FLIP)" prompt={`Create shuffling card stack:

const [cards, setCards] = useState([...]);

const handleClick = () => {
  setCards(p => {
    const n = [...p];
    const first = n.shift();
    if (first) n.push(first);
    return n;
  });
};

{cards.map((card, i) => (
  <motion.div
    key={card.id}
    layout  // ← Enables FLIP animation
    animate={{
      x: i * 6, y: i * -6,
      zIndex: cards.length - i,
      rotate: i === 0 ? 0 : (i % 2 === 0 ? 2 : -2)
    }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    {card.content}
  </motion.div>
))}

The "layout" prop handles position animation automatically.`} />
    </section>
  );
});

CardStack.displayName = 'CardStack';

// ═══════════════════════════════════════════════════════════════════════════
// 17. INFINITE MARQUEE
// ═══════════════════════════════════════════════════════════════════════════

const InfiniteMarquee = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const items = useMemo(() => [
    { icon: '⚡', text: 'GPU Accelerated' }, { icon: '🌊', text: 'Spring Physics' }, { icon: '🔮', text: 'SVG Morphing' },
    { icon: '✨', text: 'Line Drawing' }, { icon: '🎯', text: 'Scroll Triggers' }, { icon: '♿', text: 'Accessible' },
  ], []);
  const doubled = [...items, ...items];
  
  return (
    <section style={{ padding: '3rem 0', overflow: 'hidden' }}>
      <SectionLabel number={16}>INFINITE MARQUEE</SectionLabel>
      
      <div style={{ position: 'relative', marginBottom: '2rem' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', background: `linear-gradient(to right, ${COLORS.bg}, transparent)`, zIndex: 10, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: `linear-gradient(to left, ${COLORS.bg}, transparent)`, zIndex: 10, pointerEvents: 'none' }} />
        <motion.div animate={prefersReducedMotion ? {} : { x: [0, '-50%'] }} transition={{ x: { duration: 20, repeat: Infinity, ease: 'linear' } }} style={{ display: 'flex', gap: '1.5rem', width: 'fit-content' }}>
          {doubled.map((item, i) => (
            <div key={i} style={{ padding: '0.6rem 1.25rem', background: COLORS.bgCard, borderRadius: '100px', border: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap', fontWeight: 500, fontSize: '0.9rem' }}>
              <span style={{ color: COLORS.accent, marginRight: '0.5rem' }}>{item.icon}</span>{item.text}
            </div>
          ))}
        </motion.div>
      </div>
      
      <AIPromptBox title="Infinite Marquee" prompt={`Create seamless infinite marquee:

const items = [...];
const doubled = [...items, ...items];

<div style={{ overflow: 'hidden', position: 'relative' }}>
  {/* Fade edges */}
  <div style={{ position: 'absolute', left: 0, width: '80px',
    background: 'linear-gradient(to right, #1d233a, transparent)', zIndex: 10 }} />
  <div style={{ position: 'absolute', right: 0, width: '80px',
    background: 'linear-gradient(to left, #1d233a, transparent)', zIndex: 10 }} />
  
  <motion.div
    animate={{ x: [0, '-50%'] }}
    transition={{ x: { duration: 20, repeat: Infinity, ease: 'linear' } }}
    style={{ display: 'flex', gap: '1.5rem', width: 'fit-content' }}
  >
    {doubled.map((item, i) => <div key={i}>{item}</div>)}
  </motion.div>
</div>

Doubling items and animating to -50% creates perfect loop.`} />
    </section>
  );
});

InfiniteMarquee.displayName = 'InfiniteMarquee';

// ═══════════════════════════════════════════════════════════════════════════
// 18. COUNTER ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

const Counter = memo(({ end, suffix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.8 });
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!isInView) { setCount(0); return; }
    let start;
    const animate = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end]);
  
  return <span ref={ref} style={{ fontVariantNumeric: 'tabular-nums' }}>{count}{suffix}</span>;
});

Counter.displayName = 'Counter';

const CountersSection = memo(() => (
  <section style={{ padding: '5rem 2rem' }}>
    <SectionLabel number={17}>COUNTER ANIMATION</SectionLabel>
    <SectionTitle>Number Counting</SectionTitle>
    
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '2rem', maxWidth: '600px', margin: '0 auto 2rem', textAlign: 'center' }}>
      {[{ end: 120, suffix: ' fps', label: 'Performance' }, { end: 40, suffix: '+', label: 'Effects' }, { end: 100, suffix: '%', label: 'SSR Safe' }].map((c, i) => (
        <div key={i}>
          <div style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: COLORS.accent }}><Counter end={c.end} suffix={c.suffix} /></div>
          <div style={{ fontSize: '0.8rem', opacity: 0.4, marginTop: '0.3rem' }}>{c.label}</div>
        </div>
      ))}
    </div>
    
    <AIPromptBox title="Counter Animation" prompt={`Create animated counter:

const [count, setCount] = useState(0);
const isInView = useInView(ref, { amount: 0.8 });

useEffect(() => {
  if (!isInView) { setCount(0); return; }
  
  let startTime;
  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / 2000, 1);
    
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    setCount(Math.floor(eased * targetValue));
    
    if (progress < 1) requestAnimationFrame(animate);
  };
  
  requestAnimationFrame(animate);
}, [isInView, targetValue]);

<span style={{ fontVariantNumeric: 'tabular-nums' }}>{count}</span>

Use tabular-nums for consistent digit widths.`} />
  </section>
));

CountersSection.displayName = 'CountersSection';

// ═══════════════════════════════════════════════════════════════════════════
// 19. STAGGERED GRID
// ═══════════════════════════════════════════════════════════════════════════

const StaggeredGrid = memo(() => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.1 });
  const items = useMemo(() => Array.from({ length: 9 }, (_, i) => ({ id: i, color: [COLORS.accent, COLORS.teal, COLORS.pink, COLORS.blue, COLORS.orange][i % 5], icon: ['⚡', '🌊', '🎨', '📱', '♿', '🔮', '✨', '🧲', '🎯'][i] })), []);
  
  return (
    <section style={{ padding: '4rem 2rem' }}>
      <SectionLabel number={18}>STAGGERED GRID</SectionLabel>
      <SectionTitle>Scroll-Triggered Entrance</SectionTitle>
      
      <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.05, ease: EASE.out }} whileHover={{ scale: 1.05, zIndex: 10 }}
            style={{ aspectRatio: '1', borderRadius: '14px', background: `${item.color}25`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', cursor: 'pointer' }}>
            {item.icon}
          </motion.div>
        ))}
      </div>
      
      <AIPromptBox title="Staggered Grid" prompt={`Create staggered grid animation:

const isInView = useInView(ref, { amount: 0.1 });

{items.map((item, i) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: 40 }}
    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
    transition={{
      duration: 0.5,
      delay: i * 0.05,  // Stagger delay
      ease: [0.16, 1, 0.3, 1]
    }}
    whileHover={{ scale: 1.05, zIndex: 10 }}
  >
    {item.content}
  </motion.div>
))}

Each item appears with incremental delay for wave effect.`} />
    </section>
  );
});

StaggeredGrid.displayName = 'StaggeredGrid';

// ═══════════════════════════════════════════════════════════════════════════
// 20. ROTATING 3D TEXT
// ═══════════════════════════════════════════════════════════════════════════

const RotatingText = memo(() => {
  const prefersReducedMotion = useReducedMotion();
  const text = "MOTION";
  
  return (
    <section style={{ padding: '5rem 2rem', background: `${COLORS.accent}08` }}>
      <SectionLabel number={19}>ROTATING 3D TEXT</SectionLabel>
      <div style={{ display: 'flex', justifyContent: 'center', height: '120px', perspective: '400px', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', fontSize: 'clamp(3rem, 12vw, 5rem)', fontWeight: 700, color: COLORS.accent, gap: '0.02em' }}>
          {text.split('').map((char, i) => (
            <motion.span key={i} animate={prefersReducedMotion ? {} : { rotateX: [0, 360] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear', delay: i * 0.08 }} style={{ display: 'inline-block', transformStyle: 'preserve-3d', transformOrigin: 'center center -20px' }}>
              {char}
            </motion.span>
          ))}
        </div>
      </div>
      
      <AIPromptBox title="Rotating 3D Text" prompt={`Create per-character 3D rotation:

<div style={{ perspective: '400px' }}>
  {text.split('').map((char, i) => (
    <motion.span
      animate={{ rotateX: [0, 360] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
        delay: i * 0.08  // Wave effect
      }}
      style={{
        display: 'inline-block',
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center -20px'
      }}
    >
      {char}
    </motion.span>
  ))}
</div>

The perspective on parent enables 3D effect. transformOrigin offset creates rotation axis.`} />
    </section>
  );
});

RotatingText.displayName = 'RotatingText';

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS
// ═══════════════════════════════════════════════════════════════════════════

const ScrollProgress = memo(() => {
  const { progress, isReady } = useSmoothScroll();
  if (!isReady) return null;
  return <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: COLORS.gradientAccent, scaleX: progress, transformOrigin: 'left', zIndex: 9999 }} />;
});

ScrollProgress.displayName = 'ScrollProgress';

// ═══════════════════════════════════════════════════════════════════════════
// FULLSCREEN DEMO
// ═══════════════════════════════════════════════════════════════════════════

const FullscreenDemo = memo(({ onExit }) => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const dir = useRef(1);
  
  const sections = useMemo(() => [
    { title: "Scroll", subtitle: "Begin the journey", bg: COLORS.gradientAccent },
    { title: "Flow", subtitle: "Smooth as butter", bg: COLORS.gradientWarm },
    { title: "Feel", subtitle: "Every interaction", bg: COLORS.gradientCool },
    { title: "Create", subtitle: "Memorable experiences", bg: COLORS.gradientTeal },
    { title: "Oronts", subtitle: "oronts.com", bg: COLORS.gradientNight },
  ], []);
  
  const go = useCallback((i, d) => {
    if (animating) return;
    setAnimating(true);
    dir.current = d;
    setCurrent(((i % sections.length) + sections.length) % sections.length);
    setTimeout(() => setAnimating(false), 800);
  }, [animating, sections.length]);
  
  useEffect(() => {
    let lastTime = 0;
    const handleWheel = (e) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastTime < 100 || animating) return;
      lastTime = now;
      go(current + (e.deltaY > 0 ? 1 : -1), e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [current, animating, go]);
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 1000 }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem', zIndex: 100 }}>
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>ORONTS.COM • MOTION LAB</span>
        <MagneticButton onClick={onExit} variant="secondary" size="sm">Exit</MagneticButton>
      </header>
      
      <AnimatePresence initial={false} mode="sync">
        <motion.div key={current} initial={{ clipPath: dir.current > 0 ? 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' : 'polygon(0 0, 100% 0, 100% 0, 0 0)' }} animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} exit={{ clipPath: dir.current > 0 ? 'polygon(0 0, 100% 0, 100% 0, 0 0)' : 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)' }} transition={{ duration: 0.8, ease: EASE.inOut }} style={{ position: 'absolute', inset: 0 }}>
          <motion.div initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }} style={{ width: '100%', height: '100%', background: sections[current].bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.5, y: 0 }} transition={{ delay: 0.3 }} style={{ fontSize: '0.8rem', letterSpacing: '0.3em', marginBottom: '1rem' }}>{sections[current].subtitle}</motion.span>
            <motion.h2 initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ fontSize: 'clamp(4rem, 15vw, 12rem)', fontWeight: 700, letterSpacing: '-0.05em' }}>{sections[current].title}</motion.h2>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      <div style={{ position: 'fixed', right: '2rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 100 }}>
        {sections.map((_, i) => (<motion.button key={i} onClick={() => go(i, i > current ? 1 : -1)} whileHover={{ scale: 1.3 }} style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', background: current === i ? '#fff' : 'transparent', cursor: 'pointer', padding: 0 }} />))}
      </div>
    </div>
  );
});

FullscreenDemo.displayName = 'FullscreenDemo';

// ═══════════════════════════════════════════════════════════════════════════
// DOCS PANEL
// ═══════════════════════════════════════════════════════════════════════════

const DocsPanel = memo(({ onClose }) => {
  const effects = useMemo(() => [
    'SVG Line Drawing', 'SVG Morphing', 'Animated Blob', 'Wave Animation', 'Pulse Rings',
    'Typewriter', 'Text Scramble', 'Glitch Text', 'Parallax Image', 'Hero Reveal',
    'Horizontal Scroll', 'Slide Panels', 'Cinematic Text', 'Card Carousel', 'Card Stack',
    'Infinite Marquee', 'Counter Animation', 'Staggered Grid', 'Rotating 3D Text',
  ], []);
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)', zIndex: 2000, overflow: 'auto', padding: '2rem' }}>
      <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', margin: '0 auto', background: COLORS.bgCard, borderRadius: '24px', padding: '2rem', border: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: COLORS.accent }}>🤖 All AI Prompts</h2>
          <MagneticButton onClick={onClose} variant="secondary" size="sm">Close</MagneticButton>
        </div>
        <p style={{ opacity: 0.5, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Each section has a detailed AI prompt. Scroll through the page and click "📋 Copy" on any effect!</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {effects.map((name, i) => (
            <div key={i} style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
              <span style={{ color: COLORS.accent, fontSize: '0.7rem', opacity: 0.6 }}>#{(i + 1).toString().padStart(2, '0')}</span>
              <span>{name}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: `${COLORS.accent}10`, borderRadius: '12px', border: `1px solid ${COLORS.accent}20` }}>
          <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem' }}>
            <strong style={{ color: COLORS.accent }}>Built by Oronts GmbH</strong>
          </p>
          <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>
            AI-First Technology Solutions • <a href="https://oronts.com" style={{ color: COLORS.accent }}>oronts.com</a>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
});

DocsPanel.displayName = 'DocsPanel';

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════

const Footer = memo(() => (
  <footer style={{ padding: 'clamp(4rem, 10vw, 8rem) 2rem', textAlign: 'center', borderTop: `1px solid ${COLORS.border}` }}>
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={TRANSITION.medium}>
      <div style={{ marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: COLORS.accent }}>ORONTS.COM</span>
      </div>
      <p style={{ fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
        Built with <span style={{ color: COLORS.accent }}>Framer Motion</span>
      </p>
      <p style={{ opacity: 0.4, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        40+ Effects • AI Prompts • SSR Safe • GPU Accelerated
      </p>
      <p style={{ opacity: 0.3, fontSize: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
        Copy any prompt and paste into Claude, GPT, or your favorite AI assistant to recreate these effects instantly.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <a href="https://oronts.com" style={{ color: COLORS.accent, fontSize: '0.85rem', textDecoration: 'none', fontWeight: 500 }}>
          Visit oronts.com →
        </a>
      </div>
    </motion.div>
  </footer>
));

Footer.displayName = 'Footer';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL STYLES
// ═══════════════════════════════════════════════════════════════════════════

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: auto; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; background: ${COLORS.bg}; color: ${COLORS.text}; }
    ::selection { background: ${COLORS.accent}; color: #fff; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
    ::-webkit-scrollbar-thumb { background: ${COLORS.accent}50; border-radius: 3px; }
    pre { scrollbar-width: thin; }
    a { color: inherit; }
  `}</style>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

function OrontsMotionLab() {
  const [showDemo, setShowDemo] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  
  if (showDemo) return <FullscreenDemo onExit={() => setShowDemo(false)} />;
  
  return (
    <SmoothScrollProvider>
      <div style={{ background: COLORS.bg, color: COLORS.text, minHeight: '100vh' }}>
        <GlobalStyles />
        <ScrollProgress />
        
        <AnimatePresence>
          {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
        </AnimatePresence>
        
        {/* Hero */}
        <LuxuryHero onOpenDemo={() => setShowDemo(true)} onOpenDocs={() => setShowDocs(true)} />
        
        {/* SVG Effects */}
        <SVGLineDrawing />
        <SVGMorphing />
        <AnimatedBlob />
        <WaveAnimation />
        <PulseRings />
        
        {/* Text Effects */}
        <TypewriterEffect />
        <TextScramble />
        <GlitchText />
        
        {/* Scroll Effects */}
        <ParallaxImage />
        <HeroReveal />
        <HorizontalScroll />
        <SlidePanels />
        <CinematicText text="Motion creates emotion and memorable experiences at oronts.com" highlight="oronts" />
        
        {/* Components */}
        <CardCarousel />
        <CardStack />
        <InfiniteMarquee />
        <CountersSection />
        <StaggeredGrid />
        <RotatingText />
        
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}

export default OrontsMotionLab;
