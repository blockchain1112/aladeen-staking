import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
export declare const commandName = "updateMultipliersOnRules";
export declare const description = "Update reward multipliers for mints based on traits or other rules. (must be pool authority)\nRules options:\n  volume - (if user stakes 2+ token, set token multpliers to 'X', if user staked 5+ token, set token multiplier to 'Y')\n  metadata - (if token has metadata attribute equal to specify value, set 'X' multiplier)\n  combination - (if user has to stake A,B,C mints together, token get 'X' multiplier, else set to zero)";
export declare const getArgs: (_connection: Connection, _wallet: Wallet) => {
    distributorId: BN;
    stakePoolId: PublicKey;
    updateRules: UpdateRule[];
    batchSize: number;
};
export type UpdateRule = {
    volume?: {
        volumeUpperBound: number;
        multiplier: number;
    }[];
    metadata?: {
        traitType: string;
        value: string;
        multiplier: number;
    }[];
    combination?: {
        primaryMint: PublicKey[];
        secondaryMints: PublicKey[];
        multiplier: number;
    };
};
export declare const handler: (connection: Connection, wallet: Wallet, args: ReturnType<typeof getArgs>) => Promise<void>;
//# sourceMappingURL=updateMultipliersOnRules.d.ts.map