/// <reference types="node" />
/// <reference types="@coral-xyz/anchor/node_modules/@solana/web3.js" />
import type { Connection } from "@solana/web3.js";
export declare const getAllStakeEntries: (connection: Connection) => Promise<{
    pubkey: import("@solana/web3.js").PublicKey;
    account: import("@solana/web3.js").AccountInfo<Buffer>;
}[]>;
//# sourceMappingURL=fillEntryZeros.d.ts.map