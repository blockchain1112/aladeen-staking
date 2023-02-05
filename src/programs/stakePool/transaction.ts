import {
  findAta,
  findMintMetadataId,
  METADATA_PROGRAM_ID,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "@cardinal/common";
import { CRANK_KEY, PAYMENT_MANAGER_ADDRESS } from "@cardinal/payment-manager";
import { getPaymentManager } from "@cardinal/payment-manager/dist/cjs/accounts";
import { tokenManager } from "@cardinal/token-manager/dist/cjs/programs";
import {
  getRemainingAccountsForKind,
  TOKEN_MANAGER_ADDRESS,
  TokenManagerKind,
  TokenManagerState,
  withRemainingAccountsForReturn,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import {
  findMintCounterId,
  findMintManagerId,
  findTokenManagerAddress,
  tokenManagerAddressFromMint,
} from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import { BN } from "@project-serum/anchor";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type { Connection, PublicKey, Transaction } from "@solana/web3.js";
import {
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_SLOT_HASHES_PUBKEY,
} from "@solana/web3.js";

import { getMintSupply } from "../../utils";
import { getRewardDistributor } from "../rewardDistributor/accounts";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import { withClaimRewards } from "../rewardDistributor/transaction";
import {
  getPoolIdentifier,
  getStakeBooster,
  getStakeEntry,
  getStakePool,
} from "./accounts";
import {
  ReceiptType,
  STAKE_BOOSTER_PAYMENT_MANAGER,
  stakePoolProgram,
} from "./constants";
import {
  findGroupEntryId,
  findIdentifierId,
  findStakeAuthorizationId,
  findStakeBoosterId,
  findStakePoolId,
} from "./pda";
import {
  findStakeEntryIdFromMint,
  remainingAccountsForInitStakeEntry,
  withRemainingAccountsForUnstake,
} from "./utils";

/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
export const withInitPoolIdentifier = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet
): Promise<[Transaction, PublicKey]> => {
  const identifierId = findIdentifierId();
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .initIdentifier()
    .accounts({
      identifier: identifierId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction, identifierId];
};

export const withInitStakePool = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number[];
    endDate?: BN;
    doubleOrResetEnabled?: boolean;
    taxMint: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  const identifierId = findIdentifierId();
  const identifierData = await tryGetAccount(() =>
    getPoolIdentifier(connection)
  );
  const identifier = identifierData?.parsed.count || new BN(1);

  const program = stakePoolProgram(connection, wallet);
  if (!identifierData) {
    const ix = await program.methods
      .initIdentifier()
      .accounts({
        identifier: identifierId,
        payer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    transaction.add(ix);
  }

  const stakePoolId = findStakePoolId(identifier);
  const ix = await program.methods
    .initPool({
      overlayText: params.overlayText || "STAKED",
      imageUri: params.imageUri || "",
      requiresCollections: params.requiresCollections || [],
      requiresCreators: params.requiresCreators || [],
      requiresAuthorization: params.requiresAuthorization || false,
      authority: wallet.publicKey,
      resetOnStake: params.resetOnStake || false,
      cooldownSeconds: params.cooldownSeconds || null,
      minStakeSeconds: params.minStakeSeconds || [],
      endDate: params.endDate || null,
      doubleOrResetEnabled: params.doubleOrResetEnabled || null,
      taxMint: params.taxMint,
    })
    .accounts({
      stakePool: stakePoolId,
      identifier: identifierId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction, stakePoolId];
};

/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
export const withInitStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<[Transaction, PublicKey]> => {
  const stakeEntryId = await findStakeEntryIdFromMint(
    params.stakePoolId,
    params.originalMintId
  );
  const originalMintMetadatId = findMintMetadataId(params.originalMintId);

  const remainingAccounts = remainingAccountsForInitStakeEntry(
    params.stakePoolId,
    params.originalMintId
  );
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .initEntry(wallet.publicKey)
    .accounts({
      stakeEntry: stakeEntryId,
      stakePool: params.stakePoolId,
      originalMint: params.originalMintId,
      originalMintMetadata: originalMintMetadatId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
  transaction.add(ix);
  return [transaction, stakeEntryId];
};

/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withAuthorizeStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> => {
  const stakeAuthorizationId = findStakeAuthorizationId(
    params.stakePoolId,
    params.originalMintId
  );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .authorizeMint(params.originalMintId)
    .accounts({
      stakePool: params.stakePoolId,
      stakeAuthorizationRecord: stakeAuthorizationId,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withDeauthorizeStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
  }
): Promise<Transaction> => {
  const stakeAuthorizationId = findStakeAuthorizationId(
    params.stakePoolId,
    params.originalMintId
  );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .deauthorizeMint()
    .accounts({
      stakePool: params.stakePoolId,
      stakeAuthorizationRecord: stakeAuthorizationId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
export const withInitStakeMint = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    stakeMintKeypair: Keypair;
    name: string;
    symbol: string;
  }
): Promise<[Transaction, Keypair]> => {
  const [mintManagerId] = await findMintManagerId(
    params.stakeMintKeypair.publicKey
  );
  const originalMintMetadataId = findMintMetadataId(params.originalMintId);
  const stakeMintMetadataId = findMintMetadataId(
    params.stakeMintKeypair.publicKey
  );
  const stakeEntryStakeMintTokenAccountId = await findAta(
    params.stakeMintKeypair.publicKey,
    params.stakeEntryId,
    true
  );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .initStakeMint({
      name: params.name,
      symbol: params.symbol,
    })
    .accounts({
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      originalMint: params.originalMintId,
      originalMintMetadata: originalMintMetadataId,
      stakeMint: params.stakeMintKeypair.publicKey,
      stakeMintMetadata: stakeMintMetadataId,
      stakeEntryStakeMintTokenAccount: stakeEntryStakeMintTokenAccountId,
      mintManager: mintManagerId,
      payer: wallet.publicKey,
      rent: SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      associatedToken: ASSOCIATED_PROGRAM_ID,
      tokenMetadataProgram: METADATA_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction, params.stakeMintKeypair];
};

/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withClaimReceiptMint = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    receiptMintId: PublicKey;
    receiptType: ReceiptType;
  }
): Promise<Transaction> => {
  if (
    params.receiptType === ReceiptType.Original &&
    (await getMintSupply(connection, params.receiptMintId)).gt(new BN(1))
  ) {
    throw new Error(
      "Fungible staking and locked reecipt type not supported yet"
    );
  }

  const tokenManagerReceiptMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.receiptMintId,
      (
        await findTokenManagerAddress(params.receiptMintId)
      )[0],
      wallet.publicKey,
      true
    );

  const stakeEntryReceiptMintTokenAccountId = await findAta(
    params.receiptMintId,
    params.stakeEntryId,
    true
  );
  const userReceiptMintTokenAccountId = await findAta(
    params.receiptMintId,
    wallet.publicKey,
    true
  );
  const [tokenManagerId] = await findTokenManagerAddress(params.receiptMintId);
  const [mintCounterId] = await findMintCounterId(params.receiptMintId);
  const remainingAccountsForKind = await getRemainingAccountsForKind(
    params.receiptMintId,
    params.receiptType === ReceiptType.Original
      ? TokenManagerKind.Edition
      : TokenManagerKind.Managed
  );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .claimReceiptMint()
    .accounts({
      stakeEntry: params.stakeEntryId,
      originalMint: params.originalMintId,
      receiptMint: params.receiptMintId,
      stakeEntryReceiptMintTokenAccount: stakeEntryReceiptMintTokenAccountId,
      user: wallet.publicKey,
      userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
      tokenManagerReceiptMintTokenAccount:
        tokenManagerReceiptMintTokenAccountId,
      tokenManager: tokenManagerId,
      mintCounter: mintCounterId,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .remainingAccounts(remainingAccountsForKind)
    .instruction();
  transaction.add(ix);
  return transaction;
};

/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withStake = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    userOriginalMintTokenAccountId: PublicKey;
    amount?: BN;
    duration: number;
  }
): Promise<Transaction> => {
  const stakeEntryId = await findStakeEntryIdFromMint(
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .stake(params.amount || new BN(1), params.duration)
    .accounts({
      stakeEntry: stakeEntryId,
      stakePool: params.stakePoolId,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
      originalMint: params.originalMintId,
      user: wallet.publicKey,
      userOriginalMintTokenAccount: params.userOriginalMintTokenAccountId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  transaction.add(ix);

  return transaction;
};

/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withUnstake = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    distributorId: BN;
    stakePoolId: PublicKey;
    originalMintId: PublicKey;
    skipRewardMintTokenAccount?: boolean;
  }
): Promise<Transaction> => {
  const rewardDistributorId = findRewardDistributorId(
    params.stakePoolId,
    params.distributorId
  );
  const stakeEntryId = await findStakeEntryIdFromMint(
    params.stakePoolId,
    params.originalMintId
  );

  const [stakeEntryData, rewardDistributorData] = await Promise.all([
    tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
    tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId)),
  ]);

  if (!stakeEntryData) throw "Stake entry not found";

  const stakePoolData = await getStakePool(connection, params.stakePoolId);

  if (
    (!stakePoolData.parsed.cooldownSeconds ||
      stakePoolData.parsed.cooldownSeconds === 0 ||
      (stakeEntryData?.parsed.cooldownStartSeconds &&
        Date.now() / 1000 -
          stakeEntryData.parsed.cooldownStartSeconds.toNumber() >=
          stakePoolData.parsed.cooldownSeconds)) &&
    (!stakePoolData.parsed.minStakeSeconds ||
      stakePoolData.parsed.minStakeSeconds === 0 ||
      (stakeEntryData?.parsed.lastStakedAt &&
        Date.now() / 1000 - stakeEntryData.parsed.lastStakedAt.toNumber() >=
          stakePoolData.parsed.minStakeSeconds)) &&
    (stakeEntryData.parsed.originalMintClaimed ||
      stakeEntryData.parsed.stakeMintClaimed)
  ) {
    // return receipt mint if its claimed
    await withReturnReceiptMint(transaction, connection, wallet, {
      stakeEntryId: stakeEntryId,
    });
  }

  const stakeEntryOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const userOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      wallet.publicKey,
      wallet.publicKey
    );

  const remainingAccounts = await withRemainingAccountsForUnstake(
    transaction,
    connection,
    wallet,
    stakeEntryId,
    stakeEntryData?.parsed.stakeMint
  );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .unstake()
    .accounts({
      stakePool: params.stakePoolId,
      stakeEntry: stakeEntryId,
      originalMint: params.originalMintId,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
      user: wallet.publicKey,
      userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .remainingAccounts(remainingAccounts)
    .instruction();
  transaction.add(ix);

  // claim any rewards deserved
  if (rewardDistributorData) {
    await withClaimRewards(transaction, connection, wallet, {
      distributorId: params.distributorId,
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      lastStaker: wallet.publicKey,
      skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
    });
  }

  return transaction;
};

export const withUpdateStakePool = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    requiresCollections?: PublicKey[];
    requiresCreators?: PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
    doubleOrResetEnabled?: boolean;
  }
): Promise<[Transaction, PublicKey]> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .updatePool({
      imageUri: params.imageUri || "",
      overlayText: params.overlayText || "STAKED",
      requiresCollections: params.requiresCollections || [],
      requiresCreators: params.requiresCreators || [],
      requiresAuthorization: params.requiresAuthorization || false,
      authority: wallet.publicKey,
      resetOnStake: params.resetOnStake || false,
      cooldownSeconds: params.cooldownSeconds || null,
      minStakeSeconds: params.minStakeSeconds || null,
      endDate: params.endDate || null,
      doubleOrResetEnabled: params.doubleOrResetEnabled || null,
    })
    .accounts({
      stakePool: params.stakePoolId,
      payer: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return [transaction, params.stakePoolId];
};

export const withUpdateTotalStakeSeconds = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
    lastStaker: PublicKey;
  }
): Promise<Transaction> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .updateTotalStakeSeconds()
    .accounts({
      stakeEntry: params.stakeEntryId,
      lastStaker: params.lastStaker,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withReturnReceiptMint = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, params.stakeEntryId)
  );
  if (!stakeEntryData) {
    throw new Error(`Stake entry ${params.stakeEntryId.toString()} not found`);
  }

  if (
    !stakeEntryData.parsed.stakeMintClaimed &&
    !stakeEntryData.parsed.originalMintClaimed
  ) {
    console.log("No receipt mint to return");
    return transaction;
  }

  const receiptMint =
    stakeEntryData.parsed.stakeMint && stakeEntryData.parsed.stakeMintClaimed
      ? stakeEntryData.parsed.stakeMint
      : stakeEntryData.parsed.originalMint;

  const tokenManagerId = await tokenManagerAddressFromMint(
    connection,
    receiptMint
  );
  const tokenManagerData = await tryGetAccount(() =>
    tokenManager.accounts.getTokenManager(connection, tokenManagerId)
  );

  if (!tokenManagerData) {
    return transaction;
  }

  const remainingAccountsForReturn = await withRemainingAccountsForReturn(
    transaction,
    connection,
    wallet,
    tokenManagerData
  );
  const tokenManagerTokenAccountId = await findAta(
    receiptMint,
    tokenManagerData.pubkey,
    true
  );
  const userReceiptMintTokenAccountId = await findAta(
    receiptMint,
    wallet.publicKey,
    true
  );
  const transferAccounts = await getRemainingAccountsForKind(
    receiptMint,
    tokenManagerData.parsed.kind
  );

  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .returnReceiptMint()
    .accounts({
      stakeEntry: params.stakeEntryId,
      receiptMint: receiptMint,
      tokenManager: tokenManagerData.pubkey,
      tokenManagerTokenAccount: tokenManagerTokenAccountId,
      userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
      user: wallet.publicKey,
      collector: CRANK_KEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .remainingAccounts([
      ...(tokenManagerData.parsed.state === TokenManagerState.Claimed
        ? transferAccounts
        : []),
      ...remainingAccountsForReturn,
    ])
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withCloseStakePool = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
  }
): Promise<Transaction> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .closeStakePool()
    .accounts({
      stakePool: params.stakePoolId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withCloseStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .closeStakeEntry()
    .accounts({
      stakePool: params.stakePoolId,
      stakeEntry: params.stakeEntryId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withReassignStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
    target: PublicKey;
  }
): Promise<Transaction> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .reassignStakeEntry({ target: params.target })
    .accounts({
      stakePool: params.stakePoolId,
      stakeEntry: params.stakeEntryId,
      lastStaker: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withDoubleOrResetTotalStakeSeconds = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<Transaction> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .doubleOrResetTotalStakeSeconds()
    .accounts({
      stakeEntry: params.stakeEntryId,
      stakePool: params.stakePoolId,
      lastStaker: wallet.publicKey,
      recentSlothashes: SYSVAR_SLOT_HASHES_PUBKEY,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withInitStakeBooster = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
    payer?: PublicKey;
  }
): Promise<Transaction> => {
  const stakeBoosterId = findStakeBoosterId(
    params.stakePoolId,
    params.stakeBoosterIdentifier
  );
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .initStakeBooster({
      stakePool: params.stakePoolId,
      identifier: params.stakeBoosterIdentifier || new BN(0),
      paymentAmount: params.paymentAmount,
      paymentMint: params.paymentMint,
      paymentManager: STAKE_BOOSTER_PAYMENT_MANAGER,
      boostSeconds: params.boostSeconds,
      startTimeSeconds: new BN(params.startTimeSeconds),
    })
    .accounts({
      stakeBooster: stakeBoosterId,
      stakePool: params.stakePoolId,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withUpdateStakeBooster = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
  }
): Promise<Transaction> => {
  const stakeBoosterId = findStakeBoosterId(
    params.stakePoolId,
    params.stakeBoosterIdentifier
  );
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .updateStakeBooster({
      paymentAmount: params.paymentAmount,
      paymentMint: params.paymentMint,
      paymentManager: STAKE_BOOSTER_PAYMENT_MANAGER,
      boostSeconds: params.boostSeconds,
      startTimeSeconds: new BN(params.startTimeSeconds),
    })
    .accounts({
      stakeBooster: stakeBoosterId,
      stakePool: params.stakePoolId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withCloseStakeBooster = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
  }
): Promise<Transaction> => {
  const stakeBoosterId = findStakeBoosterId(
    params.stakePoolId,
    params.stakeBoosterIdentifier
  );
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .closeStakeBooster()
    .accounts({
      stakeBooster: stakeBoosterId,
      stakePool: params.stakePoolId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

export const withBoostStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    stakePoolId: PublicKey;
    stakeBoosterIdentifier?: BN;
    stakeEntryId: PublicKey;
    originalMintId: PublicKey;
    payerTokenAccount: PublicKey;
    payer?: PublicKey;
    secondsToBoost: BN;
  }
): Promise<Transaction> => {
  const stakeBoosterId = findStakeBoosterId(
    params.stakePoolId,
    params.stakeBoosterIdentifier
  );

  const stakeBooster = await getStakeBooster(connection, stakeBoosterId);
  const paymentManager = await getPaymentManager(
    connection,
    stakeBooster.parsed.paymentManager
  );
  const feeCollectorTokenAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    stakeBooster.parsed.paymentMint,
    paymentManager.parsed.feeCollector,
    params.payer ?? wallet.publicKey
  );
  const paymentRecipientTokenAccount =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      stakeBooster.parsed.paymentMint,
      stakeBooster.parsed.paymentRecipient,
      params.payer ?? wallet.publicKey
    );
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .boostStakeEntry({ secondsToBoost: params.secondsToBoost })
    .accounts({
      stakeBooster: stakeBooster.pubkey,
      stakePool: params.stakePoolId,
      stakeEntry: params.stakeEntryId,
      originalMint: params.originalMintId,
      payerTokenAccount: params.payerTokenAccount,
      paymentRecipientTokenAccount: paymentRecipientTokenAccount,
      payer: wallet.publicKey,
      paymentManager: stakeBooster.parsed.paymentManager,
      feeCollectorTokenAccount: feeCollectorTokenAccount,
      cardinalPaymentManager: PAYMENT_MANAGER_ADDRESS,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return transaction;
};

/**
 * Add init group stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export const withInitGroupStakeEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    groupCooldownSeconds?: number;
    groupStakeSeconds?: number;
  }
): Promise<[Transaction, PublicKey]> => {
  const id = Keypair.generate();
  const program = stakePoolProgram(connection, wallet);
  const groupEntryId = findGroupEntryId(id.publicKey);
  const ix = await program.methods
    .initGroupEntry({
      groupId: id.publicKey,
      groupCooldownSeconds: params.groupCooldownSeconds || null,
      groupStakeSeconds: params.groupStakeSeconds || null,
    })
    .accounts({
      groupEntry: groupEntryId,
      authority: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction, groupEntryId];
};

/**
 * Add a stake entry to the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export const withAddToGroupEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    groupEntryId: PublicKey;
    stakeEntryId: PublicKey;
    payer?: PublicKey;
  }
): Promise<[Transaction]> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .addToGroupEntry()
    .accounts({
      groupEntry: params.groupEntryId,
      stakeEntry: params.stakeEntryId,
      authority: wallet.publicKey,
      payer: params.payer ?? wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction];
};

/**
 * Remove stake entry from the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export const withRemoveFromGroupEntry = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    groupEntryId: PublicKey;
    stakeEntryId: PublicKey;
  }
): Promise<[Transaction]> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .removeFromGroupEntry()
    .accounts({
      groupEntry: params.groupEntryId,
      stakeEntry: params.stakeEntryId,
      authority: wallet.publicKey,
      payer: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  transaction.add(ix);
  return [transaction];
};

/**
 * Add init ungrouping instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
export const withInitUngrouping = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  params: {
    groupEntryId: PublicKey;
  }
): Promise<[Transaction]> => {
  const program = stakePoolProgram(connection, wallet);
  const ix = await program.methods
    .initUngrouping()
    .accounts({
      groupEntry: params.groupEntryId,
      authority: wallet.publicKey,
    })
    .instruction();
  transaction.add(ix);
  return [transaction];
};

export const withClaimStakeEntryFunds = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  stakeEntryId: PublicKey,
  fundsMintId: PublicKey
): Promise<[Transaction]> => {
  const program = stakePoolProgram(connection, wallet);
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, stakeEntryId)
  );
  if (!stakeEntryData) {
    throw `No stake entry id with address ${stakeEntryId.toString()}`;
  }

  const stakeEntryFundsMintTokenAccountId = getAssociatedTokenAddressSync(
    fundsMintId,
    stakeEntryId,
    true
  );

  const userFundsMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      fundsMintId,
      stakeEntryData.parsed.lastStaker,
      wallet.publicKey,
      true
    );

  const ix = await program.methods
    .claimStakeEntryFunds()
    .accounts({
      fundsMint: fundsMintId,
      stakeEntryFundsMintTokenAccount: stakeEntryFundsMintTokenAccountId,
      userFundsMintTokenAccount: userFundsMintTokenAccountId,
      stakePool: stakeEntryData.parsed.pool,
      stakeEntry: stakeEntryId,
      originalMint: stakeEntryData.parsed.originalMint,
      authority: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
  transaction.add(ix);
  return [transaction];
};
