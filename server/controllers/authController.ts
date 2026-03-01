import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

// --- LOGIN LOGIC ---
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { identifier, password, role } = req.body;

    try {
        let user = null;

        if (role === 'invigilator') {
            user = await prisma.invigilator.findUnique({ where: { email: identifier } });
        } else if (role === 'student') {
            user = await prisma.student.findUnique({ where: { regNo: identifier } });
        } else if (role === 'admin') {
            if (identifier === 'admin@college.edu' && password === 'admin123') {
                user = { id: 0, name: 'System Administrator', email: 'admin@college.edu' };
            }
        }

        if (!user) {
            res.status(401).json({ success: false, message: "User not found." });
            return;
        }

        res.json({
            success: true,
            user: {
                id: (user as any).id || (user as any).regNo,
                name: user.name,
                role: role,
                identifier: identifier
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// --- REGISTER LOGIC (Fixes 404 Error) ---
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    // We destructure 'password' but don't store it (Academic Demo limitation)
    const { role, name, password, ...data } = req.body;

    try {
        let newUser = null;

        if (role === 'invigilator') {
            const { staffId, email } = data;

            // Check for duplicates
            const existing = await prisma.invigilator.findFirst({
                where: { OR: [{ email }, { staffId }] }
            });
            if (existing) {
                res.status(400).json({ success: false, message: "Invigilator already exists." });
                return;
            }

            newUser = await prisma.invigilator.create({
                data: { name, staffId, email }
            });
        }
        else if (role === 'student') {
            const { regNo, dept } = data;

            // Check for duplicates
            const existing = await prisma.student.findUnique({
                where: { regNo }
            });
            if (existing) {
                res.status(400).json({ success: false, message: "Student already exists." });
                return;
            }

            newUser = await prisma.student.create({
                data: { name, regNo, dept }
            });
        } else {
            res.status(400).json({ success: false, message: "Invalid role." });
            return;
        }

        res.status(201).json({ success: true, message: "Registered successfully!", user: newUser });

    } catch (error: any) {
        console.error("Registration Error:", error);
        res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
};