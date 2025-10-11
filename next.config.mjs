/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["tailwindui.com"],
    formats: ["image/avif", "image/webp"], // change this line
    loader: "default",
    path: "/_next/image",
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
