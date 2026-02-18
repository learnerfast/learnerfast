'use client';
import DashboardLayout from '@/components/dashboard-layout/DashboardLayout';
import UserPurchases from '@/components/dashboard/UserPurchases';

export default function PurchasesPage() {
  return (
    <DashboardLayout>
      <UserPurchases />
    </DashboardLayout>
  );
}
