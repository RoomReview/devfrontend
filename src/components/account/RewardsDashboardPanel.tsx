import { AlertCircle, Info } from "lucide-react";
import Button from "@/components/common/Button";
import { Body, H3, Small } from "@/components/common/Typography";
import type {
  Achievement,
  AffiliateOffer,
  ProfileProgress,
  ReviewReward,
} from "@/services/affiliate-reward.service";

interface RewardsDashboardPanelProps {
  profile: ProfileProgress | null;
  achievements: Achievement[];
  hasRewardsAccess: boolean;
  availableRewards: number;
  offers: AffiliateOffer[];
  rewards: ReviewReward[];
  loading: boolean;
  error: string | null;
  redeeming: boolean;
  onRetry: () => void;
  onSelectOffer: (rewardGrantId: string, offer: AffiliateOffer) => void;
}

const RewardsDashboardPanel = ({
  profile,
  achievements,
  hasRewardsAccess,
  availableRewards,
  offers,
  rewards,
  loading,
  error,
  redeeming,
  onRetry,
  onSelectOffer,
}: RewardsDashboardPanelProps) => {
  const availableReward = rewards.find((reward) => !reward.redeemedAt);

  return (
    <section
      aria-labelledby="my-rewards-title"
      className="rounded-[24px] border border-[#E5DCD5] bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="rounded-lg bg-[#E4F0FF] px-4 py-3 text-sm font-semibold text-[#1A2B3C]">
        <div className="flex items-center gap-2">
          <Info
            className="h-5 w-5 shrink-0 text-[#1473C9]"
            aria-hidden="true"
          />
          <span>Available rewards: {loading ? "…" : availableRewards}</span>
        </div>
      </div>

      {loading ? (
        <Body className="mt-4">Loading your rewards...</Body>
      ) : error ? (
        <div className="mt-4 space-y-3">
          <Body role="alert" className="text-[#8B0202]">
            {error}
          </Body>
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : !hasRewardsAccess ? (
        <Body className="mt-4">
          Your first approved review unlocks My Rewards, and access stays active
          from then on.
        </Body>
      ) : offers.length === 0 ? (
        <div className="mt-4 rounded-xl bg-[#F8F4F1] p-4">
          <p className="font-semibold text-[#1A2B3C]">Partner offers</p>
          <Body className="mt-1">
            No active offers are available from partners that have approved
            RoomReview in Awin yet. Check back when an approved offer is added.
          </Body>
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-3">
            <p className="font-semibold text-[#1A2B3C]">Partner offers</p>
            <Small className="mt-1 text-[#64707A]">
              Offers from partners whose Awin programmes have approved
              RoomReview.
            </Small>
          </div>
          <ul className="space-y-3">
            {offers.map((offer) => (
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
                    <p className="font-bold text-[#1A2B3C]">
                      {offer.storeName}
                    </p>
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
                  onClick={() =>
                    availableReward &&
                    onSelectOffer(availableReward.rewardGrantId, offer)
                  }
                >
                  Shop Now
                  <span aria-hidden="true">›</span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {availableRewards > 0 && (
        <div
          role="note"
          className="mt-4 flex gap-3 rounded-xl border border-[#F2CACA] bg-[#FFF0F0] p-4 text-sm text-[#8B0202]"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-bold">Important!</p>
            <p className="mt-1">
              You have {availableRewards} available reward
              {availableRewards === 1 ? "" : "s"}. Once you continue to your
              selected store, one reward will be used and cannot be transferred
              to another store.
            </p>
          </div>
        </div>
      )}

      {profile && (
        <div className="mt-6 border-t border-[#E5DCD5] pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <H3 className="text-[#1A2B3C]">Your profile progress</H3>
              <Body className="mt-1 text-sm">
                Approved reviews and completed area reports build your level.
              </Body>
            </div>
            <div className="rounded-xl bg-[#F8F4F1] px-4 py-3 text-sm">
              <p className="font-bold text-[#1A2B3C]">
                Level {profile.level}: {profile.levelName}
              </p>
              <p className="mt-1 text-[#64707A]">
                {profile.contributions} contributions
              </p>
              {profile.nextLevel && (
                <p className="mt-1 text-[#64707A]">
                  {profile.nextLevel.contributionsRemaining} more to{" "}
                  {profile.nextLevel.name}
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-xl border p-3 ${achievement.unlocked ? "border-emerald-200 bg-emerald-50" : "border-[#E5DCD5] bg-[#FAFAF9]"}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[#1A2B3C]">
                    {achievement.name}
                  </p>
                  <span className="text-xs font-semibold text-[#64707A]">
                    {achievement.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <Small className="mt-1 block text-[#64707A]">
                  {achievement.description}
                </Small>
              </div>
            ))}
          </div>
          {rewards.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-[#1A2B3C]">
                Reward history
              </p>
              <ul className="mt-2 space-y-2">
                {rewards.map((reward) => (
                  <li
                    key={reward.rewardGrantId}
                    className="flex flex-wrap justify-between gap-2 border-t border-[#E5DCD5] pt-2 text-sm"
                  >
                    <span>
                      {reward.redeemedAt
                        ? `Used at ${reward.storeName ?? "partner store"}`
                        : "Available to use"}
                    </span>
                    <Small className="text-[#64707A]">
                      {new Date(reward.earnedAt).toLocaleDateString("en-GB")}
                    </Small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default RewardsDashboardPanel;
