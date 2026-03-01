import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import * as crypto from 'crypto';

export const verifyEvidenceHash = async (req: Request, res: Response): Promise<void> => {
    try {
        const incidentId = req.params.id as string;

        if (!incidentId) {
            res.status(400).json({ error: "Missing incidentId" });
            return;
        }

        const internalId = parseInt(incidentId.replace('CASE-', ''));
        const idToSearch = isNaN(internalId) ? parseInt(incidentId) : internalId;

        const evidenceRec = await prisma.evidenceVault.findFirst({
            where: { caseId: idToSearch }
        });

        if (!evidenceRec || !evidenceRec.storageUrl || !evidenceRec.checksumHash) {
            res.status(404).json({ error: "Evidence not found or hash missing for this incident" });
            return;
        }

        const imageResponse = await fetch(evidenceRec.storageUrl);
        if (!imageResponse.ok) {
            res.status(500).json({ error: "Failed to fetch image from Cloudinary" });
            return;
        }

        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const hashSum = crypto.createHash('sha256');
        hashSum.update(buffer);
        const liveHash = hashSum.digest('hex');

        const isAuthentic = liveHash === evidenceRec.checksumHash;

        res.json({
            success: true,
            isAuthentic,
            originalHash: evidenceRec.checksumHash,
            liveHash,
            storageUrl: evidenceRec.storageUrl
        });

    } catch (error: any) {
        console.error("❌ Evidence Verification Failed:", error);
        res.status(500).json({ error: "Failed to verify evidence", details: error.message });
    }
};
