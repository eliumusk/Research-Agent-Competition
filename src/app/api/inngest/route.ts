import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { distributeCreditsDaily, helloWorld } from '../../../inngest/functions';

/**
 * Inngest route
 *
 * https://www.inngest.com/docs/getting-started/nextjs-quick-start
 *
 * Next.js Edge Functions hosted on Vercel can also stream responses back to Inngest,
 * giving you a much higher request timeout of 15 minutes (up from 10 seconds on the Vercel Hobby plan!).
 * To enable this, set your runtime to "edge" (see Quickstart for Using Edge Functions | Vercel Docs)
 * and add the streaming: "allow" option to your serve handler:
 * https://www.inngest.com/docs/learn/serving-inngest-functions#framework-next-js
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld, distributeCreditsDaily],
});
