import { findMintEditionId, findMintMetadataId } from "@cardinal/common";
import type { Wallet } from "@project-serum/anchor/dist/cjs/provider";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import type {
  Connection,
  PublicKey,
  SendTransactionError,
  Signer,
} from "@solana/web3.js";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV2Instruction,
} from "mplx-v2";

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function newAccountWithLamports(
  connection: Connection,
  lamports = LAMPORTS_PER_SOL * 10,
  keypair = Keypair.generate()
): Promise<Keypair> {
  const account = keypair;
  const signature = await connection.requestAirdrop(
    account.publicKey,
    lamports
  );
  await connection.confirmTransaction(signature, "confirmed");
  return account;
}

export const createMint = async (
  connection: Connection,
  wallet: Wallet,
  config?: MintConfig
): Promise<[PublicKey, PublicKey]> => {
  const mintKeypair = Keypair.generate();
  const mintId = mintKeypair.publicKey;
  const [tx, ata] = await createMintTx(
    connection,
    mintKeypair.publicKey,
    wallet.publicKey,
    config
  );
  await executeTransaction(connection, tx, wallet, { signers: [mintKeypair] });
  return [ata, mintId];
};

export type MintConfig = {
  target?: PublicKey;
  amount?: number;
  decimals?: number;
};
export const createMintTx = async (
  connection: Connection,
  mintId: PublicKey,
  authority: PublicKey,
  config?: MintConfig
): Promise<[Transaction, PublicKey]> => {
  const target = config?.target ?? authority;
  const ata = getAssociatedTokenAddressSync(mintId, target, true);
  return [
    new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: authority,
        newAccountPubkey: mintId,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMint2Instruction(
        mintId,
        config?.decimals ?? 0,
        authority,
        authority
      ),
      createAssociatedTokenAccountInstruction(authority, ata, target, mintId),
      createMintToInstruction(mintId, ata, authority, config?.amount ?? 1)
    ),
    ata,
  ];
};

export const createMasterEdition = async (
  connection: Connection,
  wallet: Wallet,
  config?: { target?: PublicKey }
): Promise<[PublicKey, PublicKey]> => {
  const mintKeypair = Keypair.generate();
  const mintId = mintKeypair.publicKey;
  const target = config?.target ?? wallet.publicKey;
  const ata = getAssociatedTokenAddressSync(mintId, target, true);
  const tx = await createMasterEditionTx(
    connection,
    mintKeypair.publicKey,
    wallet.publicKey,
    config
  );
  await executeTransaction(connection, tx, wallet, { signers: [mintKeypair] });
  return [ata, mintId];
};

export const createMasterEditionTx = async (
  connection: Connection,
  mintId: PublicKey,
  authority: PublicKey,
  config?: { target?: PublicKey }
) => {
  const target = config?.target ?? authority;
  const ata = getAssociatedTokenAddressSync(mintId, target);
  const metadataId = findMintMetadataId(mintId);
  const editionId = findMintEditionId(mintId);

  return new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: authority,
      newAccountPubkey: mintId,
      space: MINT_SIZE,
      lamports: await getMinimumBalanceForRentExemptMint(connection),
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(mintId, 0, authority, authority),
    createAssociatedTokenAccountInstruction(authority, ata, target, mintId),
    createMintToInstruction(mintId, ata, authority, 1),
    createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataId,
        mint: mintId,
        updateAuthority: authority,
        mintAuthority: authority,
        payer: authority,
      },
      {
        createMetadataAccountArgsV2: {
          data: {
            name: `name-${Math.random()}`,
            symbol: "SYMB",
            uri: `uri-${Math.random()}`,
            sellerFeeBasisPoints: 0,
            creators: [{ address: authority, share: 100, verified: true }],
            collection: null,
            uses: null,
          },
          isMutable: true,
        },
      }
    ),
    createCreateMasterEditionV3Instruction(
      {
        edition: editionId,
        mint: mintId,
        updateAuthority: authority,
        mintAuthority: authority,
        metadata: metadataId,
        payer: authority,
      },
      { createMasterEditionArgs: { maxSupply: 0 } }
    )
  );
};

export async function executeTransaction(
  connection: Connection,
  tx: Transaction,
  wallet: Wallet,
  config?: { signers?: Signer[]; silent?: boolean }
): Promise<string> {
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = wallet.publicKey;
  tx = await wallet.signTransaction(tx);
  if (config?.signers) {
    tx.partialSign(...(config?.signers ?? []));
  }
  try {
    const txid = await sendAndConfirmRawTransaction(connection, tx.serialize());
    return txid;
  } catch (e) {
    if (!config?.silent) {
      handleError(e);
    }
    throw e;
  }
}

export async function executeTransactions(
  connection: Connection,
  txs: Transaction[],
  wallet: Wallet,
  config?: { signers?: Signer[]; silent?: boolean }
): Promise<string[]> {
  const latestBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const signedTxs = await wallet.signAllTransactions(
    txs.map((tx) => {
      tx.recentBlockhash = latestBlockhash;
      tx.feePayer = wallet.publicKey;
      if (config?.signers) {
        tx.partialSign(...(config?.signers ?? []));
      }
      return tx;
    })
  );
  const txids = await Promise.all(
    signedTxs.map(async (tx) => {
      try {
        const txid = await sendAndConfirmRawTransaction(
          connection,
          tx.serialize()
        );
        return txid;
      } catch (e) {
        if (!config?.silent) {
          handleError(e);
        }
        throw e;
      }
    })
  );
  return txids;
}

export const handleError = (e: any) => {
  const message = (e as SendTransactionError).message ?? "";
  const logs = (e as SendTransactionError).logs;
  if (logs) {
    console.error(logs, message);
  } else {
    console.error(e, message);
  }
};

