// Modules/MediaModule/MediaManager.js
class MediaManager {
    constructor(mediaFile, coordinatesFile, processingFolder) {
        this.mediaFile = mediaFile;
        this.coordinatesFile = coordinatesFile;
        this.processingFolder = processingFolder;
    }

    saveToDirectory() {
        throw new Error('saveToDirectory method must be implemented by subclass');
    }

    processMedia() {
        throw new Error('processMedia method must be implemented by subclass');
    }
}

export default MediaManager;