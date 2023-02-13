import { findAta, findMintMetadataId, METADATA_PROGRAM_ID, tryGetAccount, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import { CRANK_KEY, PAYMENT_MANAGER_ADDRESS } from "@cardinal/payment-manager";
import { getPaymentManager } from "@cardinal/payment-manager/dist/cjs/accounts";
import { tokenManager } from "@cardinal/token-manager/dist/cjs/programs";
import { getRemainingAccountsForKind, TOKEN_MANAGER_ADDRESS, TokenManagerKind, TokenManagerState, withRemainingAccountsForReturn, } from "@cardinal/token-manager/dist/cjs/programs/tokenManager";
import { findMintCounterId, findMintManagerId, findTokenManagerAddress, tokenManagerAddressFromMint, } from "@cardinal/token-manager/dist/cjs/programs/tokenManager/pda";
import { BN } from "@project-serum/anchor";
import { ASSOCIATED_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, } from "@solana/spl-token";
import { Keypair, SystemProgram, SYSVAR_RENT_PUBKEY, SYSVAR_SLOT_HASHES_PUBKEY, } from "@solana/web3.js";
import { getMintSupply } from "../../utils";
import { findRewardAuthority } from "../rewardDistributor/pda";
import { withClaimRewards } from "../rewardDistributor/transaction";
import { getPoolIdentifier, getStakeBooster, getStakeEntry, getStakePool, } from "./accounts";
import { ReceiptType, STAKE_BOOSTER_PAYMENT_MANAGER, stakePoolProgram, } from "./constants";
import { findGroupEntryId, findIdentifierId, findStakeAuthorizationId, findStakeBoosterId, findStakePoolId, } from "./pda";
import { findStakeEntryIdFromMint, remainingAccountsForInitStakeEntry, withRemainingAccountsForUnstake, } from "./utils";
/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
export const withInitPoolIdentifier = async (transaction, connection, wallet) => {
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
export const withInitStakePool = async (transaction, connection, wallet, params) => {
    const identifierId = findIdentifierId();
    const identifierData = await tryGetAccount(() => getPoolIdentifier(connection));
    let identifier = (identifierData === null || identifierData === void 0 ? void 0 : identifierData.parsed.count) || new BN(1);
    identifier = identifier.add(new BN(!!params.offset ? params.offset : 0));
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
    const stakePoolId = findStakePoolId(
    // identifier.add(new BN(!!params.offset ? params.offset : 0))
    identifier);
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
        minStakeSeconds: params.minStakeSeconds || 0,
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
export const withInitStakeEntry = async (transaction, connection, wallet, params) => {
    const stakeEntryId = await findStakeEntryIdFromMint(params.stakePoolId, params.originalMintId);
    const originalMintMetadatId = findMintMetadataId(params.originalMintId);
    const remainingAccounts = remainingAccountsForInitStakeEntry(params.stakePoolId, params.originalMintId);
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
export const withAuthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    const stakeAuthorizationId = findStakeAuthorizationId(params.stakePoolId, params.originalMintId);
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
export const withDeauthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    const stakeAuthorizationId = findStakeAuthorizationId(params.stakePoolId, params.originalMintId);
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
export const withInitStakeMint = async (transaction, connection, wallet, params) => {
    const [mintManagerId] = await findMintManagerId(params.stakeMintKeypair.publicKey);
    const originalMintMetadataId = findMintMetadataId(params.originalMintId);
    const stakeMintMetadataId = findMintMetadataId(params.stakeMintKeypair.publicKey);
    const stakeEntryStakeMintTokenAccountId = await findAta(params.stakeMintKeypair.publicKey, params.stakeEntryId, true);
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
export const withClaimReceiptMint = async (transaction, connection, wallet, params) => {
    if (params.receiptType === ReceiptType.Original &&
        (await getMintSupply(connection, params.receiptMintId)).gt(new BN(1))) {
        throw new Error("Fungible staking and locked reecipt type not supported yet");
    }
    const tokenManagerReceiptMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.receiptMintId, (await findTokenManagerAddress(params.receiptMintId))[0], wallet.publicKey, true);
    const stakeEntryReceiptMintTokenAccountId = await findAta(params.receiptMintId, params.stakeEntryId, true);
    const userReceiptMintTokenAccountId = await findAta(params.receiptMintId, wallet.publicKey, true);
    const [tokenManagerId] = await findTokenManagerAddress(params.receiptMintId);
    const [mintCounterId] = await findMintCounterId(params.receiptMintId);
    const remainingAccountsForKind = await getRemainingAccountsForKind(params.receiptMintId, params.receiptType === ReceiptType.Original
        ? TokenManagerKind.Edition
        : TokenManagerKind.Managed);
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
        tokenManagerReceiptMintTokenAccount: tokenManagerReceiptMintTokenAccountId,
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
export const withStake = async (transaction, connection, wallet, params) => {
    const stakeEntryId = await findStakeEntryIdFromMint(params.stakePoolId, params.originalMintId);
    const stakeEntryOriginalMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    const program = stakePoolProgram(connection, wallet);
    const ix = await program.methods
        .stake(new BN(1), params.duration)
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
export const withUnstake = async (transaction, connection, wallet, params) => {
    if (params.distributorIds.length === 0)
        throw new Error("empty distributorIds");
    const stakeEntryId = await findStakeEntryIdFromMint(params.stakePoolId, params.originalMintId);
    const [stakeEntryData] = await Promise.all([
        tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
    ]);
    await withReturnReceiptMint(transaction, connection, wallet, {
        stakeEntryId: stakeEntryId,
    });
    const stakePoolData = await getStakePool(connection, params.stakePoolId);
    for (const [rewardDistributorIndex] of params.distributorIds.entries()) {
        if (!stakeEntryData)
            throw "Stake entry not found";
        if ((!stakePoolData.parsed.cooldownSeconds ||
            stakePoolData.parsed.cooldownSeconds === 0 ||
            ((stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.cooldownStartSeconds) &&
                Date.now() / 1000 -
                    stakeEntryData.parsed.cooldownStartSeconds.toNumber() >=
                    stakePoolData.parsed.cooldownSeconds)) &&
            (!stakePoolData.parsed.minStakeSeconds ||
                stakePoolData.parsed.minStakeSeconds === 0 ||
                ((stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.lastStakedAt) &&
                    Date.now() / 1000 - stakeEntryData.parsed.lastStakedAt.toNumber() >=
                        stakePoolData.parsed.minStakeSeconds)) &&
            (stakeEntryData.parsed.originalMintClaimed ||
                stakeEntryData.parsed.stakeMintClaimed)) {
            // return receipt mint if its claimed
        }
        // claim any rewards deserved
        await withClaimRewards(transaction, connection, wallet, {
            distributorId: new BN(rewardDistributorIndex),
            stakePoolId: params.stakePoolId,
            stakeEntryId: stakeEntryId,
            lastStaker: wallet.publicKey,
            skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
            stakePoolDuration: params.stakePoolDuration,
        });
    }
    const stakeEntryOriginalMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    const userOriginalMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, params.originalMintId, wallet.publicKey, wallet.publicKey);
    const remainingAccounts = await withRemainingAccountsForUnstake(transaction, connection, wallet, stakeEntryId, stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint);
    const authority = stakePoolData.parsed.authority;
    const rewardAuthority = findRewardAuthority(authority);
    const taxMint = stakePoolData.parsed.taxMint;
    const authorityTaxMintTokenAccount = await withFindOrInitAssociatedTokenAccount(transaction, connection, taxMint, rewardAuthority, wallet.publicKey);
    const userTaxMintTokenAccount = await withFindOrInitAssociatedTokenAccount(transaction, connection, taxMint, wallet.publicKey, wallet.publicKey);
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
        taxMint,
        authorityTaxMintTokenAccount,
        userTaxMintTokenAccount,
        rewardAuthority,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
    transaction.add(ix);
    return transaction;
};
export const withUpdateStakePool = async (transaction, connection, wallet, params) => {
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
export const withUpdateTotalStakeSeconds = async (transaction, connection, wallet, params) => {
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
export const withReturnReceiptMint = async (transaction, connection, wallet, params) => {
    const stakeEntryData = await tryGetAccount(() => getStakeEntry(connection, params.stakeEntryId));
    if (!stakeEntryData) {
        throw new Error(`Stake entry ${params.stakeEntryId.toString()} not found`);
    }
    if (!stakeEntryData.parsed.stakeMintClaimed &&
        !stakeEntryData.parsed.originalMintClaimed) {
        console.log("No receipt mint to return");
        return transaction;
    }
    const receiptMint = stakeEntryData.parsed.stakeMint && stakeEntryData.parsed.stakeMintClaimed
        ? stakeEntryData.parsed.stakeMint
        : stakeEntryData.parsed.originalMint;
    const tokenManagerId = await tokenManagerAddressFromMint(connection, receiptMint);
    const tokenManagerData = await tryGetAccount(() => tokenManager.accounts.getTokenManager(connection, tokenManagerId));
    if (!tokenManagerData) {
        return transaction;
    }
    const remainingAccountsForReturn = await withRemainingAccountsForReturn(transaction, connection, wallet, tokenManagerData);
    const tokenManagerTokenAccountId = await findAta(receiptMint, tokenManagerData.pubkey, true);
    const userReceiptMintTokenAccountId = await findAta(receiptMint, wallet.publicKey, true);
    const transferAccounts = await getRemainingAccountsForKind(receiptMint, tokenManagerData.parsed.kind);
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
export const withCloseStakePool = async (transaction, connection, wallet, params) => {
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
export const withCloseStakeEntry = async (transaction, connection, wallet, params) => {
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
export const withReassignStakeEntry = async (transaction, connection, wallet, params) => {
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
export const withDoubleOrResetTotalStakeSeconds = async (transaction, connection, wallet, params) => {
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
export const withInitStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
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
export const withUpdateStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
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
export const withCloseStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
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
export const withBoostStakeEntry = async (transaction, connection, wallet, params) => {
    var _a, _b;
    const stakeBoosterId = findStakeBoosterId(params.stakePoolId, params.stakeBoosterIdentifier);
    const stakeBooster = await getStakeBooster(connection, stakeBoosterId);
    const paymentManager = await getPaymentManager(connection, stakeBooster.parsed.paymentManager);
    const feeCollectorTokenAccount = await withFindOrInitAssociatedTokenAccount(transaction, connection, stakeBooster.parsed.paymentMint, paymentManager.parsed.feeCollector, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const paymentRecipientTokenAccount = await withFindOrInitAssociatedTokenAccount(transaction, connection, stakeBooster.parsed.paymentMint, stakeBooster.parsed.paymentRecipient, (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey);
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
export const withInitGroupStakeEntry = async (transaction, connection, wallet, params) => {
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
export const withAddToGroupEntry = async (transaction, connection, wallet, params) => {
    var _a;
    const program = stakePoolProgram(connection, wallet);
    const ix = await program.methods
        .addToGroupEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
        payer: (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
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
export const withRemoveFromGroupEntry = async (transaction, connection, wallet, params) => {
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
export const withInitUngrouping = async (transaction, connection, wallet, params) => {
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
export const withClaimStakeEntryFunds = async (transaction, connection, wallet, stakeEntryId, fundsMintId) => {
    const program = stakePoolProgram(connection, wallet);
    const stakeEntryData = await tryGetAccount(() => getStakeEntry(connection, stakeEntryId));
    if (!stakeEntryData) {
        throw `No stake entry id with address ${stakeEntryId.toString()}`;
    }
    const stakeEntryFundsMintTokenAccountId = getAssociatedTokenAddressSync(fundsMintId, stakeEntryId, true);
    const userFundsMintTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, fundsMintId, stakeEntryData.parsed.lastStaker, wallet.publicKey, true);
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
//# sourceMappingURL=transaction.js.map