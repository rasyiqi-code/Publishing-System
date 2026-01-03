/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@repo/ui", "@repo/core", "@repo/feature-access-control", "@repo/auth", "@repo/feature-timeline"],
};

module.exports = nextConfig;
