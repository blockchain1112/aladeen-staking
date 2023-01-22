"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectionFor = void 0;
const tslib_1 = require("tslib");
const web3_js_1 = require("@solana/web3.js");
const dotenv = tslib_1.__importStar(require("dotenv"));
dotenv.config();
const networkURLs = {
    ["mainnet-beta"]: (_a = process.env.MAINNET_PRIMARY_URL) !== null && _a !== void 0 ? _a : "https://solana-api.projectserum.com",
    mainnet: (_b = process.env.MAINNET_PRIMARY_URL) !== null && _b !== void 0 ? _b : "https://solana-api.projectserum.com",
    devnet: "https://api.devnet.solana.com/",
    testnet: "https://api.testnet.solana.com/",
    localnet: "http://localhost:8899/",
};
const connectionFor = (cluster, defaultCluster = "mainnet") => {
    return new web3_js_1.Connection(process.env.RPC_URL || networkURLs[cluster || defaultCluster] || "", "recent");
};
exports.connectionFor = connectionFor;
//# sourceMappingURL=connection.js.map