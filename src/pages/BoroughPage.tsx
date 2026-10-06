import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Share2
} from 'lucide-react';
import { blogService, type BlogPost } from '@/services/blog.service';

const allowedWordPressTags = new Set([
  'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i',
  'a', 'blockquote', 'br', 'figure', 'img', 'figcaption', 'hr', 'table',
  'thead', 'tbody', 'tr', 'th', 'td',
]);

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sanitizeWordPressContent = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const serialize = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return escapeHtml(node.textContent ?? '');
    if (!(node instanceof Element)) return '';

    const tag = node.tagName.toLowerCase();
    if (['script', 'style', 'iframe', 'object', 'embed', 'form'].includes(tag)) return '';
    const children = Array.from(node.childNodes).map(serialize).join('');
    if (!allowedWordPressTags.has(tag)) return children;

    let attributes = '';
    if (tag === 'a') {
      const href = node.getAttribute('href');
      if (href) {
        try {
          const url = new URL(href, 'https://roomreview.co.uk');
          if (['https:', 'http:', 'mailto:'].includes(url.protocol)) attributes = ' href="' + escapeHtml(url.href) + '"';
        } catch {
          attributes = '';
        }
      }
    } else if (tag === 'img') {
      const src = node.getAttribute('src');
      if (src) {
        try {
          const url = new URL(src, 'https://roomreview.co.uk');
          if (url.protocol === 'https:') attributes = ' src="' + escapeHtml(url.href) + '" alt="' + escapeHtml(node.getAttribute('alt') ?? '') + '" loading="lazy"';
        } catch {
          attributes = '';
        }
      }
    }

    if (tag === 'br' || tag === 'hr' || (tag === 'img' && !attributes)) return '<' + tag + attributes + '>';
    return '<' + tag + attributes + '>' + children + '</' + tag + '>';
  };

  return Array.from(parsed.body.childNodes).map(serialize).join('');
};

const getWordPressExcerpt = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html').body.textContent?.trim() ?? '';

export const BlogPlatform: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    void blogService.getPosts()
      .then((response) => {
        if (isCurrent) setPosts(response.data);
      })
      .catch(() => {
        if (isCurrent) setLoadError('Blog articles could not be loaded. Please try again later.');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const selectedPost = posts.find((post) => post.id === searchParams.get('post'));
  const normalizeSearchText = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const normalizedQuery = normalizeSearchText(searchQuery);
  const categories = [...new Set(posts.flatMap((post) => post.categories))].sort((first, second) => first.localeCompare(second));
  const filteredPosts = posts
    .filter((post) => activeCategory === 'All' || post.categories.includes(activeCategory))
    .filter((post) => normalizeSearchText(`${post.title} ${getWordPressExcerpt(post.excerpt)} ${post.categories.join(' ')} ${post.tags.join(' ')}`).includes(normalizedQuery))
    .sort((first, second) => {
      const dateDifference = Date.parse(first.date) - Date.parse(second.date);
      return sortOrder === 'newest' ? -dateDifference : dateDifference;
    });
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const visiblePosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedPostUrl = selectedPost?.link ?? `${window.location.origin}/blog`;
  const encodedPostUrl = encodeURIComponent(selectedPostUrl);
  const encodedPostTitle = encodeURIComponent(selectedPost?.title ?? 'RoomReview Blog');

  return (
    <div className="min-h-screen bg-white font-sans text-[#2B363B] antialiased">
      
      {/* ---------------- DEEP ARTICLE VIEW ---------------- */}
      {selectedPost ? (
        <article className="mx-auto max-w-[840px] px-6 py-12 space-y-10">
          
          {/* Breadcrumb / Back Navigation */}
          <button 
            type="button"
            onClick={() => setSearchParams({}, { replace: true })}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#8B0000] transition"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back to Blog</span>
          </button>

          {/* Header Section */}
          <header className="space-y-4">
            <time dateTime={selectedPost.date} className="block text-xs font-medium text-gray-400">
              {new Date(selectedPost.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1A202C] sm:text-4xl leading-tight">
              {selectedPost.title}
            </h1>
            <p className="text-sm text-gray-500">
              Written by: <span className="font-semibold text-gray-700">{selectedPost.author || 'RoomReview Team'}</span>
            </p>
          </header>

          {/* Hero Image */}
          {selectedPost.image && (
            <div className="relative overflow-hidden rounded-2xl shadow-md">
              <img 
                src={selectedPost.image} 
                alt={selectedPost.title} 
                className="h-[380px] w-full object-cover"
              />
            </div>
          )}

          {/* Article Body Content */}
          <div
            className="wordpress-content space-y-5 text-base leading-relaxed text-[#4A5568]"
            dangerouslySetInnerHTML={{ __html: sanitizeWordPressContent(selectedPost.content) }}
          />

          {/* Social Share & Tags Footer */}
          <div className="space-y-6 pt-6 border-t border-gray-100">
            <div className="space-y-2">
              <span className="block text-sm font-bold text-[#1A202C]">Spread the word</span>
              <div className="flex items-center gap-2">
                <a aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedPostUrl}`} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 rounded-full bg-blue-600 px-3 text-xs font-semibold text-white transition hover:opacity-90">
                  <Share2 aria-hidden="true" className="h-4 w-4" /> Facebook
                </a>
                <a aria-label="Share on LinkedIn" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostUrl}`} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 rounded-full bg-[#0A66C2] px-3 text-xs font-semibold text-white transition hover:opacity-90">
                  <Share2 aria-hidden="true" className="h-4 w-4" /> LinkedIn
                </a>
                <a aria-label="Share on X" href={`https://twitter.com/intent/tweet?url=${encodedPostUrl}&text=${encodedPostTitle}`} target="_blank" rel="noreferrer" className="flex h-9 items-center gap-2 rounded-full bg-black px-3 text-xs font-semibold text-white transition hover:opacity-90">
                  <Share2 aria-hidden="true" className="h-4 w-4" /> X
                </a>
              </div>
            </div>

            {/* Post Tag Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[...selectedPost.categories, ...selectedPost.tags].map((tag, idx) => (
                <span key={idx} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Newsletter Section */}
          <NewsletterBanner />

        </article>
      ) : (

        /* ---------------- BLOG OVERVIEW / MAIN FEED ---------------- */
        <main className="mx-auto max-w-[1100px] px-6 py-12 space-y-16">
          
          {/* Header Banner */}
          <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-[#1A202C] sm:text-5xl">
                Our Blog
              </h1>
              <div className="space-y-4 text-base text-[#5F6D7A] leading-relaxed max-w-[480px]">
                <p>
                  Welcome to the <strong className="text-[#1A202C]">RoomReview Blog</strong> – your go-to hub for smarter, safer renting in the UK.
                </p>
                <p>
                  Whether you're checking a landlord's credentials, fighting to get your deposit back, or simply learning your rights under the latest Renters Reform Bill, we're here to guide you through every step.
                </p>
                <p>
                  Our articles combine expert advice, legal know-how, and real tenant experiences to help you rent with confidence and avoid common pitfalls. From spotting scams to discovering your ideal neighbourhood, RoomReview empowers you to make informed decisions – and share your own experiences to help others.
                </p>
              </div>
            </div>

            {/* Banner Image */}
            <div className="overflow-hidden rounded-3xl shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1000&auto=format&fit=crop&q=80" 
                alt="London River Thames View" 
                className="h-[320px] w-full object-cover"
              />
            </div>
          </section>

          {/* Explore Blog Header + Search + Filters */}
          <section className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-extrabold text-[#1A202C]">
                Explore blog
              </h2>
              
              {/* Search Box */}
              <div className="mx-auto max-w-[500px]">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search blog (e.g. B2R or Renters' Rights Act)"
                    className="w-full rounded-2xl border border-gray-200 py-3 pl-11 pr-4 text-base shadow-sm transition focus:border-[#8B0000] focus:outline-none focus:ring-1 focus:ring-[#8B0000]"
                  />
                </div>
              </div>
            </div>

            {/* Category Tags & Sort Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    aria-pressed={activeCategory === cat}
                    onClick={() => {
                      setActiveCategory(activeCategory === cat ? 'All' : cat);
                      setCurrentPage(1);
                    }}
                    className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${
                      activeCategory === cat 
                        ? 'bg-[#8B0000] text-white shadow-sm' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <span>Sort by</span>
                <select
                  value={sortOrder}
                  onChange={(event) => {
                    setSortOrder(event.target.value as 'newest' | 'oldest');
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-2 font-semibold text-[#1A202C]"
                >
                  <option value="newest">Date (newest first)</option>
                  <option value="oldest">Date (oldest first)</option>
                </select>
              </label>
            </div>

            {/* Blog Post Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {visiblePosts.map((post) => (
                <Link 
                  key={post.id}
                  to={`/blog?post=${post.id}`}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {post.image && (
                      <div className="h-44 w-full overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="p-5 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <time dateTime={post.date} className="text-gray-400 font-medium">
                          {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </time>
                        {post.categories.slice(0, 2).map((tag, tIdx) => (
                          <span key={tIdx} className="rounded bg-gray-100 px-2 py-0.5 font-semibold text-gray-600">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-base font-bold text-[#1A202C] leading-snug group-hover:text-[#8B0000] transition">
                        {post.title}
                      </h3>

                      <p className="text-sm text-[#718096] leading-relaxed line-clamp-3">
                        {getWordPressExcerpt(post.excerpt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {loading && (
              <p className="py-8 text-center text-sm text-gray-500" role="status">Loading articles from WordPress...</p>
            )}
            {loadError && (
              <p className="py-8 text-center text-sm text-red-700" role="alert">{loadError}</p>
            )}
            {visiblePosts.length === 0 && (
              !loading && !loadError
                ? <p className="py-8 text-center text-sm text-gray-500" role="status">No articles match your search.</p>
                : null
            )}

            <p className="text-center text-sm text-gray-500" aria-live="polite">
              {!loading && !loadError ? `${filteredPosts.length} ${filteredPosts.length === 1 ? 'article' : 'articles'}` : ''}
            </p>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <button 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition ${
                    currentPage === page
                      ? 'bg-[#8B0000] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
                disabled={currentPage === pageCount}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          {/* Newsletter Section */}
          <NewsletterBanner />

        </main>
      )}

    </div>
  );
};

const NewsletterBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#FAF5F0] p-8 sm:p-10 border border-[#F3E8E2]">
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-2xl font-extrabold text-[#1A202C] leading-tight sm:text-3xl">
            How RoomReview Is Helping UK Renters Make Smarter Choices
          </h3>
          <p className="text-base text-[#5F6D7A] leading-relaxed max-w-[420px]">
            Go beyond the data and understand what living in London is really like. Read expert guides, neighbourhood breakdowns, rental tips, and real tenant experiences to make smarter decisions.
          </p>
          <p className="text-base text-[#5F6D7A] leading-relaxed">
            From hidden red flags to local trends – we help you see what property listings don't show.
          </p>
          <div className="pt-2">
            <button className="rounded-xl bg-[#8B0000] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow transition hover:bg-[#700000]">
              Subscribe to Our Newsletter
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl shadow-md">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80" 
            alt="Modern UK Apartment Block" 
            className="h-[260px] w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default BlogPlatform;
