import React, { useState } from 'react';
import { Cookie, BarChart2, Settings, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getCookiePreferences,
  saveCookiePreferences,
  type CookiePreferences,
} from '@/lib/cookieConsent';

export const CookiesPolicyPage: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>(getCookiePreferences);

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'necessary') return; // Always enabled
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAcceptAll = () => {
    const allPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };

    setPreferences(allPreferences);
    saveCookiePreferences(allPreferences);
  };

  const handleSavePreferences = () => {
    saveCookiePreferences(preferences);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#2B363B] antialiased">
      {/* Top Bar Navigation */}
      <header className="mx-auto flex max-w-[1000px] justify-end px-6 py-4 text-xs font-medium text-[#5F6D7A]">
        <nav className="flex space-x-6">
          <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
          <Link to="/cookie-policy" className="text-[#8B0000] font-semibold">Cookies</Link>
          <Link to="/data-sources" className="hover:text-slate-900 transition-colors">Data Sources</Link>
        </nav>
      </header>

      {/* Hero Header */}
      <section className="bg-[#8B0000] py-14 text-center text-white">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Cookies Policy</h1>
        <p className="mt-2 text-xs font-light text-slate-200 sm:text-sm">
          How we use cookies and tracking technologies
        </p>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[800px] px-6 py-12 space-y-10 text-xs leading-relaxed text-[#4A5568]">

        {/* Section 1: What are cookies? */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">What are cookies?</h2>
          <p className="text-xs text-[#4A5568] leading-relaxed">
            Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our site, and delivering relevant content.
          </p>
        </section>

        {/* Section 2: Types of cookies we use */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Types of cookies we use</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            
            {/* Necessary */}
            <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-5 space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#8B0000] shadow-sm">
                  <Cookie className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#1A202C]">Necessary</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Essential for the website to function properly. Cannot be disabled.
              </p>
              <span className="inline-block text-[10px] text-[#A0AEC0]">Always enabled</span>
            </div>

            {/* Analytics */}
            <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-5 space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#8B0000] shadow-sm">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#1A202C]">Analytics</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Help us understand how visitors interact with our website.
              </p>
            </div>

            {/* Functional */}
            <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-5 space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#8B0000] shadow-sm">
                  <Settings className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#1A202C]">Functional</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Enable enhanced functionality and personalization.
              </p>
            </div>

            {/* Marketing */}
            <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-5 space-y-2 text-left">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#8B0000] shadow-sm">
                  <Share2 className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#1A202C]">Marketing</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Track visitors across websites to display relevant ads.
              </p>
            </div>

          </div>
        </section>

        {/* Section 3: Cookie control panel */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Cookie control panel</h2>
          <div className="rounded-xl bg-[#EBF3FA] p-6 space-y-6">
            <p className="text-[11px] text-[#5F6D7A]">
              Manage your cookie preferences below. Changes will take effect immediately.
            </p>

            <div className="space-y-5">
              {/* Necessary Toggle */}
              <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-[#1A202C]">Necessary</h3>
                  <p className="text-[11px] text-[#718096]">Essential for the website to function properly. Cannot be disabled.</p>
                </div>
                <button
                  type="button"
                  disabled
                  className="relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-[#C27B7B] transition-colors duration-200 ease-in-out focus:outline-none"
                >
                  <span className="translate-x-4 pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                </button>
              </div>

              {/* Analytics Toggle */}
              <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-[#1A202C]">Analytics</h3>
                  <p className="text-[11px] text-[#718096]">Help us understand how visitors interact with our website.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('analytics')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.analytics ? 'bg-[#8B0000]' : 'bg-[#CBD5E0]'
                  }`}
                >
                  <span
                    className={`${
                      preferences.analytics ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {/* Functional Toggle */}
              <div className="flex items-center justify-between border-b border-[#DCE7F2] pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-[#1A202C]">Functional</h3>
                  <p className="text-[11px] text-[#718096]">Enable enhanced functionality and personalization.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('functional')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.functional ? 'bg-[#8B0000]' : 'bg-[#CBD5E0]'
                  }`}
                >
                  <span
                    className={`${
                      preferences.functional ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {/* Marketing Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-bold text-[#1A202C]">Marketing</h3>
                  <p className="text-[11px] text-[#718096]">Track visitors across websites to display relevant ads.</p>
                </div>
                <button
                  type="button"
                  onClick={() => togglePreference('marketing')}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.marketing ? 'bg-[#8B0000]' : 'bg-[#CBD5E0]'
                  }`}
                >
                  <span
                    className={`${
                      preferences.marketing ? 'translate-x-4' : 'translate-x-0'
                    } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSavePreferences}
                className="rounded-lg bg-[#8B0000] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#700000]"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="rounded-lg bg-[#E2E8F0] px-4 py-2 text-xs font-medium text-[#2D3748] transition-colors hover:bg-[#CBD5E0]"
              >
                Accept All
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Third-party cookies */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">Third-party cookies</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-3 text-xs text-[#4A5568]">
            <p>We use third-party services that may set cookies on your device:</p>
            <ul className="space-y-2.5 pl-2">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span><strong className="font-semibold text-[#1A202C]">Google Analytics:</strong> To analyze website traffic and usage patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span><strong className="font-semibold text-[#1A202C]">Cloudflare:</strong> For security and content delivery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 rounded-full bg-[#8B0000] shrink-0" />
                <span><strong className="font-semibold text-[#1A202C]">HubSpot:</strong> For marketing automation and analytics</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section 5: Legal Basis for Cookies */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">Legal Basis for Cookies</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-3 text-xs text-[#4A5568]">
            <p>Strictly necessary cookies are used under legitimate interest.</p>
            <p>
              All non-essential cookies (analytics, functional, marketing) are used only with user consent, in accordance with UK GDPR and the Privacy and Electronic Communications Regulations (PECR).
            </p>
          </div>
        </section>

        {/* Section 6: How to manage cookies */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">How to manage cookies</h2>
          <p className="text-xs text-[#4A5568]">You can control and manage cookies in several ways:</p>
          <div className="space-y-2 text-xs text-[#4A5568] pl-1">
            <p>
              <strong className="font-semibold text-[#1A202C]">Browser settings:</strong> Most browsers allow you to refuse or accept cookies through their settings menu.
            </p>
            <p>
              <strong className="font-semibold text-[#1A202C]">Cookie preference panel:</strong> Use the control panel above to manage specific cookie categories.
            </p>
            <p>
              <strong className="font-semibold text-[#1A202C]">Opt-out tools:</strong> Visit websites like{' '}
              <a href="https://youronlinechoices.com" target="_blank" rel="noreferrer" className="text-[#8B0000] underline">
                youronlinechoices.com
              </a>{' '}
              to opt out of behavioral advertising.
            </p>
          </div>
        </section>

        {/* Section 7: Updates to this policy */}
        <section className="space-y-2">
          <h2 className="text-base font-bold text-[#1A202C]">Updates to this policy</h2>
          <p className="text-xs text-[#4A5568]">
            We may update this Cookies Policy from time to time to reflect changes in our practices or legal requirements. The latest version will always be available on this page.
          </p>
          <p className="text-[11px] text-[#718096] pt-1">
            <strong className="font-semibold text-[#1A202C]">Last updated:</strong> 27 April 2026
          </p>
        </section>

        {/* Section 8: Contact us */}
        <section>
          <div className="rounded-xl bg-[#EBF3FA] p-6 space-y-2 text-xs text-[#4A5568]">
            <h2 className="text-base font-bold text-[#1A202C]">Contact us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at{' '}
              <a href="mailto:info@roomreview.co.uk" className="text-[#8B0000] underline">
                info@roomreview.co.uk
              </a>
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};