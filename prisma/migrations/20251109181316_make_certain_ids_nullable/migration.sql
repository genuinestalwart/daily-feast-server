-- DropForeignKey
ALTER TABLE "public"."OrderedItem" DROP CONSTRAINT "OrderedItem_menu_item_id_fkey";

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "customer_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderedItem" ALTER COLUMN "menu_item_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderedItem" ADD CONSTRAINT "OrderedItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
