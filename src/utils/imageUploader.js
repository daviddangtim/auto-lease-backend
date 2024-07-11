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
    const images = req.files;
    console.log(images);
    const photos = [];
    const photosId = [];

    for (const image of images) {
        const result = await cloudinary.uploader.upload(image.path, {
            folder: "auto-lease",
            resource_type: "auto"
        });
        photos.push(result.secure_url);
        photosId.push(result.public_id);
    }

    req.photos = photos;
    req.photosId = photosId;
    next();
}


const cloudinaryImageUploader = async (file) => {
    return await cloudinary.uploader.upload(file, {
        folder: "auto-lease",
    });
};

const cloudinaryImageUpdater = async (imageToUpdate, previousImageId) => {
    await cloudinary.uploader.destroy(previousImageId, {
        folder: "auto-lease",
        resource_type: "auto",
    });

    return await cloudinary.uploader.upload(imageToUpdate, {
        folder: "auto-lease",
        resource_type: "auto",
    });
}

export {upload, cloudinary, cloudinaryImageUploader, cloudinaryImageUpdater, uploadMultiple};
