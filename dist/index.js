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
const node_cron_1 = __importDefault(require("node-cron"));
const body_parser_1 = __importDefault(require("body-parser"));
const client_1 = require("@prisma/client");
const prisma_queries_db_1 = require("./prisma_queries_db");
require('dotenv').config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const API_KEY = process.env.API_KEY ? process.env.API_KEY : "";
const API_SECRET_KEY = process.env.API_SECRET_KEY ? process.env.API_SECRET_KEY : "";
const SCOPES = process.env.SCOPES ? process.env.SCOPES : "";
const SHOP = process.env.SHOP ? process.env.SHOP : "";
const SHOP2 = process.env.SHOP2 ? process.env.SHOP2 : "";
const HOST = process.env.HOST ? process.env.HOST : "";
const { HOST_SCHEME } = process.env;
let shop;
let accessToken;
let storedShopId;
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
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("this is active shopify scopes : " + ACTIVE_SHOPIFY_SHOPS[shop]);
    //  This shop hasn't been seen yet, go through OAuth to create a session
    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
        res.send(`<html>
        <body>
          <p>Welcome! kindly insert your shop name</p>
          <form action="/login" method="get">
            <label for="shop_name">Enter your shop name with (.myshopify.com) :</label>
            <input type="text" id="shop_name" name="shop_name" required>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>`);
        // not logged in, redirect to login
        // res.redirect(`/login`);
    }
    else {
        res.send(`<html>
        <body>
          <p>Welcome!</p>
        </body>
      </html>`);
        res.end();
    }
}));
app.get("/shopify/success", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = new shopify_api_1.default.Clients.Graphql(shop, accessToken);
    try {
        const shopId = yield client.query({
            data: {
                query: getShopId()
            },
        });
        console.log(shopId.body.data.shop);
        storedShopId = shopId.body.data.shop.id;
        yield (0, prisma_queries_db_1.insertShop)(shopId.body.data.shop, accessToken);
        res.send(`<html>
        <body>
          <p>You have successfully authenticated.</p>
          <p>Please enter the date of orders needed to be retrived.</p>
          <form action="/shopify/getorders" method="post">
            <label for="from_created_date">Start Date:</label>
            <input type="date" id="from_created_date" name="from_created_date">
            <label for="to_created_date">End Date:</label>
            <input type="date" id="to_created_date" name="to_created_date">
            <button type="submit">Submit</button>
          </form>
          <p>If enter without date, it will retrieve orders for past 40 days by default.</p>
        </body>
      </html>`);
    }
    catch (err) {
        console.log("An error has occured: " + err);
        res.send(`<html>
        <body>
          <p>Invalid shop domain or access token. Kindly insert correct details.</p>
          <form action="/shopify" method="post">
            <label for="shop_name">Enter your shop name with (.myshopify.com) :</label>
            <input type="text" id="shop_name" name="shop_name" required>
            <label for="shop_access_token">Enter your access token:</label>
            <input type="text" id="shop_access_token" name="shop_access_token" required>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>`);
    }
}));
app.get('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    shop = req.query.shop_name;
    let authRoute = yield shopify_api_1.default.Auth.beginAuth(req, res, shop, '/auth/callback', false);
    console.log(authRoute);
    return res.redirect(authRoute);
}));
app.get('/auth/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const session = yield shopify_api_1.default.Auth.validateAuthCallback(req, res, req.query); // req.query must be cast to unkown and then AuthQuery in order to be accepted
        console.log(session);
        ACTIVE_SHOPIFY_SHOPS[shop] = session.scope;
        accessToken = session.accessToken;
        console.log("this is the shop name : " + shop);
        console.log("this is the access token : " + accessToken);
        // console.log(session.accessToken);
        console.log(session.scope);
    }
    catch (error) {
        console.error(error); // in practice these should be handled more gracefully
    }
    return res.redirect(`/shopify/success?host=${req.query.host}&shop=${req.query.shop}`);
}));
app.get("/home", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`<html>
        <body>
          <p>Welcome! kindly insert your shop name and access token</p>
          <form action="/shopify" method="post">
            <label for="shop_name">Enter your shop name with (.myshopify.com) :</label>
            <input type="text" id="shop_name" name="shop_name" required>
            <label for="shop_access_token">Enter your access token:</label>
            <input type="text" id="shop_access_token" name="shop_access_token" required>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>`);
    res.end();
}));
app.post("/shopify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.shop_name !== undefined && req.body.shop_access_token !== undefined) {
        shop = req.body.shop_name;
        accessToken = req.body.shop_access_token;
        const client = new shopify_api_1.default.Clients.Graphql(shop, accessToken);
        try {
            const shopId = yield client.query({
                data: {
                    query: getShopId()
                },
            });
            console.log(shopId.body.data.shop);
            storedShopId = shopId.body.data.shop.id;
            yield (0, prisma_queries_db_1.insertShop)(shopId.body.data.shop, accessToken);
            res.send(`<html>
          <body>
            <p>You have successfully authenticated.</p>
            <p>Please enter the date of orders needed to be retrived.</p>
            <form action="/shopify/getorders" method="post">
              <label for="from_created_date">Start Date:</label>
              <input type="date" id="from_created_date" name="from_created_date">
              <label for="to_created_date">End Date:</label>
              <input type="date" id="to_created_date" name="to_created_date">
              <button type="submit">Submit</button>
            </form>
            <p>If enter without date, it will retrieve orders for past 40 days by default.</p>
          </body>
        </html>`);
        }
        catch (err) {
            console.log("An error has occured: " + err);
            res.send(`<html>
          <body>
            <p>Invalid shop domain or access token. Kindly insert correct details.</p>
            <form action="/shopify" method="post">
              <label for="shop_name">Enter your shop name with (.myshopify.com) :</label>
              <input type="text" id="shop_name" name="shop_name" required>
              <label for="shop_access_token">Enter your access token:</label>
              <input type="text" id="shop_access_token" name="shop_access_token" required>
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>`);
        }
    }
}));
app.post("/shopify/getorders", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(storedShopId);
    console.log(typeof (req.body.from_created_date));
    console.log(req.body.from_created_date);
    console.log(req.body.to_created_date);
    if (req.body.from_created_date !== '' || req.body.to_created_date !== '') {
        if (req.body.to_created_date !== '') {
            let addOneDay = new Date(req.body.to_created_date);
            addOneDay.setDate(addOneDay.getDate() + 1);
            const toDay = addOneDay.getDate();
            const toMonth = addOneDay.getMonth() + 1;
            const toYear = addOneDay.getFullYear();
            req.body.to_created_date = toYear + "-" + toMonth + "-" + ("0" + toDay).slice(-2);
        }
        console.log("shopify get orders" + shop);
        console.log("shopify get orders" + accessToken);
        const client = new shopify_api_1.default.Clients.Graphql(shop, accessToken);
        let cursor = null;
        console.log("inside if else from : " + req.body.from_created_date);
        console.log("inside if else to : " + req.body.to_created_date);
        try {
            while (true) {
                const orders = yield client.query({
                    data: {
                        query: getOrdersWithDate(req.body),
                        variables: {
                            cursor: cursor
                        },
                    },
                });
                let nextPage = orders.body.data.orders.pageInfo.hasNextPage;
                cursor = orders.body.data.orders.pageInfo.endCursor;
                for (let i = 0; i < orders.body.data.orders.edges.length; i++) {
                    const order = orders.body.data.orders.edges[i].node;
                    yield (0, prisma_queries_db_1.insertOrder)(order, storedShopId);
                    for (let j = 0; j < order.transactions.length; j++) {
                        console.log(order.transactions[j].createdAt);
                        yield (0, prisma_queries_db_1.insertTransaction)(order, order.transactions[j]);
                    }
                }
                if (nextPage === false) {
                    console.log("All data have been retrieved, no more next page");
                    break;
                }
                ;
            }
            ;
            res.send(`<html>
          <body>
            <p>Your orders data have been successfully retrieved from your shop.</p>
            <p>Please select date to display data</p>
            <form action="/shopify/getdailytotal" method="post">
              <label for="from_created_date">Start Date:</label>
              <input type="date" id="from_created_date" name="from_created_date">
              <label for="to_created_date">End Date:</label>
              <input type="date" id="to_created_date" name="to_created_date">
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>`);
        }
        catch (err) {
            console.log("An error has occured when retrieving data from shop: " + err);
        }
    }
    else {
        console.log("shopify get orders" + shop);
        console.log("shopify get orders" + accessToken);
        const client = new shopify_api_1.default.Clients.Graphql(shop, accessToken);
        let cursor = null;
        const now = new Date(Date.now());
        now.setDate(now.getDate() + 1);
        const last = new Date(Date.now() - (40 * 24 * 60 * 60 * 1000)); //past 40 days
        console.log("now : " + now);
        const fromDay = last.getDate();
        const fromMonth = last.getMonth() + 1;
        const fromYear = last.getFullYear();
        const toDay = now.getDate();
        const toMonth = now.getMonth() + 1;
        const toYear = now.getFullYear();
        req.body.from_created_date = fromYear + "-" + fromMonth + "-" + ("0" + fromDay).slice(-2);
        req.body.to_created_date = toYear + "-" + toMonth + "-" + ("0" + toDay).slice(-2);
        console.log(req.body.from_created_date);
        console.log(req.body.to_created_date);
        try {
            while (true) {
                const orders = yield client.query({
                    data: {
                        query: getOrdersWithDate(req.body),
                        variables: {
                            cursor: cursor
                        },
                    },
                });
                let nextPage = orders.body.data.orders.pageInfo.hasNextPage;
                cursor = orders.body.data.orders.pageInfo.endCursor;
                for (let i = 0; i < orders.body.data.orders.edges.length; i++) {
                    const order = orders.body.data.orders.edges[i].node;
                    yield (0, prisma_queries_db_1.insertOrder)(order, storedShopId);
                    for (let j = 0; j < order.transactions.length; j++) {
                        yield (0, prisma_queries_db_1.insertTransaction)(order, order.transactions[j]);
                    }
                }
                if (nextPage === false) {
                    console.log("All data have been retrieved, no more next page");
                    break;
                }
                ;
            }
            ;
            res.send(`<html>
          <body>
            <p>Your orders data have been successfully retrieved from your shop.</p>
            <p>Please select date to display data</p>
            <form action="/shopify/getdailytotal" method="post">
              <label for="from_created_date">Start Date:</label>
              <input type="date" id="from_created_date" name="from_created_date">
              <label for="to_created_date">End Date:</label>
              <input type="date" id="to_created_date" name="to_created_date">
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>`);
        }
        catch (err) {
            console.log("An error has occured when retrieving data from shop: " + err);
        }
    }
}));
node_cron_1.default.schedule('*/5 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    if (shop !== undefined && accessToken !== undefined) {
        const client = new shopify_api_1.default.Clients.Graphql(shop, accessToken);
        try {
            const shopId = yield client.query({
                data: {
                    query: getShopId()
                },
            });
            storedShopId = shopId.body.data.shop.id;
            if (storedShopId !== undefined) {
                let cursor = null;
                const now = new Date(Date.now());
                now.setDate(now.getDate() + 1);
                const last = new Date(Date.now() - (40 * 24 * 60 * 60 * 1000)); //past 40 days
                const fromDay = last.getDate();
                const fromMonth = last.getMonth() + 1;
                const fromYear = last.getFullYear();
                const toDay = now.getDate();
                const toMonth = now.getMonth() + 1;
                const toYear = now.getFullYear();
                let scheduleTime = {
                    from_created_date: fromYear + "-" + fromMonth + "-" + ("0" + fromDay).slice(-2),
                    to_created_date: toYear + "-" + toMonth + "-" + ("0" + toDay).slice(-2),
                };
                console.log(scheduleTime.from_created_date);
                console.log(scheduleTime.to_created_date);
                try {
                    while (true) {
                        const orders = yield client.query({
                            data: {
                                query: getOrdersWithDate(scheduleTime),
                                variables: {
                                    cursor: cursor
                                },
                            },
                        });
                        let nextPage = orders.body.data.orders.pageInfo.hasNextPage;
                        cursor = orders.body.data.orders.pageInfo.endCursor;
                        for (let i = 0; i < orders.body.data.orders.edges.length; i++) {
                            const order = orders.body.data.orders.edges[i].node;
                            yield (0, prisma_queries_db_1.insertOrder)(order, storedShopId);
                            for (let j = 0; j < order.transactions.length; j++) {
                                yield (0, prisma_queries_db_1.insertTransaction)(order, order.transactions[j]);
                            }
                        }
                        if (nextPage === false) {
                            console.log("All data have been retrieved, no more next page");
                            break;
                        }
                        ;
                    }
                    ;
                }
                catch (err) {
                    console.log("An error has occured when retrieving data from shop: " + err);
                }
            }
        }
        catch (err) {
            console.log("An error has occured: " + err);
        }
    }
    else {
        console.log(shop);
        console.log(accessToken);
        console.log("shop or access token invalid while running schedule update");
    }
    console.log("---------------------");
    console.log("running a task every 5 minutes");
}));
app.post("/shopify/getdailytotal", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (req.body.from_created_date !== '' || req.body.to_created_date !== '') {
        const getTotalSalesTransactionResults = yield (0, prisma_queries_db_1.getTotalSalesTransaction)(req.body, storedShopId);
        const getTotalRefundsTransactionResults = yield (0, prisma_queries_db_1.getTotalRefundsTransaction)(req.body, storedShopId);
        if (getTotalSalesTransactionResults && getTotalRefundsTransactionResults) {
            const getDailyTotalSalesResults = yield (0, prisma_queries_db_1.getDailyTotalSales)(req.body, storedShopId);
            const getDailyTotalRefundsResults = yield (0, prisma_queries_db_1.getDailyTotalRefunds)(req.body, storedShopId);
            console.log(getDailyTotalSalesResults);
            console.log(getDailyTotalRefundsResults);
        }
    }
    else {
        const now = new Date(Date.now());
        now.setDate(now.getDate() + 1);
        const last = new Date(Date.now() - (40 * 24 * 60 * 60 * 1000)); //past 40 days
        const fromDay = last.getDate();
        const fromMonth = last.getMonth() + 1;
        const fromYear = last.getFullYear();
        const toDay = now.getDate();
        const toMonth = now.getMonth() + 1;
        const toYear = now.getFullYear();
        req.body.from_created_date = fromYear + "-" + fromMonth + "-" + ("0" + fromDay).slice(-2);
        req.body.to_created_date = toYear + "-" + toMonth + "-" + ("0" + toDay).slice(-2);
        console.log("to date: " + req.body.to_created_date);
        console.log("from date: " + req.body.from_created_date);
        const getTotalSalesTransactionResults = yield (0, prisma_queries_db_1.getTotalSalesTransaction)(req.body, storedShopId);
        const getTotalRefundsTransactionResults = yield (0, prisma_queries_db_1.getTotalRefundsTransaction)(req.body, storedShopId);
        if (getTotalSalesTransactionResults && getTotalRefundsTransactionResults) {
            const getDailyTotalSalesResults = yield (0, prisma_queries_db_1.getDailyTotalSales)(req.body, storedShopId);
            const getDailyTotalRefundsResults = yield (0, prisma_queries_db_1.getDailyTotalRefunds)(req.body, storedShopId);
            console.log(getDailyTotalSalesResults);
            console.log(getDailyTotalRefundsResults);
        }
    }
}));
app.listen(3000, () => {
    console.log('your app is now listening on port 3000');
});
const getOrdersWithDate = (date) => `query orders($cursor: String) {
  orders(first: 50, query: "created_at:>=${date.from_created_date} created_at:<${date.to_created_date}", after: $cursor) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        createdAt
        cancelledAt
        displayFulfillmentStatus
        displayFinancialStatus
        taxesIncluded
        discountCodes
        totalDiscountsSet {
          presentmentMoney {
            amount
            currencyCode
          }
          shopMoney {
            amount
            currencyCode
          }
        }
        transactions {
          id
          kind
          status
          createdAt
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
}`;
const getShopId = () => `query {
  shop {
    id
    name
    url
  }
}`;
//# sourceMappingURL=index.js.map