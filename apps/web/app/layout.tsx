import '@fontsource-variable/bricolage-grotesque';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Onboarding Flow', template: '%s · Onboarding Flow' },
  description: 'A multi-step onboarding flow with server-side validation, resumable progress and a funnel report.',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#0b6b4d' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="topbar">
          <Link href="/" className="brand">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#0b6b4d" />
              <path d="M9 17l5 5 9-11" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Onboarding Flow
          </Link>
          <nav aria-label="Main">
            <Link href="/">Get started</Link>
            <Link href="/insights">Funnel insights</Link>
          </nav>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
