import {
  AlertCircle,
  ArrowDown,
  CheckCircle2,
  Info,
  LockKeyhole,
  Trophy,
} from "lucide-react";
import Button from "@/components/common/Button";
import { Body, Small } from "@/components/common/Typography";
import type {
  Achievement,
  ProfileProgress,
  ReviewReward,
} from "@/services/affiliate-reward.service";

interface RewardsDashboardPanelProps {
  profile: ProfileProgress | null;
  achievements: Achievement[];
  hasRewardsAccess: boolean;
  availableRewards: number;
  rewards: ReviewReward[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const RewardsDashboardPanel = ({
  profile,
  achievements,
  hasRewardsAccess,
  availableRewards,
  rewards,
  loading,
  error,
  onRetry,
}: RewardsDashboardPanelProps) => {
  const currentLevelMinimum = profile?.levelContributionsRequired;
  const nextLevelMinimum = profile?.nextLevel?.contributionsRequired;
  const levelProgress = !profile
    ? null
    : !profile.nextLevel
      ? 100
      : typeof currentLevelMinimum === "number" &&
          typeof nextLevelMinimum === "number" &&
          Number.isFinite(currentLevelMinimum) &&
          Number.isFinite(nextLevelMinimum) &&
          nextLevelMinimum > currentLevelMinimum
        ? Math.min(
            100,
            Math.max(
              0,
              ((profile.contributions - currentLevelMinimum) /
                (nextLevelMinimum - currentLevelMinimum)) *
                100,
            ),
          )
        : null;

  return (
    <section
      aria-labelledby="my-rewards-title"
      className="rounded-[24px] border border-[#E5DCD5] bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between gap-3 rounded-lg bg-[#E4F0FF] px-4 py-3 text-sm font-semibold text-[#1A2B3C]">
        <div className="flex items-center gap-2">
          <Info
            className="h-5 w-5 shrink-0 text-[#1473C9]"
            aria-hidden="true"
          />
          <span>Available rewards: {loading ? "…" : availableRewards}</span>
        </div>
        <a
          href="#partner-offers"
          aria-label="Go to partner offers"
          className="inline-flex shrink-0 items-center justify-center rounded-full p-1 text-[#8B0202] hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
        >
          <ArrowDown className="h-5 w-5" aria-hidden="true" />
        </a>
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
      ) : null}

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
        <section
          aria-labelledby="profile-progress-title"
          className="mt-6 rounded-2xl border border-[#E5DCD5] bg-gradient-to-b from-white to-[#FFFCFA] p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#F0E9E4] pb-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1E7] text-[#A52A16]">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 id="profile-progress-title" className="font-bold text-[#1A2B3C]">
                  Your profile progress
                </h3>
                <p className="mt-0.5 text-xs text-[#64707A]">
                  Reviews and reports help you level up
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[#E6B9B2] bg-white px-3 py-1 text-xs font-bold text-[#8B0202]">
              Level {profile.level}
            </span>
          </div>

          <div className="py-5 sm:px-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-[#1A2B3C]">
                  {profile.levelName}
                </p>
                <p className="mt-1 text-sm text-[#64707A]">
                  {profile.contributions} contribution{profile.contributions === 1 ? "" : "s"} completed
                  {profile.nextLevel
                    ? ` · ${profile.nextLevel.contributionsRemaining} more to ${profile.nextLevel.name}`
                    : " · Highest level reached"}
                </p>
              </div>
              <span className="text-sm font-bold text-[#1A2B3C]">
                {levelProgress === null
                  ? "Progress unavailable"
                  : `${Math.round(levelProgress)}%`}
              </span>
            </div>
            {levelProgress === null ? (
              <p role="status" className="mt-3 text-xs text-[#64707A]">
                Refresh the page after the rewards service has been updated.
              </p>
            ) : (
              <div
                className="mt-3 h-3 overflow-hidden rounded-full bg-[#ECEDEF]"
                role="progressbar"
                aria-label="Progress to next profile level"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(levelProgress)}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#A80F13] to-[#D94732] transition-[width]"
                  style={{ width: `${levelProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {achievements.map((achievement) => {
              return (
                <div
                  key={achievement.id}
                  className={`flex min-h-[88px] items-start gap-3 rounded-xl border p-3 transition-colors ${
                    achievement.unlocked
                      ? "border-emerald-200 bg-emerald-50/80"
                      : "border-[#E5E7EB] bg-[#F8F9FB]"
                  }`}
                >
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    achievement.unlocked
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white text-[#475569]"
                  }`}>
                    {achievement.unlocked
                      ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      : <LockKeyhole className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                      <p className="font-bold text-[#1A2B3C]">
                        {achievement.name}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        achievement.unlocked
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#E7E9ED] text-[#64707A]"
                      }`}>
                        {achievement.unlocked ? "Unlocked" : "Locked"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#64707A]">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#EEF4FF] px-3 py-2.5 text-xs text-[#31486B]">
            <Info className="h-4 w-4 shrink-0 text-[#3972B8]" aria-hidden="true" />
            <p>More achievements unlock as you contribute to RoomReview.</p>
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
        </section>
      )}
    </section>
  );
};

export default RewardsDashboardPanel;
