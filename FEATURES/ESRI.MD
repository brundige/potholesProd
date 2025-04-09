# Documentation for the reverse geolocation feature implementation

## FEATURE NAME : ESRI GEOLOCATOR
### Branch : `ESRI`

## Feature Overview
The purpose of this feature is to implement a reverse geolocation service. 
The initial prototype utilized the Google API for address reverse geolocation. 
The reverse geolocator's primary function is to take coordinates (latitude and longitude) 
and translate them into a street address. This street address provides more semantic 
context when analyzing a large dataset of potholes across the city.

## Current Implementation
The GIS department has developed a custom reverse geocoder specifically for this project. 
This custom solution will replace the Google API used in the prototype, ensuring 
better integration with the city's GIS infrastructure and potentially reducing 
external dependencies.

### Implementation Details

- the geolocation module takes in coordinates (latitude and longitude) 
  and returns a street address.


### First a token is generated (post)

-token request url -> "https://pwgis.chattanooga.gov/portal/sharing/rest/generateToken"
-content-type -> "application/x-www-form-urlencoded"
-username -> PotholeDetection
-password -> CWS_Potholes2025
-referer -> "https://pwgis.chattanooga.gov"
-f -> "json"

### Then the token is used to access the geolocator (get)


geolocator URL -https://pwgis.chattanooga.gov/server/rest/services/Locators/PotholesLocator/GeocodeServer/reverseGeocode
-content-type -> "application/json"
-location -> "latitude,longitude"
-token -> "token"
- f -> "json"


### if the token is expired a new one must be generated 



