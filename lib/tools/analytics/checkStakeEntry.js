"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = tslib_1.__importDefault(require("bn.js"));
const accounts_1 = require("../../src/programs/rewardDistributor/accounts");
const pda_1 = require("../../src/programs/rewardDistributor/pda");
const accounts_2 = require("../../src/programs/stakePool/accounts");
const utils_1 = require("../../src/programs/stakePool/utils");
const connection_1 = require("../connection");
const checkStakeEntry = async (cluster, distributorId, stakePoolId, mintId) => {
    const connection = (0, connection_1.connectionFor)(cluster);
    const stakeEntryId = await (0, utils_1.findStakeEntryIdFromMint)(stakePoolId, mintId);
    const stakeEntry = await (0, accounts_2.getStakeEntry)(connection, stakeEntryId);
    console.log(stakeEntry);
    const rewardDistributorId = (0, pda_1.findRewardDistributorId)(stakePoolId, distributorId);
    const rewardEntryId = (0, pda_1.findRewardEntryId)(rewardDistributorId, stakeEntryId);
    const rewardEntry = await (0, accounts_1.getRewardEntry)(connection, rewardEntryId);
    console.log(rewardEntry);
};
checkStakeEntry("mainnet", new bn_js_1.default(0), new web3_js_1.PublicKey("3BZCupFU6X3wYJwgTsKS2vTs4VeMrhSZgx4P2TfzExtP"), new web3_js_1.PublicKey("2eRCM7sSKuYKiSpEssZTxzKTfPiMbs4JFBwbeeDS3w71")).catch((e) => console.log(e));
//# sourceMappingURL=checkStakeEntry.js.map