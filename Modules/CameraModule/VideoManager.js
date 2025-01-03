// Modules/MediaModule/VideoManager.js

import MediaManager from './MediaManager.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

// Set the path to ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Class representing a VideoManager.
 * @extends MediaManager
 */
class VideoManager extends MediaManager {
  /**
   * Create a VideoManager.
   * @param {Buffer} videoFile - The video file buffer.
   * @param {Buffer} coordinatesFile - The coordinates file buffer.
   * @param {string} processingFolder - The folder where processing will occur.
   * @param {number} fps - Frames per second for video processing.
   */
  constructor(videoFile, coordinatesFile, processingFolder, fps) {
    super(videoFile, coordinatesFile, processingFolder);
    this.fps = fps;
    this.stills = path.join(processingFolder, 'stills');
  }

  /**
   * Save the video and coordinates files to the processing directory.
   */
  saveToDirectory() {
    if (!fs.existsSync(this.processingFolder)) {
      fs.mkdirSync(this.processingFolder, { recursive: true });
    }
    fs.writeFileSync(path.join(this.processingFolder, 'videoFile.mov'), this.mediaFile);
    fs.writeFileSync(path.join(this.processingFolder, 'coordinatesFile'), this.coordinatesFile);
    fs.writeFileSync(path.join(this.processingFolder, 'fps'), this.fps.toString());
  }

  /**
   * Process the video file to extract still images at the specified frame rate.
   * @return {Promise<void>} A promise that resolves when processing is complete.
   */
  processMedia() {
    return new Promise((resolve, reject) => {
      if (!fs.existsSync(this.stills)) {
        fs.mkdirSync(this.stills);
      }

      const tempVideoPath = path.join(os.tmpdir(), 'temp_video.mov');
      fs.writeFileSync(tempVideoPath, this.mediaFile);

      ffmpeg(tempVideoPath)
        .output(path.join(this.stills, '%d.png'))
        .outputOptions([`-vf fps=${this.fps}`])
        .on('end', () => {
          fs.unlinkSync(tempVideoPath);
          resolve();
        })
        .on('error', (err) => {
          fs.unlinkSync(tempVideoPath);
          reject(err);
        })
        .run();
    });
  }
}

export default VideoManager;