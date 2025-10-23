'use client';

import Container from '@/components/layout/container';
import { Logo } from '@/components/layout/logo';
import { LocaleLink } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { useTranslations } from 'next-intl';
import type React from 'react';

export function Footer({ className }: React.HTMLAttributes<HTMLElement>) {
  const t = useTranslations();

  return (
    <footer className={cn('border-t', className)}>
      <Container className="px-4">
        <div className="grid grid-cols-2 gap-8 pt-8 pb-8 md:grid-cols-6">
          <div className="flex flex-col items-center justify-center col-span-full">
            <div className="space-y-4 flex flex-col items-center justify-center">
              {/* logo and name */}
              <div className="items-center space-x-2 flex">
                <Logo />
                <span className="text-xl font-semibold">
                  {t('Metadata.name')}
                </span>
              </div>

              {/* tagline */}
              <p className="text-muted-foreground text-base py-2">
                {t('Marketing.footer.tagline')}
              </p>
            </div>
          </div>
        </div>
      </Container>

      {/* Copyright and Legal Links */}
      <div className="border-t">
        <Container className="px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <span className="text-muted-foreground text-sm text-center md:text-left">
              {t('Marketing.footer.copyright', {
                year: new Date().getFullYear(),
              })}
            </span>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              <LocaleLink
                href={Routes.PrivacyPolicy}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('Marketing.footer.legal.items.privacyPolicy')}
              </LocaleLink>
              <LocaleLink
                href={Routes.TermsOfService}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('Marketing.footer.legal.items.termsOfService')}
              </LocaleLink>
              <LocaleLink
                href={Routes.CookiePolicy}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('Marketing.footer.legal.items.cookiePolicy')}
              </LocaleLink>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
