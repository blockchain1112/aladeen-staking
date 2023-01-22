import { withFindOrInitAssociatedTokenAccount } from "@cardinal/common";
import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import { getMintSupply } from "../../utils";
import {
  REWARD_DISTRIBUTOR_ADDRESS,
  REWARD_DISTRIBUTOR_IDL,
} from "../rewardDistributor";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import { STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from ".";
import { findStakeAuthorizationId, findStakeEntryId } from "./pda";
export const remainingAccountsForInitStakeEntry = (
  stakePoolId,
  originalMintId
) => {
  const stakeAuthorizationRecordId = findStakeAuthorizationId(
    stakePoolId,
    originalMintId
  );
  return [
    {
      pubkey: stakeAuthorizationRecordId,
      isSigner: false,
      isWritable: false,
    },
  ];
};
export const withRemainingAccountsForUnstake = async (
  transaction,
  connection,
  wallet,
  stakeEntryId,
  receiptMint
) => {
  if (receiptMint) {
    const stakeEntryReceiptMintTokenAccount =
      await withFindOrInitAssociatedTokenAccount(
        transaction,
        connection,
        receiptMint,
        stakeEntryId,
        wallet.publicKey,
        true
      );
    return [
      {
        pubkey: stakeEntryReceiptMintTokenAccount,
        isSigner: false,
        isWritable: false,
      },
    ];
  } else {
    return [];
  }
};
/**
 * Convenience method to find the stake entry id from a mint
 * NOTE: This will lookup the mint on-chain to get the supply
 * @returns
 */
export const findStakeEntryIdFromMint = async (
  connection,
  wallet,
  stakePoolId,
  originalMintId,
  isFungible
) => {
  if (isFungible === undefined) {
    const supply = await getMintSupply(connection, originalMintId);
    isFungible = supply.gt(new BN(1));
  }
  return findStakeEntryId(wallet, stakePoolId, originalMintId, isFungible);
};
export const getTotalStakeSeconds = async (connection, stakeEntryId) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const stakePoolProgram = new Program(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
  return parsed.totalStakeSeconds;
};
export const getActiveStakeSeconds = async (connection, stakeEntryId) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const stakePoolProgram = new Program(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
    provider
  );
  const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
  const UTCNow = Math.floor(Date.now() / 1000);
  const lastStakedAt = parsed.lastStakedAt.toNumber() || UTCNow;
  return parsed.lastStaker ? new BN(UTCNow - lastStakedAt) : new BN(0);
};
export const getUnclaimedRewards = async (connection, stakePoolId) => {
  var _a;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const rewardDistributor = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const rewardDistributorId = findRewardDistributorId(stakePoolId);
  const parsed = await rewardDistributor.account.rewardDistributor.fetch(
    rewardDistributorId
  );
  return parsed.maxSupply
    ? new BN(
        ((_a = parsed.maxSupply) === null || _a === void 0
          ? void 0
          : _a.toNumber()) - parsed.rewardsIssued.toNumber()
      )
    : new BN(0);
};
export const getClaimedRewards = async (connection, stakePoolId) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const provider = new AnchorProvider(connection, null, {});
  const rewardDistributor = new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
    provider
  );
  const rewardDistributorId = findRewardDistributorId(stakePoolId);
  const parsed = await rewardDistributor.account.rewardDistributor.fetch(
    rewardDistributorId
  );
  return parsed.rewardsIssued;
};
//# sourceMappingURL=utils.js.map
