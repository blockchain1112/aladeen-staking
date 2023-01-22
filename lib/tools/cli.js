"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.question = void 0;
const tslib_1 = require("tslib");
const anchor_1 = require("@project-serum/anchor");
const dotenv = tslib_1.__importStar(require("dotenv"));
const readline = tslib_1.__importStar(require("readline"));
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const claimRewardsForUsers = tslib_1.__importStar(require("./admin-actions/claimRewardsForUsers"));
const initializeEntriesAndSetMultipliers = tslib_1.__importStar(require("./admin-actions/initializeEntriesAndSetMultipliers"));
const updateMultipliersOnRules = tslib_1.__importStar(require("./admin-actions/updateMultipliersOnRules"));
const getAllStakePools = tslib_1.__importStar(require("./analytics/getAllStakePools"));
const stakedTokensBreakdownByWallet = tslib_1.__importStar(require("./analytics/stakedTokensBreakdownByWallet"));
const connection_1 = require("./connection");
const reclaimFunds = tslib_1.__importStar(require("./reward-distributor/reclaimFunds"));
const transferTokens = tslib_1.__importStar(require("./reward-distributor/transferTokens"));
const checkStakeEntryFunds = tslib_1.__importStar(require("./stake-entries/checkStakeEntryFunds"));
const utils_1 = require("./utils");
dotenv.config();
const commandBuilder = (command) => {
    return {
        command: command.commandName,
        describe: command.description,
        handler: async ({ cluster, wallet, }) => {
            const clusterString = process.env.CLUSTER || cluster;
            const c = (0, connection_1.connectionFor)(clusterString);
            const w = new anchor_1.Wallet((0, utils_1.keypairFrom)(process.env.WALLET || wallet, "wallet"));
            const a = command.getArgs(c, w);
            console.log(command.description);
            console.log(`[cluster=${clusterString}] [wallet=${w.publicKey.toString()}]`);
            console.log(`\n(modify args in ${command.commandName}.ts)`);
            console.log(JSON.stringify(a, null, 2));
            await (0, exports.question)("\nExecute... [enter]");
            await command.handler(c, w, a);
        },
    };
};
const question = async (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve) => rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
    }));
};
exports.question = question;
void (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv))
    .positional("wallet", {
    describe: "Wallet to use - default to WALLET environment variable",
    default: "~/.config/solana/id.json",
})
    .positional("cluster", {
    describe: "Solana cluster moniker to use [mainnet, devnet] - ovverride url with RPC_URL environment variable or mainnet moniker with MAINNET_PRIMARY environment variable",
    default: "devnet",
})
    // analytics
    .command(commandBuilder(stakedTokensBreakdownByWallet))
    .command(commandBuilder(getAllStakePools))
    // admin-actions
    .command(commandBuilder(updateMultipliersOnRules))
    .command(commandBuilder(initializeEntriesAndSetMultipliers))
    .command(commandBuilder(claimRewardsForUsers))
    // reward-distributor
    .command(commandBuilder(reclaimFunds))
    .command(commandBuilder(transferTokens))
    // stake-entries
    .command(commandBuilder(checkStakeEntryFunds))
    .strict()
    .demandCommand()
    .alias({ h: "help" }).argv;
//# sourceMappingURL=cli.js.map