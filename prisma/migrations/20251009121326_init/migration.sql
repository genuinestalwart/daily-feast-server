-- CreateEnum
CREATE TYPE "Category" AS ENUM ('DISH', 'DRINK');

-- CreateEnum
CREATE TYPE "MenuItemStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "MenuItem" (
    "available" BOOLEAN NOT NULL DEFAULT true,
    "category" "Category" NOT NULL DEFAULT 'DISH',
    "description" VARCHAR(500) NOT NULL,
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "prep_time" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "status" "MenuItemStatus" NOT NULL DEFAULT 'PENDING',
    "tags" TEXT[],

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);
