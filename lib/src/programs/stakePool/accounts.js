"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupStakeEntries = exports.getGroupStakeEntry = exports.getAllGroupStakeEntries = exports.getGroupStakeEntriesForUser = exports.getStakeBooster = exports.getAllStakeEntries = exports.getStakePoolsByAuthority = exports.getStakeAuthorizationsForPool = exports.getStakeAuthorizations = exports.getStakeAuthorization = exports.getPoolIdentifier = exports.getStakeEntries = exports.getStakeEntry = exports.getActiveStakeEntriesForPool = exports.getAllStakeEntriesForPool = exports.getAllActiveStakeEntries = exports.getStakeEntriesForUser = exports.getAllStakePools = exports.getStakePools = exports.getStakePool = void 0;
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const _1 = require(".");
const constants_1 = require("./constants");
const pda_1 = require("./pda");
const getStakePool = async (connection, stakePoolId) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const parsed = await program.account.stakePool.fetch(stakePoolId);
    return {
        parsed,
        pubkey: stakePoolId,
    };
};
exports.getStakePool = getStakePool;
const getStakePools = async (connection, stakePoolIds) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const stakePools = (await program.account.stakePool.fetchMultiple(stakePoolIds));
    return stakePools.map((tm, i) => ({
        parsed: tm,
        pubkey: stakePoolIds[i],
    }));
};
exports.getStakePools = getStakePools;
const getAllStakePools = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakePool")),
                },
            },
        ],
    });
    const stakePoolDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakePoolData = coder.decode("stakePool", account.account.data);
            if (stakePoolData) {
                stakePoolDatas.push({
                    ...account,
                    parsed: stakePoolData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakePoolDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllStakePools = getAllStakePools;
const getStakeEntriesForUser = async (connection, user) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [{ memcmp: { offset: constants_1.STAKER_OFFSET, bytes: user.toBase58() } }],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
        }
        catch (e) {
            console.log(`Failed to decode token manager data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getStakeEntriesForUser = getStakeEntriesForUser;
const getAllActiveStakeEntries = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData &&
                stakeEntryData.lastStaker.toString() !== web3_js_1.PublicKey.default.toString()) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
        }
        catch (e) {
            // console.log(`Failed to decode stake entry data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllActiveStakeEntries = getAllActiveStakeEntries;
const getAllStakeEntriesForPool = async (connection, stakePoolId) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
            {
                memcmp: { offset: constants_1.POOL_OFFSET, bytes: stakePoolId.toBase58() },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            stakeEntryDatas.push({
                ...account,
                parsed: stakeEntryData,
            });
        }
        catch (e) {
            // console.log(`Failed to decode stake entry data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllStakeEntriesForPool = getAllStakeEntriesForPool;
const getActiveStakeEntriesForPool = async (connection, stakePoolId) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: { offset: constants_1.POOL_OFFSET, bytes: stakePoolId.toBase58() },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData &&
                stakeEntryData.lastStaker.toString() !== web3_js_1.PublicKey.default.toString()) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
        }
        catch (e) {
            // console.log(`Failed to decode token manager data`);
        }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getActiveStakeEntriesForPool = getActiveStakeEntriesForPool;
const getStakeEntry = async (connection, stakeEntryId) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const parsed = await program.account.stakeEntry.fetch(stakeEntryId);
    return {
        parsed,
        pubkey: stakeEntryId,
    };
};
exports.getStakeEntry = getStakeEntry;
const getStakeEntries = async (connection, stakeEntryIds) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const stakeEntries = (await program.account.stakeEntry.fetchMultiple(stakeEntryIds));
    return stakeEntries.map((tm, i) => ({
        parsed: tm,
        pubkey: stakeEntryIds[i],
    }));
};
exports.getStakeEntries = getStakeEntries;
const getPoolIdentifier = async (connection) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const identifierId = (0, pda_1.findIdentifierId)();
    const parsed = await program.account.identifier.fetch(identifierId);
    return {
        parsed,
        pubkey: identifierId,
    };
};
exports.getPoolIdentifier = getPoolIdentifier;
const getStakeAuthorization = async (connection, stakeAuthorizationId) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const parsed = await program.account.stakeAuthorizationRecord.fetch(stakeAuthorizationId);
    return {
        parsed,
        pubkey: stakeAuthorizationId,
    };
};
exports.getStakeAuthorization = getStakeAuthorization;
const getStakeAuthorizations = async (connection, stakeAuthorizationIds) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const stakeAuthorizations = (await program.account.stakeAuthorizationRecord.fetchMultiple(stakeAuthorizationIds));
    return stakeAuthorizations.map((data, i) => ({
        parsed: data,
        pubkey: stakeAuthorizationIds[i],
    }));
};
exports.getStakeAuthorizations = getStakeAuthorizations;
const getStakeAuthorizationsForPool = async (connection, poolId) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeAuthorizationRecord")),
                },
            },
            {
                memcmp: { offset: constants_1.POOL_OFFSET, bytes: poolId.toBase58() },
            },
        ],
    });
    const stakeAuthorizationDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const data = coder.decode("stakeAuthorizationRecord", account.account.data);
            stakeAuthorizationDatas.push({
                ...account,
                parsed: data,
            });
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakeAuthorizationDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getStakeAuthorizationsForPool = getStakeAuthorizationsForPool;
const getStakePoolsByAuthority = async (connection, user) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakePool")),
                },
            },
            {
                memcmp: {
                    offset: constants_1.AUTHORITY_OFFSET,
                    bytes: user.toBase58(),
                },
            },
        ],
    });
    const stakePoolDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakePoolData = coder.decode("stakePool", account.account.data);
            if (stakePoolData) {
                stakePoolDatas.push({
                    ...account,
                    parsed: stakePoolData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakePoolDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getStakePoolsByAuthority = getStakePoolsByAuthority;
const getAllStakeEntries = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("stakeEntry")),
                },
            },
        ],
    });
    const stakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const stakeEntryData = coder.decode("stakeEntry", account.account.data);
            if (stakeEntryData) {
                stakeEntryDatas.push({
                    ...account,
                    parsed: stakeEntryData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return stakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllStakeEntries = getAllStakeEntries;
const getStakeBooster = async (connection, stakeBoosterId) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const parsed = await program.account.stakeBooster.fetch(stakeBoosterId);
    return {
        parsed,
        pubkey: stakeBoosterId,
    };
};
exports.getStakeBooster = getStakeBooster;
const getGroupStakeEntriesForUser = async (connection, user) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("groupStakeEntry")),
                },
            },
            { memcmp: { offset: constants_1.GROUP_STAKER_OFFSET, bytes: user.toBase58() } },
        ],
    });
    const groupStakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const groupStakeEntryData = coder.decode("groupStakeEntry", account.account.data);
            if (groupStakeEntryData) {
                groupStakeEntryDatas.push({
                    ...account,
                    parsed: groupStakeEntryData,
                });
            }
        }
        catch (e) {
            console.log(`Failed to decode token manager data`);
        }
    });
    return groupStakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getGroupStakeEntriesForUser = getGroupStakeEntriesForUser;
const getAllGroupStakeEntries = async (connection) => {
    const programAccounts = await connection.getProgramAccounts(_1.STAKE_POOL_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: anchor_1.utils.bytes.bs58.encode(anchor_1.BorshAccountsCoder.accountDiscriminator("groupStakeEntry")),
                },
            },
        ],
    });
    const groupStakeEntryDatas = [];
    const coder = new anchor_1.BorshAccountsCoder(_1.STAKE_POOL_IDL);
    programAccounts.forEach((account) => {
        try {
            const groupStakeEntryData = coder.decode("groupStakeEntry", account.account.data);
            if (groupStakeEntryData) {
                groupStakeEntryDatas.push({
                    ...account,
                    parsed: groupStakeEntryData,
                });
            }
        }
        catch (e) {
            console.log(`Failed to decode group stake entry data`);
        }
    });
    return groupStakeEntryDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
exports.getAllGroupStakeEntries = getAllGroupStakeEntries;
const getGroupStakeEntry = async (connection, groupStakeEntryId) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const parsed = await program.account.groupStakeEntry.fetch(groupStakeEntryId);
    return {
        parsed,
        pubkey: groupStakeEntryId,
    };
};
exports.getGroupStakeEntry = getGroupStakeEntry;
const getGroupStakeEntries = async (connection, groupStakeEntryIds) => {
    const program = (0, constants_1.stakePoolProgram)(connection);
    const groupStakeEntries = (await program.account.groupStakeEntry.fetchMultiple(groupStakeEntryIds));
    return groupStakeEntries.map((tm, i) => ({
        parsed: tm,
        pubkey: groupStakeEntryIds[i],
    }));
};
exports.getGroupStakeEntries = getGroupStakeEntries;
//# sourceMappingURL=accounts.js.map