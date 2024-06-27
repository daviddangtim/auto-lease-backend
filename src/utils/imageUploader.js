import multer from "multer";
import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_NAME,
    api_key : process.env.CLOUDINARY_KEY,
    api_secret : process.env.CLOUDINARY_SECRET
});

const storage= multer.diskStorage({
    filename: (req,file,cb)=>{
    cb(file.originalname)
}
})

const upload = multer({storage});

export {upload, cloudinary}



