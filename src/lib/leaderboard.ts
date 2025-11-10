import fs from 'node:fs/promises';
import path from 'node:path';
import type { LeaderboardData } from '@/types/leaderboard';

// Server-side loader for the static JSON in public/data/leaderboard.json
// Do NOT use a static import from public/, because the file may not exist at build time on Vercel
// (generated weekly by a local script). Read from the filesystem at runtime and fall back gracefully.
export async function getLeaderboardData(): Promise<LeaderboardData> {
  try {
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      'leaderboard.json'
    );
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LeaderboardData>;

    return {
      generatedAt: parsed.generatedAt ?? new Date().toISOString(),
      sourceFile: parsed.sourceFile,
      weekRange: parsed.weekRange,
      subscriptionGrowthAvailable: Boolean(parsed.subscriptionGrowthAvailable),
      subscriptionGrowthTop3: parsed.subscriptionGrowthTop3 ?? [],
      photonTop3: parsed.photonTop3 ?? [],
      milestones: {
        subscription500: parsed.milestones?.subscription500 ?? [],
        photon10000: parsed.milestones?.photon10000 ?? [],
      },
    } satisfies LeaderboardData;
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
