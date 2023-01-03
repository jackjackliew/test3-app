-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT '',
    "username" TEXT NOT NULL DEFAULT '',
    "password" VARCHAR,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Business" (
    "business_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_name" VARCHAR,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("business_id")
);

-- CreateTable
CREATE TABLE "UserOnBusiness" (
    "user_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "role" VARCHAR NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "UserOnBusiness_pkey" PRIMARY KEY ("user_id","business_id")
);

-- CreateTable
CREATE TABLE "Shopify" (
    "shopify_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopify_api_key" VARCHAR,
    "shopify_api_secret_key" VARCHAR,
    "shopify_merchant_link" VARCHAR,
    "shopify_name" VARCHAR,
    "shopify_url" VARCHAR NOT NULL,
    "access_token" VARCHAR,
    "currency_code" TEXT,
    "business_id" UUID NOT NULL,

    CONSTRAINT "Shopify_pkey" PRIMARY KEY ("shopify_id")
);

-- CreateTable
CREATE TABLE "Daily_insight" (
    "created_at" TIMESTAMP(6) NOT NULL,
    "total_sales_amount" INTEGER,
    "total_refunds_amount" INTEGER,
    "shopify_id" UUID NOT NULL,

    CONSTRAINT "Daily_insight_pkey" PRIMARY KEY ("created_at","shopify_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" VARCHAR NOT NULL,
    "order_created_at" TIMESTAMP(6),
    "order_payment_status" VARCHAR,
    "order_fulfilment_status" VARCHAR,
    "total_discount_amount" INTEGER,
    "order_total_price" INTEGER,
    "order_total_received" INTEGER,
    "order_total_refunded" INTEGER,
    "order_net_payment" INTEGER,
    "shopify_id" UUID NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "transaction_id" VARCHAR NOT NULL,
    "transaction_created_at" TIMESTAMP(6),
    "transaction_kind" VARCHAR,
    "transaction_status" VARCHAR,
    "transaction_shop_amount" INTEGER,
    "order_id" VARCHAR NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Business_business_id_key" ON "Business"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_shopify_id_key" ON "Shopify"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_shopify_url_key" ON "Shopify"("shopify_url");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_access_token_key" ON "Shopify"("access_token");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_id_key" ON "Order"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transaction_id_key" ON "Transaction"("transaction_id");

-- AddForeignKey
ALTER TABLE "UserOnBusiness" ADD CONSTRAINT "UserOnBusiness_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBusiness" ADD CONSTRAINT "UserOnBusiness_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopify" ADD CONSTRAINT "Shopify_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Daily_insight" ADD CONSTRAINT "Daily_insight_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

