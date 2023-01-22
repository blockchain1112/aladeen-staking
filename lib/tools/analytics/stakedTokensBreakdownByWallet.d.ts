import type { Wallet } from "@project-serum/anchor";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
export declare const commandName = "stakedTokensBreakdownByWallet";
export declare const description = "Get a breakdown of all staked tokens in a pool by wallet";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    poolId: PublicKey;
};
export declare const handler: (connection: Connection, _wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=stakedTokensBreakdownByWallet.d.ts.map