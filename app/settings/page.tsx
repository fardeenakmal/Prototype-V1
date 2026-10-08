import React from 'react';
import SettingsView from '@/components/SettingsView';

export const metadata = {
  title: 'Settings & Risk Weights | PhishGuard',
  description: 'Manage VirusTotal API keys, simulation modes, and scoring engine weights.'
};

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SettingsView />
    </div>
  );
}

