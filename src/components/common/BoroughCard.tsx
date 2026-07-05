import { useState } from "react";
import { Link } from "react-router";
import type { BoroughSummary } from "@/types/borough.types";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400&auto=format&fit=crop";

interface BoroughCardProps {
  borough: BoroughSummary;
}

export default function BoroughCard({ borough }: BoroughCardProps) {
  const { boroughId, name, description, image, metrics } = borough;
  const [imgSrc, setImgSrc] = useState(image || DEFAULT_IMAGE);

  // Extract display-friendly values from the metrics JSON if available
  const zone = typeof metrics?.zone === "string" ? metrics.zone : null;
  const population =
    typeof metrics?.population === "number" ? metrics.population : null;

  return (
    <Link
      to={`/boroughs/${boroughId}`}
      id={`borough-card-${boroughId}`}
      className="group w-full max-w-[392px] rounded-[20px] border border-[#dcd7d7] bg-white shadow-[1px_1px_24.9px_0px_#e9ebed] overflow-hidden transition-all duration-300 hover:shadow-[2px_4px_32px_0px_#d6d0d0] hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={imgSrc}
          alt={name}
          onError={() => {
            if (imgSrc !== DEFAULT_IMAGE) {
              setImgSrc(DEFAULT_IMAGE);
            }
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {zone && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#1A2B3C] text-xs font-semibold px-3 py-1 rounded-full">
            {zone}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="text-[#1A2B3C] text-lg font-bold leading-tight group-hover:text-[#8B0202] transition-colors">
          {name}
        </h3>

        {description && (
          <p className="text-[#6b6b6b] text-sm leading-[1.5] line-clamp-2">
            {description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-4 mt-auto pt-3 border-t border-[#f0eded]">
          {population != null && (
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"
                  fill="#8B0202"
                />
              </svg>
              <span className="text-[#6b6b6b] text-xs font-medium">
                {population.toLocaleString()}
              </span>
            </div>
          )}

          {zone && (
            <div className="flex items-center gap-1.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                  fill="#8B0202"
                />
              </svg>
              <span className="text-[#6b6b6b] text-xs font-medium">
                {zone}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
