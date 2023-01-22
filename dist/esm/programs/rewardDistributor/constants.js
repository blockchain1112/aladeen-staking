import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_reward_distributor";
export const REWARD_DISTRIBUTOR_ADDRESS = new PublicKey(
  "J8KGQczjGYRvqDwMuQ6jBhZdFfLHzHmLTWZRuCCu6mrY"
);
export const REWARD_MANAGER = new PublicKey(
  "5nx4MybNcPBut1yMBsandykg2n99vQGAqXR3ymEXzQze"
);
export const REWARD_ENTRY_SEED = "reward-entry";
export const REWARD_AUTHORITY_SEED = "reward-authority";
export const REWARD_DISTRIBUTOR_SEED = "reward-distributor";
export const REWARD_DISTRIBUTOR_IDL = REWARD_DISTRIBUTOR_TYPES.IDL;
export var RewardDistributorKind;
(function (RewardDistributorKind) {
  RewardDistributorKind[(RewardDistributorKind["Mint"] = 1)] = "Mint";
  RewardDistributorKind[(RewardDistributorKind["Treasury"] = 2)] = "Treasury";
})(RewardDistributorKind || (RewardDistributorKind = {}));
export const rewardDistributorProgram = (
  connection,
  wallet,
  confirmOptions
) => {
  return new Program(
    REWARD_DISTRIBUTOR_IDL,
    REWARD_DISTRIBUTOR_ADDRESS,
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
