import type { Idl } from "@project-serum/anchor";
import type { PublicKey } from "@solana/web3.js";
type ErrorCode = {
    code: string;
    message: string;
};
export declare const NATIVE_ERRORS: ErrorCode[];
export type ErrorOptions = {
    /** ProgramIdls in priority order */
    programIdls?: {
        idl: Idl;
        programId: PublicKey;
    }[];
    /** Additional errors by code */
    additionalErrors?: ErrorCode[];
};
export declare const handleError: (e: any, fallBackMessage?: string, options?: ErrorOptions) => string;
export {};
//# sourceMappingURL=errors.d.ts.map