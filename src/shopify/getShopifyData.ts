import { insertDailyTotalRefunds, insertDailyTotalSales } from './insertShopifyData';

export const getOrderById = async (orderId: any, prisma: any) => {
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

export const getTotalSalesTransaction = async (transaction: any, shopifyId: any, prisma: any) => {
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
    let order = await getOrderById(getSales[i].order_id, prisma);
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
    insertDailyTotalSales(key, date[key], shopifyId, prisma);
  }

  return getSales;
};

export const getDailyTotalSales = async (date: any, shopifyId: any, prisma: any) => {
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

export const getTotalRefundsTransaction = async (transaction: any, shopId: any, prisma: any) => {
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
    let order = await getOrderById(getRefunds[i].order_id, prisma);
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
    insertDailyTotalRefunds(key, date[key], shopId, prisma);
  }

  return getRefunds;
};

export const getDailyTotalRefunds = async (date: any, shopifyId: any, prisma: any) => {
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
