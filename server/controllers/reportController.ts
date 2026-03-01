import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import Evidence from '../models/Evidence.js';
import * as crypto from 'crypto';
import cloudinary from '../config/cloudinary.js';
import imghash from 'imghash';

const calculateHammingDistance = (hash1: string, hash2: string): number => {
    const hexToBin = (hex: string) => parseInt(hex, 16).toString(2).padStart(4, '0');
    let distance = 0;
    for (let i = 0; i < Math.min(hash1.length, hash2.length); i++) {
        const bin1 = hexToBin(hash1[i]);
        const bin2 = hexToBin(hash2[i]);
        for (let j = 0; j < 4; j++) {
            if (bin1[j] !== bin2[j]) distance++;
        }
    }
    return distance + Math.abs(hash1.length - hash2.length) * 4;
};

const uploadToCloudinary = (buffer: Buffer, folder: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'] },
            (error: any, result: any) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        stream.end(buffer);
    });
};

interface ReportBody {
    studentReg: string;
    examCode: string;
    description: string;
    invigilatorId: string;
}

// --- 1. SUBMIT REPORT (Write Data) ---
export const submitReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { studentReg, examCode, description, invigilatorId } = req.body as ReportBody;

        // Multer + Cloudinary puts the file info here
        const file = req.file;

        // Validation
        if (!studentReg || !examCode || !invigilatorId) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        console.log(`📝 Processing Report for: ${studentReg}`);
        if (file) {
            console.log(`📂 File received: ${file.originalname} (${file.mimetype})`);
            // Debug log to see available properties if path is missing
            if (!file.path) console.log("⚠️ File object missing 'path'. Properties:", Object.keys(file));
        }

        // --- Resolve Invigilator ID (Smart Fallback Logic) ---
        let targetInvigilatorId: number | null = null;
        const parsedId = parseInt(invigilatorId);

        if (!isNaN(parsedId)) {
            const byId = await prisma.invigilator.findUnique({ where: { id: parsedId } });
            if (byId) targetInvigilatorId = byId.id;
        }

        if (!targetInvigilatorId) {
            const byStaffId = await prisma.invigilator.findUnique({ where: { staffId: invigilatorId } });
            if (byStaffId) targetInvigilatorId = byStaffId.id;
        }

        if (!targetInvigilatorId) {
            const fallback = await prisma.invigilator.findFirst({ orderBy: { id: 'desc' } });
            if (fallback) {
                console.log(`⚠️ Warning: Provided Invigilator ID '${invigilatorId}' not found. Auto-linking to: '${fallback.name}' (ID: ${fallback.id})`);
                targetInvigilatorId = fallback.id;
            } else {
                res.status(400).json({ error: "Invigilator not found in database." });
                return;
            }
        }

        // --- NEW CLOUDINARY UPLOAD LOGIC ---
        let fileUrl = '';
        let publicId = '';
        let fileHash: string | null = null;
        let pHash: string | null = null;
        let isSuspectedDuplicate = false;
        let duplicateOfId: number | null = null;

        if (file) {
            // Hash the file (SHA-256)
            const hashSum = crypto.createHash('sha256');
            hashSum.update(file.buffer);
            fileHash = hashSum.digest('hex');

            // Generate Perceptual Hash (pHash) and check duplicates
            try {
                pHash = await imghash.hash(file.buffer);

                // Compare with recent pHashes
                const recentEvidences = await prisma.evidenceVault.findMany({
                    where: { pHash: { not: null } },
                    orderBy: { uploadedAt: 'desc' },
                    take: 50
                });

                for (const ev of recentEvidences) {
                    if (ev.pHash) {
                        const distance = calculateHammingDistance(pHash, ev.pHash);
                        if (distance <= 4) { // >90% visual similarity
                            isSuspectedDuplicate = true;
                            duplicateOfId = ev.id;
                            console.log(`🚨 DUPLICATE DETECTED! Distance: ${distance}. Matches Evidence ID: ${ev.id}`);
                            break;
                        }
                    }
                }
            } catch (err) {
                console.error("pHash generation failed:", err);
            }

            // Upload
            try {
                const uploadResult = await uploadToCloudinary(file.buffer, 'exam_evidence_vault');
                fileUrl = uploadResult.secure_url;
                publicId = uploadResult.public_id;
            } catch (err) {
                console.error("Cloudinary upload failed", err);
                res.status(500).json({ error: "Failed to upload evidence to Cloudinary" });
                return;
            }
        }

        // --- Start Hybrid Transaction ---
        const result = await prisma.$transaction(async (prismaTx) => {

            // A. Create Incident in PostgreSQL (Structured Data)
            const newIncident = await prismaTx.malpractice.create({
                data: {
                    student: { connect: { regNo: studentReg } },
                    invigilator: { connect: { id: targetInvigilatorId! } },
                    examCode: examCode,
                    status: 'REPORTED',
                }
            });

            // A.2. Create EvidenceVault in PostgreSQL if file exists
            if (file && fileUrl) {
                await prismaTx.evidenceVault.create({
                    data: {
                        caseId: newIncident.id,
                        fileType: file.mimetype || 'unknown',
                        storageUrl: fileUrl,
                        checksumHash: fileHash,
                        fileSizeKb: file.size ? Math.round(file.size / 1024) : 0,
                        pHash,
                        isSuspectedDuplicate,
                        duplicateOfId,
                    }
                });
            }

            let newEvidence = null;

            // B. Create Evidence in MongoDB (Only if we have a valid file URL)
            if (file && fileUrl) {
                newEvidence = new Evidence({
                    incidentId: newIncident.id,
                    studentReg: studentReg,
                    description: description || "No description provided",

                    // STORE CLOUDINARY LINKS
                    url: fileUrl,                        // The Cloudinary URL
                    publicId: publicId,                  // The Cloudinary Public ID
                    fileType: file.mimetype || "",
                    originalName: file.originalname || ""
                });

                await newEvidence.save();
            } else if (file) {
                console.error("❌ File uploaded but no URL found. Skipping MongoDB save to prevent crash.");
            }

            return { incident: newIncident, evidence: newEvidence };
        }, { maxWait: 5000, timeout: 10000 });

        console.log("✅ Report Saved: Postgres (Case)" + (result.evidence ? " + MongoDB (Evidence Link)" : ""));
        res.status(201).json({ success: true, data: result });

    } catch (error: any) {
        console.error("❌ Report Submission Failed:", error);
        res.status(500).json({ error: "Failed to process report", details: error.message });
    }
};

// ... (getDashboardStats remains unchanged) ...
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const recentReportsRaw = await prisma.malpractice.findMany({
            take: 5,
            orderBy: { incidentDate: 'desc' },
            include: { student: { select: { name: true, regNo: true } } }
        });
        const totalReports = await prisma.malpractice.count();
        const pendingReports = await prisma.malpractice.count({ where: { status: 'REPORTED' } });

        res.json({
            success: true,
            stats: { totalReports, pendingReports, activeExams: 1, myReports: totalReports },
            recentReports: recentReportsRaw.map(r => ({
                id: `CASE-${r.id}`,
                studentName: r.student.name || r.studentReg,
                time: new Date(r.incidentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: r.status === 'REPORTED' ? 'pending' : 'review',
                severity: 'major'
            }))
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch dashboard" });
    }
};

// --- GET ALL REPORTS (Admin) ---
export const getAllReports = async (req: Request, res: Response): Promise<void> => {
    try {
        const reports = await prisma.malpractice.findMany({
            include: {
                student: { select: { name: true, regNo: true, dept: true } },
                invigilator: { select: { name: true, staffId: true } },
                evidence: true,
                exam: true,
            },
            orderBy: { incidentDate: 'desc' },
        });
        res.json({ success: true, reports });
    } catch (error: any) {
        console.error("Failed to fetch all reports:", error);
        res.status(500).json({ error: "Failed to fetch reports" });
    }
};

// --- UPDATE REPORT STATUS (Admin) ---
export const updateReportStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reportId } = req.params;
        const { status, adminRemarks } = req.body;

        if (!status) {
            res.status(400).json({ error: "Status is required" });
            return;
        }

        const updatedReport = await prisma.malpractice.update({
            where: { id: parseInt(reportId) },
            data: {
                status,
                adminRemarks,
                reviewedAt: new Date(),
            },
        });

        res.json({ success: true, report: updatedReport });
    } catch (error: any) {
        console.error("Failed to update report status:", error);
        res.status(500).json({ error: "Failed to update report" });
    }
};