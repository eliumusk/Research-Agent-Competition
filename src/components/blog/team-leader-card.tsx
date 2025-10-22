import { UserIcon, BuildingIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface TeamLeaderCardProps {
  teamLeader: string;
  teamOrganization?: string;
}

/**
 * Team Leader Card component for blog sidebar
 * Displays project leader information
 */
export function TeamLeaderCard({
  teamLeader,
  teamOrganization,
}: TeamLeaderCardProps) {
  const t = useTranslations('BlogPage');

  return (
    <div className="bg-muted/50 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t('teamLeader') || '项目负责人'}
      </h2>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <UserIcon className="size-4 text-muted-foreground shrink-0" />
          <span className="text-sm">{teamLeader}</span>
        </div>
        {teamOrganization && (
          <div className="flex items-center gap-3">
            <BuildingIcon className="size-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              {teamOrganization}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

