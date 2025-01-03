import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Pothole from "../../schemas/PredictionSchema.js";


// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB:', err);
    });


// drop all collections in the database
export const deleteMongoPredictions = async () => {
    try {
        await Pothole.deleteMany({});
    } catch (err) {
        console.error('Error dropping collections:', err);
    }
};

export default mongoose;