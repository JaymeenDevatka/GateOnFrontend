import { useState, useEffect, useRef } from 'react';
import { useGoogleMaps } from '../context/GoogleMapsContext';

const IMAGE_CACHE = new Map();

export function usePlaceImage(query) {
    const { isLoaded } = useGoogleMaps();
    const [imageUrl, setImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const serviceRef = useRef(null);

    useEffect(() => {
        if (!query) {
            setLoading(false);
            return;
        }

        // Check cache first
        if (IMAGE_CACHE.has(query)) {
            setImageUrl(IMAGE_CACHE.get(query));
            setLoading(false);
            return;
        }

        if (!isLoaded || !window.google?.maps?.places) {
            return;
        }

        if (!serviceRef.current) {
            // Create a dummy div for attribution
            const attributionDiv = document.createElement('div');
            serviceRef.current = new window.google.maps.places.PlacesService(attributionDiv);
        }

        const request = {
            query: query,
            fields: ['photos'],
        };

        setLoading(true);
        serviceRef.current.findPlaceFromQuery(request, (results, status) => {
            if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                results &&
                results.length > 0 &&
                results[0].photos &&
                results[0].photos.length > 0
            ) {
                // Get the first photo
                const photoUrl = results[0].photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
                setImageUrl(photoUrl);
                IMAGE_CACHE.set(query, photoUrl);
            } else {
                // No results or no photos
                setImageUrl(null);
                // We could cache nulls to avoid refetching bad queries, but let's assume retry might be wanted
            }
            setLoading(false);
        });
    }, [query, isLoaded]);

    return { imageUrl, loading };
}
