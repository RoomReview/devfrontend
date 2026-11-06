import { useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/common/Button";
import { Body, H3, Small } from "@/components/common/Typography";
import type {
  AffiliateOffer,
  ReviewReward,
} from "@/services/affiliate-reward.service";

interface PartnerOffersSectionProps {
  offers: AffiliateOffer[];
  rewards: ReviewReward[];
  availableRewards: number;
  redeeming: boolean;
  onSelectOffer: (rewardGrantId: string, offer: AffiliateOffer) => void;
}

const PartnerOffersSection = ({
  offers,
  rewards,
  availableRewards,
  redeeming,
  onSelectOffer,
}: PartnerOffersSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableReward = rewards.find((reward) => !reward.redeemedAt);
  const renderOffer = (offer: AffiliateOffer) => (
    <li
      key={offer.offerId}
      className="flex flex-col gap-4 rounded-xl border border-[#E5DCD5] p-3 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {offer.logoUrl ? (
          <img
            src={offer.logoUrl}
            alt={`${offer.storeName} logo`}
            className="h-16 w-16 shrink-0 rounded-lg border border-[#E5DCD5] bg-white object-contain p-1"
            loading="lazy"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#E5DCD5] bg-[#FAFAF9] text-lg font-bold text-[#1A2B3C]"
          >
            {offer.storeName
              .split(/\s+/)
              .map((word) => word[0])
              .join("")
              .slice(0, 3)
              .toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-bold text-[#1A2B3C]">{offer.storeName}</p>
          <Small className="mt-1 block text-[#64707A]">
            {offer.description}
          </Small>
          {offer.discountDetails && (
            <Small className="mt-1 block font-semibold text-[#1A2B3C]">
              Terms: {offer.discountDetails}
            </Small>
          )}
        </div>
      </div>
      <Button
        size="sm"
        className="shrink-0"
        disabled={!availableReward || redeeming}
        onClick={() => {
          if (!availableReward) return;
          setIsOpen(false);
          onSelectOffer(availableReward.rewardGrantId, offer);
        }}
      >
        Shop Now
        <span aria-hidden="true">›</span>
      </Button>
    </li>
  );

  return (
    <>
      <section
        id="partner-offers"
        aria-labelledby="partner-offers-title"
        className="scroll-mt-24 rounded-[24px] border border-[#E5DCD5] bg-white p-4 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <H3 id="partner-offers-title" className="text-[#1A2B3C]">
              Partner offers
            </H3>
            <Small className="mt-1 text-[#64707A]">
              Browse exclusive offers from our partners.
            </Small>
          </div>
          {offers.length > 1 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsOpen(true)}
            >
              View all offers
            </Button>
          )}
        </div>
        {offers.length === 0 && (
          <Body className="mt-4">
            No active partner offers are available right now. Please check back
            later.
          </Body>
        )}
        {offers.length > 0 && (
          <ul className="mt-5 space-y-3">{renderOffer(offers[0])}</ul>
        )}
      </section>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="partner-offers-dialog-title"
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <H3 id="partner-offers-dialog-title" className="text-[#1A2B3C]">
                  Partner offers
                </H3>
                <Body className="mt-1 text-sm">
                  Choose an offer to continue to the partner store.
                </Body>
              </div>
              <button
                type="button"
                aria-label="Close partner offers"
                className="rounded-full p-2 text-[#64707A] hover:bg-[#F8F4F1] hover:text-[#1A2B3C]"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {availableRewards === 0 && (
              <p className="mt-4 rounded-lg bg-[#E4F0FF] p-3 text-sm text-[#1A2B3C]">
                You need an available reward to shop with a partner.
              </p>
            )}

            <ul className="mt-5 space-y-3">
              {offers.slice(1).map(renderOffer)}
            </ul>
          </section>
        </div>
      )}
    </>
  );
};

export default PartnerOffersSection;
