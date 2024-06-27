import multer from "multer";
import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import AppError from "./appError.js";

dotenv.config();

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_KEY,
    api_secret : process.env.CLOUDINARY_SECRET
});
const maxSize = 2*1000*1000;
const filetype =  file => { file.mimetype.toString()};


const storage= multer.diskStorage({
    filename: (req,file,cb)=>{
        cb(file.originalname)
    },

})
const fileFilter =  (req,file,cb)=> {
    if (filetype === "image/png" || filetype === "image/jpg" || filetype === "image/jpeg") {
        cb(null, true)
    } else {
        cb(new AppError("File type not allowed", 400), false)
    }
}

const upload = multer({storage,limits:{fileSize:maxSize},fileFilter:fileFilter});

export {upload, cloudinary}



