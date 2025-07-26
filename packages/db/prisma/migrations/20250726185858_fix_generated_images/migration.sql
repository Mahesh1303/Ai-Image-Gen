/*
  Warnings:

  - Added the required column `prompt` to the `GeneratedImages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedImages" ADD COLUMN     "prompt" TEXT NOT NULL;
