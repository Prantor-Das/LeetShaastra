/*
  Warnings:

  - Added the required column `emailVerificationExpiry` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emailVerificationToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forgotPasswordExpiry` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forgotPasswordToken` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerificationExpiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "emailVerificationToken" TEXT NOT NULL,
ADD COLUMN     "forgotPasswordExpiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "forgotPasswordToken" TEXT NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "refreshToken" TEXT NOT NULL;
