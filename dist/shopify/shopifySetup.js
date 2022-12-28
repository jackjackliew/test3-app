"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopifySetup = void 0;
const shopify_api_1 = __importStar(require("@shopify/shopify-api"));
const shopifySetup = () => {
    const API_KEY = process.env.API_KEY ? process.env.API_KEY : '';
    const API_SECRET_KEY = process.env.API_SECRET_KEY ? process.env.API_SECRET_KEY : '';
    const SCOPES = process.env.SCOPES ? process.env.SCOPES : '';
    const HOST = process.env.HOST ? process.env.HOST : '';
    const { HOST_SCHEME } = process.env;
    shopify_api_1.default.Context.initialize({
        API_KEY,
        API_SECRET_KEY,
        SCOPES: [SCOPES],
        HOST_NAME: HOST.replace(/https?:\/\//, ''),
        HOST_SCHEME,
        IS_EMBEDDED_APP: false,
        API_VERSION: shopify_api_1.ApiVersion.October22, // all supported versions are available, as well as "unstable" and "unversioned"
    });
    const activeShopifyShops = {};
    return activeShopifyShops;
};
exports.shopifySetup = shopifySetup;
//# sourceMappingURL=shopifySetup.js.map