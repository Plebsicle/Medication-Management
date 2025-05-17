-- AlterTable
ALTER TABLE "chat_message" ADD COLUMN     "chat_id" INTEGER;

-- CreateTable
CREATE TABLE "doctor_patient_chat" (
    "chat_id" SERIAL NOT NULL,
    "doctor_id" INTEGER NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctor_patient_chat_pkey" PRIMARY KEY ("chat_id")
);

-- CreateIndex
CREATE INDEX "doctor_patient_chat_doctor_id_idx" ON "doctor_patient_chat"("doctor_id");

-- CreateIndex
CREATE INDEX "doctor_patient_chat_patient_id_idx" ON "doctor_patient_chat"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_patient_chat_doctor_id_patient_id_key" ON "doctor_patient_chat"("doctor_id", "patient_id");

-- CreateIndex
CREATE INDEX "chat_message_chat_id_idx" ON "chat_message"("chat_id");

-- AddForeignKey
ALTER TABLE "chat_message" ADD CONSTRAINT "chat_message_chat_id_fkey" FOREIGN KEY ("chat_id") REFERENCES "doctor_patient_chat"("chat_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_patient_chat" ADD CONSTRAINT "doctor_patient_chat_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_patient_chat" ADD CONSTRAINT "doctor_patient_chat_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
