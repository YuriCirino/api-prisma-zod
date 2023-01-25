-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products_on_orders" (
    "order_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("order_id", "product_id"),
    CONSTRAINT "products_on_orders_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "products_on_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_products_on_orders" ("created_at", "order_id", "product_id") SELECT "created_at", "order_id", "product_id" FROM "products_on_orders";
DROP TABLE "products_on_orders";
ALTER TABLE "new_products_on_orders" RENAME TO "products_on_orders";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
