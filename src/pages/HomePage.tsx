import { Link } from 'react-router-dom';
import heroImage from '@img/homepage2.jpg';
import starterImage from '@img/secondimage.jpg';
import tipsImage1 from '@img/Tenant tips & Area highlights1.jpg';
import tipsImage2 from '@img/Tenant tips & Area highlights2.jpg';
import tipsImage3 from '@img/Tenant tips & Area highlights3.jpg';
import newsletterImage from '@img/Stay updated with Tips.jpg';
import readyImage from '@img/Ready to get started.jpg';

const tips = [
  {
    title: 'How to move out without losing your security deposit',
    date: '29 January, 2026',
    image: tipsImage1,
  },
  {
    title: 'How to choose the right London flat: Noise, neighbours, safety & local issues',
    date: '26 January, 2026',
    image: tipsImage2,
  },
  {
    title: 'Furnished vs unfurnished rentals: What’s common in the UK',
    date: '23 January, 2026',
    image: tipsImage3,
    tag: 'Recommendation',
  },
];

const HomePage = () => {
  return (
    <div className="bg-white text-slate-950">
      <section className="overflow-hidden bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold uppercase tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[4.25rem] leading-[0.95]">
                FIND A TRUSTED
                <br />
                RENTAL HOME
                <br />
                IN LONDON
              </h1>
            </div>
            <div className="flex min-h-[280px] flex-col justify-between">
              <p className="max-w-xl text-lg leading-9 text-slate-700 sm:text-xl sm:leading-[2rem]">
                RoomReview helps renters discover what it’s really like to live in different UK postcodes and neighborhoods. Read honest reviews from tenants about safety, transport, and community vibe, so you can choose your next home with confidence.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  to="/reviews"
                  className="inline-flex h-14 w-full items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 sm:w-auto"
                >
                  SEARCH REVIEWS
                </Link>
                <Link
                  to="/report"
                  className="inline-flex h-14 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-8 text-base font-semibold text-slate-950 text-center shadow-sm transition hover:border-slate-400 hover:bg-slate-50 sm:w-auto"
                >
                  WRITE A REVIEW
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_-40px_rgba(0,0,0,0.35)]">
            <img
              src={heroImage}
              alt="London terraced houses street view"
              className="h-[420px] w-full object-cover sm:h-[520px]"
            />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1fr_0.5fr] lg:items-start">
            <div className="flex items-center">
              <img src={starterImage} alt="Brick house covered in red ivy" className="h-72 w-full rounded-[1.5rem] object-cover" />
            </div>
            <div className="flex flex-col justify-center items-start">
              <div className="space-y-5">
                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl leading-[1.05]">
                  Share your experience.
                  <br />
                  Help others, stay anonymous.
                </h2>
                <p className="max-w-xl text-base leading-8 text-slate-900 sm:text-lg">
                  Have you had a great (or terrible) renting experience in London? Share your story with RoomReview. We’ll turn it into an anonymous social media Reel to spread awareness and protect other tenants from scams, hidden fees, and bad landlords.
                </p>
              </div>
              <Link
                to="/register"
                className="mt-4 inline-flex h-14 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-white shadow-sm transition hover:bg-primary/90"
              >
                WRITE A REVIEW
              </Link>
            </div>
            <div className="hidden flex-col gap-4 lg:flex">
              <div className="rounded-[2rem] bg-sky-100 px-5 py-4 text-sm font-medium italic text-slate-900 shadow-sm transform -rotate-2">
                very safe area
              </div>
              <div className="rounded-[2rem] bg-sky-100 px-5 py-4 text-sm font-medium italic text-slate-900 shadow-sm transform rotate-3">
                good neighborhoods
              </div>
              <div className="rounded-[2rem] bg-sky-100 px-5 py-4 text-sm font-medium italic text-slate-900 shadow-sm transform -rotate-1">
                convenient transport
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#E8F3FF]">
        <div className="mx-auto max-w-[90rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="space-y-10">
            <div className="max-w-[40rem] space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Why RoomReview?
              </h2>
              <h3 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl sm:whitespace-nowrap">
                (Trust & Transparency)
              </h3>
              <p className="text-base leading-8 text-slate-700 sm:text-lg">
                Discover a smarter way to find and secure your next home in London. Our platform combines verified listings, local market expertise, and a fully online booking experience so you can move in with confidence and ease.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,30rem))]">
              <div className="w-full rounded-[1.75rem] bg-white p-8 shadow-sm">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center text-4xl text-slate-950">
                  ✅
                </div>
                <h3 className="text-xl font-semibold text-[#8B0202] sm:whitespace-nowrap">Verified reviews</h3>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Written by actual tenants who lived in the property — every review is verified to keep trolls and fake listings out. Use real experiences to judge safety, transport and landlord reliability before you book a viewing.
                </p>
              </div>

              <div className="w-full rounded-[1.75rem] bg-white p-8 shadow-sm">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center text-4xl text-slate-950">
                  👥
                </div>
                <h3 className="text-xl font-semibold text-[#8B0202]">Community-powered</h3>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Built by renters, for renters — our community shares tips and warnings to keep everyone safer. Share your experience to protect others from hidden fees, dodgy agents and poor landlords.
                </p>
              </div>

              <div className="w-full rounded-[1.75rem] bg-white p-8 shadow-sm">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center text-4xl text-slate-950">
                  📰
                </div>
                <h3 className="text-xl font-semibold text-[#8B0202]">Local transparency</h3>
                <p className="mt-4 text-base leading-7 text-slate-700">
                  Honest, postcode-level insights so you know the reality behind the listing photos. From late-night noise to transport links, get the local facts that matter when choosing a home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-4xl space-y-6">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Latest tenant reviews
            </h2>
            <p className="text-base leading-8 text-slate-700 sm:text-lg">
              Real rental experiences from tenants across the UK. Discover first-hand reviews of properties, landlords, and letting agents to help you make smarter, more confident renting decisions. For more reviews, visit the{' '}
              <Link to="/reviews" className="text-primary underline decoration-primary decoration-2 underline-offset-2">
                Reviews page
              </Link>{' '}
              and search by postcode.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#8B0202]">SW9 - Brixton</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-slate-300">★</span>
                  <span className="ml-2 text-sm text-slate-500">4.0</span>
                </div>
                <p className="text-sm leading-7 text-slate-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec velit vitae nibh suscipit vehicula. Integer euismod purus ut lectus tristique, eu scelerisque risus consequat.
                </p>
              </div>

              <div className="mt-4">
                <Link to="/reviews" className="text-sm font-semibold text-primary underline decoration-primary decoration-2 underline-offset-2">
                  Read more
                </Link>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-600">👍 Pros</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Friendly neighbours and great transport links.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-600">👎 Cons</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Higher rent for the area.</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl text-slate-700">
                  👤
                </div>
                <div className="text-sm text-slate-600">
                  <p className="font-semibold text-slate-950">James Moris</p>
                  <p>2 days ago</p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#8B0202]">NW2 4FM - Camden</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-slate-300">★</span>
                  <span className="ml-2 text-sm text-slate-500">4.0</span>
                </div>
                <p className="text-sm leading-7 text-slate-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec velit vitae nibh suscipit vehicula. Integer euismod purus ut lectus tristique, eu scelerisque risus consequat.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-600">👍 Pros</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Good nightlife and safe streets.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-600">👎 Cons</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Small bedrooms.</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl text-slate-700">
                  👤
                </div>
                <div className="text-sm text-slate-600">
                  <p className="font-semibold text-slate-950">Anonymous</p>
                  <p>2 months ago</p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-[#8B0202]">SE22 0RS - Southwark</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <span>★</span>
                  <span>★</span>
                  <span>★</span>
                  <span className="text-slate-300">★</span>
                  <span className="text-slate-300">★</span>
                  <span className="ml-2 text-sm text-slate-500">3.0</span>
                </div>
                <p className="text-sm leading-7 text-slate-700">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec velit vitae nibh suscipit vehicula. Integer euismod purus ut lectus tristique, eu scelerisque risus consequat.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-600">👍 Pros</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Convenient transport and nice local cafes.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-600">👎 Cons</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">Limited parking.</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-500 to-slate-700 text-sm font-semibold text-white">
                  AK
                </div>
                <div className="text-sm text-slate-600">
                  <p className="font-semibold text-slate-950">Anastasia Kosheva</p>
                  <p>14 February 2025</p>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              &lt;
            </button>
            <button className="h-3 w-3 rounded-full bg-red-600" aria-label="current slide" />
            <button className="h-3 w-3 rounded-full bg-slate-200" aria-label="slide 2" />
            <button className="h-3 w-3 rounded-full bg-slate-200" aria-label="slide 3" />
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              &gt;
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="relative h-full overflow-hidden rounded-[2rem] shadow-[0_30px_90px_-40px_rgba(0,0,0,0.35)]">
              <img src={readyImage} alt="Ready to get started" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Ready to get started?
              </h2>
              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-[#8B0202]">For Tenants</h3>
                  <p className="text-base leading-8 text-slate-700">
                    Find and connect with trustworthy landlords, explore real tenant reviews, and feel confident before you rent. Discover what it’s really like to live in different neighborhoods across London.
                  </p>
                  <Link
                    to="/reviews"
                    className="inline-flex rounded-3xl bg-[#8B0202] px-6 py-4 text-base font-semibold uppercase tracking-[0.08em] text-white shadow-sm transition hover:bg-[#770101]"
                  >
                    I’m a tenant
                  </Link>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-950">For Agencies</h3>
                  <p className="text-base leading-8 text-slate-700">
                    Create a verified public profile, collect honest reviews from real tenants, and build trust with future renters. Show people why they should choose to work with you.
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex rounded-3xl border border-slate-950 bg-white px-6 py-4 text-base font-semibold uppercase tracking-[0.08em] text-slate-950 shadow-sm transition hover:bg-slate-100"
                  >
                    I’m an agency
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Tenant tips & area highlights</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Tenant tips & Area highlights</h2>
            </div>
            <Link to="/blog" className="text-sm font-semibold text-primary hover:text-primary/80">
              View all
            </Link>
          </div>
          <div className="mt-10 grid gap-6 xl:grid-cols-3">
            {tips.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="relative h-64 overflow-hidden">
                  <img src={item.image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  {item.tag ? (
                    <span className="absolute right-4 top-4 rounded-full bg-red-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                      {item.tag}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{item.date}</span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">Tenant</span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                  <p className="text-sm leading-7 text-slate-600">Moving out of a rental house can be stressful, but getting your security deposit back is easier with the right preparation.</p>
                  <Link to="/blog" className="text-sm font-semibold text-primary hover:text-primary/80">
                    Read more →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F5EBE6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid min-h-[520px] grid-cols-1 overflow-hidden rounded-none md:grid-cols-2">
            <div className="overflow-hidden">
              <img src={newsletterImage} alt="Newsletter background" className="h-full w-full object-cover" />
            </div>
            <div className="flex items-center bg-[#F5EBE6] p-8 sm:p-10">
              <div className="w-full max-w-xl">
                <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Stay updated with Tips & Tenant stories
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-700">
                  No spam, unsubscribe anytime.
                </p>
                <form className="mt-10 space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-950">
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John"
                      className="mt-3 h-14 w-full rounded-3xl border border-slate-200 bg-white px-5 text-sm text-slate-950 outline-none transition focus:border-[#8B0202] focus:ring-2 focus:ring-[#8B0202]/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-950">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Email@domain.com"
                      className="mt-3 h-14 w-full rounded-3xl border border-slate-200 bg-white px-5 text-sm text-slate-950 outline-none transition focus:border-[#8B0202] focus:ring-2 focus:ring-[#8B0202]/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-3xl bg-[#8B0202] px-6 py-4 text-base font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#770101]"
                  >
                    SUBSCRIBE
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

