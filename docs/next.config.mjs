import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// GitHub Pages serves this project site under /Chronos, so every asset and
// link needs that prefix. Set BASE_PATH="" to build for a root domain.
const basePath = process.env.BASE_PATH ?? '/Chronos';

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  reactStrictMode: true,
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default withMDX(config);
