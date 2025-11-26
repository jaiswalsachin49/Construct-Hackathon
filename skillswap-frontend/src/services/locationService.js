import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/locations';

export const searchPlaces = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: {
                q: query
            }
        });

        return response.data.map(place => ({
            place_id: place.place_id,
            display_name: place.display_name,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            lon: parseFloat(place.lon), // Include lon for compatibility
            address: place.address
        }));
    } catch (error) {
        console.error('Error searching places:', error);
        return [];
    }
};
