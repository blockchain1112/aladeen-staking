"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFungibleToken = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const anchor_1 = require("@project-serum/anchor");
const web3_js_1 = require("@solana/web3.js");
const connection_1 = require("../connection");
const wallet = web3_js_1.Keypair.fromSecretKey(anchor_1.utils.bytes.bs58.decode(process.env.AIRDROP_KEY || ""));
const MINT_PUBLIC_KEY = new web3_js_1.PublicKey("");
const updateFungibleToken = async (cluster = "devnet") => {
    const connection = (0, connection_1.connectionFor)(cluster);
    try {
        const metadataId = await mpl_token_metadata_1.Metadata.getPDA(MINT_PUBLIC_KEY);
        const metadataTx = new mpl_token_metadata_1.UpdateMetadataV2({ feePayer: wallet.publicKey }, {
            metadata: metadataId,
            metadataData: new mpl_token_metadata_1.DataV2({
                name: "",
                symbol: "",
                uri: "",
                sellerFeeBasisPoints: 0,
                creators: [
                    new mpl_token_metadata_1.Creator({
                        address: wallet.publicKey.toString(),
                        verified: true,
                        share: 100,
                    }),
                ],
                collection: null,
                uses: null,
            }),
            isMutable: true,
            newUpdateAuthority: wallet.publicKey,
            primarySaleHappened: false,
            updateAuthority: wallet.publicKey,
        });
        const transaction = new web3_js_1.Transaction();
        transaction.instructions = [...metadataTx.instructions];
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash("max")).blockhash;
        transaction.sign(wallet);
        const txid = await (0, web3_js_1.sendAndConfirmRawTransaction)(connection, transaction.serialize(), {
            commitment: "confirmed",
        });
        console.log(`Token updated mintId=(${MINT_PUBLIC_KEY.toString()}) metadataId=(${metadataId.toString()}) with transaction https://explorer.solana.com/tx/${txid}?cluster=${cluster}`);
    }
    catch (e) {
        console.log("Failed", e);
    }
};
exports.updateFungibleToken = updateFungibleToken;
(0, exports.updateFungibleToken)().catch((e) => {
    console.log(e);
});
//# sourceMappingURL=updateFungibleToken.js.map