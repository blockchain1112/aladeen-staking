"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const common_1 = require("@cardinal/common");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const src_1 = require("../../src");
exports.commandName = "transferTokens";
exports.description = "Add tokens to reward distributor";
const getArgs = (_connection, _wallet) => ({
    mint: new web3_js_1.PublicKey(""),
    rewardDistributorId: new web3_js_1.PublicKey(""),
    amount: 0,
    decimals: 0,
});
exports.getArgs = getArgs;
const handler = async (connection, wallet, args) => {
    const { mint, rewardDistributorId, amount, decimals } = args;
    const ownerAtaId = (0, spl_token_1.getAssociatedTokenAddressSync)(mint, wallet.publicKey, true);
    const transaction = new web3_js_1.Transaction();
    const rewardDistributorAtaId = await (0, common_1.withFindOrInitAssociatedTokenAccount)(transaction, connection, mint, rewardDistributorId, wallet.publicKey, true);
    transaction.add((0, spl_token_1.createTransferCheckedInstruction)(ownerAtaId, mint, rewardDistributorAtaId, wallet.publicKey, amount, decimals));
    const txid = await (0, src_1.executeTransaction)(connection, wallet, transaction, {});
    console.log(`[success] https://explorer.solana.com/tx/${txid}`);
};
exports.handler = handler;
//# sourceMappingURL=transferTokens.js.map