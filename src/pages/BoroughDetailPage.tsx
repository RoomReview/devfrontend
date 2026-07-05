import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { useBorough } from "../hooks/boroughs/useBorough";
import { ArrowLeft, AlertCircle, Database, LayoutGrid, Info } from "lucide-react";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop";

export default function BoroughDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: borough, isLoading, isError, refetch } = useBorough(id);

  // Image fallback state
  const [imgSrc, setImgSrc] = useState(DEFAULT_IMAGE);

  // Sync image source when borough data loads
  useEffect(() => {
    if (borough?.image) {
      setImgSrc(borough.image);
    } else {
      setImgSrc(DEFAULT_IMAGE);
    }
  }, [borough]);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-12 animate-pulse font-montserrat">
        {/* Breadcrumb Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-48 mb-8" />
        
        {/* Header Skeleton */}
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-6 bg-gray-150 rounded w-1/4 mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px] bg-gray-200 rounded-[20px]" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
          </div>

          {/* Sidebar / Metrics Skeleton */}
          <div className="space-y-6">
            <div className="h-[300px] bg-gray-100 rounded-[20px] p-6" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !borough) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-16 flex flex-col items-center justify-center gap-4 text-center font-montserrat">
        <AlertCircle className="w-16 h-16 text-[#8B0202]" />
        <h2 className="text-[#1A2B3C] text-2xl font-bold">Failed to load borough details</h2>
        <p className="text-[#6b6b6b] max-w-md">
          There was an error retrieving the data for this borough. It may not exist or the API might be currently unavailable.
        </p>
        <div className="flex gap-4 mt-2">
          <Link
            to="/"
            className="border-2 border-[#1A2B3C] text-[#1A2B3C] px-6 py-2.5 rounded-lg font-bold uppercase tracking-[0.64px] hover:bg-[#1A2B3C]/5 transition-colors text-sm"
          >
            Go back Home
          </Link>
          <button
            onClick={() => refetch()}
            className="bg-[#8B0202] text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-[0.64px] hover:bg-[#691313] transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Extract displaying metadata
  const metrics = borough.metrics || {};
  const hasMetrics = Object.keys(metrics).length > 0;

  return (
    <div className="w-full bg-white font-montserrat min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[96px] py-8 lg:py-12">
        {/* Navigation & Breadcrumbs */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#8B0202] hover:text-[#691313] font-bold uppercase tracking-[0.64px] text-sm mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Boroughs
        </Link>

        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#f0eded] pb-6 mb-8">
          <div>
            <h1 className="text-4xl lg:text-[40px] font-bold text-[#1A2B3C] tracking-tight leading-tight mb-2">
              {borough.name}
            </h1>
            <p className="text-sm text-[#6b6b6b] font-medium uppercase tracking-wider">
              Slug: <span className="text-[#8B0202] font-semibold">{borough.slug}</span>
            </p>
          </div>
          <div className="bg-[#F3E6DE] text-[#1A2B3C] px-4 py-2 rounded-full font-bold text-xs shrink-0 self-start md:self-auto">
            Borough ID: {borough.boroughId}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Image */}
            <div className="relative h-[300px] sm:h-[450px] w-full rounded-[20px] shadow-[1px_1px_24.9px_0px_#e9ebed] overflow-hidden bg-gray-100">
              <img
                src={imgSrc}
                alt={borough.name}
                onError={() => {
                  if (imgSrc !== DEFAULT_IMAGE) {
                    setImgSrc(DEFAULT_IMAGE);
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Description */}
            <div className="bg-white border border-[#dcd7d7] rounded-[20px] p-6 sm:p-8 shadow-[1px_1px_24.9px_0px_#e9ebed]">
              <h2 className="text-[#1A2B3C] text-xl font-bold flex items-center gap-2 mb-4 border-b border-[#f0eded] pb-3">
                <Info className="w-5 h-5 text-[#8B0202]" />
                About {borough.name}
              </h2>
              {borough.description ? (
                <p className="text-[#0b0b0b] text-base leading-relaxed whitespace-pre-line">
                  {borough.description}
                </p>
              ) : (
                <p className="text-[#6b6b6b] text-sm italic">
                  No description available for this borough.
                </p>
              )}
            </div>

            {/* Raw JSON Data Viewer */}
            <div className="bg-white border border-[#dcd7d7] rounded-[20px] overflow-hidden shadow-[1px_1px_24.9px_0px_#e9ebed] mb-12">
              <div className="bg-[#1A2B3C] p-4 flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#F3E6DE]" />
                  <span className="font-bold text-sm uppercase tracking-[0.64px]">Raw API Response Data</span>
                </div>
                <span className="text-[10px] bg-white/15 px-2 py-0.5 rounded font-mono text-[#F3E6DE]">
                  GET /boroughs/{borough.boroughId}
                </span>
              </div>
              <div className="p-6 bg-[#1e1e24] overflow-x-auto">
                <pre className="text-left text-xs font-mono text-gray-200 leading-normal select-all">
                  {JSON.stringify(borough, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Sidebar - Metrics */}
          <div className="flex flex-col gap-8">
            <div className="bg-white border border-[#dcd7d7] rounded-[20px] p-6 sm:p-8 shadow-[1px_1px_24.9px_0px_#e9ebed] h-fit">
              <h2 className="text-[#1A2B3C] text-xl font-bold flex items-center gap-2 mb-6 border-b border-[#f0eded] pb-3">
                <LayoutGrid className="w-5 h-5 text-[#8B0202]" />
                Key Metrics
              </h2>

              {hasMetrics ? (
                <div className="flex flex-col gap-5">
                  {Object.entries(metrics).map(([key, value]) => {
                    // Make label readable (camelCase to Title Case)
                    const label = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    
                    return (
                      <div key={key} className="flex flex-col gap-1.5 pb-4 border-b border-[#f0eded] last:border-b-0 last:pb-0">
                        <span className="text-xs text-[#6b6b6b] font-semibold uppercase tracking-wider">
                          {label}
                        </span>
                        <span className="text-lg font-bold text-[#1A2B3C]">
                          {typeof value === "object" && value !== null
                            ? JSON.stringify(value)
                            : String(value)}
                        </span>
                      </div>
                    );
                  })}
                  
                  {/* Longitude and Latitude */}
                  {borough.latitude !== null && (
                    <div className="flex flex-col gap-1.5 pb-4 border-b border-[#f0eded] last:border-b-0 last:pb-0">
                      <span className="text-xs text-[#6b6b6b] font-semibold uppercase tracking-wider">
                        Latitude
                      </span>
                      <span className="text-lg font-bold text-[#1A2B3C]">
                        {borough.latitude}
                      </span>
                    </div>
                  )}
                  {borough.longitude !== null && (
                    <div className="flex flex-col gap-1.5 pb-4 border-b border-[#f0eded] last:border-b-0 last:pb-0">
                      <span className="text-xs text-[#6b6b6b] font-semibold uppercase tracking-wider">
                        Longitude
                      </span>
                      <span className="text-lg font-bold text-[#1A2B3C]">
                        {borough.longitude}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-[#6b6b6b] italic">No metrics listed for this borough.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
