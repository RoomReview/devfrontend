import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Database, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

export const DataSourcesPage: React.FC = () => {
  const tableData = [
    {
      dataset: 'Land Registry Price Paid Data',
      source: 'HM Land Registry',
      coverage: 'England & Wales',
      frequency: 'Monthly',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'Rental Market Data',
      source: 'Greater London Authority (GLA) / London Datastore',
      coverage: 'London',
      frequency: 'Quarterly',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'Crime Statistics',
      source: 'Police.uk',
      coverage: 'England, Wales & NI',
      frequency: 'Monthly',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'Transport Network',
      source: 'Transport for London (TfL)',
      coverage: 'London',
      frequency: 'Quarterly',
      licence: 'TfL Open Data Terms',
    },
    {
      dataset: 'School Performance',
      source: 'Department for Education',
      coverage: 'England',
      frequency: 'Annual',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'School Inspections',
      source: 'Ofsted',
      coverage: 'England',
      frequency: 'Ongoing',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'Demographics',
      source: 'Office for National Statistics (ONS)',
      coverage: 'UK-wide',
      frequency: 'Annual',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'Census 2021',
      source: 'Office for National Statistics (ONS)',
      coverage: 'England & Wales',
      frequency: 'Decennial',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'Planning Applications',
      source: 'planning.data.gov.uk',
      coverage: 'England',
      frequency: 'Monthly',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'EPC Ratings',
      source: 'Energy Performance of Buildings Register',
      coverage: 'England & Wales',
      frequency: 'Monthly',
      licence: 'OGL v3.0',
    },
    {
      dataset: 'London Open Data',
      source: 'London Datastore',
      coverage: 'London',
      frequency: 'Varies by dataset',
      licence: 'OGL v3.0 (where applicable)',
    },
  ];

  const transformationSteps = [
    { step: 1, title: 'Data Ingestion', desc: 'Raw data collected from official APIs and public sources' },
    { step: 2, title: 'Cleaning & Validation', desc: 'Quality checks, deduplication and anomaly detection' },
    { step: 3, title: 'Standardisation', desc: 'Geocoding, normalisation and schema alignment' },
    { step: 4, title: 'Data Modelling', desc: 'Aggregation, weighting and feature engineering' },
    { step: 5, title: 'RoomReview Score', desc: 'Proprietary score calculated and published' },
  ];

  const scoreCategories = [
    { name: 'Safety', weight: '20%', width: '20%', color: 'bg-[#8B0000]' },
    { name: 'Affordability', weight: '20%', width: '20%', color: 'bg-[#DCE7F2]' },
    { name: 'Environmental Risks', weight: '20%', width: '20%', color: 'bg-slate-200' },
    { name: 'Demographics', weight: '15%', width: '15%', color: 'bg-[#C27B7B]' },
    { name: 'Transport', weight: '15%', width: '15%', color: 'bg-[#E2E8F0]' },
    { name: 'Development/Future Potential', weight: '10%', width: '10%', color: 'bg-[#C27B7B]' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#2B363B] antialiased">
      {/* Top Bar Navigation */}
      <header className="mx-auto flex max-w-[1000px] justify-end px-6 py-4 text-xs font-medium text-[#5F6D7A]">
        <nav className="flex space-x-6">
          <Link to="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
          <Link to="/cookie-policy" className="hover:text-slate-900 transition-colors">Cookies</Link>
          <Link to="/data-sources" className="text-[#8B0000] font-semibold">Data Sources</Link>
        </nav>
      </header>

      {/* Hero Header */}
      <section className="bg-[#8B0000] py-14 text-center text-white">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Data Sources & Methodology</h1>
        <p className="mt-2 text-xs font-light text-slate-200 sm:text-sm">
          Transparent, structured and verifiable data
        </p>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-[850px] px-6 py-12 space-y-12 text-xs leading-relaxed text-[#4A5568]">

        {/* Section 1: Introduction */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Introduction</h2>
          <p className="text-xs text-[#4A5568] leading-relaxed">
            RoomReview aggregates data from authoritative public and commercial sources to provide comprehensive property insights. Our methodology is designed to be transparent, reproducible, and compliant with all applicable licensing requirements. All data processing follows GDPR principles and UK data protection standards.
          </p>

          <div className="flex gap-4 rounded-xl border-l-4 border-l-[#8B0000] border-y border-r border-[#EBF3FA] bg-[#EBF3FA] p-5 text-xs text-[#4A5568]">
            <FileText className="h-5 w-5 shrink-0 text-[#8B0000]" />
            <div className="space-y-1">
              <h3 className="font-bold text-[#1A202C]">Open Government Licence Attribution</h3>
              <p className="text-[11px] text-[#5F6D7A]">
                Contains public sector information licensed under the Open Government Licence v3.0.
              </p>
              <a
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[11px] text-[#8B0000] underline"
              >
                https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
              </a>
              <p className="text-[10px] text-[#718096] pt-1">
                Sources include: UK Government EPC Register, Police.uk, Department for Education, Office for National Statistics, Environment Agency, British Geological Survey, Electoral Commission, planning.data.gov.uk, HM Land Registry
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Data Modification and Processing */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-[#1A202C]">Data Modification and Processing</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-3 text-xs text-[#4A5568]">
            <p>All datasets used within RoomReview are:</p>
            <ul className="space-y-1.5 pl-2 text-[11px]">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
                <span>cleaned</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
                <span>standardised</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
                <span>aggregated</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-[#8B0000]" />
                <span>modelled</span>
              </li>
            </ul>
            <p className="pt-2">
              RoomReview applies transformation and scoring methodologies to generate insights.
            </p>
            <p className="text-[11px] text-[#718096]">
              Original data providers are not responsible for any derived outputs.
            </p>
          </div>
        </section>

        {/* Section 3: Data Sources Table */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Data Sources</h2>
          <p className="text-xs text-[#4A5568]">
            RoomReview aggregates and transforms official UK public datasets from government bodies and trusted organisations. These datasets are cleaned, validated and combined to generate neighbourhood insights and the proprietary RoomReview Score.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[#F3E8E2] bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF5F0] text-[#1A202C] font-semibold border-b border-[#F3E8E2]">
                  <th className="p-3.5">Dataset</th>
                  <th className="p-3.5">Primary Source</th>
                  <th className="p-3.5">Coverage</th>
                  <th className="p-3.5">Update Frequency</th>
                  <th className="p-3.5">Licence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8E2] text-[#4A5568]">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF5F0]/50 transition-colors">
                    <td className="p-3.5 font-semibold text-[#1A202C]">{row.dataset}</td>
                    <td className="p-3.5">{row.source}</td>
                    <td className="p-3.5">{row.coverage}</td>
                    <td className="p-3.5">{row.frequency}</td>
                    <td className="p-3.5">
                      <span className="inline-block rounded bg-[#EBF3FA] px-2 py-0.5 text-[10px] text-[#5F6D7A]">
                        {row.licence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2.5 rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-4 text-[11px] text-[#718096]">
            <Info className="h-4 w-4 shrink-0 text-[#718096]" />
            <p>
              RoomReview combines publicly available datasets from official UK organisations. All data remains the property of the original providers. RoomReview is an independent platform and is not affiliated with, endorsed by or sponsored by any organisation listed above.
            </p>
          </div>
        </section>

        {/* Section 4: Data Transformation Process */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Data Transformation Process</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
            {transformationSteps.map((step) => (
              <div key={step.step} className="relative rounded-xl border border-[#EDF2F7] bg-white p-4 text-center space-y-2">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#8B0000] text-xs font-bold text-white">
                  {step.step}
                </div>
                <h3 className="text-xs font-bold text-[#1A202C]">{step.title}</h3>
                <p className="text-[10px] text-[#718096] leading-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: RoomReview Score Breakdown */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">RoomReview Score Breakdown</h2>
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-6">
            <p className="text-xs text-[#4A5568]">
              Our proprietary RoomReview Score (0-100) is calculated using weighted factors across six key categories:
            </p>

            <div className="space-y-4">
              {scoreCategories.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#1A202C]">
                    <span>{cat.name}</span>
                    <span className="text-[#718096]">{cat.weight}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: cat.width }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-white p-4 space-y-1 border border-[#EDF2F7]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1A202C]">
                <TrendingUp className="h-4 w-4 text-[#8B0000]" />
                <span>Score Calculation</span>
              </div>
              <p className="text-[11px] text-[#718096]">
                Each component is normalized to a 0-100 scale, weighted according to the percentages above, and aggregated to produce the final score. Scores are recalculated monthly to reflect the latest data.
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Update Frequency */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Update Frequency</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 text-center space-y-2">
              <Calendar className="mx-auto h-6 w-6 text-[#8B0000]" />
              <h3 className="text-xs font-bold text-[#1A202C]">Daily</h3>
              <p className="text-[11px] text-[#718096]">Property listings and availability</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 text-center space-y-2">
              <Calendar className="mx-auto h-6 w-6 text-[#8B0000]" />
              <h3 className="text-xs font-bold text-[#1A202C]">Monthly</h3>
              <p className="text-[11px] text-[#718096]">Crime stats, EPC data, scores</p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 text-center space-y-2">
              <Calendar className="mx-auto h-6 w-6 text-[#8B0000]" />
              <h3 className="text-xs font-bold text-[#1A202C]">Quarterly / Annual</h3>
              <p className="text-[11px] text-[#718096]">School data, transport links</p>
            </div>
          </div>
        </section>

        {/* Section 7: Data Quality & Verification */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-[#1A202C]">Data Quality & Verification</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1A202C]">
                <Database className="h-4 w-4 text-[#8B0000]" />
                <h3>Source Validation</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                All data is sourced from verified official or commercial providers. We maintain audit logs of all data ingestion processes.
              </p>
            </div>
            <div className="rounded-xl border border-[#EDF2F7] bg-white p-5 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-[#1A202C]">
                <ShieldCheck className="h-4 w-4 text-[#8B0000]" />
                <h3>Quality Checks</h3>
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed">
                Automated validation rules detect anomalies, missing values, and outliers. Manual review processes ensure data integrity.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Important Disclaimer */}
        <section>
          <div className="flex gap-3 rounded-xl border border-[#F6E05E] bg-[#FEFCBF]/30 p-5 text-xs text-[#744210]">
            <AlertCircle className="h-5 w-5 shrink-0 text-[#D69E2E]" />
            <div className="space-y-2">
              <h3 className="font-bold text-[#744210]">Important Disclaimer</h3>
              <p className="text-[11px] leading-relaxed">
                RoomReview aggregates data from third-party and public sources. While we strive for accuracy, we do not guarantee completeness or timeliness.
              </p>
              <p className="text-[11px] leading-relaxed">
                All outputs, including RoomReview Scores, are indicative and for informational purposes only.
              </p>
              <p className="text-[11px] leading-relaxed">
                RoomReview is not liable for decisions made based on this data. Users should independently verify information and seek professional advice where necessary.
              </p>
            </div>
          </div>
        </section>

        {/* Section 9: Methodology Transparency */}
        <section className="space-y-3">
          <div className="rounded-xl border border-[#F3E8E2] bg-[#FAF5F0] p-6 space-y-3 text-xs text-[#4A5568]">
            <h2 className="text-base font-bold text-[#1A202C]">Methodology Transparency</h2>
            <p className="text-[11px]">
              We are committed to transparency in our data methodology. For detailed technical documentation, scoring algorithms, or to report data quality issues, please contact our data team:
            </p>
            <p className="text-xs">
              <strong className="font-bold text-[#1A202C]">Email:</strong>{' '}
              <a href="mailto:info@roomreview.co.uk" className="text-[#8B0000] underline">
                info@roomreview.co.uk
              </a>
            </p>
            <p className="text-[10px] text-[#718096] pt-1">
              This methodology document was last updated on 27 April 2026.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
};