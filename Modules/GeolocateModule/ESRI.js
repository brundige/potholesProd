class EsriGeolocator {
    constructor() {
        this.token = null;
        this.tokenExpiration = null;
        this.tokenUrl = "https://pwgis.chattanooga.gov/portal/sharing/rest/generateToken";
        this.geolocatorUrl = "https://pwgis.chattanooga.gov/server/rest/services/Locators/PotholesLocator/GeocodeServer/reverseGeocode";
        this.username = "PotholeDetection";
        this.password = "CWS_Potholes2025";
        this.referer = "https://pwgis.chattanooga.gov";
    }

    async generateToken() {
        try {
            const params = new URLSearchParams();
            params.append("username", this.username);
            params.append("password", this.password);
            params.append("referer", this.referer);
            params.append("f", "json");

            const response = await fetch(this.tokenUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(`Error generating token: ${data.error.message}`);
            }

            this.token = data.token;
            this.tokenExpiration = Date.now() + data.expires * 1000; // Convert expiration to timestamp
        } catch (error) {
            console.error("Error generating token:", error);
            throw error;
        }
    }

    async getToken() {
        if (!this.token || Date.now() >= this.tokenExpiration) {
            await this.generateToken();
        }
        return this.token;
    }

    matchCoordinates(imageIndex, coordinatesFile) {
        return coordinatesFile[parseInt(imageIndex, 10) - 1];
    }

    async reverseGeocode(lat, lng) {
        try {
            const token = await this.getToken();
            const params = new URLSearchParams();
            params.append("location", `${lng},${lat}`);
            params.append("token", token);
            params.append("f", "json");

            const response = await fetch(`${this.geolocatorUrl}?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(`Error during reverse geocoding: ${data.error.message}`);
            }

            return data.address || "Unknown";
        } catch (error) {
            console.error("Error during reverse geocoding:", error);
            return "Unknown";
        }
    }
}



export default EsriGeolocator;