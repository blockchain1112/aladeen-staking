/// <reference types="bn.js" />
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
export declare const commandName = "reclaimFunds";
export declare const description = "Reclaim funds from a stake pool as the pool authority";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    distributorId: import("bn.js");
    stakePoolId: PublicKey;
    amount: import("bn.js");
};
export declare const handler: (connection: Connection, wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=reclaimFunds.d.ts.map