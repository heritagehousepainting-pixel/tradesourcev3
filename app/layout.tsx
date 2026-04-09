import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-context'
import { NavProvider, LayoutHeader } from './components/NavContext'
import { ShellProvider } from './components/ShellProvider'
import FooterNav from './components/FooterNav'

export const metadata: Metadata = {
  title: 'TradeSource — Contractor-to-Contractor Overflow Network',
  description: 'A private, vetted network where professional painters share overflow work. Fixed prices. No bidding. Verified contractors. Serving Montgomery County, Bucks County, Delaware County, and Philadelphia, PA.',
  icons: { icon: '/favicon.svg', shortcut: '/favicon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="flex flex-col min-h-screen" style={{ fontFamily: "'Inter', sans-serif", WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}>

        <ThemeProvider>
          <NavProvider>
            <LayoutHeader />
            <div className="flex-grow"><ShellProvider>{children}</ShellProvider></div>
          </NavProvider>
        </ThemeProvider>

        <footer style={{ backgroundColor: '#0F172A', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 40px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: 32, marginBottom: 36 }}>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: 'var(--color-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#F8FAFC', letterSpacing: '-0.01em' }}>TradeSource</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, backgroundColor: 'rgba(59,130,246,0.3)', color: '#BFDBFE', letterSpacing: '0.04em', border: '1px solid rgba(59,130,246,0.4)' }}>Phase 1</span>
                </div>
                <p style={{ fontSize: 12, color: '#F8FAFC', lineHeight: 1.7, maxWidth: 240 }}>
                  Private contractor-to-contractor overflow network. Fixed price, no bidding, no lead fees. Serving Montgomery County, Bucks County, Delaware County, and Philadelphia, PA.
                </p>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,250,252,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Product</p>
                <FooterNav />
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,250,252,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Company</p>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a href="/privacy-policy" style={{ fontSize: 13, color: 'rgba(248,250,252,0.85)', textDecoration: 'none' }}>Privacy Policy</a>
                  <a href="/terms" style={{ fontSize: 13, color: 'rgba(248,250,252,0.85)', textDecoration: 'none' }}>Terms of Service</a>
                </nav>
              </div>

              <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(248,250,252,0.85)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>Phase 1 Coverage</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {[
                    { label: 'Philadelphia County, PA' },
                    { label: 'Montgomery County, PA' },
                    { label: 'Bucks County, PA' },
                    { label: 'Delaware County, PA' },
                  ].map(c => (
                    <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: 'var(--color-blue)', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: 'rgba(248,250,252,0.85)', lineHeight: 1.3 }}>{c.label}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 6, padding: '8px 10px', borderRadius: 7, backgroundColor: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    <span style={{ fontSize: 11, color: 'rgba(200,220,255,1)', lineHeight: 1.4 }}>Phase 1 — Painting services only</span>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <p style={{ fontSize: 12, color: '#F8FAFC' }}>
                © {new Date().getFullYear()} TradeSource. All rights reserved.
              </p>
              <p style={{ fontSize: 12, color: '#F8FAFC' }}>
                Phase 1 Early Access · Montgomery/Bucks/Delaware/Philadelphia, PA
              </p>
            </div>

          </div>
        </footer>
      </body>
    </html>
  )
}
