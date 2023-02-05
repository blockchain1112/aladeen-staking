"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withReclaimFunds = exports.withUpdateRewardDistributor = exports.withCloseRewardEntry = exports.withUpdateRewardEntry = exports.withCloseRewardDistributor = exports.withClaimRewards = exports.withInitRewardEntry = exports.withInitRewardDistributor = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const accounts_1 = require("./accounts");
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const utils_1 = require("./utils");
const withInitRewardDistributor = async (transaction, connection, wallet, params) => {
    const rewardAuthority = (0, pda_1.findRewardAuthority)(wallet.publicKey);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const remainingAccountsForKind = await (0, utils_1.withRemainingAccountsForKind)(transaction, connection, wallet, rewardAuthority, params.kind || constants_1.RewardDistributorKind.Mint, params.rewardMintId);
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
    const ix = await program.methods
        .initRewardDistributor({
        rewardAmount: params.rewardAmount || new anchor_1.BN(1),
        rewardDurationSeconds: params.rewardDurationSeconds || new anchor_1.BN(1),
        maxSupply: params.maxSupply || null,
        supply: params.supply || null,
        kind: params.kind || constants_1.RewardDistributorKind.Mint,
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
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts(remainingAccountsForKind)
        .instruction();
    const initRewardAuthorityIx = await program.methods
        .initRewardAuthority({})
        .accounts({
        rewardAuthority,
        authority: wallet.publicKey,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(initRewardAuthorityIx);
    transaction.add(ix);
    return [transaction, rewardDistributorId];
};
exports.withInitRewardDistributor = withInitRewardDistributor;
const withInitRewardEntry = async (transaction, connection, wallet, params) => {
    const rewardEntryId = (0, pda_1.findRewardEntryId)(params.rewardDistributorId, params.stakeEntryId);
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
    const ix = await program.methods
        .initRewardEntry()
        .accounts({
        rewardEntry: rewardEntryId,
        stakeEntry: params.stakeEntryId,
        rewardDistributor: params.rewardDistributorId,
        payer: wallet.publicKey,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .instruction();
    transaction.add(ix);
    return [transaction, rewardEntryId];
};
exports.withInitRewardEntry = withInitRewardEntry;
const withClaimRewards = async (transaction, connection, wallet, params) => {
    var _a, _b;
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const rewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId));
    const rewardAuthority = rewardDistributorData === null || rewardDistributorData === void 0 ? void 0 : rewardDistributorData.parsed.rewardAuthority;
    const rewardMintTokenAccountId = params.skipRewardMintTokenAccount
        ? await (0, common_1.findAta)(rewardDistributorData.parsed.rewardMint, params.lastStaker, true)
        : await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, rewardDistributorData.parsed.rewardMint, params.lastStaker, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const remainingAccountsForKind = await (0, utils_1.withRemainingAccountsForKind)(transaction, connection, wallet, rewardAuthority, rewardDistributorData.parsed.kind, rewardDistributorData.parsed.rewardMint, true);
    const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorData.pubkey, params.stakeEntryId);
    const rewardEntryData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardEntry)(connection, rewardEntryId));
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
    if (!rewardEntryData) {
        const ix = await program.methods
            .initRewardEntry()
            .accounts({
            rewardEntry: rewardEntryId,
            stakeEntry: params.stakeEntryId,
            rewardDistributor: rewardDistributorData.pubkey,
            payer: wallet.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .instruction();
        transaction.add(ix);
    }
    const ix = await program.methods
        .claimRewards()
        .accounts({
        rewardEntry: rewardEntryId,
        rewardDistributor: rewardDistributorData.pubkey,
        rewardAuthority,
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        rewardMint: rewardDistributorData.parsed.rewardMint,
        userRewardMintTokenAccount: rewardMintTokenAccountId,
        rewardManager: constants_1.REWARD_MANAGER,
        user: (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        systemProgram: web3_js_1.SystemProgram.programId,
    })
        .remainingAccounts(remainingAccountsForKind)
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withClaimRewards = withClaimRewards;
const withCloseRewardDistributor = async (transaction, connection, wallet, params) => {
    const rewardAuthority = (0, pda_1.findRewardAuthority)(wallet.publicKey);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const rewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId));
    if (rewardDistributorData) {
        const remainingAccountsForKind = await (0, utils_1.withRemainingAccountsForKind)(transaction, connection, wallet, rewardAuthority, rewardDistributorData.parsed.kind, rewardDistributorData.parsed.rewardMint);
        const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
        const ix = await program.methods
            .closeRewardDistributor()
            .accounts({
            rewardDistributor: rewardDistributorData.pubkey,
            rewardAuthority,
            stakePool: params.stakePoolId,
            rewardMint: rewardDistributorData.parsed.rewardMint,
            signer: wallet.publicKey,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
        })
            .remainingAccounts(remainingAccountsForKind)
            .instruction();
        transaction.add(ix);
    }
    return transaction;
};
exports.withCloseRewardDistributor = withCloseRewardDistributor;
const withUpdateRewardEntry = async (transaction, connection, wallet, params) => {
    const rewardAuthority = (0, pda_1.findRewardAuthority)(wallet.publicKey);
    const rewardEntryId = (0, pda_1.findRewardEntryId)(params.rewardDistributorId, params.stakeEntryId);
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
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
exports.withUpdateRewardEntry = withUpdateRewardEntry;
const withCloseRewardEntry = async (transaction, connection, wallet, params) => {
    const rewardAuthority = (0, pda_1.findRewardAuthority)(wallet.publicKey);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorId, params.stakeEntryId);
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
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
exports.withCloseRewardEntry = withCloseRewardEntry;
const withUpdateRewardDistributor = async (transaction, connection, wallet, params) => {
    const rewardAuthority = (0, pda_1.findRewardAuthority)(wallet.publicKey);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const rewardDistributorData = await (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId);
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
    const ix = await program.methods
        .updateRewardDistributor({
        defaultMultiplier: params.defaultMultiplier ||
            rewardDistributorData.parsed.defaultMultiplier,
        multiplierDecimals: params.multiplierDecimals ||
            rewardDistributorData.parsed.multiplierDecimals,
        rewardAmount: params.rewardAmount || rewardDistributorData.parsed.rewardAmount,
        rewardDurationSeconds: params.rewardDurationSeconds ||
            rewardDistributorData.parsed.rewardDurationSeconds,
        maxRewardSecondsReceived: params.maxRewardSecondsReceived ||
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
exports.withUpdateRewardDistributor = withUpdateRewardDistributor;
const withReclaimFunds = async (transaction, connection, wallet, params) => {
    const rewardAuthority = (0, pda_1.findRewardAuthority)(wallet.publicKey);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(params.stakePoolId, params.distributorId);
    const rewardDistributorData = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getRewardDistributor)(connection, rewardDistributorId));
    if (!rewardDistributorData) {
        throw new Error("No reward distrbutor found");
    }
    const rewardDistributorTokenAccountId = await (0, common_1.findAta)(rewardDistributorData.parsed.rewardMint, rewardAuthority, true);
    const authorityTokenAccountId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, rewardDistributorData.parsed.rewardMint, wallet.publicKey, wallet.publicKey, true);
    const program = (0, constants_1.rewardDistributorProgram)(connection, wallet);
    const ix = await program.methods
        .reclaimFunds(params.amount)
        .accounts({
        rewardDistributor: rewardDistributorId,
        rewardAuthority,
        rewardDistributorTokenAccount: rewardDistributorTokenAccountId,
        authorityTokenAccount: authorityTokenAccountId,
        authority: wallet.publicKey,
        tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
    })
        .instruction();
    transaction.add(ix);
    return transaction;
};
exports.withReclaimFunds = withReclaimFunds;
//# sourceMappingURL=transaction.js.map