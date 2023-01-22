import { Program } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { ParsedIdlAccountData } from "../../accounts";
import * as REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_reward_distributor";
export declare const REWARD_DISTRIBUTOR_ADDRESS: PublicKey;
export declare const REWARD_MANAGER: PublicKey;
export declare const REWARD_ENTRY_SEED = "reward-entry";
export declare const REWARD_DISTRIBUTOR_SEED = "reward-distributor";
export type REWARD_DISTRIBUTOR_PROGRAM = REWARD_DISTRIBUTOR_TYPES.CardinalRewardDistributor;
export declare const REWARD_DISTRIBUTOR_IDL: REWARD_DISTRIBUTOR_TYPES.CardinalRewardDistributor;
export type RewardEntryData = ParsedIdlAccountData<"rewardEntry", REWARD_DISTRIBUTOR_PROGRAM>;
export type RewardDistributorData = ParsedIdlAccountData<"rewardDistributor", REWARD_DISTRIBUTOR_PROGRAM>;
export declare enum RewardDistributorKind {
    Mint = 1,
    Treasury = 2
}
export declare const rewardDistributorProgram: (connection: Connection, wallet?: Wallet, confirmOptions?: ConfirmOptions) => Program<REWARD_DISTRIBUTOR_TYPES.CardinalRewardDistributor>;
//# sourceMappingURL=constants.d.ts.map