<p align="center">
  <img src="https://raw.githubusercontent.com/oronts/motion-lab/main/assets/logo.svg" alt="Oronts Motion Lab" width="120" />
</p>

<h1 align="center">Motion Lab</h1>

<p align="center">
  Scroll animations, SVG effects, and interactive components you can copy straight into your project — or grab the prompt and let an LLM build it for you.
</p>

<p align="center">
  <a href="https://motion-lab.oronts.com"><strong>Live Demo</strong></a> · <a href="#get-started">Get Started</a> · <a href="#effects">Effects</a> · <a href="#how-the-prompts-work">Prompts</a>
</p>

---

## What is this?

Motion Lab is a single-page showcase of 19 Framer Motion effects running on React and Next.js. Every effect comes with a ready-to-use LLM prompt — copy it, paste it into Claude / ChatGPT / whatever you use, and get working code back, adapted to your project.

No npm package to install. No abstractions to learn. Just scroll through, find something you like, grab the prompt, and go.

## Get Started

```bash
git clone https://github.com/oronts/motion-lab.git
cd motion-lab
npm install
npm run dev
```

Open `http://localhost:3000` and scroll.

### Stack

- **React 18** + **Framer Motion 11** for animations
- **Next.js 14** with static export for hosting anywhere
- Deploys to GitHub Pages out of the box

## Effects

### SVG

| # | Effect | What it does |
|:-:|--------|--------------|
| 01 | SVG Line Drawing | Strokes animate along the path as you scroll into view |
| 02 | SVG Morphing | Shapes transition between triangle, square, pentagon, circle |
| 03 | Animated Blob | Organic gradient blob that morphs and rotates |
| 04 | Wave Animation | Three layered SVG waves scrolling at different speeds |
| 05 | Pulse Rings | Concentric circles that expand and fade out |

### Text

| # | Effect | What it does |
|:-:|--------|--------------|
| 06 | Typewriter | Types, pauses, deletes, types the next phrase |
| 07 | Text Scramble | Random characters resolve into the target word on hover |
| 08 | Glitch Text | RGB channel split with staggered clip-path layers |

### Scroll

| # | Effect | What it does |
|:-:|--------|--------------|
| 09 | Parallax | Image moves at a different rate than scroll |
| 10 | Hero Reveal | Clip-path expands from a small rounded rect to fullscreen |
| 11 | Horizontal Scroll | Vertical scrolling drives horizontal panel movement |
| 12 | Slide Panels | Panels enter from different directions as you scroll |
| 13 | Cinematic Text | Words flip up one by one with 3D perspective |

### Components

| # | Effect | What it does |
|:-:|--------|--------------|
| 14 | Card Carousel | Drag to navigate, spring physics on release |
| 15 | Card Stack | Click to send the top card to the bottom (FLIP layout) |
| 16 | Infinite Marquee | Auto-scrolling pill bar with faded edges |
| 17 | Counter | Numbers count up with eased timing when scrolled into view |
| 18 | Staggered Grid | Grid items pop in one after another on scroll |
| 19 | Rotating 3D Text | Each character rotates on the X axis with a wave delay |

Plus utility components: magnetic buttons, ambient particles, scroll progress bar, smooth scroll provider.

## How the Prompts Work

Every effect on the page has a collapsible prompt box. Click **Copy**, open your LLM of choice, paste it in.

The prompt gives the LLM the pattern (hooks, animation config, layout approach) so it can write a working version for your stack. You can add context like "use Tailwind" or "make it a Next.js server component wrapper" and the LLM will adapt.

```
Example workflow:
1. Scroll through the demo, find "Horizontal Scroll"
2. Click the Copy button on that section
3. Paste into Claude or ChatGPT
4. Add: "Use Tailwind CSS, make the panels show product cards from this array: [...]"
5. Get back working code for your project
```

That's it. No library to import, no API to learn.

## Build & Deploy

```bash
npm run build    # Outputs static site to ./out
npm run lint     # ESLint with next/core-web-vitals
```

The included GitHub Actions workflow deploys to GitHub Pages on push to `main`. Works with any static host (Vercel, Netlify, Cloudflare Pages, S3, etc).

## Performance Notes

- Animations only use `transform` and `opacity` (GPU composited, no layout thrashing)
- All components use `React.memo()` to skip unnecessary re-renders
- Scroll listeners are passive
- Respects `prefers-reduced-motion` — all motion disabled when the OS setting is on

## License

MIT — use it however you want.

Built by [Oronts](https://oronts.com).
