'use client'

import { useState } from 'react'

export default function TermsOfService() {
  const [activeSection, setActiveSection] = useState<string | null>(null)

  const sections = [
    { id: 'user-eligibility', title: 'User Eligibility', content: `By using TradeSource, you represent and warrant that:\n\n• You are at least 18 years of age and legally authorized to enter into binding contracts\n• You are a licensed contractor, painting professional, or legitimate property owner/manager\n• All information you provide during registration and application is true, accurate, and complete\n• You will maintain accurate and current information in your profile at all times\n• You are not prohibited from using the platform under applicable law or any court order\n\nTradeSource reserves the right to verify eligibility at any time and to deny access to users who do not meet these requirements.` },
    { id: 'liability-disclaimer', title: 'Limitation of Liability', content: `IMPORTANT — PLEASE READ CAREFULLY:\n\nTRADESOURCE IS A PLATFORM THAT FACILITATES CONNECTIONS BETWEEN PROPERTY OWNERS AND CONTRACTORS. THE PLATFORM DOES NOT EMPLOY, CONTRACT, OR OTHERWISE ENGAGE ANY CONTRACTORS LISTED ON THE SERVICE.\n\nTRADESOURCE IS NOT RESPONSIBLE FOR:\n• The performance, quality, timeliness, or workmanship of any contractor\n• Any actions, omissions, negligence, or misconduct of contractors\n• Any property damage, personal injury, or financial loss caused by contractors\n• The accuracy of contractor-submitted qualifications or credentials\n• Any agreements made between homeowners and contractors\n\nAny disputes arising from contractor performance must be resolved directly between the parties. TradeSource shall have no liability for any claims arising from such engagements.` },
    { id: 'vetting-disclaimer', title: 'Vetting & Document Review', content: `TradeSource performs a limited review of contractor submissions. Specifically:\n\n• We verify that required documents have been submitted (license copies, insurance certificates, W-9 forms)\n• We confirm that submitted documents appear to be complete based on cursory review\n• We do not verify the authenticity of submitted documents\n• We do not independently verify contractor qualifications or references\n\nThe "Vetted" designation on our platform means only that a contractor has submitted the required documentation. It does not constitute a guarantee of the contractor's competence, reliability, or fitness for any particular job.\n\nProperty owners are solely responsible for conducting their own due diligence before engaging any contractor.` },
    { id: 'dispute-resolution', title: 'Dispute Resolution', content: `Any dispute arising from use of TradeSource shall be resolved as follows:\n\n1. Informal Resolution: Parties shall first attempt to resolve disputes through direct communication within 30 days.\n\n2. Mediation: If informal resolution fails, either party may request mediation through a mutually agreed-upon mediator. Costs shall be shared equally.\n\n3. Arbitration: If mediation fails, disputes shall be submitted to binding arbitration under the rules of the American Arbitration Association in Denver, Colorado.\n\n4. Class Action Waiver: All disputes must be brought in your individual capacity, not as a class action or representative proceeding.\n\n5. Exceptions: TradeSource may seek injunctive relief to protect its intellectual property or prevent irreparable harm.` },
    { id: 'indemnification', title: 'Indemnification', content: `You agree to indemnify, defend, and hold harmless TradeSource, its officers, directors, employees, and agents from and against any and all claims, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising from:\n\n• Your use of the platform or services\n• Your violation of these Terms of Service\n• Your violation of any applicable law or regulation\n• Your engagement of any contractor through the platform\n• Any dispute between you and a contractor or property owner\n• Your negligence or misconduct\n\nThis indemnification obligation survives the termination of these Terms of Service.` },
    { id: 'ip-ownership', title: 'Intellectual Property Ownership', content: `Platform Content: TradeSource and its licensors retain all rights, title, and interest in the platform, including all software, design, text, graphics, logos, and other content.\n\nUser Content: You retain all rights to the content and information you submit to the platform. By submitting content, you grant TradeSource a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and distribute your content solely for the purpose of operating the platform.\n\nContractor Profiles: Information in your contractor profile is visible to other platform users.\n\nTrademarks: "TradeSource" and associated logos are trademarks of TradeSource. You may not use these marks without prior written permission.` },
    { id: 'termination', title: 'Termination Rights', content: `TradeSource may terminate or suspend your access to the platform immediately, without prior notice, for any reason, including:\n\n• Violation of these Terms of Service\n• Provision of false, misleading, or incomplete information\n• Failure to maintain required credentials or insurance\n• Inactive account for 12 consecutive months\n• Any action that threatens the security or integrity of the platform\n\nYou may terminate your account at any time by submitting a written request. Upon termination, your profile will be deactivated and your information will be handled in accordance with our Privacy Policy.\n\nTermination of your account does not relieve you of obligations arising from any engagements made prior to termination.` }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0D1B2A' }}>
      <header style={{ backgroundColor: 'rgba(15,23,42,0.97)', borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href="/" className="text-xl font-bold tracking-tight" style={{ color: '#F8FAFC' }}>TradeSource</a>
            <a href="/privacy-policy" className="text-sm font-medium" style={{ color: 'rgba(248,250,252,0.6)' }}>Privacy Policy</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-8">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: '#F8FAFC', letterSpacing: '-0.02em' }}>Terms of Service</h1>
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

        <div className="mt-8 p-5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm text-center" style={{ color: 'rgba(248,250,252,0.5)' }}>
            By using TradeSource, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
        </div>

        <div className="mt-6 text-center" style={{ fontSize: '14px', color: 'rgba(248,250,252,0.3)' }}>
          Questions? Contact us at <a href="mailto:legal@tradesource.co" className="underline" style={{ color: '#60A5FA' }}>legal@tradesource.co</a>
        </div>
      </div>
    </div>
  )
}
