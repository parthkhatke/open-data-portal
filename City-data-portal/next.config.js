/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/city-data-portal',
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gis.charlottenc.gov',
      },
      {
        protocol: 'https',
        hostname: 'clt.charlotte.opendata.arcgis.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/arcgis/:path*',
        destination: 'https://gis.charlottenc.gov/arcgis/rest/services/:path*',
      },
    ];
  },
};

module.exports = nextConfig;

