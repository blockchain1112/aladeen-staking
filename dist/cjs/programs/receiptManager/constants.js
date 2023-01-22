"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiptManagerProgram =
  exports.RECEIPT_MANAGER_PAYMENT_MANAGER =
  exports.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME =
  exports.RECEIPT_MANAGER_IDL =
  exports.RECEIPT_ENTRY_SEED =
  exports.REWARD_RECEIPT_SEED =
  exports.RECEIPT_MANAGER_SEED =
  exports.RECEIPT_MANAGER_ADDRESS =
    void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const RECEIPT_MANAGER_TYPES = tslib_1.__importStar(
  require("../../idl/cardinal_receipt_manager")
);
exports.RECEIPT_MANAGER_ADDRESS = new web3_js_1.PublicKey(
  "5u66Lbk1j7mDn8XC4yf8KK8Nhz4WZvxhQofj8ZuSPobF"
);
exports.RECEIPT_MANAGER_SEED = "receipt-manager";
exports.REWARD_RECEIPT_SEED = "reward-receipt";
exports.RECEIPT_ENTRY_SEED = "receipt-entry";
exports.RECEIPT_MANAGER_IDL = RECEIPT_MANAGER_TYPES.IDL;
exports.RECEIPT_MANAGER_PAYMENT_MANAGER_NAME = "cardinal-receipt-manager";
exports.RECEIPT_MANAGER_PAYMENT_MANAGER = new web3_js_1.PublicKey(
  "FQJ2czigCYygS8v8trLU7TBAi7NjRN1h1C2vLAh2GYDi" // cardinal-receipt-manager
);
const receiptManagerProgram = (connection, wallet, confirmOptions) => {
  return new anchor_1.Program(
    exports.RECEIPT_MANAGER_IDL,
    exports.RECEIPT_MANAGER_ADDRESS,
    new anchor_1.AnchorProvider(
      connection,
      wallet !== null && wallet !== void 0
        ? wallet
        : (0, common_1.emptyWallet)(web3_js_1.Keypair.generate().publicKey),
      confirmOptions !== null && confirmOptions !== void 0 ? confirmOptions : {}
    )
  );
};
exports.receiptManagerProgram = receiptManagerProgram;
//# sourceMappingURL=constants.js.map
