import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from '@/components/common/Button';
import { paymentService, type CheckoutConfirmation } from '@/services/payment.service';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [confirmation, setConfirmation] = useState<CheckoutConfirmation | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError(true);
      return;
    }
    paymentService.confirmCheckout(sessionId).then(setConfirmation).catch(() => setError(true));
  }, [searchParams]);

  const title = error ? 'We could not confirm this payment' : confirmation?.status === 'PAID' ? 'Payment received' : 'Payment is being confirmed';
  const message = error
    ? 'Please open your account to check the order status, or contact support if you were charged.'
    : confirmation?.status === 'PAID'
      ? 'Your report is being prepared. You can download it from your account when it is ready.'
      : 'Your payment was received by Stripe. Report fulfilment will appear in your account once the payment webhook is processed.';

  return (
    <main className="min-h-screen bg-[#F8F4F1] px-4 py-20">
      <div className="mx-auto max-w-xl rounded-[30px] border border-[#E5DCD5] bg-white p-10 text-center">
        <h1 className="text-3xl font-bold text-[#1A2B3C]">{title}</h1>
        <p className="mt-4 text-[#4B5563]">{message}</p>
        <Link to="/account" className="mt-8 inline-flex"><Button>Open order history</Button></Link>
      </div>
    </main>
  );
};

export default CheckoutSuccessPage;
