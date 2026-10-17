import { getCouncilSeatTotal, type VotingDataRecord } from '@/services/voting-data.service';

const getPartyColor = (party: string) => {
  const normalized = party.toLowerCase();

  if (normalized.includes('labour')) return '#E63946';
  if (normalized.includes('conservative')) return '#3B82F6';
  if (normalized.includes('liberal') || normalized.includes('democrat') || normalized.includes('lib dem')) return '#F4A261';
  if (normalized.includes('green')) return '#2E8B57';
  if (normalized.includes('reform')) return '#20B2AA';
  return '#8A8F98';
};

export default function PoliticalLandscapeChart({ records }: { records: VotingDataRecord[] }) {
  const latestYear = records.reduce((latest, record) => Math.max(latest, record.year), 0);
  const latestRecords = records
    .filter((record) => record.year === latestYear && record.party.trim())
    .map((record) => ({ ...record, share: Number(record.percentage) }))
    .filter((record) => Number.isFinite(record.share))
    .sort((first, second) => second.share - first.share || first.party.localeCompare(second.party));
  const sourceNames = [...new Set(latestRecords.map((record) => record.source.trim()).filter(Boolean))];
  const totalCouncilSeats = latestRecords.length > 0
    ? getCouncilSeatTotal(latestRecords[0].borough)
    : undefined;
  const calculatedSeats = totalCouncilSeats
    ? latestRecords.map((record) => Math.round(record.share * totalCouncilSeats / 100))
    : [];
  const percentagesSum = latestRecords.reduce((total, record) => total + record.share, 0);
  const hasConsistentSeatCounts = totalCouncilSeats !== undefined
    && Math.abs(percentagesSum - 100) <= 0.2
    && calculatedSeats.reduce((total, seats) => total + seats, 0) === totalCouncilSeats
    && latestRecords.every((record, index) =>
      Math.round(calculatedSeats[index] * 1000 / totalCouncilSeats) / 10
        === Math.round(record.share * 10) / 10,
    );

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[clamp(1.5rem,2.4vw,2rem)] font-semibold tracking-[-0.04em] text-[#1a1a1a]">
            Political landscape{latestYear > 0 ? ` · ${latestYear}` : ''}
          </h2>
          <p className="mt-1 text-base text-slate-500">
            {latestYear > 0 ? 'Share of council seats (%)' : 'Share of council seats (%) unavailable'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Source: {sourceNames.length > 0 ? sourceNames.join(', ') : 'Source unavailable'}
          </p>
        </div>
      </div>
      {latestRecords.length > 0 ? (
        <div className="mt-4 w-full">
          {latestRecords.map((record, index) => {
            const seatCount = typeof record.seats === 'number' && Number.isInteger(record.seats)
              ? record.seats
              : hasConsistentSeatCounts ? calculatedSeats[index] : undefined;

            return (
              <div key={record.voting_data_id ?? `${record.party}-${index}`} className="mt-4 first:mt-0">
                <div className="mb-1 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 text-base">
                  <span className="min-w-0 break-words text-[#1a1a1a]">{record.party}</span>
                  <span className="whitespace-nowrap text-right font-bold tabular-nums text-[#1a1a1a]">
                    {record.share.toLocaleString('en-GB', { maximumFractionDigits: 1 })}%
                    {seatCount !== undefined ? ` · ${seatCount} ${seatCount === 1 ? 'seat' : 'seats'}` : ''}
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-[6px] bg-[#edf1f4]">
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.max(0, Math.min(100, record.share))}%`,
                      background: getPartyColor(record.party),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No political data is available.</p>
      )}
      <div className="mt-5 w-full border-t border-[#e2e8ee] pt-3 text-sm leading-[1.5] text-slate-500">
        <p>Percentage = seats held by each party ÷ total council seats × 100.</p>
        <p>These figures show council seat share, not vote share.</p>
      </div>
    </>
  );
}
