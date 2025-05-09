/*
  Warnings:

  - Changed the type of `intake_time` on the `medication_times` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "medication_times" DROP COLUMN "intake_time",
ADD COLUMN     "intake_time" VARCHAR(5) NOT NULL;
