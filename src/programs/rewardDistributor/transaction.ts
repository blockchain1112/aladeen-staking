import {
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import type { web3 } from "@project-serum/anchor";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

import { getRewardDistributor, getRewardEntry } from "./accounts";
import {
  REWARD_MANAGER,
  RewardDistributorKind,
  rewardDistributorProgram,
} from "./constants";
import {
  findRewardAuthority,
  findRewardDistributorId,
  findRewardEntryId,
} from "./pda";
import { withRemainingAccountsForKind } from "./utils";

export const withInitRewardDistributor = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    rewardMintId: PublicKey;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    kind?: RewardDistributorKind;
    maxSupply?: BN;
    supply?: BN;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    maxRewardSecondsReceived?: BN;
  }
): Promise<[Transaction, web3.PublicKey]> => {
  const rewardAuthority = findRewardAuthority(wallet.publicKey);

  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );
  const remainingAccountsForKind = await withRemainingAccountsForKind(
    transaction,
    connection,
    wallet,
    rewardAuthority,
    params.kind || RewardDistributorKind.Mint,
    params.rewardMintId
  );
  const program = rewardDistributorProgram(connection, wallet);
  const ix = await program.methods
    .initRewardDistributor({
      rewardAmount: params.rewardAmount || new BN(1),
      rewardDurationSeconds: params.rewardDurationSeconds || new BN(1),
      maxSupply: params.maxSupply || null,
      supply: params.supply || null,
      kind: params.kind || RewardDistributorKind.Mint,
      defaultMultiplier: params.defaultMultiplier || null,
      multiplierDecimals: params.multiplierDecimals || null,
      maxRewardSecondsReceived: params.maxRewardSecondsReceived || null,
      distributorIndex: params.distributorId.toNumber(),
    })
    .accounts({
      rewardDistributor: rewardDistributorId,
      rewardAuthority,
      stakePool: params.stakePoolId,
      rewardMint: params.rewardMintId,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccountsForKind)
    .instruction();
  const initRewardAuthorityIx = await program.methods
    .initRewardAuthority({})
    .accounts({
      rewardAuthority,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(initRewardAuthorityIx);

  transaction.add(ix);
  return [transaction, rewardDistributorId];
};

export const withInitRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    rewardDistributorId: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  const rewardEntryId = findRewardEntryId(
    params.rewardDistributorId,
    params.stakeEntryId
  );
  const program = rewardDistributorProgram(connection, wallet);
  const ix = await program.methods
    .initRewardEntry()
    .accounts({
      rewardEntry: rewardEntryId,
      stakeEntry: params.stakeEntryId,
      rewardDistributor: params.rewardDistributorId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction, rewardEntryId];
};

export const withClaimRewards = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    lastStaker: PublicKey;
    payer?: PublicKey;
    skipRewardMintTokenAccount?: boolean;
    authority?: PublicKey;
  }
): Promise<Transaction> => {
  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );
  const rewardAuthority = rewardDistributorData?.parsed.rewardAuthority;

  const rewardMintTokenAccountId = params.skipRewardMintTokenAccount
    ? await findAta(
        rewardDistributorData!.parsed.rewardMint,
        params.lastStaker,
        true
      )
    : await withFindOrInitAssociatedTokenAccount(
        transaction,
        connection,
        rewardDistributorData!.parsed.rewardMint,
        params.lastStaker,
        params.payer ?? wallet.publicKey
      );

  const remainingAccountsForKind = await withRemainingAccountsForKind(
    transaction,
    connection,
    wallet,
    rewardAuthority!,
    rewardDistributorData!.parsed.kind,
    rewardDistributorData!.parsed.rewardMint,
    true
  );

  const rewardEntryId = findRewardEntryId(
    rewardDistributorData!.pubkey,
    params.stakeEntryId
  );
  const rewardEntryData = await tryGetAccount(() =>
    getRewardEntry(connection, rewardEntryId)
  );

  const program = rewardDistributorProgram(connection, wallet);
  if (!rewardEntryData) {
    const ix = await program.methods
      .initRewardEntry()
      .accounts({
        rewardEntry: rewardEntryId,
        stakeEntry: params.stakeEntryId,
        rewardDistributor: rewardDistributorData!.pubkey,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    transaction.add(ix);
  }

  const ix = await program.methods
    .claimRewards()
    .accounts({
      rewardEntry: rewardEntryId,
      rewardDistributor: rewardDistributorData!.pubkey,
      rewardAuthority,
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      rewardMint: rewardDistributorData!.parsed.rewardMint,
      userRewardMintTokenAccount: rewardMintTokenAccountId,
      rewardManager: REWARD_MANAGER,
      user: params.payer ?? wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccountsForKind)
    .instruction();
  transaction.add(ix);

  return transaction;
};

export const withCloseRewardDistributor = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
  }
): Promise<Transaction> => {
  const rewardAuthority = findRewardAuthority(wallet.publicKey);
  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );
  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );

  if (rewardDistributorData) {
    const remainingAccountsForKind = await withRemainingAccountsForKind(
      transaction,
      connection,
      wallet,
      rewardAuthority,
      rewardDistributorData.parsed.kind,
      rewardDistributorData.parsed.rewardMint
    );

    const program = rewardDistributorProgram(connection, wallet);
    const ix = await program.methods
      .closeRewardDistributor()
      .accounts({
        rewardDistributor: rewardDistributorData.pubkey,
        rewardAuthority,
        stakePool: params.stakePoolId,
        rewardMint: rewardDistributorData.parsed.rewardMint,
        signer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .remainingAccounts(remainingAccountsForKind)
      .instruction();
    transaction.add(ix);
  }
  return transaction;
};

export const withUpdateRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    rewardDistributorId: PublicKey;
    stakeEntryId: PublicKey;
    multiplier: BN;
  }
): Promise<Transaction> => {
  const rewardAuthority = findRewardAuthority(wallet.publicKey);
  const rewardEntryId = findRewardEntryId(
    params.rewardDistributorId,
    params.stakeEntryId
  );
  const program = rewardDistributorProgram(connection, wallet);
  const ix = await program.methods
    .updateRewardEntry({
      multiplier: params.multiplier,
    })
    .accounts({
      rewardEntry: rewardEntryId,
      rewardDistributor: params.rewardDistributorId,
      rewardAuthority,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction.add(ix);
};

export const withCloseRewardEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const rewardAuthority = findRewardAuthority(wallet.publicKey);
  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );

  const rewardEntryId = findRewardEntryId(
    rewardDistributorId,
    params.stakeEntryId
  );

  const program = rewardDistributorProgram(connection, wallet);
  const ix = await program.methods
    .closeRewardEntry()
    .accounts({
      rewardAuthority,
      rewardDistributor: rewardDistributorId,
      rewardEntry: rewardEntryId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withUpdateRewardDistributor = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    defaultMultiplier?: BN;
    multiplierDecimals?: number;
    rewardAmount?: BN;
    rewardDurationSeconds?: BN;
    maxRewardSecondsReceived?: BN;
  }
): Promise<Transaction> => {
  const rewardAuthority = findRewardAuthority(wallet.publicKey);
  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );
  const rewardDistributorData = await getRewardDistributor(
    connection,
    rewardDistributorId
  );
  const program = rewardDistributorProgram(connection, wallet);
  const ix = await program.methods
    .updateRewardDistributor({
      defaultMultiplier:
        params.defaultMultiplier ||
        rewardDistributorData.parsed.defaultMultiplier,
      multiplierDecimals:
        params.multiplierDecimals ||
        rewardDistributorData.parsed.multiplierDecimals,
      rewardAmount:
        params.rewardAmount || rewardDistributorData.parsed.rewardAmount,
      rewardDurationSeconds:
        params.rewardDurationSeconds ||
        rewardDistributorData.parsed.rewardDurationSeconds,
      maxRewardSecondsReceived:
        params.maxRewardSecondsReceived ||
        rewardDistributorData.parsed.maxRewardSecondsReceived,
    })
    .accounts({
      rewardDistributor: rewardDistributorId,
      rewardAuthority,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};
export const withReclaimFunds = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    amount: BN;
  }
): Promise<Transaction> => {
  const rewardAuthority = findRewardAuthority(wallet.publicKey);
  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );

  const rewardDistributorData = await tryGetAccount(() =>
    getRewardDistributor(connection, rewardDistributorId)
  );
  if (!rewardDistributorData) {
    throw new Error("No reward distrbutor found");
  }

  const rewardDistributorTokenAccountId = await findAta(
    rewardDistributorData.parsed.rewardMint,
    rewardAuthority,
    true
  );

  const authorityTokenAccountId = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    rewardDistributorData.parsed.rewardMint,
    wallet.publicKey,
    wallet.publicKey,
    true
  );

  const program = rewardDistributorProgram(connection, wallet);
  const ix = await program.methods
    .reclaimFunds(params.amount)
    .accounts({
      rewardDistributor: rewardDistributorId,
      rewardAuthority,
      rewardDistributorTokenAccount: rewardDistributorTokenAccountId,
      authorityTokenAccount: authorityTokenAccountId,
      authority: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};
