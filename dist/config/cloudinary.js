"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const multer_1 = __importDefault(require("multer"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demtmo0jd',
    api_key: process.env.CLOUDINARY_API_KEY || '139699143278195',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'mcpj2WW_2U1-hEVrhDqg2JbuIrw',
});
// Create storage engine for Multer
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'financial-hub/receipts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
        transformation: [{ width: 1000, crop: 'limit' }],
    },
});
// Create multer upload middleware
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
});
exports.upload = upload;
