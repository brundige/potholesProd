import mongoose from 'mongoose';

const annotationLabelsSchema = new mongoose.Schema({
    label_name: {type: String},
    label_color: {type: String},
    label_index: {type: Number, required: true, unique: true}
});

const annotationLabelsModel = mongoose.model('AnnotationLabels', annotationLabelsSchema);

export default annotationLabelsModel;