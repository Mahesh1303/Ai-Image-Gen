/*
  Warnings:

  - Added the required column `status` to the `GeneratedImages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('generating', 'finished', 'canceled');

-- AlterTable
ALTER TABLE "GeneratedImages" ADD COLUMN     "status" "Status" NOT NULL;
