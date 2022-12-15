import e, { Express, Request, Response } from 'express';
import { Pool } from 'pg';
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'shopifytestdata',
    password: 'password',
    port: 5432
});

export const insertOrder = (order: any, shopId: any) => {
    pool.query('INSERT INTO orders (createdat, displayfinancialstatus, displayfulfillmentstatus, discountcodes, totaldiscountsset_presentmentmoney_amount, totaldiscountsset_presentmentmoney_currencycode, totaldiscountsset_shopmoney_amount, totaldiscountsset_shopmoney_currencycode, reference_order_id, shop_id) VALUES ($1, $2, $3, $4, $5, $6,$7, $8, $9, $10) ON CONFLICT DO NOTHING', [order.createdAt, order.displayFinancialStatus, order.displayFulfillmentStatus, order.discountCodes, parseInt(order.totalDiscountsSet.presentmentMoney.amount), order.totalDiscountsSet.presentmentMoney.currencyCode, parseInt(order.totalDiscountsSet.shopMoney.amount), order.totalDiscountsSet.shopMoney.currencyCode, order.id, shopId], (error, results) => {
        if(error) {
            throw error
        }
        // console.log(results);
        console.log('Order have successfully inserted');
    });
}

export const deleteOrder = () => {
    pool.query('DELETE FROM orders', (error, results) => {
        if(error) {
            throw error
        }
        // console.log(results);
        console.log('Orders data have been successfully deleted');
    });
}

export const insertTransaction = (order: any, transaction: any, shopId: any) => {
    pool.query('INSERT INTO transactions (reference_order_id, reference_transaction_id, transaction_created_at, transaction_kind, transaction_status, transaction_presentment_amount, transaction_presentment_currency, transaction_shop_amount, transaction_shop_currency, shop_id) VALUES ($1, $2, $3, $4, $5, $6,$7, $8, $9, $10) ON CONFLICT DO NOTHING', [order.id, transaction.id, transaction.createdAt, transaction.kind, transaction.status, parseInt(transaction.amountSet.presentmentMoney.amount), transaction.amountSet.presentmentMoney.currencyCode, parseInt(transaction.amountSet.shopMoney.amount), transaction.amountSet.shopMoney.currencyCode, shopId], (error, results) => {
        if(error) {
            throw error
        }
        console.log('Transaction have sucessfully inserted');
    });
}

export const deleteTransaction = () => {
    pool.query('DELETE FROM transactions', (error, results) => {
        if(error) {
            throw error
        }
        // console.log(results);
        console.log('Transactions data have been successfully deleted');
    });     
}

export const getTotalSalesTransaction = (transaction: any, shopId: any) => {
    let date: any = {};
    console.log(transaction.from_created_date);
    console.log(transaction.to_created_date);
    let salesDate;
    pool.query("SELECT transaction_created_at, transaction_presentment_amount FROM transactions WHERE (transaction_created_at >= $1 AND transaction_created_at <= $2) AND (shop_id = $3) AND (transaction_kind = 'SALE') AND (transaction_status = 'SUCCESS') ORDER BY transaction_created_at", [transaction.from_created_date, transaction.to_created_date, shopId], (error, results) => {
        if(error) {
            throw error
        }
        console.log(results.rows);
        for(let i = 0; i < results.rows.length; i++) {
            salesDate = new Date(results.rows[i].transaction_created_at);
            const day = salesDate.getDate();
            const month = salesDate.getMonth() + 1;
            const year = salesDate.getFullYear();
            let convertedSalesDate = year + "-" + month + "-" + day;
            if(Object.keys(date).length === 0) {
                console.log("if the date object length is 0: " + results.rows[i].transaction_presentment_amount);
                date[convertedSalesDate] = results.rows[i].transaction_presentment_amount;
            } else if(Object.keys(date).length !== 0) {
                console.log("object key: " + date.hasOwnProperty(convertedSalesDate));
                if(date.hasOwnProperty(convertedSalesDate)) {
                    date[convertedSalesDate] += results.rows[i].transaction_presentment_amount;
                } else {
                    date[convertedSalesDate] = results.rows[i].transaction_presentment_amount;
                }
            }
        }
        console.log(date);
        for(const key in date) {
            insertDailyTotalSales(key, date[key], shopId);
        }
    });
}

// export const insertDailyTotalSales = (date: any, totalSales: any, shopId: any) => {
//     pool.query("INSERT INTO daily_insights (created_at, total_sales_amount, shop_id) VALUES ($1, $2, $3)", [date, totalSales, shopId], (error, results) => {
//         if(error) {
//             throw error
//         }
//         console.log('All total have been inserted');
//     });
// }

export const insertDailyTotalSales = (date: any, totalSales: any, shopId: any) => {
    pool.query("INSERT INTO daily_insights (created_at, total_sales_amount, shop_id) VALUES ($1, $2, $3) ON CONFLICT (created_at) DO UPDATE SET total_sales_amount = EXCLUDED.total_sales_amount", [date, totalSales, shopId], (error, results) => {
        if(error) {
            throw error
        }
        console.log('All total have been inserted');
    });
}

export const getDailyTotalSales = (req: Request, res: Response) => {
    pool.query("SELECT * FROM daily_insights ORDER BY created_at", (error, results) => {
        if(error) {
            throw error
        }
        console.log("get daily total sales results: " + results.rows);
        const listTotalSales = () => {
        let list = '';
        results.rows.forEach((result: any) => {
            list += `
                <tr>
                    <td>${new Date(result.created_at).toLocaleDateString("en-GB")}</td>
                    <td>${result.total_sales_amount}</td>
                </tr>`
            });
        return list;
        }
        res.send(
        `<html>
            <body>
                <table style="width:100%">
                    <tr>
                    <td>Date</td>
                    <td>Total Sales</td>
                    </tr>
                    ${listTotalSales()}
                </table>
            </body>
        </html>`
        );
    });
}

export const deleteDailyTotal = () => {
    pool.query('DELETE FROM daily_insights', (error, results) => {
        if(error) {
            throw error
        }
        console.log('Daily total have been successfully deleted');
    });
}

export const getTotalSales30Days = (req: Request, res: Response) => {
    pool.query("SELECT * FROM transactions WHERE (transaction_created_at > now() - interval '30 day') AND (transaction_kind = 'SALE') AND (transaction_status = 'SUCCESS') ORDER BY transaction_created_at", (error, results) => {
        if(error) {
            throw error
        }
        const totalAmount = () => {
            let amount = 0;
            results.rows.forEach((result) => {
                amount += result.transaction_presentment_amount;
            });
            return amount;
        }
        const listResult = () => {
            let list = '';
            results.rows.forEach((result) => {
                // console.log(result);
                console.log(new Date(result.transaction_created_at).toLocaleDateString("en-GB"));
                // console.log(result.transaction_created_at);  
                list += `
                <tr>
                    <td>${result.reference_order_id}</td>
                    <td>${result.reference_transaction_id}</td>
                    <td>${new Date(result.transaction_created_at).toLocaleDateString("en-GB")}</td>
                    <td>${new Date(result.transaction_created_at).toLocaleTimeString("en-GB")}</td>
                    <td>${result.transaction_kind}</td>
                    <td>${result.transaction_status}</td>
                    <td>${result.transaction_presentment_amount}</td>
                </tr>`
            });
            return list;
        }
        // console.log(listResult());
        // console.log(results.rows);
        res.send(
            `<html>
                <body>
                    <table style="width:100%">
                        <tr>
                        <td>reference_order_id</td>
                        <td>reference_transaction_id</td>
                        <td>transaction_created_date</td>
                        <td>transaction_created_time</td>
                        <td>transaction_kind</td>
                        <td>transaction_status</td>
                        <td>transaction_amount</td>
                        </tr>
                        ${listResult()}
                        <tr>
                        <td>TOTAL AMOUNT</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${totalAmount()}</td>
                        </tr>
                    </table>
                </body>
            </html>`
        );
        // res.send(results.rows);
    });
}

export const getTotalRefund30Days = (req: Request, res: Response) => {
    pool.query("SELECT * FROM transactions WHERE (transaction_created_at > now() - interval '30 day') AND (transaction_kind = 'REFUND') AND (transaction_status = 'SUCCESS') ORDER BY transaction_created_at", (error, results) => {
        if(error) {
            throw error
        }
        const totalAmount = () => {
            let amount = 0;
            results.rows.forEach((result) => {
                amount += result.transaction_presentment_amount;
            });
            return amount;
        }
        const listResult = () => {
            let list = '';
            results.rows.forEach((result) => {
                // console.log(result);
                console.log(new Date(result.transaction_created_at).toLocaleDateString("en-GB"));
                // console.log(result.transaction_created_at);
                list += `
                <tr>
                    <td>${result.reference_order_id}</td>
                    <td>${result.reference_transaction_id}</td>
                    <td>${new Date(result.transaction_created_at).toLocaleDateString("en-GB")}</td>
                    <td>${new Date(result.transaction_created_at).toLocaleTimeString("en-GB")}</td>
                    <td>${result.transaction_kind}</td>
                    <td>${result.transaction_status}</td>
                    <td>${result.transaction_presentment_amount}</td>
                </tr>`
            });
            return list;
        }
        // console.log(listResult());
        // console.log(results.rows);
        res.send(
            `<html>
                <body>
                    <table style="width:100%">
                        <tr>
                        <td>reference_order_id</td>
                        <td>reference_transaction_id</td>
                        <td>transaction_created_date</td>
                        <td>transaction_created_time</td>
                        <td>transaction_kind</td>
                        <td>transaction_status</td>
                        <td>transaction_amount</td>
                        </tr>
                        ${listResult()}
                        <tr>
                        <td>TOTAL AMOUNT</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${totalAmount()}</td>
                        </tr>
                    </table>
                </body>
            </html>`
        );
        // res.send(results.rows);
    });
}

export const getTotalPending30Days = (req: Request, res: Response) => {
    pool.query("SELECT * FROM transactions INNER JOIN orders ON transactions.reference_order_id = orders.reference_order_id WHERE (transaction_created_at > now() - interval '30 day') AND (displayfinancialstatus = 'PENDING') ORDER BY transaction_created_at", (error, results) => {
        if(error) {
            throw error
        }
        const totalAmount = () => {
            let amount = 0;
            results.rows.forEach((result) => {
                amount += result.transaction_presentment_amount;
            });
            return amount;
        }
        const listResult = () => {
            let list = '';
            results.rows.forEach((result) => {
                // console.log(result);
                console.log(new Date(result.transaction_created_at).toLocaleDateString("en-GB"));
                // console.log(result.transaction_created_at);
                list += `
                <tr>
                    <td>${result.reference_order_id}</td>
                    <td>${result.reference_transaction_id}</td>
                    <td>${new Date(result.transaction_created_at).toLocaleDateString("en-GB")}</td>
                    <td>${new Date(result.transaction_created_at).toLocaleTimeString("en-GB")}</td>
                    <td>${result.transaction_kind}</td>
                    <td>${result.transaction_status}</td>
                    <td>${result.transaction_presentment_amount}</td>
                </tr>`
            });
            return list;
        }
        // console.log(listResult());
        // console.log(results.rows);
        res.send(
            `<html>
                <body>
                    <table style="width:100%">
                        <tr>
                        <td>reference_order_id</td>
                        <td>reference_transaction_id</td>
                        <td>transaction_created_date</td>
                        <td>transaction_created_time</td>
                        <td>transaction_kind</td>
                        <td>transaction_status</td>
                        <td>transaction_amount</td>
                        </tr>
                        ${listResult()}
                        <tr>
                        <td>TOTAL AMOUNT</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                        <td>${totalAmount()}</td>
                        </tr>
                    </table>
                </body>
            </html>`
        );
        // res.send(results.rows);
    });
}


// const createTable = (req: Request, res: Response) => {
//     pool.query('CREATE TABLE orders (ID SERIAL PRIMARY KEY, createdAt TIMESTAMP, displayFinancialStatus VARCHAR, displayFulfillmentStatus VARCHAR, discountCodes VARCHAR[], totalDiscountsSet_presentmentMoney_amount INT, totalDiscountsSet_presentmentMoney_currencyCode VARCHAR, totalDiscountsSet_shopMoney_amount INT, totalDiscountsSet_shopMoney_currencyCode VARCHAR, reference_order_id VARCHAR)', (error, results) => {
//         if(error) {
//             throw error
//         }
//         res.status(201).send(`Database successfully created`);
//     });
// }

// const createTable = (req: Request, res: Response) => {
//     pool.query('CREATE TABLE transactions (ID SERIAL PRIMARY KEY, reference_order_id VARCHAR, reference_transaction_id VARCHAR, transaction_created_at TIMESTAMP, transaction_kind VARCHAR, transaction_status VARCHAR, transaction_presentment_amount INT, transaction_presentment_currency VARCHAR, transaction_shop_amount INT, transaction_shop_currency VARCHAR)', (error, results) => {
//         if(error) {
//             throw error
//         }
//         res.status(201).send(`Database successfully created`);
//     });
// }

// CREATE TABLE daily_insights (id SERIAL PRIMARY KEY, created_at TIMESTAMP NOT NULL, reference_order_id VARCHAR NOT NULL, total_sales_amount INT, total_refunds_amount INT);