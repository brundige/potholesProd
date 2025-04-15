import express from 'express';
import path from 'path';
import Pothole from '../schemas/PredictionSchema.js';
import os from "os";

import {downloadDirectory} from "../Modules/DatabaseModule/AWSInterface.js";


const router = express.Router();
const __dirname = path.resolve();

const validOutcomes = ['false_positive', 'true_positive', 'false_negative', 'true_negative', 'unknown'];
//const confidenceOptions = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
//const labels=  ['curb', 'dash', 'distressed', 'grate', 'manhole', 'marking', 'pothole', 'utility']


/*
router.get('/potholeImage/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;

    if (!fileName) {
      return res.status(400).json({ message: 'File name is required' });
    }

    const imageStream = await getFileFromBucket(fileName);

    if (!imageStream) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.setHeader('Content-Type', 'image/png');
    imageStream.pipe(res);

    imageStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(500).send('Error while streaming the image');
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ message: error.message });
  }
});*/
export function getLabelNameByClassID(index, labels) {
  const label = labels.find((lbl) => lbl.label_index === index);
  return label ? label.label_name : 'Unknown Label';
}

router.post('/updateAnnotation', async (req, res) => {
  try {
    const { potholeId, annotations } = req.body;

    if (!potholeId || !annotations) {
      return res.status(400).json({ message: 'Fields missing' });
    }

    const pothole = await Pothole.findById(potholeId);

    if (!pothole) {
      return res.status(404).json({ message: 'Pothole not found' });
    }

    pothole.annotation_data = annotations.map((annotation) => ({
      label_id: annotation.label_id,
      x_center: annotation.x_center,
      y_center: annotation.y_center,
      width: annotation.width,
      height: annotation.height,
    }));

    await pothole.save();

    res.json({ message: 'Annotation updated', pothole });
  } catch (error) {
    console.error('Error updating annotation:', error);
    res.status(500).json({ message: error.message });
  }
});

router.post('/updatePredictionOutcome/:potholeId/:predictionId', async (req, res) => {
  try {
    const { potholeId, predictionId } = req.params;
    const { outcome } = req.body;

    if (!predictionId || !outcome) {
      return res.status(400).json({ message: 'Prediction ID and outcome are required.' });
    }

    if (!validOutcomes.includes(outcome)) {
      return res.status(400).json({ message: `Invalid outcome value. Allowed values are: ${validOutcomes.join(', ')}` });
    }

    const pothole = await Pothole.findOneAndUpdate(
      { _id: potholeId, 'prediction_results._id': predictionId },
      { $set: { 'prediction_results.$.outcome': outcome } },
      { new: true },
    );

    if (!pothole) {
      return res.status(404).json({ message: 'Prediction not found.' });
    }

    res.json({ message: 'Prediction outcome updated successfully.', pothole });
  } catch (error) {
    console.error('Error updating prediction outcome:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

router.get('/labels', async (req, res) => {
  try {
    const allLabels = await annotationLabelsModel.find();
    res.json(allLabels);
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/map', (req, res) => {
  res.render('map');
});

router.get('/potholes', async (req, res) => {
  try {
    const potholes = await Pothole.find();
    res.json(potholes);
  } catch (error) {
    console.error('Error fetching potholes:', error);
    res.status(500).json({ message: error.message });
  }
});

// New CSV export endpoint
router.get('/potholes/csv', async (req, res) => {
  try {
    const potholes = await Pothole.find();

    // Create CSV header based on your data structure
    let csv = 'id,latitude,longitude,confidence,timestamp,address\n';

    // Add each pothole as a row in the CSV
    potholes.forEach(pothole => {
      const [lng, lat] = pothole.geometry.coordinates;
      csv += `${pothole._id},${lat},${lng},${pothole.properties.confidence || ''},${pothole.properties.timestamp || ''},${(pothole.properties.address || '').replace(/,/g, ' ')}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=potholes.csv');

    // Send CSV data
    res.send(csv);
  } catch (error) {
    console.error('Error generating CSV:', error);
    res.status(500).send('Error generating CSV');
  }
});


router.get('/potholes/:id', async (req, res) => {
  try {
    const pothole = await Pothole.findById(req.params.id);
    if (!pothole) {
      return res.status(404).json({ message: 'Pothole not found' });
    }
    res.json(pothole);
  } catch (error) {
    console.error('Error fetching pothole:', error);
    res.status(500).json({ message: error.message });
  }
});



// Your existing routes...


router.get('/potholes/street/:streetName', async (req, res) => {
  try {
    const { streetName } = req.params;
    const potholes = await Pothole.find({ street_name: streetName });
    res.json(potholes);
  } catch (error) {
    console.error('Error fetching potholes:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'API_documentation.html'));
});

router.get('/download', async (req, res) => {
  const bucketName = process.env.AWS_BUCKET_NAME;
  const directory = "stills";
  const destination = path.join(os.homedir(), 'RawImages');

  try {
    const downloadedFiles = await downloadDirectory(bucketName, directory, destination);
    if (downloadedFiles.length === 0) {
      return res.status(404).send('No files found to download');
    }

    const zipFilePath = path.join(destination, 'downloaded_files.zip');
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw err;
    });

    res.setHeader('Content-Disposition', 'attachment; filename=downloaded_files.zip');
    res.setHeader('Content-Type', 'application/zip');

    archive.pipe(res);

    downloadedFiles.forEach((file) => {
      archive.file(file, { name: path.basename(file) });
    });

    await archive.finalize();
  } catch (error) {
    console.error('Error downloading files:', error);
    return res.status(500).send('Internal Server Error');
  }
});



export default router;