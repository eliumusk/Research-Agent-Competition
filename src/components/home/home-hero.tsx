'use client';

import { MagicCard } from '@/components/magicui/magic-card';
import { Particles } from '@/components/magicui/particles';
import { PulsatingButton } from '@/components/magicui/pulsating-button';
import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { Button } from '@/components/ui/button';
import { EnhancedBackground } from '@/components/ui/enhanced-background';
import { LocaleLink } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import React from 'react';
import { CustomTextEffect } from '../custom/text-effect';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: 'blur(12px)',
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HomeHeroSection() {
  const t = useTranslations('HomePage.hero');
  const { theme } = useTheme();
  const linkPrimary =
    'https://www.bohrium.com/competitions/8831838064?tab=introduce';
  const linkSecondary = Routes.Blog;

  return (
    <>
      <main id="hero" className="relative overflow-hidden pb-16">
        {/* Enhanced Background with all effects */}
        <EnhancedBackground variant="hero" />

        {/* Particles Effect */}
        <Particles
          className="absolute inset-0 -z-10"
          quantity={80}
          ease={80}
          color={theme === 'dark' ? '#ffffff' : '#000000'}
          refresh={false}
        />

        <section>
          <div className="relative pt-12">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                {/* introduction */}
                {/* <AnimatedGroup variants={transitionVariants}>
                  <LocaleLink
                    href={linkIntroduction}
                    className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm">
                      {t('introduction')}
                    </span>

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </LocaleLink>
                </AnimatedGroup> */}

                {/* title */}
                <CustomTextEffect
                  per="word"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mt-8 text-balance font-bricolage-grotesque lg:mt-16 text-4xl xl:text-6xl"
                >
                  {t('title')}
                </CustomTextEffect>

                {/* tagline */}
                <TextEffect
                  per="word"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mx-auto mt-6 text-balance text-2xl font-medium text-primary lg:text-3xl"
                >
                  {t('tagline')}
                </TextEffect>

                {/* description */}
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.8}
                  as="p"
                  className="mx-auto mt-6 max-w-3xl text-balance text-lg text-muted-foreground"
                >
                  {t('intro')}
                </TextEffect>

                {/* action buttons */}
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 1.1,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-row items-center justify-center gap-4"
                >
                  <LocaleLink href={linkPrimary} target="_blank" key={1}>
                    <PulsatingButton
                      className="rounded-xl px-8 text-base"
                      pulseColor={theme === 'dark' ? '#ffffff40' : '#00000040'}
                      duration="2s"
                    >
                      <span className="text-nowrap">{t('primary')}</span>
                    </PulsatingButton>
                  </LocaleLink>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-10.5 rounded-xl px-6"
                  >
                    <LocaleLink href={linkSecondary}>
                      <span className="text-nowrap">{t('secondary')}</span>
                    </LocaleLink>
                  </Button>
                </AnimatedGroup>

                {/* key stats */}
                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: 1.3,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3"
                >
                  <MagicCard
                    className="group rounded-xl p-6 text-center shadow-sm transition-all"
                    gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
                  >
                    <div className="mb-1 font-mono text-3xl font-bold">
                      ¥<AnimatedNumber value={1000000} duration={2.5} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('stat1')}
                    </div>
                  </MagicCard>
                  <MagicCard
                    className="group rounded-xl p-6 text-center shadow-sm transition-all"
                    gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
                  >
                    <div className="mb-1 font-mono text-3xl font-bold">
                      <AnimatedNumber value={12} decimals={0} />
                      .10
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('stat2')}
                    </div>
                  </MagicCard>
                  <MagicCard
                    className="group rounded-xl p-6 text-center shadow-sm transition-all"
                    gradientColor={theme === 'dark' ? '#262626' : '#D9D9D955'}
                  >
                    <div className="mb-1 font-mono text-3xl font-bold">
                      <AnimatedNumber value={30} duration={1.5} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t('stat3')}
                    </div>
                  </MagicCard>
                </AnimatedGroup>
              </div>
            </div>

            {/* images */}
            {/* <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="bg-linear-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                />
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <Image
                    className="bg-background relative hidden rounded-2xl dark:block"
                    src="/blocks/music.png"
                    alt="app screen"
                    width={2796}
                    height={2008}
                  />
                  <Image
                    className="z-2 border-border/25 relative rounded-2xl border dark:hidden"
                    src="/blocks/music-light.png"
                    alt="app screen"
                    width={2796}
                    height={2008}
                  />
                </div>
              </div>
            </AnimatedGroup> */}
          </div>
        </section>
      </main>
    </>
  );
}
