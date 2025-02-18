
import MediaManager from './MediaManager.js';
import fs from 'fs';
import path from 'path';

class ImageManager extends MediaManager {
    constructor(imageFiles, coordinatesFile, processingFolder) {
        super(imageFiles, coordinatesFile, processingFolder);
        this.stills = path.join(processingFolder, 'stills');
    }

    saveToDirectory() {
        if (!fs.existsSync(this.processingFolder)) {
            fs.mkdirSync(this.processingFolder, { recursive: true });
        }
        this.mediaFile.forEach((file, index) => {
            console.log(`binary file: ${file}`);
            fs.writeFileSync(path.join(this.stills, `${index}.png`), file);
            fs.writeFileSync(path.join(this.processingFolder, 'coordinatesFile'), this.coordinatesFile);
        });

    }

    processMedia() {
        return new Promise((resolve) => {
            if (!fs.existsSync(this.stills)) {
                fs.mkdirSync(this.stills);
            }
            resolve();
        });
    }
}

export default ImageManager;