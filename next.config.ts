import { withContentCollections } from '@content-collections/next';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/**
 * https://nextjs.org/docs/app/api-reference/config/next-config-js
 */
const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,

  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  // Remove all console.* calls in production only
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  images: {
    // https://vercel.com/docs/image-optimization/managing-image-optimization-costs#minimizing-image-optimization-costs
    // https://nextjs.org/docs/app/api-reference/components/image#unoptimized
    // vercel has limits on image optimization, 1000 images per month
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'blog.mksaas.me',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
  async redirects() {
    return [
      // {
      //   source: '/',
      //   destination: '/blog',
      //   permanent: false,
      // },
      {
        source: '/algorithm',
        destination: '/blog/algorithm',
        permanent: true,
      },
      {
        source: '/2016-nian-mian-shi-zhi-nan-zhi-suan-fa-mian-shi-xin-de',
        destination: '/blog/algorithm',
        permanent: true,
      },
      {
        source: '/shijing',
        destination: '/blog/shijing',
        permanent: true,
      },
      {
        source: '/2018-nian-yi-ge-xiao-fu-ye-de-kai-fa-xin-de',
        destination: '/blog/shijing',
        permanent: true,
      },
      {
        source: '/directory',
        destination: '/blog/directory',
        permanent: true,
      },
      {
        source: '/2024-nian-du-li-kai-fa-zhe-dao-hang-zhan-kai-yuan',
        destination: '/blog/directory',
        permanent: true,
      },
      {
        source: '/haitang',
        destination: '/blog/haitang',
        permanent: true,
      },
      {
        source: '/2024-nian-hai-tang-shi-she-xiakai-yuan',
        destination: '/blog/haitang',
        permanent: true,
      },
      {
        source: '/obsidian',
        destination: '/blog/obsidian',
        permanent: true,
      },
      {
        source: '/ge-ren-zhi-shi-ku-da-jian-jiao-cheng',
        destination: '/blog/obsidian',
        permanent: true,
      },
      {
        source: '/creem',
        destination: '/blog/creem',
        permanent: true,
      },
      {
        source: '/email',
        destination: '/blog/email',
        permanent: true,
      },
      {
        source: '/da-jian-mian-fei-de-qi-ye-you-xiang-gmail-resend-cloudflare',
        destination: '/blog/email',
        permanent: true,
      },
      {
        source: '/dokploy',
        destination: '/blog/dokploy',
        permanent: true,
      },
      {
        source: '/dokployde-ji-jian-jiao-cheng',
        destination: '/blog/dokploy',
        permanent: true,
      },
    ];
  },
};

/**
 * You can specify the path to the request config file or use the default one (@/i18n/request.ts)
 *
 * https://next-intl.dev/docs/getting-started/app-router/with-i18n-routing#next-config
 */
const withNextIntl = createNextIntlPlugin();

/**
 * withContentCollections must be the outermost plugin
 *
 * https://www.content-collections.dev/docs/quickstart/next
 */
export default withContentCollections(withNextIntl(nextConfig));
