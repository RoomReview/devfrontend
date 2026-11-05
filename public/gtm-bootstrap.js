(() => {
  const containerId = document.currentScript?.dataset.containerId;
  if (!containerId || !/^GTM-[A-Z0-9]+$/i.test(containerId)) return;
  if (document.getElementById('roomreview-google-tag-manager')) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.id = 'roomreview-google-tag-manager';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);
})();
