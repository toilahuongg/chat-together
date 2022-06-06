import { S3 } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config();

const s3 = new S3({
  endpoint: process.env.S3_ENDPOINT,
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_ACCESS_KEY_ID!,
    secretAccessKey: process.env.DO_SECRET_ACCESS_KEY!
  }
});

export default s3;