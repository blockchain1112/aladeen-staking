import { Program } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { ConfirmOptions, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import type { ParsedIdlAccountData } from "../../accounts";
import * as STAKE_POOL_TYPES from "../../idl/cardinal_stake_pool";
export declare const STAKE_POOL_ADDRESS: PublicKey;
export declare const STAKE_POOL_SEED = "stake-pool";
export declare const STAKE_ENTRY_SEED = "stake-entry";
export declare const GROUP_ENTRY_SEED = "group-entry";
export declare const IDENTIFIER_SEED = "identifier";
export declare const STAKE_AUTHORIZATION_SEED = "stake-authorization";
export declare const STAKE_BOOSTER_SEED = "stake-booster";
export declare const AUTHORITY_OFFSET = 25;
export declare const STAKER_OFFSET = 82;
export declare const GROUP_STAKER_OFFSET: number;
export declare const POOL_OFFSET = 9;
export type STAKE_POOL_PROGRAM = STAKE_POOL_TYPES.CardinalStakePool;
export declare const STAKE_POOL_IDL: STAKE_POOL_TYPES.CardinalStakePool;
export type StakePoolData = ParsedIdlAccountData<"stakePool", STAKE_POOL_PROGRAM>;
export type StakeEntryData = ParsedIdlAccountData<"stakeEntry", STAKE_POOL_PROGRAM>;
export type GroupStakeEntryData = ParsedIdlAccountData<"groupStakeEntry", STAKE_POOL_PROGRAM>;
export type IdentifierData = ParsedIdlAccountData<"identifier", STAKE_POOL_PROGRAM>;
export type StakeAuthorizationData = ParsedIdlAccountData<"stakeAuthorizationRecord", STAKE_POOL_PROGRAM>;
export type StakeBoosterData = ParsedIdlAccountData<"stakeBooster", STAKE_POOL_PROGRAM>;
export declare const STAKE_BOOSTER_PAYMENT_MANAGER_NAME = "cardinal-stake-booster";
export declare const STAKE_BOOSTER_PAYMENT_MANAGER: PublicKey;
export declare enum ReceiptType {
    Original = 1,
    Receipt = 2,
    None = 3
}
export declare const stakePoolProgram: (connection: Connection, wallet?: Wallet, confirmOptions?: ConfirmOptions) => Program<STAKE_POOL_TYPES.CardinalStakePool>;
//# sourceMappingURL=constants.d.ts.map