/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
import { playwright } from '@vitest/browser-playwright'

const createSecurityPolicy = (apiUrl: string, isDevelopment: boolean) => {
  const apiOrigin = apiUrl.startsWith('/') ? undefined : new URL(apiUrl).origin;
  const connectSources = [
    "'self'",
    ...(apiOrigin ? [apiOrigin] : []),
    'https://nominatim.openstreetmap.org',
    ...(isDevelopment ? ['ws://localhost:3000'] : []),
  ];

  return [
    "default-src 'self'",
    "script-src 'self'",
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://roomreview.co.uk https://www.roomreview.co.uk https://roomreview-lsoa-maps.lon1.digitaloceanspaces.com https://images.unsplash.com https://*.tile.openstreetmap.org",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${[...new Set(connectSources)].join(' ')}`,
    "frame-src https://www.openstreetmap.org",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
};

const securityPolicyPlugin = (policy: string, isProduction: boolean): Plugin => ({
  name: 'roomreview-security-policy',
  transformIndexHtml(html) {
    if (!isProduction) return html;
    return html.replace(
      '</head>',
      `  <meta http-equiv="Content-Security-Policy" content="${policy}" />\n  </head>`,
    );
  },
  generateBundle() {
    if (!isProduction) return;
    const nginxPolicy = `${policy}; frame-ancestors 'none'`;
    this.emitFile({
      type: 'asset',
      fileName: 'security-headers.inc',
      source: [
        `add_header Content-Security-Policy "${nginxPolicy}" always;`,
        'add_header X-Content-Type-Options "nosniff" always;',
        'add_header X-Frame-Options "DENY" always;',
        'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
      ].join('\n'),
    });
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const isDevelopment = mode !== 'production';
  const isProduction = mode === 'production';
  const policy = createSecurityPolicy(env.VITE_API_URL ?? '/api', isDevelopment);

  return {
    plugins: [react(), tailwindcss(), securityPolicyPlugin(policy, isProduction)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
        '@components': path.resolve(import.meta.dirname, './src/components'),
        '@pages': path.resolve(import.meta.dirname, './src/pages'),
        '@hooks': path.resolve(import.meta.dirname, './src/hooks'),
        '@services': path.resolve(import.meta.dirname, './src/services'),
        '@utils': path.resolve(import.meta.dirname, './src/utils'),
        '@types': path.resolve(import.meta.dirname, './src/types'),
        '@context': path.resolve(import.meta.dirname, './src/context'),
        '@img': path.resolve(import.meta.dirname, '../img'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
        },
      },
    },
    optimizeDeps: {
      include: ['react-dom/client'],
    },
    test: {
      watch: false,
      testTimeout: 30000,
      browser: {
        headless: true,
        enabled: true,
        provider: playwright(),
        instances: [
          { browser: 'chromium', name: 'mobile-390', viewport: { width: 390, height: 844 } },
          { browser: 'chromium', name: 'tablet-768', viewport: { width: 768, height: 1024 } },
          { browser: 'chromium', name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
        ],
      },
    },
  };
});
