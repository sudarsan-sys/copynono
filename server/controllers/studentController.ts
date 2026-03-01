import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import Evidence from '../models/Evidence.js'; // Import MongoDB Model

// --- 1. Fetch All Students (For Invigilator Search) ---
export const getAllStudents = async (req: Request, res: Response): Promise<void> => {
    try {
        const students = await prisma.student.findMany({
            select: {
                regNo: true,
                name: true,
                dept: true,
            },
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            students
        });
    } catch (error: any) {
        console.error("❌ Fetch All Students Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch student directory" });
    }
};

// --- 2. Fetch Specific Student Cases (HYBRID FETCH FIX) ---
export const getStudentCases = async (req: Request, res: Response): Promise<void> => {
    try {
        const { regNo } = req.params;

        // A. Fetch Structured Data from PostgreSQL
        const cases = await prisma.malpractice.findMany({
            where: { studentReg: regNo },
            orderBy: { incidentDate: 'desc' },
            include: {
                invigilator: {
                    select: { name: true, staffId: true }
                }
            }
        });

        // B. Identify the "Active" Case (Not Closed)
        const activeCase = cases.find(c => c.status !== 'CLOSED');
        let evidenceUrl = null;

        // C. Hybrid Fetch: Query MongoDB for Evidence URL
        if (activeCase) {
            try {
                // Find the MongoDB document linked to this Postgres Incident ID
                const mongoEvidence = await Evidence.findOne({ incidentId: activeCase.id });

                if (mongoEvidence && mongoEvidence.url) {
                    console.log(`✅ Evidence found for Case ${activeCase.id}: ${mongoEvidence.url}`);
                    evidenceUrl = mongoEvidence.url;
                } else {
                    console.log(`ℹ️ No evidence found in MongoDB for Case ${activeCase.id}`);
                }
            } catch (mongoError) {
                console.error("⚠️ MongoDB Fetch Error:", mongoError);
            }
        }

        res.json({
            success: true,
            hasActiveCase: !!activeCase,
            cases: cases.map(c => ({
                id: c.id,
                exam: c.examCode,
                date: c.incidentDate,
                status: c.status,
                type: c.malpracticeType,
                remarks: c.severityLevel,
                invigilatorName: c.invigilator.name,
                studentExplanation: c.studentExplanation
            })),
            // D. Combine Data for Frontend
            activeCaseDetails: activeCase ? {
                id: activeCase.id,
                exam: activeCase.examCode,
                date: activeCase.incidentDate,
                type: activeCase.malpracticeType,
                status: activeCase.status,
                studentExplanation: activeCase.studentExplanation,
                // The frontend checks this specific field to show the image
                evidenceUrl: evidenceUrl
            } : null
        });

    } catch (error: any) {
        console.error("❌ Fetch Student Cases Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch student records" });
    }
};

// --- 3. Submit Student Response ---
export const submitResponse = async (req: Request, res: Response): Promise<void> => {
    try {
        const { caseId, explanation } = req.body;

        if (!caseId || !explanation) {
            res.status(400).json({ success: false, message: "Case ID and explanation are required" });
            return;
        }

        const updatedCase = await prisma.malpractice.update({
            where: { id: parseInt(caseId) },
            data: {
                studentExplanation: explanation,
                status: 'PENDING_REVIEW'
            }
        });

        res.json({
            success: true,
            message: "Response submitted successfully",
            data: updatedCase
        });
    } catch (error: any) {
        console.error("❌ Response Submission Error:", error);
        res.status(500).json({ success: false, message: "Failed to submit response" });
    }
};