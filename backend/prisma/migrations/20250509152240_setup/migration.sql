-- CreateEnum
CREATE TYPE "medication_type" AS ENUM ('pills', 'syrup', 'injection');

-- CreateEnum
CREATE TYPE "patientprofile_blood_type" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('patient', 'caregiver', 'doctor');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'patient',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "google_id" TEXT,
    "profile_photo_path" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor" (
    "doctor_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "speciality" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,

    CONSTRAINT "doctor_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "patient_caretaker" (
    "patient_id" INTEGER NOT NULL,
    "caretaker_id" INTEGER NOT NULL,

    CONSTRAINT "patient_caretaker_pkey" PRIMARY KEY ("patient_id","caretaker_id")
);

-- CreateTable
CREATE TABLE "health_records" (
    "health_records_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "caretaker_id" INTEGER,
    "record_date" TIMESTAMP(3) NOT NULL,
    "blood_pressure" TEXT,
    "heart_rate" INTEGER,
    "weight" DECIMAL(65,30),
    "temperature" DECIMAL(65,30),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_records_pkey" PRIMARY KEY ("health_records_id")
);

-- CreateTable
CREATE TABLE "medication" (
    "medication_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "caretaker_id" INTEGER,
    "name" TEXT NOT NULL,
    "type" "medication_type" NOT NULL,
    "dosage" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "instructions" TEXT,
    "frequency" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "medication_pkey" PRIMARY KEY ("medication_id")
);

-- CreateTable
CREATE TABLE "medication_times" (
    "medication_time_id" SERIAL NOT NULL,
    "medication_id" INTEGER NOT NULL,
    "intake_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medication_times_pkey" PRIMARY KEY ("medication_time_id")
);

-- CreateTable
CREATE TABLE "notification" (
    "notification_id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medication_id" INTEGER NOT NULL,
    "notification_on" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "log_id" SERIAL NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notification_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "patientprofile" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "age" INTEGER NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "blood_type" "patientprofile_blood_type" NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "patientprofile_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "subscription" (
    "subscription_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "expiration_time" TIMESTAMP(3),
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "emailverificationtoken" (
    "token_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiration" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emailverificationtoken_pkey" PRIMARY KEY ("token_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_google_id_key" ON "user"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_user_id_key" ON "doctor"("user_id");

-- CreateIndex
CREATE INDEX "doctor_user_id_idx" ON "doctor"("user_id");

-- CreateIndex
CREATE INDEX "patient_caretaker_patient_id_idx" ON "patient_caretaker"("patient_id");

-- CreateIndex
CREATE INDEX "patient_caretaker_caretaker_id_idx" ON "patient_caretaker"("caretaker_id");

-- CreateIndex
CREATE INDEX "health_records_user_id_idx" ON "health_records"("user_id");

-- CreateIndex
CREATE INDEX "medication_times_medication_id_idx" ON "medication_times"("medication_id");

-- CreateIndex
CREATE INDEX "notification_medication_id_idx" ON "notification"("medication_id");

-- CreateIndex
CREATE INDEX "notification_logs_notification_id_idx" ON "notification_logs"("notification_id");

-- CreateIndex
CREATE UNIQUE INDEX "patientprofile_user_id_key" ON "patientprofile"("user_id");

-- CreateIndex
CREATE INDEX "patientprofile_user_id_idx" ON "patientprofile"("user_id");

-- CreateIndex
CREATE INDEX "subscription_user_id_idx" ON "subscription"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "emailverificationtoken_user_id_key" ON "emailverificationtoken"("user_id");

-- CreateIndex
CREATE INDEX "emailverificationtoken_user_id_idx" ON "emailverificationtoken"("user_id");

-- AddForeignKey
ALTER TABLE "doctor" ADD CONSTRAINT "doctor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_caretaker" ADD CONSTRAINT "patient_caretaker_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_caretaker" ADD CONSTRAINT "patient_caretaker_caretaker_id_fkey" FOREIGN KEY ("caretaker_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_records" ADD CONSTRAINT "health_records_caretaker_id_fkey" FOREIGN KEY ("caretaker_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication" ADD CONSTRAINT "medication_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication" ADD CONSTRAINT "medication_caretaker_id_fkey" FOREIGN KEY ("caretaker_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medication_times" ADD CONSTRAINT "medication_times_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medication"("medication_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medication"("medication_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "notification"("notification_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patientprofile" ADD CONSTRAINT "patientprofile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emailverificationtoken" ADD CONSTRAINT "emailverificationtoken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
