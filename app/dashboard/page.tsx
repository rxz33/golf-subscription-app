"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import ScoreForm from "@/components/ScoreForm";
import ScoresList from "@/components/ScoresList";
import SubscriptionStatus from "@/components/SubscriptionStatus";
import type { GolfScore, AuthUser } from "@/lib/types";

const DEFAULT_CHARITY = "1";
const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export default function Dashboard() {
  const [user, setUser] = useState<Pick<AuthUser, "email"> | null>(null);
  const [scores, setScores] = useState<GolfScore[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionStatus>(SUBSCRIPTION_STATUS.ACTIVE);
  const [selectedCharity, setSelectedCharity] = useState(DEFAULT_CHARITY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        // Auth is guaranteed by layout — just fetch the user for display
        const { data: { user } } = await supabase.auth.getUser();

        const [scoresRes, subRes, charityRes] = await Promise.all([
          fetch("/api/scores", { credentials: "include" }),
          fetch("/api/subscription", { credentials: "include" }),
          fetch("/api/charity", { credentials: "include" }),
        ]);

        if (!scoresRes.ok || !subRes.ok || !charityRes.ok) {
          throw new Error("One or more requests failed. Please refresh.");
        }

        const [scoresData, subData, charityData] = await Promise.all([
          scoresRes.json(),
          subRes.json(),
          charityRes.json(),
        ]);

        if (!cancelled) {
          setUser(user ? { email: user.email } : null);
          setScores(scoresData.scores ?? []);
          setSubscription(subData.status ?? SUBSCRIPTION_STATUS.ACTIVE);
          setSelectedCharity(charityData.charity ?? DEFAULT_CHARITY);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddScore = useCallback(async (score: number) => {
    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, charity: selectedCharity }),
      });

      if (!res.ok) throw new Error("Failed to add score.");

      const data = await res.json();
      setScores(data.scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add score.");
    }
  }, [selectedCharity]);

  const handleCharityChange = useCallback(async (charityId: string) => {
    const previous = selectedCharity;
    setSelectedCharity(charityId);

    try {
      const res = await fetch("/api/charity", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charity: charityId }),
      });

      if (!res.ok) throw new Error("Failed to update charity.");
    } catch (err) {
      setSelectedCharity(previous);
      setError(err instanceof Error ? err.message : "Failed to update charity.");
    }
  }, [selectedCharity]);

  const handleToggleSubscription = useCallback(async () => {
    const previous = subscription;
    const newStatus =
      subscription === SUBSCRIPTION_STATUS.ACTIVE
        ? SUBSCRIPTION_STATUS.INACTIVE
        : SUBSCRIPTION_STATUS.ACTIVE;

    setSubscription(newStatus);

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update subscription.");
    } catch (err) {
      setSubscription(previous);
      setError(err instanceof Error ? err.message : "Failed to update subscription.");
    }
  }, [subscription]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">

        {error && (
          <div className="mb-6 flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 font-bold"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {user?.email}
          </h1>
          <p className="text-gray-600">
            Track your golf scores and support charities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <SubscriptionStatus
              status={subscription}
              onToggle={handleToggleSubscription}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <ScoreForm
              onAddScore={handleAddScore}
              selectedCharity={selectedCharity}
              onCharityChange={handleCharityChange}
            />
            <ScoresList scores={scores} />
          </div>
        </div>
      </div>
    </main>
  );
}