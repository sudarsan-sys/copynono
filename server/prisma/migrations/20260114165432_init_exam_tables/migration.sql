/*
  Warnings:

  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Invigilator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Invigilator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "regNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dept" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("regNo")
);

-- CreateTable
CREATE TABLE "Malpractice" (
    "id" SERIAL NOT NULL,
    "studentReg" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "incidentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invigilatorId" INTEGER NOT NULL,

    CONSTRAINT "Malpractice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invigilator_staffId_key" ON "Invigilator"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "Invigilator_email_key" ON "Invigilator"("email");

-- AddForeignKey
ALTER TABLE "Malpractice" ADD CONSTRAINT "Malpractice_studentReg_fkey" FOREIGN KEY ("studentReg") REFERENCES "Student"("regNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Malpractice" ADD CONSTRAINT "Malpractice_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "Invigilator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
