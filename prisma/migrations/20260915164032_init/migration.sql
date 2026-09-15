-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "teamAName" TEXT NOT NULL,
    "teamAColor" TEXT NOT NULL,
    "teamBName" TEXT NOT NULL,
    "teamBColor" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Support" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "supporterName" TEXT NOT NULL,
    "message" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Support_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
