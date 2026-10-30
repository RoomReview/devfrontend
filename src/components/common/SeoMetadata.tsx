import { useEffect } from 'react';

interface SeoMetadataProps {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://roomreview.co.uk').replace(/\/+$/, '');

const upsertMeta = (name: string, content: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
};

const SeoMetadata = ({ title, description, path, noIndex = false }: SeoMetadataProps) => {
  useEffect(() => {
    const canonicalUrl = new URL(path, `${siteUrl}/`).toString();
    document.title = title;
    upsertMeta('description', description);
    upsertMeta('robots', noIndex ? 'noindex,nofollow' : 'index,follow');

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [description, noIndex, path, title]);

  return null;
};

export default SeoMetadata;
