/*
  Warnings:

  - A unique constraint covering the columns `[order_id,product_id]` on the table `products_on_orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "products_on_orders_order_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "products_on_orders_order_id_product_id_key" ON "products_on_orders"("order_id", "product_id");
