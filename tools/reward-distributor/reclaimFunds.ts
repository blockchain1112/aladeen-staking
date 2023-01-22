import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import type { Connection } from "@solana/web3.js";
import { PublicKey, Transaction } from "@solana/web3.js";
import { BN } from "bn.js";

import { executeTransaction } from "../../src";
import { withReclaimFunds } from "../../src/programs/rewardDistributor/transaction";

export const commandName = "reclaimFunds";
export const description =
  "Reclaim funds from a stake pool as the pool authority";

export const getArgs = (_connection: Connection, _wallet: Wallet) => ({
  // rewards distributor index
  distributorId: new BN(0),
  // stake pool id to reclaim funds from
  stakePoolId: new PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"),
  // amount of tokens to reclaim
  // WARNING: natural amount must account for mint decimals
  amount: new BN(0),
});

export const handler = async (
  connection: Connection,
  wallet: Wallet,
  args: ReturnType<typeof getArgs>
) => {
  const transaction = await withReclaimFunds(
    new Transaction(),
    connection,
    wallet,
    {
      distributorId: args.distributorId,
      stakePoolId: args.stakePoolId,
      amount: args.amount,
    }
  );
  const txid = await executeTransaction(connection, wallet, transaction, {});
  console.log(`[success] https://explorer.solana.com/tx/${txid}`);
};
