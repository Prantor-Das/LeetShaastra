/*
  Warnings:

  - Changed the type of `status` on the `Submission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `TestCaseResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACCEPTED', 'WRONG_ANSWER');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "compileOutput" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;

-- AlterTable
ALTER TABLE "TestCaseResult" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL;
