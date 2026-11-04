import { FormEvent, useEffect, useState } from "react";
import {
  adminService,
  type AdminAwinPublisher,
  type AdminAwinTransaction,
  type AdminAffiliateOffer,
  type AdminAffiliateOfferInput,
} from "@/services/admin.service";
import Button from "@/components/common/Button";
import { Body, H2, Small } from "@/components/common/Typography";
import { extractApiError } from "@/utils/apiError";

const getAwinErrorMessage = (error: unknown, fallback: string) => {
  const message = extractApiError(error);
  if (/HTTP 401|invalid_token/i.test(message)) {
    return "Awin rejected AWIN_API_TOKEN (401). Generate a valid Awin API token, update the backend secret, and restart the backend.";
  }
  return fallback;
};

const emptyOffer: AdminAffiliateOfferInput = {
  storeName: "",
  advertiserName: "",
  logoUrl: null,
  description: "",
  discountDetails: null,
  trackingUrl: "",
  awinApproved: false,
  isActive: false,
};

const getOfferStatus = (offer: AdminAffiliateOffer): string => {
  if (!offer.awinApproved) {
    return "Not approved or programme not joined";
  }
  if (!offer.isActive) {
    return "Disabled by admin";
  }
  const now = Date.now();
  if (offer.awinStartsAt && new Date(offer.awinStartsAt).getTime() > now) {
    return "Upcoming";
  }
  if (offer.awinEndsAt && new Date(offer.awinEndsAt).getTime() <= now) {
    return "Expired";
  }
  return "Active";
};

const AffiliateOffersPanel = () => {
  const [offers, setOffers] = useState<AdminAffiliateOffer[]>([]);
  const [offer, setOffer] = useState<AdminAffiliateOfferInput>(emptyOffer);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [awinPublishers, setAwinPublishers] = useState<AdminAwinPublisher[]>(
    [],
  );
  const [selectedPublisherId, setSelectedPublisherId] = useState("");
  const [awinError, setAwinError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<AdminAwinTransaction[]>([]);
  const [transactionsError, setTransactionsError] = useState<string | null>(
    null,
  );
  const [syncingTransactions, setSyncingTransactions] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [syncingOffers, setSyncingOffers] = useState(false);
  const [offersSyncNotice, setOffersSyncNotice] = useState<string | null>(null);
  const [offersSyncError, setOffersSyncError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 7);
    return date.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [dateType, setDateType] = useState<
    "transaction" | "validation" | "amendment"
  >("transaction");
  const publisherId = Number(selectedPublisherId);
  const hasValidPublisherId =
    Number.isSafeInteger(publisherId) && publisherId > 0;

  const loadOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      setOffers(await adminService.getAffiliateOffers());
    } catch {
      setError("Partner offers could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOffers();
    void adminService
      .getAwinPublishers()
      .then((publishers) => {
        setAwinPublishers(publishers);
        setSelectedPublisherId(
          (current) => current || String(publishers[0]?.publisherId ?? ""),
        );
        setAwinError(null);
      })
      .catch((error: unknown) =>
        setAwinError(
          getAwinErrorMessage(
            error,
            "Awin is not connected. Configure AWIN_API_TOKEN as a backend secret and confirm the account has API access.",
          ),
        ),
      );
    void adminService
      .getAwinTransactions()
      .then(setTransactions)
      .catch((error: unknown) =>
        setTransactionsError(
          getAwinErrorMessage(
            error,
            "Awin transaction history is unavailable. Apply the affiliate-rewards database migrations first.",
          ),
        ),
      );
  }, []);

  const syncTransactions = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSyncingTransactions(true);
    setAwinError(null);
    setTransactionsError(null);
    setSyncNotice(null);
    try {
      const result = await adminService.syncAwinTransactions({
        publisherId,
        startDate,
        endDate,
        dateType,
      });
      setSyncNotice(
        `Fetched ${result.fetched} transactions; matched ${result.matched} to reward clicks; ${result.unmatched} unmatched.`,
      );
      setTransactions(await adminService.getAwinTransactions());
    } catch (error) {
      setAwinError(
        getAwinErrorMessage(
          error,
          "Awin transaction sync failed. Check the Publisher ID, date range, token permissions, and migration status.",
        ),
      );
    } finally {
      setSyncingTransactions(false);
    }
  };

  const syncOffers = async () => {
    setSyncingOffers(true);
    setOffersSyncError(null);
    setOffersSyncNotice(null);
    try {
      const result = await adminService.syncAwinOffers({
        publisherId,
      });
      setOffersSyncNotice(
        `Imported ${result.created} new offers and updated ${result.updated}; ${result.joined} offers are from joined programmes.`,
      );
      await loadOffers();
    } catch (error) {
      setOffersSyncError(
        getAwinErrorMessage(
          error,
          "Awin promotions could not be synchronized. Check the Publisher ID, API permissions, and database migrations.",
        ),
      );
    } finally {
      setSyncingOffers(false);
    }
  };

  const submitOffer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await adminService.saveAffiliateOffer(offer, editingOfferId ?? undefined);
      setNotice(
        editingOfferId ? "Partner offer updated." : "Partner offer added.",
      );
      setOffer(emptyOffer);
      setEditingOfferId(null);
      await loadOffers();
    } catch {
      setError(
        "Partner offer could not be saved. Check the Awin tracking link and required fields.",
      );
    } finally {
      setSaving(false);
    }
  };

  const editOffer = (existing: AdminAffiliateOffer) => {
    setOffer({
      storeName: existing.storeName,
      advertiserName: existing.advertiserName,
      logoUrl: existing.logoUrl,
      description: existing.description,
      discountDetails: existing.discountDetails,
      trackingUrl: existing.trackingUrl,
      awinApproved: existing.awinApproved,
      isActive: existing.isActive,
    });
    setEditingOfferId(existing.offerId);
    setNotice(null);
  };

  const updateText = (
    key: "storeName" | "advertiserName" | "description" | "trackingUrl",
    value: string,
  ) => {
    setOffer((current) => ({ ...current, [key]: value }));
  };

  return (
    <section
      aria-labelledby="affiliate-offers-title"
      className="mt-8 rounded-2xl border border-[#E5DCD5] bg-white p-6"
    >
      <H2 id="affiliate-offers-title" className="text-xl">
        Affiliate partner offers
      </H2>
      <Body className="mt-2">
        Awin promotions from joined programmes are imported and refreshed
        automatically. Discounts must match the partner’s terms; do not promise
        a discount unless the offer provides one.
      </Body>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800"
        >
          {notice}
        </p>
      )}

      <form
        className="mt-5 grid gap-4 sm:grid-cols-2"
        onSubmit={(event) => void submitOffer(event)}
      >
        <label className="text-sm font-semibold text-[#1A2B3C]">
          Store name
          <input
            required
            maxLength={120}
            value={offer.storeName}
            onChange={(event) => updateText("storeName", event.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D8CCC4] px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-[#1A2B3C]">
          Awin advertiser name
          <input
            required
            maxLength={120}
            value={offer.advertiserName}
            onChange={(event) =>
              updateText("advertiserName", event.target.value)
            }
            className="mt-1 w-full rounded-lg border border-[#D8CCC4] px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-[#1A2B3C]">
          Logo URL (HTTPS)
          <input
            type="url"
            value={offer.logoUrl ?? ""}
            onChange={(event) =>
              setOffer((current) => ({
                ...current,
                logoUrl: event.target.value || null,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[#D8CCC4] px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-[#1A2B3C]">
          Discount terms (optional)
          <input
            maxLength={1000}
            value={offer.discountDetails ?? ""}
            onChange={(event) =>
              setOffer((current) => ({
                ...current,
                discountDetails: event.target.value || null,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[#D8CCC4] px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-[#1A2B3C] sm:col-span-2">
          Offer description
          <textarea
            required
            maxLength={2000}
            rows={3}
            value={offer.description}
            onChange={(event) =>
              setOffer((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-lg border border-[#D8CCC4] px-3 py-2 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-[#1A2B3C] sm:col-span-2">
          Awin tracking URL (HTTPS, awin1.com or tidd.ly)
          <input
            type="url"
            required
            value={offer.trackingUrl}
            onChange={(event) => updateText("trackingUrl", event.target.value)}
            className="mt-1 w-full rounded-lg border border-[#D8CCC4] px-3 py-2 font-normal"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[#1A2B3C]">
          <input
            type="checkbox"
            checked={offer.awinApproved}
            onChange={(event) =>
              setOffer((current) => ({
                ...current,
                awinApproved: event.target.checked,
                isActive: event.target.checked && current.isActive,
              }))
            }
          />
          Advertiser programme approved for RoomReview in Awin
        </label>
        <label className="flex items-center gap-2 text-sm text-[#1A2B3C]">
          <input
            type="checkbox"
            checked={offer.isActive}
            disabled={!offer.awinApproved}
            onChange={(event) =>
              setOffer((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
          />
          Offer active for users
        </label>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit" isLoading={saving}>
            {editingOfferId ? "Save changes" : "Add offer"}
          </Button>
          {editingOfferId && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingOfferId(null);
                setOffer(emptyOffer);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <div className="mt-8 border-t border-[#E5DCD5] pt-5">
        <h3 className="font-bold text-[#1A2B3C]">Configured offers</h3>
        {loading ? (
          <Body className="mt-3">Loading offers...</Body>
        ) : offers.length === 0 ? (
          <Body className="mt-3">No offers have been configured.</Body>
        ) : (
          <ul className="mt-3 divide-y divide-[#E5DCD5]">
            {offers.map((existing) => (
              <li
                key={existing.offerId}
                className="flex flex-wrap items-center justify-between gap-3 py-4"
              >
                <div>
                  <p className="font-semibold text-[#1A2B3C]">
                    {existing.storeName}{" "}
                    <span className="font-normal text-[#64707A]">
                      · {existing.advertiserName}
                    </span>
                  </p>
                  <Small className="block text-[#64707A]">
                    {existing.isImportedFromAwin
                      ? "Synced from Awin"
                      : existing.awinApproved
                        ? "Awin approved"
                        : "Awaiting Awin approval"}{" "}
                    · {getOfferStatus(existing)}
                  </Small>
                  {existing.awinStartsAt && existing.awinEndsAt && (
                    <Small className="block text-[#64707A]">
                      Valid{" "}
                      {new Date(existing.awinStartsAt).toLocaleDateString(
                        "en-GB",
                        { timeZone: "UTC" },
                      )}{" "}
                      –{" "}
                      {new Date(existing.awinEndsAt).toLocaleDateString(
                        "en-GB",
                        { timeZone: "UTC" },
                      )}
                    </Small>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => editOffer(existing)}
                >
                  Edit offer
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-8 border-t border-[#E5DCD5] pt-5">
        <h3 className="font-bold text-[#1A2B3C]">Awin promotions</h3>
        <Body className="mt-2">
          Joined-programme promotions for the UK are imported and updated
          automatically every 12 hours when AWIN_PUBLISHER_ID is configured on
          the backend. Disable individual offers above when needed.
        </Body>
        {offersSyncError && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {offersSyncError}
          </p>
        )}
        {offersSyncNotice && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800"
          >
            {offersSyncNotice}
          </p>
        )}
        <Button
          type="button"
          className="mt-3"
          isLoading={syncingOffers}
          disabled={!hasValidPublisherId}
          onClick={() => void syncOffers()}
        >
          Sync offers now
        </Button>
      </div>

      <div className="mt-8 border-t border-[#E5DCD5] pt-5">
        <h3 className="font-bold text-[#1A2B3C]">Awin transactions</h3>
        <Body className="mt-2">
          The API token is read from the backend secret only. Transaction
          commissions are for administrator reporting and are not user cashback
          or reward balances.
        </Body>
        {awinError && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
          >
            {awinError}
          </p>
        )}
        {syncNotice && (
          <p
            role="status"
            className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800"
          >
            {syncNotice}
          </p>
        )}
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          onSubmit={(event) => void syncTransactions(event)}
        >
          <label className="text-sm font-semibold text-[#1A2B3C]">
            {awinPublishers.length > 0
              ? "Publisher account"
              : "Publisher account ID"}
            {awinPublishers.length > 0 ? (
              <select
                required
                value={selectedPublisherId}
                onChange={(event) => setSelectedPublisherId(event.target.value)}
                className="mt-1 block rounded-lg border border-[#D8CCC4] bg-white px-3 py-2"
              >
                {awinPublishers.map((publisher) => (
                  <option
                    key={publisher.publisherId}
                    value={publisher.publisherId}
                  >
                    {publisher.name} ({publisher.publisherId})
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                type="number"
                min="1"
                step="1"
                value={selectedPublisherId}
                onChange={(event) => setSelectedPublisherId(event.target.value)}
                className="mt-1 block rounded-lg border border-[#D8CCC4] px-3 py-2"
              />
            )}
          </label>
          <label className="text-sm font-semibold text-[#1A2B3C]">
            From (UTC)
            <input
              required
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="mt-1 block rounded-lg border border-[#D8CCC4] px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold text-[#1A2B3C]">
            To (UTC)
            <input
              required
              type="date"
              value={endDate}
              min={startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setEndDate(event.target.value)}
              className="mt-1 block rounded-lg border border-[#D8CCC4] px-3 py-2"
            />
          </label>
          <label className="text-sm font-semibold text-[#1A2B3C]">
            Date filter
            <select
              value={dateType}
              onChange={(event) =>
                setDateType(event.target.value as typeof dateType)
              }
              className="mt-1 block rounded-lg border border-[#D8CCC4] bg-white px-3 py-2"
            >
              <option value="transaction">Transaction date</option>
              <option value="validation">Validation date</option>
              <option value="amendment">Amendment date</option>
            </select>
          </label>
          <Button
            type="submit"
            isLoading={syncingTransactions}
            disabled={!hasValidPublisherId}
          >
            Sync transactions
          </Button>
        </form>

        {transactionsError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800"
          >
            {transactionsError}
          </p>
        )}
        {transactions.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[#E5DCD5] text-xs uppercase text-[#64707A]">
                <tr>
                  <th className="px-3 py-2">Advertiser</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Commission</th>
                  <th className="px-3 py-2">Transaction date</th>
                  <th className="px-3 py-2">Reward click</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DCD5]">
                {transactions.map((transaction) => (
                  <tr key={transaction.transactionId}>
                    <td className="px-3 py-3">{transaction.advertiserName}</td>
                    <td className="px-3 py-3 capitalize">
                      {transaction.status}
                    </td>
                    <td className="px-3 py-3">
                      {transaction.commission === null
                        ? "—"
                        : `${transaction.commission} ${transaction.currency ?? ""}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      {new Date(transaction.transactionAt).toLocaleString(
                        "en-GB",
                        { timeZone: "UTC" },
                      )}{" "}
                      UTC
                    </td>
                    <td className="px-3 py-3">
                      {transaction.rewardMatched ? "Matched" : "Not matched"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default AffiliateOffersPanel;
