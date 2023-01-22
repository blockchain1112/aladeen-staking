import { utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  RECEIPT_ENTRY_SEED,
  RECEIPT_MANAGER_ADDRESS,
  RECEIPT_MANAGER_SEED,
  REWARD_RECEIPT_SEED,
} from ".";
/**
 * Finds the reward receipt manager id.
 * @returns
 */
export const findReceiptManagerId = (stakePoolId, name) => {
  return PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode(RECEIPT_MANAGER_SEED),
      stakePoolId.toBuffer(),
      utils.bytes.utf8.encode(name),
    ],
    RECEIPT_MANAGER_ADDRESS
  )[0];
};
/**
 * Finds the reward receipt manager id.
 * @returns
 */
export const findReceiptEntryId = (stakeEntry) => {
  return PublicKey.findProgramAddressSync(
    [utils.bytes.utf8.encode(RECEIPT_ENTRY_SEED), stakeEntry.toBuffer()],
    RECEIPT_MANAGER_ADDRESS
  )[0];
};
/**
 * Finds the reward receipt id.
 * @returns
 */
export const findRewardReceiptId = (receiptManager, receiptEntry) => {
  return PublicKey.findProgramAddressSync(
    [
      utils.bytes.utf8.encode(REWARD_RECEIPT_SEED),
      receiptManager.toBuffer(),
      receiptEntry.toBuffer(),
    ],
    RECEIPT_MANAGER_ADDRESS
  )[0];
};
//# sourceMappingURL=pda.js.map
