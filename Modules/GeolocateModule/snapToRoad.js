import mongoose from 'mongoose';
import Pothole from "../../schemas/PredictionSchema.js";
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Use the OSRM_URL environment variable
const OSRM_ENDPOINT = process.env.OSRM_URL || 'http://osrm:5000'; // Fallback to default if not set

// Function to snap a single point to the nearest road
async function snapToRoad(lat, lng) {
    const url = `${OSRM_ENDPOINT}/nearest/v1/driving/${lng},${lat}`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === 'Ok' && data.waypoints.length > 0) {
            const snappedPoint = data.waypoints[0].location;
            return {lat: snappedPoint[1], lng: snappedPoint[0]}; // Return snapped coordinates
        } else {
            console.error('Error snapping point:', data.message || 'Unknown error');
            return {lat, lng}; // Return original if snapping fails
        }
    } catch (error) {
        console.error('Error fetching OSRM API:', error.message || error);
        return {lat, lng}; // Return original if API call fails
    }
}

// Function to adjust points in the database
async function adjustDatabasePoints() {
    try {
        const predictions = await Pothole.find();
        console.log(`Found ${predictions.length} predictions to adjust`);

        for (const prediction of predictions) {
            const [lng, lat] = prediction.geometry.coordinates;

            // Snap the point to the nearest road
            const snappedPoint = await snapToRoad(lat, lng);

            // Update the database with the snapped coordinates
            prediction.geometry.coordinates = [snappedPoint.lng, snappedPoint.lat];
            await prediction.save();

            console.log(`Updated prediction: ${prediction._id}`);
        }

        console.log('All points adjusted successfully.');
    } catch (error) {
        console.error('Error adjusting database points:', error.message || error);
        throw error;
    }
}

export {adjustDatabasePoints};