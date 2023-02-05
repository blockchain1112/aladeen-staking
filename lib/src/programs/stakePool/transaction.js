"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withClaimStakeEntryFunds = exports.withInitUngrouping = exports.withRemoveFromGroupEntry = exports.withAddToGroupEntry = exports.withInitGroupStakeEntry = exports.withBoostStakeEntry = exports.withCloseStakeBooster = exports.withUpdateStakeBooster = exports.withInitStakeBooster = exports.withDoubleOrResetTotalStakeSeconds = exports.withReassignStakeEntry = exports.withCloseStakeEntry = exports.withCloseStakePool = exports.withReturnReceiptMint = exports.withUpdateTotalStakeSeconds = exports.withUpdateStakePool = exports.withUnstake = exports.withStake = exports.withClaimReceiptMint = exports.withInitStakeMint = exports.withDeauthorizeStakeEntry = exports.withAuthorizeStakeEntry = exports.withInitStakeEntry = exports.withInitStakePool = exports.withInitPoolIdentifier = void 0;
const common_1 = require("@cardinal/common");
const payment_manager_1 = require("@cardinal/payment-manager");
const accounts_1 = require("@cardinal/payment-manager/dist/cjs/accounts");
const programs_1 = require("@cardinal/token-manager/dist/cjs/programs");
const tokenManager_1 = require("@cardinal/token-manager/dist/cjs/programs/tokenManager");
const pda_1 = require("@cardinal/token-manager/dist/cjs/programs/tokenManager/pda");
const anchor_1 = require("@project-serum/anchor");
const token_1 = require("@project-serum/anchor/dist/cjs/utils/token");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../../utils");
const accounts_2 = require("../rewardDistributor/accounts");
const pda_2 = require("../rewardDistributor/pda");
const transaction_1 = require("../rewardDistributor/transaction");
const accounts_3 = require("./accounts");
const constants_1 = require("./constants");
const pda_3 = require("./pda");
const utils_2 = require("./utils");
/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
const withInitPoolIdentifier = async (transaction, connection, wallet) => {
    const identifierId = (0, pda_3.findIdentifierId)();
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .initIdentifier()
        .accounts({
        identifier: identifierId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, identifierId];
};
exports.withInitPoolIdentifier = withInitPoolIdentifier;
const withInitStakePool = async (transaction, connection, wallet, params) => {
    const identifierId = (0, pda_3.findIdentifierId)();
    const identifierData = await (0, common_1.tryGetAccount)(() => (0, accounts_3.getPoolIdentifier)(connection));
    const identifier = (identifierData === null || identifierData === void 0 ? void 0 : identifierData.parsed.count) || new anchor_1.BN(1);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    if (!identifierData) {
        const ix = await program.methods
            .initIdentifier()
            .accounts({
            identifier: identifierId,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .instruction();
        transaction.add(ix);
    }
    const stakePoolId = (0, pda_3.findStakePoolId)(identifier);
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
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, stakePoolId];
};
exports.withInitStakePool = withInitStakePool;
/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
const withInitStakeEntry = async (transaction, connection, wallet, params) => {
    const stakeEntryId = await (0, utils_2.findStakeEntryIdFromMint)(params.stakePoolId, params.originalMintId);
    const originalMintMetadatId = (0, common_1.findMintMetadataId)(params.originalMintId);
    const remainingAccounts = (0, utils_2.remainingAccountsForInitStakeEntry)(params.stakePoolId, params.originalMintId);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .initEntry(wallet.publicKey)
        .accounts({
        stakeEntry: stakeEntryId,
        stakePool: params.stakePoolId,
        originalMint: params.originalMintId,
        originalMintMetadata: originalMintMetadatId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
    transaction.add(ix);
    return [transaction, stakeEntryId];
};
exports.withInitStakeEntry = withInitStakeEntry;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withAuthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    const stakeAuthorizationId = (0, pda_3.findStakeAuthorizationId)(params.stakePoolId, params.originalMintId);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .authorizeMint(params.originalMintId)
        .accounts({
        stakePool: params.stakePoolId,
        stakeAuthorizationRecord: stakeAuthorizationId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withAuthorizeStakeEntry = withAuthorizeStakeEntry;
/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withDeauthorizeStakeEntry = async (transaction, connection, wallet, params) => {
    const stakeAuthorizationId = (0, pda_3.findStakeAuthorizationId)(params.stakePoolId, params.originalMintId);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withDeauthorizeStakeEntry = withDeauthorizeStakeEntry;
/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
const withInitStakeMint = async (transaction, connection, wallet, params) => {
    const [mintManagerId] = await (0, pda_1.findMintManagerId)(params.stakeMintKeypair.publicKey);
    const originalMintMetadataId = (0, common_1.findMintMetadataId)(params.originalMintId);
    const stakeMintMetadataId = (0, common_1.findMintMetadataId)(params.stakeMintKeypair.publicKey);
    const stakeEntryStakeMintTokenAccountId = await (0, common_1.findAta)(params.stakeMintKeypair.publicKey, params.stakeEntryId, true);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
        associatedToken: token_1.ASSOCIATED_PROGRAM_ID,
        tokenMetadataProgram: common_1.METADATA_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, params.stakeMintKeypair];
};
exports.withInitStakeMint = withInitStakeMint;
/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withClaimReceiptMint = async (transaction, connection, wallet, params) => {
    if (params.receiptType === constants_1.ReceiptType.Original &&
        (await (0, utils_1.getMintSupply)(connection, params.receiptMintId)).gt(new anchor_1.BN(1))) {
        throw new Error("Fungible staking and locked reecipt type not supported yet");
    }
    const tokenManagerReceiptMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.receiptMintId, (await (0, pda_1.findTokenManagerAddress)(params.receiptMintId))[0], wallet.publicKey, true);
    const stakeEntryReceiptMintTokenAccountId = await (0, common_1.findAta)(params.receiptMintId, params.stakeEntryId, true);
    const userReceiptMintTokenAccountId = await (0, common_1.findAta)(params.receiptMintId, wallet.publicKey, true);
    const [tokenManagerId] = await (0, pda_1.findTokenManagerAddress)(params.receiptMintId);
    const [mintCounterId] = await (0, pda_1.findMintCounterId)(params.receiptMintId);
    const remainingAccountsForKind = await (0, tokenManager_1.getRemainingAccountsForKind)(params.receiptMintId, params.receiptType === constants_1.ReceiptType.Original
        ? tokenManager_1.TokenManagerKind.Edition
        : tokenManager_1.TokenManagerKind.Managed);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
        associatedTokenProgram: token_1.ASSOCIATED_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
    })
        .remainingAccounts(remainingAccountsForKind)
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withClaimReceiptMint = withClaimReceiptMint;
/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withStake = async (transaction, connection, wallet, params) => {
    const stakeEntryId = await (0, utils_2.findStakeEntryIdFromMint)(params.stakePoolId, params.originalMintId);
    const stakeEntryOriginalMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .stake(params.amount || new anchor_1.BN(1), params.duration)
        .accounts({
        stakeEntry: stakeEntryId,
        stakePool: params.stakePoolId,
        stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
        originalMint: params.originalMintId,
        user: wallet.publicKey,
        userOriginalMintTokenAccount: params.userOriginalMintTokenAccountId,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withStake = withStake;
/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
const withUnstake = async (transaction, connection, wallet, params) => {
    const rewardDistributorId = (0, pda_2.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const stakeEntryId = await (0, utils_2.findStakeEntryIdFromMint)(params.stakePoolId, params.originalMintId);
    const [stakeEntryData, rewardDistributorData] = await Promise.all([
        (0, common_1.tryGetAccount)(() => (0, accounts_3.getStakeEntry)(connection, stakeEntryId)),
        (0, common_1.tryGetAccount)(() => (0, accounts_2.getRewardDistributor)(connection, rewardDistributorId)),
    ]);
    if (!stakeEntryData)
        throw "Stake entry not found";
    const stakePoolData = await (0, accounts_3.getStakePool)(connection, params.stakePoolId);
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
        await (0, exports.withReturnReceiptMint)(transaction, connection, wallet, {
            stakeEntryId: stakeEntryId,
        });
    }
    const stakeEntryOriginalMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.originalMintId, stakeEntryId, wallet.publicKey, true);
    const userOriginalMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, params.originalMintId, wallet.publicKey, wallet.publicKey);
    const remainingAccounts = await (0, utils_2.withRemainingAccountsForUnstake)(transaction, connection, wallet, stakeEntryId, stakeEntryData === null || stakeEntryData === void 0 ? void 0 : stakeEntryData.parsed.stakeMint);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .unstake()
        .accounts({
        stakePool: params.stakePoolId,
        stakeEntry: stakeEntryId,
        originalMint: params.originalMintId,
        stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
        user: wallet.publicKey,
        userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .remainingAccounts(remainingAccounts)
        .instruction();
    transaction.add(ix);
    // claim any rewards deserved
    if (rewardDistributorData) {
        await (0, transaction_1.withClaimRewards)(transaction, connection, wallet, {
            distributorId: params.distributorId,
            stakePoolId: params.stakePoolId,
            stakeEntryId: stakeEntryId,
            lastStaker: wallet.publicKey,
            skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
        });
    }
    return transaction;
};
exports.withUnstake = withUnstake;
const withUpdateStakePool = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withUpdateStakePool = withUpdateStakePool;
const withUpdateTotalStakeSeconds = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withUpdateTotalStakeSeconds = withUpdateTotalStakeSeconds;
const withReturnReceiptMint = async (transaction, connection, wallet, params) => {
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_3.getStakeEntry)(connection, params.stakeEntryId));
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
    const tokenManagerId = await (0, pda_1.tokenManagerAddressFromMint)(connection, receiptMint);
    const tokenManagerData = await (0, common_1.tryGetAccount)(() => programs_1.tokenManager.accounts.getTokenManager(connection, tokenManagerId));
    if (!tokenManagerData) {
        return transaction;
    }
    const remainingAccountsForReturn = await (0, tokenManager_1.withRemainingAccountsForReturn)(transaction, connection, wallet, tokenManagerData);
    const tokenManagerTokenAccountId = await (0, common_1.findAta)(receiptMint, tokenManagerData.pubkey, true);
    const userReceiptMintTokenAccountId = await (0, common_1.findAta)(receiptMint, wallet.publicKey, true);
    const transferAccounts = await (0, tokenManager_1.getRemainingAccountsForKind)(receiptMint, tokenManagerData.parsed.kind);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .returnReceiptMint()
        .accounts({
        stakeEntry: params.stakeEntryId,
        receiptMint: receiptMint,
        tokenManager: tokenManagerData.pubkey,
        tokenManagerTokenAccount: tokenManagerTokenAccountId,
        userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
        user: wallet.publicKey,
        collector: payment_manager_1.CRANK_KEY,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        tokenManagerProgram: tokenManager_1.TOKEN_MANAGER_ADDRESS,
        rent: web3_js_1.SYSVAR_RENT_PUBKEY,
    })
        .remainingAccounts([
        ...(tokenManagerData.parsed.state === tokenManager_1.TokenManagerState.Claimed
            ? transferAccounts
            : []),
        ...remainingAccountsForReturn,
    ])
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withReturnReceiptMint = withReturnReceiptMint;
const withCloseStakePool = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withCloseStakePool = withCloseStakePool;
const withCloseStakeEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withCloseStakeEntry = withCloseStakeEntry;
const withReassignStakeEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withReassignStakeEntry = withReassignStakeEntry;
const withDoubleOrResetTotalStakeSeconds = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .doubleOrResetTotalStakeSeconds()
        .accounts({
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        lastStaker: wallet.publicKey,
        recentSlothashes: web3_js_1.SYSVAR_SLOT_HASHES_PUBKEY,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withDoubleOrResetTotalStakeSeconds = withDoubleOrResetTotalStakeSeconds;
const withInitStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = (0, pda_3.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .initStakeBooster({
        stakePool: params.stakePoolId,
        identifier: params.stakeBoosterIdentifier || new anchor_1.BN(0),
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        paymentManager: constants_1.STAKE_BOOSTER_PAYMENT_MANAGER,
        boostSeconds: params.boostSeconds,
        startTimeSeconds: new anchor_1.BN(params.startTimeSeconds),
    })
        .accounts({
        stakeBooster: stakeBoosterId,
        stakePool: params.stakePoolId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withInitStakeBooster = withInitStakeBooster;
const withUpdateStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = (0, pda_3.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .updateStakeBooster({
        paymentAmount: params.paymentAmount,
        paymentMint: params.paymentMint,
        paymentManager: constants_1.STAKE_BOOSTER_PAYMENT_MANAGER,
        boostSeconds: params.boostSeconds,
        startTimeSeconds: new anchor_1.BN(params.startTimeSeconds),
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
exports.withUpdateStakeBooster = withUpdateStakeBooster;
const withCloseStakeBooster = async (transaction, connection, wallet, params) => {
    const stakeBoosterId = (0, pda_3.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withCloseStakeBooster = withCloseStakeBooster;
const withBoostStakeEntry = async (transaction, connection, wallet, params) => {
    var _a, _b;
    const stakeBoosterId = (0, pda_3.findStakeBoosterId)(params.stakePoolId, params.stakeBoosterIdentifier);
    const stakeBooster = await (0, accounts_3.getStakeBooster)(connection, stakeBoosterId);
    const paymentManager = await (0, accounts_1.getPaymentManager)(connection, stakeBooster.parsed.paymentManager);
    const feeCollectorTokenAccount = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, stakeBooster.parsed.paymentMint, paymentManager.parsed.feeCollector, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const paymentRecipientTokenAccount = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, stakeBooster.parsed.paymentMint, stakeBooster.parsed.paymentRecipient, (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey);
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
        cardinalPaymentManager: payment_manager_1.PAYMENT_MANAGER_ADDRESS,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withBoostStakeEntry = withBoostStakeEntry;
/**
 * Add init group stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withInitGroupStakeEntry = async (transaction, connection, wallet, params) => {
    const id = web3_js_1.Keypair.generate();
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const groupEntryId = (0, pda_3.findGroupEntryId)(id.publicKey);
    const ix = await program.methods
        .initGroupEntry({
        groupId: id.publicKey,
        groupCooldownSeconds: params.groupCooldownSeconds || null,
        groupStakeSeconds: params.groupStakeSeconds || null,
    })
        .accounts({
        groupEntry: groupEntryId,
        authority: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, groupEntryId];
};
exports.withInitGroupStakeEntry = withInitGroupStakeEntry;
/**
 * Add a stake entry to the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withAddToGroupEntry = async (transaction, connection, wallet, params) => {
    var _a;
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .addToGroupEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
        payer: (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withAddToGroupEntry = withAddToGroupEntry;
/**
 * Remove stake entry from the group entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withRemoveFromGroupEntry = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const ix = await program.methods
        .removeFromGroupEntry()
        .accounts({
        groupEntry: params.groupEntryId,
        stakeEntry: params.stakeEntryId,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withRemoveFromGroupEntry = withRemoveFromGroupEntry;
/**
 * Add init ungrouping instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created group stake entry
 */
const withInitUngrouping = async (transaction, connection, wallet, params) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
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
exports.withInitUngrouping = withInitUngrouping;
const withClaimStakeEntryFunds = async (transaction, connection, wallet, stakeEntryId, fundsMintId) => {
    const program = (0, constants_1.stakePoolProgram)(connection, wallet);
    const stakeEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_3.getStakeEntry)(connection, stakeEntryId));
    if (!stakeEntryData) {
        throw `No stake entry id with address ${stakeEntryId.toString()}`;
    }
    const stakeEntryFundsMintTokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(fundsMintId, stakeEntryId, true);
    const userFundsMintTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, fundsMintId, stakeEntryData.parsed.lastStaker, wallet.publicKey, true);
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
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .instruction();
    transaction.add(ix);
    return [transaction];
};
exports.withClaimStakeEntryFunds = withClaimStakeEntryFunds;
//# sourceMappingURL=transaction.js.map