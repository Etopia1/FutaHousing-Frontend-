import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { FiX, FiCheck, FiMapPin, FiTarget, FiSearch, FiNavigation } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface MapPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (location: string, lon: number, lat: number) => void;
    mapboxToken: string;
    initialCoords?: [number, number];
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({ isOpen, onClose, onSelect, mapboxToken, initialCoords }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [locationDetails, setLocationDetails] = useState<{
        neighborhood?: string;
        district?: string;
        region?: string;
    }>({});

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleCoordSelection = useCallback(async (lng: number, lat: number, shouldZoom = false) => {
        if (!map.current) return;

        // Ensure marker exists
        if (!marker.current) {
            marker.current = new mapboxgl.Marker({ color: '#6366f1' })
                .setLngLat([lng, lat])
                .addTo(map.current);
        } else {
            marker.current.setLngLat([lng, lat]);
        }

        setSelectedCoords([lng, lat]);
        setIsReverseGeocoding(true);

        if (shouldZoom) {
            map.current.flyTo({ center: [lng, lat], zoom: 16 });
        }

        try {
            // Added types=address,poi,neighborhood,locality to get more specific results
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}&types=address,poi,neighborhood,locality,place`);
            const data = await res.json();

            if (data.features && data.features.length > 0) {
                const bestMatch = data.features[0];
                setSelectedAddress(bestMatch.place_name);

                // Extract finer details from context
                const details: any = {};
                bestMatch.context?.forEach((ctx: any) => {
                    if (ctx.id.startsWith('neighborhood')) details.neighborhood = ctx.text;
                    if (ctx.id.startsWith('district')) details.district = ctx.text;
                    if (ctx.id.startsWith('region')) details.region = ctx.text;
                });

                // If the feature itself is a neighborhood or locality, use its text
                if (bestMatch.id.startsWith('neighborhood')) details.neighborhood = bestMatch.text;

                setLocationDetails(details);
            } else {
                setSelectedAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                setLocationDetails({});
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            toast.error('Failed to resolve address');
        } finally {
            setIsReverseGeocoding(false);
        }
    }, [mapboxToken]);

    // Use a ref to track the last used initial coords to prevent re-init loops
    const lastInitialCoords = useRef<string>('');

    useEffect(() => {
        if (!isOpen || !mapContainer.current) return;

        const currentCoordsStr = JSON.stringify(initialCoords);

        // Only re-initialize if the coordinates actually CHANGED or if map isn't created yet
        if (map.current && currentCoordsStr === lastInitialCoords.current) {
            console.log('[Mapbox Debug] Preserving existing map (coords unchanged)');
            return;
        }

        lastInitialCoords.current = currentCoordsStr;

        console.log('[Mapbox Debug] Initializing map with token:', mapboxToken.substring(0, 10) + '...');
        mapboxgl.accessToken = mapboxToken;

        const defaultCoords: [number, number] = initialCoords || [5.1476, 7.2995];

        try {
            if (map.current) {
                map.current.remove();
            }

            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: defaultCoords,
                zoom: 14,
                trackResize: true,
                preserveDrawingBuffer: true
            });

            map.current.on('load', () => {
                console.log('[Mapbox Debug] Map Load Event Fired');
                map.current?.resize();
            });

            map.current.on('error', (e) => {
                console.error('[Mapbox Debug] Internal Error:', e);
            });

            [100, 500, 1000].forEach(delay => {
                setTimeout(() => {
                    if (map.current) {
                        map.current.resize();
                        console.log(`[Mapbox Debug] Forced Resize at ${delay}ms`);
                    }
                }, delay);
            });

            if (initialCoords) {
                if (!marker.current) {
                    marker.current = new mapboxgl.Marker({ color: '#6366f1' })
                        .setLngLat(initialCoords)
                        .addTo(map.current);
                } else {
                    marker.current.setLngLat(initialCoords);
                }
                setSelectedCoords(initialCoords);
                handleCoordSelection(initialCoords[0], initialCoords[1]);
            }

            map.current.on('click', (e) => {
                const { lng, lat } = e.lngLat;
                handleCoordSelection(lng, lat);
            });

            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        } catch (err) {
            console.error('[Mapbox Debug] Initialization Catch:', err);
            toast.error('Map failed to load. Check console for details.');
        }

        return () => {
            // Only remove on unmount of the modal itself, not on every prop change
            // But we handle cleaning up in the try block if we need a fresh start
        };
    }, [isOpen, initialCoords, mapboxToken, handleCoordSelection]);

    // Separate cleanup for when the modal closes
    useEffect(() => {
        if (!isOpen && map.current) {
            console.log('[Mapbox Debug] Cleaning up on close');
            try {
                map.current.remove();
            } catch (e) { }
            map.current = null;
            marker.current = null;
            lastInitialCoords.current = '';
        }
    }, [isOpen]);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=5`);
            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser');
            return;
        }

        toast.info('Getting your current location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                handleCoordSelection(longitude, latitude, true);
                toast.success('Found you!');
            },
            (err) => {
                console.error('Geolocation error:', err);
                toast.error('Failed to get location. Please ensure location access is enabled.');
            },
            { enableHighAccuracy: true }
        );
    };

    const handleCancelSelection = () => {
        if (marker.current) {
            marker.current.remove();
            marker.current = null;
        }
        setSelectedCoords(null);
        setSelectedAddress('');
        setSearchQuery('');
        setSuggestions([]);
    };

    const handleConfirm = () => {
        if (selectedCoords && selectedAddress) {
            onSelect(selectedAddress, selectedCoords[0], selectedCoords[1]);
            onClose();
        } else {
            toast.warning('Please select a location on the map first.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full lg:max-w-6xl bg-[#0f172a] lg:rounded-[3rem] shadow-2xl overflow-visible border border-white/10 flex flex-col h-full lg:h-[90vh]">
                {/* Header with Search */}
                <div className="p-4 lg:p-6 border-b border-white/5 bg-slate-900/50 backdrop-blur-md shrink-0 z-[70] lg:rounded-t-[3rem]">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">Pin Your Location</h3>
                                <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-0.5">Search or click the map</p>
                            </div>
                            <button onClick={onClose} className="lg:hidden w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                                <FiX size={18} />
                            </button>
                        </div>

                        <div className="flex-1 lg:max-w-md relative">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-violet-500 transition-colors">
                                    <FiSearch size={16} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Search location..."
                                    className="w-full h-11 bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 text-sm font-bold text-white focus:bg-white/[0.05] focus:border-violet-500 outline-none transition-all"
                                />
                                {isSearching && (
                                    <div className="absolute right-3 top-3">
                                        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>

                            {/* Search Suggestions */}
                            {suggestions.length > 0 && (
                                <div className="absolute z-[80] mt-1 w-full bg-[#1c2231] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-3xl ring-1 ring-white/10">
                                    {suggestions.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                handleCoordSelection(item.center[0], item.center[1], true);
                                                setSuggestions([]);
                                                setSearchQuery(item.text);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 flex items-center gap-3"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 shrink-0">
                                                <FiMapPin size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-bold text-white truncate">{item.text}</p>
                                                <p className="text-[9px] text-white/40 line-clamp-1 truncate">{item.place_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button onClick={onClose} className="hidden lg:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Map Area - THE CORE CANVAS */}
                <div className="relative flex-1 bg-slate-900 border-y border-white/5 z-[10] overflow-hidden">
                    <div
                        ref={mapContainer}
                        className="absolute inset-0 bg-[#0f172a]"
                        style={{ height: '100%', width: '100%' }}
                    />

                    {/* Controls Overlay (Minimalist) */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 z-[100]">
                        <button
                            onClick={handleGetLocation}
                            className="w-10 h-10 bg-white text-slate-950 rounded-xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                        >
                            <FiNavigation size={18} />
                        </button>
                    </div>

                    {!selectedAddress && (
                        <div className="absolute inset-x-0 bottom-10 flex justify-center pointer-events-none z-50">
                            <div className="bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                                <p className="text-[8px] lg:text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-2">
                                    <FiTarget size={14} className="animate-pulse text-violet-500" /> Tap anywhere to pin
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Selection Footer - NOW OFF THE MAP */}
                <div className="p-4 lg:p-6 bg-slate-950/80 border-t border-white/5 backdrop-blur-3xl z-50 shrink-0 lg:rounded-b-[3rem]">
                    {selectedAddress ? (
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4 w-full lg:w-auto min-w-0">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/10">
                                    <FiMapPin size={22} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Selected Location</p>
                                    <p className="text-xs lg:text-sm font-bold text-white truncate leading-tight">{selectedAddress}</p>
                                    <div className="flex gap-4 mt-1.5 font-mono text-[9px] text-white/20">
                                        <span>LNG: {selectedCoords?.[0].toFixed(6)}</span>
                                        <span>LAT: {selectedCoords?.[1].toFixed(6)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full lg:w-auto">
                                <button
                                    onClick={handleCancelSelection}
                                    className="flex-1 lg:flex-none h-11 lg:h-12 px-6 bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    className="flex-1 lg:flex-none h-11 lg:h-12 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <FiCheck size={16} /> Confirm Selection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-4">
                            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">No location pinned yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MapPickerModal;
