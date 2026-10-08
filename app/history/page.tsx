import React from 'react';
import HistoryView from '@/components/HistoryView';
import { getAllScans } from '@/lib/storage';

export const metadata = {
  title: 'Scan History & Telemetry Log | PhishGuard',
  description: 'Historical cybersecurity scan audit log with search, filtering, and export.'
};

export default function HistoryPage() {
  const scans = getAllScans();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HistoryView initialScans={scans} />
    </div>
  );
}

