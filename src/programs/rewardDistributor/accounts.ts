import type { AccountData } from "@cardinal/common";
import { BorshAccountsCoder, utils } from "@project-serum/anchor";
import type { Connection, PublicKey } from "@solana/web3.js";

import { REWARD_DISTRIBUTOR_ADDRESS, REWARD_DISTRIBUTOR_IDL } from ".";
import type {
  RewardAuthorityData,
  RewardDistributorData,
  RewardEntryData,
} from "./constants";
import { rewardDistributorProgram } from "./constants";

export const getRewardEntry = async (
  connection: Connection,
  rewardEntryId: PublicKey
): Promise<AccountData<RewardEntryData>> => {
  const program = rewardDistributorProgram(connection);
  const parsed = (await program.account.rewardEntry.fetch(
    rewardEntryId
  )) as RewardEntryData;
  return {
    parsed,
    pubkey: rewardEntryId,
  };
};

export const getRewardEntries = async (
  connection: Connection,
  rewardEntryIds: PublicKey[]
): Promise<AccountData<RewardEntryData>[]> => {
  const program = rewardDistributorProgram(connection);
  const rewardEntries = (await program.account.rewardEntry.fetchMultiple(
    rewardEntryIds
  )) as RewardEntryData[];
  return rewardEntries.map((entry, i) => ({
    parsed: entry,
    pubkey: rewardEntryIds[i]!,
  }));
};

export const getRewardAuthority = async (
  connection: Connection,
  rewardAuthority: PublicKey
): Promise<AccountData<RewardAuthorityData | null>> => {
  console.log(rewardAuthority.toString());
  const program = rewardDistributorProgram(connection);
  const parsed = (await program.account.rewardDistributor.fetchNullable(
    rewardAuthority
  )) as RewardAuthorityData | null;
  return {
    parsed,
    pubkey: rewardAuthority,
  };
};

export const getRewardDistributor = async (
  connection: Connection,
  rewardDistributorId: PublicKey
): Promise<AccountData<RewardDistributorData>> => {
  const program = rewardDistributorProgram(connection);
  const parsed = (await program.account.rewardDistributor.fetch(
    rewardDistributorId,
    "single"
  )) as RewardDistributorData;
  return {
    parsed,
    pubkey: rewardDistributorId,
  };
};

export const getRewardDistributors = async (
  connection: Connection,
  rewardDistributorIds: PublicKey[]
): Promise<AccountData<RewardDistributorData>[]> => {
  const program = rewardDistributorProgram(connection);
  const rewardDistributors =
    (await program.account.rewardDistributor.fetchMultiple(
      rewardDistributorIds
    )) as RewardDistributorData[];
  return rewardDistributors.map((distributor, i) => ({
    parsed: distributor,
    pubkey: rewardDistributorIds[i]!,
  }));
};

export const getRewardEntriesForRewardDistributor = async (
  connection: Connection,
  rewardDistributorId: PublicKey
): Promise<AccountData<RewardEntryData>[]> => {
  const programAccounts = await connection.getProgramAccounts(
    REWARD_DISTRIBUTOR_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: utils.bytes.bs58.encode(
              BorshAccountsCoder.accountDiscriminator("rewardEntry")
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
  const rewardEntryDatas: AccountData<RewardEntryData>[] = [];
  const coder = new BorshAccountsCoder(REWARD_DISTRIBUTOR_IDL);
  programAccounts.forEach((account) => {
    try {
      const rewardEntryData: RewardEntryData = coder.decode(
        "rewardEntry",
        account.account.data
      );
      if (rewardEntryData) {
        rewardEntryDatas.push({
          ...account,
          parsed: rewardEntryData,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return rewardEntryDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};

export const getAllRewardEntries = async (
  connection: Connection
): Promise<AccountData<RewardEntryData>[]> => {
  const programAccounts = await connection.getProgramAccounts(
    REWARD_DISTRIBUTOR_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: utils.bytes.bs58.encode(
              BorshAccountsCoder.accountDiscriminator("rewardEntry")
            ),
          },
        },
      ],
    }
  );
  const rewardEntryDatas: AccountData<RewardEntryData>[] = [];
  const coder = new BorshAccountsCoder(REWARD_DISTRIBUTOR_IDL);
  programAccounts.forEach((account) => {
    try {
      const rewardEntryData: RewardEntryData = coder.decode(
        "rewardEntry",
        account.account.data
      );
      if (rewardEntryData) {
        rewardEntryDatas.push({
          ...account,
          parsed: rewardEntryData,
        });
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  });
  return rewardEntryDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  );
};
