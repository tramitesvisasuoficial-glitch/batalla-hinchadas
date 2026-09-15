-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'draft';

-- Safe migration for existing battles
UPDATE "Battle" SET "startsAt" = "createdAt";
