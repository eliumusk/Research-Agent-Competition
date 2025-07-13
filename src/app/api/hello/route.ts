import { inngest } from '@/inngest/client';
import { NextResponse } from 'next/server';

// Opt out of caching; every request should send a new event
export const dynamic = 'force-dynamic';

// Create a simple async Next.js API route handler
export async function GET() {
  console.log('Send event to Inngest start');
  // Send your event payload to Inngest
  await inngest.send({
    name: 'test/hello.world',
    data: {
      email: 'testUser@example.com',
    },
  });

  console.log('Send event to Inngest end');
  return NextResponse.json({ message: 'Event sent!' });
}
