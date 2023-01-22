import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as RECEIPT_MANAGER_TYPES from "../../idl/cardinal_receipt_manager";
export const RECEIPT_MANAGER_ADDRESS = new PublicKey(
  "5u66Lbk1j7mDn8XC4yf8KK8Nhz4WZvxhQofj8ZuSPobF"
);
export const RECEIPT_MANAGER_SEED = "receipt-manager";
export const REWARD_RECEIPT_SEED = "reward-receipt";
export const RECEIPT_ENTRY_SEED = "receipt-entry";
export const RECEIPT_MANAGER_IDL = RECEIPT_MANAGER_TYPES.IDL;
export const RECEIPT_MANAGER_PAYMENT_MANAGER_NAME = "cardinal-receipt-manager";
export const RECEIPT_MANAGER_PAYMENT_MANAGER = new PublicKey(
  "FQJ2czigCYygS8v8trLU7TBAi7NjRN1h1C2vLAh2GYDi" // cardinal-receipt-manager
);
export const receiptManagerProgram = (connection, wallet, confirmOptions) => {
  return new Program(
    RECEIPT_MANAGER_IDL,
    RECEIPT_MANAGER_ADDRESS,
    new AnchorProvider(
      connection,
      wallet !== null && wallet !== void 0
        ? wallet
        : emptyWallet(Keypair.generate().publicKey),
      confirmOptions !== null && confirmOptions !== void 0 ? confirmOptions : {}
    )
  );
};
//# sourceMappingURL=constants.js.map
