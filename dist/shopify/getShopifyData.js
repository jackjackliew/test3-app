"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderCount = exports.getDailyTotalRefunds = exports.getTotalRefundsTransaction = exports.getDailyTotalSales = exports.getTotalSalesTransaction = exports.getOrderById = void 0;
const insertShopifyData_1 = require("./insertShopifyData");
const getOrderById = (orderId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    const getOrderById = yield prisma.order.findUnique({
        where: {
            order_id: orderId,
        },
    });
    if (getOrderById) {
        return getOrderById;
    }
    else {
        console.log('error getting data with id');
    }
});
exports.getOrderById = getOrderById;
const getTotalSalesTransaction = (transaction, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    let date = {};
    console.log(transaction.from_created_date);
    console.log(transaction.to_created_date);
    let salesDate;
    const getSales = yield prisma.transaction.findMany({
        where: {
            transaction_created_at: {
                gte: new Date(transaction.from_created_date),
                lt: new Date(transaction.to_created_date),
            },
            transaction_kind: {
                contains: 'SALE',
            },
            transaction_status: {
                contains: 'SUCCESS',
            },
        },
        select: {
            order_id: true,
            transaction_created_at: true,
            transaction_shop_amount: true,
        },
        orderBy: {
            transaction_created_at: 'asc',
        },
    });
    for (let i = 0; i < getSales.length; i++) {
        console.log(getSales[i]);
        console.log('this is the order id for the transaction: ' + getSales[i].order_id);
        let order = yield (0, exports.getOrderById)(getSales[i].order_id, prisma);
        if ((order === null || order === void 0 ? void 0 : order.shopify_id) === shopifyId) {
            salesDate = getSales[i].transaction_created_at;
            console.log('salesDate: ' + salesDate);
            if (salesDate) {
                const day = salesDate.getDate();
                const month = salesDate.getMonth() + 1;
                const year = salesDate.getFullYear();
                let convertedSalesDate = year + '-' + month + '-' + ('0' + day).slice(-2);
                if (Object.keys(date).length === 0) {
                    console.log('if the date object length is 0: ' + getSales[i].transaction_shop_amount);
                    console.log('first key: ' + convertedSalesDate);
                    date[convertedSalesDate] = getSales[i].transaction_shop_amount;
                }
                else if (Object.keys(date).length !== 0) {
                    console.log('object key: ' + date.hasOwnProperty(convertedSalesDate));
                    console.log('after first key: ' + convertedSalesDate);
                    if (date.hasOwnProperty(convertedSalesDate)) {
                        date[convertedSalesDate] += getSales[i].transaction_shop_amount;
                    }
                    else {
                        date[convertedSalesDate] = getSales[i].transaction_shop_amount;
                    }
                }
            }
        }
        else {
            console.log('incorrect shop id');
        }
    }
    console.log(date);
    for (const key in date) {
        (0, insertShopifyData_1.insertDailyTotalSales)(key, date[key], shopifyId, prisma);
    }
    return getSales;
});
exports.getTotalSalesTransaction = getTotalSalesTransaction;
const getDailyTotalSales = (date, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    const getTotalSales = yield prisma.daily_insight.findMany({
        where: {
            created_at: {
                gte: new Date(date.from_created_date),
                lt: new Date(date.to_created_date),
            },
            shopify_id: shopifyId,
        },
        select: {
            created_at: true,
            total_sales_amount: true,
        },
        orderBy: {
            created_at: 'asc',
        },
    });
    return getTotalSales;
});
exports.getDailyTotalSales = getDailyTotalSales;
const getTotalRefundsTransaction = (transaction, shopId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    let date = {};
    console.log(transaction.from_created_date);
    console.log(transaction.to_created_date);
    let refundsDate;
    const getRefunds = yield prisma.transaction.findMany({
        where: {
            transaction_created_at: {
                gte: new Date(transaction.from_created_date),
                lte: new Date(transaction.to_created_date),
            },
            transaction_kind: {
                contains: 'REFUND',
            },
            transaction_status: {
                contains: 'SUCCESS',
            },
        },
        select: {
            order_id: true,
            transaction_created_at: true,
            transaction_shop_amount: true,
        },
        orderBy: {
            transaction_created_at: 'asc',
        },
    });
    for (let i = 0; i < getRefunds.length; i++) {
        console.log(getRefunds[i]);
        console.log('this is the order id for the transaction: ' + getRefunds[i].order_id);
        let order = yield (0, exports.getOrderById)(getRefunds[i].order_id, prisma);
        if ((order === null || order === void 0 ? void 0 : order.shopify_id) === shopId) {
            refundsDate = getRefunds[i].transaction_created_at;
            console.log('salesDate: ' + refundsDate);
            if (refundsDate) {
                const day = refundsDate.getDate();
                const month = refundsDate.getMonth() + 1;
                const year = refundsDate.getFullYear();
                let convertedRefundsDate = year + '-' + month + '-' + ('0' + day).slice(-2);
                if (Object.keys(date).length === 0) {
                    console.log('if the date object length is 0: ' + getRefunds[i].transaction_shop_amount);
                    console.log('first key: ' + convertedRefundsDate);
                    date[convertedRefundsDate] = getRefunds[i].transaction_shop_amount;
                }
                else if (Object.keys(date).length !== 0) {
                    console.log('object key: ' + date.hasOwnProperty(convertedRefundsDate));
                    console.log('after first key: ' + convertedRefundsDate);
                    if (date.hasOwnProperty(convertedRefundsDate)) {
                        date[convertedRefundsDate] += getRefunds[i].transaction_shop_amount;
                    }
                    else {
                        date[convertedRefundsDate] = getRefunds[i].transaction_shop_amount;
                    }
                }
            }
        }
        else {
            console.log('incorrect shop id');
        }
    }
    console.log(date);
    for (const key in date) {
        (0, insertShopifyData_1.insertDailyTotalRefunds)(key, date[key], shopId, prisma);
    }
    return getRefunds;
});
exports.getTotalRefundsTransaction = getTotalRefundsTransaction;
const getDailyTotalRefunds = (date, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    const getTotalRefunds = yield prisma.daily_insight.findMany({
        where: {
            created_at: {
                gte: new Date(date.from_created_date),
                lte: new Date(date.to_created_date),
            },
            shopify_id: shopifyId,
        },
        select: {
            created_at: true,
            total_refunds_amount: true,
        },
        orderBy: {
            created_at: 'asc',
        },
    });
    return getTotalRefunds;
});
exports.getDailyTotalRefunds = getDailyTotalRefunds;
const getOrderCount = (order, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
    let date = {};
    const getOrderCount = yield prisma.order.findMany({
        where: {
            order_created_at: {
                gte: new Date(order.from_created_date),
                lt: new Date(order.to_created_date),
            },
            shopify_id: shopifyId,
        },
    });
    for (let i = 0; i < getOrderCount.length; i++) { }
});
exports.getOrderCount = getOrderCount;
//# sourceMappingURL=getShopifyData.js.map