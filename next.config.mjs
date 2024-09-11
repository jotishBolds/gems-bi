/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '3ueks2jaxjpgpjeg.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "referrer-policy", value: "no-referrer" }],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        crypto: false,
        canvas: false,
      };
    }
    return config;
  },
};

export default nextConfig;
