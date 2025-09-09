/*
  Warnings:

  - You are about to drop the column `falAiRequestId` on the `GeneratedImages` table. All the data in the column will be lost.
  - You are about to drop the `TrainingImages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `falAiModelRequestId` to the `Model` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipUrl` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrainingImages" DROP CONSTRAINT "TrainingImages_modelId_fkey";

-- DropIndex
DROP INDEX "GeneratedImages_falAiRequestId_idx";

-- AlterTable
ALTER TABLE "GeneratedImages" DROP COLUMN "falAiRequestId",
ADD COLUMN     "falAiImageRequestId" TEXT;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "falAiModelRequestId" TEXT NOT NULL,
ADD COLUMN     "zipUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "TrainingImages";

-- CreateIndex
CREATE INDEX "GeneratedImages_falAiImageRequestId_idx" ON "GeneratedImages"("falAiImageRequestId");
