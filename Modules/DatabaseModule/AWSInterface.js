import { readdirSync, readFileSync } from 'fs';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

export const uploadFilesToBucket = async (bucketName, folderPath, timestamp) => {
    if (!bucketName) {
        throw new Error("Bucket name is required.");
    }
    console.log(`Uploading files from ${folderPath} to bucket ${bucketName}\n`);
    const keys = readdirSync(folderPath);

    for (let key of keys) {
        const filePath = path.join(folderPath, key);
        const fileContent = readFileSync(filePath);
        try {
            const result = await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Body: fileContent,
                Key: `stills/${timestamp}_${key}`,
            }));
            console.log(`${key} uploaded successfully. ETag: ${result.ETag}`);
        } catch (error) {
            console.error(`Error uploading ${key}:`, error);
        }
    }
};