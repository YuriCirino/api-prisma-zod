-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductsOnOrder" (
    "product_id" TEXT NOT NULL,
    "amount_product_to_order" INTEGER NOT NULL DEFAULT 1,
    "order_id" TEXT NOT NULL,

    PRIMARY KEY ("product_id", "order_id"),
    CONSTRAINT "ProductsOnOrder_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductsOnOrder_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductsOnOrder" ("order_id", "product_id") SELECT "order_id", "product_id" FROM "ProductsOnOrder";
DROP TABLE "ProductsOnOrder";
ALTER TABLE "new_ProductsOnOrder" RENAME TO "ProductsOnOrder";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
