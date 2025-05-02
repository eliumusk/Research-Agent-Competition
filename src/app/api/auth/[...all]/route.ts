import { websiteConfig } from '@/config/website';
import { auth } from '@/lib/auth'; // path to your auth file
import { toNextJsHandler } from 'better-auth/next-js';
import { NextResponse } from 'next/server';

// Define the handlers based on whether auth is disabled
const handlers = websiteConfig.auth.disabled
  ? {
      // If auth is disabled, return 404 Not Found for all auth API routes
      GET: async () => {
        console.log('Auth API route accessed while auth is disabled');
        return new NextResponse(null, { status: 404 });
      },
      POST: async () => {
        console.log('Auth API route accessed while auth is disabled');
        return new NextResponse(null, { status: 404 });
      },
    }
  : toNextJsHandler(auth); // Normal auth handler

// Export the handlers
export const { GET, POST } = handlers;
