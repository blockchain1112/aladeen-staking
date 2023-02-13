import { PublicKey } from "@solana/web3.js";

export type UiConfigV2RewardDistributor = {
  label: string;
  duration: number;
  rewardMint: string;
  rewardDistributorPda: string;
  distributorIndex: number;
};

export type RewardV2 = {
  label: string;
  tokenMint: PublicKey;
  emission: number; // token amount
  every: number; // seconds
};

export type UnstakingBonus = {
  label: string;
  tokenMint: PublicKey;
  amount: number; // token amount
};

export type Faction = string;
export type LockupPeriod = {
  name: string;
  duration: number;
  rewards: RewardV2[];
  unstakingBonus: UnstakingBonus | null;
};

export type ConfigV2 = {
  factions: Faction[];
  lockupPeriods: LockupPeriod[];
};

export type UiConfigV2 = {
  [stakePoolId: string]: {
    faction: string;
    rewardDistributors: {
      [duration: string]: UiConfigV2RewardDistributor[];
    };
  };
};

export const testUiConfigV2: UiConfigV2 = {
  ["poolA"]: {
    faction: "",
    rewardDistributors: {
      ["0"]: [
        {
          label: "5 YRD-XP per day",
          duration: 0,
          rewardMint: "",
          rewardDistributorPda: "",
          distributorIndex: 0,
        },
        {
          label: "25 CATSINDEX for 40 day",
          duration: 0,
          rewardMint: "",
          rewardDistributorPda: "",
          distributorIndex: 0,
        },
      ],
      ["60"]: [
        {
          label: "7.5 YRD-XP per day",
          duration: 60,
          rewardMint: "",
          rewardDistributorPda: "",
          distributorIndex: 0,
        },
        {
          label: "25 CATSINDEX for 40 day",
          duration: 0,
          rewardMint: "",
          rewardDistributorPda: "",
          distributorIndex: 0,
        },
      ],
      ["120"]: [
        {
          label: "10 YRD-XP per day",
          duration: 120,
          rewardMint: "",
          rewardDistributorPda: "",
          distributorIndex: 0,
        },
        {
          label: "25 CATSINDEX for 40 day",
          duration: 0,
          rewardMint: "",
          rewardDistributorPda: "",
          distributorIndex: 0,
        },
      ],
    },
  },
};
export const UiConfigV2GetDurations = (
  _config: UiConfigV2,
  stakePoolId: string
) => {
  return Object.keys(_config[stakePoolId]!.rewardDistributors);
};

export const UiConfigV2GetRewardDistributors = (
  _config: UiConfigV2,
  stakePoolId: string,
  duration: number | string
): UiConfigV2RewardDistributor[] => {
  return _config[stakePoolId].rewardDistributors[String(duration)];
};

/*
  - 0: 5 $YRD-XP per day (+ 25 $CATSINDEX for 40 days )
  - 60: 7.5 $YRD-XP per day +125 $LUV upon unstaking (+ 25 $CATSINDEX for 40 days )
  - 120: 10 $YRD-XP per day +375 $LUV upon unstaking (+ 25 $CATSINDEX for 40 days )
*/

export const configV2: ConfigV2 = {
  factions: ["North", "East", "South", "West"],
  lockupPeriods: [
    {
      name: "zero duration",
      duration: 0,
      rewards: [
        {
          label: "YRD-XP",
          tokenMint: new PublicKey(""),
          emission: 5,
          every: 86400,
        },
        {
          label: "CATSINDEX",
          tokenMint: new PublicKey(""),
          emission: 25,
          every: 86400 * 40,
        },
      ],
      unstakingBonus: null,
    },
    {
      name: "60 duration",
      duration: 60,
      rewards: [
        {
          label: "YRD-XP",
          tokenMint: new PublicKey(""),
          emission: 7.5,
          every: 86400,
        },
        {
          label: "CATSINDEX",
          tokenMint: new PublicKey(""),
          emission: 25,
          every: 86400 * 40,
        },
      ],
      unstakingBonus: {
        label: "+125 LUV",
        tokenMint: new PublicKey(""),
        amount: 125,
      },
    },
    {
      name: "120 duration",
      duration: 120,
      rewards: [
        {
          label: "YRD-XP",
          tokenMint: new PublicKey(""),
          emission: 10,
          every: 86400,
        },
        {
          label: "CATSINDEX",
          tokenMint: new PublicKey(""),
          emission: 25,
          every: 86400 * 40,
        },
      ],
      unstakingBonus: {
        label: "+375 LUV",
        tokenMint: new PublicKey(""),
        amount: 125,
      },
    },
  ],
};
