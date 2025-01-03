import mongoose from 'mongoose';

const potholeSchema = new mongoose.Schema({
    location: String,
    severity: String,
    reportedAt: Date
});

const Pothole = mongoose.model('Pothole', potholeSchema);

export default Pothole;