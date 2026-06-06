import axios from 'axios';
import config from '../config/env.js';
import { Facility } from '../models/index.js';
import { Op } from 'sequelize';

const SPECIALTIES_POOL = [
    'Cardiology (Heart)', 'Orthopedics (Back & Bones)', 'Neurology (Brain)',
    'Ophthalmology (Eye)', 'Dermatology (Skin)', 'Gastroenterology (Stomach)',
    'Pediatrics (Kids)', 'General Medicine', 'Emergency Medicine', 'Trauma Care',
    'Dentistry', 'Physiotherapy', 'Pharmacy', 'Gynecology', 'Urology'
];

const DOCTORS_POOL = [
    { name: 'Dr. Rajesh Sharma', time: '10:00 AM - 04:00 PM' },
    { name: 'Dr. Priya Mehta', time: '09:00 AM - 01:00 PM' },
    { name: 'Dr. Amit Verma', time: '02:00 PM - 08:00 PM' },
    { name: 'Dr. Sneha Gupta', time: '11:00 AM - 05:00 PM' },
    { name: 'Dr. Vikram Singh', time: '08:00 AM - 12:00 PM' },
    { name: 'Dr. Anil Bose', time: '09:00 AM - 05:00 PM' },
    { name: 'Dr. Kavita Joshi', time: '10:00 AM - 06:00 PM' },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

const formatPlace = async (place, latitude, longitude) => {
    const placeTypes = place.types || [];
    let type = 'clinic';
    if (placeTypes.includes('hospital')) type = 'hospital';
    else if (placeTypes.some(t => t.includes('emergency'))) type = 'emergency';

    const specialties = [...SPECIALTIES_POOL].sort(() => 0.5 - Math.random()).slice(0, 3);
    const doctors = [...DOCTORS_POOL].sort(() => 0.5 - Math.random()).slice(0, 2);

    const data = {
        placeId: place.id,
        name: place.displayName?.text || 'Medical Facility',
        address: place.formattedAddress || 'Local area',
        lat: place.location?.latitude || latitude,
        lng: place.location?.longitude || longitude,
        type,
        rating: place.rating || 4.5,
        isOpen: true,
        emergencyServices: type === 'hospital' || placeTypes.includes('emergency_room'),
        phone: '+91-' + Math.floor(Math.random() * 9000000000 + 1000000000),
        specialties,
        doctors
    };

    const [facility] = await Facility.findOrCreate({
        where: { placeId: data.placeId },
        defaults: data
    });

    const dist = calculateDistance(latitude, longitude, data.lat, data.lng).toFixed(1);
    return {
        id: facility.id.toString(),
        name: data.name,
        address: data.address,
        distance: `${dist} km`,
        phone: data.phone,
        type: data.type,
        rating: data.rating,
        location: { lat: data.lat, lng: data.lng },
        isOpen: data.isOpen,
        emergencyServices: data.emergencyServices,
        specialties: data.specialties,
        doctors: data.doctors
    };
};

const formatOverpassPlace = async (el, latitude, longitude) => {
    const tags = el.tags || {};
    let type = 'clinic';
    if (tags.amenity === 'hospital') type = 'hospital';
    else if (tags.amenity === 'pharmacy') type = 'clinic';
    else if (tags.emergency === 'yes') type = 'emergency';

    const lat = el.lat || (el.center && el.center.lat) || latitude;
    const lng = el.lon || (el.center && el.center.lon) || longitude;

    const name = tags.name || tags['name:en'] || (type === 'hospital' ? 'General Hospital' : 'Medical Clinic');

    // Build address
    const street = tags['addr:street'] || '';
    const housenumber = tags['addr:housenumber'] || '';
    const city = tags['addr:city'] || '';
    const fullAddr = tags['addr:full'] || `${housenumber} ${street} ${city}`.trim() || 'Local Area';

    // Specialties & Doctors (deterministic based on OSM ID seed)
    const seed = parseInt(el.id) || 12345;
    const getDeterministicRandomSlice = (arr, count) => {
        const result = [];
        const pool = [...arr];
        let tempSeed = seed;
        for (let i = 0; i < count; i++) {
            tempSeed = (tempSeed * 9301 + 49297) % 233280;
            const index = Math.floor((tempSeed / 233280) * pool.length);
            result.push(pool.splice(index, 1)[0]);
        }
        return result;
    };

    const specialties = getDeterministicRandomSlice(SPECIALTIES_POOL, 3);
    const doctors = getDeterministicRandomSlice(DOCTORS_POOL, 2);

    // Rating (deterministic between 4.0 and 4.9)
    const ratingSeed = (seed % 10) / 10;
    const rating = parseFloat((4.0 + ratingSeed).toFixed(1));

    const placeId = `osm-${el.id}`;

    const data = {
        placeId,
        name,
        address: fullAddr,
        lat,
        lng,
        type,
        rating,
        isOpen: true,
        emergencyServices: type === 'hospital' || tags.emergency === 'yes',
        phone: tags.phone || tags['contact:phone'] || ('+91-' + (9000000000 + (seed % 1000000000))),
        specialties,
        doctors
    };

    const [facility] = await Facility.findOrCreate({
        where: { placeId: data.placeId },
        defaults: data
    });

    const dist = calculateDistance(latitude, longitude, data.lat, data.lng).toFixed(1);
    return {
        id: facility.id.toString(),
        name: data.name,
        address: data.address,
        distance: `${dist} km`,
        phone: data.phone,
        type: data.type,
        rating: data.rating,
        location: { lat: data.lat, lng: data.lng },
        isOpen: data.isOpen,
        emergencyServices: data.emergencyServices,
        specialties: data.specialties,
        doctors: data.doctors
    };
};

// Multiple Overpass API mirrors for resilience
const OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

const findHospitalsWithOverpass = async (latitude, longitude, radius = 15000) => {
    const query = `[out:json][timeout:20];
(
  nwr["amenity"~"hospital|clinic|doctors|pharmacy"](around:${radius},${latitude},${longitude});
);
out center;`;

    console.log(`🔍 Querying OpenStreetMap Overpass API for facilities near ${latitude}, ${longitude}...`);

    let lastError;
    for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
            const response = await axios.post(
                endpoint,
                `data=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'User-Agent': 'HealthcareAIPortal/1.0 (contact@healthcareai.com)'
                    },
                    timeout: 25000   // 25s per mirror before trying next
                }
            );

            const elements = response.data.elements || [];
            console.log(`📍 Found ${elements.length} elements from ${endpoint}`);

            if (elements.length > 0) {
                const results = [];
                for (const el of elements) {
                    try {
                        const formatted = await formatOverpassPlace(el, latitude, longitude);
                        results.push(formatted);
                    } catch (err) {
                        console.error(`Failed to format Overpass element ${el.id}:`, err.message);
                    }
                }
                return results;
            }
        } catch (err) {
            console.warn(`⚠️ Overpass mirror ${endpoint} failed: ${err.message}`);
            lastError = err;
            // Continue to next mirror
        }
    }

    throw new Error(`All Overpass mirrors failed. Last error: ${lastError?.message}`);
};

export const findNearbyHospitals = async (latitude, longitude, radius = 15000) => {
    try {
        const radiusDeg = radius / 111000;

        // 1. Check local database cache first
        const localFacilities = await Facility.findAll({
            where: {
                lat: { [Op.between]: [latitude - radiusDeg, latitude + radiusDeg] },
                lng: { [Op.between]: [longitude - radiusDeg, longitude + radiusDeg] }
            }
        });

        if (localFacilities.length >= 5) {
            console.log(`✅ Found ${localFacilities.length} facilities in DB cache.`);
            return localFacilities.map(f => {
                const dist = calculateDistance(latitude, longitude, f.lat, f.lng).toFixed(1);
                return {
                    id: f.id.toString(),
                    name: f.name,
                    address: f.address,
                    distance: `${dist} km`,
                    phone: f.phone,
                    type: f.type,
                    rating: f.rating,
                    location: { lat: f.lat, lng: f.lng },
                    isOpen: f.isOpen,
                    emergencyServices: f.emergencyServices,
                    specialties: f.specialties,
                    doctors: f.doctors
                };
            });
        }

        // 2. Try Google Maps Places API (New) if key is set
        if (config.googleMapsApiKey && config.googleMapsApiKey !== 'YOUR_API_KEY_HERE') {
            try {
                console.log(`🔍 Querying Google Maps API (New) for facilities near ${latitude}, ${longitude}...`);
                const apiUrl = 'https://places.googleapis.com/v1/places:searchNearby';
                const apiHeaders = {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': config.googleMapsApiKey,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating'
                };

                const locationRestriction = {
                    circle: {
                        center: { latitude, longitude },
                        radius
                    }
                };

                const typeGroups = [
                    ["hospital"],
                    ["medical_clinic"],
                    ["doctor"],
                    ["pharmacy"],
                    ["physiotherapist"],
                    ["dentist"],
                ];

                const responses = await Promise.allSettled(
                    typeGroups.map(types =>
                        axios.post(apiUrl, {
                            includedTypes: types,
                            maxResultCount: 20,
                            locationRestriction
                        }, { headers: apiHeaders })
                    )
                );

                const seenIds = new Set();
                const allPlaces = [];
                for (const res of responses) {
                    if (res.status === 'fulfilled') {
                        for (const place of (res.value.data.places || [])) {
                            if (place.id && !seenIds.has(place.id)) {
                                seenIds.add(place.id);
                                allPlaces.push(place);
                            }
                        }
                    }
                }

                console.log(`📍 Total unique places from Google: ${allPlaces.length}`);

                if (allPlaces.length > 0) {
                    return await Promise.all(
                        allPlaces.map(place => formatPlace(place, latitude, longitude))
                    );
                }
            } catch (err) {
                console.warn('⚠️ Google Maps API failed, trying Overpass API:', err.message);
            }
        }

        // 3. Fallback to OpenStreetMap Overpass API (Real-world Locations, Free)
        try {
            return await findHospitalsWithOverpass(latitude, longitude, radius);
        } catch (osmError) {
            console.warn('⚠️ Overpass API failed, using fallback mock data:', osmError.message);
        }

        // 4. Ultimate Mock Fallback if both remote APIs fail
        return [
            {
                id: 'mock-1', name: 'City General Hospital (Demo)',
                address: 'Near Search Location', distance: '1.2 km',
                phone: '+91-141-5550100', type: 'hospital', rating: 4.5,
                location: { lat: latitude + 0.005, lng: longitude + 0.005 },
                isOpen: true, emergencyServices: true,
                specialties: ['Cardiology (Heart)', 'General Medicine', 'Neurology (Brain)'],
                doctors: [{ name: 'Dr. Rajesh Sharma', time: '10:00 AM - 04:00 PM' }, { name: 'Dr. Priya Mehta', time: '09:00 AM - 01:00 PM' }]
            },
            {
                id: 'mock-2', name: 'Emergency Medical Center (Demo)',
                address: 'Near Search Location', distance: '2.5 km',
                phone: '+91-141-5550200', type: 'emergency', rating: 4.3,
                location: { lat: latitude - 0.008, lng: longitude + 0.003 },
                isOpen: true, emergencyServices: true,
                specialties: ['Emergency Medicine', 'Orthopedics (Back & Bones)', 'Trauma Care'],
                doctors: [{ name: 'Dr. Vikram Singh', time: '08:00 AM - 12:00 PM' }, { name: 'Dr. Amit Verma', time: '02:00 PM - 08:00 PM' }]
            },
            {
                id: 'mock-3', name: 'City Eye & Skin Clinic (Demo)',
                address: 'Near Search Location', distance: '3.1 km',
                phone: '+91-141-5550300', type: 'clinic', rating: 4.6,
                location: { lat: latitude + 0.006, lng: longitude - 0.007 },
                isOpen: true, emergencyServices: false,
                specialties: ['Ophthalmology (Eye)', 'Dermatology (Skin)'],
                doctors: [{ name: 'Dr. Sneha Gupta', time: '11:00 AM - 05:00 PM' }]
            },
            {
                id: 'mock-4', name: 'Bone & Spine Care Centre (Demo)',
                address: 'Near Search Location', distance: '3.8 km',
                phone: '+91-141-5550400', type: 'clinic', rating: 4.7,
                location: { lat: latitude + 0.002, lng: longitude - 0.01 },
                isOpen: true, emergencyServices: false,
                specialties: ['Orthopedics (Back & Bones)', 'Physiotherapy'],
                doctors: [{ name: 'Dr. Anil Bose', time: '09:00 AM - 05:00 PM' }]
            },
            {
                id: 'mock-5', name: 'Children & Women Hospital (Demo)',
                address: 'Near Search Location', distance: '4.2 km',
                phone: '+91-141-5550500', type: 'hospital', rating: 4.8,
                location: { lat: latitude - 0.01, lng: longitude + 0.008 },
                isOpen: true, emergencyServices: true,
                specialties: ['Pediatrics (Kids)', 'Gynecology'],
                doctors: [{ name: 'Dr. Kavita Joshi', time: '10:00 AM - 06:00 PM' }]
            },
            {
                id: 'mock-6', name: 'Heart Care Institute (Demo)',
                address: 'Near Search Location', distance: '5.0 km',
                phone: '+91-141-5550600', type: 'hospital', rating: 4.9,
                location: { lat: latitude - 0.003, lng: longitude - 0.012 },
                isOpen: true, emergencyServices: true,
                specialties: ['Cardiology (Heart)', 'Urology'],
                doctors: [{ name: 'Dr. Amit Verma', time: '02:00 PM - 08:00 PM' }, { name: 'Dr. Priya Mehta', time: '09:00 AM - 01:00 PM' }]
            },
        ];
    } catch (error) {
        console.error('❌ Critical error in findNearbyHospitals:', error.message);
        return [
            {
                id: 'mock-1', name: 'City General Hospital (Demo)',
                address: 'Near Search Location', distance: '1.2 km',
                phone: '+91-141-5550100', type: 'hospital', rating: 4.5,
                location: { lat: latitude + 0.005, lng: longitude + 0.005 },
                isOpen: true, emergencyServices: true,
                specialties: ['Cardiology (Heart)', 'General Medicine', 'Neurology (Brain)'],
                doctors: [{ name: 'Dr. Rajesh Sharma', time: '10:00 AM - 04:00 PM' }, { name: 'Dr. Priya Mehta', time: '09:00 AM - 01:00 PM' }]
            }
        ];
    }
};
