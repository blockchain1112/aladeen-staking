import { utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  GROUP_REWARD_COUNTER_SEED,
  GROUP_REWARD_DISTRIBUTOR_ADDRESS,
  GROUP_REWARD_DISTRIBUTOR_SEED,
  GROUP_REWARD_ENTRY_SEED,
} from "./constants";
/**
 * Finds the group reward entry id.
 * @returns
 */
export const findGroupRewardEntryId = (
  groupRewardDistributorId,
  groupEntryId
) => {
  return PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode(GROUP_REWARD_ENTRY_SEED),
      groupRewardDistributorId.toBuffer(),
      groupEntryId.toBuffer(),
    ],
    GROUP_REWARD_DISTRIBUTOR_ADDRESS
  )[0];
};
/**
 * Finds the group reward entry id.
 * @returns
 */
export const findGroupRewardCounterId = (
  groupRewardDistributorId,
  authority
) => {
  return PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode(GROUP_REWARD_COUNTER_SEED),
      groupRewardDistributorId.toBuffer(),
      authority.toBuffer(),
    ],
    GROUP_REWARD_DISTRIBUTOR_ADDRESS
  )[0];
};
/**
 * Finds the group reward distributor id.
 * @returns
 */
export const findGroupRewardDistributorId = (id) => {
  return PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode(GROUP_REWARD_DISTRIBUTOR_SEED), id.toBuffer()],
    GROUP_REWARD_DISTRIBUTOR_ADDRESS
  )[0];
};
//# sourceMappingURL=pda.js.map
