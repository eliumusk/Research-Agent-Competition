import Image from 'next/image';
import { useTranslations } from 'next-intl';

const logos = [
  { src: '/svg/nvidia.svg', alt: 'Nvidia Logo', height: 20 },
  { src: '/svg/column.svg', alt: 'Column Logo', height: 16 },
  { src: '/svg/github.svg', alt: 'GitHub Logo', height: 16 },
  { src: '/svg/nike.svg', alt: 'Nike Logo', height: 20 },
  { src: '/svg/laravel.svg', alt: 'Laravel Logo', height: 16 },
  { src: '/svg/lilly.svg', alt: 'Lilly Logo', height: 28 },
  { src: '/svg/lemonsqueezy.svg', alt: 'Lemon Squeezy Logo', height: 20 },
  { src: '/svg/openai.svg', alt: 'OpenAI Logo', height: 24 },
  { src: '/svg/tailwindcss.svg', alt: 'Tailwind CSS Logo', height: 16 },
  { src: '/svg/vercel.svg', alt: 'Vercel Logo', height: 20 },
  { src: '/svg/zapier.svg', alt: 'Zapier Logo', height: 20 },
];

export default function LogoCloudSection() {
  const t = useTranslations('HomePage.logocloud');

  return (
    <section id="logo-cloud" className="bg-muted/50 px-4 py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-xl font-medium">{t('title')}</h2>

        <div className="mx-auto mt-20 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
          {logos.map((logo) => (
            <Image
              key={logo.src}
              src={logo.src}
              alt={logo.alt}
              width={160}
              height={logo.height}
              sizes="(max-width: 640px) 40vw, 160px"
              className="w-auto dark:invert"
              style={{ height: `${logo.height}px` }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
