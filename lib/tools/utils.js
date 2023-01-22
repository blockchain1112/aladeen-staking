"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.executeTransactions = exports.executeTransaction = exports.publicKeyFrom = exports.keypairFrom = exports.chunkArray = exports.stakePoolKind = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const rewards_center_1 = require("@cardinal/rewards-center");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const dotenv = tslib_1.__importStar(require("dotenv"));
const accounts_1 = require("../src/programs/stakePool/accounts");
dotenv.config();
const stakePoolKind = async (connection, stakePoolAddress) => {
    const checkStakePooolV1 = await (0, common_1.tryGetAccount)(() => (0, accounts_1.getStakePool)(connection, stakePoolAddress));
    if (checkStakePooolV1)
        return "v1";
    const checkStakePoolV2 = await (0, rewards_center_1.fetchIdlAccountNullable)(connection, stakePoolAddress, "stakePool");
    if (checkStakePoolV2)
        return "v2";
    return "unknown";
};
exports.stakePoolKind = stakePoolKind;
function chunkArray(arr, size) {
    return arr.length > size
        ? [arr.slice(0, size), ...chunkArray(arr.slice(size), size)]
        : [arr];
}
exports.chunkArray = chunkArray;
const keypairFrom = (s, n) => {
    try {
        if (s.includes("[")) {
            return web3_js_1.Keypair.fromSecretKey(Buffer.from(s
                .replace("[", "")
                .replace("]", "")
                .split(",")
                .map((c) => parseInt(c))));
        }
        else {
            return web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode(s));
        }
    }
    catch (e) {
        try {
            return web3_js_1.Keypair.fromSecretKey(Buffer.from(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            JSON.parse(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-var-requires
            require("fs").readFileSync(s, {
                encoding: "utf-8",
            }))));
        }
        catch (e) {
            process.stdout.write(`${n !== null && n !== void 0 ? n : "keypair"} is not valid keypair`);
            process.exit(1);
        }
    }
};
exports.keypairFrom = keypairFrom;
const publicKeyFrom = (s, n) => {
    try {
        return new web3_js_1.PublicKey(s);
    }
    catch (e) {
        process.stdout.write(`${n !== null && n !== void 0 ? n : "publicKey"} is not valid publicKey`);
        process.exit(1);
    }
};
exports.publicKeyFrom = publicKeyFrom;
async function executeTransaction(connection, tx, wallet, config) {
    var _a;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = wallet.publicKey;
    await wallet.signTransaction(tx);
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
        console.log(logs, message);
    }
    else {
        console.log(e, message);
    }
};
exports.handleError = handleError;
//# sourceMappingURL=utils.js.map