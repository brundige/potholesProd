// Modules/APIModule/APIManager.js

import { spawn } from 'child_process';
import fs from 'fs';
import VideoManager from '../CameraModule/VideoManager.js';
import GeoLocateClass from '../GeolocateModule/GeoLocateClass.js';
import Prediction from '../../schemas/PredictionSchema.js';
import { getLabelNameByClassID } from '../../routes/DashboardRouter.js';
import ImageManager from '../CameraModule/ImageManager.js';
import annotationLabelsModel from "../../schemas/annotationLabelsSchema.js";

/**
 * Class representing an APIManager.
 */
class APIManager {
  /**
   * Create an APIManager.
   * @param {string} mediaType - The type of media ('video' or 'image').
   * @param {Buffer} mediaFile - The media file buffer.
   * @param {string} coordinatesFile - The coordinates file buffer.
   * @param {number} [intervalMs] - Interval in milliseconds for video processing.
   */
  constructor(mediaType, mediaFile, coordinatesFile, intervalMs) {
    this.processingFolder = new Date().getTime().toString();
    this.mediaManager = mediaType === 'video'
      ? new VideoManager(mediaFile, coordinatesFile, this.processingFolder, intervalMs)
      : new ImageManager(mediaFile, coordinatesFile, this.processingFolder);
    this.scriptPath = 'Modules/MachineLearningModule/ensemble.py';
    this.stills = `${this.processingFolder}/stills`;
    this.predictions = `Modules/MachineLearningModule/predictions/${this.processingFolder}`;
    this.coordinates = JSON.parse(coordinatesFile);
  }

  /**
   * Run the Python script for inference.
   * @return {Promise<void>} A promise that resolves when the script completes.
   */
  runPythonScript() {
    const args = [this.stills, this.predictions];
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [this.scriptPath, ...args], {
        stdio: 'inherit' // This will inherit the stdio streams from the parent process
      });
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(`Python script exited with code ${code}`);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Create initial prediction documents in MongoDB.
   * @return {Promise<void>} A promise that resolves when documents are created.
   */
  async createInitialPredictionDocuments() {
    const locator = new GeoLocateClass();
    const files = fs.readdirSync(this.stills);

    for (const file of files) {
      const fileIndex = file.substring(0, file.indexOf('.'));
      const coord = locator.matchCoordinates(fileIndex, this.coordinates);

      if (!coord || !coord.lat || !coord.lng) {
        console.warn(`No coordinates found for file index: ${fileIndex}`);
        continue; // Skip this iteration if coordinates are not found
      }

      const address = await locator.reverseGeocode(coord.lat, coord.lng);

      const prediction = new Prediction({
        file_name: `${this.processingFolder}_${fileIndex}.png`,
        prediction_results: [], // Empty array for predictions
        annotation_data: [],    // Empty array for annotations
        coordinates: coord,
        address: address,
        image_uri: `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/stills/${this.processingFolder}_${file}`
      });

      await prediction.save();
      console.log(`Initial Prediction document created for: ${prediction.file_name}`);
    }
  }

  /**
   * Save predictions to MongoDB.
   * @return {Promise<void>} A promise that resolves when predictions are saved.
   */
  async savePredictionsToMongo() {
    const all_labels = await annotationLabelsModel.find();
    const outputFolder = `${this.predictions}/base/predict/labels`;
    const files = fs.readdirSync(outputFolder);

    for (const file of files) {
      const filePath = `${outputFolder}/${file}`;
      const data = fs.readFileSync(filePath, 'utf8').split('\n');
      const fileIndex = file.substring(0, file.indexOf('.'));

      // Array to store prediction results for this image
      const predictionResults = [];

      for (const line of data) {
        if (line.trim() === '') continue;
        const values = line.split(' ');

        const class_id = parseInt(values[0].trim());

        const predictionResult = {
          label_id: getLabelNameByClassID(class_id, all_labels),
          x_center: parseFloat(values[1]),
          y_center: parseFloat(values[2]),
          width: parseFloat(values[3]),
          height: parseFloat(values[4]),
          confidence: parseFloat(values[5]),
          outcome: 'unknown'
        };

        predictionResults.push(predictionResult);
      }

      // Find the existing Prediction document and update
      const updatedPrediction = await Prediction.findOneAndUpdate(
        { file_name: `${this.processingFolder}_${fileIndex}.png` }, // Find by file_name
        { prediction_results: predictionResults }, // Update prediction_results
        { new: true } // Return the updated document
      );

      if (updatedPrediction) {
        console.log(`Predictions added to Prediction: ${updatedPrediction.file_name}`);
      } else {
        console.warn(`No Prediction found for file: ${this.processingFolder}_${fileIndex}.png`);
      }
    }
  }

  /**
   * Orchestrate the inference process.
   * @return {Promise<void>} A promise that resolves when the process is complete.
   */
  async orchestrateInference() {




    try {
      await this.mediaManager.saveToDirectory();
     // await this.mediaManager.processMedia();
      await this.createInitialPredictionDocuments();
      await this.runPythonScript();
      await this.savePredictionsToMongo();
      fs.rmdirSync(`${this.processingFolder}`, { recursive: true });
      fs.rmdirSync(this.predictions, { recursive: true });
    } catch (error) {
      console.error('Error during orchestrateInference:', error);
    }
  }
}

export default APIManager;