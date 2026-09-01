import { Link } from 'react-router-dom';

interface BoroughCardProps {
  id?: string;
  name: string;
  zones: string;
  rating: number;
  reviewCount: number;
  avgRent: string;
  trend: string;
  imageSrc: string;
  linkTo?: string;
}

const BoroughCard = ({
  name,
  zones,
  rating,
  reviewCount,
  avgRent,
  trend,
  imageSrc,
  linkTo,
}: BoroughCardProps) => {
  const content = (
    <article className="w-full max-w-xl rounded-[24px] overflow-hidden border border-[#E5DCD5] bg-white shadow-sm hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-[#8B0202]">
      <div className="relative h-56 overflow-hidden">
        <img src={imageSrc} alt={name} className="h-full w-full object-cover" />
      </div>
      <div className="p-6">
        <p className="text-sm text-[#8B0202] font-semibold uppercase tracking-[0.2em] mb-2">{zones}</p>
        <h2 className="text-xl font-bold text-[#1A2B3C] mb-3">{name}</h2>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[#1A2B3C] mb-5">
          <span className="font-semibold">{rating.toFixed(1)} ★</span>
          <span>{reviewCount} reviews</span>
          <span>{avgRent} avg rent</span>
        </div>
        <div className="rounded-3xl bg-[#F3E6DE] px-4 py-3 text-sm text-[#1A2B3C] font-medium">
          Trend: {trend}
        </div>
      </div>
    </article>
  );

  if (!linkTo) return content;

  return (
    <Link to={linkTo} className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-[#8B0202] rounded-[24px]">
      {content}
    </Link>
  );
};

export default BoroughCard;
