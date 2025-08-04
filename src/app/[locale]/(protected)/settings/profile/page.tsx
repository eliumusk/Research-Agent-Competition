import { UpdateAvatarCard } from '@/components/settings/profile/update-avatar-card';
import { UpdateNameCard } from '@/components/settings/profile/update-name-card';
import { websiteConfig } from '@/config/website';

export default function ProfilePage() {
  const enableUpdateAvatar = websiteConfig.features.enableUpdateAvatar;

  return (
    <div className="flex flex-col gap-8">
      {enableUpdateAvatar && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <UpdateAvatarCard />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <UpdateNameCard />
      </div>
    </div>
  );
}
