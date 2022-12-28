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
exports.getDailyTotalRefunds = exports.insertDailyTotalRefunds = exports.getTotalRefundsTransaction = exports.getDailyTotalSales = exports.insertDailyTotalSales = exports.getTotalSalesTransaction = exports.insertTransaction = exports.getOrderById = exports.insertOrder = exports.insertShop = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const insertShop = (shopify, accessToken, businessId) => __awaiter(void 0, void 0, void 0, function* () {
    const insertShop = yield prisma.shopify.upsert({
        where: {
            shopify_id: shopify.id,
        },
        update: {
            shopify_name: shopify.name,
            access_token: accessToken,
        },
        create: {
            shopify_id: shopify.id,
            shopify_name: shopify.name,
            shopify_url: shopify.url,
            access_token: accessToken,
            currency_code: shopify.currencyCode,
            business_id: businessId,
        },
    });
    const updateShopifyIdInBusiness = yield prisma.business.update({
        where: {
            business_id: businessId,
        },
        data: { shopify_id: shopify.id },
    });
});
exports.insertShop = insertShop;
const insertOrder = (order, shopifyId) => __awaiter(void 0, void 0, void 0, function* () {
    const insertOrder = yield prisma.order.upsert({
        where: {
            order_id: order.id,
        },
        update: {
            order_payment_status: order.displayFinancialStatus,
            order_fulfilment_status: order.displayFulfillmentStatus,
            total_discount_amount: parseInt(order.totalDiscountsSet.shopMoney.amount),
            order_total_price: parseInt(order.totalPriceSet.shopMoney.amount),
            order_total_received: parseInt(order.totalReceivedSet.shopMoney.amount),
            order_total_refunded: parseInt(order.totalRefundedSet.shopMoney.amount),
            order_net_payment: parseInt(order.netPaymentSet.shopMoney.amount),
        },
        create: {
            order_id: order.id,
            order_created_at: order.createdAt,
            order_payment_status: order.displayFinancialStatus,
            order_fulfilment_status: order.displayFulfillmentStatus,
            total_discount_amount: parseInt(order.totalDiscountsSet.shopMoney.amount),
            order_total_price: parseInt(order.totalPriceSet.shopMoney.amount),
            order_total_received: parseInt(order.totalReceivedSet.shopMoney.amount),
            order_total_refunded: parseInt(order.totalRefundedSet.shopMoney.amount),
            order_net_payment: parseInt(order.netPaymentSet.shopMoney.amount),
            shopify_id: shopifyId,
        },
    });
    if (insertOrder) {
        console.log(`Order has been inserted`);
    }
    else {
        console.log('Insert error');
    }
});
exports.insertOrder = insertOrder;
const getOrderById = (orderId) => __awaiter(void 0, void 0, void 0, function* () {
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
const insertTransaction = (order, transaction) => __awaiter(void 0, void 0, void 0, function* () {
    const insertTransaction = yield prisma.transaction.upsert({
        where: {
            transaction_id: transaction.id,
        },
        update: {},
        create: {
            order_id: order.id,
            transaction_id: transaction.id,
            transaction_created_at: transaction.createdAt,
            transaction_kind: transaction.kind,
            transaction_status: transaction.status,
            transaction_shop_amount: parseInt(transaction.amountSet.shopMoney.amount),
        },
    });
    if (insertTransaction) {
        console.log('Transaction have been inserted');
    }
    else {
        console.log('Insert error');
    }
});
exports.insertTransaction = insertTransaction;
const getTotalSalesTransaction = (transaction, shopifyId) => __awaiter(void 0, void 0, void 0, function* () {
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
        let order = yield (0, exports.getOrderById)(getSales[i].order_id);
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
        (0, exports.insertDailyTotalSales)(key, date[key], shopifyId);
    }
    return getSales;
});
exports.getTotalSalesTransaction = getTotalSalesTransaction;
const insertDailyTotalSales = (date, totalSales, shopifyId) => __awaiter(void 0, void 0, void 0, function* () {
    const insertTotalSales = yield prisma.daily_insight.upsert({
        where: {
            created_at_shopify_id: {
                created_at: new Date(date),
                shopify_id: shopifyId,
            },
        },
        update: {
            total_sales_amount: totalSales,
        },
        create: {
            created_at: new Date(date),
            total_sales_amount: totalSales,
            shopify_id: shopifyId,
        },
    });
    if (insertTotalSales) {
        console.log('All total sales have been inserted');
    }
    else {
        console.log('Insert error');
    }
});
exports.insertDailyTotalSales = insertDailyTotalSales;
const getDailyTotalSales = (date, shopifyId) => __awaiter(void 0, void 0, void 0, function* () {
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
const getTotalRefundsTransaction = (transaction, shopId) => __awaiter(void 0, void 0, void 0, function* () {
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
        let order = yield (0, exports.getOrderById)(getRefunds[i].order_id);
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
        (0, exports.insertDailyTotalRefunds)(key, date[key], shopId);
    }
    return getRefunds;
});
exports.getTotalRefundsTransaction = getTotalRefundsTransaction;
const insertDailyTotalRefunds = (date, totalRefunds, shopifyId) => __awaiter(void 0, void 0, void 0, function* () {
    const insertTotalRefunds = yield prisma.daily_insight.upsert({
        where: {
            created_at_shopify_id: {
                created_at: new Date(date),
                shopify_id: shopifyId,
            },
        },
        update: {
            total_refunds_amount: totalRefunds,
        },
        create: {
            created_at: new Date(date),
            total_refunds_amount: totalRefunds,
            shopify_id: shopifyId,
        },
    });
    if (insertTotalRefunds) {
        console.log('All total refunds have been inserted');
    }
    else {
        console.log('Insert error');
    }
});
exports.insertDailyTotalRefunds = insertDailyTotalRefunds;
const getDailyTotalRefunds = (date, shopifyId) => __awaiter(void 0, void 0, void 0, function* () {
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
// export const getTotalPendingsTransaction = async (order: any, shopId: any) => {
//     let date: any = {};
//     console.log(order.from_created_date);
//     console.log(order.to_created_date);
//     let refundsDate;
//     const getPendings = await prisma.order.findMany({
//         where: {
//             createdat: {
//                 gte: new Date(order.from_created_date),
//                 lte: new Date(order.to_created_date),
//             },
//             displayfinancialstatus: {
//                 contains: 'PENDING'
//             },
//         },
//         include: {
//             transactions: {
//                 select: {
//                     reference_order_id: true,
//                     transaction_created_at: true,
//                     transaction_presentment_amount: true,
//                 },
//             },
//         },
//         orderBy: {
//             createdat: 'asc'
//         },
//     })
//     for(let i = 0; i < getPendings.length; i++) {
//         console.log(getPendings[i]);
//         console.log("this is the order id for the transaction: " + getPendings[i].reference_order_id);
//         let order = await getOrderById(getPendings[i].reference_order_id)
//         if(order?.shop_id === shopId) {
//             refundsDate = getPendings[i].transaction_created_at;
//             console.log("salesDate: " + refundsDate);
//             if(refundsDate) {
//                 const day = refundsDate.getDate();
//                 const month = refundsDate.getMonth() + 1;
//                 const year = refundsDate.getFullYear();
//                 let convertedRefundsDate = year + "-" + month + "-" + ("0" + day).slice(-2);
//                 if(Object.keys(date).length === 0) {
//                     console.log("if the date object length is 0: " + getPendings[i].transaction_presentment_amount);
//                     console.log("first key: " + convertedRefundsDate);
//                     date[convertedRefundsDate] = getPendings[i].transaction_presentment_amount;
//                 } else if(Object.keys(date).length !== 0) {
//                     console.log("object key: " + date.hasOwnProperty(convertedRefundsDate));
//                     console.log("after first key: " + convertedRefundsDate);
//                     if(date.hasOwnProperty(convertedRefundsDate)) {
//                         date[convertedRefundsDate] += getPendings[i].transaction_presentment_amount;
//                     } else {
//                         date[convertedRefundsDate] = getPendings[i].transaction_presentment_amount;
//                     }
//                 }
//             }
//         } else {
//             console.log("incorrect shop id");
//         }
//     }
//     console.log(date);
//     for(const key in date) {
//         insertDailyTotalRefunds(key, date[key], shopId);
//     }
//     return getPendings;
// }
// export const insertDailyTotalPendings = async (date: any, totalRefunds: any, shopId: any) => {
//     const insertTotalRefunds = await prisma.daily_insight.upsert({
//         where: {
//             created_at_shop_id: {
//                 created_at: new Date(date),
//                 shop_id: shopId,
//             },
//         },
//         update: {
//             total_refunds_amount: totalRefunds,
//         },
//         create: {
//             created_at: new Date(date),
//             total_refunds_amount: totalRefunds,
//             shop_id: shopId,
//         },
//     })
//     if(insertTotalRefunds) {
//         console.log('All total refunds have been inserted');
//     } else {
//         console.log("Insert error");
//     }
// }
// export const getDailyTotalPendings = async (date: any, shopId: any) => {
//     const getTotalRefunds = await prisma.daily_insight.findMany({
//         where: {
//             created_at: {
//                 gte: new Date(date.from_created_date),
//                 lte: new Date(date.to_created_date),
//             },
//             shop_id: shopId,
//         },
//         select: {
//             created_at: true,
//             total_refunds_amount: true,
//         },
//         orderBy: {
//             created_at: 'asc'
//         },
//     })
//     return getTotalRefunds;
// }
//# sourceMappingURL=prisma_queries_db.js.map