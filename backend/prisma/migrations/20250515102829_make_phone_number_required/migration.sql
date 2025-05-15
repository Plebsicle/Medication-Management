/*
  Warnings:

  - Made the column `phone_number` on table `user` required. This step will fail if there are existing NULL values in that column.

*/

-- First, update NULL values with a placeholder
UPDATE "user" SET "phone_number" = '+0000000000' WHERE "phone_number" IS NULL;

-- Then make the column required
ALTER TABLE "user" ALTER COLUMN "phone_number" SET NOT NULL;
