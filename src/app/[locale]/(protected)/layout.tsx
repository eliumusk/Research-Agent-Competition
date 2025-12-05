import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getSession } from '@/lib/server';
import { Routes } from '@/routes';
import { redirect } from 'next/navigation';
import type { PropsWithChildren } from 'react';

/**
 * Protected layout for authenticated users
 *
 * SECURITY: This layout validates the session on the server for all protected pages.
 * The middleware only performs a fast cookie check for redirection; this is the
 * canonical server-side validation point that ensures the session is valid.
 *
 * inspired by dashboard-01
 * https://ui.shadcn.com/blocks
 */
export default async function DashboardLayout({ children }: PropsWithChildren) {
  // Server-side session validation - ensures the session is valid
  // This is critical because middleware only checks for cookie existence
  const session = await getSession();
  if (!session?.user) {
    redirect(Routes.Login);
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <DashboardSidebar variant="inset" />

      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
