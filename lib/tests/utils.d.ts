import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection, PublicKey, Signer } from "@solana/web3.js";
import { Keypair, Transaction } from "@solana/web3.js";
export declare function delay(ms: number): Promise<unknown>;
export declare function newAccountWithLamports(connection: Connection, lamports?: number, keypair?: Keypair): Promise<Keypair>;
export declare const createMint: (connection: Connection, wallet: Wallet, config?: MintConfig) => Promise<[PublicKey, PublicKey]>;
export type MintConfig = {
    target?: PublicKey;
    amount?: number;
    decimals?: number;
};
export declare const createMintTx: (connection: Connection, mintId: PublicKey, authority: PublicKey, config?: MintConfig) => Promise<[Transaction, PublicKey]>;
export declare const createMasterEdition: (connection: Connection, wallet: Wallet, config?: {
    target?: PublicKey;
}) => Promise<[PublicKey, PublicKey]>;
export declare const createMasterEditionTx: (connection: Connection, mintId: PublicKey, authority: PublicKey, config?: {
    target?: PublicKey;
}) => Promise<Transaction>;
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