"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.getArgs = exports.description = exports.commandName = void 0;
const accounts_1 = require("../../src/programs/stakePool/accounts");
exports.commandName = "getAllStakePools";
exports.description = "Get stake pool IDs";
const getArgs = (_connection, _wallet) => ({});
exports.getArgs = getArgs;
const handler = async (connection, _wallet, _args) => {
    const stakePools = await (0, accounts_1.getAllStakePools)(connection);
    console.log(stakePools.map((p) => p.pubkey.toString()).join(","));
};
exports.handler = handler;
//# sourceMappingURL=getAllStakePools.js.map