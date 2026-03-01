import express from 'express';
import upload from '../middleware/upload.js';
import { submitReport, getDashboardStats, getAllReports, updateReportStatus } from '../controllers/reportController.js';
import { verifyEvidenceHash } from '../controllers/verifyController.js';

const router = express.Router();

// 1. POST route for Submitting Reports (Matches: /api/reports/submit)
// Ensure 'evidenceImage' matches the FormData key in React
router.post('/submit', upload.single('evidenceImage'), submitReport);

// 2. GET route for Dashboard Stats (Matches: /api/reports/dashboard)
router.get('/dashboard', getDashboardStats);

// 3. GET route to Verify Evidence Hash
router.get('/verify/:id', verifyEvidenceHash);

// 4. GET route for All Reports (Admin)
router.get('/all', getAllReports);

// 5. PATCH route for Updating Report Status (Admin)
router.patch('/:reportId/status', updateReportStatus);

export default router;