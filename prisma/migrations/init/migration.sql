-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT '',
    "username" TEXT NOT NULL DEFAULT '',
    "password" VARCHAR,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Role" (
    "role_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "RoleOnUser" (
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "RoleOnUser_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "Business" (
    "business_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_name" VARCHAR,
    "admin_id" UUID,
    "fb_id" VARCHAR,
    "shopify_id" VARCHAR,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("business_id")
);

-- CreateTable
CREATE TABLE "UserOnBusiness" (
    "user_id" UUID NOT NULL,
    "business_id" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "UserOnBusiness_pkey" PRIMARY KEY ("business_id","user_id")
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
CREATE TABLE "Shopify" (
    "shopify_id" VARCHAR NOT NULL,
    "shopify_name" VARCHAR,
    "shopify_url" VARCHAR NOT NULL,
    "access_token" VARCHAR NOT NULL,
    "currency_code" TEXT,
    "business_id" UUID NOT NULL,

    CONSTRAINT "Shopify_pkey" PRIMARY KEY ("shopify_id")
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
    "shopify_id" VARCHAR NOT NULL,

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

-- CreateTable
CREATE TABLE "Daily_insight" (
    "created_at" TIMESTAMP(6) NOT NULL,
    "total_sales_amount" INTEGER,
    "total_refunds_amount" INTEGER,
    "shopify_id" VARCHAR NOT NULL,

    CONSTRAINT "Daily_insight_pkey" PRIMARY KEY ("created_at","shopify_id")
);

-- CreateTable
CREATE TABLE "Shopify_app" (
    "shopify_app_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "shopify_app_name" VARCHAR,
    "shopify_app_api_key" VARCHAR,
    "shopify_app_api_secret_key" VARCHAR,
    "shopify_id" VARCHAR NOT NULL,

    CONSTRAINT "Shopify_app_pkey" PRIMARY KEY ("shopify_app_id")
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

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_app_shopify_app_id_key" ON "Shopify_app"("shopify_app_id");

-- AddForeignKey
ALTER TABLE "RoleOnUser" ADD CONSTRAINT "RoleOnUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleOnUser" ADD CONSTRAINT "RoleOnUser_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBusiness" ADD CONSTRAINT "UserOnBusiness_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBusiness" ADD CONSTRAINT "UserOnBusiness_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facebook" ADD CONSTRAINT "Facebook_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopify" ADD CONSTRAINT "Shopify_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Daily_insight" ADD CONSTRAINT "Daily_insight_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopify_app" ADD CONSTRAINT "Shopify_app_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

