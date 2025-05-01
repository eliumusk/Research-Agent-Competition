import { authClient } from '@/lib/auth-client';
import { websiteConfig } from '@/config/website';

export const useCurrentUser = () => {
  const disableAuth = websiteConfig.auth.disabled;
  if (disableAuth) {
    return null;
  }
  
  const { data: session, error } = authClient.useSession();
  // console.log('useCurrentUser, session:', session);
  if (error) {
    console.error('useCurrentUser, error:', error);
    return null;
  }
  return session?.user;
};
