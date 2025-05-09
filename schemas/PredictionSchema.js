import mongoose from 'mongoose';

const PredictionSchema = new mongoose.Schema({
    type: {type: String, default: "Feature"},
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    properties: {
        file_name: {type: String, required: true},
        prediction_results: [
            {
                label_id: {type: String, required: true}, // label _id
                x_center: {type: Number},
                y_center: {type: Number},
                width: {type: Number},
                height: {type: Number},
                confidence: {type: Number, required: true},
                outcome: {
                    type: String,
                    enum: ['false_positive', 'true_positive', 'false_negative', 'true_negative', 'unknown'],
                    default: 'unknown'
                }
            }
        ],
        annotation_data: [
            {
                label_id: {type: String, required: true}, // label _id
                x_center: {type: Number},
                y_center: {type: Number},
                width: {type: Number},
                height: {type: Number}
            }
        ],
        address: {type: String, required: true},
        image_uri: {type: String, required: true}
    },
    created_at: {type: Date, default: Date.now}
});

const Pothole = mongoose.model('Prediction', PredictionSchema, 'Prediction');

export default Pothole;