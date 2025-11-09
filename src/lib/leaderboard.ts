import type { LeaderboardData } from '@/types/leaderboard';

// Server-side loader for the static JSON in public/data/leaderboard.json
// Uses a dynamic import so Next can bundle it at build time when present,
// and we can still return a graceful placeholder when missing in dev.
export async function getLeaderboardData(): Promise<LeaderboardData> {
  try {
    const mod = (await import('@/public/data/leaderboard.json')) as { default: LeaderboardData };
    return mod.default;
  } catch {
    // Placeholder when file hasn't been generated yet
    return {
      generatedAt: new Date().toISOString(),
      subscriptionGrowthAvailable: false,
      subscriptionGrowthTop3: [],
      photonTop3: [],
      milestones: { subscription500: [], photon10000: [] },
    };
  }
}

