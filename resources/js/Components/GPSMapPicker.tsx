import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search } from 'lucide-react';
import { toast } from 'sonner';

interface GPSMapPickerProps {
    initialLocation?: string;
    onSave: (coords: string) => void;
    onClose?: () => void;
}

export default function GPSMapPicker({ initialLocation, onSave, onClose }: GPSMapPickerProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (initialLocation && initialLocation.includes(',')) {
            const [latVal, lngVal] = initialLocation.split(',');
            setLat(latVal.trim());
            setLng(lngVal.trim());
        }
    }, [initialLocation]);

    useEffect(() => {
        if (!mapRef.current) return;

        const latNum = parseFloat(lat) || 5.6037;
        const lngNum = parseFloat(lng) || -0.1870;

        if (mapInstance.current) {
            mapInstance.current.setView([latNum, lngNum], 13);
            updateMarker(latNum, lngNum);
            return;
        }

        const map = L.map(mapRef.current).setView([latNum, lngNum], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        map.on('click', handleMapClick);
        mapInstance.current = map;

        if (lat && lng) {
            updateMarker(latNum, lngNum);
        }

        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    const updateMarker = (lat: number, lng: number) => {
        if (!mapInstance.current) return;

        if (markerRef.current) {
            mapInstance.current.removeLayer(markerRef.current);
        }

        const marker = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);
        marker.on('dragend', (e) => {
            const { lat, lng } = e.target.getLatLng();
            setLat(lat.toFixed(6));
            setLng(lng.toFixed(6));
        });
        markerRef.current = marker;
    };

    const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setLat(lat.toFixed(6));
        setLng(lng.toFixed(6));
        updateMarker(lat, lng);
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLat(latitude.toFixed(6));
                setLng(longitude.toFixed(6));
                if (mapInstance.current) {
                    mapInstance.current.setView([latitude, longitude], 15);
                }
                updateMarker(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                toast.error('Unable to get your location. Using default location.');
            }
        );
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const results = await response.json();

            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                const latNum = parseFloat(lat);
                const lngNum = parseFloat(lon);
                setLat(latNum.toFixed(6));
                setLng(lngNum.toFixed(6));
                if (mapInstance.current) {
                    mapInstance.current.setView([latNum, lngNum], 15);
                }
                updateMarker(latNum, lngNum);
            } else {
                toast.error('Location not found. Try a different search term.');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Error searching for location. Please try again.');
        }
    };

    const handleSave = () => {
        if (!lat || !lng) {
            toast.error('Please select a location on the map first.');
            return;
        }
        onSave(`${lat},${lng}`);
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                        placeholder="Search location..."
                        className="glass-input w-full pl-10"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSearch}
                    className="glass-button px-4"
                >
                    Search
                </button>
            </div>

            {/* Use My Location */}
            <button
                type="button"
                onClick={handleUseMyLocation}
                className="glass-button-secondary flex items-center gap-2 text-sm"
            >
                <Navigation className="w-4 h-4" />
                Use My Location
            </button>

            {/* Map */}
            <div ref={mapRef} className="w-full h-96 md:h-[55vh] rounded-xl overflow-hidden border border-slate-200" />

            {/* Lat/Lng Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Latitude</label>
                    <input
                        type="text"
                        value={lat}
                        onChange={(e) => {
                            setLat(e.target.value);
                            const latNum = parseFloat(e.target.value);
                            const lngNum = parseFloat(lng);
                            if (!isNaN(latNum) && !isNaN(lngNum) && mapInstance.current) {
                                mapInstance.current.setView([latNum, lngNum], 15);
                                updateMarker(latNum, lngNum);
                            }
                        }}
                        placeholder="Latitude"
                        className="glass-input w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Longitude</label>
                    <input
                        type="text"
                        value={lng}
                        onChange={(e) => {
                            setLng(e.target.value);
                            const latNum = parseFloat(lat);
                            const lngNum = parseFloat(e.target.value);
                            if (!isNaN(latNum) && !isNaN(lngNum) && mapInstance.current) {
                                mapInstance.current.setView([latNum, lngNum], 15);
                                updateMarker(latNum, lngNum);
                            }
                        }}
                        placeholder="Longitude"
                        className="glass-input w-full"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 glass-button-secondary"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSave}
                    className="flex-1 glass-button flex items-center justify-center gap-2"
                >
                    <MapPin className="w-4 h-4" />
                    Save Location
                </button>
            </div>
        </div>
    );
}
