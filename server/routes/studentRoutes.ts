import express from 'express';
import { getStudentCases, getAllStudents, submitResponse } from '../controllers/studentController.js';

const router = express.Router();

// Get all students for search (Invigilator use)
// This matches the call in the Canvas: axios.get('http://localhost:5000/api/student')
router.get('/', getAllStudents);

// Get cases for a specific student
router.get('/:regNo/cases', getStudentCases);

// Submit response (Student use)
router.post('/respond', submitResponse);

export default router;