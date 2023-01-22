import type { Wallet } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";
export declare const commandName = "getAllStakePools";
export declare const description = "Get stake pool IDs";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {};
export declare const handler: (connection: Connection, _wallet: Wallet, _args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=getAllStakePools.d.ts.map