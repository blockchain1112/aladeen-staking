/// <reference types="bn.js" />
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
export declare const commandName = "claimRewardsForUsers";
export declare const description = "Claim all rewards for users in the given pool (must be pool authority) - Cost 0.002 per token";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    distributorId: BN;
    stakePoolId: PublicKey;
    batchSize: number;
    parallelTransactions: number;
};
export declare const handler: (connection: Connection, wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=claimRewardsForUsers.d.ts.map