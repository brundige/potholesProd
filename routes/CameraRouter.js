import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import sharp from 'sharp';
import exifParser from 'exif-parser';
import icc from 'icc';
import os from 'os';
import fs from 'fs';
import APIManager from '../Modules/APIModule/APIManager.js';
import { deleteMongoPredictions } from '../Modules/DatabaseModule/MongoDBinterface.js';


const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
}).fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'coordinates', maxCount: 1 },
  { name: 'intervalMs', maxCount: 1 },
]);

const imageUpload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
}).fields([
  { name: 'imageFiles', maxCount: 100000 },
]);

// Custom error handler for multer
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.error(`Unexpected field: ${err.field}`);
      return res.status(400).send(`Unexpected field: ${err.field}`);
    }
  }
  next(err);
};

const displayVideo = (videoFile) => {
  const args = [videoFile];
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['Modules/CameraModule/display.py', ...args], {
      stdio: 'inherit', // This will inherit the stdio streams from the parent process
    });
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
};

router.post('/uploadVideo', upload, multerErrorHandler, async (req, res) => {
  try {
    const { coordinates, intervalMs } = req.body;
    const videoFile = req.files.videoFile[0].buffer;

    console.log('Received video file:', videoFile);

    // Write video buffer to a temporary file
    const tempVideoPath = path.join(os.tmpdir(), 'temp_video.mov');
    fs.writeFileSync(tempVideoPath, videoFile);

    if (!videoFile || !coordinates || !intervalMs) {
      return res.status(400).send('Missing required fields');
    }

    // This section of code wipes MongoDB and S3 on each upload, this eliminates duplicates in testing.
    // This must be turned off in production.
    // todo: Turn off in production
    await deleteMongoPredictions();
    // await deleteAllFilesFromBucket(process.env.AWS_BUCKET_NAME);
    // End of wipe code

    // This is a temporary display of the video file to ensure it is being processed correctly, it can be disabled for faster processing
    // await displayVideo(tempVideoPath);

    const apiManager = new APIManager('video', videoFile, coordinates, intervalMs);
    await apiManager.orchestrateInference();

    return res.status(200).send('Video uploaded successfully, processing started, this might take a while');
  } catch (error) {
    console.error('Error during video processing:', error);
    return res.status(500).send('Internal Server Error');
  }
});

router.post('/uploadImages', imageUpload, multerErrorHandler, async (req, res) => {
  try {
    const { imageFiles } = req.files;

    if (!imageFiles) {
      return res.status(400).send('No image files uploaded');
    }

    for (const file of imageFiles) {
      const metadata = await sharp(file.buffer).metadata();
      const exifData = exifParser.create(file.buffer).parse();
      const iccProfile = metadata.icc ? icc.parse(metadata.icc) : null;

      console.log('Image metadata:', metadata);
      console.log('EXIF data:', exifData);
      console.log('ICC profile:', iccProfile);
    }

    // todo: create coordinates file for images ... note to self: in the future write why this is needed so i can remeber why i did this
    const coordinates = JSON.stringify([]); // Empty array for now

    const apiManager = new APIManager('image', imageFiles, coordinates);
    await apiManager.orchestrateInference();

    return res.status(200).send('Image(s) uploaded successfully, processing started...this might take a while');
  } catch (error) {
    console.error('Error during image processing:', error);
    return res.status(500).send('Internal Server Error');
  }
});

export default router;