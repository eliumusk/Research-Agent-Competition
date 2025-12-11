import Image from 'next/image';
import { InfiniteSlider } from '@/components/tailark/motion/infinite-slider';
import { ProgressiveBlur } from './motion/progressive-blur';

const sliderLogos = [
  {
    src: 'https://html.tailus.io/blocks/customers/nvidia.svg',
    alt: 'Nvidia Logo',
    height: 20,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/column.svg',
    alt: 'Column Logo',
    height: 16,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/github.svg',
    alt: 'GitHub Logo',
    height: 16,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/nike.svg',
    alt: 'Nike Logo',
    height: 20,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/lemonsqueezy.svg',
    alt: 'Lemon Squeezy Logo',
    height: 20,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/laravel.svg',
    alt: 'Laravel Logo',
    height: 16,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/lilly.svg',
    alt: 'Lilly Logo',
    height: 28,
  },
  {
    src: 'https://html.tailus.io/blocks/customers/openai.svg',
    alt: 'OpenAI Logo',
    height: 24,
  },
];

export const LogoCloud = () => {
  return (
    <section className="bg-background pb-16 md:pb-32">
      <div className="group relative m-auto max-w-6xl px-6">
        <div className="flex flex-col items-center md:flex-row">
          <div className="inline md:max-w-44 md:border-r md:pr-6">
            <p className="text-end text-sm">Powering the best teams</p>
          </div>
          <div className="relative py-6 md:w-[calc(100%-11rem)]">
            <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
              {sliderLogos.map((logo) => (
                <div className="flex" key={logo.src}>
                  <Image
                    className="mx-auto w-auto dark:invert"
                    style={{ height: `${logo.height}px` }}
                    src={logo.src}
                    alt={logo.alt}
                    width={160}
                    height={logo.height}
                    sizes="160px"
                    loading="lazy"
                  />
                </div>
              ))}
            </InfiniteSlider>

            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur
              className="pointer-events-none absolute left-0 top-0 h-full w-20"
              direction="left"
              blurIntensity={1}
            />
            <ProgressiveBlur
              className="pointer-events-none absolute right-0 top-0 h-full w-20"
              direction="right"
              blurIntensity={1}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
