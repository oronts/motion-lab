export const metadata = {
  title: 'Motion Lab — Scroll & SVG Animation Toolkit for React',
  description: 'Browse 19 Framer Motion effects, grab the LLM prompt, and get working animation code for your React project in seconds.',
  keywords: ['framer motion examples', 'react scroll animation', 'svg animation react', 'motion design', 'parallax react', 'horizontal scroll react', 'framer motion scroll', 'react animation library'],
  authors: [{ name: 'Oronts', url: 'https://oronts.com' }],
  metadataBase: new URL('https://motion-lab.oronts.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Motion Lab — Scroll & SVG Animations with Copy-Paste Prompts',
    description: '19 Framer Motion effects you can see live, then grab the prompt and let an LLM build it into your project.',
    url: 'https://motion-lab.oronts.com',
    siteName: 'Motion Lab',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motion Lab — React Animation Toolkit',
    description: 'Browse, copy the prompt, paste into your LLM, get working animation code.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
