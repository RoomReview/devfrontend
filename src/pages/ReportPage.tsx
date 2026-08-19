import React, { useState } from 'react';
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
  ReportType,
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
    badgeTitle: 'ROOMREVIEW PROPERTY REPORTS',
    mainHeading: 'Choose Your Report',
    subHeading:
      'Select the report that best matches your property goals. RoomReview provides structured, data-led insights to help buyers and investors review a property, postcode, and local area with more clarity.',
    exploreButtonText: 'Explore Reports',
    howItWorksButtonText: 'How It Works',
    badges: [
      { id: 'loc', label: 'Data-led insights', iconName: 'TrendingUp' },
      { id: 'home', label: 'Buyer and investor reports', iconName: 'Home' },
      { id: 'trend', label: 'London postcode coverage', iconName: 'MapPin' },
      { id: 'shield', label: 'Downloadable report output', iconName: 'Download' },
    ],
  },
  selectionSection: {
    heading: 'Choose the report that fits your needs',
    options: [
      {
        type: 'buyer',
        title: 'Buyer Report',
        description:
          'For users researching a home purchase and wanting clearer insight into local area quality, transport, affordability, and property context.',
        highlights: [
          'Local area overview',
          'Safety and livability context',
          'Affordability and property context',
        ],
        ctaText: 'Select Buyer Report',
      },
      {
        type: 'investor',
        title: 'Investor Report',
        description:
          'For users reviewing a property from an investment perspective, including rental demand, price trends, local market context, and planning context.',
        highlights: [
          'Rental and demand context',
          'Price trends and comparables',
          'Planning and development pipeline',
        ],
        ctaText: 'Select Investor Report',
      },
    ],
    compareReportsText: 'Compare Reports',
  },
  comparisonSection: {
    heading: 'How RoomReview builds its reports',
    reports: [
      {
        type: 'buyer',
        title: 'Buyer report',
        description:
          'Built around what matters when choosing where to live, from amenities and travel to comfort and risk levels.',
        bestForList: [
          'Renters and first-time buyers',
          'People comparing neighbourhood options',
          'Household lifestyle and commute decisions',
        ],
      },
      {
        type: 'investor',
        title: 'Investor report',
        description:
          'Focused on value, demand, and longer-term market signals for strategic property decisions.',
        bestForList: [
          'Buy-to-let investors',
          'Property founders',
          'Landlords and developers',
        ],
      },
    ],
  },
  inclusionsSection: {
    heading: 'What\'s included in each report',
    inclusions: [
      {
        type: 'buyer',
        title: 'Buyer Report includes:',
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
      {
        type: 'investor',
        title: 'Investor Report includes:',
        items: [
          'Property and market context',
          'Indicative market range',
          'Historical price trends',
          'Rental market context',
          'Planning and local area context',
          'Transport and infrastructure context',
          'Demographics and demand indicators',
          'Policy and governance context',
          'Investor score breakdown',
          'Nearby postcode and market context',
        ],
      },
    ],
    disclaimerText:
      'Report content may vary depending on available data, location, and report type.',
  },
  workflowSection: {
    heading: 'How it works',
    steps: [
      {
        stepNumber: 1,
        title: 'Choose your report',
        description: 'Select either the Buyer Report or Investor Report depending on your goal.',
        iconName: 'Search',
      },
      {
        stepNumber: 2,
        title: 'Enter your property details',
        description: 'Provide the key property information needed to generate a more relevant report.',
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
        title: 'Property and postcode analysis',
        description: 'Detailed insights at multiple geographic levels.',
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
      'RoomReview uses public information in accordance with the terms, licences and attribution requirements specified by each data provider where applicable, and this website contains public-sector information licensed under the Open Government Licence v3.0. Organisations names, trademarks and other intellectual property rights remain the property of their respective owners.',
      'RoomReview is not endorsed, sponsored, approved or affiliated with any third-party data provider, public authority or private organisation, unless expressly stated otherwise.',
    ],
    methodologyLinkText: 'Read our Data Sources and Methodology',
    methodologyLinkUrl: '/about',
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
        question: 'What is the difference between the Buyer Report and the Investor Report?',
        answer:
          'The Buyer Report focuses on local living conditions, affordability, transport, safety and property fit; the Investor Report looks at rental demand, price trends, market context, and investment potential.',
      },
      {
        id: 'faq-2',
        question: 'What information do I need to complete the form?',
        answer:
          'You can usually provide a postcode, area information, property type, bedrooms, budget, and any notes relevant to your goals.',
      },
      {
        id: 'faq-3',
        question: 'Are the reports based on official data?',
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
      { name: 'fullName', label: 'Property Address or Postcode *', type: 'text', placeholder: 'Enter address or postcode', required: true, halfWidth: false },
      { name: 'email', label: 'Property type *', type: 'select', required: true, options: [{ label: 'Flat', value: 'flat' }, { label: 'House', value: 'house' }, { label: 'Studio', value: 'studio' }], halfWidth: true },
      { name: 'propertyType', label: 'Bedrooms *', type: 'number', placeholder: 'Number of bedrooms', required: true, halfWidth: true },
      { name: 'budget', label: 'Bathrooms *', type: 'number', placeholder: 'Number of bathrooms', required: true, halfWidth: true },
      { name: 'postcode', label: 'Floor Area (sq ft) *', type: 'number', placeholder: 'Square footage', required: true, halfWidth: true },
      { name: 'notes', label: 'Tenure *', type: 'select', required: true, options: [{ label: 'Freehold', value: 'freehold' }, { label: 'Leasehold', value: 'leasehold' }, { label: 'Unknown', value: 'unknown' }], halfWidth: true },
      { name: 'yearBuilt', label: 'Year Built', type: 'number', placeholder: 'e.g. 1995', required: false, halfWidth: true },
      { name: 'condition', label: 'Condition', type: 'text', placeholder: 'Condition', required: false, halfWidth: true },
      { name: 'parking', label: 'Parking', type: 'text', placeholder: 'Parking', required: false, halfWidth: true },
      { name: 'garden', label: 'Garden / Outdoor Space', type: 'text', placeholder: 'Garden / Outdoor Space', required: false, halfWidth: true },
      { name: 'leaseYears', label: 'Lease Years Remaining (if leasehold)', type: 'text', placeholder: 'Years remaining', required: false, halfWidth: true },
      { name: 'serviceCharge', label: 'Service Charge / Ground Rent (optional)', type: 'text', placeholder: '£ per year', required: false, halfWidth: true },
      { name: 'buyerPriority', label: 'Buyer Priority', type: 'text', placeholder: 'Priority', required: false },
    ],
    investor: [
      { name: 'propertyAddress', label: 'Property Address or Postcode *', type: 'text', placeholder: 'Enter address or postcode', required: true, halfWidth: false },
      { name: 'propertyType', label: 'Property Type *', type: 'select', required: true, options: [{ label: 'Flat', value: 'flat' }, { label: 'House', value: 'house' }, { label: 'Studio', value: 'studio' }], halfWidth: true },
      { name: 'bedrooms', label: 'Bedrooms *', type: 'number', placeholder: 'Number of bedrooms', required: true, halfWidth: true },
      { name: 'bathrooms', label: 'Bathrooms *', type: 'number', placeholder: 'Number of bathrooms', required: true, halfWidth: true },
      { name: 'floorArea', label: 'Floor Area (sq ft) *', type: 'number', placeholder: 'Square footage', required: true, halfWidth: true },
      { name: 'tenure', label: 'Tenure *', type: 'select', required: true, options: [{ label: 'Freehold', value: 'freehold' }, { label: 'Leasehold', value: 'leasehold' }, { label: 'Unknown', value: 'unknown' }], halfWidth: true },
      { name: 'epcRating', label: 'EPC Rating (if known) *', type: 'text', placeholder: 'EPC rating', required: true, halfWidth: true },
      { name: 'yearBuilt', label: 'Year Built', type: 'number', placeholder: 'e.g. 1995', required: false, halfWidth: true },
      { name: 'parking', label: 'Parking', type: 'text', placeholder: 'Parking', required: false, halfWidth: true },
      { name: 'garden', label: 'Garden / Outdoor Space', type: 'text', placeholder: 'Garden / Outdoor Space', required: false, halfWidth: true },
      { name: 'leaseYears', label: 'Lease Years Remaining (if leasehold)', type: 'text', placeholder: 'Years remaining', required: false, halfWidth: true },
      { name: 'serviceCharge', label: 'Service Charge / Ground Rent (if relevant)', type: 'text', placeholder: '£ per year', required: false, halfWidth: true },
      { name: 'currentRent', label: 'Current Monthly Rent (if already let)', type: 'text', placeholder: '£ per month', required: false, halfWidth: false },
      { name: 'strategy', label: 'Investor Strategy', type: 'text', placeholder: 'Investor strategy', required: false, halfWidth: false },
    ],
  },
  onSubmitReportRequest: (type: ReportType, formData: Record<string, unknown>) => {
    console.info('Report request submitted', { type, formData });
  },
};

export const RoomReviewPage: React.FC<RoomReviewPageProps> = ({
  hero = defaultReportPageContent.hero,
  selectionSection = defaultReportPageContent.selectionSection,
  comparisonSection = defaultReportPageContent.comparisonSection,
  inclusionsSection = defaultReportPageContent.inclusionsSection,
  workflowSection = defaultReportPageContent.workflowSection,
  methodologySection = defaultReportPageContent.methodologySection,
  dataSourcesSection = defaultReportPageContent.dataSourcesSection,
  importantInfoSection = defaultReportPageContent.importantInfoSection,
  faqSection = defaultReportPageContent.faqSection,
  formSchema = defaultReportPageContent.formSchema,
  onSubmitReportRequest = defaultReportPageContent.onSubmitReportRequest,
  onNavigateToSection,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<ReportType>('investor');
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReportRequest(activeFormTab, formData);
  };

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const renderIcon = (iconName?: string, defaultIcon: LucideIcon = FileText, className = 'w-5 h-5') => {
    const Component = (iconName && IconMap[iconName]) || defaultIcon;
    return <Component className={className} />;
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
              onClick={() => onNavigateToSection?.('reports')}
              className="rounded-full bg-[#8B0000] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6f0000]"
            >
              {hero.exploreButtonText}
            </button>
            <button
              type="button"
              onClick={() => onNavigateToSection?.('how-it-works')}
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

          <div className="mt-8 grid gap-6 md:grid-cols-2">
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
                    setActiveFormTab(option.type);
                    onNavigateToSection?.('form');
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
              onClick={() => onNavigateToSection?.('comparison')}
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
            Which report is right for you?
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
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

          <div className="mt-8 grid gap-6 md:grid-cols-2">
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

        <section id="form" className="mt-20 mx-auto max-w-[760px]">
          <div className="overflow-hidden rounded-[0px] border border-[#D7D9DB] bg-white shadow-none">
            <div className="grid grid-cols-2 bg-white text-[#1F2D3D]">
              {(['buyer', 'investor'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveFormTab(type)}
                  className={`px-4 py-3 text-[13px] font-semibold transition-colors ${
                    activeFormTab === type
                      ? 'bg-[#8B0000] text-white'
                      : 'bg-white text-[#1F2D3D]'
                  }`}
                >
                  {type === 'buyer' ? 'Buyer Report' : 'Investor Report'}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="bg-white p-6 md:p-8">
              <h3 className="text-[22px] font-light text-[#1F2D3D]">
                {activeFormTab === 'buyer' ? 'Buyer Report Request' : 'Investor Report Request'}
              </h3>
              <p className="mt-2 text-[12px] text-[#516078]">
                Complete the details below to generate an Investor Report tailored to the property and local market context.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {(formSchema[activeFormTab] || []).map((field: FormFieldConfig) => (
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

              <button
                type="submit"
                className="mt-8 w-full rounded-[6px] bg-[#8B0000] py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-[#6f0000]"
              >
                Generate {activeFormTab === 'buyer' ? 'Buyer' : 'Investor'} Report
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
