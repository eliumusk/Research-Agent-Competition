import { constructMetadata } from '@/lib/metadata';
import { BotIcon, LinkIcon, RefreshCwIcon, SparklesIcon } from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ChatPanel } from './chat-panel';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });
  const pt = await getTranslations({ locale, namespace: 'AIChatPage' });

  return constructMetadata({
    title: pt('title') + ' | ' + t('title'),
    description: pt('description'),
    locale,
    pathname: '/ai/chat',
  });
}

const highlightIcons = {
  agent: BotIcon,
  loop: RefreshCwIcon,
  embed: LinkIcon,
} as const;

export default async function AIChatPage() {
  const t = await getTranslations('AIChatPage');

  const highlights = (['agent', 'loop', 'embed'] as const).map((key) => ({
    key,
    title: t(`highlights.${key}.title`),
    description: t(`highlights.${key}.description`),
  }));

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[36px] border border-border/50 bg-gradient-to-br from-background via-background/80 to-muted/50 p-6 sm:p-10 lg:p-14">
        <div className="pointer-events-none absolute -top-24 right-12 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-0 size-80 rounded-full bg-muted/40 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
              <SparklesIcon className="size-4" />
              {t('title')}
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
                {t('title')} · AgentOS
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                {t('description')}
              </p>
            </div>
            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
                {t('highlights.agent.description')}
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 backdrop-blur">
                {t('highlights.loop.description')}
              </div>
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-8 rounded-[32px] bg-primary/10 blur-2xl"
            />
            <div className="relative">
              <ChatPanel
                placeholder={t('input.placeholder')}
                sendLabel={t('input.send')}
                thinkingLabel={t('status.thinking')}
                newChatLabel={t('actions.newChat')}
                emptyState={{
                  title: t('emptyState.title'),
                  description: t('emptyState.description'),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {highlights.map(({ key, title, description }) => {
          const Icon = highlightIcons[key];
          return (
            <div
              key={key}
              className="group rounded-3xl border border-border/60 bg-card/60 p-6 shadow-[0_15px_40px_-35px_rgba(15,23,42,1)] transition hover:border-primary/40 hover:bg-card/80"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl border border-border/70 bg-muted/50 text-primary transition group-hover:border-primary/40 group-hover:text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          );
        })}
      </section>
    </div>
  );
}
