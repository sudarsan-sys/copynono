import multer from 'multer';

// Configure storage: Memory storage to keep file in req.file.buffer
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB limit (optional, but good practice)
    }
});

export default upload;