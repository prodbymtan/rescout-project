'use client';

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Predefined scout profiles - can be customized
const SCOUT_PROFILES = [
  'Tan',
  'Daniel',
  'Alex',
  'Stephanie',
  'James',
  'Chris',
  'Joe',
  'Anzar',
];

function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "/";
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const profileName = useCustom ? customName.trim() : selectedProfile;
    
    if (!profileName) {
      alert("Please select or enter a profile name");
      return;
    }

    // Set profile cookie
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ profile: profileName }),
    });

    if (response.ok) {
      router.push(from);
    } else {
      alert("Failed to set profile. Please try again.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="border border-border rounded-xl p-8 min-w-[320px] max-w-md w-full bg-card shadow-lg"
      >
        <h1 className="text-2xl font-bold text-primary mb-2">Select Scout Profile</h1>
        <p className="text-sm text-gray-600 mb-6">
          Choose your profile so we can track who is scouting which matches.
        </p>

        {/* Predefined Profiles */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select your name:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SCOUT_PROFILES.map((profile) => (
              <button
                key={profile}
                type="button"
                onClick={() => {
                  setSelectedProfile(profile);
                  setUseCustom(false);
                }}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  selectedProfile === profile && !useCustom
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border hover:border-primary/50 text-gray-700"
                }`}
              >
                {profile}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Name Option */}
        <div className="mb-6">
          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => {
                setUseCustom(e.target.checked);
                if (e.target.checked) {
                  setSelectedProfile("");
                }
              }}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Use custom name
            </span>
          </label>
          {useCustom && (
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your name"
              required={useCustom}
              className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Continue
        </button>
      </form>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-600">Loading...</div>
      </main>
    }>
      <ProfileForm />
    </Suspense>
  );
}
