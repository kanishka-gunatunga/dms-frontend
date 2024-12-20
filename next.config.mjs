/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['localhost'],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'sites.techvoice.lk',
          pathname: '/dms-backend/public/uploads/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  