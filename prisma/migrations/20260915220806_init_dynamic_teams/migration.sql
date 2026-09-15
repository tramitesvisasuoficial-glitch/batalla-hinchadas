-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "teamAId" TEXT,
ADD COLUMN     "teamBId" TEXT,
ALTER COLUMN "teamAName" DROP NOT NULL,
ALTER COLUMN "teamAColor" DROP NOT NULL,
ALTER COLUMN "teamBName" DROP NOT NULL,
ALTER COLUMN "teamBColor" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Support" ADD COLUMN     "teamId" TEXT,
ALTER COLUMN "team" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "color" TEXT,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_key" ON "Team"("name");

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Support" ADD CONSTRAINT "Support_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CUSTOM DATA MIGRATION SCRIPT TO PRESERVE HISTORICAL DATA
-- Insert distinct Team A
INSERT INTO "Team" ("id", "name", "color")
SELECT gen_random_uuid(), "teamAName", "teamAColor" FROM "Battle" WHERE "teamAName" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Insert distinct Team B
INSERT INTO "Team" ("id", "name", "color")
SELECT gen_random_uuid(), "teamBName", "teamBColor" FROM "Battle" WHERE "teamBName" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Map teamAId in Battle
UPDATE "Battle"
SET "teamAId" = "Team"."id"
FROM "Team"
WHERE "Battle"."teamAName" = "Team"."name";

-- Map teamBId in Battle
UPDATE "Battle"
SET "teamBId" = "Team"."id"
FROM "Team"
WHERE "Battle"."teamBName" = "Team"."name";

-- Map teamId in Support for Team A
UPDATE "Support"
SET "teamId" = "Battle"."teamAId"
FROM "Battle"
WHERE "Support"."battleId" = "Battle"."id" AND "Support"."team" = 'A';

-- Map teamId in Support for Team B
UPDATE "Support"
SET "teamId" = "Battle"."teamBId"
FROM "Battle"
WHERE "Support"."battleId" = "Battle"."id" AND "Support"."team" = 'B';
