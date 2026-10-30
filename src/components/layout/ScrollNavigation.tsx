import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

const ScrollNavigation = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > 200);
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    return () => window.removeEventListener('scroll', updateVisibility);
  }, []);

  if (!isVisible) return null;

  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth';

  return (
    <nav
      aria-label="Page navigation"
      className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 md:hidden"
    >
      <button
        type="button"
        aria-label="Scroll to top"
        title="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior })}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B0202] text-white shadow-lg transition-colors hover:bg-[#700101] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
      >
        <ArrowUp aria-hidden="true" className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll to footer"
        title="Scroll to footer"
        onClick={() =>
          document
            .getElementById('site-footer')
            ?.scrollIntoView({ behavior, block: 'end' })
        }
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B0202] text-white shadow-lg transition-colors hover:bg-[#700101] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8B0202]"
      >
        <ArrowDown aria-hidden="true" className="h-5 w-5" />
      </button>
    </nav>
  );
};

export default ScrollNavigation;
