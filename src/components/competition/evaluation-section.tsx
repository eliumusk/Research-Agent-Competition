import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Award, BarChart3, Sparkles, TrendingUp, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function EvaluationSection() {
  const t = await getTranslations('Competition.evaluation');

  const criteria = [
    {
      icon: Sparkles,
      title: t('criteria1.title'),
      description: t('criteria1.description'),
    },
    {
      icon: Award,
      title: t('criteria2.title'),
      description: t('criteria2.description'),
    },
    {
      icon: TrendingUp,
      title: t('criteria3.title'),
      description: t('criteria3.description'),
    },
  ];

  return (
    <section id="evaluation" className="px-4 py-16">
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

        {/* Highlight: 50-50 Split */}
        <div className="mb-12">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
            <CardContent className="p-8 lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto_1fr]">
                {/* Objective Score */}
                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <BarChart3 className="size-8" />
                    </div>
                    <div>
                      <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        {t('objective.label')}
                      </div>
                      <div className="font-mono text-4xl font-bold">50%</div>
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">
                    {t('objective.title')}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {t('objective.description')}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span>{t('objective.metric1')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span>{t('objective.metric2')}</span>
                    </div>
                  </div>
                </div>

                {/* Divider with Plus Sign */}
                <div className="relative hidden lg:flex lg:items-center lg:justify-center">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />
                  <div className="relative z-10 flex size-12 items-center justify-center rounded-full border-2 bg-background font-mono text-xl font-bold">
                    +
                  </div>
                </div>

                {/* Expert Score */}
                <div className="relative">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                      <Users className="size-8" />
                    </div>
                    <div>
                      <div className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                        {t('expert.label')}
                      </div>
                      <div className="font-mono text-4xl font-bold">50%</div>
                    </div>
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">
                    {t('expert.title')}
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {t('expert.description')}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span>{t('expert.metric1')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span>{t('expert.metric2')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="size-1.5 rounded-full bg-primary" />
                      <span>{t('expert.metric3')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Criteria Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {criteria.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="group transition-all duration-300 hover:shadow-lg hover:border-primary/50"
              >
                <CardHeader>
                  <div className="mb-3 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Highlight Box */}
        <div className="mt-8">
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="size-5" />
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">{t('highlight.title')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('highlight.description')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
