import { DeleteAccountCard } from '@/components/settings/security/delete-account-card';
import { PasswordCardWrapper } from '@/components/settings/security/password-card-wrapper';

export default function SecurityPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PasswordCardWrapper />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <DeleteAccountCard />
      </div>
    </div>
  );
}
