import { findAta, tryGetAccount, withFindOrInitAssociatedTokenAccount, } from "@cardinal/common";
import { BN } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SystemProgram } from "@solana/web3.js";
import { getRewardDistributor, getRewardEntry } from "./accounts";
import { REWARD_MANAGER, RewardDistributorKind, rewardDistributorProgram, } from "./constants";
import { findRewardAuthority, findRewardDistributorId, findRewardEntryId, } from "./pda";
import { withRemainingAccountsForKind } from "./utils";
export const withInitRewardDistributor = async (transaction, connection, wallet, params) => {
    const rewardAuthority = findRewardAuthority(wallet.publicKey);
    const rewardDistributorId = findRewardDistributorId(params.stakePoolId, params.distributorId, params.stakePoolDuration);
    const remainingAccountsForKind = await withRemainingAccountsForKind(transaction, connection, wallet, rewardAuthority, params.kind || RewardDistributorKind.Treasury, params.rewardMintId, undefined, params.createRewardDistributorMintTokenAccount);
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
        stakePoolDuration: params.stakePoolDuration,
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
export const withInitRewardEntry = async (transaction, connection, wallet, params) => {
    const rewardEntryId = findRewardEntryId(params.rewardDistributorId, params.stakeEntryId);
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
export const withClaimRewards = async (transaction, connection, wallet, params) => {
    var _a, _b;
    const rewardDistributorId = findRewardDistributorId(params.stakePoolId, params.distributorId, params.stakePoolDuration);
    const rewardDistributorData = await tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId));
    const rewardAuthority = rewardDistributorData === null || rewardDistributorData === void 0 ? void 0 : rewardDistributorData.parsed.rewardAuthority;
    const rewardMintTokenAccountId = params.skipRewardMintTokenAccount
        ? await findAta(rewardDistributorData.parsed.rewardMint, params.lastStaker, true)
        : await withFindOrInitAssociatedTokenAccount(transaction, connection, rewardDistributorData.parsed.rewardMint, params.lastStaker, (_a = params.payer) !== null && _a !== void 0 ? _a : wallet.publicKey);
    const remainingAccountsForKind = await withRemainingAccountsForKind(transaction, connection, wallet, rewardAuthority, rewardDistributorData.parsed.kind, rewardDistributorData.parsed.rewardMint, true);
    const rewardEntryId = findRewardEntryId(rewardDistributorData.pubkey, params.stakeEntryId);
    const rewardEntryData = await tryGetAccount(() => getRewardEntry(connection, rewardEntryId));
    const program = rewardDistributorProgram(connection, wallet);
    if (!rewardEntryData) {
        const ix = await program.methods
            .initRewardEntry()
            .accounts({
            rewardEntry: rewardEntryId,
            stakeEntry: params.stakeEntryId,
            rewardDistributor: rewardDistributorData.pubkey,
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
        rewardDistributor: rewardDistributorData.pubkey,
        rewardAuthority,
        stakeEntry: params.stakeEntryId,
        stakePool: params.stakePoolId,
        rewardMint: rewardDistributorData.parsed.rewardMint,
        userRewardMintTokenAccount: rewardMintTokenAccountId,
        rewardManager: REWARD_MANAGER,
        user: (_b = params.payer) !== null && _b !== void 0 ? _b : wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
    })
        .remainingAccounts(remainingAccountsForKind)
        .instruction();
    transaction.add(ix);
    return transaction;
};
export const withCloseRewardDistributor = async (transaction, connection, wallet, params) => {
    const rewardAuthority = findRewardAuthority(wallet.publicKey);
    const rewardDistributorId = findRewardDistributorId(params.stakePoolId, params.distributorId, params.stakePoolDuration);
    const rewardDistributorData = await tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId));
    if (rewardDistributorData) {
        const remainingAccountsForKind = await withRemainingAccountsForKind(transaction, connection, wallet, rewardAuthority, rewardDistributorData.parsed.kind, rewardDistributorData.parsed.rewardMint);
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
export const withUpdateRewardEntry = async (transaction, connection, wallet, params) => {
    const rewardAuthority = findRewardAuthority(wallet.publicKey);
    const rewardEntryId = findRewardEntryId(params.rewardDistributorId, params.stakeEntryId);
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
export const withCloseRewardEntry = async (transaction, connection, wallet, params) => {
    const rewardAuthority = findRewardAuthority(wallet.publicKey);
    const rewardDistributorId = findRewardDistributorId(params.stakePoolId, params.distributorId, params.stakePoolDuration);
    const rewardEntryId = findRewardEntryId(rewardDistributorId, params.stakeEntryId);
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
export const withUpdateRewardDistributor = async (transaction, connection, wallet, params) => {
    const rewardAuthority = findRewardAuthority(wallet.publicKey);
    const rewardDistributorId = findRewardDistributorId(params.stakePoolId, params.distributorId, params.stakePoolDuration);
    const rewardDistributorData = await getRewardDistributor(connection, rewardDistributorId);
    const program = rewardDistributorProgram(connection, wallet);
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
export const withReclaimFunds = async (transaction, connection, wallet, params) => {
    const rewardAuthority = findRewardAuthority(wallet.publicKey);
    const rewardDistributorId = findRewardDistributorId(params.stakePoolId, params.distributorId, params.stakePoolDuration);
    const rewardDistributorData = await tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId));
    if (!rewardDistributorData) {
        throw new Error("No reward distrbutor found");
    }
    const rewardDistributorTokenAccountId = await findAta(rewardDistributorData.parsed.rewardMint, rewardAuthority, true);
    const authorityTokenAccountId = await withFindOrInitAssociatedTokenAccount(transaction, connection, rewardDistributorData.parsed.rewardMint, wallet.publicKey, wallet.publicKey, true);
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
//# sourceMappingURL=transaction.js.map