import multer from "multer";
import multerS3 from "multer-s3";
import dotenv from 'dotenv';
import path from "path";
import s3 from "./s3";
dotenv.config();

export const upload = multer({
  storage: multerS3({
    //@ts-ignore
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME!,
    acl: 'public-read',
    cacheControl: 'max-age=31536000',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString()+path.extname(file.originalname))
    }
  })
})