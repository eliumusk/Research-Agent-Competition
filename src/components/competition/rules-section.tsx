'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { CheckCircle2 } from 'lucide-react';

export default function RulesSection() {
  const t = useTranslations('Competition.rules');

  const rules = [
    {
      title: t('rule1.title'),
      description: t('rule1.description'),
    },
    {
      title: t('rule2.title'),
      description: t('rule2.description'),
    },
    {
      title: t('rule3.title'),
      description: t('rule3.description'),
    },
  ];

  return (
    <section id="rules" className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full border bg-muted px-4 py-1.5 text-sm font-medium">
            {t('badge')}
          </div>
          <h2 className="mb-4 text-balance text-4xl font-semibold tracking-tight lg:text-5xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* Rules Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {rules.map((rule, index) => (
            <Card
              key={index}
              className="group transition-all duration-300 hover:shadow-lg hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 font-semibold">{rule.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rule.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground">
                {t('note')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

