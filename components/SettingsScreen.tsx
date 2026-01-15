'use client';

import { useState, useEffect } from 'react';
import { GameConfig } from '@/types';
import { storage } from '@/lib/storage';
import { getTBAKey, setTBAKey } from '@/lib/tba';
import { importTeamsFromCSV, importTeamsFromTBA, mergeAndSaveTeams } from '@/lib/teamImport';

export default function SettingsScreen() {
  const [config, setConfig] = useState<GameConfig>({
    scoringZones: ['high', 'low'],
    phases: ['auto', 'teleop', 'endgame'],
    normalBallRange: { min: 30, max: 60 },
  });
  const [exportData, setExportData] = useState('');
  const [tbaApiKey, setTbaApiKey] = useState('');
  const [eventKey, setEventKey] = useState('2026marea');
  const [importStatus, setImportStatus] = useState('');
  const [teamCount, setTeamCount] = useState(0);
  const [scoutProfile, setScoutProfile] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = storage.getConfig();
    setConfig(savedConfig);
    const savedTbaKey = getTBAKey();
    if (savedTbaKey) setTbaApiKey(savedTbaKey);
    const savedEventKey = storage.getEventKey();
    if (savedEventKey) setEventKey(savedEventKey);
    const teams = storage.getTeams();
    setTeamCount(teams.length);
    
    // Load scout profile
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setScoutProfile(data.profile))
      .catch(() => setScoutProfile(null));
  }, []);

  const handleChangeProfile = () => {
    window.location.href = '/profile?from=/';
  };

  const handleSaveConfig = () => {
    storage.saveConfig(config);
    alert('Configuration saved!');
  };

  const handleExportCSV = () => {
    const scoutData = storage.getScoutData();
    if (scoutData.length === 0) {
      alert('No data to export!');
      return;
    }

    // CSV header
    const headers = [
      'Match',
      'Alliance',
      'Team',
      'Position',
      'Scout Name',
      'Auto Fuel Made',
      'Auto Fuel Miss',
      'Teleop Fuel Made',
      'Teleop Fuel Miss',
      'Climb',
      'Parked',
      'Got Defended',
      'Played Defense',
      'Notes',
      'Tags',
    ];

    // CSV rows
    const rows = scoutData.map((data) => [
      data.matchNumber,
      data.alliance,
      data.teamNumber,
      data.position,
      data.scoutName || '',
      data.auto.ballCounts.made,
      data.auto.ballCounts.miss,
      data.teleop.ballCounts.made,
      data.teleop.ballCounts.miss,
      data.endgame.climb,
      data.endgame.parked,
      data.endgame.gotDefended,
      data.endgame.playedDefense,
      data.endgame.notes,
      data.endgame.tags.join(';'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    setExportData(csv);

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rebuilt-scout-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all scout data? This cannot be undone!')) {
      localStorage.removeItem('rebuilt_scout_data');
      alert('All scout data cleared!');
    }
  };

  const handleSaveTBAKey = () => {
    if (tbaApiKey.trim()) {
      setTBAKey(tbaApiKey.trim());
      alert('TBA API key saved!');
    } else {
      alert('Please enter a valid API key');
    }
  };

  const handleImportFromCSV = async () => {
    try {
      // Read the CSV file from the user's downloads folder
      // For now, we'll provide a textarea to paste CSV content
      const csvContent = prompt('Paste CSV content here (team_number,team_name,city,state_prov,country):');
      if (!csvContent) return;

      const teams = importTeamsFromCSV(csvContent);
      if (teams.length === 0) {
        alert('No teams found in CSV. Please check the format.');
        return;
      }

      const mergedTeams = mergeAndSaveTeams(teams);
      setTeamCount(mergedTeams.length);
      setImportStatus(`Successfully imported ${teams.length} teams! Total: ${mergedTeams.length}`);
      setTimeout(() => setImportStatus(''), 3000);
    } catch (error) {
      alert(`Error importing CSV: ${error}`);
      setImportStatus(`Error: ${error}`);
    }
  };

  const handleImportFromTBA = async () => {
    try {
      if (!tbaApiKey.trim()) {
        alert('Please enter and save your TBA API key first!');
        return;
      }

      setImportStatus('Importing teams from TBA...');
      const teams = await importTeamsFromTBA(eventKey);
      const mergedTeams = mergeAndSaveTeams(teams);
      storage.saveEventKey(eventKey);
      setTeamCount(mergedTeams.length);
      setImportStatus(`Successfully imported ${teams.length} teams from ${eventKey}! Total: ${mergedTeams.length}`);
      setTimeout(() => setImportStatus(''), 5000);
    } catch (error: any) {
      setImportStatus(`Error: ${error.message}`);
      alert(`Error importing from TBA: ${error.message}`);
    }
  };

  const handleImportDefaultTeams = async () => {
    // Import the default North Shore event teams from CSV
    const csvContent = `team_number,team_name,city,state_prov,country,robot_image_url
69,HYPER,Quincy,Massachusetts,USA,
78,AIR STRIKE,Newport,Rhode Island,USA,
88,TJ²,Bridgewater,Massachusetts,USA,
97,Bionic Beef,Cambridge,Massachusetts,USA,
125,NUTRONs,Revere,Massachusetts,USA,
133,B.E.R.T.,Standish,Maine,USA,
151,Tough Techs,Nashua,New Hampshire,USA,
238,Crusaders,Manchester,New Hampshire,USA,
246,Lobstah Bots,Boston,Massachusetts,USA,
433,Firebirds,Flourtown,Pennsylvania,USA,
1058,PVC Pirates,Londonderry,New Hampshire,USA,
1721,Tidal Force,Concord,New Hampshire,USA,
1761,STEAMpunk Tigers,Lynn,Massachusetts,USA,
1922,Oz-Ram,Contoocook,New Hampshire,USA,
2084,Robots by the C,Manchester,Massachusetts,USA,
2423,The KwarQs,Watertown,Massachusetts,USA,
2713,Red Hawk Robotics,Melrose,Massachusetts,USA,
2876,DevilBotz,Burlington,Massachusetts,USA,
2877,LigerBots,Newtonville,Massachusetts,USA,
3205,Patriots,Concord,Massachusetts,USA,
3566,Gone Fishin',Southborough,Massachusetts,USA,
3958,Schrodinger's Cat,Boston,Massachusetts,USA,
4169,Warrior Robotics,Sudbury,Massachusetts,USA,
4311,Swampscott Currents,Swampscott,Massachusetts,USA,
4546,Shockwave,Dover,New Hampshire,USA,
4761,The Robockets,Reading,Massachusetts,USA,
5459,Ipswich TIGERS,Ipswich,Massachusetts,USA,
5563,Phalanx,Lynn,Massachusetts,USA,
5735,Control Freaks,Wayland,Massachusetts,USA,
5813,Morpheus,Concord,New Hampshire,USA,
6201,The Highlanders,Somerville,Massachusetts,USA,
6367,The ElectroLights,Dorchester Center,Massachusetts,USA,
6731,Record Robotics,Belmont,Massachusetts,USA,
8626,Cyber Sailors,Scituate,Massachusetts,USA,
9443,Aluminum Panthers,West Newbury,Massachusetts,USA,
10156,Marshy Machines; Sponsored by NASA,Marshfield,Massachusetts,USA,
10912,Dragons,Boston,Massachusetts,USA,
11483,Red Line Robotics,Cambridge,Massachusetts,USA,`;

    try {
      const teams = importTeamsFromCSV(csvContent);
      const mergedTeams = mergeAndSaveTeams(teams);
      storage.saveEventKey('2026marea');
      setEventKey('2026marea');
      setTeamCount(mergedTeams.length);
      setImportStatus(`Successfully imported ${teams.length} teams from North Shore Event! Total: ${mergedTeams.length}`);
      setTimeout(() => setImportStatus(''), 5000);
    } catch (error: any) {
      setImportStatus(`Error: ${error.message}`);
      alert(`Error importing teams: ${error.message}`);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
      </div>

      {/* Scout Profile Section */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Scout Profile</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600">Current profile:</div>
            <div className="text-lg font-semibold text-primary mt-1">
              {scoutProfile || 'Not set'}
            </div>
          </div>
          <button
            onClick={handleChangeProfile}
            className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
          >
            Change Profile
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Your profile name is attached to all matches you scout. This helps track data quality.
        </p>
      </div>

      {/* Game Configuration */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Game Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Normal Ball Range (for error warnings)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  value={config.normalBallRange.min}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      normalBallRange: {
                        ...config.normalBallRange,
                        min: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  value={config.normalBallRange.max}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      normalBallRange: {
                        ...config.normalBallRange,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg"
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSaveConfig}
            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card rounded-lg p-4 border border-border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
        <div className="space-y-3">
          <button
            onClick={handleExportCSV}
            className="w-full py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors"
          >
            Export to CSV
          </button>
          <button
            onClick={handleClearData}
            className="w-full py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
          >
            Clear All Scout Data
          </button>
        </div>
      </div>

      {/* Team Management */}
      <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Team Management</h2>
        <div className="space-y-4">
          <div className="p-3 bg-primary/5 rounded-lg">
            <div className="text-sm font-semibold text-gray-800 mb-1">
              Current Teams: <span className="text-primary">{teamCount}</span>
            </div>
            {importStatus && (
              <div className={`text-xs mt-2 p-2 rounded ${
                importStatus.startsWith('Error') 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}>
                {importStatus}
              </div>
            )}
          </div>

          {/* Default Import */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Import: North Shore Event 2026
            </label>
            <button
              onClick={handleImportDefaultTeams}
              className="w-full py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors"
            >
              Import Teams from North Shore Event (2026marea)
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Imports 38 teams from NE District North Shore Event
            </p>
          </div>

          {/* CSV Import */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import from CSV
            </label>
            <button
              onClick={handleImportFromCSV}
              className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Import Teams from CSV (Paste)
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Paste CSV content with team data
            </p>
          </div>

          {/* TBA API Integration */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              The Blue Alliance API
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tbaApiKey}
                    onChange={(e) => setTbaApiKey(e.target.value)}
                    placeholder="Enter TBA API key"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleSaveTBAKey}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    Save
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Get your API key from{' '}
                  <a
                    href="https://www.thebluealliance.com/account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    thebluealliance.com/account
                  </a>
                </p>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Event Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={eventKey}
                    onChange={(e) => setEventKey(e.target.value)}
                    placeholder="e.g., 2026marea"
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleImportFromTBA}
                    className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm"
                  >
                    Import
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Event key format: YYYY[district]event (e.g., 2026marea)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-card rounded-lg p-4 border-2 border-primary/20 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">About Rebuilt</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            Rebuilt is a scouting system designed for accurate ball counting and match prediction.
          </p>
          <p>
            Built for Team Hyper 69 with a focus on super-accurate counts and good prediction data.
          </p>
        </div>
      </div>
    </div>
  );
}

