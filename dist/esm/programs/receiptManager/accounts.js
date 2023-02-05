import { tryGetAccount } from "@cardinal/common";
import { BorshAccountsCoder, utils } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { REWARD_DISTRIBUTOR_ADDRESS } from "../rewardDistributor";
import { RECEIPT_MANAGER_ADDRESS, RECEIPT_MANAGER_IDL, receiptManagerProgram, } from "./constants";
export const getReceiptManager = async (connection, receiptManagerId) => {
    const program = receiptManagerProgram(connection);
    const parsed = (await program.account.receiptManager.fetch(receiptManagerId));
    return {
        parsed,
        pubkey: receiptManagerId,
    };
};
export const getAllreceiptManagers = async (connection) => getAllOfType(connection, "receiptManager");
export const getReceiptManagersForPool = async (connection, stakePoolId) => {
    const programAccounts = await connection.getProgramAccounts(REWARD_DISTRIBUTOR_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: utils.bytes.bs58.encode(BorshAccountsCoder.accountDiscriminator("receiptManager")),
                },
            },
            {
                memcmp: {
                    offset: 9,
                    bytes: stakePoolId.toBase58(),
                },
            },
        ],
    });
    const ReceiptManagerDatas = [];
    const coder = new BorshAccountsCoder(RECEIPT_MANAGER_IDL);
    programAccounts.forEach((account) => {
        try {
            const ReceiptManagerData = coder.decode("receiptManager", account.account.data);
            if (ReceiptManagerData) {
                ReceiptManagerDatas.push({
                    ...account,
                    parsed: ReceiptManagerData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return ReceiptManagerDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
//////// RECEIPT ENTRY ////////
export const getReceiptEntry = async (connection, receiptEntryId) => {
    const program = receiptManagerProgram(connection);
    const parsed = (await program.account.receiptEntry.fetch(receiptEntryId));
    return {
        parsed,
        pubkey: receiptEntryId,
    };
};
//////// REWARD RECEIPT ////////
export const getRewardReceipt = async (connection, rewardReceiptId) => {
    const program = receiptManagerProgram(connection);
    const parsed = (await program.account.rewardReceipt.fetch(rewardReceiptId));
    return {
        parsed,
        pubkey: rewardReceiptId,
    };
};
export const getAllRewardReceipts = async (connection) => getAllOfType(connection, "rewardReceipt");
export const getRewardReceiptsForManager = async (connection, rewardDistributorId) => {
    const programAccounts = await connection.getProgramAccounts(REWARD_DISTRIBUTOR_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: utils.bytes.bs58.encode(BorshAccountsCoder.accountDiscriminator("rewardReceipt")),
                },
            },
            {
                memcmp: {
                    offset: 41,
                    bytes: rewardDistributorId.toBase58(),
                },
            },
        ],
    });
    const rewardReceiptDatas = [];
    const coder = new BorshAccountsCoder(RECEIPT_MANAGER_IDL);
    programAccounts.forEach((account) => {
        try {
            const rewardReceiptData = coder.decode("rewardReceipt", account.account.data);
            if (rewardReceiptData) {
                rewardReceiptDatas.push({
                    ...account,
                    parsed: rewardReceiptData,
                });
            }
            // eslint-disable-next-line no-empty
        }
        catch (e) { }
    });
    return rewardReceiptDatas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
export const getClaimableRewardReceiptsForManager = async (connection, receiptManagerId) => {
    const ReceiptManagerData = await tryGetAccount(() => getReceiptManager(connection, receiptManagerId));
    if (!ReceiptManagerData) {
        throw `No reward receipt manager found for ${receiptManagerId.toString()}`;
    }
    const rewardReceipts = await getRewardReceiptsForManager(connection, receiptManagerId);
    return rewardReceipts.filter((receipt) => receipt.parsed.target.toString() !== PublicKey.default.toString());
};
//////// utils ////////
export const getAllOfType = async (connection, key) => {
    const programAccounts = await connection.getProgramAccounts(RECEIPT_MANAGER_ADDRESS, {
        filters: [
            {
                memcmp: {
                    offset: 0,
                    bytes: utils.bytes.bs58.encode(BorshAccountsCoder.accountDiscriminator(key)),
                },
            },
        ],
    });
    const datas = [];
    const coder = new BorshAccountsCoder(RECEIPT_MANAGER_IDL);
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
        }
        catch (e) { }
    });
    return datas.sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
};
//# sourceMappingURL=accounts.js.map