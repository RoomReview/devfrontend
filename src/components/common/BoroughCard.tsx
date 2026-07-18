import { Link } from "react-router";
import { MapPin } from "lucide-react";

interface BoroughCardProps {
  id: string;
  name: string;
  zones: string;
  imageSrc: string;
}

export default function BoroughCard({ id, name, zones, imageSrc }: BoroughCardProps) {
  return (
    <Link
      to={`/boroughs/${id}`}
      className="group bg-white border border-[#dcd7d7] rounded-[20px] shadow-[1px_1px_24.9px_0px_#e9ebed] overflow-hidden w-full max-w-[400px] block transition-shadow hover:shadow-[1px_1px_24.9px_0px_#d6d9dc]"
    >
      <div className="h-[149px] w-full overflow-hidden">
        <img
          src={imageSrc}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="px-6 pt-4 pb-6 flex flex-col gap-3">
        <h3 className="text-[#1A2B3C] text-[24px] font-bold tracking-[-0.48px] leading-tight">
          {name}
        </h3>
        <div className="inline-flex items-center gap-1.5 border border-[#dcd7d7] rounded-full px-[9px] py-[6px] w-fit">
          <MapPin className="w-4 h-4 text-[#8B0202] shrink-0" />
          <span className="text-[#0b0b0b] text-base leading-[1.4]">{zones}</span>
        </div>
      </div>
    </Link>
  );
}
