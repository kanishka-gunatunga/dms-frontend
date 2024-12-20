/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
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
  