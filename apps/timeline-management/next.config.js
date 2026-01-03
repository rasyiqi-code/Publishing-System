/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/core", "@repo/feature-timeline", "@repo/feature-tracking", "@repo/auth"],
};

module.exports = nextConfig;
