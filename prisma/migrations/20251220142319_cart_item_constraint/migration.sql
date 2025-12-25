/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,menu_item_id]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CartItem_customer_id_menu_item_id_key" ON "CartItem"("customer_id", "menu_item_id");
