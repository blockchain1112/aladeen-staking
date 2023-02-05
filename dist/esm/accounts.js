import { BorshAccountsCoder, utils } from "@project-serum/anchor";
/**
 * Fetch an account with idl types
 * @param connection
 * @param pubkey
 * @param accountType
 * @param config
 * @returns
 */
export const fetchIdlAccount = async (connection, pubkey, accountType, idl, config) => {
    const account = await fetchIdlAccountNullable(connection, pubkey, accountType, idl, config);
    if (!account)
        throw "Account info not found";
    return account;
};
/**
 * Fetch a possibly null account with idl types of a specific type
 * @param connection
 * @param pubkey
 * @param accountType
 * @param config
 * @param idl
 * @returns
 */
export const fetchIdlAccountNullable = async (connection, pubkey, accountType, idl, config) => {
    const accountInfo = await connection.getAccountInfo(pubkey, config);
    if (!accountInfo)
        return null;
    try {
        const parsed = new BorshAccountsCoder(idl).decode(accountType, accountInfo.data);
        return {
            ...accountInfo,
            pubkey,
            parsed,
            type: accountType,
        };
    }
    catch (e) {
        return null;
    }
};
/**
 * Decode an account with idl types of a specific type
 * @param accountInfo
 * @param accountType
 * @param idl
 * @returns
 */
export const decodeIdlAccount = (accountInfo, accountType, idl) => {
    const parsed = new BorshAccountsCoder(idl).decode(accountType, accountInfo.data);
    return {
        ...accountInfo,
        type: accountType,
        parsed,
    };
};
/**
 * Try to decode an account with idl types of specific type
 * @param accountInfo
 * @param accountType
 * @param idl
 * @returns
 */
export const tryDecodeIdlAccount = (accountInfo, accountType, idl) => {
    try {
        return decodeIdlAccount(accountInfo, accountType, idl);
    }
    catch (e) {
        return {
            ...accountInfo,
            type: "unknown",
            parsed: null,
        };
    }
};
/**
 * Decode an idl account of unknown type
 * @param accountInfo
 * @param idl
 * @returns
 */
export const decodeIdlAccountUnknown = (accountInfo, idl) => {
    if (!accountInfo)
        throw "No account found";
    // get idl accounts
    const idlAccounts = idl["accounts"];
    if (!idlAccounts)
        throw "No account definitions found in IDL";
    // find matching account name
    const accountTypes = idlAccounts.map((a) => a.name);
    const accountType = accountTypes === null || accountTypes === void 0 ? void 0 : accountTypes.find((accountType) => BorshAccountsCoder.accountDiscriminator(accountType).compare(accountInfo.data.subarray(0, 8)) === 0);
    if (!accountType)
        throw "No account discriminator match found";
    // decode
    const parsed = new BorshAccountsCoder(idl).decode(accountType, accountInfo.data);
    return {
        ...accountInfo,
        type: accountType,
        parsed,
    };
};
/**
 * Try to decode an account with idl types of unknown type
 * @param accountInfo
 * @param idl
 * @returns
 */
export const tryDecodeIdlAccountUnknown = (accountInfo, idl) => {
    try {
        return decodeIdlAccountUnknown(accountInfo, idl);
    }
    catch (e) {
        return {
            ...accountInfo,
            type: "unknown",
            parsed: null,
        };
    }
};
/**
 * Get program accounts of a specific idl type
 * @param connection
 * @param accountType
 * @param config
 * @param programId
 * @param idl
 * @returns
 */
export const getProgramIdlAccounts = async (connection, accountType, programId, idl, config) => {
    var _a;
    const accountInfos = await connection.getProgramAccounts(programId, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: utils.bytes.bs58.encode(BorshAccountsCoder.accountDiscriminator(accountType)),
                },
            },
            ...((_a = config === null || config === void 0 ? void 0 : config.filters) !== null && _a !== void 0 ? _a : []),
        ],
    });
    return accountInfos.map((accountInfo) => ({
        pubkey: accountInfo.pubkey,
        ...tryDecodeIdlAccount(accountInfo.account, accountType, idl),
    }));
};
//# sourceMappingURL=accounts.js.map