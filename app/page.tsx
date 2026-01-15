'use client';

import { useState, useEffect } from 'react';
import ScoutScreen from '@/components/ScoutScreen';
import TeamsScreen from '@/components/TeamsScreen';
import MatchesScreen from '@/components/MatchesScreen';
import AnalyticsScreen from '@/components/AnalyticsScreen';
import SettingsScreen from '@/components/SettingsScreen';

type Tab = 'scout' | 'teams' | 'matches' | 'analytics' | 'settings';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('scout');
  const [scoutProfile, setScoutProfile] = useState<string | null>(null);

  // Load scout profile on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setScoutProfile(data.profile))
      .catch(() => setScoutProfile(null));
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'scout', label: 'Scout', icon: '📝' },
    { id: 'teams', label: 'Teams', icon: '👥' },
    { id: 'matches', label: 'Matches', icon: '🎯' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header - Team Hyper 69 Branding */}
      <header className="bg-primary text-white px-4 py-2 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Rebuilt</h1>
            {scoutProfile && (
              <p className="text-xs opacity-75">Scouting as: {scoutProfile}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs opacity-90">Team Hyper 69</span>
            <form method="POST" action="/api/logout">
              <button
                type="submit"
                className="text-xs opacity-75 hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-white/10"
                title="Log out"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'scout' && <ScoutScreen />}
        {activeTab === 'teams' && <TeamsScreen />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'analytics' && <AnalyticsScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-primary/20 shadow-lg z-50">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${
                activeTab === tab.id
                  ? 'text-primary font-semibold scale-105'
                  : 'text-gray-500 hover:text-primary/70'
              }`}
            >
              <span className="text-2xl mb-0.5">{tab.icon}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
