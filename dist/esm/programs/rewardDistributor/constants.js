import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_reward_distributor";
export const REWARD_DISTRIBUTOR_ADDRESS = new PublicKey(
  "rwdNPNPS6zNvtF6FMvaxPRjzu2eC51mXaDT9rmWsojp"
);
export const REWARD_MANAGER = new PublicKey(
  "crkdpVWjHWdggGgBuSyAqSmZUmAjYLzD435tcLDRLXr"
);
export const REWARD_ENTRY_SEED = "reward-entry";
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
