import { distributeCreditsToAllUsers } from '@/credits/credits';
import { inngest } from './client';

/**
 * Distribute credits to all users daily
 *
 * https://www.inngest.com/docs/guides/scheduled-functions
 */
export const distributeCreditsDaily = inngest.createFunction(
  { id: 'distribute-credits-daily' },
  { cron: 'TZ=Asia/Shanghai 0 1 * * *' },
  async ({ step }) => {
    // You should use step.run for any async or long-running logic.
    // This allows Inngest to track, retry, and visualize each step in your workflow.
    await step.run('distribute-credits-to-all-users', async () => {
      console.log('distributing credits to all users start');
      const { processedCount, errorCount } =
        await distributeCreditsToAllUsers();
      console.log(
        `distributing credits to all users end, processed: ${processedCount}, errors: ${errorCount}`
      );
      return {
        message: `credits distributed, processed: ${processedCount}, errors: ${errorCount}`,
        processedCount,
        errorCount,
      };
    });
    // you can add new steps here, for example, send email to admin
  }
);

/**
 * Hello World function, for testing inngest
 *
 * https://www.inngest.com/docs/guides/scheduled-functions
 */
export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    console.log('Hello World function start');
    await step.sleep('wait-a-moment', '1s');
    console.log('Hello World function end');
    return { message: `Hello ${event.data.email}!` };
  }
);
