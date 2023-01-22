import type { Connection, PublicKey } from "@solana/web3.js";
export type MetadataJSON = {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: number;
    image: string;
    external_url: string;
    edition: number;
    attributes: {
        trait_type: string;
        value: string;
    }[];
};
export declare const fetchMetadata: (connection: Connection, mintIds: PublicKey[]) => Promise<[MetadataJSON[], {
    [mintId: string]: {
        pubkey: PublicKey;
        uri: string;
    };
}]>;
//# sourceMappingURL=metadata.d.ts.map