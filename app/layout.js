export const metadata = {
  title: 'Oronts Motion Lab | 40+ Premium Scroll & SVG Animations',
  description: 'Production-ready scroll animations, SVG effects, and interactive components with AI prompts for instant reproduction. Built by Oronts GmbH.',
  keywords: ['react', 'animation', 'framer-motion', 'scroll-animation', 'svg', 'nextjs', 'oronts'],
  authors: [{ name: 'Oronts', url: 'https://oronts.com' }],
  openGraph: {
    title: 'Oronts Motion Lab',
    description: '40+ Production-Ready Scroll & SVG Animations with AI Prompts',
    url: 'https://motion-lab.oronts.com',
    siteName: 'Oronts Motion Lab',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oronts Motion Lab',
    description: '40+ Production-Ready Scroll & SVG Animations with AI Prompts',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
