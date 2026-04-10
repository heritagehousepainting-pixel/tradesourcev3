'use client'

import { useState } from 'react'

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    { id: 'data-we-collect', title: 'Data We Collect', content: `We collect information you provide directly to us, including:\n• Account information (name, email address, phone number, business name)\n• Application data (contractor licenses, insurance certificates, W-9 forms, work history)\n• Payment information (for billing purposes — processed via third-party payment providers)\n• Usage data (how you interact with the platform)\n• Device and connection information (IP address, browser type, operating system)\n\nWe do not collect sensitive biometric data or government ID numbers beyond what is required for contractor verification.` },
    { id: 'how-we-use', title: 'How We Use Your Data', content: `We use the information we collect to:\n• Process contractor applications and maintain approved contractor profiles\n• Facilitate job matching between homeowners and contractors\n• Send you job alerts, application status updates, and platform notifications\n• Process payments between parties\n• Improve platform functionality, security, and user experience\n• Comply with legal obligations\n\nWe do not sell your personal information to advertisers or third-party marketing companies.` },
    { id: 'data-retention', title: 'Data Retention', content: `We retain your data for as long as your account is active and for a reasonable period afterward.\n\n• Account data: Retained while your account is active and for 3 years after closure\n• Application documents: Retained for 5 years from submission date\n• Job history: Retained for 5 years after job completion\n• Communication logs: Retained for 2 years\n\nYou may request deletion of your data at any time. Certain data may be retained longer when required by law.` },
    { id: 'third-party-sharing', title: 'Third-Party Sharing', content: `We share your information only in the following circumstances:\n\n• With homeowners when you apply to their posted jobs\n• With our service providers (hosting, analytics, email delivery, payment processing) under strict data handling agreements\n• When required by law, court order, or governmental authority\n• To protect the rights, safety, or property of TradeSource, our users, or the public\n• In connection with a business transfer, merger, or acquisition\n\nWe do not share your data with advertisers or use it for targeted advertising purposes.` },
    { id: 'user-rights', title: 'User Rights', content: `You have the following rights regarding your personal data:\n\nAccess: You may request a copy of all personal data we hold about you at any time.\nCorrection: You may request that we correct inaccurate or incomplete data.\nDeletion: You may request that we delete your account and associated data.\nPortability: You may request your data in a machine-readable format.\nOpt-Out: You may unsubscribe from marketing communications at any time.\n\nTo exercise any of these rights, contact us at info@tradesource.app. We will respond to all verified requests within 30 days.` },
    { id: 'ccpa-gdpr', title: 'CCPA & GDPR Compliance', content: `California Consumer Privacy Act (CCPA): California residents have the right to know what data we collect, request deletion, and opt out of the sale of their personal information. TradeSource does not sell personal information.\n\nGeneral Data Protection Regulation (GDPR): Users in the European Economic Area have additional rights including the right to restrict processing, object to processing, and lodge a complaint with a supervisory authority.\n\nWe comply with both frameworks and will not discriminate against users who exercise their privacy rights.` },
    { id: 'contact', title: 'Contact', content: `For privacy-related questions, data requests, or complaints:\n\nEmail: info@tradesource.app\nMailing Address: TradeSource, 123 Contractor Way, Suite 100, Denver, CO 80202\n\nWe aim to respond to all inquiries within 5 business days.` }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D1B2A' }}>
      <header style={{ backgroundColor: 'rgba(15,23,42,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>TradeSource</a>
            <a href="/terms" className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>Terms of Service</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#F8FAFC', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}>Phase 1 — Painting</span>
        </div>
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Last updated: April 2026</p>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 pb-10">
        <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden' }}>
          {sections.map((section, index) => (
            <div key={section.id} style={{ borderBottom: index !== sections.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <button
                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                className="w-full text-left px-6 py-5 flex justify-between items-center transition-colors"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span className="font-semibold text-sm" style={{ color: '#F8FAFC' }}>{section.title}</span>
                <span style={{ fontSize: '18px', color: 'rgba(248,250,252,0.4)', transition: 'transform 0.2s', transform: activeSection === section.id ? 'rotate(45deg)' : 'none' }}>+</span>
              </button>
              {activeSection === section.id && (
                <div className="px-6 pb-6 text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)', whiteSpace: 'pre-line' }}>
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center" style={{ fontSize: '14px', color: 'rgba(248,250,252,0.3)' }}>
          Questions? Contact us at <a href="mailto:info@tradesource.app" className="underline" style={{ color: '#60A5FA' }}>info@tradesource.app</a>
        </div>
      </div>
    </div>
  )
}