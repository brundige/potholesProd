# Pothole Detection v. 1.0
###### Author: Chris Brundige | city of chattanooga Copyright 2024


## Description

This application Part one of a Two Part production-ready pothole detection system. It uses Yolo v11 to detect potholes in images and
videos.Part one injests videos and images, identifies potholes and other features of interest, and stores the images and videos in a database.

Part two is an android application that captures the roadway and sends the images to the server for processing. The server will then return the images with the potholes identified.



## Service Requirements

### GIS for Reverse Geocoding of Addresses
### AWS or Cloud Storage for Image Storage

#### Update the .env File

```
# MongoDB URI
MONGO_URI=mongodb://localhost:27017/{your_mongo_db_name}
# GOOGLE GEOLOCATOR API KEY
GOOGLE_API_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
# AWS BUCKET
AWS_BUCKET_NAME="{your_bucket_name}"}
# AWS ACCESS
AWS_USERNAME=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_ACCESS_KEY=XXXXXXXXXXXXXXXXX
AWS_SECRET_KEY=XXXXXXXXXXXXXXXXX
# AWS REGION
AWS_REGION="us-east-1" // use your region
# AWS ENDPOINT
AWS_ENDPOINT="https://s3.amazonaws.com"  // current as of 1.6.24
INFERENCE_MODEL={your_model_name}.pt  // *** Feature not yet implemented ***
```

## Hardware Requirements:

The application will run  with a CPU or GPU. The GPU is *highly* recommended for faster processing.
This application was built using a NVIDIA RTX 4090 GPU.

## Download and Installation

## Downloading the Source Code

To download the source code for this project, you need to have Git installed on your system. Follow the instructions on the [official Git website](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) to install Git.

Once Git is installed, you can clone the repository using the following command:

```bash
git clone https://github.com/your-username/your-repository.git
 ``` 




## Download Docker and Docker Compose

To run this application, you need to have Docker and Docker Compose installed on your system.

### Installing Docker

Follow the instructions on the [official Docker website](https://docs.docker.com/get-docker/) to install Docker for your
operating system.

### Installing Docker Compose

Follow the instructions on the [official Docker Compose website](https://docs.docker.com/compose/install/) to install
Docker Compose.

Alternatively, you can use the following commands to install Docker Compose on a Unix-based system:

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Verify Installation

```bash
docker-compose --version
```

## Running the Application

To run the application, you need to navigate to the root directory of the project and run the following command:

```bash
docker-compose up --build -d 
```


