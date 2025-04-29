"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const error_middleware_1 = require("./error.middleware");
// Create uploads directory if it doesn't exist
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});
// File filter
const fileFilter = (req, file, cb) => {
    // Accept images and PDFs only
    const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedFileTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image and PDF files are allowed!'));
    }
};
// Initialize multer upload
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter,
});
// Middleware for handling file upload errors
const uploadMiddleware = (fieldName) => {
    return (req, res, next) => {
        const uploadSingle = upload.single(fieldName);
        uploadSingle(req, res, (err) => {
            if (err instanceof multer_1.default.MulterError) {
                // A Multer error occurred when uploading
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new error_middleware_1.AppError('File size too large. Maximum size is 5MB.', 400));
                }
                return next(new error_middleware_1.AppError(`Multer upload error: ${err.message}`, 400));
            }
            else if (err) {
                // An unknown error occurred
                return next(new error_middleware_1.AppError(err.message, 400));
            }
            // Everything went fine
            next();
        });
    };
};
exports.uploadMiddleware = uploadMiddleware;
