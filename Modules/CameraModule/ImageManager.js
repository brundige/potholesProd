
import MediaManager from './MediaManager.js';
import fs from 'fs';
import path from 'path';

class ImageManager extends MediaManager {
    constructor(imageFiles, coordinatesFile, processingFolder) {
        super(imageFiles, coordinatesFile, processingFolder);
        this.stills = path.join(processingFolder, 'stills');
    }

    saveToDirectory() {
        this.mediaFile.forEach((file, index) => {
            if (!fs.existsSync(this.stills)) {
                fs.mkdirSync(this.stills, { recursive: true });
            }

            fs.writeFileSync(path.join(this.stills, `${index}.png`), file);
            fs.writeFileSync(path.join(this.processingFolder, 'coordinatesFile'), this.coordinatesFile);
        });
    }

    processMedia() {
        return new Promise((resolve) => {
            if (!fs.existsSync(this.stills)) {
                fs.mkdirSync(this.stills, { recursive: true });
            }
            resolve();
        });
    }
}

export default ImageManager;