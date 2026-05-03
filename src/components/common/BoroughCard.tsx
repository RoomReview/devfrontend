import { Star, Shield, TrendingUp, Home } from 'lucide-react';
import { H3 } from './Typography';

interface BoroughCardProps {
  id: string;
  name: string;
  zones: string;
  rating: number;
  reviewCount: number;
  avgRent: string;
  trend: string;
  imageSrc: string;
}

const BoroughCard = ({
  name,
  zones,
  rating,
  reviewCount,
  avgRent,
  trend,
  imageSrc,
}: BoroughCardProps) => {
  return (
    <div className="bg-white border border-[#dcd7d7] rounded-[20px] shadow-[1px_1px_24.9px_0px_#e9ebed] overflow-hidden flex flex-col h-[300px] w-full max-w-[400px] transition-transform hover:-translate-y-1 mx-auto">
      {/* Image Container */}
      <div className="h-[149px] w-full relative shrink-0">
        <img
          src={imageSrc}
          alt={`View of ${name}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Container */}
      <div className="flex flex-col p-5 flex-1 justify-between">
        <H3 className="text-[#1a2b3c] mb-3 truncate" title={name}>{name}</H3>

        {/* Top Badges */}
        <div className="flex gap-2 items-center flex-wrap">
          <div className="border border-[#dcd7d7] rounded-full px-2.5 py-1 flex items-center bg-white h-[30px]">
            <span className="text-[16px] text-[#0b0b0b]">📍 {zones}</span>
          </div>
          
          <div className="border border-[#dcd7d7] rounded-full px-2 py-1 flex items-center gap-1 bg-white h-[30px]">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-[#0b0b0b] text-[16px]">{rating}</span>
            <span className="text-[#585858] text-[16px]">({reviewCount})</span>
          </div>

          <button className="border border-[#dcd7d7] rounded-full px-2 py-1 flex items-center gap-1 bg-white hover:bg-gray-50 transition-colors h-[30px] ml-auto">
            <Shield className="w-5 h-5 text-[#0b0b0b]" />
            <span className="font-bold text-[#0b0b0b] text-[16px]">Save</span>
          </button>
        </div>

        {/* Bottom Metrics */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <div className="border border-[#dcd7d7] rounded-[26px] px-2.5 py-1 flex items-center gap-2 bg-white flex-1 mr-2">
            <Home className="w-5 h-5 text-[#0b0b0b] shrink-0" />
            <span className="text-[#0b0b0b] text-[15px] sm:text-[16px] whitespace-nowrap overflow-hidden text-ellipsis">Avg. Rent: <span className="font-bold">{avgRent}</span></span>
            <TrendingUp className="w-5 h-5 text-primary ml-1 shrink-0" />
            <span className="font-bold text-primary text-[15px] sm:text-[16px]">{trend}</span>
          </div>
          <button className="flex gap-1 items-center hover:opacity-70 transition-opacity">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a2b3c]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a2b3c]"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a2b3c]"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoroughCard;
