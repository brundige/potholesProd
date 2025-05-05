import EsriGeolocator from './ESRI.js';

async function testEsriGeolocator() {
    const geolocator = new EsriGeolocator();

    try {
        // Test token generation
        console.log("Testing token generation...");
        const token = await geolocator.getToken();
        console.log("Token generated successfully:", token ? "PASSED" : "FAILED");

        // Test reverse geocoding
        console.log("Testing reverse geocoding...");
        const lat = 35.0456; // Example latitude
        const lng = -85.3097; // Example longitude
        const address = await geolocator.reverseGeocode(lat, lng);
        console.log("Reverse geocoding result:", address);

        if (address !== "Unknown") {
            console.log("Reverse geocoding test: PASSED");
        } else {
            console.log("Reverse geocoding test: FAILED");
        }

        // Test matching coordinates
        console.log("Testing coordinate matching...");
        const coordinatesFile = [
            { lat: 35.0456, lng: -85.3097 },
            { lat: 36.1627, lng: -86.7816 },
        ];
        const matchedCoordinates = geolocator.matchCoordinates(1, coordinatesFile);
        console.log("Matched Coordinates:", matchedCoordinates);

        if (matchedCoordinates.lat === 35.0456 && matchedCoordinates.lng === -85.3097) {
            console.log("Coordinate matching test: PASSED");
        } else {
            console.log("Coordinate matching test: FAILED");
        }
    } catch (error) {
        console.error("Test failed with error:", error);
    }
}

testEsriGeolocator();