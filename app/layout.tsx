import './globals.css'
import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SITRACK — Universitas Amikom Solo',
  description: 'Sistem Informasi Track Record Alumni — Universitas Amikom Surakarta',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90" fill="%23700070">◇</text></svg>',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#fafafc',
              border: '1px solid #e0e0e0',
              color: '#1d1d1f',
              fontSize: '14px',
              borderRadius: '11px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </body>
    </html>
  )
}
