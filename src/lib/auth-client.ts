import { websiteConfig } from '@/config/website';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import type { auth } from './auth';
import { getBaseUrl } from './urls/urls';

/**
 * https://www.better-auth.com/docs/installation#create-client-instance
 */
export const authClient = websiteConfig.auth.disabled
  ? {
      // Mock implementation when auth is disabled
      useSession: () => ({ data: null, isPending: false, error: null }),
      signIn: async () => ({ error: null }),
      signOut: async () => {},
      signUp: async () => ({ error: null }),
      // Add other methods that might be used in your app
    }
  : createAuthClient({
      baseURL: getBaseUrl(),
      plugins: [
        // https://www.better-auth.com/docs/plugins/admin#add-the-client-plugin
        adminClient(),
        // https://www.better-auth.com/docs/concepts/typescript#inferring-additional-fields-on-client
        inferAdditionalFields<typeof auth>(),
      ],
    });
