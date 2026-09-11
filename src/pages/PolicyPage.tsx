import React from 'react';
import { User, Activity, Home, Shield, Users, Mail, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

type PolicyPageProps = {
  type?: 'privacy' | 'cookies' | 'data';
};

const PrivacyPolicyPage: React.FC<PolicyPageProps> = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#2B363B] antialiased">
      {/* Top Bar / Navigation */}
      <header className="mx-auto flex max-w-[1000px] justify-end px-6 py-4 text-xs font-medium text-[#5F6D7A]">
        <nav className="flex space-x-6">
          <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
          <Link to="/cookie-policy" className="hover:text-slate-900 transition-colors">Cookies</Link>
          <Link to="/data-sources" className="hover:text-slate-900 transition-colors">Data Sources</Link>
        </nav>
      </header>

      {/* Hero Header */}
      <section className="bg-[#8B0000] py-14 text-center text-white">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Privacy Policy</h1>
        <p className="mt-2 text-xs font-light text-slate-200 sm:text-sm">
          How we collect, use and protect your data
        </p>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[800px] px-6 py-12 space-y-12 text-xs leading-relaxed text-[#4A5568]">
        
        {/* Section 1: Who we are */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Who we are</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 text-xs text-[#4A5568] space-y-3">
            <p>
              RoomReview Ltd is a UK-based property technology platform that provides transparent rental property data and reviews. We are committed to protecting your privacy and ensuring your data is handled in accordance with UK GDPR and Data Protection Act 2018.
            </p>
            <p>
              RoomReview is an independent platform and is not affiliated with or endorsed by any UK government body.
            </p>
            <div className="pt-1 text-[11px] text-[#2D3748]">
              <p><strong className="font-semibold text-[#1A202C]">Data Controller:</strong> RoomReview Ltd, Company No. 16307644</p>
              <p><strong className="font-semibold text-[#1A202C]">ICO Registration:</strong> ZB960710</p>
            </div>
          </div>
        </section>

        {/* Section 2: Data we collect */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Data we collect</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Personal Information */}
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 space-y-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EBF8FF] text-[#8B0000]">
                <User className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1A202C]">Personal Information</h3>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Name, email, phone number, and account credentials
              </p>
            </div>

            {/* Usage Data */}
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 space-y-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EBF8FF] text-[#8B0000]">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1A202C]">Usage Data</h3>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                How you interact with our platform, pages visited, and features used
              </p>
            </div>

            {/* Property Data */}
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 space-y-3 text-left">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EBF8FF] text-[#8B0000]">
                <Home className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1A202C]">Property Data</h3>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Addresses, searches, and saved properties
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: How we use your data */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">How we use your data</h2>
          <p className="text-xs text-[#4A5568]">We process your personal data for the following purposes:</p>
          <ul className="space-y-2 pl-2 text-xs text-[#4A5568]">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
              <span>To provide and maintain our property review and data services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
              <span>To personalize your experience and improve our platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
              <span>To send service updates and important notifications</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
              <span>To comply with legal obligations and prevent fraud</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
              <span>To send marketing communications (with your consent)</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Automated Processing and Scoring */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Automated Processing and Scoring</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-3 text-xs text-[#4A5568]">
            <p>
              RoomReview uses rule-based models and scoring systems to generate insights, comparisons, and summaries.
            </p>
            <p>These outputs:</p>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>are based on aggregated and modelled data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>do not constitute automated decision-making with legal or similarly significant effects</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>are provided for informational and research purposes only</span>
              </li>
            </ul>
            <p className="pt-2">
              Users should not rely solely on these outputs when making property, financial, or investment decisions.
            </p>
          </div>
        </section>

        {/* Section 5: Legal basis for processing */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Legal basis for processing</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Contractual Necessity */}
            <div className="rounded-xl bg-[#EBF3FA] p-5 text-center space-y-2">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#8B0000] shadow-sm">
                <Shield className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1A202C]">Contractual Necessity</h3>
              <p className="text-[11px] text-[#718096]">To provide our services to you</p>
            </div>

            {/* Legitimate Interest */}
            <div className="rounded-xl bg-[#EBF3FA] p-5 text-center space-y-2">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#8B0000] shadow-sm">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1A202C]">Legitimate Interest</h3>
              <p className="text-[11px] text-[#718096]">To improve our platform and user experience</p>
            </div>

            {/* Consent */}
            <div className="rounded-xl bg-[#EBF3FA] p-5 text-center space-y-2">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#8B0000] shadow-sm">
                <Mail className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1A202C]">Consent</h3>
              <p className="text-[11px] text-[#718096]">For marketing communications</p>
            </div>
          </div>
        </section>

        {/* Section 6: Data sharing */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">Data sharing</h2>
          <p className="text-xs text-[#4A5568]">We do not sell your personal data. We may share your information with:</p>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-2.5 text-xs text-[#4A5568]">
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span><strong className="font-semibold text-[#1A202C]">Service providers:</strong> Cloud hosting, analytics, and payment processors who assist in operating our platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span><strong className="font-semibold text-[#1A202C]">Legal authorities:</strong> When required by law or to protect our rights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span><strong className="font-semibold text-[#1A202C]">Business transfers:</strong> In the event of a merger, acquisition, or sale of assets</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 7: Your rights under UK GDPR */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Your rights under UK GDPR</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-4 space-y-1">
              <h3 className="text-xs font-bold text-[#8B0000]">Access</h3>
              <p className="text-[11px] text-[#718096]">Request a copy of your personal data</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-4 space-y-1">
              <h3 className="text-xs font-bold text-[#8B0000]">Rectification</h3>
              <p className="text-[11px] text-[#718096]">Correct inaccurate or incomplete data</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-4 space-y-1">
              <h3 className="text-xs font-bold text-[#8B0000]">Erasure</h3>
              <p className="text-[11px] text-[#718096]">Request deletion of your data</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-4 space-y-1">
              <h3 className="text-xs font-bold text-[#8B0000]">Restriction</h3>
              <p className="text-[11px] text-[#718096]">Limit how we process your data</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-4 space-y-1">
              <h3 className="text-xs font-bold text-[#8B0000]">Portability</h3>
              <p className="text-[11px] text-[#718096]">Receive your data in a structured format</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-4 space-y-1">
              <h3 className="text-xs font-bold text-[#8B0000]">Object</h3>
              <p className="text-[11px] text-[#718096]">Object to certain processing activities</p>
            </div>
          </div>
          <div className="rounded-lg bg-[#EBF3FA] p-3 text-center text-[11px] text-[#4A5568]">
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:privacy@roomreview.co.uk" className="text-[#8B0000] hover:underline">
              privacy@roomreview.co.uk
            </a>
            . We will respond within 30 days.
          </div>
        </section>

        {/* Section 8: Data retention */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Data retention</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#8B0000] shadow-sm">
                <Clock className="h-4 w-4" />
              </div>
              <div className="space-y-2 text-xs text-[#4A5568]">
                <p>We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy:</p>
                <ul className="space-y-1 text-[11px] text-[#718096]">
                  <li>• Account data: Retained while your account is active</li>
                  <li>• Usage data: Retained for 24 months for analytics purposes</li>
                  <li>• Financial records: Retained for 7 years as required by law</li>
                  <li>• Marketing data: Retained until you withdraw consent</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 9: Professional Advice Disclaimer */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Professional Advice Disclaimer</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 text-xs text-[#4A5568]">
            RoomReview does not provide financial, legal, or investment advice. All information is provided for general informational purposes only.
          </div>
        </section>

        {/* Section 10: Security */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Security</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6">
            <div className="flex gap-4 items-center">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#8B0000] shadow-sm">
                <Lock className="h-4 w-4" />
              </div>
              <p className="text-xs text-[#4A5568] leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data, including encryption, access controls, and regular security assessments. However, no method of transmission over the internet is 100% secure.
              </p>
            </div>
          </div>
        </section>

        {/* Section 11: Updates to this policy */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">Updates to this policy</h2>
          <p className="text-xs text-[#4A5568]">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through a prominent notice on our platform.
          </p>
          <p className="text-[11px] font-[#718096]">
            <strong className="font-semibold text-[#1A202C]">Last updated:</strong> 27 April 2026
          </p>
        </section>

        {/* Section 12: Limitation of Liability */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Limitation of Liability</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-3 text-xs text-[#4A5568]">
            <p>RoomReview provides aggregated and modelled data derived from third-party sources.</p>
            <p>We do not guarantee:</p>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>accuracy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>completeness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>timeliness</span>
              </li>
            </ul>
            <p className="pt-1">RoomReview shall not be liable for:</p>
            <ul className="space-y-1.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>financial decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>investment outcomes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span>property transactions</span>
              </li>
            </ul>
            <p className="pt-2">
              Users must independently verify all critical information before making decisions.
            </p>
          </div>
        </section>

        {/* Section 13: Contact & Complaints */}
        <section className="space-y-4">
          <div className="rounded-xl border border-[#F0D8D2] bg-[#FCF5F3] p-6 space-y-3 text-xs text-[#4A5568]">
            <h2 className="text-base font-bold text-[#1A202C]">Contact & Complaints</h2>
            <p>
              For any questions about this Privacy Policy or to exercise your rights, contact our Data Protection Contact:
            </p>
            <div className="space-y-1 text-xs">
              <p>
                <strong className="font-bold text-[#1A202C]">Email:</strong>{' '}
                <a href="mailto:info@roomreview.co.uk" className="text-[#8B0000] underline">
                  info@roomreview.co.uk
                </a>
              </p>
              <p>
                <strong className="font-bold text-[#1A202C]">Post:</strong> 51-53 High Road NW10 2SU
              </p>
            </div>
            <p className="pt-2 text-[11px] text-[#718096]">
              You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at{' '}
              <a href="https://ico.org.uk" target="_blank" rel="noreferrer" className="text-[#8B0000] underline">
                ico.org.uk
              </a>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};

export default PrivacyPolicyPage;