-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email_notifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sms_notifications" BOOLEAN NOT NULL DEFAULT true;
