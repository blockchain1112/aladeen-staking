"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFungibleToken = void 0;
const common_1 = require("@cardinal/common");
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const mplx_v2_1 = require("mplx-v2");
const connection_1 = require("../connection");
const wallet = web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode(process.env.AIRDROP_KEY || ""));
const MINT_KEYPAIR = web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode(process.env.AIRDROP_KEY || ""));
const SUPPLY = 600000000000000;
const DECIMALS = 7;
const createFungibleToken = async (cluster = "devnet", mintKeypair) => {
    const connection = (0, connection_1.connectionFor)(cluster);
    try {
        const tokenAccountId = (0, spl_token_1.getAssociatedTokenAddressSync)(mintKeypair.publicKey, wallet.publicKey);
        const metadataId = (0, common_1.findMintMetadataId)(mintKeypair.publicKey);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: spl_token_1.MINT_SIZE,
            lamports: await (0, spl_token_1.getMinimumBalanceForRentExemptMint)(connection),
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }), (0, spl_token_1.createInitializeMint2Instruction)(mintKeypair.publicKey, DECIMALS, wallet.publicKey, wallet.publicKey), (0, spl_token_1.createAssociatedTokenAccountInstruction)(wallet.publicKey, tokenAccountId, wallet.publicKey, mintKeypair.publicKey), (0, spl_token_1.createMintToInstruction)(mintKeypair.publicKey, tokenAccountId, wallet.publicKey, SUPPLY), (0, mplx_v2_1.createCreateMetadataAccountV2Instruction)({
            metadata: metadataId,
            mint: mintKeypair.publicKey,
            updateAuthority: wallet.publicKey,
            mintAuthority: wallet.publicKey,
            payer: wallet.publicKey,
        }, {
            createMetadataAccountArgsV2: {
                data: {
                    name: `name-${Math.random()}`,
                    symbol: "SYMB",
                    uri: `uri-${Math.random()}`,
                    sellerFeeBasisPoints: 0,
                    creators: [
                        { address: wallet.publicKey, share: 100, verified: true },
                    ],
                    collection: null,
                    uses: null,
                },
                isMutable: true,
            },
        }));
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash("max")).blockhash;
        transaction.sign(wallet, mintKeypair);
        const txid = await (0, web3_js_1.sendAndConfirmRawTransaction)(connection, transaction.serialize(), {
            commitment: "confirmed",
        });
        console.log(`Token created mintId=(${mintKeypair.publicKey.toString()}) metadataId=(${metadataId.toString()}) tokenAccount=(${tokenAccountId.toString()}) with transaction https://explorer.solana.com/tx/${txid}?cluster=${cluster}`);
    }
    catch (e) {
        console.log("Failed", e);
    }
};
exports.createFungibleToken = createFungibleToken;
(0, exports.createFungibleToken)("mainnet", MINT_KEYPAIR).catch((e) => {
    console.log(e);
});
//# sourceMappingURL=createFungibleToken.js.map