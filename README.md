<p align="center">
  <img src="https://raw.githubusercontent.com/oronts/motion-lab/main/assets/logo.svg" alt="Oronts Motion Lab" width="120" />
</p>

<h1 align="center">Oronts Motion Lab</h1>

<p align="center">
  <strong>40+ Production-Ready Scroll & SVG Animations with AI Prompts</strong>
</p>

<p align="center">
  <a href="https://oronts.com">
    <img src="https://img.shields.io/badge/Built%20by-Oronts%20-7432ff?style=for-the-badge" alt="Built by Oronts" />
  </a>
  <a href="https://react.dev">
    <img src="https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 18+" />
  </a>
  <a href="https://www.framer.com/motion/">
    <img src="https://img.shields.io/badge/Framer%20Motion-11+-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-Ready-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js Ready" />
  </a>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-effects-catalog">Effects</a> •
  <a href="#-ai-prompts">AI Prompts</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## Features

- **40+ Premium Animations** — Scroll effects, SVG animations, text reveals, and interactive components
- **AI Prompts Included** — Copy-paste prompts for Claude, GPT, or any AI assistant to recreate effects instantly
- **Production Ready** — GPU-accelerated, 120fps performance, battle-tested in real projects
- **SSR Safe** — Works perfectly with Next.js App Router, Pages Router, Remix, and Gatsby
- **Fully Accessible** — Respects `prefers-reduced-motion`, semantic HTML, ARIA labels
- **TypeScript Ready** — Full type definitions included
- **Zero Dependencies** — Only requires React and Framer Motion

## Demo

**[Live Demo →](https://motion-lab.oronts.com)**

Or run locally:

```bash
git clone https://github.com/oronts/motion-lab.git
cd motion-lab
npm install
npm run dev
```

## Installation

### Option 1: Clone Repository

```bash
git clone https://github.com/oronts/motion-lab.git
cd motion-lab
npm install
```

### Requirements

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "framer-motion": "^11.0.0"
  }
}
```

## Effects Catalog

### SVG Animations

| # | Effect | Description |
|:-:|--------|-------------|
| 01 | **SVG Line Drawing** | Animated `pathLength` on scroll trigger |
| 02 | **SVG Morphing** | Shape-to-shape transformation |
| 03 | **Animated Blob** | Organic morphing gradient blob |
| 04 | **Wave Animation** | Layered parallax waves |
| 05 | **Pulse Rings** | Expanding circle ripples |

### Text Effects

| # | Effect | Description |
|:-:|--------|-------------|
| 06 | **Typewriter** | Character-by-character typing |
| 07 | **Text Scramble** | Decode effect on hover |
| 08 | **Glitch Text** | RGB split glitch animation |

### Scroll Effects

| # | Effect | Description |
|:-:|--------|-------------|
| 09 | **Parallax Image** | Scroll-linked movement & scale |
| 10 | **Hero Reveal** | Apple-style clip-path expansion |
| 11 | **Horizontal Scroll** | Vertical scroll → horizontal movement |
| 12 | **Slide Panels** | Directional panel reveals |
| 13 | **Cinematic Text** | Word-by-word 3D reveal |

### Components

| # | Effect | Description |
|:-:|--------|-------------|
| 14 | **Card Carousel** | Draggable with spring physics |
| 15 | **Card Stack** | FLIP shuffle animation |
| 16 | **Infinite Marquee** | Seamless auto-scroll loop |
| 17 | **Counter Animation** | Number counting with easing |
| 18 | **Staggered Grid** | Scroll-triggered entrance |
| 19 | **Rotating 3D Text** | Per-character rotation |

### Utility Components

| Component | Description |
|-----------|-------------|
| **Magnetic Button** | Cursor-following hover effect |
| **Ambient Particles** | Floating background particles |
| **Scroll Progress** | Fixed top progress bar |
| **Smooth Scroll Provider** | Lenis-style smooth scrolling |

## AI Prompts

Every effect includes a detailed AI prompt for instant reproduction. Click "📋 Copy" on any effect to get a prompt like this:

```
Create horizontal scroll on vertical scroll with Framer Motion:

1. useScroll to track scroll progress
2. useTransform to map Y scroll to X position
3. Sticky container with overflow hidden
4. Multiple panels at 100vw each

const { scrollYProgress } = useScroll({
  target: ref,
  offset: ["start start", "end end"]
});

const x = useTransform(
  scrollYProgress,
  [0, 1],
  ["5%", `-${(items.length - 1) * 100 + 5}%`]
);

<div ref={ref} style={{ height: `${items.length * 100}vh` }}>
  <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
    <motion.div style={{ x, display: 'flex' }}>
      {items.map(item => (
        <div style={{ minWidth: '100vw' }}>{item}</div>
      ))}
    </motion.div>
  </div>
</div>
```

### Using with AI Assistants

1. **Copy the prompt** from any effect
2. **Paste into Claude, GPT, or your preferred AI**
3. **Customize** with your specific requirements
4. **Get working code** tailored to your project

## Performance

- **GPU Acceleration** — Only animates `transform` and `opacity`
- **Spring Physics** — Interruptible animations that feel natural
- **Memoization** — All components wrapped in `memo()`
- **Passive Listeners** — Non-blocking scroll handlers
- **Will-Change** — Browser hints for optimization
