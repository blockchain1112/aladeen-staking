import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, Signer, Transaction } from "@solana/web3.js";
import { Keypair, PublicKey } from "@solana/web3.js";
export type StakePoolKind = "v1" | "v2" | "unknown";
export declare const stakePoolKind: (connection: Connection, stakePoolAddress: PublicKey) => Promise<StakePoolKind>;
export declare function chunkArray<T>(arr: T[], size: number): T[][];
export declare const keypairFrom: (s: string, n?: string) => Keypair;
export declare const publicKeyFrom: (s: string, n?: string) => PublicKey;
export declare function executeTransaction(connection: Connection, tx: Transaction, wallet: Wallet, config?: {
    signers?: Signer[];
    silent?: boolean;
}): Promise<string>;
export declare function executeTransactions(connection: Connection, txs: Transaction[], wallet: Wallet, config?: {
    signers?: Signer[];
    silent?: boolean;
}): Promise<string[]>;
export declare const handleError: (e: any) => void;
//# sourceMappingURL=utils.d.ts.map