import { utils, BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { REWARD_AUTHORITY_SEED, REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_SEED, REWARD_ENTRY_SEED, } from ".";
/**
 * Finds the reward entry id.
 * @returns
 */
export const findRewardEntryId = (rewardDistributorId, stakeEntryId) => {
    return PublicKey.findProgramAddressSync([
        utils.bytes.utf8.encode(REWARD_ENTRY_SEED),
        rewardDistributorId.toBuffer(),
        stakeEntryId.toBuffer(),
    ], REWARD_DISTRIBUTOR_ADDRESS)[0];
};
/**
 * Finds the reward distributor id.
 * @returns
 */
export const findRewardDistributorId = (stakePoolId, id, duration) => {
    return PublicKey.findProgramAddressSync([
        Buffer.from(REWARD_DISTRIBUTOR_SEED),
        stakePoolId.toBuffer(),
        id.toArrayLike(Buffer, "le", 1),
        new BN(duration).toArrayLike(Buffer, "le", 4),
    ], REWARD_DISTRIBUTOR_ADDRESS)[0];
};
/**
 * Finds the reward distributor id.
 * @returns
 */
export const findRewardAuthority = (authority) => {
    return PublicKey.findProgramAddressSync([utils.bytes.utf8.encode(REWARD_AUTHORITY_SEED), authority.toBuffer()], REWARD_DISTRIBUTOR_ADDRESS)[0];
};
//# sourceMappingURL=pda.js.map