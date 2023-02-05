import { PublicKey } from "@solana/web3.js";

export type Reward = {
  label: string;
  tokenMint: PublicKey;
  emission: number;
  every: number;
};

export type Scope = {
  label: string;
  rewards: Reward[];
};

export type Config = {
  nftCreator: PublicKey;
  durations: number[];
  unstakeTaxMint: PublicKey;
  scopes: Scope[];
};

/*
None - 5 $YRD-XP per day (+ 25 $CATSINDEX for 40 days )
3 Month Lock - 7.5 $YRD-XP per day +125 $LUV upon unstaking  (+ 25 $CATSINDEX for 40 days )
6 Month Lock - 10 $YRD-XP per day +375 $LUV upon unstaking  (+ 25 $CATSINDEX for 40 days )
*/

export const config: Config = {
  nftCreator: new PublicKey("4tQvcbRFcYKBsJLFsrVyZs2Jq8UExMoaHWWCXhWG452L"),
  durations: [0, 3, 6],
  unstakeTaxMint: new PublicKey("3orR2FBUEwRdEvHCKCG4JKC16v6VTq239BgxM79yZGv9"),
  scopes: [
    {
      label: "north",
      rewards: [
        {
          label: "reward zero",
          tokenMint: new PublicKey(
            "6syXDav5RcG9h7frde77j3H6UProY5y5dteMCeRUfo5S"
          ),
          emission: 50000,
          every: 60,
        },
        {
          label: "reward one",
          tokenMint: new PublicKey(
            "X9uHaEWq3aMEjg9SDNpKvzDQWpwS4HtHPvfCDX2sp49"
          ),
          emission: 10000,
          every: 60,
        },
        {
          label: "reward two",
          tokenMint: new PublicKey(
            "HamaVNqzjA8UtFzFjcpAwdgPJBFAvHa553KnikdyqTV8"
          ),
          emission: 1000,
          every: 60,
        },
      ],
    },
  ],
};

export type UiConfigRewardDistributor = {
  label: string;
  rewardMint: string;
  rewardDistributorPda: string;
  distributorIndex: number;
};

export type UiConfig = {
  [stakePoolId: string]: {
    rewardDistributors: UiConfigRewardDistributor[];
  };
};
