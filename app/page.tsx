'use client';

import { useState, useEffect } from 'react';
import ScoutScreen from '@/components/ScoutScreen';
import TeamsScreen from '@/components/TeamsScreen';
import MatchesScreen from '@/components/MatchesScreen';
import AnalyticsScreen from '@/components/AnalyticsScreen';
import SettingsScreen from '@/components/SettingsScreen';
import { IconAnalytics, IconMatches, IconScout, IconSettings, IconTeams } from '@/components/icons/HyperIcons';

import { storage } from '@/lib/storage';

type Tab = 'scout' | 'teams' | 'matches' | 'analytics' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('scout');
  const [scoutProfile, setScoutProfile] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load scout profile and sync on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setScoutProfile(data.profile))
      .catch(() => setScoutProfile(null));

    // Auto-sync from Supabase
    setIsSyncing(true);
    storage.syncAll().finally(() => setIsSyncing(false));
  }, []);

  const tabs: { id: Tab; label: string; Icon: typeof IconScout }[] = [
    { id: 'scout', label: 'Scout', Icon: IconScout },
    { id: 'teams', label: 'Teams', Icon: IconTeams },
    { id: 'matches', label: 'Matches', Icon: IconMatches },
    { id: 'analytics', label: 'Analytics', Icon: IconAnalytics },
    { id: 'settings', label: 'Settings', Icon: IconSettings },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden y2k-grid y2k-scanlines">
      {/* Header - Hyper Control Bar */}
      <header className="y2k-panel y2k-outline text-foreground px-4 py-3 shadow-lg border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className="w-11 h-11 flex items-center justify-center border-2 border-primary bg-primary/10 y2k-panel-soft"
                aria-label="Team Hyper 69"
                title="Team Hyper 69"
              >
                <span className="text-primary text-lg font-black [font-family:var(--font-y2k-display)] tracking-wider">
                  69
                </span>
              </div>
              <h1 className="text-base font-semibold tracking-widest [font-family:var(--font-y2k-display)] text-primary">ReScout</h1>
              {isSyncing && (
                <span className="text-[10px] bg-secondary/15 text-secondary px-2 py-0.5 rounded-full animate-pulse y2k-blue-glow">
                  SYNCING
                </span>
              )}
            </div>
            <span className="text-xs text-secondary y2k-readout [font-family:var(--font-y2k-body)] tracking-[0.25em]">FRC FIELD INTELLIGENCE v2.4</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="[font-family:var(--font-y2k-body)]">Scout: {scoutProfile || '--'}</span>
            <span className="text-secondary">Team Hyper 69</span>
            <form method="POST" action="/api/logout">
              <button
                type="submit"
                className="text-xs px-2.5 py-1 rounded-md border border-border hover:border-secondary hover:text-secondary transition-colors y2k-panel-soft y2k-pill"
                title="Log out"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
        <div className="mt-3 h-[2px] w-full y2k-bar rounded-full y2k-glow" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 teams-y2k">
        {activeTab === 'scout' && <ScoutScreen />}
        {activeTab === 'teams' && <TeamsScreen />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 y2k-panel y2k-outline border-t border-border shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              data-active={activeTab === tab.id}
                className={`nav-item flex flex-col items-center justify-center flex-1 h-full transition-all relative ${activeTab === tab.id
                  ? 'text-secondary font-semibold scale-105 y2k-blue-glow'
                  : 'text-gray-500 hover:text-primary'
                }`}
            >
              <tab.Icon className="hyper-nav-icon h-8 w-8 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary rounded-t-full y2k-blue-glow" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
