import { Program } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { ParsedIdlAccountData } from "../../accounts";
import * as GROUP_REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_group_reward_distributor";
export declare const GROUP_REWARD_DISTRIBUTOR_ADDRESS: PublicKey;
export declare const GROUP_REWARD_MANAGER: PublicKey;
export declare const GROUP_REWARD_ENTRY_SEED = "group-reward-entry";
export declare const GROUP_REWARD_COUNTER_SEED = "group-reward-counter";
export declare const GROUP_REWARD_DISTRIBUTOR_SEED = "group-reward-distributor";
export type GROUP_REWARD_DISTRIBUTOR_PROGRAM = GROUP_REWARD_DISTRIBUTOR_TYPES.CardinalGroupRewardDistributor;
export declare const GROUP_REWARD_DISTRIBUTOR_IDL: GROUP_REWARD_DISTRIBUTOR_TYPES.CardinalGroupRewardDistributor;
export type GroupRewardEntryData = ParsedIdlAccountData<"groupRewardEntry", GROUP_REWARD_DISTRIBUTOR_PROGRAM>;
export type GroupRewardCounterData = ParsedIdlAccountData<"groupRewardCounter", GROUP_REWARD_DISTRIBUTOR_PROGRAM>;
export type GroupRewardDistributorData = ParsedIdlAccountData<"groupRewardDistributor", GROUP_REWARD_DISTRIBUTOR_PROGRAM>;
export declare enum GroupRewardDistributorKind {
    Mint = 1,
    Treasury = 2
}
export declare const toGroupRewardDistributorKind: (value: {
    [key: string]: any;
}) => number;
export declare enum GroupRewardDistributorMetadataKind {
    NoRestriction = 1,
    UniqueNames = 2,
    UniqueSymbols = 3
}
export declare const toGroupRewardDistributorMetadataKind: (value: {
    [key: string]: any;
}) => number;
export declare enum GroupRewardDistributorPoolKind {
    NoRestriction = 1,
    AllFromSinglePool = 2,
    EachFromSeparatePool = 3
}
export declare const toGroupRewardDistributorPoolKind: (value: {
    [key: string]: any;
}) => number;
export declare const groupRewardDistributorProgram: (connection: Connection, wallet?: Wallet, confirmOptions?: ConfirmOptions) => Program<GROUP_REWARD_DISTRIBUTOR_TYPES.CardinalGroupRewardDistributor>;
//# sourceMappingURL=constants.d.ts.map