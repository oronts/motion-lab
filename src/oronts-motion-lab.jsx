'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback, memo, createContext, useContext } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView, useMotionValue, useReducedMotion } from 'framer-motion';

/*
  Motion Lab — oronts.com

  19 Framer Motion effects with copy-paste prompts.
  Browse, grab the prompt, paste into your LLM, get working code.

  React 18 + Framer Motion 11 + Next.js 14 (static export)
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
          <span style={{ fontSize: '1.25rem' }}>📋</span>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.12em', color: COLORS.accent, fontWeight: 600 }}>PROMPT: {title}</span>
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
          Scroll animations, SVG effects, and interactive components. Browse the effects, copy the prompt, paste into your LLM, get working code. Built by <strong style={{ color: COLORS.accent }}>Oronts</strong>.
        </motion.p>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...TRANSITION.medium, delay: 0.5 }} style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <MagneticButton onClick={onOpenDemo} variant="primary" size="lg">⚡ Fullscreen Demo</MagneticButton>
          <MagneticButton onClick={onOpenDocs} variant="secondary" size="lg">📖 All Prompts</MagneticButton>
        </motion.div>
        
        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem', flexWrap: 'wrap' }}>
          {[{ num: '19', label: 'Effects' }, { num: '19', label: 'Prompts' }, { num: '0', label: 'Dependencies' }].map((s, i) => (
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
      
      <AIPromptBox title="SVG Line Drawing" prompt={`Build an SVG line-drawing animation in React with Framer Motion.

I want several SVG shapes (star, hexagon, circle, curve, nested triangles) that draw themselves stroke-by-stroke when they scroll into view. Each shape should start with pathLength: 0 and animate to pathLength: 1, staggered so they don't all fire at once.

Use useInView to detect when the container hits the viewport. Reset when it leaves so re-scrolling replays it.

Here's the pattern for one shape:

<motion.path
  d="M50 5 L61 35 L95 35 L68 57 L79 90 L50 70 L21 90 L32 57 L5 35 L39 35 Z"
  stroke="#7432ff"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  fill="none"
  initial={{ pathLength: 0 }}
  animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
  transition={{ duration: 2, ease: "easeInOut", delay: 0 }}
/>

Give each shape a different delay (0, 0.2, 0.4, ...) and a different stroke color.`} />
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
      
      <AIPromptBox title="SVG Morphing" prompt={`Build an SVG shape morpher in React with Framer Motion.

I want a single <motion.path> that cycles through different shapes: triangle, square, pentagon, circle. It should auto-advance every 2 seconds, and I also want clickable dot indicators to jump to any shape.

Animate both the d attribute and the fill color at the same time. Use Framer Motion's animate prop:

animate={{ d: shapes[currentIndex], fill: colors[currentIndex] }}
transition={{ duration: 0.8, ease: "easeInOut" }}

Keep the SVG viewBox at "0 0 100 100". Paths with similar point counts morph more cleanly — for the circle, use an arc path like "M50,10 A40,40 0 1,1 49.99,10 Z" instead of actual circle elements.`} />
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
      
      <AIPromptBox title="Animated Blob" prompt={`Build an animated blob component in React with Framer Motion and SVG.

I want an organic-looking blob that slowly morphs between two different blob shapes and also rotates continuously. Fill it with a gradient (purple to teal).

Use an SVG with viewBox="-100 -100 200 200". Define two blob paths (generated from blobmaker.app) and toggle between them on a 3-second interval. Animate both the d attribute and a 360-degree rotation:

animate={{ d: blobPaths[index], rotate: [0, 360] }}
transition={{
  d: { duration: 2 },
  rotate: { duration: 20, repeat: Infinity, ease: "linear" }
}}

Use an SVG <linearGradient> for the fill. The blob should feel alive — slow rotation, smooth shape transitions.`} />
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
      
      <AIPromptBox title="Wave Animation" prompt={`Build a layered wave animation in React with Framer Motion.

I want 3 overlapping SVG waves at the bottom of a section, each scrolling horizontally at different speeds to create a parallax depth effect. The trick for a seamless loop: make the SVG 200% wide and animate x from 0 to -50%, then repeat infinitely with ease: "linear".

Each wave layer should have a different speed (10s, 15s, 20s), a different color, and decreasing opacity so the layers feel like depth.

Generate wave paths with getwaves.io or use a single wavy path like:
d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,165.3..."

The container needs overflow: hidden and a fixed height (~220px). Position the SVGs absolute, pinned to the bottom.`} />
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
      
      <AIPromptBox title="Pulse Rings" prompt={`Build a pulse ring animation in React with Framer Motion.

I want 4 concentric circles that continuously expand outward and fade. Each ring starts at scale 0.5, animates to scale 2, and goes from opacity 0.8 to 0. Stagger the rings with delay: i * 0.5 so they ripple outward like sonar.

In the center, place a static element (icon or button) that doesn't animate — it acts as the "source" of the pulse.

All the rings are position: absolute, inset: 0 inside a relative container. Use border: "2px solid #7432ff" and borderRadius: "50%" — no fill, just the stroke expanding. The animation repeats infinitely with ease: "easeOut" for a natural deceleration.`} />
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
      
      <AIPromptBox title="Typewriter Effect" prompt={`Build a typewriter text effect in React with Framer Motion.

I want text that types out character by character, pauses for 2 seconds, then deletes character by character, then types the next phrase from an array. It should loop through all phrases endlessly.

Typing speed: ~100ms per character. Deleting speed: ~50ms per character (faster feels more natural). After deleting, immediately start the next phrase.

Add a blinking cursor at the end using Framer Motion:
<motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>|</motion.span>

Use useInView so it only starts typing when scrolled into view. Use setTimeout chains (not setInterval) since the timing varies between typing and deleting modes. Track displayText in state, charIndex and isDeleting in local variables inside the effect.`} />
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
      
      <AIPromptBox title="Text Scramble" prompt={`Build a text scramble/decode effect in React that triggers on hover.

When the user hovers, the text scrambles into random characters and then resolves character-by-character into a new word. When they leave, it scrambles back to the original.

The approach: run a setInterval at 30ms. On each tick, map over the target string — characters before the current iteration index show the real letter, characters after show a random one from "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*". Increment iteration by 1/3 each tick so it takes a few frames per character to resolve.

Use fontFamily: "monospace" so the text doesn't jump around as characters change (monospace keeps every character the same width). Track isHovered state and derive the target string from it.`} />
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
      
      <AIPromptBox title="Glitch Text" prompt={`Build a glitch text effect in React with Framer Motion.

Stack three copies of the same text on top of each other using position: absolute. The base layer is white (static). The two glitch layers are different colors (purple and teal) and use clipPath to show only the top or bottom half:

- Layer 1: clipPath: "inset(0 0 50% 0)" — shows top half, colored purple
- Layer 2: clipPath: "inset(50% 0 0 0)" — shows bottom half, colored teal

Animate both glitch layers with a quick x-axis jitter: x: [-2, 2, -1, 1, 0] over 0.2 seconds, then pause for 3 seconds (repeatDelay: 3) before glitching again. Offset the second layer by delay: 0.1 so they don't move in sync.

The effect: the text sits still, then briefly splits into RGB-shifted halves, then snaps back. Looks like a digital signal error.`} />
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
      
      <AIPromptBox title="Parallax Image" prompt={`Build a parallax scrolling section in React with Framer Motion.

I want an image (or background) that moves slower than the page scroll, creating a depth effect. As the section scrolls through the viewport, the inner content shifts vertically from -80px to +80px.

Use useScroll with target: ref and offset: ["start end", "end start"] — this tracks from when the section enters the bottom of the viewport to when it leaves the top. Pipe scrollYProgress through useTransform to map [0, 1] → [-80, 80], then through useSpring for smooth interpolation.

The container needs overflow: hidden and a fixed height. Make the inner element larger than the container (inset: "-15%") so the parallax movement doesn't reveal empty space at the edges. Add a subtle scale animation too: scale from 1.1 → 1 → 1.1 across the scroll range for extra polish.`} />
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
      
      <AIPromptBox title="Hero Reveal (Apple-style)" prompt={`Build an Apple-style hero reveal in React with Framer Motion.

I want a section that starts as a small rounded rectangle in the center of the screen and expands to fill the entire viewport as the user scrolls. Like the product reveals on apple.com.

The trick is animating CSS clipPath with Framer Motion's useTransform. Map scroll progress to three keyframes:

- 0%: "inset(35% 30% 35% 30% round 32px)" — small centered box
- 40%: "inset(5% 5% 5% 5% round 40px)" — almost full with rounded corners
- 100%: "inset(0% 0% 0% 0% round 0px)" — full bleed, no rounding

The outer container needs height: 250vh to give enough scroll room. Inside, use position: sticky with top: 0 and height: 100vh so the content stays pinned while the clip-path animates. Also animate scale from 0.6 → 1 for an additional zoom-in feel.`} />
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
      
      <AIPromptBox title="Horizontal Scroll" prompt={`Build a horizontal scroll section driven by vertical scrolling in React with Framer Motion.

I want a row of full-viewport panels that move horizontally as the user scrolls vertically. The section stays pinned to the screen while the panels slide left.

How it works: the outer container height = number of panels * 100vh. Inside, a sticky div (top: 0, height: 100vh, overflow: hidden) pins the content. A flex row of panels (each minWidth: 100vw, flexShrink: 0) is translated on the x-axis based on scroll progress.

Use useScroll with offset: ["start start", "end end"] to track the full scroll range. Map scrollYProgress [0, 1] to x position ["5%", "-305%"] (for 4 panels: -(panels - 1) * 100 + 5). Wrap it in useSpring({ stiffness: 60, damping: 20 }) so the movement feels smooth instead of jerky.

Give each panel a different background gradient so the transitions are visually clear.`} />
    </section>
  );
});

HorizontalScroll.displayName = 'HorizontalScroll';

// ═══════════════════════════════════════════════════════════════════════════
// 13. SLIDE PANELS
// ═══════════════════════════════════════════════════════════════════════════

const SlidePanel = memo(({ panel, index, total, scrollYProgress }) => {
  const start = index / total;
  const end = start + 0.2;
  const fromX = panel.from === 'left' ? '-100%' : panel.from === 'right' ? '100%' : '0%';
  const fromY = panel.from === 'top' ? '-100%' : panel.from === 'bottom' ? '100%' : '0%';
  const x = useTransform(scrollYProgress, [start, end], [fromX, '0%']);
  const y = useTransform(scrollYProgress, [start, end], [fromY, '0%']);

  return (
    <motion.div style={{ x, y, position: 'absolute', inset: 0, background: panel.color, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: index }}>
      <span style={{ fontSize: 'clamp(6rem, 20vw, 12rem)', fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>{panel.text}</span>
    </motion.div>
  );
});

SlidePanel.displayName = 'SlidePanel';

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
          {panels.map((panel, i) => (
            <SlidePanel key={i} panel={panel} index={i} total={panels.length} scrollYProgress={scrollYProgress} />
          ))}
        </div>
      </div>
      
      <AIPromptBox title="Slide Panels" prompt={`Build directional slide panels in React with Framer Motion.

I want 4 full-screen panels that slide in from different edges (left, right, top, bottom) as the user scrolls. Each panel covers the previous one, creating a layered stacking effect.

The layout: a tall container (400vh) with a sticky viewport inside. Each panel is position: absolute, inset: 0 and stacked with increasing z-index. Use useScroll to track progress, then useTransform to map each panel's entrance to a different scroll range.

For panel i out of N total: start = i / N, end = start + 0.2. Map [start, end] to the panel's entry axis — a "left" panel goes from x: "-100%" to x: "0%", a "bottom" panel goes from y: "100%" to y: "0%", etc.

Important: each panel needs its own useTransform call, so extract panels into a child component to avoid calling hooks inside .map(). Give each panel a bold background color and a large centered number.`} />
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
      
      <AIPromptBox title="Cinematic Text" prompt={`Build a cinematic word-by-word text reveal in React with Framer Motion.

Split a sentence into individual words, wrap each in a <motion.span>, and animate them in sequence when the section scrolls into view. Each word starts off-screen (y: 80, opacity: 0) and rotated backward (rotateX: -60), then flips up into position.

Stagger the delays: delay: i * 0.04 per word. Use a punchy ease curve like [0.16, 1, 0.3, 1] and duration: 0.8 so it feels fast but smooth.

Each word needs display: "inline-block" (otherwise transform won't work on inline elements) and transformStyle: "preserve-3d" for the rotateX to render in 3D. Add marginRight: "0.25em" for word spacing.

Use useInView with amount: 0.6 so the animation fires when the text is mostly visible. Optionally highlight a keyword in a different color.`} />
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
      
      <AIPromptBox title="Card Carousel" prompt={`Build a draggable card carousel in React with Framer Motion.

I want a horizontal row of cards that the user can swipe/drag to navigate. When you drag left past a threshold (-50px), it snaps to the next card. Drag right past +50px, it goes back. The current card is full size, adjacent cards are scaled down (0.85) and dimmed (opacity 0.4).

Use Framer Motion's drag="x" on the container. Set dragConstraints={{ left: 0, right: 0 }} so it always snaps back, and dragElastic={0.1} for a subtle rubber-band feel. In onDragEnd, check info.offset.x to decide whether to advance or go back.

Animate the container's x position to -current * cardWidth with a spring transition (stiffness: 400, damping: 35). Center the carousel with padding: "0 calc(50vw - halfCardWidth)".

Add dot indicators at the bottom — the active dot is wider (20px vs 8px) to show which card is selected.`} />
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
      
      <AIPromptBox title="Card Stack (FLIP)" prompt={`Build a card stack with shuffle animation in React with Framer Motion.

I want a stack of cards piled on top of each other with slight offsets (x: i * 6, y: i * -6). Clicking the stack takes the top card and sends it to the back of the pile. The cards animate into their new positions smoothly.

The key is Framer Motion's layout prop — add it to each card and it handles the FLIP animation (First, Last, Invert, Play) automatically when the array order changes. Use key={card.id} (not the array index) so React and Framer Motion can track each card's identity across reorders.

On click, shift the first element off the array and push it to the end. The cards that were behind move forward, and the previously-top card slides to the back.

Use a bouncy spring (stiffness: 300, damping: 20, mass: 0.6) and add a subtle alternating rotation (2 or -2 degrees) on non-top cards for a casual, tossed look.`} />
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
      
      <AIPromptBox title="Infinite Marquee" prompt={`Build an infinite scrolling marquee in React with Framer Motion.

I want a horizontal ticker that scrolls continuously, like a news crawl or a brand logo bar. It should loop seamlessly with no visible seam or jump.

The trick: duplicate the item array (const doubled = [...items, ...items]) and animate x from 0 to "-50%". Since the content is doubled, reaching -50% puts you exactly where you started — the loop is invisible.

Use ease: "linear" and repeat: Infinity so it never accelerates or pauses. Set width: "fit-content" on the flex container so it sizes to its content.

Add fade-out edges on both sides using absolutely positioned gradient overlays (linear-gradient from your background color to transparent, ~80px wide, z-index above the content). This hides the hard edges and looks polished.

The container needs overflow: hidden. Duration around 20s feels relaxed — adjust to taste.`} />
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
    
    <AIPromptBox title="Counter Animation" prompt={`Build an animated number counter in React that counts up when scrolled into view.

When the element enters the viewport, count from 0 to the target number over 2 seconds using requestAnimationFrame. Apply an ease-out cubic curve (1 - Math.pow(1 - progress, 3)) so it starts fast and decelerates — this feels more natural than linear counting.

Use useInView with amount: 0.8 so it triggers when mostly visible. When it scrolls out of view, reset to 0 so re-scrolling replays the animation.

Use fontVariantNumeric: "tabular-nums" on the display element — this makes all digits the same width so the number doesn't jump around as it counts (the "1" won't be narrower than "0").

Accept props for the target number and an optional suffix like "+" or "%". Render as a span so it can sit inline with labels.`} />
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
      
      <AIPromptBox title="Staggered Grid" prompt={`Build a staggered grid entrance animation in React with Framer Motion.

I want a grid of items that pop in one after another when the grid scrolls into view — a cascade/wave effect. Each item starts scaled down (0.8), shifted down (y: 40), and invisible (opacity: 0), then springs into place.

The stagger comes from delay: i * 0.05 on each item. With a 3x3 grid that's 9 items, the last one starts 0.4s after the first — fast enough to feel connected, slow enough to read as a wave.

Use useInView with a low threshold (amount: 0.1) so it fires as soon as the grid peeks into view. Add whileHover={{ scale: 1.05, zIndex: 10 }} for interactivity.

Use CSS Grid with repeat(3, 1fr) and aspect-ratio: 1 for square cells. The ease curve [0.16, 1, 0.3, 1] gives a snappy entrance with a soft landing.`} />
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
      
      <AIPromptBox title="Rotating 3D Text" prompt={`Build per-character 3D rotating text in React with Framer Motion.

Split a word into individual characters, wrap each in a <motion.span>, and rotate them on the X axis continuously (rotateX: [0, 360]). Stagger the start with delay: i * 0.08 so the characters ripple like a wave — each one is slightly behind the previous.

The parent container needs perspective: "400px" to enable 3D rendering. Each character needs transformStyle: "preserve-3d" and, critically, transformOrigin: "center center -20px" — the negative Z offset moves the rotation axis behind the character so it rotates around a barrel shape instead of flipping flat.

Use ease: "linear" for continuous smooth rotation. Duration around 1.5s per full rotation. display: "inline-block" on each span so rotateX applies (transforms don't work on inline elements).`} />
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: COLORS.accent }}>All Effects</h2>
          <MagneticButton onClick={onClose} variant="secondary" size="sm">Close</MagneticButton>
        </div>
        <p style={{ opacity: 0.5, marginBottom: '1.5rem', fontSize: '0.9rem' }}>Scroll to any effect and click Copy to grab its prompt. Paste into your LLM to get working code.</p>
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
        19 Effects • Copy-Paste Prompts • React + Framer Motion
      </p>
      <p style={{ opacity: 0.3, fontSize: '0.75rem', maxWidth: '500px', margin: '0 auto' }}>
        Find an effect you like, copy the prompt, paste it into your LLM, and get working code for your project.
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
