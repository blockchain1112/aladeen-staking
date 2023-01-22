import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as STAKE_POOL_TYPES from "../../idl/cardinal_stake_pool";
export const STAKE_POOL_ADDRESS = new PublicKey(
  "wfXTQapJ9XWsRTWA6W4EaNDizPn1oESNjBLMhoKkag7"
);
export const STAKE_POOL_SEED = "stake-pool";
export const STAKE_ENTRY_SEED = "stake-entry";
export const GROUP_ENTRY_SEED = "group-entry";
export const IDENTIFIER_SEED = "identifier";
export const STAKE_AUTHORIZATION_SEED = "stake-authorization";
export const STAKE_BOOSTER_SEED = "stake-booster";
export const AUTHORITY_OFFSET = 25;
export const STAKER_OFFSET = 82;
export const GROUP_STAKER_OFFSET = 8 + 1 + 32;
export const POOL_OFFSET = 9;
export const STAKE_POOL_IDL = STAKE_POOL_TYPES.IDL;
export const STAKE_BOOSTER_PAYMENT_MANAGER_NAME = "cardinal-stake-booster";
export const STAKE_BOOSTER_PAYMENT_MANAGER = new PublicKey(
  "CuEDMUqgkGTVcAaqEDHuVR848XN38MPsD11JrkxcGD6a" // cardinal-stake-booster
);
export var ReceiptType;
(function (ReceiptType) {
  // Receive the original mint wrapped in a token manager
  ReceiptType[(ReceiptType["Original"] = 1)] = "Original";
  // Receive a receipt mint wrapped in a token manager
  ReceiptType[(ReceiptType["Receipt"] = 2)] = "Receipt";
  // Receive nothing
  ReceiptType[(ReceiptType["None"] = 3)] = "None";
})(ReceiptType || (ReceiptType = {}));
export const stakePoolProgram = (connection, wallet, confirmOptions) => {
  return new Program(
    STAKE_POOL_IDL,
    STAKE_POOL_ADDRESS,
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
