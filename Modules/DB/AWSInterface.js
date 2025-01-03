import { readdirSync, readFileSync } from 'fs';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

export const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    }
});

// Upload all images to S3 bucket
export const uploadFilesToBucket = async (bucketName, folderPath, timestamp) => {
    if (!bucketName) {
        throw new Error("Bucket name is required.");
    }
    console.log(`Uploading files from ${folderPath}\n`);
    const keys = readdirSync(folderPath);

    for (let key of keys) {
        const filePath = path.join(folderPath, key);
        const fileContent = readFileSync(filePath);
        try {
            await s3Client.send(new PutObjectCommand({
                Bucket: bucketName,
                Body: fileContent,
                Key: `stills/${timestamp}_${key}`,
            }));
            console.log(`${key} uploaded successfully.`);
        } catch (error) {
            console.error(`Error uploading ${key}:`, error);
        }
    }
};

export const getFileFromBucket = async (file_name) => {
    try {
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `stills/${file_name}`,
        };
        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);
        return data.Body; // This is a ReadableStream
    } catch (err) {
        console.error("Error", err);
        return null;
    }
};

export const deleteAllFilesFromBucket = async (bucketName) => {
    if (!bucketName) {
        throw new Error("Bucket name is required.");
    }
    console.log(`Deleting all files from ${bucketName}\n`);
    const listParams = {
        Bucket: bucketName,
    };

    try {
        const data = await s3Client.send(new ListObjectsV2Command(listParams));
        if (data.Contents.length === 0) {
            console.log("No files to delete.");
            return;
        }
        const deleteParams = {
            Bucket: bucketName,
            Delete: { Objects: [] },
        };
        data.Contents.forEach(({ Key }) => {
            deleteParams.Delete.Objects.push({ Key });
        });
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        console.log("All files deleted successfully.");
    } catch (error) {
        console.error("Error deleting files:", error);
    }
};