/*
  Warnings:

  - A unique constraint covering the columns `[shop_id]` on the table `daily_insights` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "daily_insights_shop_id_key" ON "daily_insights"("shop_id");
