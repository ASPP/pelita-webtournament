import type { NextConfig } from 'next';

import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  output: "export",
  // basePath: process.env.BASE_PATH || "",
  basePath: "/pelita-webtournament",
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const configWithMDX = createMDX({
  options: {
    remarkPlugins: ['remark-frontmatter', 'remark-mdx-frontmatter'],
  },
});

// Merge MDX config with Next.js config
export default configWithMDX(nextConfig);
