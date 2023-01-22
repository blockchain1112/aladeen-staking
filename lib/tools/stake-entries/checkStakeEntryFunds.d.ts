import type { Wallet } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
export declare const commandName = "checkStakeEntryFunds";
export declare const description = "Get all funds of a given mint in a given pool";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    poolIds: string;
    mintId: PublicKey;
};
export declare const handler: (connection: Connection, _wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=checkStakeEntryFunds.d.ts.map