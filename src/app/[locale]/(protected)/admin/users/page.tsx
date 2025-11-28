import { UsersPageClient } from '@/components/admin/users-page-client';

/**
 * Users page
 *
 * This page is used to manage users for the admin,
 * it is protected and only accessible to the admin role
 */
export default function UsersPage() {
  return (
    <div className=" px-4 lg:px-6">
      <UsersPageClient />
    </div>
  );
}
