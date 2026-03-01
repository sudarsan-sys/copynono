import mongoose from 'mongoose';

const EvidenceSchema = new mongoose.Schema({
    incidentId: { type: Number, required: true, index: true }, // Links to PostgreSQL Case ID
    studentReg: String,
    description: String,

    // Cloudinary Specific Data
    url: { type: String, required: true },       // The viewable link (https://res.cloudinary.com/...)
    publicId: String,                            // The ID used for Cloudinary API operations
    fileType: String,
    originalName: String,

    uploadedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Evidence || mongoose.model('Evidence', EvidenceSchema);