import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";

import type { ParsedIdlAccountData } from "../../accounts";
import * as REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_reward_distributor";

export const REWARD_DISTRIBUTOR_ADDRESS = new PublicKey(
  "49dYrnx67y5zZnm3DZuJtqyrH6A5rHiNUUQ2gvBzSeT7"
);
export const REWARD_MANAGER = new PublicKey(
  "5nx4MybNcPBut1yMBsandykg2n99vQGAqXR3ymEXzQze"
);

export const REWARD_ENTRY_SEED = "reward-entry";

export const REWARD_AUTHORITY_SEED = "reward-authority";
export const REWARD_DISTRIBUTOR_SEED = "reward-distributor";

export type REWARD_DISTRIBUTOR_PROGRAM =
  REWARD_DISTRIBUTOR_TYPES.CardinalRewardDistributor;

export const REWARD_DISTRIBUTOR_IDL = REWARD_DISTRIBUTOR_TYPES.IDL;

export type RewardEntryData = ParsedIdlAccountData<
  "rewardEntry",
  REWARD_DISTRIBUTOR_PROGRAM
>;
export type RewardAuthorityData = ParsedIdlAccountData<
  "rewardAuthority",
  REWARD_DISTRIBUTOR_PROGRAM
>;
export type RewardDistributorData = ParsedIdlAccountData<
  "rewardDistributor",
  REWARD_DISTRIBUTOR_PROGRAM
>;

export enum RewardDistributorKind {
  Mint = 1,
  Treasury = 2,
}

export const rewardDistributorProgram = (
  connection: Connection,
  wallet?: Wallet,
  confirmOptions?: ConfirmOptions
) => {
  return new Program<REWARD_DISTRIBUTOR_PROGRAM>(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    new AnchorProvider(
      connection,
      wallet ?? emptyWallet(Keypair.generate().publicKey),
      confirmOptions ?? {}
    )
  );
};
