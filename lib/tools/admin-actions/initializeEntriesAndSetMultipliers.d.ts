/// <reference types="bn.js" />
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
export declare const commandName = "initializeEntriesAndSetMultipliers";
export declare const description = "Initialize all entries and optionally set multipliers for reward entries. Optionalls use metadataRules for complex multiplier rules";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    distributorId: import("bn.js");
    stakePoolId: PublicKey;
    fungible: boolean;
    initEntries: EntryData[];
    metadataRules: {
        traitType: string;
        value: string;
        multiplier: number;
    }[] | undefined;
    batchSize: number;
    parallelBatchSize: number;
};
type EntryData = {
    mintId: PublicKey;
    multiplier?: number;
};
export declare const handler: (connection: Connection, wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
export {};
//# sourceMappingURL=initializeEntriesAndSetMultipliers.d.ts.map