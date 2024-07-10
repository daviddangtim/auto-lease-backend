import multer from "multer";
import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import AppError from "./appError.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
const maxSize = 2 * 1000 * 1000;
const filetype = (file) => {
    file.mimetype.toString();
};

const storage = multer.memoryStorage({
    filename: (req, file, cb) => {
        cb(file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (
        filetype === "image/png" ||
        filetype === "image/jpg" ||
        filetype === "image/jpeg" ||
        filetype === "application/pdf"
    ) {
        cb(null, true);
    } else {
        cb(new AppError("File type not allowed", 400), false);
    }
};

const upload = multer({
    storage,
    limits: {fileSize: maxSize},
    fileFilter: fileFilter,
});

const uploadMultiple = async (req, res, next) => {
    try {
        const images = req.files;
        console.log(images);
        const photos = [];
        const photosId = [];

        for (const image of images) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: "auto-lease",
                    resource_type: "auto",
                    use_filename: true
                }, (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                });
                uploadStream.end(image.buffer);
            });

            photos.push(result.secure_url);
            photosId.push(result.public_id);
        }

        req.photos = photos;
        req.photosId = photosId;
        console.log(photos, photosId);
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred while uploading files');
    }
};

// If anyone reading this is confused the buffer is just the buffer field in the field object since we're using memory storage to upload it

const cloudinaryImageUploader = async (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({
            folder: "auto-lease"
        }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
        uploadStream.end(buffer);
    });
};

const cloudinaryImageUpdater = async (buffer, previousImageId) => {
    try {
        await cloudinary.uploader.destroy(previousImageId, {
            folder: "auto-lease",
            resource_type: "auto"
        });

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: "auto-lease",
                resource_type: "auto"
            }, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
            uploadStream.end(buffer);
        });
    } catch (error) {
        throw error;
    }
};

export {upload, cloudinary, cloudinaryImageUploader, cloudinaryImageUpdater, uploadMultiple};
