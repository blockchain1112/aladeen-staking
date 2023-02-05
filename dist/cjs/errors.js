"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.NATIVE_ERRORS = void 0;
const rewardDistributor_1 = require("./programs/rewardDistributor");
const stakePool_1 = require("./programs/stakePool");
exports.NATIVE_ERRORS = [
    {
        code: "WalletSignTransactionError",
        message: "User rejected the request.",
    },
    {
        code: "failed to get recent blockhash",
        message: "Solana is experiencing degrading performance. You transaction failed to execute.",
    },
    {
        code: "Blockhash not found",
        message: "Solana is experiencing degrading performance. Transaction may or may not have gone through.",
    },
    {
        code: "Transaction was not confirmed in",
        message: "Transaction timed out waiting on confirmation from Solana. It may or may not have gone through.",
    },
    {
        code: "Attempt to debit an account but found no record of a prior credit",
        message: "Wallet has never had any sol before. Try adding sol first.",
    },
    {
        code: "Provided owner is not allowed",
        message: "Token account is already created for this user",
    },
    {
        code: "not associated with",
        message: "Account not associated with this mint",
    },
    {
        code: "rent-exempt",
        message: "Insufficient funds. User does not have enough sol to complete the transaction",
    },
    // token program errors
    {
        code: "insufficient funds",
        message: "Insufficient funds. User does not have enough balance of token to complete the transaction",
    },
    // token program errors
    {
        code: "0x1",
        message: "Insufficient funds. User does not have enough balance of token to complete the transaction",
    },
    {
        code: "0x4",
        message: "Invalid owner. The user is likely not mint authority of this token.",
    },
    {
        code: "91",
        message: "Token is not ellgible for original receipts",
    },
    // anchor errors
    {
        code: "100",
        message: "InstructionMissing: 8 byte instruction identifier not provided",
    },
    {
        code: "101",
        message: "InstructionFallbackNotFound: Fallback functions are not supported",
    },
    {
        code: "102",
        message: "InstructionDidNotDeserialize: The program could not deserialize the given instruction",
    },
    {
        code: "103",
        message: "InstructionDidNotSerialize: The program could not serialize the given instruction",
    },
    {
        code: "1000",
        message: "IdlInstructionStub: The program was compiled without idl instructions",
    },
    {
        code: "1001",
        message: "IdlInstructionInvalidProgram: Invalid program given to the IDL instruction",
    },
    { code: "2000", message: "ConstraintMut: A mut constraint was violated" },
    {
        code: "2001",
        message: "ConstraintHasOne: A has one constraint was violated",
    },
    {
        code: "2002",
        message: "ConstraintSigner: A signer constraint as violated",
    },
    { code: "2003", message: "ConstraintRaw: A raw constraint was violated" },
    {
        code: "2004",
        message: "ConstraintOwner: An owner constraint was violated",
    },
    {
        code: "2005",
        message: "ConstraintRentExempt: A rent exemption constraint was violated",
    },
    {
        code: "2006",
        message: "ConstraintSeeds: A seeds constraint was violated",
    },
    {
        code: "2007",
        message: "ConstraintExecutable: An executable constraint was violated",
    },
    {
        code: "2008",
        message: "ConstraintState: A state constraint was violated",
    },
    {
        code: "2009",
        message: "ConstraintAssociated: An associated constraint was violated",
    },
    {
        code: "2010",
        message: "ConstraintAssociatedInit: An associated init constraint was violated",
    },
    {
        code: "2011",
        message: "ConstraintClose: A close constraint was violated",
    },
    {
        code: "2012",
        message: "ConstraintAddress: An address constraint was violated",
    },
    {
        code: "2013",
        message: "ConstraintZero: Expected zero account discriminant",
    },
    {
        code: "2014",
        message: "ConstraintTokenMint: A token mint constraint was violated",
    },
    {
        code: "2015",
        message: "ConstraintTokenOwner: A token owner constraint was violated",
    },
    {
        code: "2016",
        message: "ConstraintMintMintAuthority: A mint mint authority constraint was violated",
    },
    {
        code: "2017",
        message: "ConstraintMintFreezeAuthority: A mint freeze authority constraint was violated",
    },
    {
        code: "2018",
        message: "ConstraintMintDecimals: A mint decimals constraint was violated",
    },
    {
        code: "2019",
        message: "ConstraintSpace: A space constraint was violated",
    },
    {
        code: "3000",
        message: "AccountDiscriminatorAlreadySet: The account discriminator was already set on this account",
    },
    {
        code: "3001",
        message: "AccountDiscriminatorNotFound: No 8 byte discriminator was found on the account",
    },
    {
        code: "3002",
        message: "AccountDiscriminatorMismatch: 8 byte discriminator did not match what was expected",
    },
    {
        code: "3003",
        message: "AccountDidNotDeserialize: Failed to deserialize the account",
    },
    {
        code: "3004",
        message: "AccountDidNotSerialize: Failed to serialize the account",
    },
    {
        code: "3005",
        message: "AccountNotEnoughKeys: Not enough account keys given to the instruction",
    },
    {
        code: "3006",
        message: "AccountNotMutable: The given account is not mutable",
    },
    {
        code: "3007",
        message: "AccountNotProgramOwned: The given account is not owned by the executing program",
    },
    {
        code: "3008",
        message: "InvalidProgramId: Program ID was not as expected",
    },
    {
        code: "3009",
        message: "InvalidProgramExecutable: Program account is not executable",
    },
    {
        code: "3010",
        message: "AccountNotSigner: The given account did not sign",
    },
    {
        code: "3011",
        message: "AccountNotSystemOwned: The given account is not owned by the system program",
    },
    {
        code: "3012",
        message: "AccountNotInitialized: The program expected this account to be already initialized",
    },
    {
        code: "3013",
        message: "AccountNotProgramData: The given account is not a program data account",
    },
    {
        code: "3014",
        message: "AccountNotAssociatedTokenAccount: The given account is not the associated token account",
    },
    {
        code: "4000",
        message: "StateInvalidAddress: The given state account does not have the correct address",
    },
    {
        code: "5000",
        message: "Deprecated: The API being used is deprecated and should no longer be used",
    },
].reverse();
const handleError = (e, fallBackMessage = "Transaction failed", 
// programIdls in priority order
options = {
    programIdls: [
        { programId: stakePool_1.STAKE_POOL_ADDRESS, idl: stakePool_1.STAKE_POOL_IDL },
        { programId: rewardDistributor_1.REWARD_DISTRIBUTOR_ADDRESS, idl: rewardDistributor_1.REWARD_DISTRIBUTOR_IDL },
    ],
    additionalErrors: exports.NATIVE_ERRORS,
}) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const programIdls = (_a = options.programIdls) !== null && _a !== void 0 ? _a : [];
    const additionalErrors = (_b = options.additionalErrors) !== null && _b !== void 0 ? _b : [];
    const hex = (_c = e === null || e === void 0 ? void 0 : e.message) === null || _c === void 0 ? void 0 : _c.split(" ").at(-1);
    const dec = parseInt(hex || "", 16);
    const logs = (_f = (_e = (_d = e === null || e === void 0 ? void 0 : e.logs) !== null && _d !== void 0 ? _d : [
        e === null || e === void 0 ? void 0 : e.message,
    ]) !== null && _e !== void 0 ? _e : [e.toString()]) !== null && _f !== void 0 ? _f : [];
    const matchedErrors = [
        ...[
            ...programIdls.map(({ idl, programId }) => {
                var _a, _b;
                return ({
                    // match program on any log that includes programId and 'failed'
                    programMatch: logs === null || logs === void 0 ? void 0 : logs.some((l) => (l === null || l === void 0 ? void 0 : l.includes(programId.toString())) && l.includes("failed")),
                    // match error with decimal
                    errorMatch: (_b = (_a = idl.errors) === null || _a === void 0 ? void 0 : _a.find((err) => err.code === dec)) === null || _b === void 0 ? void 0 : _b.msg,
                });
            }),
            {
                // match native error with decimal
                errorMatch: (_g = additionalErrors.find((err) => err.code === dec.toString())) === null || _g === void 0 ? void 0 : _g.message,
            },
        ],
        ...[
            {
                programMatch: true,
                errorMatch: (_h = additionalErrors.find((err) => {
                    var _a, _b;
                    // message includes error
                    return ((_a = e === null || e === void 0 ? void 0 : e.message) === null || _a === void 0 ? void 0 : _a.includes(err.code)) ||
                        // toString includes error
                        e.toString().includes(err.code) ||
                        (
                        // any log includes error
                        (_b = e === null || e === void 0 ? void 0 : e.logs) === null || _b === void 0 ? void 0 : _b.some((l) => l.toString().includes(err.code)));
                })) === null || _h === void 0 ? void 0 : _h.message,
            },
            ...programIdls.map(({ idl, programId }) => {
                var _a, _b;
                return ({
                    // match program on any log that includes programId and 'failed'
                    programMatch: logs === null || logs === void 0 ? void 0 : logs.some((l) => (l === null || l === void 0 ? void 0 : l.includes(programId.toString())) && l.includes("failed")),
                    errorMatch: (_b = (_a = idl.errors) === null || _a === void 0 ? void 0 : _a.find((err) => {
                        var _a, _b;
                        // message includes error
                        return ((_a = e === null || e === void 0 ? void 0 : e.message) === null || _a === void 0 ? void 0 : _a.includes(err.code.toString())) ||
                            // toString includes error
                            e.toString().includes(err.code.toString()) ||
                            (
                            // any log includes error
                            (_b = e === null || e === void 0 ? void 0 : e.logs) === null || _b === void 0 ? void 0 : _b.some((l) => l.toString().includes(err.code.toString())));
                    })) === null || _b === void 0 ? void 0 : _b.msg,
                });
            }),
        ],
    ];
    return (((_j = matchedErrors.find((e) => e.programMatch && e.errorMatch)) === null || _j === void 0 ? void 0 : _j.errorMatch) ||
        ((_k = matchedErrors.find((e) => e.errorMatch)) === null || _k === void 0 ? void 0 : _k.errorMatch) ||
        fallBackMessage);
};
exports.handleError = handleError;
//# sourceMappingURL=errors.js.map