
import axios from 'axios';

class GeoLocateClass {
    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY;
    }

    matchCoordinates(imageIndex, coordinatesFile) {
        return coordinatesFile[parseInt(imageIndex, 10) - 1];
    }

    async reverseGeocode(lat, lng) {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    latlng: `${lat},${lng}`,
                    key: this.apiKey,
                },
            });
            const { results } = response.data;
            return results.length > 0 ? results[0].formatted_address : 'Unknown';
        } catch (error) {
            console.error('Error during reverse geocoding:', error);
            return 'Unknown';
        }
    }
}

export default GeoLocateClass;


