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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const shopify_api_1 = __importStar(require("@shopify/shopify-api"));
require('dotenv').config();
const app = (0, express_1.default)();
const API_KEY = process.env.API_KEY ? process.env.API_KEY : "";
const API_SECRET_KEY = process.env.API_SECRET_KEY ? process.env.API_SECRET_KEY : "";
const SCOPES = process.env.SCOPES ? process.env.SCOPES : "";
const SHOP = process.env.SHOP ? process.env.SHOP : "";
const HOST = process.env.HOST ? process.env.HOST : "";
const { HOST_SCHEME } = process.env;
shopify_api_1.default.Context.initialize({
    API_KEY,
    API_SECRET_KEY,
    SCOPES: [SCOPES],
    HOST_NAME: HOST.replace(/https?:\/\//, ""),
    HOST_SCHEME,
    IS_EMBEDDED_APP: false,
    API_VERSION: shopify_api_1.ApiVersion.October22, // all supported versions are available, as well as "unstable" and "unversioned"
});
// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {};
// the rest of the example code goes here
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[SHOP] === undefined) {
        // not logged in, redirect to login
        res.redirect(`/login`);
    }
    else {
        res.send("Hello world!");
        // Load your app skeleton page with App Bridge, and do something amazing!
        res.end();
    }
}));
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("HELLO WORLD 1 ! " + SHOP);
    let authRoute = yield shopify_api_1.default.Auth.beginAuth(req, res, SHOP, '/auth/callback', false);
    // console.log(authRoute);
    return res.redirect(authRoute);
}));
app.get('/auth/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log("HELLO WORLD! 2 ");
        const session = yield shopify_api_1.default.Auth.validateAuthCallback(req, res, req.query); // req.query must be cast to unkown and then AuthQuery in order to be accepted
        // console.log("HELLO WORLD! 3 ");
        ACTIVE_SHOPIFY_SHOPS[SHOP] = session.scope;
        console.log(session.accessToken);
        console.log(session.scope);
    }
    catch (error) {
        console.error(error); // in practice these should be handled more gracefully
    }
    // console.log("HOST!!! " + req.query.host);
    // console.log("SHOP!!! " + req.query.shop);
    // return res.redirect(`/?host=${req.query.host}&shop=${req.query.shop}`); // wherever you want your user to end up after OAuth completes
    return res.redirect('/auth/success');
}));
app.get('/products', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield shopify_api_1.default.Utils.loadCurrentSession(req, res);
    console.log('session: ' + JSON.stringify(session));
    if (session !== undefined) {
        const client = new shopify_api_1.default.Clients.Graphql(session.shop, session.accessToken);
        const products = yield client.query({
            data: `{
        products (first: 10) {
          edges {
            node {
              id
              title
              descriptionHtml
            }
          }
        }
      }`,
        });
        console.log('Products: ' + JSON.stringify(products));
        let productName = '';
        // if(typeof products.body.data !== "string") {
        for (let i = 0; i < products.body.data.products.edges.length; i++) {
            productName += '<p>' + products.body.data.products.edges[i].node.title + '</p>';
        }
        // }
        res.send(`<html><body><p>Products List</p>
      ${productName}
    </body></html>`);
    }
}));
app.get('/orders', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield shopify_api_1.default.Utils.loadCurrentSession(req, res);
    console.log('session: ' + JSON.stringify(session));
    if (session !== undefined) {
        const client = new shopify_api_1.default.Clients.Graphql(session.shop, session.accessToken);
        const orders = yield client.query({
            data: `{
        orders(first: 25, query: "fulfillment_status:unfulfilled AND financial_status:paid") {
          pageInfo {
            hasNextPage
          }
          edges {
            node {
             id
             processedAt
              displayFulfillmentStatus
              displayFinancialStatus
              discountCodes
              transactions {
                id
                kind
                status
                amountSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }`,
        });
        console.log('Orders: ' + JSON.stringify(orders));
        console.log(orders.body.data.orders.edges);
        let orderID = '';
        let totalAmount = 0;
        // if(typeof products.body.data !== "string") {
        for (let i = 0; i < orders.body.data.orders.edges.length; i++) {
            orderID += '<p>' + orders.body.data.orders.edges[i].node.id + '</p>';
            totalAmount += parseInt(orders.body.data.orders.edges[i].node.transactions[0].amountSet.shopMoney.amount);
        }
        // }
        res.send(`<html><body><p>Orders List</p>
      ${orderID}
      total sales for orders : ${totalAmount}
    </body></html>`);
    }
}));
app.get('/auth/success', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('<html><body><p>You have successfully authenticated and are back at your app.</p><p><a href="/products">View Products</a></p></body><p><a href="/orders">View Orders</a></p></body></html>');
}));
app.listen(3000, () => {
    console.log('your app is now listening on port 3000');
});
// session: {"id":"offline_whatalsosell.myshopify.com","shop":"whatalsosell.myshopify.com","state":"offline_307606808161220","isOnline":false,"scope":"read_products","accessToken":"shpua_bc1427785a68f4dc8e87937c920b5a91"}
// Products: {"body":{"data":{"products":{"edges":[{"node":{"id":"gid://shopify/Product/7977772187923","title":"t-shirt","descriptionHtml":"graphic tee"}},{"node":{"id":"gid://shopify/Product/7977930850579","title":"short pants","descriptionHtml":"stretchable short pants"}},{"node":{"id":"gid://shopify/Product/7977946841363","title":"long pants","descriptionHtml":"long pants"}}]}},"extensions":{"cost":{"requestedQueryCost":12,"actualQueryCost":5,"throttleStatus":{"maximumAvailable":1000,"currentlyAvailable":995,"restoreRate":50}}}},"headers":{}}
// { products: { edges: [ [Object], [Object], [Object] ] } }
// Orders: {
//   "body":{
//     "data":{
//       "orders":{
//         "edges":[{
//           "node":{
//             "id":"gid://shopify/Order/5151929237779",
//             "name":"#1001",
//             "customer":{
//               "displayName":"John Lee"
//             },
//             "discountCode":"NEWSHOPOFFER10",
//             "netPaymentSet":{
//               "shopMoney":{
//                 "amount":"44.0"
//               }
//             },
//             "totalPriceSet":{
//               "shopMoney":{
//                 "amount":"44.0"
//               }
//             }
//           }
//         },{
//           "node":{
//             "id":"gid://shopify/Order/5197349093651",
//             "name":"#1002",
//             "customer":{
//               "displayName":"John Lee"
//             },
//             "discountCode":null,
//             "netPaymentSet":{
//               "shopMoney":{
//                 "amount":"154.0"
//               }
//             },
//             "totalPriceSet":{
//               "shopMoney":{
//                 "amount":"154.0"
//               }
//             }
//           }
//         },{
//           "node":{
//             "id":"gid://shopify/Order/5197349880083",
//             "name":"#1003",
//             "customer":{
//               "displayName":"John Lee"
//             },
//             "discountCode":null,
//             "netPaymentSet":{
//               "shopMoney":{
//                 "amount":"396.0"
//               }
//             },
//             "totalPriceSet":{
//               "shopMoney":{
//                 "amount":"396.0"
//               }
//             }
//           }
//         }]
//       }
//     },"extensions":{"cost":{"requestedQueryCost":42,"actualQueryCost":14,"throttleStatus":{"maximumAvailable":1000,"currentlyAvailable":986,"restoreRate":50}}}},"headers":{}}
//# sourceMappingURL=index.js.map