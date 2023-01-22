import type { Wallet } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
export declare const commandName = "transferTokens";
export declare const description = "Add tokens to reward distributor";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    mint: PublicKey;
    rewardDistributorId: PublicKey;
    amount: number;
    decimals: number;
};
export declare const handler: (connection: Connection, wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=transferTokens.d.ts.map