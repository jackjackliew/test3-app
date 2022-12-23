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
exports.insertDailyTotalRefunds = exports.insertDailyTotalSales = exports.insertTransaction = exports.insertOrder = exports.insertShopify = void 0;
const insertShopify = (shopify, accessToken, business, prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
            business_id: business.id,
        },
    });
    const updateShopifyIdInBusiness = yield prisma.business.update({
        where: {
            business_id: business.id,
        },
        data: { shopify_id: shopify.id },
    });
});
exports.insertShopify = insertShopify;
const insertOrder = (order, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
const insertTransaction = (order, transaction, prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
const insertDailyTotalSales = (date, totalSales, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
const insertDailyTotalRefunds = (date, totalRefunds, shopifyId, prisma) => __awaiter(void 0, void 0, void 0, function* () {
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
//# sourceMappingURL=insertShopifyData.js.map