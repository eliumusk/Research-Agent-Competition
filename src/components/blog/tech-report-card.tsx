import { Button } from '@/components/ui/button';
import { FileTextIcon, DownloadIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TechReportCardProps {
  techReportUrl: string;
}

/**
 * Tech Report Card component for blog sidebar
 * Displays a download button for the technical report PDF
 */
export function TechReportCard({ techReportUrl }: TechReportCardProps) {
  const t = useTranslations('BlogPage');

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileTextIcon className="size-5" />
        <span>{t('techReport') || '技术报告'}</span>
      </h2>
      <Button asChild variant="outline" className="w-full">
        <a
          href={techReportUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex items-center justify-center gap-2"
        >
          <DownloadIcon className="size-4" />
          <span>下载 PDF</span>
        </a>
      </Button>
    </div>
  );
}

