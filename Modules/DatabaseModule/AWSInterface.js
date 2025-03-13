import {readdirSync, readFileSync} from 'fs';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    GetObjectCommand
} from "@aws-sdk/client-s3";

import dotenv from "dotenv";

import {pipeline} from "stream";
import {promisify} from "util";
import fs from "fs";
import path from "path";


// Load environment variables from .env file
await dotenv.config();

export const s3Client = new S3Client({
    region: "us-east-1",
    credentials: {
        accessKeyId:process.env.AWS_ACCESS_KEY,
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


const listAllKeys = async (bucketName, prefix) => {
    const keys = [];
    let continuationToken;
    do {
        const response = await s3Client.send(new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: continuationToken
        }));
        if (response.Contents) {
            response.Contents.forEach(item => keys.push(item.Key));
        }
        continuationToken = response.IsTruncated ? response.NextContinuationToken : null;
    } while (continuationToken);
    return keys;
};

const deleteDirectory = async (bucketName, directory) => {
    if (!bucketName || !directory) {
        throw new Error("Bucket name and directory are required.");
    }
    console.log(`Deleting directory ${directory} from bucket ${bucketName}\n`);
    const keys = await listAllKeys(bucketName, directory);

    for (let key of keys) {
        try {
            await s3Client.send(new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            }));
            console.log(`${key} deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting ${key}:`, error);
        }
    }
};

const streamToString = async (stream) => {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
};

const downloadDirectory = async (bucketName, directory, destination) => {
    const downloadedFiles = [];
    try {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }

        const listObjects = await s3Client.send(new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: directory
        }));

        if (!listObjects.Contents) {
            throw new Error(`No contents found in bucket ${bucketName} with prefix ${directory}`);
        }

        for (const item of listObjects.Contents) {
            const getObjectParams = {
                Bucket: bucketName,
                Key: item.Key
            };
            const data = await s3Client.send(new GetObjectCommand(getObjectParams));
            const filePath = path.join(destination, path.basename(item.Key));
            const fileStream = fs.createWriteStream(filePath);
            await promisify(pipeline)(data.Body, fileStream);
            downloadedFiles.push(filePath);
            console.log(`Downloaded ${item.Key} to ${filePath}`);
        }
    } catch (error) {
        console.error('Error downloading directory:', error);
        throw error;
    }
    return downloadedFiles;
};

export { downloadDirectory };






