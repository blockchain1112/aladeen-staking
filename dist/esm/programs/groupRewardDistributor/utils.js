import { findAta, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import { GroupRewardDistributorKind } from "./constants";
export const withRemainingAccountsForRewardKind = async (transaction, connection, wallet, groupRewardDistributorId, kind, rewardMint, isClaimGroupRewards) => {
    switch (kind) {
        case GroupRewardDistributorKind.Mint: {
            return [];
        }
        case GroupRewardDistributorKind.Treasury: {
            const rewardDistributorGroupRewardMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, rewardMint, groupRewardDistributorId, wallet.publicKey, true);
            const userGroupRewardMintTokenAccountId = await findAta(rewardMint, wallet.publicKey, true);
            return [
                {
                    pubkey: rewardDistributorGroupRewardMintTokenAccountId,
                    isSigner: false,
                    isWritable: true,
                },
            ].concat(!isClaimGroupRewards
                ? [
                    {
                        pubkey: userGroupRewardMintTokenAccountId,
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