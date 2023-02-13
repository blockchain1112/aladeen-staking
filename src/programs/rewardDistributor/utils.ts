import {
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type {
  AccountMeta,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

import { RewardDistributorKind } from "./constants";

export const withRemainingAccountsForKind = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  rewardDistributorId: PublicKey,
  kind: RewardDistributorKind,
  rewardMint: PublicKey,
  isClaimRewards?: boolean,
  createRewardDistributorMintTokenAccount: boolean = false
): Promise<AccountMeta[]> => {
  switch (kind) {
    case RewardDistributorKind.Mint: {
      return [];
    }
    case RewardDistributorKind.Treasury: {
      const rewardDistributorRewardMintTokenAccountId =
        createRewardDistributorMintTokenAccount
          ? await withFindOrInitAssociatedTokenAccount(
            transaction,
            connection,
            rewardMint,
            rewardDistributorId,
            wallet.publicKey,
            true
          )
          : !createRewardDistributorMintTokenAccount
            ? await findAta(rewardMint, rewardDistributorId, true)
            : await withFindOrInitAssociatedTokenAccount(
              transaction,
              connection,
              rewardMint,
              rewardDistributorId,
              wallet.publicKey,
              true
            );

      const userRewardMintTokenAccountId = await findAta(
        rewardMint,
        wallet.publicKey,
        true
      );
      return [
        {
          pubkey: rewardDistributorRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
      ].concat(
        !isClaimRewards
          ? [
            {
              pubkey: userRewardMintTokenAccountId,
              isSigner: false,
              isWritable: true,
            },
          ]
          : []
      );
    }
    default:
      return [];
  }
};
