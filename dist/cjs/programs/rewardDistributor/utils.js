"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withRemainingAccountsForKind = void 0;
const common_1 = require("@cardinal/common");
const constants_1 = require("./constants");
const withRemainingAccountsForKind = async (transaction, connection, wallet, rewardDistributorId, kind, rewardMint, isClaimRewards) => {
    switch (kind) {
        case constants_1.RewardDistributorKind.Mint: {
            return [];
        }
        case constants_1.RewardDistributorKind.Treasury: {
            const rewardDistributorRewardMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, rewardMint, rewardDistributorId, wallet.publicKey, true);
            const userRewardMintTokenAccountId = await (0, common_1.findAta)(rewardMint, wallet.publicKey, true);
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
exports.withRemainingAccountsForKind = withRemainingAccountsForKind;
//# sourceMappingURL=utils.js.map