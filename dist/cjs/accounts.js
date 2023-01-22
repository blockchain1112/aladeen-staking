"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProgramIdlAccounts =
  exports.tryDecodeIdlAccountUnknown =
  exports.decodeIdlAccountUnknown =
  exports.tryDecodeIdlAccount =
  exports.decodeIdlAccount =
  exports.fetchIdlAccountNullable =
  exports.fetchIdlAccount =
    void 0;
const anchor_1 = require("@project-serum/anchor");
/**
 * Fetch an account with idl types
 * @param connection
 * @param pubkey
 * @param accountType
 * @param config
 * @returns
 */
const fetchIdlAccount = async (
  connection,
  pubkey,
  accountType,
  idl,
  config
) => {
  const account = await (0, exports.fetchIdlAccountNullable)(
    connection,
    pubkey,
    accountType,
    idl,
    config
  );
  if (!account) throw "Account info not found";
  return account;
};
exports.fetchIdlAccount = fetchIdlAccount;
/**
 * Fetch a possibly null account with idl types of a specific type
 * @param connection
 * @param pubkey
 * @param accountType
 * @param config
 * @param idl
 * @returns
 */
const fetchIdlAccountNullable = async (
  connection,
  pubkey,
  accountType,
  idl,
  config
) => {
  const accountInfo = await connection.getAccountInfo(pubkey, config);
  if (!accountInfo) return null;
  try {
    const parsed = new anchor_1.BorshAccountsCoder(idl).decode(
      accountType,
      accountInfo.data
    );
    return {
      ...accountInfo,
      pubkey,
      parsed,
      type: accountType,
    };
  } catch (e) {
    return null;
  }
};
exports.fetchIdlAccountNullable = fetchIdlAccountNullable;
/**
 * Decode an account with idl types of a specific type
 * @param accountInfo
 * @param accountType
 * @param idl
 * @returns
 */
const decodeIdlAccount = (accountInfo, accountType, idl) => {
  const parsed = new anchor_1.BorshAccountsCoder(idl).decode(
    accountType,
    accountInfo.data
  );
  return {
    ...accountInfo,
    type: accountType,
    parsed,
  };
};
exports.decodeIdlAccount = decodeIdlAccount;
/**
 * Try to decode an account with idl types of specific type
 * @param accountInfo
 * @param accountType
 * @param idl
 * @returns
 */
const tryDecodeIdlAccount = (accountInfo, accountType, idl) => {
  try {
    return (0, exports.decodeIdlAccount)(accountInfo, accountType, idl);
  } catch (e) {
    return {
      ...accountInfo,
      type: "unknown",
      parsed: null,
    };
  }
};
exports.tryDecodeIdlAccount = tryDecodeIdlAccount;
/**
 * Decode an idl account of unknown type
 * @param accountInfo
 * @param idl
 * @returns
 */
const decodeIdlAccountUnknown = (accountInfo, idl) => {
  if (!accountInfo) throw "No account found";
  // get idl accounts
  const idlAccounts = idl["accounts"];
  if (!idlAccounts) throw "No account definitions found in IDL";
  // find matching account name
  const accountTypes = idlAccounts.map((a) => a.name);
  const accountType =
    accountTypes === null || accountTypes === void 0
      ? void 0
      : accountTypes.find(
          (accountType) =>
            anchor_1.BorshAccountsCoder.accountDiscriminator(
              accountType
            ).compare(accountInfo.data.subarray(0, 8)) === 0
        );
  if (!accountType) throw "No account discriminator match found";
  // decode
  const parsed = new anchor_1.BorshAccountsCoder(idl).decode(
    accountType,
    accountInfo.data
  );
  return {
    ...accountInfo,
    type: accountType,
    parsed,
  };
};
exports.decodeIdlAccountUnknown = decodeIdlAccountUnknown;
/**
 * Try to decode an account with idl types of unknown type
 * @param accountInfo
 * @param idl
 * @returns
 */
const tryDecodeIdlAccountUnknown = (accountInfo, idl) => {
  try {
    return (0, exports.decodeIdlAccountUnknown)(accountInfo, idl);
  } catch (e) {
    return {
      ...accountInfo,
      type: "unknown",
      parsed: null,
    };
  }
};
exports.tryDecodeIdlAccountUnknown = tryDecodeIdlAccountUnknown;
/**
 * Get program accounts of a specific idl type
 * @param connection
 * @param accountType
 * @param config
 * @param programId
 * @param idl
 * @returns
 */
const getProgramIdlAccounts = async (
  connection,
  accountType,
  programId,
  idl,
  config
) => {
  var _a;
  const accountInfos = await connection.getProgramAccounts(programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: anchor_1.utils.bytes.bs58.encode(
            anchor_1.BorshAccountsCoder.accountDiscriminator(accountType)
          ),
        },
      },
      ...((_a =
        config === null || config === void 0 ? void 0 : config.filters) !==
        null && _a !== void 0
        ? _a
        : []),
    ],
  });
  return accountInfos.map((accountInfo) => ({
    pubkey: accountInfo.pubkey,
    ...(0, exports.tryDecodeIdlAccount)(accountInfo.account, accountType, idl),
  }));
};
exports.getProgramIdlAccounts = getProgramIdlAccounts;
//# sourceMappingURL=accounts.js.map
