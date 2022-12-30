-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_display_name" TEXT NOT NULL DEFAULT '',
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

    CONSTRAINT "UserOnBusiness_pkey" PRIMARY KEY ("user_id","business_id")
);

-- CreateTable
CREATE TABLE "BusinessDailyData" (
    "business_id" UUID NOT NULL,
    "date" TIMESTAMP(6) NOT NULL,
    "business_total_sales" INTEGER,
    "business_total_orders" INTEGER,
    "business_average_sales_order" INTEGER,
    "business_total_reach" INTEGER,
    "business_ads_spent" INTEGER,
    "business_average_cost_per_reach" INTEGER,

    CONSTRAINT "BusinessDailyData_pkey" PRIMARY KEY ("business_id","date")
);

-- CreateTable
CREATE TABLE "Shopify" (
    "shopify_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_id" UUID NOT NULL,
    "shopify_url" VARCHAR NOT NULL,
    "shopify_api_key" VARCHAR,
    "shopify_api_secret_key" VARCHAR,
    "shopify_merchant_link" VARCHAR,
    "shopify_access_token" VARCHAR,
    "shopify_name" VARCHAR,
<<<<<<< HEAD
    "shopify_url" VARCHAR NOT NULL,
    "access_token" VARCHAR,
=======
>>>>>>> c02e6cf (amended schema based on new relational diagram.)
    "currency_code" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Shopify_pkey" PRIMARY KEY ("shopify_id")
);

-- CreateTable
CREATE TABLE "ShopifyDailyData" (
    "date" TIMESTAMP(6) NOT NULL,
    "shopify_id" UUID NOT NULL,
    "shopify_total_order" INTEGER,
    "shopify_total_sales" INTEGER,
    "shopify_total_refund" INTEGER,
    "shopify_average_order_sales" INTEGER,
    "business_id" UUID NOT NULL,

    CONSTRAINT "ShopifyDailyData_pkey" PRIMARY KEY ("date","shopify_id")
);

-- CreateTable
CREATE TABLE "ShopifyTransaction" (
    "shopify_transaction_id" VARCHAR NOT NULL,
    "shopify_transaction_created_at" TIMESTAMP(6),
    "shopify_transaction_kind" VARCHAR,
    "shopify_transaction_status" VARCHAR,
    "shopify_transaction_shop_amount" INTEGER,
    "shopify_order_id" VARCHAR NOT NULL,
    "shopify_id" UUID NOT NULL,

    CONSTRAINT "ShopifyTransaction_pkey" PRIMARY KEY ("shopify_transaction_id")
);

-- CreateTable
CREATE TABLE "Facebook" (
    "facebook_id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "facebook_name" TEXT NOT NULL,
    "facebook_token" TEXT NOT NULL,
    "facebook_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "deleted_at" TIMESTAMP(6) NOT NULL,
    "business_id" UUID NOT NULL,

    CONSTRAINT "Facebook_pkey" PRIMARY KEY ("facebook_id")
);

-- CreateTable
CREATE TABLE "FacebookDailyData" (
    "date" DATE NOT NULL,
    "facebook_id" UUID NOT NULL,
    "facebook_reach" DECIMAL,
    "facebook_impression" DECIMAL,
    "facebook_frequency" DECIMAL,
    "facebook_amount_spent" DECIMAL,
    "facebook_cpm" DECIMAL,
    "facebook_outbound_clicks_ctr" DECIMAL,
    "facebook_view_content" DECIMAL,
    "facebook_cost_per_view_content" DECIMAL,
    "facebook_add_to_cart" DECIMAL,
    "facebook_cost_per_add_to_cart" DECIMAL,
    "facebook_initiate_checkout" DECIMAL,
    "facebook_cost_per_initiate_checkout" DECIMAL,
    "facebook_purchase" DECIMAL,
    "facebook_website_purchase" DECIMAL,
    "facebook_offline_purcase" DECIMAL,
    "facebook_cost_per_purchase" DECIMAL,
    "facebook_purchase_conversion_value" DECIMAL,
    "facebook_website_purchase_conversion_value" DECIMAL,
    "facebook_offline_purchase_conversion_value" DECIMAL,
    "facebook_purchase_roas" DECIMAL,
    "business_id" UUID NOT NULL,

    CONSTRAINT "FacebookDailyData_pkey" PRIMARY KEY ("date","facebook_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Business_business_id_key" ON "Business"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "Business_business_name_key" ON "Business"("business_name");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_shopify_id_key" ON "Shopify"("shopify_id");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_shopify_url_key" ON "Shopify"("shopify_url");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_shopify_access_token_key" ON "Shopify"("shopify_access_token");

-- CreateIndex
CREATE UNIQUE INDEX "Shopify_business_id_shopify_url_key" ON "Shopify"("business_id", "shopify_url");

-- CreateIndex
CREATE UNIQUE INDEX "ShopifyTransaction_shopify_transaction_id_key" ON "ShopifyTransaction"("shopify_transaction_id");

-- AddForeignKey
ALTER TABLE "UserOnBusiness" ADD CONSTRAINT "UserOnBusiness_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnBusiness" ADD CONSTRAINT "UserOnBusiness_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessDailyData" ADD CONSTRAINT "BusinessDailyData_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shopify" ADD CONSTRAINT "Shopify_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyDailyData" ADD CONSTRAINT "ShopifyDailyData_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyDailyData" ADD CONSTRAINT "ShopifyDailyData_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopifyTransaction" ADD CONSTRAINT "ShopifyTransaction_shopify_id_fkey" FOREIGN KEY ("shopify_id") REFERENCES "Shopify"("shopify_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Facebook" ADD CONSTRAINT "Facebook_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FacebookDailyData" ADD CONSTRAINT "FacebookDailyData_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("business_id") ON DELETE CASCADE ON UPDATE CASCADE;

