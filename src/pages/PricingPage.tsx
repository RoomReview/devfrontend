import { useCallback, useEffect, useRef, useState } from 'react';
import { Building2, Check, Star, UserRound, UsersRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import { paymentService } from '@/services/payment.service';
import { extractApiError } from '@/utils/apiError';

type PricingPlanId = 'individual' | 'small-team' | 'branch';

const plans = [
  {
    id: 'individual' as const,
    people: 1,
    total: 35,
    name: 'Individual Agent',
    description: 'For independent agents and negotiators.',
    Icon: UserRound,
  },
  {
    id: 'small-team' as const,
    people: 5,
    total: 149,
    name: 'Small Team',
    description: 'For growing agencies and small teams.',
    Icon: UsersRound,
    popular: true,
  },
  {
    id: 'branch' as const,
    people: 10,
    total: 249,
    name: 'Branch',
    description: 'For established agencies and multiple branches.',
    Icon: Building2,
  },
];

const planFeatures = [
  'RoomReview scores and local comparisons',
  'Downloadable professional PDF reports',
  'Access to postcode and borough data',
];

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);

const isPricingPlanId = (value: string | null): value is PricingPlanId =>
  plans.some((plan) => plan.id === value);

const PricingPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [processingPlan, setProcessingPlan] = useState<PricingPlanId | null>(null);
  const handledCheckoutPlan = useRef<PricingPlanId | null>(null);

  const startCheckout = useCallback(async (planId: PricingPlanId) => {
    setProcessingPlan(planId);
    try {
      const checkoutUrl = await paymentService.createSubscriptionCheckout(planId);
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
      } else {
        showToast('Your account already has an active subscription.', 'error');
        setProcessingPlan(null);
      }
    } catch (error) {
      showToast(extractApiError(error), 'error');
      setProcessingPlan(null);
    }
  }, [showToast]);

  useEffect(() => {
    const planId = searchParams.get('checkoutPlan');
    if (authLoading || !isAuthenticated || !isPricingPlanId(planId) || handledCheckoutPlan.current === planId) {
      return;
    }

    handledCheckoutPlan.current = planId;
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('checkoutPlan');
    setSearchParams(nextSearchParams, { replace: true });
    void startCheckout(planId);
  }, [authLoading, isAuthenticated, searchParams, setSearchParams, startCheckout]);

  const handleBuySubscription = (planId: PricingPlanId) => {
    if (!isAuthenticated) {
      navigate(`/login?subscriptionPlan=${planId}`);
      return;
    }
    void startCheckout(planId);
  };

  return (
  <main className="min-h-screen bg-[#F8F4F1] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-black tracking-tight text-[#1A2B3C] sm:text-4xl">
          Property intelligence for every agent
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
          Generate professional area reports and give clients the local insights they need to make confident property decisions.
        </p>
      </header>

      <div className="mt-10 grid items-stretch gap-5 md:grid-cols-3 md:gap-4">
        {plans.map(({ id, people, total, name, description, Icon, popular }) => (
          <section
            key={people}
            aria-labelledby={`plan-${people}-title`}
            className={`relative flex min-h-[400px] flex-col rounded-2xl border bg-white px-5 pb-5 pt-6 shadow-sm sm:px-6 md:min-h-[410px] ${
              popular
                ? 'border-[#A20B0B] md:scale-[1.025] md:shadow-md'
                : 'border-[#E5DCD5]'
            }`}
          >
            {popular && (
              <div className="absolute inset-x-0 top-0 flex h-7 -translate-y-px items-center justify-center gap-1 rounded-t-[15px] bg-[#A20B0B] text-xs font-bold text-white">
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                Most Popular
              </div>
            )}

            <div className={`flex items-center gap-3 ${popular ? 'mt-5' : ''}`}>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FBF1EC] text-[#A20B0B]">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <h2 id={`plan-${people}-title`} className="font-bold text-[#1A2B3C]">
                  {name}
                </h2>
                <p className="mt-0.5 text-xs leading-4 text-slate-500">{description}</p>
              </div>
            </div>

            <p className="mt-5 border-b border-[#ECE7E3] pb-3 text-3xl font-black text-[#A20B0B]">
              {formatPrice(total)}
              <span className="ml-2 text-sm font-medium text-slate-500">/ month</span>
            </p>

            <ul className="mt-3 space-y-2 text-xs leading-4 text-slate-600 sm:text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#B23A3A]" aria-hidden="true" />
                {people === 1 ? '1 user (agent)' : `Up to ${people} users (agents)`}
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0 text-[#B23A3A]" aria-hidden="true" />
                Monthly subscription
              </li>
            </ul>

            <ul className="mt-5 space-y-2 text-xs leading-4 text-slate-600 sm:text-sm">
              {planFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B23A3A]" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleBuySubscription(id)}
              disabled={processingPlan !== null}
              className="mt-auto block w-full rounded-lg bg-[#A20B0B] px-5 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-[#810707] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A20B0B] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {processingPlan === id ? 'Redirecting to checkout...' : 'Buy Subscription'}
            </button>
          </section>
        ))}
      </div>

      <aside className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-[#E5DCD5] pt-4 text-center text-xs leading-5 text-slate-600 sm:flex-row sm:gap-3">
        <UsersRound className="h-5 w-5 shrink-0 text-[#B23A3A]" aria-hidden="true" />
        <p>
          Each plan includes access for the number of users shown. Need more than 10 users?{' '}
          <Link to="/about" className="font-semibold text-[#A20B0B] underline underline-offset-2">
            Contact us for agency pricing
          </Link>
          .
        </p>
      </aside>
    </div>
  </main>
  );
};

export default PricingPage;
