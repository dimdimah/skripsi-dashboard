import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sitrack.amikomsolo.ac.id'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SITRACK — Sistem Informasi Track Record Alumni | Universitas Amikom Surakarta',
    template: '%s | SITRACK — Universitas Amikom Surakarta',
  },
  description:
    'SITRACK adalah platform resmi tracer study Universitas Amikom Surakarta untuk melacak karir, kontribusi, dan perkembangan lulusan. Fitur track record, kuesioner akreditasi, career center, dan analytics data alumni.',
  keywords: [
    'tracer study',
    'alumni amikom',
    'track record alumni',
    'universitas amikom surakarta',
    'stmiK amikom',
    'karir alumni',
    'kuesioner tracer study',
    'akreditasi',
    'career center alumni',
    'sistem informasi alumni',
    'employment rate alumni',
    'lowongan kerja alumni amikom',
    'surakarta',
    'jawa tengah',
  ],
  authors: [{ name: 'Universitas Amikom Surakarta' }],
  creator: 'Universitas Amikom Surakarta',
  publisher: 'Universitas Amikom Surakarta',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'SITRACK — Universitas Amikom Surakarta',
    title: 'SITRACK — Sistem Informasi Track Record Alumni',
    description:
      'Platform resmi tracer study Universitas Amikom Surakarta. Lacak karir, kontribusi, dan perkembangan lulusan STMIK Amikom Surakarta.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SITRACK — Sistem Informasi Track Record Alumni Universitas Amikom Surakarta',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SITRACK — Sistem Informasi Track Record Alumni',
    description:
      'Platform resmi tracer study Universitas Amikom Surakarta. Lacak karir dan perkembangan lulusan.',
    images: ['/og-image.png'],
    creator: '@amikomsolo',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90" fill="%23700070">◇</text></svg>',
  },
  verification: {
    google: 'TODO: isi dengan kode dari Google Search Console setelah deploy',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SITRACK',
  alternateName: 'Sistem Informasi Track Record Alumni',
  url: SITE_URL,
  description:
    'Platform resmi tracer study Universitas Amikom Surakarta untuk melacak karir, kontribusi, dan perkembangan lulusan STMIK Amikom Surakarta.',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IDR',
  },
  provider: {
    '@type': 'CollegeOrUniversity',
    name: 'Universitas Amikom Surakarta',
    url: 'https://solo.amikom.ac.id',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Surakarta',
      addressRegion: 'Jawa Tengah',
      addressCountry: 'ID',
    },
  },
  featureList: [
    'Track Record Alumni',
    'Tracer Study Questionnaires',
    'Career Center',
    'Analytics & Reporting',
    'Admin Dashboard',
    'Role-Based Access Control',
  ],
  inLanguage: 'id',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-sm focus:bg-amikom-purple focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:outline-none"
        >
          Lewati ke konten utama
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
