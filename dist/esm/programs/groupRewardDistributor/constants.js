import { emptyWallet } from "@cardinal/common";
import { AnchorProvider, Program } from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import * as GROUP_REWARD_DISTRIBUTOR_TYPES from "../../idl/cardinal_group_reward_distributor";
export const GROUP_REWARD_DISTRIBUTOR_ADDRESS = new PublicKey(
  "CbNG8keFXcG8jLzTk3cL35cj6PtZL8EiqRkT6MqU5CxE"
);
export const GROUP_REWARD_MANAGER = new PublicKey(
  "5nx4MybNcPBut1yMBsandykg2n99vQGAqXR3ymEXzQze"
);
export const GROUP_REWARD_ENTRY_SEED = "group-reward-entry";
export const GROUP_REWARD_COUNTER_SEED = "group-reward-counter";
export const GROUP_REWARD_DISTRIBUTOR_SEED = "group-reward-distributor";
export const GROUP_REWARD_DISTRIBUTOR_IDL = GROUP_REWARD_DISTRIBUTOR_TYPES.IDL;
export var GroupRewardDistributorKind;
(function (GroupRewardDistributorKind) {
  GroupRewardDistributorKind[(GroupRewardDistributorKind["Mint"] = 1)] = "Mint";
  GroupRewardDistributorKind[(GroupRewardDistributorKind["Treasury"] = 2)] =
    "Treasury";
})(GroupRewardDistributorKind || (GroupRewardDistributorKind = {}));
export const toGroupRewardDistributorKind = (value) =>
  Object.values(GroupRewardDistributorKind).findIndex((x) => {
    var _a;
    return (
      x.toLowerCase() ===
      ((_a = Object.keys(value)[0]) === null || _a === void 0
        ? void 0
        : _a.toLowerCase())
    );
  }) + 1;
export var GroupRewardDistributorMetadataKind;
(function (GroupRewardDistributorMetadataKind) {
  GroupRewardDistributorMetadataKind[
    (GroupRewardDistributorMetadataKind["NoRestriction"] = 1)
  ] = "NoRestriction";
  GroupRewardDistributorMetadataKind[
    (GroupRewardDistributorMetadataKind["UniqueNames"] = 2)
  ] = "UniqueNames";
  GroupRewardDistributorMetadataKind[
    (GroupRewardDistributorMetadataKind["UniqueSymbols"] = 3)
  ] = "UniqueSymbols";
})(
  GroupRewardDistributorMetadataKind ||
    (GroupRewardDistributorMetadataKind = {})
);
export const toGroupRewardDistributorMetadataKind = (value) =>
  Object.values(GroupRewardDistributorMetadataKind).findIndex((x) => {
    var _a;
    return (
      x.toLowerCase() ===
      ((_a = Object.keys(value)[0]) === null || _a === void 0
        ? void 0
        : _a.toLowerCase())
    );
  }) + 1;
export var GroupRewardDistributorPoolKind;
(function (GroupRewardDistributorPoolKind) {
  GroupRewardDistributorPoolKind[
    (GroupRewardDistributorPoolKind["NoRestriction"] = 1)
  ] = "NoRestriction";
  GroupRewardDistributorPoolKind[
    (GroupRewardDistributorPoolKind["AllFromSinglePool"] = 2)
  ] = "AllFromSinglePool";
  GroupRewardDistributorPoolKind[
    (GroupRewardDistributorPoolKind["EachFromSeparatePool"] = 3)
  ] = "EachFromSeparatePool";
})(GroupRewardDistributorPoolKind || (GroupRewardDistributorPoolKind = {}));
export const toGroupRewardDistributorPoolKind = (value) =>
  Object.values(GroupRewardDistributorPoolKind).findIndex((x) => {
    var _a;
    return (
      x.toLowerCase() ===
      ((_a = Object.keys(value)[0]) === null || _a === void 0
        ? void 0
        : _a.toLowerCase())
    );
  }) + 1;
export const groupRewardDistributorProgram = (
  connection,
  wallet,
  confirmOptions
) => {
  return new Program(
    GROUP_REWARD_DISTRIBUTOR_IDL,
    GROUP_REWARD_DISTRIBUTOR_ADDRESS,
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
