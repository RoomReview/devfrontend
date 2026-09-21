import { Link } from 'react-router-dom';
import Button from '@/components/common/Button';

const CheckoutCancelPage = () => (
  <main className="min-h-screen bg-[#F8F4F1] px-4 py-20">
    <div className="mx-auto max-w-xl rounded-[30px] border border-[#E5DCD5] bg-white p-10 text-center">
      <h1 className="text-3xl font-bold text-[#1A2B3C]">Checkout cancelled</h1>
      <p className="mt-4 text-[#4B5563]">No payment was taken. You can return to the report whenever you are ready.</p>
      <Link to="/" className="mt-8 inline-flex"><Button variant="secondary">Return home</Button></Link>
    </div>
  </main>
);

export default CheckoutCancelPage;
