-- Create Enum Types (Optional, but good practice if status/roles were enums)
-- Kept as TEXT here to match your Prisma schema exactly.

-- 1. Table: Student
CREATE TABLE "Student" (
    "regNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dept" TEXT NOT NULL,
    "email" TEXT,
    "year" INTEGER,
    "contactNo" TEXT,
    "gpa" DOUBLE PRECISION,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("regNo")
);

-- Create unique index for Student email
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");


-- 2. Table: Exam
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "venue" TEXT NOT NULL,
    "totalMarks" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- Create unique index for Exam courseCode
CREATE UNIQUE INDEX "Exam_courseCode_key" ON "Exam"("courseCode");


-- 3. Table: Invigilator
CREATE TABLE "Invigilator" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "employeeId" TEXT,
    "phoneNo" TEXT,
    "dept" TEXT,
    "roomAssignment" TEXT,
    "shiftTiming" TEXT,

    CONSTRAINT "Invigilator_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes for Invigilator
CREATE UNIQUE INDEX "Invigilator_staffId_key" ON "Invigilator"("staffId");
CREATE UNIQUE INDEX "Invigilator_email_key" ON "Invigilator"("email");
CREATE UNIQUE INDEX "Invigilator_employeeId_key" ON "Invigilator"("employeeId");


-- 4. Table: Malpractice
CREATE TABLE "Malpractice" (
    "id" SERIAL NOT NULL,
    "studentReg" TEXT NOT NULL,
    "invigilatorId" INTEGER NOT NULL,
    "examId" INTEGER,
    "examCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REPORTED',
    "incidentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "malpracticeType" TEXT,
    "severityLevel" TEXT,

    CONSTRAINT "Malpractice_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Keys for Malpractice
ALTER TABLE "Malpractice" ADD CONSTRAINT "Malpractice_studentReg_fkey" FOREIGN KEY ("studentReg") REFERENCES "Student"("regNo") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Malpractice" ADD CONSTRAINT "Malpractice_invigilatorId_fkey" FOREIGN KEY ("invigilatorId") REFERENCES "Invigilator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Malpractice" ADD CONSTRAINT "Malpractice_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- 5. Table: EvidenceVault
CREATE TABLE "EvidenceVault" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "fileType" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "fileSizeKb" INTEGER,
    "captureDevice" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checksumHash" TEXT,

    CONSTRAINT "EvidenceVault_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Key for EvidenceVault
ALTER TABLE "EvidenceVault" ADD CONSTRAINT "EvidenceVault_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Malpractice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 6. Table: DisciplinaryAction
CREATE TABLE "DisciplinaryAction" (
    "id" SERIAL NOT NULL,
    "caseId" INTEGER NOT NULL,
    "actionType" TEXT NOT NULL,
    "decisionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveDate" TIMESTAMP(3),
    "decidedBy" TEXT,
    "penaltyAmount" DOUBLE PRECISION,
    "remarks" TEXT,

    CONSTRAINT "DisciplinaryAction_pkey" PRIMARY KEY ("id")
);

-- Create unique index for One-to-One relation
CREATE UNIQUE INDEX "DisciplinaryAction_caseId_key" ON "DisciplinaryAction"("caseId");

-- Add Foreign Key for DisciplinaryAction
ALTER TABLE "DisciplinaryAction" ADD CONSTRAINT "DisciplinaryAction_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Malpractice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- 7. Table: AuditTrail
CREATE TABLE "AuditTrail" (
    "id" SERIAL NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrail_pkey" PRIMARY KEY ("id")
);