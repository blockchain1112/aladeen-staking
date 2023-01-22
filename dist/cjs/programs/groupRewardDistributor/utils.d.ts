import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { AccountMeta, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { GroupRewardDistributorKind } from "./constants";
export declare const withRemainingAccountsForRewardKind: (transaction: Transaction, connection: Connection, wallet: Wallet, groupRewardDistributorId: PublicKey, kind: GroupRewardDistributorKind, rewardMint: PublicKey, isClaimGroupRewards?: boolean) => Promise<AccountMeta[]>;
//# sourceMappingURL=utils.d.ts.map