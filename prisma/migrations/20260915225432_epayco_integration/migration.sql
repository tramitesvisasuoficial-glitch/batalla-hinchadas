-- AlterTable
ALTER TABLE "Support" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '30 minutes',
ADD COLUMN     "paymentCode" INTEGER,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentResponse" TEXT,
ADD COLUMN     "refPayco" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Support_refPayco_key" ON "Support"("refPayco");
