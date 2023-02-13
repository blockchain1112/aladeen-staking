// this script will parse a config
import fs from "fs/promises";

import { findRewardDistributorId } from "../src/programs/rewardDistributor/pda";
import { Wallet, BN } from "@project-serum/anchor";
import {
  Transaction,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Signer,
  sendAndConfirmRawTransaction,
  SendTransactionError,
  PublicKey,
} from "@solana/web3.js";

import { createStakePool } from "../src";
import { RewardDistributorKind } from "../src/programs/rewardDistributor";

import {
  configV2,
  UiConfigV2,
  UiConfigV2RewardDistributor,
  UiConfigV2RewardDistributors,
} from "./configV2";

export type CardinalProvider = {
  connection: Connection;
  wallet: Wallet;
};

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function isBlockhashExpired(
  connection: Connection,
  lastValidBlockHeight: number
) {
  return (
    (await connection.getBlockHeight("finalized")) > lastValidBlockHeight - 150
  );
}

export const confirmTx = async (connection: Connection, txid: string) => {
  const START_TIME = new Date();
  const blockhashResponse = await connection.getLatestBlockhashAndContext(
    "finalized"
  );
  const lastValidHeight = blockhashResponse.value.lastValidBlockHeight;

  let hashExpired = false;
  let txSuccess = false;
  while (!hashExpired && !txSuccess) {
    const { value: status } = await connection.getSignatureStatus(txid);

    if (status && status.confirmationStatus === "confirmed") {
      txSuccess = true;
      const endTime = new Date();
      const elapsed = (endTime.getTime() - START_TIME.getTime()) / 1000;
      console.log(`Transaction Success. Elapsed time: ${elapsed} seconds.`);
      console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      break;
    }

    hashExpired = await isBlockhashExpired(connection, lastValidHeight);

    if (hashExpired) {
      const endTime = new Date();
      const elapsed = (endTime.getTime() - START_TIME.getTime()) / 1000;
      console.log(`Blockhash has expired. Elapsed time: ${elapsed} seconds.`);
      break;
    }

    await sleep(1000);
  }
};

export function getConnection(): Connection {
  const url = "https://api.devnet.solana.com";
  return new Connection(url, { confirmTransactionInitialTimeout: 120 * 1000 });
}

export async function newAccountWithLamports(
  connection: Connection,
  lamports = LAMPORTS_PER_SOL * 2
): Promise<Keypair> {
  const account = Keypair.fromSecretKey(
    new Uint8Array([
      103, 69, 117, 97, 102, 47, 164, 183, 155, 169, 115, 225, 177, 15, 76, 127,
      120, 65, 147, 248, 226, 176, 184, 125, 157, 15, 56, 169, 148, 249, 39,
      143, 71, 52, 35, 106, 182, 108, 201, 103, 231, 133, 240, 4, 89, 17, 135,
      18, 123, 48, 233, 122, 51, 230, 180, 111, 6, 135, 110, 147, 7, 150, 104,
      51,
    ])
  );
  try {
    await connection.requestAirdrop(account.publicKey, lamports);
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

export const handleError = (e: any) => {
  const message = (e as SendTransactionError).message ?? "";
  const logs = (e as SendTransactionError).logs;
  if (logs) {
    console.error(logs, message);
  } else {
    console.error(e, message);
  }
};

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
  let txids: string[] = [];

  for (const tx of signedTxs) {
    try {
      const txid = await sendAndConfirmRawTransaction(
        connection,
        tx.serialize(),
        {
          skipPreflight: true,
          commitment: "confirmed",
        }
      );

      console.log(txid);
      // await connection.confirmTransaction(txid, "finalized");
      await confirmTx(connection, txid);

      txids.push(txid);
    } catch (e) {
      if (!config?.silent) {
        handleError(e);
      }
      throw e;
    }
  }

  return txids;
}

(async () => {
  const provider = await getProvider();
  let transactions: Transaction[] = [];
  let uiConfig: UiConfigV2 = {};

  for (const [factionIndex, faction] of configV2.factions.entries()) {
    const dists = configV2.lockupPeriods
      .map((_lockupPeriod) => _lockupPeriod.duration)
      .flatMap((_duration) => {
        const period = configV2.lockupPeriods.find(
          (_period) => _period.duration === _duration
        )!;

        const _dists = period.rewards.map((_period) => ({
          rewardMintId: _period.tokenMint,
          rewardAmount: new BN(_period.emission),
          rewardDurationSeconds: new BN(_period.every),
          rewardDistributorKind: RewardDistributorKind.Treasury,
          duration: _duration,
          stakePoolDuration: _duration,
        }));

        return _dists;
      });

    const [_transactions, stakePoolId, _rewardDistributorsIds] =
      await createStakePool(provider.connection, provider.wallet, {
        requiresCreators: [new PublicKey(configV2.nftCreator)],
        taxMint: new PublicKey(configV2.unstakeTokenMint),
        minStakeSeconds: configV2.lockupPeriods.map(
          (_lockupPeriod) => _lockupPeriod.duration
        ),
        rewardDistributors: dists,
        offset: factionIndex,
      });
    let duratedRewardDistribution: UiConfigV2RewardDistributors =
      configV2.lockupPeriods.reduce((acc, _lockupPeriod) => {
        return {
          ...acc,
          [String(_lockupPeriod.duration)]: _lockupPeriod.rewards.map(
            (_reward, _rewardIndex) => {
              return {
                label: _reward.label,
                duration: _lockupPeriod.duration,
                rewardMint: _reward.tokenMint.toString(),
                rewardDistributorPda: findRewardDistributorId(
                  stakePoolId,
                  new BN(_rewardIndex),
                  _lockupPeriod.duration
                ).toString(),
                distributorIndex: _rewardIndex,
              } as UiConfigV2RewardDistributor;
            }
          ),
        } as UiConfigV2RewardDistributors;
      }, {} as UiConfigV2RewardDistributors);
    transactions.push(..._transactions);

    uiConfig[stakePoolId.toString()] = {
      faction,
      rewardDistributors: duratedRewardDistribution,
    };
  }
  await executeTransactions(provider.connection, transactions, provider.wallet);
  await fs.writeFile("./ui_config.json", JSON.stringify(uiConfig, null, 2));
})();
