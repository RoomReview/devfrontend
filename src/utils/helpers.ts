export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const isValidPostcode = (postcode: string): boolean => {
  const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
  return postcodeRegex.test(postcode);
};

export const normalizePostcode = (postcode: string): string =>
  postcode.replace(/-/g, ' ').trim().replace(/\s+/g, ' ').toUpperCase();

export const postcodePath = (postcode: string): string =>
  `/postcode/${normalizePostcode(postcode).replace(/ /g, '-').toLowerCase()}`;

export type PostcodeReviewAction = 'read' | 'write';

export const postcodeReviewPath = (postcode: string, action: PostcodeReviewAction): string =>
  `${postcodePath(postcode)}#${action === 'write' ? 'leave-review' : 'reviews'}`;

export const postcodeAreaReportPath = (postcode: string): string =>
  `/report?postcode=${encodeURIComponent(normalizePostcode(postcode))}#form`;

export const getSafePostcodeReturnTo = (returnTo: string | null): string | null =>
  returnTo && /^\/postcode\/[a-z0-9-]+(?:#(?:reviews|leave-review))?$/.test(returnTo)
    ? returnTo
    : null;

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};
