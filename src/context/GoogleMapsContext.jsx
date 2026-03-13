import { createContext, useContext, useState, useEffect } from 'react';

const GoogleMapsContext = createContext(null);

export const useGoogleMaps = () => {
    const context = useContext(GoogleMapsContext);
    if (!context) {
        throw new Error('useGoogleMaps must be used within a GoogleMapsProvider');
    }
    return context;
};

const LIBRARIES = ['places'];

export const GoogleMapsProvider = ({ children }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [loadError, setLoadError] = useState(null);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            setLoadError(new Error('Google Maps API key is missing'));
            return;
        }

        if (window.google?.maps) {
            setIsLoaded(true);
            return;
        }

        const scriptId = 'google-maps-script';
        let script = document.getElementById(scriptId);

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${LIBRARIES.join(',')}`;
            script.async = true;
            script.defer = true;

            script.onload = () => setIsLoaded(true);
            script.onerror = (e) => setLoadError(e);

            document.head.appendChild(script);
        } else {
            if (window.google?.maps) {
                setIsLoaded(true);
            } else {
                script.addEventListener('load', () => setIsLoaded(true));
                script.addEventListener('error', (e) => setLoadError(e));
            }
        }

        return () => {
            // Cleanup if needed (usually we want the script to persist)
        };
    }, []);

    return (
        <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
            {children}
        </GoogleMapsContext.Provider>
    );
};
