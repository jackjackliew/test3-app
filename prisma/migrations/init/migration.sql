-- CreateTable
CREATE TABLE "Daily_insight" (
    "created_at" TIMESTAMP(6) NOT NULL,
    "total_sales_amount" INTEGER,
    "total_refunds_amount" INTEGER,
    "shop_id" VARCHAR NOT NULL,

    CONSTRAINT "Daily_insight_pkey" PRIMARY KEY ("created_at","shop_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "createdat" TIMESTAMP(6),
    "displayfinancialstatus" VARCHAR,
    "displayfulfillmentstatus" VARCHAR,
    "discountcodes" VARCHAR[],
    "totaldiscountsset_presentmentmoney_amount" INTEGER,
    "totaldiscountsset_presentmentmoney_currencycode" VARCHAR,
    "totaldiscountsset_shopmoney_amount" INTEGER,
    "totaldiscountsset_shopmoney_currencycode" VARCHAR,
    "reference_order_id" VARCHAR NOT NULL,
    "shop_id" VARCHAR NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("reference_order_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "reference_transaction_id" VARCHAR NOT NULL,
    "transaction_created_at" TIMESTAMP(6),
    "transaction_kind" VARCHAR,
    "transaction_status" VARCHAR,
    "transaction_presentment_amount" INTEGER,
    "transaction_presentment_currency" VARCHAR,
    "transaction_shop_amount" INTEGER,
    "transaction_shop_currency" VARCHAR,
    "reference_order_id" VARCHAR NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("reference_transaction_id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "shop_id" VARCHAR NOT NULL,
    "shop_name" VARCHAR,
    "shop_url" VARCHAR NOT NULL,
    "access_token" VARCHAR NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_reference_order_id_key" ON "Order"("reference_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_transaction_id_key" ON "Transaction"("reference_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shop_id_key" ON "Shop"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_shop_url_key" ON "Shop"("shop_url");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_access_token_key" ON "Shop"("access_token");

-- AddForeignKey
ALTER TABLE "Daily_insight" ADD CONSTRAINT "Daily_insight_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "Shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reference_order_id_fkey" FOREIGN KEY ("reference_order_id") REFERENCES "Order"("reference_order_id") ON DELETE CASCADE ON UPDATE CASCADE;

