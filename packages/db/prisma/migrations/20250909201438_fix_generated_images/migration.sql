-- AlterTable
ALTER TABLE "GeneratedImages" ADD COLUMN     "falAiRequestId" TEXT;

-- CreateIndex
CREATE INDEX "GeneratedImages_falAiRequestId_idx" ON "GeneratedImages"("falAiRequestId");
