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
            "A2hyKqC16YBYcUT74bn8pM5WRoLxzvVne5zfecV6Xr9b"
          ),
          emission: 50,
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

