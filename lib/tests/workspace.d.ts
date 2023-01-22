import { Wallet } from "@project-serum/anchor";
import { Connection, Keypair } from "@solana/web3.js";
export type CardinalProvider = {
    connection: Connection;
    wallet: Wallet;
};
export declare function getConnection(): Connection;
export declare function newAccountWithLamports(connection: Connection, lamports?: number, keypair?: Keypair): Promise<Keypair>;
export declare function getProvider(): Promise<CardinalProvider>;
//# sourceMappingURL=workspace.d.ts.map