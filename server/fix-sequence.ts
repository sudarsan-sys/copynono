import { prisma } from './lib/prisma.js';

async function fixSequence() {
    try {
        console.log('Fixing EvidenceVault sequence...');
        await prisma.$executeRawUnsafe(`SELECT setval('"EvidenceVault_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "EvidenceVault"), 1), false);`);
        console.log('EvidenceVault sequence fixed!');

        console.log('Fixing Malpractice sequence...');
        await prisma.$executeRawUnsafe(`SELECT setval('"Malpractice_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "Malpractice"), 1), false);`);
        console.log('Malpractice sequence fixed!');
    } catch (error) {
        console.error('Error fixing sequence:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSequence();
