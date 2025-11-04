-- CreateEnum
CREATE TYPE "Category" AS ENUM ('DISH', 'DRINK');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'PICKUP');

-- CreateEnum
CREATE TYPE "MenuItemStatus" AS ENUM ('APPROVED', 'KEPT_AS_DRAFT', 'PENDING_APPROVAL', 'DENIED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACCEPTED', 'CANCELLED', 'DELIVERED', 'FAILED', 'IN_TRANSIT', 'PENDING', 'PICKED_UP', 'PREPARING', 'READY_FOR_PICKUP', 'REJECTED', 'RETURNED');

-- CreateTable
CREATE TABLE "CartItem" (
    "id" UUID NOT NULL,
    "customer_id" TEXT NOT NULL,
    "price_per_item" DOUBLE PRECISION NOT NULL,
    "amount" INTEGER NOT NULL,
    "menu_item_id" UUID NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" UUID NOT NULL,
    "category" "Category" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "price" DOUBLE PRECISION NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(500) NOT NULL,
    "image" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "prep_time" INTEGER NOT NULL,
    "status" "MenuItemStatus" NOT NULL DEFAULT 'KEPT_AS_DRAFT',
    "tags" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customer_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "rider_id" TEXT,
    "type" "OrderType" NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderedItem" (
    "id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "price_per_item" DOUBLE PRECISION NOT NULL,
    "menu_item_id" UUID NOT NULL,
    "order_id" UUID NOT NULL,

    CONSTRAINT "OrderedItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedItem" ADD CONSTRAINT "OrderedItem_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderedItem" ADD CONSTRAINT "OrderedItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
