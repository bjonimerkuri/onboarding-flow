const isDev = process.env.NODE_ENV !== 'production';

/**
 * The UI is entirely client-rendered, so production is a static export served by Vercel's CDN, with the
 * API on the same origin under /api (see vercel.json). In development, `next dev` proxies /api to the Nest
 * API instead, so the app always calls the relative URL /api and needs no CORS or per-env config.
 */
const nextConfig = isDev
  ? {
      reactStrictMode: true,
      async rewrites() {
        return [{ source: '/api/:path*', destination: `${process.env.API_ORIGIN ?? 'http://localhost:3001'}/api/:path*` }];
      },
    }
  : { reactStrictMode: true, output: 'export', images: { unoptimized: true }, trailingSlash: false };

export default nextConfig;
