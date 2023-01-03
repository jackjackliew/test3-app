export const insertShopifyUrl = async (shopUrl: any, businessId: any, prisma: any) => {
  const insertShopifyUrl = await prisma.shopify.upsert({
    where: {
      shopify_url: shopUrl,
    },
    update: {},
    create: {
      shopify_url: shopUrl,
      business_id: businessId,
    },
  });
}

export const insertShopify = async (shop: any, shopify: any, accessToken: any, business: any, prisma: any) => {
  const insertShop = await prisma.shopify.upsert({
    where: {
      shopify_id: shop.id,
    },
    update: {
      shopify_name: shopify.name,
      access_token: accessToken,
      business_id: business.id,
      currency_code: shopify.currencyCode,
    },
    create: {
      shopify_name: shopify.name,
      shopify_url: shopify.url,
      access_token: accessToken,
      currency_code: shopify.currencyCode,
      business_id: business.id,
    },
  });

  const updateShopifyIdInBusiness = await prisma.business.update({
    where: {
      business_id: business.id,
    },
    data: { shopify_id: shopify.id },
  });
};
export const insertOrder = async (order: any, shopifyId: any, prisma: any) => {
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

export const insertTransaction = async (order: any, transaction: any, prisma: any) => {
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

export const insertDailyTotalSales = async (date: any, totalSales: any, shopifyId: any, prisma: any) => {
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

export const insertDailyTotalRefunds = async (date: any, totalRefunds: any, shopifyId: any, prisma: any) => {
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
