/// <reference types="node" />
import type { Idl } from "@project-serum/anchor";
import type { AllAccountsMap, IdlTypes, TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import type { AccountInfo, Connection, GetAccountInfoConfig, GetProgramAccountsConfig, PublicKey } from "@solana/web3.js";
export type ParsedIdlAccountData<T extends keyof AllAccountsMap<IDL>, IDL extends Idl> = TypeDef<AllAccountsMap<IDL>[T], IdlTypes<IDL>>;
export type ParsedIdlAccount<IDL extends Idl> = {
    [T in keyof AllAccountsMap<IDL>]: {
        type: T;
        parsed: ParsedIdlAccountData<T, IDL>;
    };
};
export type IdlAccountInfo<T extends keyof AllAccountsMap<IDL>, IDL extends Idl> = AccountInfo<Buffer> & ParsedIdlAccount<IDL>[T];
export type IdlAccountData<T extends keyof AllAccountsMap<IDL>, IDL extends Idl> = {
    pubkey: PublicKey;
} & IdlAccountInfo<T, IDL>;
export type NullableIdlAccountInfo<T extends keyof AllAccountsMap<IDL>, IDL extends Idl> = IdlAccountInfo<T, IDL> | (AccountInfo<Buffer> & {
    type: "unknown";
    parsed: null;
});
export type NullableIdlAccountData<T extends keyof AllAccountsMap<IDL>, IDL extends Idl> = {
    pubkey: PublicKey;
} & NullableIdlAccountInfo<T, IDL>;
/**
 * Fetch an account with idl types
 * @param connection
 * @param pubkey
 * @param accountType
 * @param config
 * @returns
 */
export declare const fetchIdlAccount: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(connection: Connection, pubkey: PublicKey, accountType: T, idl: Idl, config?: GetAccountInfoConfig) => Promise<{
    pubkey: PublicKey;
    parsed: TypeDef<AllAccountsMap<IDL>[T], IdlTypes<IDL>>;
    type: T;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
}>;
/**
 * Fetch a possibly null account with idl types of a specific type
 * @param connection
 * @param pubkey
 * @param accountType
 * @param config
 * @param idl
 * @returns
 */
export declare const fetchIdlAccountNullable: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(connection: Connection, pubkey: PublicKey, accountType: T, idl: Idl, config?: GetAccountInfoConfig) => Promise<{
    pubkey: PublicKey;
    parsed: TypeDef<AllAccountsMap<IDL>[T], IdlTypes<IDL>>;
    type: T;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
} | null>;
/**
 * Decode an account with idl types of a specific type
 * @param accountInfo
 * @param accountType
 * @param idl
 * @returns
 */
export declare const decodeIdlAccount: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(accountInfo: AccountInfo<Buffer>, accountType: T, idl: Idl) => {
    type: T;
    parsed: TypeDef<AllAccountsMap<IDL>[T], IdlTypes<IDL>>;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
};
/**
 * Try to decode an account with idl types of specific type
 * @param accountInfo
 * @param accountType
 * @param idl
 * @returns
 */
export declare const tryDecodeIdlAccount: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(accountInfo: AccountInfo<Buffer>, accountType: T, idl: Idl) => {
    type: T;
    parsed: TypeDef<AllAccountsMap<IDL>[T], IdlTypes<IDL>>;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
} | {
    type: string;
    parsed: null;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
};
/**
 * Decode an idl account of unknown type
 * @param accountInfo
 * @param idl
 * @returns
 */
export declare const decodeIdlAccountUnknown: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(accountInfo: AccountInfo<Buffer> | null, idl: Idl) => AccountInfo<Buffer> & ParsedIdlAccount<IDL>[T];
/**
 * Try to decode an account with idl types of unknown type
 * @param accountInfo
 * @param idl
 * @returns
 */
export declare const tryDecodeIdlAccountUnknown: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(accountInfo: AccountInfo<Buffer>, idl: Idl) => NullableIdlAccountInfo<T, IDL>;
/**
 * Get program accounts of a specific idl type
 * @param connection
 * @param accountType
 * @param config
 * @param programId
 * @param idl
 * @returns
 */
export declare const getProgramIdlAccounts: <T extends import("@project-serum/anchor/dist/cjs/program/namespace/types").AllAccounts<IDL>["name"], IDL extends Idl>(connection: Connection, accountType: T, programId: PublicKey, idl: Idl, config?: GetProgramAccountsConfig) => Promise<({
    type: T;
    parsed: TypeDef<AllAccountsMap<IDL>[T], IdlTypes<IDL>>;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
    pubkey: PublicKey;
} | {
    type: string;
    parsed: null;
    executable: boolean;
    owner: PublicKey;
    lamports: number;
    data: Buffer;
    rentEpoch?: number | undefined;
    pubkey: PublicKey;
})[]>;
//# sourceMappingURL=accounts.d.ts.map