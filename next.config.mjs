/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['localhost', 'sites.techvoice.lk'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'sites.techvoice.lk',
          pathname: '/dms-backend/public/uploads/**',
        },
      ],
    },
    experimental: {
      serverComponentsExternalPackages: ["pdf-parse"],
    },
  };
  
  export default nextConfig;
  