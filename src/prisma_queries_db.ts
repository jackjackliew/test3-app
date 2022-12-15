import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const insertShop = async (shop: any, accessToken: any) => {
    const insertShop = await prisma.shop.upsert({
        where: {
            shop_id: shop.id
        },
        update: {
            shop_name: shop.name,
            access_token: accessToken,
        },
        create: {
            shop_id: shop.id,
            shop_name: shop.name,
            shop_url: shop.url,
            access_token: accessToken
        },
    })
}

export const insertOrder = async (order: any, shopId: any) => {
    const insertOrder = await prisma.order.upsert({
        where: {
            reference_order_id: order.id,
        },
        update: {
            displayfinancialstatus: order.displayFinancialStatus, 
            displayfulfillmentstatus: order.displayFulfillmentStatus, 
            discountcodes: order.discountCodes, 
            totaldiscountsset_presentmentmoney_amount: parseInt(order.totalDiscountsSet.presentmentMoney.amount), 
            totaldiscountsset_presentmentmoney_currencycode: order.totalDiscountsSet.presentmentMoney.currencyCode, 
            totaldiscountsset_shopmoney_amount: parseInt(order.totalDiscountsSet.shopMoney.amount), 
            totaldiscountsset_shopmoney_currencycode: order.totalDiscountsSet.shopMoney.currencyCode,
        },
        create: {
            createdat: order.createdAt,
            displayfinancialstatus: order.displayFinancialStatus, 
            displayfulfillmentstatus: order.displayFulfillmentStatus, 
            discountcodes: order.discountCodes, 
            totaldiscountsset_presentmentmoney_amount: parseInt(order.totalDiscountsSet.presentmentMoney.amount), 
            totaldiscountsset_presentmentmoney_currencycode: order.totalDiscountsSet.presentmentMoney.currencyCode, 
            totaldiscountsset_shopmoney_amount: parseInt(order.totalDiscountsSet.shopMoney.amount), 
            totaldiscountsset_shopmoney_currencycode: order.totalDiscountsSet.shopMoney.currencyCode,
            reference_order_id: order.id,
            shop_id: shopId,
        },
    })
    if(insertOrder) {
        console.log('All orders have been inserted');
    } else {
        console.log("Insert error");
    }
}

export const getOrderById = async (reference_order_id: any) => {
    const getOrderById = await prisma.order.findUnique({
        where: {
            reference_order_id
        }
    })
    if(getOrderById) {
        return getOrderById
    } else {
        console.log("error getting data with id");
    }
}

export const insertTransaction = async (order: any, transaction: any) => {
    const insertTransaction = await prisma.transaction.upsert({
        where: {
            reference_transaction_id: transaction.id,
        },
        update: {},
        create: {
            reference_order_id: order.id, 
            reference_transaction_id: transaction.id, 
            transaction_created_at: transaction.createdAt, 
            transaction_kind: transaction.kind, 
            transaction_status: transaction.status, 
            transaction_presentment_amount: parseInt(transaction.amountSet.presentmentMoney.amount), 
            transaction_presentment_currency: transaction.amountSet.presentmentMoney.currencyCode, 
            transaction_shop_amount: parseInt(transaction.amountSet.shopMoney.amount), 
            transaction_shop_currency: transaction.amountSet.shopMoney.currencyCode,
        },
    })
    if(insertTransaction) {
        console.log('All transactions have been inserted');
    } else {
        console.log("Insert error");
    }
}

export const getTotalSalesTransaction = async (transaction: any, shopId: any) => {
    let date: any = {};
    console.log(transaction.from_created_date);
    console.log(transaction.to_created_date);
    let salesDate;
    const getSales = await prisma.transaction.findMany({
        where: {
            transaction_created_at: {
                gte: new Date(transaction.from_created_date),
                lte: new Date(transaction.to_created_date),
            },
            transaction_kind: {
                contains: 'SALE'
            },
            transaction_status: {
                contains: 'SUCCESS'
            },
        },
        select: {
            reference_order_id: true,
            transaction_created_at: true,
            transaction_presentment_amount: true,
        },
        orderBy: {
            transaction_created_at: 'asc'
        },
    })
    for(let i = 0; i < getSales.length; i++) {
        console.log(getSales[i]);
        console.log("this is the order id for the transaction: " + getSales[i].reference_order_id);
        let order = await getOrderById(getSales[i].reference_order_id)
        if(order?.shop_id === shopId) {
            salesDate = getSales[i].transaction_created_at;
            console.log("salesDate: " + salesDate);
            if(salesDate) {
                const day = salesDate.getDate();
                const month = salesDate.getMonth() + 1;
                const year = salesDate.getFullYear();
                let convertedSalesDate = year + "-" + month + "-" + ("0" + day).slice(-2);
                if(Object.keys(date).length === 0) {
                    console.log("if the date object length is 0: " + getSales[i].transaction_presentment_amount);
                    console.log("first key: " + convertedSalesDate);
                    date[convertedSalesDate] = getSales[i].transaction_presentment_amount;
                } else if(Object.keys(date).length !== 0) {
                    console.log("object key: " + date.hasOwnProperty(convertedSalesDate));
                    console.log("after first key: " + convertedSalesDate);
                    if(date.hasOwnProperty(convertedSalesDate)) {
                        date[convertedSalesDate] += getSales[i].transaction_presentment_amount;
                    } else {
                        date[convertedSalesDate] = getSales[i].transaction_presentment_amount;
                    }
                }
            }
        } else {
            console.log("incorrect shop id");
        }
    }
    console.log(date);
    for(const key in date) {
        insertDailyTotalSales(key, date[key], shopId);
    }
    
    return getSales;
}

export const insertDailyTotalSales = async (date: any, totalSales: any, shopId: any) => {
    const insertTotalSales = await prisma.daily_insight.upsert({
        where: {
            created_at_shop_id: {
                created_at: new Date(date),
                shop_id: shopId,
            },
        },
        update: {
            total_sales_amount: totalSales,
        },
        create: {
            created_at: new Date(date),
            total_sales_amount: totalSales,
            shop_id: shopId,
        },
    })
    if(insertTotalSales) {
        console.log('All total sales have been inserted');
    } else {
        console.log("Insert error");
    }
}

export const getDailyTotalSales = async (date: any, shopId: any) => {
    const getTotalSales = await prisma.daily_insight.findMany({
        where: {
            created_at: {
                gte: new Date(date.from_created_date),
                lte: new Date(date.to_created_date),
            },
            shop_id: shopId,
        },
        select: {
            created_at: true,
            total_sales_amount: true,
        },
        orderBy: {
            created_at: 'asc'
        },
    })
    return getTotalSales;
}

export const getTotalRefundsTransaction = async (transaction: any, shopId: any) => {
    let date: any = {};
    console.log(transaction.from_created_date);
    console.log(transaction.to_created_date);
    let refundsDate;
    const getRefunds = await prisma.transaction.findMany({
        where: {
            transaction_created_at: {
                gte: new Date(transaction.from_created_date),
                lte: new Date(transaction.to_created_date),
            },
            transaction_kind: {
                contains: 'REFUND'
            },
            transaction_status: {
                contains: 'SUCCESS'
            },
        },
        select: {
            reference_order_id: true,
            transaction_created_at: true,
            transaction_presentment_amount: true,
        },
        orderBy: {
            transaction_created_at: 'asc'
        },
    })
    for(let i = 0; i < getRefunds.length; i++) {
        console.log(getRefunds[i]);
        console.log("this is the order id for the transaction: " + getRefunds[i].reference_order_id);
        let order = await getOrderById(getRefunds[i].reference_order_id)
        if(order?.shop_id === shopId) {
            refundsDate = getRefunds[i].transaction_created_at;
            console.log("salesDate: " + refundsDate);
            if(refundsDate) {
                const day = refundsDate.getDate();
                const month = refundsDate.getMonth() + 1;
                const year = refundsDate.getFullYear();
                let convertedRefundsDate = year + "-" + month + "-" + ("0" + day).slice(-2);
                if(Object.keys(date).length === 0) {
                    console.log("if the date object length is 0: " + getRefunds[i].transaction_presentment_amount);
                    console.log("first key: " + convertedRefundsDate);
                    date[convertedRefundsDate] = getRefunds[i].transaction_presentment_amount;
                } else if(Object.keys(date).length !== 0) {
                    console.log("object key: " + date.hasOwnProperty(convertedRefundsDate));
                    console.log("after first key: " + convertedRefundsDate);
                    if(date.hasOwnProperty(convertedRefundsDate)) {
                        date[convertedRefundsDate] += getRefunds[i].transaction_presentment_amount;
                    } else {
                        date[convertedRefundsDate] = getRefunds[i].transaction_presentment_amount;
                    }
                }
            }
        } else {
            console.log("incorrect shop id");
        }
    }
    console.log(date);
    for(const key in date) {
        insertDailyTotalRefunds(key, date[key], shopId);
    }
    
    return getRefunds;
}

export const insertDailyTotalRefunds = async (date: any, totalRefunds: any, shopId: any) => {
    const insertTotalRefunds = await prisma.daily_insight.upsert({
        where: {
            created_at_shop_id: {
                created_at: new Date(date),
                shop_id: shopId,
            },
        },
        update: {
            total_refunds_amount: totalRefunds,
        },
        create: {
            created_at: new Date(date),
            total_refunds_amount: totalRefunds,
            shop_id: shopId,
        },
    })
    if(insertTotalRefunds) {
        console.log('All total refunds have been inserted');
    } else {
        console.log("Insert error");
    }
}

export const getDailyTotalRefunds = async (date: any, shopId: any) => {
    const getTotalRefunds = await prisma.daily_insight.findMany({
        where: {
            created_at: {
                gte: new Date(date.from_created_date),
                lte: new Date(date.to_created_date),
            },
            shop_id: shopId,
        },
        select: {
            created_at: true,
            total_refunds_amount: true,
        },
        orderBy: {
            created_at: 'asc'
        },
    })
    return getTotalRefunds;
}