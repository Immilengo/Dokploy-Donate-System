-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "DonationCategory" AS ENUM ('CLOTHING', 'FOOTWEAR', 'BLANKETS', 'TOYS', 'BOOKS', 'OTHER');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'RECEIVED', 'IN_DELIVERY', 'DONATED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "recordStatus" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "googleId" TEXT,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_points" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TEXT,
    "recordStatus" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "collectionPointId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "DonationCategory" NOT NULL,
    "estimatedQuantity" TEXT,
    "donationStatus" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "thankYouMessage" TEXT,
    "deliveryImageUrl" TEXT,
    "recordStatus" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_collectionPointId_fkey" FOREIGN KEY ("collectionPointId") REFERENCES "collection_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
