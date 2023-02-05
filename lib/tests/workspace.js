"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProvider = exports.newAccountWithLamports = exports.getConnection = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
function getConnection() {
    const url = "https://necessary-solitary-morning.solana-devnet.quiknode.pro/4bce0053d36a231869662a8714d6af4da0d9ac5e/";
    return new web3_js_1.Connection(url, "confirmed");
}
exports.getConnection = getConnection;
async function newAccountWithLamports(connection, lamports = web3_js_1.LAMPORTS_PER_SOL * 1, keypair = web3_js_1.Keypair.generate()) {
    const account = keypair;
    const signature = await connection.requestAirdrop(account.publicKey, lamports);
    await connection.confirmTransaction(signature, "confirmed");
    return account;
}
exports.newAccountWithLamports = newAccountWithLamports;
async function getProvider() {
    const connection = getConnection();
    const keypair = await newAccountWithLamports(connection);
    const wallet = new anchor_1.Wallet(keypair);
    return {
        connection,
        wallet,
    };
}
exports.getProvider = getProvider;
//# sourceMappingURL=workspace.js.map