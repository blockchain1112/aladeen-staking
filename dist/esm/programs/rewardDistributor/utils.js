import { findAta, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import { RewardDistributorKind } from "./constants";
export const withRemainingAccountsForKind = async (transaction, connection, wallet, rewardDistributorId, kind, rewardMint, isClaimRewards) => {
    switch (kind) {
        case RewardDistributorKind.Mint: {
            return [];
        }
        case RewardDistributorKind.Treasury: {
            const rewardDistributorRewardMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, rewardMint, rewardDistributorId, wallet.publicKey, true);
            const userRewardMintTokenAccountId = await findAta(rewardMint, wallet.publicKey, true);
            return [
                {
                    pubkey: rewardDistributorRewardMintTokenAccountId,
                    isSigner: false,
                    isWritable: true,
                },
            ].concat(!isClaimRewards
                ? [
                    {
                        pubkey: userRewardMintTokenAccountId,
                        isSigner: false,
                        isWritable: true,
                    },
                ]
                : []);
        }
        default:
            return [];
    }
};
//# sourceMappingURL=utils.js.map