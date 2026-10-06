import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateBuyerReport } from '@/utils/reportGenerator';
import { useAuth } from '@/hooks/useAuth';
import { paymentService } from '@/services/payment.service';
import { scoreReportService } from '@/services/score-report.service';
import {
  TrendingUp,
  Building,
  MapPin,
  FileText,
  Home,
  Check,
  Search,
  PenTool,
  Download,
  Shield,
  BarChart2,
  Sliders,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import type {
  RoomReviewPageProps,
  FormFieldConfig,
  FAQItem,
} from './ReportPage.types';

const IconMap: Record<string, LucideIcon> = {
  TrendingUp,
  Building,
  MapPin,
  FileText,
  Home,
  Search,
  PenTool,
  Download,
  Shield,
  BarChart2,
  Sliders,
  AlertCircle,
  HelpCircle,
};

export const defaultReportPageContent: RoomReviewPageProps = {
  hero: {
    badgeTitle: 'ROOMREVIEW AREA REPORTS',
    mainHeading: 'Generate an Area Report',
    subHeading:
      'Enter a postcode to explore local safety, affordability, transport, amenities, and other data-led insights about the surrounding area.',
    exploreButtonText: 'Generate Area Report',
    howItWorksButtonText: 'How It Works',
    badges: [
      { id: 'loc', label: 'Data-led insights', iconName: 'TrendingUp' },
      { id: 'home', label: 'Postcode area reports', iconName: 'Home' },
      { id: 'trend', label: 'London postcode coverage', iconName: 'MapPin' },
      { id: 'shield', label: 'Downloadable report output', iconName: 'Download' },
    ],
  },
  selectionSection: {
    heading: 'Choose the report that fits your needs',
    options: [
      {
        type: 'buyer',
        title: 'Area Report',
        description:
          'Get a clear overview of a postcode area using local data, scores, and comparisons.',
        highlights: [
          'Local safety and affordability context',
          'Transport, schools, and amenities',
          'RoomReview scores and nearby postcode comparison',
        ],
        ctaText: 'Generate Area Report',
      },
    ],
    compareReportsText: 'How area reports are built',
  },
  comparisonSection: {
    heading: 'Your area report at a glance',
    reports: [
      {
        type: 'buyer',
        title: 'Local area insights',
        description:
          'A postcode-based overview of the local area, bringing together key context on safety, affordability, transport, amenities, and RoomReview scores.',
        bestForList: [
          'Understanding a postcode area',
          'Comparing nearby postcodes',
          'Reviewing local data in one report',
        ],
      },
    ],
  },
  inclusionsSection: {
    heading: 'What\'s included in each report',
    inclusions: [
      {
        type: 'buyer',
        title: 'Area Report includes:',
        items: [
          'Property context',
          'Indicative market range',
          'Crime and safety context',
          'Community profile',
          'Transport and connectivity',
          'Schools, amenities, parks and healthcare',
          'Planning and area change summary',
          'RoomReview score breakdown',
          'Nearby postcode comparison',
          'Data sources and important information',
        ],
      },
    ],
    disclaimerText:
      'Report content may vary depending on data availability for the selected postcode.',
  },
  workflowSection: {
    heading: 'How it works',
    steps: [
      {
        stepNumber: 1,
        title: 'Enter a postcode',
        description: 'Choose the postcode area you want to learn about.',
        iconName: 'Search',
      },
      {
        stepNumber: 2,
        title: 'Review area insights',
        description: 'RoomReview brings together available postcode and local-area data.',
        iconName: 'PenTool',
      },
      {
        stepNumber: 3,
        title: 'Receive your report',
        description: 'Get a structured RoomReview report with data-led insights and area context.',
        iconName: 'Download',
      },
    ],
  },
  methodologySection: {
    heading: 'How RoomReview builds its reports',
    cards: [
      {
        title: 'Official public datasets',
        description: 'Built from authoritative public data sources.',
        iconName: 'Building',
      },
      {
        title: 'Postcode area analysis',
        description: 'Local insights at postcode and borough level.',
        iconName: 'MapPin',
      },
      {
        title: 'Comparative RoomReview scoring',
        description: 'Standardised metrics for fair comparison.',
        iconName: 'BarChart2',
      },
      {
        title: 'Structured reporting',
        description: 'Consistent, professional report format.',
        iconName: 'FileText',
      },
    ],
  },
  dataSourcesSection: {
    heading: 'Data Sources',
    subHeading:
      'RoomReview uses publicly available information from trusted UK organisations to provide property and local area insights.',
    sources: [
      {
        id: 'land-registry',
        title: 'HM Land Registry',
        description: 'Property ownership, title and price data.',
        officialUrl: 'https://landregistry.gov.uk',
        iconName: 'Building',
      },
      {
        id: 'ons',
        title: 'Office for National Statistics',
        description: 'Population, census and demographic data.',
        officialUrl: 'https://www.ons.gov.uk',
        iconName: 'BarChart2',
      },
      {
        id: 'council',
        title: 'Greater London Authority',
        description: 'London-wide data including planning and policy information.',
        officialUrl: 'https://www.london.gov.uk',
        iconName: 'MapPin',
      },
      {
        id: 'police',
        title: 'Police.uk',
        description: 'Crime and policing data for England and Wales.',
        officialUrl: 'https://www.police.uk',
        iconName: 'Shield',
      },
      {
        id: 'education',
        title: 'Department for Education',
        description: 'School catchment, performance and education data.',
        officialUrl: 'https://www.gov.uk/government/organisations/department-for-education',
        iconName: 'FileText',
      },
      {
        id: 'ofsted',
        title: 'Ofsted',
        description: 'School inspection results and education information.',
        officialUrl: 'https://www.gov.uk/government/organisations/ofsted',
        iconName: 'Home',
      },
      {
        id: 'transport',
        title: 'Transport for London',
        description: 'Transport, travel and accessibility data.',
        officialUrl: 'https://tfl.gov.uk',
        iconName: 'MapPin',
      },
      {
        id: 'gok',
        title: 'GOV.UK and UK Government Open Data',
        description: 'Public sector datasets and official information.',
        officialUrl: 'https://www.gov.uk',
        iconName: 'Building',
      },
      {
        id: 'london-database',
        title: 'London Datastore',
        description: 'Open data published by the Greater London Authority.',
        officialUrl: 'https://data.london.gov.uk',
        iconName: 'Download',
      },
    ],
    licensingHeading: 'Data and licensing',
    licensingParagraphs: [
      'RoomReview uses public information in accordance with the terms, licences and attribution requirements specified by each data provider where applicable, and this website contains public-sector information licensed under the Open Government Licence v3.0. Organisation names, trademarks and other intellectual property rights remain the property of their respective owners.',
      'RoomReview is not endorsed, sponsored, approved or affiliated with any third-party data provider, public authority or private organisation, unless expressly stated otherwise.',
    ],
    methodologyLinkText: 'Read our Data Sources and Methodology',
    methodologyLinkUrl: '/data-sources',
  },
  importantInfoSection: {
    title: 'Important Information',
    paragraphs: [
      'RoomReview reports are provided for general information and property research purposes only. They are based on publicly available and licensed datasets, including official UK sources where available. Reports are intended to support research and comparison and should not be relied upon as the sole basis for any purchasing, investment, or financial decision.',
      'RoomReview does not provide legal advice, mortgage advice, or professional valuation services. Any figures, scores, or market observations are estimates based on publicly available data and may be out of date, incomplete, or subject to error.',
      'Users should independently verify the information and consider seeking independent professional advice before making a final decision.',
    ],
  },
  faqSection: {
    heading: 'Frequently asked questions',
    faqs: [
      {
        id: 'faq-1',
        question: 'What does an Area Report include?',
        answer:
          'It brings together available local information such as safety, affordability, transport, amenities, RoomReview scores, and comparisons with nearby postcodes.',
      },
      {
        id: 'faq-2',
        question: 'What information do I need to complete the form?',
        answer:
          'Enter the postcode for the area you want to explore. No property details are required.',
      },
      {
        id: 'faq-3',
        question: 'Are Area Reports based on official data?',
        answer:
          'Yes. They use a mix of official public datasets, licensed sources, and RoomReview analysis to provide a clearer market picture.',
      },
      {
        id: 'faq-4',
        question: 'Does RoomReview provide financial or legal advice?',
        answer:
          'No. RoomReview is informational only and should not replace formal financial, legal, or valuation advice.',
      },
      {
        id: 'faq-5',
        question: 'Can I use the report on mobile and desktop?',
        answer:
          'Yes. The page is designed to work across desktop, tablet and mobile devices.',
      },
    ],
  },
  formSchema: {
    buyer: [
      { name: 'propertyAddress', label: 'Postcode *', type: 'text', placeholder: 'e.g. N1 9GU', required: true, halfWidth: false },
    ],
    investor: [],
  },
};

export const RoomReviewPage: React.FC<RoomReviewPageProps> = ({
  hero = defaultReportPageContent.hero!,
  selectionSection = defaultReportPageContent.selectionSection!,
  comparisonSection = defaultReportPageContent.comparisonSection!,
  inclusionsSection = defaultReportPageContent.inclusionsSection!,
  workflowSection = defaultReportPageContent.workflowSection!,
  methodologySection = defaultReportPageContent.methodologySection!,
  dataSourcesSection = defaultReportPageContent.dataSourcesSection!,
  importantInfoSection = defaultReportPageContent.importantInfoSection!,
  faqSection = defaultReportPageContent.faqSection!,
  formSchema = defaultReportPageContent.formSchema!,
  onSubmitReportRequest,
  onNavigateToSection,
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [agencyBranding, setAgencyBranding] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    logoDataUrl: '',
  });
  const [logoError, setLogoError] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLogoError(null);
    if (!file) {
      setAgencyBranding((previous) => ({ ...previous, logoDataUrl: '' }));
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setLogoError('Choose a PNG, JPG, or WebP image.');
      setAgencyBranding((previous) => ({ ...previous, logoDataUrl: '' }));
      event.target.value = '';
      return;
    }
    if (file.size > 64 * 1024) {
      setLogoError('The logo file must be 64 KB or smaller.');
      setAgencyBranding((previous) => ({ ...previous, logoDataUrl: '' }));
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAgencyBranding((previous) => ({ ...previous, logoDataUrl: reader.result }));
      } else {
        setAgencyBranding((previous) => ({ ...previous, logoDataUrl: '' }));
        setLogoError('The logo could not be read. Please select another image.');
      }
    };
    reader.onerror = () => {
      setAgencyBranding((previous) => ({ ...previous, logoDataUrl: '' }));
      setLogoError('The logo could not be read. Please select another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    onSubmitReportRequest?.('buyer', formData);
    setIsGenerating(true);

    try {
      const creditCheck = await paymentService.ensureReportCreditsAvailable(isAuthenticated);

      if (!creditCheck.allowed) {
        throw new Error('Not enough report credits.');
      }

      const reportData = await generateBuyerReport(formData);
      const trimmedBranding = {
        companyName: agencyBranding.companyName.trim(),
        firstName: agencyBranding.firstName.trim(),
        lastName: agencyBranding.lastName.trim(),
        logoDataUrl: agencyBranding.logoDataUrl,
      };
      if (Object.values(trimmedBranding).some(Boolean)) {
        reportData.agencyBranding = trimmedBranding;
      }
      if (isAuthenticated) {
        await scoreReportService.createAndGenerateForPostcode(String(formData.propertyAddress ?? ''), 'buyer', reportData);
      } else {
        paymentService.consumeGuestReportCredit();
      }
      navigate('/report/view', { state: { reportData } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unable to generate the report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const renderIcon = (iconName?: string, defaultIcon: LucideIcon = FileText, className = 'w-5 h-5') => {
    const Component = (iconName && IconMap[iconName]) || defaultIcon;
    return <Component className={className} />;
  };

  const navigateToSection = (sectionId: string) => {
    if (onNavigateToSection) {
      onNavigateToSection(sectionId);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="w-full min-h-screen bg-[#F4F1EE] text-[#1D2B3B] antialiased">
      <div className="mx-auto max-w-[980px] px-4 py-10 sm:px-6 lg:px-8">
        <section className="border-t border-[#8B0000] pt-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[#8B0000]">
            {hero.badgeTitle}
          </p>
          <h1 className="mt-4 text-4xl font-light tracking-[-0.04em] text-[#1F2D3D] md:text-[3.4rem]">
            {hero.mainHeading}
          </h1>
          <p className="mx-auto mt-4 max-w-[760px] text-sm leading-6 text-[#516078] md:text-base">
            {hero.subHeading}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigateToSection('form')}
              className="rounded-full bg-[#8B0000] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6f0000]"
            >
              {hero.exploreButtonText}
            </button>
            <button
              type="button"
              onClick={() => navigateToSection('how-it-works')}
              className="rounded-full border border-[#8B0000] bg-white px-6 py-2.5 text-xs font-semibold text-[#8B0000] transition hover:bg-[#fff2f2]"
            >
              {hero.howItWorksButtonText}
            </button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {hero.badges.map((badge) => (
              <div key={badge.id} className="flex flex-col items-center justify-center rounded-xl px-2 py-4 text-center">
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[#EBF0F5] text-[#8B0000]">
                  {renderIcon(badge.iconName, TrendingUp, 'h-4 w-4')}
                </div>
                <span className="text-[11px] font-medium text-[#364657]">{badge.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="reports" className="mt-16 text-center">
          <h2 className="text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">
            {selectionSection.heading}
          </h2>

          <div className="mx-auto mt-8 grid max-w-xl gap-6">
            {selectionSection.options.map((option) => (
              <div
                key={option.type}
                className="rounded-[18px] border border-[#D9DFE8] bg-white p-6 text-left shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F6E9E7] text-[#8B0000]">
                    {renderIcon(option.type === 'buyer' ? 'Home' : 'TrendingUp', Home, 'h-4 w-4')}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1F2D3D]">{option.title}</h3>
                </div>

                <p className="mt-4 text-[12px] leading-6 text-[#516078]">{option.description}</p>

                <ul className="mt-5 space-y-2.5">
                  {option.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[12px] text-[#2E3E4F]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8B0000]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    navigateToSection('form');
                  }}
                  className="mt-7 w-full rounded-xl bg-[#8B0000] py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#6f0000]"
                >
                  {option.ctaText}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigateToSection('comparison')}
              className="text-xs font-semibold text-[#8B0000] underline-offset-2 hover:underline"
            >
              {selectionSection.compareReportsText}
            </button>
          </div>
        </section>

        <section id="comparison" className="mt-20">
          <h2 className="text-center text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">
            {methodologySection.heading}
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {methodologySection.cards.map((card, idx) => (
              <div key={idx} className="rounded-[18px] border border-[#D9DFE8] bg-white p-4 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#8B0000]">
                  {renderIcon(card.iconName, Building, 'h-4 w-4')}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#1F2D3D]">{card.title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[#516078]">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <div className="text-center">
            <h2 className="text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">{dataSourcesSection.heading}</h2>
            <p className="mx-auto mt-4 max-w-[760px] text-sm leading-6 text-[#516078]">
              {dataSourcesSection.subHeading}
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dataSourcesSection.sources.map((source) => (
              <div key={source.id} className="rounded-[18px] border border-[#D9DFE8] bg-white p-4 text-left shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#8B0000]">
                  {renderIcon(source.iconName, Building, 'h-4 w-4')}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-[#1F2D3D]">{source.title}</h3>
                <p className="mt-2 text-[11px] leading-5 text-[#516078]">{source.description}</p>
                {source.officialUrl && (
                  <a href={source.officialUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B0000] hover:underline">
                    <span>View official source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-[18px] border border-[#D9DFE8] bg-white p-6 shadow-sm">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#1F2D3D]">
              {dataSourcesSection.licensingHeading}
            </h3>
            <div className="mt-4 space-y-3 text-[11px] leading-6 text-[#516078]">
              {dataSourcesSection.licensingParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
            <a
              href={dataSourcesSection.methodologyLinkUrl}
              className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B0000] hover:underline"
            >
              <span>{dataSourcesSection.methodologyLinkText}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-[18px] border border-[#E7D8D0] bg-[#FAF3EF] p-6">
            <div className="flex items-center gap-2 text-[#8B0000]">
              <AlertCircle className="h-4 w-4" />
              <h3 className="text-lg font-semibold">{importantInfoSection.title}</h3>
            </div>
            <div className="mt-4 space-y-3 text-[12px] leading-6 text-[#516078]">
              {importantInfoSection.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 text-center">
          <h2 className="text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">
            {faqSection.heading}
          </h2>

          <div className="mx-auto mt-8 max-w-[780px] space-y-3 text-left">
            {faqSection.faqs.map((faq: FAQItem) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div key={faq.id} className="overflow-hidden rounded-[14px] border border-[#D9DFE8] bg-white shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[13px] font-medium text-[#1F2D3D]"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`h-4 w-4 text-[#516078] transition ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="border-t border-[#EEF2F7] px-5 py-4 text-[12px] leading-6 text-[#516078]">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">
            Your area report at a glance
          </h2>

          <div className="mx-auto mt-8 grid max-w-2xl gap-6">
            {comparisonSection.reports.map((report) => (
              <div key={report.type} className="rounded-[18px] border border-[#D9DFE8] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-[#1F2D3D]">{report.title}</h3>
                <p className="mt-3 text-[12px] leading-6 text-[#516078]">{report.description}</p>

                <div className="mt-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#516078]">Best for:</p>
                  <ul className="mt-3 space-y-2.5 text-[12px] text-[#2E3E4F]">
                    {report.bestForList.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8B0000]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-center text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">
            {inclusionsSection.heading}
          </h2>

          <div className="mx-auto mt-8 grid max-w-2xl gap-6">
            {inclusionsSection.inclusions.map((inc) => (
              <div key={inc.type} className="rounded-[18px] border border-[#D9DFE8] bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1F2D3D]">{inc.title}</h3>
                <ul className="mt-5 space-y-2.5">
                  {inc.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[12px] text-[#2E3E4F]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#8B0000]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[11px] italic text-[#607081]">
            {inclusionsSection.disclaimerText}
          </p>
        </section>

        <section id="form" className="mx-auto mt-20 max-w-[760px]">
          <div className="overflow-hidden rounded-[0px] border border-[#D7D9DB] bg-white shadow-none">
            <form onSubmit={handleFormSubmit} className="bg-white p-6 md:p-8">
              <h3 className="text-[22px] font-light text-[#1F2D3D]">Generate an Area Report</h3>
              <p className="mt-2 text-[12px] text-[#516078]">
                Enter a postcode to create a report about its local area. No property details are needed.
              </p>

              <div className="mt-6 grid gap-4">
                {formSchema.buyer.map((field: FormFieldConfig) => (
                  <div key={field.name} className={field.halfWidth ? 'col-span-1' : 'md:col-span-2'}>
                    <label className="mb-1 block text-[12px] font-semibold text-[#2A3542]">
                      {field.label}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        value={String(formData[field.name] ?? '')}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full rounded-[6px] border border-[#D9D5D1] bg-[#F0E7E2] px-3 py-2.5 text-[12px] text-[#1F2D3D] outline-none shadow-none"
                      >
                        <option value="">Select option</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        value={String(formData[field.name] ?? '')}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full rounded-[6px] border border-[#D9D5D1] bg-[#F0E7E2] px-3 py-2.5 text-[12px] text-[#1F2D3D] outline-none"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={String(formData[field.name] ?? '')}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full rounded-[6px] border border-[#D9D5D1] bg-[#F0E7E2] px-3 py-2.5 text-[12px] text-[#1F2D3D] outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>

              <fieldset className="mt-6 rounded-xl border border-[#E5DCD8] p-4">
                <legend className="px-2 text-sm font-semibold text-[#1F2D3D]">Optional agency branding</legend>
                <p className="mb-4 text-xs leading-5 text-[#516078]">
                  Add the details you want displayed on this report. Leave any field blank to omit it.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="agency-logo" className="mb-1 block text-[12px] font-semibold text-[#2A3542]">
                      Agency logo
                    </label>
                    <input
                      id="agency-logo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleLogoChange}
                      className="w-full rounded-[6px] border border-[#D9D5D1] bg-white px-3 py-2 text-xs text-[#1F2D3D]"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">PNG, JPG, or WebP; maximum 64 KB.</p>
                    {logoError && <p className="mt-1 text-xs text-red-700" role="alert">{logoError}</p>}
                  </div>
                  <div>
                    <label htmlFor="agency-company-name" className="mb-1 block text-[12px] font-semibold text-[#2A3542]">
                      Company name
                    </label>
                    <input
                      id="agency-company-name"
                      value={agencyBranding.companyName}
                      onChange={(event) => setAgencyBranding((previous) => ({ ...previous, companyName: event.target.value }))}
                      className="w-full rounded-[6px] border border-[#D9D5D1] bg-white px-3 py-2.5 text-[12px] text-[#1F2D3D] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="agency-first-name" className="mb-1 block text-[12px] font-semibold text-[#2A3542]">
                      First name
                    </label>
                    <input
                      id="agency-first-name"
                      value={agencyBranding.firstName}
                      onChange={(event) => setAgencyBranding((previous) => ({ ...previous, firstName: event.target.value }))}
                      className="w-full rounded-[6px] border border-[#D9D5D1] bg-white px-3 py-2.5 text-[12px] text-[#1F2D3D] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="agency-last-name" className="mb-1 block text-[12px] font-semibold text-[#2A3542]">
                      Last name
                    </label>
                    <input
                      id="agency-last-name"
                      value={agencyBranding.lastName}
                      onChange={(event) => setAgencyBranding((previous) => ({ ...previous, lastName: event.target.value }))}
                      className="w-full rounded-[6px] border border-[#D9D5D1] bg-white px-3 py-2.5 text-[12px] text-[#1F2D3D] outline-none"
                    />
                  </div>
                </div>
              </fieldset>

              {submitError && <p role="alert" className="mt-4 text-sm text-red-700">{submitError}</p>}

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-8 w-full rounded-[6px] bg-[#8B0000] py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#6f0000]"
              >
                {isGenerating ? 'Generating Area Report...' : 'Generate Area Report'}
              </button>
            </form>
          </div>
        </section>

        <section id="how-it-works" className="mt-20 pb-8">
          <h2 className="text-center text-[2rem] font-light tracking-[-0.04em] text-[#1F2D3D]">
            {workflowSection.heading}
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {workflowSection.steps.map((step) => (
              <div key={step.stepNumber} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[18px] bg-[#EAF2F8] text-[#8B0000] shadow-sm">
                  {renderIcon(step.iconName, Search, 'h-6 w-6')}
                  <span className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-[#8B0000] text-[11px] font-bold text-white">
                    {step.stepNumber}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-[#1F2D3D]">{step.title}</h3>
                <p className="mt-2 text-[12px] leading-6 text-[#516078]">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default RoomReviewPage;
