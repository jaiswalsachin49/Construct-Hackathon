import axios from 'axios';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const searchPlaces = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const response = await axios.get(NOMINATIM_BASE_URL, {
            params: {
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5,
            },
            headers: {
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });

        return response.data.map(place => ({
            place_id: place.place_id,
            display_name: place.display_name,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon),
            address: place.address
        }));
    } catch (error) {
        console.error('Error searching places:', error);
        return [];
    }
};
