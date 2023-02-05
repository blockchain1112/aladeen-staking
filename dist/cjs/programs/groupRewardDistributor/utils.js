"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRemainingAccountsForRewardKind = void 0;
const common_1 = require("@cardinal/common");
const constants_1 = require("./constants");
const withRemainingAccountsForRewardKind = async (transaction, connection, wallet, groupRewardDistributorId, kind, rewardMint, isClaimGroupRewards) => {
    switch (kind) {
        case constants_1.GroupRewardDistributorKind.Mint: {
            return [];
        }
        case constants_1.GroupRewardDistributorKind.Treasury: {
            const rewardDistributorGroupRewardMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, rewardMint, groupRewardDistributorId, wallet.publicKey, true);
            const userGroupRewardMintTokenAccountId = await (0, common_1.findAta)(rewardMint, wallet.publicKey, true);
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
exports.withRemainingAccountsForRewardKind = withRemainingAccountsForRewardKind;
//# sourceMappingURL=utils.js.map