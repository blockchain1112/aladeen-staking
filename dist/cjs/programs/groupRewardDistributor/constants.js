"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupRewardDistributorProgram = exports.toGroupRewardDistributorPoolKind = exports.GroupRewardDistributorPoolKind = exports.toGroupRewardDistributorMetadataKind = exports.GroupRewardDistributorMetadataKind = exports.toGroupRewardDistributorKind = exports.GroupRewardDistributorKind = exports.GROUP_REWARD_DISTRIBUTOR_IDL = exports.GROUP_REWARD_DISTRIBUTOR_SEED = exports.GROUP_REWARD_COUNTER_SEED = exports.GROUP_REWARD_ENTRY_SEED = exports.GROUP_REWARD_MANAGER = exports.GROUP_REWARD_DISTRIBUTOR_ADDRESS = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const GROUP_REWARD_DISTRIBUTOR_TYPES = tslib_1.__importStar(require("../../idl/cardinal_group_reward_distributor"));
exports.GROUP_REWARD_DISTRIBUTOR_ADDRESS = new web3_js_1.PublicKey("CbNG8keFXcG8jLzTk3cL35cj6PtZL8EiqRkT6MqU5CxE");
exports.GROUP_REWARD_MANAGER = new web3_js_1.PublicKey("5nx4MybNcPBut1yMBsandykg2n99vQGAqXR3ymEXzQze");
exports.GROUP_REWARD_ENTRY_SEED = "group-reward-entry";
exports.GROUP_REWARD_COUNTER_SEED = "group-reward-counter";
exports.GROUP_REWARD_DISTRIBUTOR_SEED = "group-reward-distributor";
exports.GROUP_REWARD_DISTRIBUTOR_IDL = GROUP_REWARD_DISTRIBUTOR_TYPES.IDL;
var GroupRewardDistributorKind;
(function (GroupRewardDistributorKind) {
    GroupRewardDistributorKind[GroupRewardDistributorKind["Mint"] = 1] = "Mint";
    GroupRewardDistributorKind[GroupRewardDistributorKind["Treasury"] = 2] = "Treasury";
})(GroupRewardDistributorKind = exports.GroupRewardDistributorKind || (exports.GroupRewardDistributorKind = {}));
const toGroupRewardDistributorKind = (value) => Object.values(GroupRewardDistributorKind).findIndex((x) => { var _a; return x.toLowerCase() === ((_a = Object.keys(value)[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()); }) + 1;
exports.toGroupRewardDistributorKind = toGroupRewardDistributorKind;
var GroupRewardDistributorMetadataKind;
(function (GroupRewardDistributorMetadataKind) {
    GroupRewardDistributorMetadataKind[GroupRewardDistributorMetadataKind["NoRestriction"] = 1] = "NoRestriction";
    GroupRewardDistributorMetadataKind[GroupRewardDistributorMetadataKind["UniqueNames"] = 2] = "UniqueNames";
    GroupRewardDistributorMetadataKind[GroupRewardDistributorMetadataKind["UniqueSymbols"] = 3] = "UniqueSymbols";
})(GroupRewardDistributorMetadataKind = exports.GroupRewardDistributorMetadataKind || (exports.GroupRewardDistributorMetadataKind = {}));
const toGroupRewardDistributorMetadataKind = (value) => Object.values(GroupRewardDistributorMetadataKind).findIndex((x) => { var _a; return x.toLowerCase() === ((_a = Object.keys(value)[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()); }) + 1;
exports.toGroupRewardDistributorMetadataKind = toGroupRewardDistributorMetadataKind;
var GroupRewardDistributorPoolKind;
(function (GroupRewardDistributorPoolKind) {
    GroupRewardDistributorPoolKind[GroupRewardDistributorPoolKind["NoRestriction"] = 1] = "NoRestriction";
    GroupRewardDistributorPoolKind[GroupRewardDistributorPoolKind["AllFromSinglePool"] = 2] = "AllFromSinglePool";
    GroupRewardDistributorPoolKind[GroupRewardDistributorPoolKind["EachFromSeparatePool"] = 3] = "EachFromSeparatePool";
})(GroupRewardDistributorPoolKind = exports.GroupRewardDistributorPoolKind || (exports.GroupRewardDistributorPoolKind = {}));
const toGroupRewardDistributorPoolKind = (value) => Object.values(GroupRewardDistributorPoolKind).findIndex((x) => { var _a; return x.toLowerCase() === ((_a = Object.keys(value)[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase()); }) + 1;
exports.toGroupRewardDistributorPoolKind = toGroupRewardDistributorPoolKind;
const groupRewardDistributorProgram = (connection, wallet, confirmOptions) => {
    return new anchor_1.Program(exports.GROUP_REWARD_DISTRIBUTOR_IDL, exports.GROUP_REWARD_DISTRIBUTOR_ADDRESS, new anchor_1.AnchorProvider(connection, wallet !== null && wallet !== void 0 ? wallet : (0, common_1.emptyWallet)(web3_js_1.Keypair.generate().publicKey), confirmOptions !== null && confirmOptions !== void 0 ? confirmOptions : {}));
};
exports.groupRewardDistributorProgram = groupRewardDistributorProgram;
//# sourceMappingURL=constants.js.map