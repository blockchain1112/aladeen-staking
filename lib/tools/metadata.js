"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchMetadata = void 0;
const tslib_1 = require("tslib");
const common_1 = require("@cardinal/common");
const mplx_v2_1 = require("mplx-v2");
const node_fetch_1 = tslib_1.__importDefault(require("node-fetch"));
const fetchMetadata = async (connection, mintIds) => {
    console.log(`> fetchMetadata (${mintIds.length})`);
    console.log(`>> metaplexData (${mintIds.length})`);
    const metaplexIds = mintIds.map((mint) => (0, common_1.findMintMetadataId)(mint));
    const metaplexAccountInfos = await (0, common_1.getBatchedMultipleAccounts)(connection, metaplexIds);
    const metaplexData = metaplexAccountInfos.reduce((acc, accountInfo, i) => {
        try {
            if (accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.data) {
                const metaplexMintData = mplx_v2_1.Metadata.deserialize(accountInfo === null || accountInfo === void 0 ? void 0 : accountInfo.data)[0];
                acc[mintIds[i].toString()] = {
                    pubkey: metaplexIds[i],
                    uri: metaplexMintData.data.uri,
                };
            }
        }
        catch (e) {
            console.log("Error desirializing metaplex data");
        }
        return acc;
    }, {});
    console.log(`>> offChain metadata (${mintIds.length})`);
    const metadata = await Promise.all(Object.values(metaplexData).map((data) => (0, node_fetch_1.default)(data.uri).then(async (res) => (await res.json()))));
    return [metadata, metaplexData];
};
exports.fetchMetadata = fetchMetadata;
//# sourceMappingURL=metadata.js.map