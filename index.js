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
import * as https from "node:https";
import fs from 'fs'; // Added missing fs import

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
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

// Error handling middleware (should be after routes)
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// SSL options
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'private.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'certificate.crt'))
};

// Create HTTP server
const httpServer = http.createServer(app);

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

// Start both servers
httpServer.listen(port, () => {
  console.log(`HTTP server running on port ${port} (for redirection to HTTPS)`);
});

httpsServer.listen(443, () => {
  console.log('HTTPS server running on port 443');
});