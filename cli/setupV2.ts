// this script will parse a config
import fs from "fs/promises";

import { Wallet, BN } from "@project-serum/anchor";
import {
  Transaction,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Signer,
  sendAndConfirmRawTransaction,
  SendTransactionError,
} from "@solana/web3.js";

import { createStakePool } from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";

import { configV2, UiConfigV2 } from "./configV2";

export type CardinalProvider = {
  connection: Connection;
  wallet: Wallet;
};

export function getConnection(): Connection {
  const url = "https://api.devnet.solana.com";
  return new Connection(url, "confirmed");
}

export async function newAccountWithLamports(
  connection: Connection,
  lamports = LAMPORTS_PER_SOL * 2
): Promise<Keypair> {
  const account = Keypair.fromSecretKey(
    new Uint8Array([
      3, 78, 235, 13, 111, 119, 0, 106, 80, 59, 127, 7, 138, 176, 230, 143, 114,
      39, 115, 237, 162, 208, 87, 183, 25, 127, 12, 197, 139, 235, 155, 91, 246,
      88, 174, 178, 173, 136, 176, 78, 121, 114, 209, 75, 111, 52, 62, 15, 117,
      206, 230, 241, 196, 101, 57, 173, 183, 249, 41, 44, 172, 95, 225, 194,
    ])
  );
  try {
    const signature = await connection.requestAirdrop(
      account.publicKey,
      lamports
    );
    await connection.confirmTransaction(signature, "confirmed");
  } catch { }
  return account;
}

export async function getProvider(): Promise<CardinalProvider> {
  const connection = getConnection();
  const keypair = await newAccountWithLamports(connection);
  const wallet = new Wallet(keypair);
  return {
    connection,
    wallet,
  };
}

export async function executeTransactions(
  connection: Connection,
  txs: Transaction[],
  wallet: Wallet,
  config?: { signers?: Signer[]; silent?: boolean }
): Promise<string[]> {
  const latestBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const signedTxs = await wallet.signAllTransactions(
    txs.map((tx) => {
      tx.recentBlockhash = latestBlockhash;
      tx.feePayer = wallet.publicKey;
      if (config?.signers) {
        tx.partialSign(...(config?.signers ?? []));
      }
      return tx;
    })
  );
  const txids = await Promise.all(
    signedTxs.map(async (tx) => {
      try {
        const txid = await sendAndConfirmRawTransaction(
          connection,
          tx.serialize()
        );
        return txid;
      } catch (e) {
        if (!config?.silent) {
          handleError(e);
        }
        throw e;
      }
    })
  );
  return txids;
}

(async () => {
  const provider = await getProvider();

  let uiConfig: UiConfigV2 = {};

  let transactions: Transaction[] = [];

  /*
  for (const faction of configV2.factions) {

    const [transaction, stakePoolId, rewardDistributorsIds] =
      await createStakePool(provider.connection, provider.wallet, {
        requiresCreators: [configV2.nftCreator],
        taxMint: configV2.unstakeTaxMint,
        minStakeSeconds: configV2.lockupPeriods.map((_lockupPeriod) => _lockupPeriod.duration),
});
transactions.push(transaction);

uiConfig[faction] = {
  stakingPoolId,
  lockupPeriods: 
    }
  }
  * /

/*
for (const scope of config.scopes) {

  uiConfig[stakePoolId.toString()] = {
    rewardDistributors: scope.rewards.map((reward, index) => ({
      label: reward.label,
      rewardMint: reward.tokenMint.toString(),
      rewardDistributorPda: rewardDistributorsIds![index]![1]!.toString(),
      distributorIndex: index,
    })),
  };
}
*/

  await executeTransactions(provider.connection, transactions, provider.wallet);

  await fs.writeFile("./ui_config.json", JSON.stringify(uiConfig, null, 2));
})();

export const handleError = (e: any) => {
  const message = (e as SendTransactionError).message ?? "";
  const logs = (e as SendTransactionError).logs;
  if (logs) {
    console.error(logs, message);
  } else {
    console.error(e, message);
  }
};
