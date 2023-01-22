"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.executeTransactions = exports.executeTransaction = exports.createMasterEditionTx = exports.createMasterEdition = exports.createMintTx = exports.createMint = exports.newAccountWithLamports = exports.delay = void 0;
const common_1 = require("@cardinal/common");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const mplx_v2_1 = require("mplx-v2");
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.delay = delay;
async function newAccountWithLamports(connection, lamports = web3_js_1.LAMPORTS_PER_SOL * 10, keypair = web3_js_1.Keypair.generate()) {
    const account = keypair;
    const signature = await connection.requestAirdrop(account.publicKey, lamports);
    await connection.confirmTransaction(signature, "confirmed");
    return account;
}
exports.newAccountWithLamports = newAccountWithLamports;
const createMint = async (connection, wallet, config) => {
    const mintKeypair = web3_js_1.Keypair.generate();
    const mintId = mintKeypair.publicKey;
    const [tx, ata] = await (0, exports.createMintTx)(connection, mintKeypair.publicKey, wallet.publicKey, config);
    await executeTransaction(connection, tx, wallet, { signers: [mintKeypair] });
    return [ata, mintId];
};
exports.createMint = createMint;
const createMintTx = async (connection, mintId, authority, config) => {
    var _a, _b, _c;
    const target = (_a = config === null || config === void 0 ? void 0 : config.target) !== null && _a !== void 0 ? _a : authority;
    const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(mintId, target, true);
    return [
        new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: authority,
            newAccountPubkey: mintId,
            space: spl_token_1.MINT_SIZE,
            lamports: await (0, spl_token_1.getMinimumBalanceForRentExemptMint)(connection),
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMint2Instruction)(mintId, (_b = config === null || config === void 0 ? void 0 : config.decimals) !== null && _b !== void 0 ? _b : 0, authority, authority), (0, spl_token_1.createAssociatedTokenAccountInstruction)(authority, ata, target, mintId), (0, spl_token_1.createMintToInstruction)(mintId, ata, authority, (_c = config === null || config === void 0 ? void 0 : config.amount) !== null && _c !== void 0 ? _c : 1)),
        ata,
    ];
};
exports.createMintTx = createMintTx;
const createMasterEdition = async (connection, wallet, config) => {
    var _a;
    const mintKeypair = web3_js_1.Keypair.generate();
    const mintId = mintKeypair.publicKey;
    const target = (_a = config === null || config === void 0 ? void 0 : config.target) !== null && _a !== void 0 ? _a : wallet.publicKey;
    const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(mintId, target, true);
    const tx = await (0, exports.createMasterEditionTx)(connection, mintKeypair.publicKey, wallet.publicKey, config);
    await executeTransaction(connection, tx, wallet, { signers: [mintKeypair] });
    return [ata, mintId];
};
exports.createMasterEdition = createMasterEdition;
const createMasterEditionTx = async (connection, mintId, authority, config) => {
    var _a;
    const target = (_a = config === null || config === void 0 ? void 0 : config.target) !== null && _a !== void 0 ? _a : authority;
    const ata = (0, spl_token_1.getAssociatedTokenAddressSync)(mintId, target);
    const metadataId = (0, common_1.findMintMetadataId)(mintId);
    const editionId = (0, common_1.findMintEditionId)(mintId);
    return new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
        fromPubkey: authority,
        newAccountPubkey: mintId,
        space: spl_token_1.MINT_SIZE,
        lamports: await (0, spl_token_1.getMinimumBalanceForRentExemptMint)(connection),
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }), (0, spl_token_1.createInitializeMint2Instruction)(mintId, 0, authority, authority), (0, spl_token_1.createAssociatedTokenAccountInstruction)(authority, ata, target, mintId), (0, spl_token_1.createMintToInstruction)(mintId, ata, authority, 1), (0, mplx_v2_1.createCreateMetadataAccountV2Instruction)({
        metadata: metadataId,
        mint: mintId,
        updateAuthority: authority,
        mintAuthority: authority,
        payer: authority,
    }, {
        createMetadataAccountArgsV2: {
            data: {
                name: `name-${Math.random()}`,
                symbol: "SYMB",
                uri: `uri-${Math.random()}`,
                sellerFeeBasisPoints: 0,
                creators: [{ address: authority, share: 100, verified: true }],
                collection: null,
                uses: null,
            },
            isMutable: true,
        },
    }), (0, mplx_v2_1.createCreateMasterEditionV3Instruction)({
        edition: editionId,
        mint: mintId,
        updateAuthority: authority,
        mintAuthority: authority,
        metadata: metadataId,
        payer: authority,
    }, { createMasterEditionArgs: { maxSupply: 0 } }));
};
exports.createMasterEditionTx = createMasterEditionTx;
async function executeTransaction(connection, tx, wallet, config) {
    var _a;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey;
    tx = await wallet.signTransaction(tx);
    if (config === null || config === void 0 ? void 0 : config.signers) {
        tx.partialSign(...((_a = config === null || config === void 0 ? void 0 : config.signers) !== null && _a !== void 0 ? _a : []));
    }
    try {
        const txid = await (0, web3_js_1.sendAndConfirmRawTransaction)(connection, tx.serialize());
        return txid;
    }
    catch (e) {
        if (!(config === null || config === void 0 ? void 0 : config.silent)) {
            (0, exports.handleError)(e);
        }
        throw e;
    }
}
exports.executeTransaction = executeTransaction;
async function executeTransactions(connection, txs, wallet, config) {
    const latestBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signedTxs = await wallet.signAllTransactions(txs.map((tx) => {
        var _a;
        tx.recentBlockhash = latestBlockhash;
        tx.feePayer = wallet.publicKey;
        if (config === null || config === void 0 ? void 0 : config.signers) {
            tx.partialSign(...((_a = config === null || config === void 0 ? void 0 : config.signers) !== null && _a !== void 0 ? _a : []));
        }
        return tx;
    }));
    const txids = await Promise.all(signedTxs.map(async (tx) => {
        try {
            const txid = await (0, web3_js_1.sendAndConfirmRawTransaction)(connection, tx.serialize());
            return txid;
        }
        catch (e) {
            if (!(config === null || config === void 0 ? void 0 : config.silent)) {
                (0, exports.handleError)(e);
            }
            throw e;
        }
    }));
    return txids;
}
exports.executeTransactions = executeTransactions;
const handleError = (e) => {
    var _a;
    const message = (_a = e.message) !== null && _a !== void 0 ? _a : "";
    const logs = e.logs;
    if (logs) {
        console.error(logs, message);
    }
    else {
        console.error(e, message);
    }
};
exports.handleError = handleError;
//# sourceMappingURL=utils.js.map