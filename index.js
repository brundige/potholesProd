import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import { fileURLToPath } from 'url';
import CameraRouter from './routes/CameraRouter.js';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import DashboardRouter from './routes/DashboardRouter.js';
import './Modules/DatabaseModule/MongoDBinterface.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/test';
//const MONGO_URI = 'mongodb://10.21.6.131:27017'

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));




// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Routes
app.use('/camera', CameraRouter);
app.use('/api', DashboardRouter);
app.get('/', (req, res) => res.render('index', { title: 'Express' }));



// Error handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


// HTTPS redirect middleware
app.use((req, res, next) => {
  if (req.secure) {
    // Request was via https
    next();
  } else {
    // Redirect to https
    res.redirect(`https://${req.headers.host}${req.url}`);
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});