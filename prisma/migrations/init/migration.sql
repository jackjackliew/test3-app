-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT '',
    "username" TEXT NOT NULL DEFAULT '',
    "password" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "Facebook" (
    "facebook_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fb_name" TEXT,
    "fb_access_token" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reach" DECIMAL,
    "impressions" DECIMAL,
    "frequency" DECIMAL,
    "spend" DECIMAL,
    "cpm" DECIMAL,
    "outbound_clicks" DECIMAL,
    "cost_per_outbound_click" DECIMAL,
    "outbound_clicks_ctr" DECIMAL,
    "view_content" DECIMAL,
    "cost_per_view_content" DECIMAL,
    "add_to_cart" DECIMAL,
    "cost_per_add_to_cart" DECIMAL,
    "initiate_checkout" DECIMAL,
    "cost_per_initiate_checkout" DECIMAL,
    "purchase" DECIMAL,
    "website_purchase" DECIMAL,
    "offline_purchase" DECIMAL,
    "cost_per_purchase" DECIMAL,
    "cost_per_unique_purchases" DECIMAL,
    "purchase_conversion_value" DECIMAL,
    "website_purchase_conversion_value" DECIMAL,
    "offline_purchase_conversion_value" DECIMAL,
    "purchase_roas" DECIMAL,
    "business_id" UUID NOT NULL,

    CONSTRAINT "Facebook_pkey" PRIMARY KEY ("facebook_id")
);

-- CreateTable
CREATE TABLE "Business" (
    "business_id" UUID NOT NULL,
    "business_name" TEXT,
    "admin_id" UUID,
    "fb_id" TEXT,
    "shopify_id" TEXT,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("business_id")
);

-- CreateTable
CREATE TABLE "Shopify" (
    "shopify_id" VARCHAR NOT NULL,
    "shopify_name" VARCHAR,
    "shopify_url" VARCHAR NOT NULL,
    "access_token" VARCHAR NOT NULL,
    "business_id" UUID NOT NULL,

    CONSTRAINT "Shopify_pkey" PRIMARY KEY ("shopify_id")
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
    "shopify_id" VARCHAR NOT NULL,

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
CREATE TABLE "Daily_insight" (
    "created_at" TIMESTAMP(6) NOT NULL,
    "total_sales_amount" INTEGER,
    "total_refunds_amount" INTEGER,
    "shopify_id" VARCHAR NOT NULL,

    CONSTRAINT "Daily_insight_pkey" PRIMARY KEY ("created_at","shopify_id")
);

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateTable
CREATE TABLE "_BusinessToUser" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
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
CREATE UNIQUE INDEX "Order_reference_order_id_key" ON "Order"("reference_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_transaction_id_key" ON "Transaction"("reference_transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_BusinessToUser_AB_unique" ON "_BusinessToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_BusinessToUser_B_index" ON "_BusinessToUser"("B");

-- AddForeignKey
ALTER TABLE "Facebook" ADD CONSTRAINT "Facebook_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopify" ADD CONSTRAINT "Shopify_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_reference_order_id_fkey" FOREIGN KEY ("reference_order_id") REFERENCES "Order"("reference_order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Daily_insight" ADD CONSTRAINT "Daily_insight_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessToUser" ADD CONSTRAINT "_BusinessToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BusinessToUser" ADD CONSTRAINT "_BusinessToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

