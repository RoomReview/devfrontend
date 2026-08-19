export type ReportType = 'buyer' | 'investor';

export interface HeroBadge {
  id: string;
  label: string;
  iconName?: string;
}

export interface ReportOption {
  type: ReportType;
  title: string;
  description: string;
  highlights: string[];
  ctaText: string;
}

export interface ReportComparison {
  type: ReportType;
  title: string;
  description: string;
  bestForList: string[];
}

export interface ReportInclusions {
  type: ReportType;
  title: string;
  items: string[];
}

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  description: string;
  iconName?: string;
}

export interface MethodologyCard {
  title: string;
  description: string;
  iconName?: string;
}

export interface DataSourceItem {
  id: string;
  title: string;
  description: string;
  officialUrl?: string;
  iconName?: string;
}

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea';
  placeholder?: string;
  required?: boolean;
  options?: FormFieldOption[];
  halfWidth?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface RoomReviewPageProps {
  hero: {
    badgeTitle: string;
    mainHeading: string;
    subHeading: string;
    exploreButtonText: string;
    howItWorksButtonText: string;
    badges: HeroBadge[];
  };
  selectionSection: {
    heading: string;
    options: ReportOption[];
    compareReportsText: string;
  };
  comparisonSection: {
    heading: string;
    reports: ReportComparison[];
  };
  inclusionsSection: {
    heading: string;
    inclusions: ReportInclusions[];
    disclaimerText: string;
  };
  workflowSection: {
    heading: string;
    steps: WorkflowStep[];
  };
  methodologySection: {
    heading: string;
    cards: MethodologyCard[];
  };
  dataSourcesSection: {
    heading: string;
    subHeading: string;
    sources: DataSourceItem[];
    licensingHeading: string;
    licensingParagraphs: string[];
    methodologyLinkText: string;
    methodologyLinkUrl: string;
  };
  importantInfoSection: {
    title: string;
    paragraphs: string[];
  };
  faqSection: {
    heading: string;
    faqs: FAQItem[];
  };
  formSchema: Record<ReportType, FormFieldConfig[]>;
  onSubmitReportRequest: (type: ReportType, formData: Record<string, unknown>) => void;
  onNavigateToSection?: (sectionId: string) => void;
}
