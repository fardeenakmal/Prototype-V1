import React from 'react';
import DashboardView from '@/components/DashboardView';
import { getDashboardData } from '@/lib/storage';

export const metadata = {
  title: 'SOC Security Dashboard | PhishGuard',
  description: 'Cybersecurity operations dashboard with threat intelligence charts and real-time alerts'
};

export default function DashboardPage() {
  const initialData = getDashboardData();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DashboardView initialData={initialData} />
    </div>
  );
}

