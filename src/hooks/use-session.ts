import { authClient } from '@/lib/auth-client';
import { websiteConfig } from '@/config/website';

export const useSession = () => {
  const disableAuth = websiteConfig.auth.disabled;
  if (disableAuth) {
    return {
      session: null,
      error: null,
    };
  }

  const { data: session, error } = authClient.useSession();
  // console.log('useCurrentUser, session:', session);
  if (error) {
    console.error('useSession, error:', error);
    return null;
  }
  return session;
};
