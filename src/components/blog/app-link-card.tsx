import { Button } from '@/components/ui/button';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AppLinkCardProps {
  appLink: string;
}

/**
 * App Link Card component for blog sidebar
 * Displays a button to open the Bohrium App
 */
export function AppLinkCard({ appLink }: AppLinkCardProps) {
  const t = useTranslations('BlogPage');

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t('tryApp') || '一键使用'}
      </h2>
      <Button asChild className="w-full" size="lg">
        <a
          href={appLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2"
        >
          <span>打开应用</span>
          <ExternalLinkIcon className="size-4" />
        </a>
      </Button>
    </div>
  );
}

