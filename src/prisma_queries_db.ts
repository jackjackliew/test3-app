import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const insertBusiness = async (businessName: any) => {
  const insertBusiness = await prisma.business.create({
    data: {
      business_name: businessName,
    },
    select: {
      business_id: true,
    },
  });
  return insertBusiness.business_id;
};

export const insertShop = async (shopify: any, accessToken: any, businessId: any) => {
  const insertShop = await prisma.shopify.upsert({
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

  const updateShopifyIdInBusiness = await prisma.business.update({
    where: {
      business_id: businessId,
    },
    data: { shopify_id: shopify.id },
  });
};

export const insertOrder = async (order: any, shopifyId: any) => {
  const insertOrder = await prisma.order.upsert({
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
  } else {
    console.log('Insert error');
  }
};

export const getOrderById = async (orderId: any) => {
  const getOrderById = await prisma.order.findUnique({
    where: {
      order_id: orderId,
    },
  });
  if (getOrderById) {
    return getOrderById;
  } else {
    console.log('error getting data with id');
  }
};

export const insertTransaction = async (order: any, transaction: any) => {
  const insertTransaction = await prisma.transaction.upsert({
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
  } else {
    console.log('Insert error');
  }
};

export const getTotalSalesTransaction = async (transaction: any, shopifyId: any) => {
  let date: any = {};
  console.log(transaction.from_created_date);
  console.log(transaction.to_created_date);
  let salesDate;
  const getSales = await prisma.transaction.findMany({
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
    let order = await getOrderById(getSales[i].order_id);
    if (order?.shopify_id === shopifyId) {
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
        } else if (Object.keys(date).length !== 0) {
          console.log('object key: ' + date.hasOwnProperty(convertedSalesDate));
          console.log('after first key: ' + convertedSalesDate);
          if (date.hasOwnProperty(convertedSalesDate)) {
            date[convertedSalesDate] += getSales[i].transaction_shop_amount;
          } else {
            date[convertedSalesDate] = getSales[i].transaction_shop_amount;
          }
        }
      }
    } else {
      console.log('incorrect shop id');
    }
  }
  console.log(date);
  for (const key in date) {
    insertDailyTotalSales(key, date[key], shopifyId);
  }

  return getSales;
};

export const insertDailyTotalSales = async (date: any, totalSales: any, shopifyId: any) => {
  const insertTotalSales = await prisma.daily_insight.upsert({
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
  } else {
    console.log('Insert error');
  }
};

export const getDailyTotalSales = async (date: any, shopifyId: any) => {
  const getTotalSales = await prisma.daily_insight.findMany({
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
};

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
    let order = await getOrderById(getRefunds[i].order_id);
    if (order?.shopify_id === shopId) {
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
        } else if (Object.keys(date).length !== 0) {
          console.log('object key: ' + date.hasOwnProperty(convertedRefundsDate));
          console.log('after first key: ' + convertedRefundsDate);
          if (date.hasOwnProperty(convertedRefundsDate)) {
            date[convertedRefundsDate] += getRefunds[i].transaction_shop_amount;
          } else {
            date[convertedRefundsDate] = getRefunds[i].transaction_shop_amount;
          }
        }
      }
    } else {
      console.log('incorrect shop id');
    }
  }
  console.log(date);
  for (const key in date) {
    insertDailyTotalRefunds(key, date[key], shopId);
  }

  return getRefunds;
};

export const insertDailyTotalRefunds = async (date: any, totalRefunds: any, shopifyId: any) => {
  const insertTotalRefunds = await prisma.daily_insight.upsert({
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
  } else {
    console.log('Insert error');
  }
};

export const getDailyTotalRefunds = async (date: any, shopifyId: any) => {
  const getTotalRefunds = await prisma.daily_insight.findMany({
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
};

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
