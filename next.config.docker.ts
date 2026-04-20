import type { NextConfig } from 'next';

import createMDX from '@next/mdx';

const nextConfig: NextConfig = {
  basePath: '',
  output: 'standalone',
  // images: {
  //   unoptimized: true,
  // },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
};

const configWithMDX = createMDX({
  options: {
    remarkPlugins: ['remark-breaks', 'remark-frontmatter', 'remark-mdx-frontmatter'],
  },
});

// Merge MDX config with Next.js config
export default configWithMDX(nextConfig);
