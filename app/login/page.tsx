'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams?.get("from") || "/";
  const error = searchParams?.get("error") === "1";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <form
        method="POST"
        action="/api/login"
        className="border border-border rounded-xl p-8 min-w-[320px] max-w-md w-full bg-card shadow-lg"
      >
        <h1 className="text-2xl font-bold text-primary mb-2">Scouting Login</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the team access code to use the scouting app.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            Incorrect access code. Please try again.
          </div>
        )}

        {/* Where to redirect after login */}
        <input type="hidden" name="from" value={from} />

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700 mb-1 block">
            Access code
          </span>
          <input
            name="password"
            type="password"
            placeholder="Enter code"
            required
            autoFocus
            className="w-full px-3 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </label>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Enter
        </button>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Hint: ask Tan or drive coach for the code.
        </p>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-gray-600">Loading...</div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
