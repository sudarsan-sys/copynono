import { prisma } from './lib/prisma.js';

async function main() {
    console.log("🌱 Starting Comprehensive Database Seeding...");

    // 1. Seed Students
    const student1 = await prisma.student.upsert({
        where: { regNo: 'STU-001' },
        update: {},
        create: {
            regNo: 'STU-001',
            name: 'Harry Potter',
            dept: 'Defense Against Dark Arts',
            email: 'harry@hogwarts.edu',
            year: 4,
            contactNo: '1234567890',
            gpa: 3.8
        }
    });

    const student2 = await prisma.student.upsert({
        where: { regNo: 'STU-002' },
        update: {},
        create: {
            regNo: 'STU-002',
            name: 'Hermione Granger',
            dept: 'Arcane Studies',
            email: 'hermione@hogwarts.edu',
            year: 4,
            gpa: 4.0
        }
    });

    const student3 = await prisma.student.upsert({
        where: { regNo: 'STU-003' },
        update: {},
        create: {
            regNo: 'STU-003',
            name: 'Ron Weasley',
            dept: 'History of Magic',
            email: 'ron@hogwarts.edu',
            year: 4,
            gpa: 3.5
        }
    });

    // 2. Seed Invigilators
    const invigilator1 = await prisma.invigilator.upsert({
        where: { staffId: 'PROF-001' },
        update: {},
        create: {
            name: 'Dr. Severus Snape',
            staffId: 'PROF-001',
            email: 'snape@hogwarts.edu',
            employeeId: 'EMP-999',
            dept: 'Potions',
            roomAssignment: 'Dungeon 101'
        }
    });

    // 3. Seed Exams
    const exam1 = await prisma.exam.upsert({
        where: { courseCode: 'CS101' },
        update: {},
        create: {
            courseCode: 'CS101',
            courseTitle: 'Introduction to Database Systems',
            examDate: new Date(),
            startTime: '10:00 AM',
            duration: 180,
            venue: 'Great Hall',
            totalMarks: 100
        }
    });

    console.log("✅ Core Tables (Student, Invigilator, Exam) Seeded.");

    // 4. Seed Attendance (NEW: Required for Reporting Logic)
    // We mark Harry and Hermione as PRESENT, so you can report them.
    // Ron is ABSENT, so reporting him should fail (good for testing logic).

    await prisma.attendance.upsert({
        where: { studentReg_examCode: { studentReg: 'STU-001', examCode: 'CS101' } },
        update: {},
        create: { studentReg: 'STU-001', examCode: 'CS101', status: 'PRESENT' }
    });

    await prisma.attendance.upsert({
        where: { studentReg_examCode: { studentReg: 'STU-002', examCode: 'CS101' } },
        update: {},
        create: { studentReg: 'STU-002', examCode: 'CS101', status: 'PRESENT' }
    });

    await prisma.attendance.upsert({
        where: { studentReg_examCode: { studentReg: 'STU-003', examCode: 'CS101' } },
        update: {},
        create: { studentReg: 'STU-003', examCode: 'CS101', status: 'ABSENT' }
    });

    console.log("✅ Attendance Marked.");

    // 5. Seed Malpractice Case (Links Student, Invigilator, and Exam)
    const malpracticeCase = await prisma.malpractice.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            studentReg: student1.regNo,
            invigilatorId: invigilator1.id,
            examId: exam1.id,
            examCode: exam1.courseCode,
            malpracticeType: 'Unauthorized Material',
            severityLevel: 'High',
            status: 'REPORTED',
            studentExplanation: 'I was just holding a parchment for notes.'
        }
    });

    // 6. Seed Evidence Vault (Linked to Malpractice Case)
    await prisma.evidenceVault.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            caseId: malpracticeCase.id,
            fileType: 'image/jpeg',
            storageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
            fileSizeKb: 512,
            captureDevice: 'Room Camera 04'
        }
    });

    // 7. Seed Disciplinary Action (Linked to Malpractice Case)
    await prisma.disciplinaryAction.upsert({
        where: { caseId: malpracticeCase.id },
        update: {},
        create: {
            caseId: malpracticeCase.id,
            actionType: 'Warning Issued',
            decidedBy: 'Headmaster Dumbledore',
            penaltyAmount: 0.0,
            remarks: 'First time offense, under review.'
        }
    });

    // 8. Seed Audit Trail (Standalone Log)
    await prisma.auditTrail.create({
        data: {
            tableName: 'Malpractice',
            recordId: malpracticeCase.id.toString(),
            operationType: 'INSERT',
            userId: 'ADMIN-01',
            ipAddress: '192.168.1.1',
            newValue: JSON.stringify(malpracticeCase)
        }
    });

    console.log("✅ Transactional Tables (Malpractice, Evidence, Action, Audit) Seeded.");
    console.log("🎉 Database is now fully populated and in sync!");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error("❌ Seeding Error:", e);
        await prisma.$disconnect();
        process.exit(1);
    });