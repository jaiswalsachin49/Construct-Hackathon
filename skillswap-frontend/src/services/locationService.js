import api from './api';

export const searchPlaces = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const response = await api.get('/api/locations/search', {
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

export const reverseGeocode = async (lat, lon) => {
    try {
        const response = await api.get('/api/locations/reverse', {
            params: { lat, lon }
        });
        return response.data;
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        throw error;
    }
};
