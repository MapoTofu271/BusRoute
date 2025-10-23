import { getAllBusRoute, onMapStateChange } from "mapUtils";
import { eventManager } from "./eventManager.js";
import { router } from "../router.js";
import { LeafletEnhancements } from "./leafletEnhancements.js";

// MAP OBJECT - Initialize map with enhanced settings
var map = L.map('map', {
    preferCanvas: true,
    zoomControl: false, // We'll add custom controls
    attributionControl: true
}).setView([21.025546, 105.845032], 15);

// Add zoom control in a better position
L.control.zoom({ position: 'topleft' }).addTo(map);

// Use OpenStreetMap tiles with better attribution
const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 10,
    maxZoom: 19,
    detectRetina: true
}).addTo(map);

// Alternative tile layers for better user experience
const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
});

// Layer groups for different map elements
var visibleMarker = L.layerGroup().addTo(map);
var addRoutedLayer = L.layerGroup().addTo(map);
var routeLayer = L.layerGroup().addTo(map);

// Initialize enhanced Leaflet features
var leafletEnhancements;

// Initialize map with bus stop data and enhancements
async function initializeMap() {
    try {
        // Initialize enhanced features
        leafletEnhancements = new LeafletEnhancements(map);
        
        // Load bus stop data
        const busStopData = await getAllBusRoute();
        
        // Add stops to enhanced marker system
        if (busStopData && busStopData.length > 0) {
            leafletEnhancements.addStopMarkers(busStopData);
        }
        
        // Initialize map state change handling
        onMapStateChange(busStopData);
        
        // Listen for route changes to update map view
        eventManager.listen('route:changed', handleRouteChange);
        eventManager.listen('route:creation-started', handleRouteCreationStart);
        eventManager.listen('route:show-on-map', handleShowRoute);
        
        // Add scale control
        L.control.scale({ position: 'bottomleft' }).addTo(map);
        
        // Add fullscreen control if available
        if (L.control.fullscreen) {
            L.control.fullscreen({ position: 'topleft' }).addTo(map);
        }
        
        console.log('Map initialized successfully with enhanced features');
        
    } catch (error) {
        console.error('Failed to initialize map:', error);
        // Fallback to basic functionality
        initializeBasicMap();
    }
}

// Fallback initialization for basic map functionality
async function initializeBasicMap() {
    try {
        const busStopData = await getAllBusRoute();
        onMapStateChange(busStopData);
        
        eventManager.listen('route:changed', handleRouteChange);
        eventManager.listen('route:creation-started', handleRouteCreationStart);
        
        console.log('Map initialized with basic features');
    } catch (error) {
        console.error('Failed to initialize basic map:', error);
    }
}

// Handle route changes for map-specific functionality
function handleRouteChange(event) {
    const { route, params } = event.detail;
    
    switch (route.name) {
        case 'add-route':
            prepareMapForRouteCreation();
            break;
            
        case 'route-detail':
            if (params.id) {
                loadAndShowRoute(params.id);
            }
            break;
            
        case 'home':
        case 'routes':
            resetMapView();
            break;
    }
}

function prepareMapForRouteCreation() {
    // Clear any existing route layers
    addRoutedLayer.clearLayers();
    routeLayer.clearLayers();
    
    if (leafletEnhancements) {
        leafletEnhancements.clearAllRoutes();
    }
    
    // Reset marker colors
    visibleMarker.eachLayer(layer => {
        if (layer.setStyle) {
            layer.setStyle({ color: 'blue', fillColor: 'blue' });
        }
    });
    
    // Zoom to a good level for route creation
    if (map.getZoom() < 14) {
        map.setZoom(14);
    }
}

async function loadAndShowRoute(routeId) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/routes/${routeId}`);
        const result = await response.json();
        
        if (result.success && result.data && result.data.length > 0) {
            const stops = result.data.map(stop => ({
                id: stop.stopId,
                name: stop.stopName,
                latitude: stop.lat,
                longitude: stop.lon
            }));
            
            // Use enhanced features if available
            if (leafletEnhancements) {
                eventManager.emit('route:show-on-map', { routeId, stops });
            } else {
                // Fallback to basic route display
                showRouteBasic(routeId, stops);
            }
        }
    } catch (error) {
        console.error('Failed to load and show route:', error);
    }
}

// Basic route display fallback
function showRouteBasic(routeId, stops) {
    // Clear existing route display
    routeLayer.clearLayers();
    
    if (stops && stops.length > 0) {
        // Create route line
        const coordinates = stops.map(stop => [stop.latitude, stop.longitude]);
        const routeLine = L.polyline(coordinates, {
            color: '#e74c3c',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(routeLayer);
        
        // Fit map to route bounds
        map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
        
        // Add stop markers
        stops.forEach((stop, index) => {
            const marker = L.circleMarker([stop.latitude, stop.longitude], {
                radius: 8,
                fillColor: '#e74c3c',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(routeLayer);
            
            marker.bindPopup(`
                <div class="basic-stop-popup">
                    <h4>Stop ${index + 1}</h4>
                    <p><strong>${stop.name}</strong></p>
                    <p>ID: ${stop.id}</p>
                    <p>Route: ${routeId}</p>
                </div>
            `);
        });
    }
}

function handleShowRoute(event) {
    // This is handled by LeafletEnhancements
    console.log('Showing route on map:', event.detail.routeId);
}

function resetMapView() {
    // Clear route-specific layers
    addRoutedLayer.clearLayers();
    routeLayer.clearLayers();
    
    if (leafletEnhancements) {
        leafletEnhancements.clearAllRoutes();
    }
    
    // Reset to default view
    map.setView([21.025546, 105.845032], 15);
}

function handleRouteCreationStart(event) {
    console.log('Route creation started, preparing map...');
    prepareMapForRouteCreation();
}

// Map utility functions
function getCurrentMapBounds() {
    const bounds = map.getBounds();
    return {
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLon: bounds.getWest(),
        maxLon: bounds.getEast()
    };
}

function zoomToLocation(lat, lon, zoom = 16) {
    map.setView([lat, lon], zoom);
}

function addTemporaryMarker(lat, lon, message, duration = 3000) {
    const marker = L.marker([lat, lon]).addTo(map);
    
    if (message) {
        marker.bindPopup(message).openPopup();
    }
    
    // Remove after duration
    setTimeout(() => {
        map.removeLayer(marker);
    }, duration);
    
    return marker;
}

// Initialize the map when the module loads
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
});

// Export map objects and utilities
export { 
    map, 
    visibleMarker, 
    addRoutedLayer, 
    routeLayer, 
    leafletEnhancements,
    getCurrentMapBounds,
    zoomToLocation,
    addTemporaryMarker
};