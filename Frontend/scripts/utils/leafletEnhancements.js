/**
 * Enhanced Leaflet utilities with routing machine and advanced features
 */

import { eventManager } from './eventManager.js';

class LeafletEnhancements {
    constructor(map) {
        this.map = map;
        this.routingControl = null;
        this.routeLines = new Map();
        this.stopMarkers = new Map();
        this.clusterGroup = null;
        
        this.init();
    }

    init() {
        // Initialize marker clustering
        this.initializeMarkerClustering();
        
        // Initialize custom controls
        this.initializeCustomControls();
        
        // Listen for events
        eventManager.listen('route:show-on-map', this.showRouteOnMap, this);
        eventManager.listen('route:clear-map', this.clearRouteFromMap, this);
    }

    /**
     * Initialize marker clustering for better performance with many stops
     */
    initializeMarkerClustering() {
        // You'll need to include Leaflet.markercluster plugin
        if (typeof L.MarkerClusterGroup !== 'undefined') {
            this.clusterGroup = L.markerClusterGroup({
                maxClusterRadius: 50,
                spiderfyOnMaxZoom: true,
                showCoverageOnHover: false,
                zoomToBoundsOnClick: true,
                iconCreateFunction: (cluster) => {
                    const count = cluster.getChildCount();
                    let className = 'marker-cluster-small';
                    
                    if (count > 10) className = 'marker-cluster-medium';
                    if (count > 50) className = 'marker-cluster-large';
                    
                    return L.divIcon({
                        html: `<div><span>${count}</span></div>`,
                        className: `marker-cluster ${className}`,
                        iconSize: L.point(40, 40)
                    });
                }
            });
            
            this.map.addLayer(this.clusterGroup);
        }
    }

    /**
     * Initialize custom map controls
     */
    initializeCustomControls() {
        // Location control
        this.addLocationControl();
        
        // Route planning control
        this.addRoutePlanningControl();
        
        // Layer control for different route types
        this.addLayerControl();
    }

    /**
     * Add geolocation control
     */
    addLocationControl() {
        const LocationControl = L.Control.extend({
            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
                
                container.style.backgroundColor = 'white';
                container.style.backgroundImage = "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBkPSJNMTIgOGMtMi4yMSAwLTQgMS43OS00IDRzMS43OSA0IDQgNCA0LTEuNzkgNC00LTEuNzktNC00LTR6bTguOTQgM0EuOTMuOTMgMCAwIDAgMjEgMTBoLTFhOCA4IDAgMCAwLTctN1YyYS45My45MyAwIDAgMC0xLTFoMGEuOTMuOTMgMCAwIDAtMSAxdjFhOCA4IDAgMCAwLTcgN0gyYS45My45MyAwIDAgMC0xIDFoMGEuOTMuOTMgMCAwIDAgMSAxaDF2MWE4IDggMCAwIDAgNyA3djFhLjkzLjkzIDAgMCAwIDEgMWgwYS45My45MyAwIDAgMCAxLTF2LTFhOCA4IDAgMCAwIDctN2gxYS45My45MyAwIDAgMCAxLTF6Ii8+PC9zdmc+')";
                container.style.backgroundSize = '20px 20px';
                container.style.backgroundPosition = 'center';
                container.style.backgroundRepeat = 'no-repeat';
                container.style.width = '34px';
                container.style.height = '34px';
                container.style.cursor = 'pointer';
                container.title = 'Find my location';
                
                container.onclick = () => {
                    this.locateUser();
                };
                
                return container;
            }
        });
        
        new LocationControl({ position: 'topleft' }).addTo(this.map);
    }

    /**
     * Add route planning control
     */
    addRoutePlanningControl() {
        const RoutePlanningControl = L.Control.extend({
            onAdd: (map) => {
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                
                container.innerHTML = `
                    <div class="route-planning-control">
                        <button type="button" id="toggleRouting" class="control-button" title="Toggle Route Planning">
                            🗺️
                        </button>
                        <button type="button" id="clearRoutes" class="control-button" title="Clear All Routes">
                            🗑️
                        </button>
                    </div>
                `;
                
                // Add event listeners
                container.querySelector('#toggleRouting').onclick = () => {
                    this.toggleRoutingMode();
                };
                
                container.querySelector('#clearRoutes').onclick = () => {
                    this.clearAllRoutes();
                };
                
                return container;
            }
        });
        
        new RoutePlanningControl({ position: 'topright' }).addTo(this.map);
    }

    /**
     * Add layer control for different route overlays
     */
    addLayerControl() {
        const baseLayers = {
            "OpenStreetMap": L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png'),
            "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')
        };
        
        const overlayLayers = {
            "Bus Routes": L.layerGroup(),
            "Bus Stops": this.clusterGroup || L.layerGroup(),
            "Route Planning": L.layerGroup()
        };
        
        L.control.layers(baseLayers, overlayLayers, { position: 'bottomright' }).addTo(this.map);
    }

    /**
     * Enhanced routing with Leaflet Routing Machine
     */
    initializeRouting(waypoints = []) {
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
        }

        this.routingControl = L.Routing.control({
            waypoints: waypoints,
            routeWhileDragging: true,
            addWaypoints: true,
            draggableWaypoints: true,
            fitSelectedRoutes: true,
            showAlternatives: true,
            
            // Custom routing service (you can use different providers)
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving', // or 'walking', 'cycling'
                timeout: 30 * 1000,
                routingOptions: {
                    alternatives: true,
                    steps: true,
                    geometries: 'geojson',
                    overview: 'full'
                }
            }),
            
            // Custom line options
            lineOptions: {
                styles: [
                    { color: 'black', opacity: 0.15, weight: 9 },
                    { color: 'white', opacity: 0.8, weight: 6 },
                    { color: 'red', opacity: 1, weight: 2 }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            
            // Custom marker options
            createMarker: (i, waypoint, n) => {
                const isStart = i === 0;
                const isEnd = i === n - 1;
                const isIntermediate = !isStart && !isEnd;
                
                let iconHtml = '📍';
                if (isStart) iconHtml = '🚩';
                if (isEnd) iconHtml = '🏁';
                
                return L.marker(waypoint.latLng, {
                    draggable: true,
                    icon: L.divIcon({
                        html: iconHtml,
                        className: 'route-waypoint-marker',
                        iconSize: [25, 25],
                        iconAnchor: [12, 25]
                    })
                });
            },
            
            // Custom geocoder
            geocoder: L.Control.Geocoder.nominatim({
                geocodingQueryParams: {
                    countrycodes: 'vn', // Limit to Vietnam
                    limit: 5
                }
            }),
            
            // Event handlers
            routeFound: (e) => {
                console.log('Route found:', e.route);
                this.onRouteFound(e);
            },
            
            routeError: (e) => {
                console.error('Routing error:', e.error);
                this.onRouteError(e);
            }
        });

        return this.routingControl;
    }

    /**
     * Show a specific bus route on the map
     */
    async showRouteOnMap(event) {
        const { routeId, stops } = event.detail;
        
        try {
            // Clear existing route
            this.clearRouteFromMap({ detail: { routeId } });
            
            if (!stops || stops.length < 2) {
                console.warn('Not enough stops to show route');
                return;
            }
            
            // Create waypoints from stops
            const waypoints = stops.map(stop => 
                L.latLng(stop.latitude, stop.longitude)
            );
            
            // Create route line
            const routeLine = L.polyline(waypoints, {
                color: this.getRouteColor(routeId),
                weight: 4,
                opacity: 0.7,
                smoothFactor: 1
            });
            
            // Add stop markers
            const stopMarkers = stops.map((stop, index) => {
                const marker = L.circleMarker([stop.latitude, stop.longitude], {
                    radius: 8,
                    fillColor: this.getRouteColor(routeId),
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.8
                });
                
                marker.bindPopup(`
                    <div class="stop-popup">
                        <h4>Stop ${index + 1}</h4>
                        <p><strong>${stop.name}</strong></p>
                        <p>ID: ${stop.id}</p>
                        <p>Route: ${routeId}</p>
                    </div>
                `);
                
                return marker;
            });
            
            // Group route elements
            const routeGroup = L.layerGroup([routeLine, ...stopMarkers]);
            routeGroup.addTo(this.map);
            
            // Store for later cleanup
            this.routeLines.set(routeId, routeGroup);
            
            // Fit map to route bounds
            this.map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
            
            // Emit event
            eventManager.emit('leaflet:route-displayed', { routeId, bounds: routeLine.getBounds() });
            
        } catch (error) {
            console.error('Error showing route on map:', error);
        }
    }

    /**
     * Clear route from map
     */
    clearRouteFromMap(event) {
        const { routeId } = event.detail;
        
        if (this.routeLines.has(routeId)) {
            this.map.removeLayer(this.routeLines.get(routeId));
            this.routeLines.delete(routeId);
        }
    }

    /**
     * Clear all routes from map
     */
    clearAllRoutes() {
        this.routeLines.forEach((routeGroup, routeId) => {
            this.map.removeLayer(routeGroup);
        });
        this.routeLines.clear();
        
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
            this.routingControl = null;
        }
        
        eventManager.emit('leaflet:all-routes-cleared');
    }

    /**
     * Toggle routing mode
     */
    toggleRoutingMode() {
        if (this.routingControl) {
            this.map.removeControl(this.routingControl);
            this.routingControl = null;
        } else {
            this.routingControl = this.initializeRouting();
            this.routingControl.addTo(this.map);
        }
    }

    /**
     * Locate user position
     */
    locateUser() {
        this.map.locate({
            setView: true,
            maxZoom: 16,
            timeout: 10000,
            enableHighAccuracy: true
        });
        
        this.map.on('locationfound', (e) => {
            const radius = e.accuracy / 2;
            
            L.marker(e.latlng, {
                icon: L.divIcon({
                    html: '📍',
                    className: 'user-location-marker',
                    iconSize: [25, 25]
                })
            })
            .addTo(this.map)
            .bindPopup(`You are within ${radius} meters from this point`)
            .openPopup();
            
            L.circle(e.latlng, radius).addTo(this.map);
        });
        
        this.map.on('locationerror', (e) => {
            alert('Location access denied or unavailable: ' + e.message);
        });
    }

    /**
     * Add enhanced stop markers with clustering
     */
    addStopMarkers(stops) {
        if (!this.clusterGroup) {
            this.initializeMarkerClustering();
        }
        
        stops.forEach(stop => {
            const marker = L.marker([stop.latitude, stop.longitude], {
                icon: L.divIcon({
                    html: `
                        <div class="bus-stop-marker" data-stop-id="${stop.id}">
                            <div class="marker-icon">🚌</div>
                            <div class="marker-label">${stop.name}</div>
                        </div>
                    `,
                    className: 'custom-bus-stop-marker',
                    iconSize: [30, 40],
                    iconAnchor: [15, 40]
                })
            });
            
            marker.bindPopup(this.createStopPopup(stop));
            
            // Add to cluster group if available, otherwise to map
            if (this.clusterGroup) {
                this.clusterGroup.addLayer(marker);
            } else {
                marker.addTo(this.map);
            }
            
            this.stopMarkers.set(stop.id, marker);
        });
    }

    /**
     * Create enhanced popup for bus stops
     */
    createStopPopup(stop) {
        return `
            <div class="enhanced-stop-popup">
                <div class="popup-header">
                    <h3>${stop.name}</h3>
                    <span class="stop-id">ID: ${stop.id}</span>
                </div>
                
                <div class="popup-content">
                    <div class="stop-info">
                        <p><strong>Coordinates:</strong> ${stop.latitude.toFixed(6)}, ${stop.longitude.toFixed(6)}</p>
                        ${stop.bench ? `<p><strong>Bench:</strong> ${stop.bench}</p>` : ''}
                        ${stop.shelter ? `<p><strong>Shelter:</strong> ${stop.shelter}</p>` : ''}
                    </div>
                    
                    <div class="popup-actions">
                        <button onclick="leafletEnhancements.routeToStop(${stop.id})" class="btn-small">
                            Route Here
                        </button>
                        <button onclick="leafletEnhancements.addToRoute(${stop.id})" class="btn-small">
                            Add to Route
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Route to a specific stop
     */
    routeToStop(stopId) {
        const stop = this.stopMarkers.get(stopId);
        if (!stop) return;
        
        this.map.locate({
            setView: false,
            timeout: 5000
        });
        
        this.map.once('locationfound', (e) => {
            const waypoints = [
                L.latLng(e.latlng.lat, e.latlng.lng),
                stop.getLatLng()
            ];
            
            this.initializeRouting(waypoints).addTo(this.map);
        });
    }

    /**
     * Add stop to current route
     */
    addToRoute(stopId) {
        eventManager.emit('route:add-stop', { stopId });
    }

    /**
     * Get color for route based on ID
     */
    getRouteColor(routeId) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];
        
        const hash = routeId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        
        return colors[Math.abs(hash) % colors.length];
    }

    /**
     * Route found event handler
     */
    onRouteFound(e) {
        const route = e.route;
        console.log(`Route found: ${route.summary.totalDistance}m, ${route.summary.totalTime}s`);
        
        // You can add custom logic here, like saving the route or showing statistics
        eventManager.emit('leaflet:route-calculated', {
            distance: route.summary.totalDistance,
            time: route.summary.totalTime,
            coordinates: route.coordinates
        });
    }

    /**
     * Route error event handler
     */
    onRouteError(e) {
        console.error('Routing failed:', e.error);
        alert('Could not calculate route. Please try again with different points.');
    }

    /**
     * Cleanup method
     */
    destroy() {
        this.clearAllRoutes();
        
        if (this.clusterGroup) {
            this.map.removeLayer(this.clusterGroup);
        }
        
        this.stopMarkers.clear();
    }
}

// Export for use in other modules
export { LeafletEnhancements };