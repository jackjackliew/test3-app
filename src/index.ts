// src/index.ts
import express from 'express';
import Shopify, { ApiVersion, AuthQuery } from '@shopify/shopify-api';
import cron from 'node-cron';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import { insertShopify, insertOrder, insertTransaction } from './shopify/insertShopifyData';
import { getDailyTotalRefunds, getDailyTotalSales, getTotalRefundsTransaction, getTotalSalesTransaction } from './shopify/getShopifyData';
import { insertBusiness } from './business/insertBusiness';
import { getShopify, getOrdersWithDate } from './shopify/query';
import { shopifySetup } from './shopify/shopifySetup';
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

let shop: any;
let accessToken: any;
let storedShopId: any;
let businessName: any;
let business: any;

interface MyResponseBodyType {
  data: any;
}
let currentActiveShopify = shopifySetup();

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/createbusiness', async (req, res) => {
  res.send(
    `<html>
      <body>
        <p>Welcome! Please create a business</p>
        <form action="/insertshop" method="get">
          <label for="business_name">Enter your business name :</label>
          <input type="text" id="business_name" name="business_name" required>
          <button type="submit">Submit</button>
        </form>
      </body>
    </html>`
  );
});

app.get('/', async (req, res) => {
  const businessList = await prisma.business.findMany({
    select: {
      business_name: true,
    },
  });

  let options = '';
  for (let i = 0; i < businessList.length; i++) {
    options += '<option>' + businessList[i].business_name + '</option>';
  }
  console.log(options);
  console.log(businessList);

  //  This shop hasn't been seen yet, go through OAuth to create a session
  if (currentActiveShopify[shop] === undefined) {
    res.send(
      `<html>
        <body>
          <p>Choose your business</p>
          <form action="/login" method="get">
            <label for="business_name"> Please choose your business: </label>
            <select name="business_name" id="business_id">
              ${options}
              </select>
            <label for="shop_name">Enter your shop name with (.myshopify.com) :</label>
            <input type="text" id="shop_name" name="shop_name" required>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>`
    );
    // not logged in, redirect to login
    // res.redirect(`/login`);
  } else {
    res.send(
      `<html>
        <body>
          <p>Welcome!</p>
        </body>
      </html>`
    );
    res.end();
  }
});

app.get('/insertshop', async (req, res) => {
  businessName = req.query.business_name;
  business = await insertBusiness(businessName, prisma);
  console.log(business);
  console.log('this is active shopify scopes : ' + currentActiveShopify[shop]);
  //  This shop hasn't been seen yet, go through OAuth to create a session
  if (currentActiveShopify[shop] === undefined) {
    res.send(
      `<html>
        <body>
          <p>Welcome! kindly insert your shop name</p>
          <form action="/login" method="get">
            <label for="shop_name">Enter your shop name with (.myshopify.com) :</label>
            <input type="text" id="shop_name" name="shop_name" required>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>`
    );
    // not logged in, redirect to login
    // res.redirect(`/login`);
  } else {
    res.send(
      `<html>
        <body>
          <p>Welcome!</p>
        </body>
      </html>`
    );
    res.end();
  }
});

app.get('/login', async (req, res) => {
  shop = req.query.shop_name;

  let authRoute = await Shopify.Auth.beginAuth(req, res, shop, '/auth/callback', false);
  console.log(authRoute);
  return res.redirect(authRoute);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const session = await Shopify.Auth.validateAuthCallback(req, res, req.query as unknown as AuthQuery); // req.query must be cast to unkown and then AuthQuery in order to be accepted

    console.log(session);
    currentActiveShopify[shop] = session.scope;
    accessToken = session.accessToken;
    console.log('this is the shop name : ' + shop);
    console.log('this is the access token : ' + accessToken);
    // console.log(session.accessToken);
    console.log(session.scope);
  } catch (error) {
    console.error(error); // in practice these should be handled more gracefully
  }

  return res.redirect(`/shopify/success?host=${req.query.host}&shop=${req.query.shop}`);
});

app.get('/shopify/success', async (req, res) => {
  const client = new Shopify.Clients.Graphql(shop, accessToken);

  try {
    const shopId: any = await client.query<MyResponseBodyType>({
      data: {
        query: getShopify(),
      },
    });

    console.log(shopId.body.data.shop);
    storedShopId = shopId.body.data.shop.id;
    await insertShopify(shopId.body.data.shop, accessToken, business, prisma);

    // res.send(
    //   `<html>
    //     <body>
    //       <p>You have successfully authenticated.</p>
    //       <p>Please enter the date of orders needed to be retrived.</p>
    //       <form action="/shopify/getorders" method="post">
    //         <label for="from_created_date">Start Date:</label>
    //         <input type="date" id="from_created_date" name="from_created_date">
    //         <label for="to_created_date">End Date:</label>
    //         <input type="date" id="to_created_date" name="to_created_date">
    //         <button type="submit">Submit</button>
    //       </form>
    //       <p>If enter without date, it will retrieve orders for past 40 days by default.</p>
    //     </body>
    //   </html>`
    // );
  } catch (err) {
    console.log('An error has occured: ' + err);
  }

  let cursor = null;

  let thisDate = await defaultDate();

  req.body.from_created_date = thisDate.fromYear + '-' + thisDate.fromMonth + '-' + ('0' + thisDate.fromDay).slice(-2);
  req.body.to_created_date = thisDate.toYear + '-' + thisDate.toMonth + '-' + ('0' + thisDate.toDay).slice(-2);

  console.log(req.body.from_created_date);
  console.log(req.body.to_created_date);

  try {
    while (true) {
      const orders: any = await client.query<MyResponseBodyType>({
        data: {
          query: getOrdersWithDate(req.body),
          variables: {
            cursor: cursor,
          },
        },
      });

      let nextPage = orders.body.data.orders.pageInfo.hasNextPage;
      cursor = orders.body.data.orders.pageInfo.endCursor;

      await insertData(orders);

      if (nextPage === false) {
        console.log('All data have been retrieved, no more next page');
        break;
      }
    }

    res.send(
      `<html>
        <body>
          <p>Your orders data have been successfully retrieved from your shop.</p>
          <p>Please select date to display data</p>
          <form action="/shopify/getdailytotal" method="post">
            <select id="days" name="days">
              <option value="7">past 7 days</option>
              <option value="15">past 15 days</option>
              <option value="30">past 30 days</option>
              <option value="60">past 60 days</option>
            </select>
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>`
    );
  } catch (err) {
    console.log('An error has occured when retrieving data from shop: ' + err);
  }
});

cron.schedule('*/5 * * * *', async () => {
  if (shop !== undefined && accessToken !== undefined) {
    const client = new Shopify.Clients.Graphql(shop, accessToken);

    try {
      const shopId: any = await client.query<MyResponseBodyType>({
        data: {
          query: getShopify(),
        },
      });
      storedShopId = shopId.body.data.shop.id;

      if (storedShopId !== undefined) {
        let cursor = null;

        let thisDate = await defaultDate();

        let scheduleTime = {
          from_created_date: thisDate.fromYear + '-' + thisDate.fromMonth + '-' + ('0' + thisDate.fromDay).slice(-2),
          to_created_date: thisDate.toYear + '-' + thisDate.toMonth + '-' + ('0' + thisDate.toDay).slice(-2),
        };

        console.log(scheduleTime.from_created_date);
        console.log(scheduleTime.to_created_date);

        try {
          while (true) {
            const orders: any = await client.query<MyResponseBodyType>({
              data: {
                query: getOrdersWithDate(scheduleTime),
                variables: {
                  cursor: cursor,
                },
              },
            });

            let nextPage = orders.body.data.orders.pageInfo.hasNextPage;
            cursor = orders.body.data.orders.pageInfo.endCursor;

            await insertData(orders);

            if (nextPage === false) {
              console.log('All data have been retrieved, no more next page');
              break;
            }
          }
        } catch (err) {
          console.log('An error has occured when retrieving data from shop: ' + err);
        }
      }
    } catch (err) {
      console.log('An error has occured: ' + err);
    }
  } else {
    console.log(shop);
    console.log(accessToken);
    console.log('shop or access token invalid while running schedule update');
  }
  console.log('---------------------');
  console.log('running a task every 5 minutes');
});

app.post('/shopify/getdailytotal', async (req, res) => {
  console.log(req.body.days);
  console.log(typeof req.body.days);
  // if (req.body.from_created_date !== '' || req.body.to_created_date !== '') {
  //   const getTotalSalesTransactionResults = await getTotalSalesTransaction(req.body, storedShopId);
  //   const getTotalRefundsTransactionResults = await getTotalRefundsTransaction(req.body, storedShopId);
  //   if (getTotalSalesTransactionResults && getTotalRefundsTransactionResults) {
  //     const getDailyTotalSalesResults = await getDailyTotalSales(req.body, storedShopId);
  //     const getDailyTotalRefundsResults = await getDailyTotalRefunds(req.body, storedShopId);
  //     console.log(getDailyTotalSalesResults);
  //     console.log(getDailyTotalRefundsResults);
  //   }
  // } else {
  let thisDate = await chosenDate(req.body.days);
  req.body.from_created_date = thisDate.fromYear + '-' + thisDate.fromMonth + '-' + ('0' + thisDate.fromDay).slice(-2);
  req.body.to_created_date = thisDate.toYear + '-' + thisDate.toMonth + '-' + ('0' + thisDate.toDay).slice(-2);
  console.log('to date: ' + req.body.to_created_date);
  console.log('from date: ' + req.body.from_created_date);
  const getTotalSalesTransactionResults = await getTotalSalesTransaction(req.body, storedShopId, prisma);
  const getTotalRefundsTransactionResults = await getTotalRefundsTransaction(req.body, storedShopId, prisma);
  if (getTotalSalesTransactionResults && getTotalRefundsTransactionResults) {
    const getDailyTotalSalesResults = await getDailyTotalSales(req.body, storedShopId, prisma);
    const getDailyTotalRefundsResults = await getDailyTotalRefunds(req.body, storedShopId, prisma);
    console.log(getDailyTotalSalesResults);
    console.log(getDailyTotalRefundsResults);
  }
  // }
});

app.listen(3000, () => {
  console.log('your app is now listening on port 3000');
});

const insertData = async (orders: any): Promise<void> => {
  for (let i = 0; i < orders.body.data.orders.edges.length; i++) {
    const order = orders.body.data.orders.edges[i].node;
    await insertOrder(order, storedShopId, prisma);
    for (let j = 0; j < order.transactions.length; j++) {
      await insertTransaction(order, order.transactions[j], prisma);
    }
  }
};

const defaultDate = async () => {
  const now = new Date(Date.now());
  now.setDate(now.getDate() + 1);
  const last = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); //past 60 days
  const fromDay = last.getDate();
  const fromMonth = last.getMonth() + 1;
  const fromYear = last.getFullYear();
  const toDay = now.getDate();
  const toMonth = now.getMonth() + 1;
  const toYear = now.getFullYear();
  return { now, last, fromDay, fromMonth, fromYear, toDay, toMonth, toYear };
};

const chosenDate = async (days: any) => {
  const now = new Date(Date.now());
  now.setDate(now.getDate() + 1);
  const last = new Date(Date.now() - days * 24 * 60 * 60 * 1000); //past 60 days
  const fromDay = last.getDate();
  const fromMonth = last.getMonth() + 1;
  const fromYear = last.getFullYear();
  const toDay = now.getDate();
  const toMonth = now.getMonth() + 1;
  const toYear = now.getFullYear();
  return { now, last, fromDay, fromMonth, fromYear, toDay, toMonth, toYear };
};
