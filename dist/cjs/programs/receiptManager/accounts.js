"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllOfType =
  exports.getClaimableRewardReceiptsForManager =
  exports.getRewardReceiptsForManager =
  exports.getAllRewardReceipts =
  exports.getRewardReceipt =
  exports.getReceiptEntry =
  exports.getReceiptManagersForPool =
  exports.getAllreceiptManagers =
  exports.getReceiptManager =
    void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const rewardDistributor_1 = require("../rewardDistributor");
const constants_1 = require("./constants");
const getReceiptManager = async (connection, receiptManagerId) => {
  const program = (0, constants_1.receiptManagerProgram)(connection);
  const parsed = await program.account.receiptManager.fetch(receiptManagerId);
  return {
    parsed,
    pubkey: receiptManagerId,
  };
};
exports.getReceiptManager = getReceiptManager;
const getAllreceiptManagers = async (connection) =>
  (0, exports.getAllOfType)(connection, "receiptManager");
exports.getAllreceiptManagers = getAllreceiptManagers;
const getReceiptManagersForPool = async (connection, stakePoolId) => {
  const programAccounts = await connection.getProgramAccounts(
    rewardDistributor_1.REWARD_DISTRIBUTOR_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: anchor_1.utils.bytes.bs58.encode(
              anchor_1.BorshAccountsCoder.accountDiscriminator("receiptManager")
            ),
          },
        },
        {
          memcmp: {
            offset: 9,
            bytes: stakePoolId.toBase58(),
          },
        },
      ],
    }
  );
  const ReceiptManagerDatas = [];
  const coder = new anchor_1.BorshAccountsCoder(
    constants_1.RECEIPT_MANAGER_IDL
  );
  programAccounts.forEach((account) => {
    try {
      const ReceiptManagerData = coder.decode(
        "receiptManager",
        account.account.data
      );
      if (ReceiptManagerData) {
        ReceiptManagerDatas.push({
          ...account,
          parsed: ReceiptManagerData,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return ReceiptManagerDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};
exports.getReceiptManagersForPool = getReceiptManagersForPool;
//////// RECEIPT ENTRY ////////
const getReceiptEntry = async (connection, receiptEntryId) => {
  const program = (0, constants_1.receiptManagerProgram)(connection);
  const parsed = await program.account.receiptEntry.fetch(receiptEntryId);
  return {
    parsed,
    pubkey: receiptEntryId,
  };
};
exports.getReceiptEntry = getReceiptEntry;
//////// REWARD RECEIPT ////////
const getRewardReceipt = async (connection, rewardReceiptId) => {
  const program = (0, constants_1.receiptManagerProgram)(connection);
  const parsed = await program.account.rewardReceipt.fetch(rewardReceiptId);
  return {
    parsed,
    pubkey: rewardReceiptId,
  };
};
exports.getRewardReceipt = getRewardReceipt;
const getAllRewardReceipts = async (connection) =>
  (0, exports.getAllOfType)(connection, "rewardReceipt");
exports.getAllRewardReceipts = getAllRewardReceipts;
const getRewardReceiptsForManager = async (connection, rewardDistributorId) => {
  const programAccounts = await connection.getProgramAccounts(
    rewardDistributor_1.REWARD_DISTRIBUTOR_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: anchor_1.utils.bytes.bs58.encode(
              anchor_1.BorshAccountsCoder.accountDiscriminator("rewardReceipt")
            ),
          },
        },
        {
          memcmp: {
            offset: 41,
            bytes: rewardDistributorId.toBase58(),
          },
        },
      ],
    }
  );
  const rewardReceiptDatas = [];
  const coder = new anchor_1.BorshAccountsCoder(
    constants_1.RECEIPT_MANAGER_IDL
  );
  programAccounts.forEach((account) => {
    try {
      const rewardReceiptData = coder.decode(
        "rewardReceipt",
        account.account.data
      );
      if (rewardReceiptData) {
        rewardReceiptDatas.push({
          ...account,
          parsed: rewardReceiptData,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return rewardReceiptDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};
exports.getRewardReceiptsForManager = getRewardReceiptsForManager;
const getClaimableRewardReceiptsForManager = async (
  connection,
  receiptManagerId
) => {
  const ReceiptManagerData = await (0, common_1.tryGetAccount)(() =>
    (0, exports.getReceiptManager)(connection, receiptManagerId)
  );
  if (!ReceiptManagerData) {
    throw `No reward receipt manager found for ${receiptManagerId.toString()}`;
  }
  const rewardReceipts = await (0, exports.getRewardReceiptsForManager)(
    connection,
    receiptManagerId
  );
  return rewardReceipts.filter(
    (receipt) =>
      receipt.parsed.target.toString() !==
      web3_js_1.PublicKey.default.toString()
  );
};
exports.getClaimableRewardReceiptsForManager =
  getClaimableRewardReceiptsForManager;
//////// utils ////////
const getAllOfType = async (connection, key) => {
  const programAccounts = await connection.getProgramAccounts(
    constants_1.RECEIPT_MANAGER_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: anchor_1.utils.bytes.bs58.encode(
              anchor_1.BorshAccountsCoder.accountDiscriminator(key)
            ),
          },
        },
      ],
    }
  );
  const datas = [];
  const coder = new anchor_1.BorshAccountsCoder(
    constants_1.RECEIPT_MANAGER_IDL
  );
  programAccounts.forEach((account) => {
    try {
      const data = coder.decode(key, account.account.data);
      if (data) {
        datas.push({
          ...account,
          parsed: data,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return datas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};
exports.getAllOfType = getAllOfType;
//# sourceMappingURL=accounts.js.map
