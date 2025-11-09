export type SubscriptionGrowthItem = {
  appKey: string;
  teamName: string;
  growth: number;
  rank: number;
  reward: number;
};

export type PhotonTopItem = {
  appKey: string;
  teamName: string;
  photons: number;
  rank: number;
  reward: number;
};

export type Milestones = {
  subscription500: { appKey: string; teamName: string; subscriptions: number; reward?: number }[];
  photon10000: { appKey: string; teamName: string; photons: number; reward?: number }[];
};

export type LeaderboardData = {
  generatedAt: string;
  sourceFile?: string;
  weekRange?: string;
  subscriptionGrowthAvailable: boolean;
  subscriptionGrowthTop3: SubscriptionGrowthItem[];
  photonTop3: PhotonTopItem[];
  milestones: Milestones;
};

