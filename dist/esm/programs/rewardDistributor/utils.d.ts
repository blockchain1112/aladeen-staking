import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { AccountMeta, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { RewardDistributorKind } from "./constants";
export declare const withRemainingAccountsForKind: (transaction: Transaction, connection: Connection, wallet: Wallet, rewardDistributorId: PublicKey, kind: RewardDistributorKind, rewardMint: PublicKey, isClaimRewards?: boolean) => Promise<AccountMeta[]>;
//# sourceMappingURL=utils.d.ts.map