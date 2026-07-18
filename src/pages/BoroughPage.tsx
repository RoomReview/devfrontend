import { Link, useParams } from "react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { H1, H2, Body } from "../components/common/Typography";
import { MOCK_BOROUGHS } from "../constant/boroughs";

const UPCOMING_SECTIONS = [
  "Local plan summary",
  "Borough improvement overview",
  "Political landscape",
  `Reviews`,
];

const BoroughPage = () => {
  const { id } = useParams();
  const borough = MOCK_BOROUGHS.find((b) => b.id === id);

  if (!borough) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-24 text-center">
        <H1 className="text-[#1A2B3C] mb-4">Borough not found</H1>
        <Body className="text-[#0b0b0b] mb-8">
          We couldn't find a borough matching that link.
        </Body>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#8B0202] font-bold uppercase tracking-[0.64px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to boroughs
        </Link>
      </div>
    );
  }

  const quickFacts = [
    { label: "Zones: ", value: borough.zones },
    { label: "Average rent: ", value: `${borough.avgRent} / month` },
    { label: "Rent trend: ", value: `${borough.trend} year on year` },
    {
      label: "Rating: ",
      value: `${borough.rating} (${borough.reviewCount} reviews)`,
    },
  ];

  return (
    <div className="w-full relative overflow-hidden bg-white font-montserrat">
      {/* Hero */}
      <section className="relative w-full h-[453px]">
        <img
          src={borough.imageSrc}
          alt={borough.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] h-full flex flex-col justify-end pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm mb-4 w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to boroughs
          </Link>
          <H1 className="text-white text-4xl lg:text-[48px] font-bold tracking-[-0.72px] max-w-[612px]">
            {borough.name}
          </H1>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] pt-8">
        <Body className="text-[#0b0b0b] text-[16px] leading-[1.4] max-w-[612px] mb-8">
          {borough.description}
        </Body>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            to="/reviews"
            className="bg-[#8B0202] text-white px-5 py-3 rounded-[10px] font-bold uppercase tracking-[0.64px] flex items-center justify-center gap-2 hover:bg-[#691313] transition-colors w-fit"
          >
            <Plus className="w-5 h-5" />
            Add review
          </Link>
          <button
            type="button"
            className="border-2 border-[#8B0202] text-[#8B0202] px-5 py-3 rounded-[10px] font-bold uppercase tracking-[0.64px] hover:bg-[#8B0202]/5 transition-colors w-fit"
          >
            Borough website
          </button>
        </div>

        {/* Interesting points / quick facts */}
        <div className="max-w-[612px] flex flex-col gap-4 mb-16">
          <H2 className="text-[#0b0b0b] text-2xl font-medium">
            Interesting points about {borough.name}:
          </H2>
          <div className="flex flex-col gap-3">
            {quickFacts.map((fact) => (
              <p key={fact.label} className="text-[16px] leading-[1.4]">
                <span className="font-bold text-[#585858]">{fact.label}</span>
                <span className="text-[#0b0b0b]">{fact.value}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Placeholder for remaining sections */}
        <div className="border border-dashed border-[#dcd7d7] rounded-[20px] p-8 lg:p-12 mb-16 bg-[#FAFAFA]">
          <H2 className="text-[#0b0b0b] text-2xl font-bold mb-2">
            More on {borough.name} — coming soon
          </H2>
          <Body className="text-[#585858] mb-6">
            We're building out the rest of this page next.
          </Body>
          <ul className="flex flex-wrap gap-3">
            {UPCOMING_SECTIONS.map((section) => (
              <li
                key={section}
                className="border border-[#dcd7d7] rounded-full px-4 py-2 text-sm text-[#0b0b0b] bg-white"
              >
                {section}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default BoroughPage;
