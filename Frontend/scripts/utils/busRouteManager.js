/**
 * Bus Route Manager - Handles all bus route related functionality
 * Uses the EventManager for clean event handling
 */

import { eventManager } from './eventManager.js';
import { map, visibleMarker, addRoutedLayer } from './mapInit.js';

class BusRouteManager {
    constructor() {
        this.selectedStops = [];
        this.isAddingRoute = false;
        this.currentRouteData = {
            busNumber: '',
            direction: 0,
            stopIds: []
        };
        
        this.init();
    }

    init() {
        // Register event handlers using data attributes
        eventManager.on('click', '[data-action="add-route"]', this.startAddRoute, this);
        eventManager.on('click', '[data-action="cancel-route"]', this.cancelAddRoute, this);
        eventManager.on('click', '[data-action="save-route"]', this.saveRoute, this);
        eventManager.on('click', '[data-action="remove-stop"]', this.removeStop, this);
        eventManager.on('click', '[data-action="clear-all"]', this.clearAllStops, this);
        
        // Form events
        eventManager.on('change', '[data-field="bus-number"]', this.updateBusNumber, this);
        eventManager.on('change', '[data-field="direction"]', this.updateDirection, this);
        
        // Custom events
        eventManager.listen('route:stop-selected', this.handleStopSelected, this);
        eventManager.listen('route:stop-deselected', this.handleStopDeselected, this);
    }

    startAddRoute(event, element) {
        console.log('Starting route creation...');
        this.isAddingRoute = true;
        this.selectedStops = [];
        
        // Load the add route interface
        this.loadAddRouteInterface();
        
        // Enable marker selection mode
        this.enableMarkerSelection();
        
        // Emit custom event
        eventManager.emit('route:creation-started', {
            timestamp: Date.now()
        });
    }

    async loadAddRouteInterface() {
        try {
            const response = await fetch('./components/addRoute.html');
            const html = await response.text();
            document.getElementById('content').innerHTML = html;
            
            // Update UI state
            this.updateUIState();
        } catch (error) {
            console.error('Failed to load add route interface:', error);
        }
    }

    enableMarkerSelection() {
        // Add click handlers to all visible markers
        visibleMarker.eachLayer((layer) => {
            layer.off('click'); // Remove existing handlers
            layer.on('click', (e) => {
                this.handleMarkerClick(e, layer);
            });
        });
    }

    handleMarkerClick(event, marker) {
        if (!this.isAddingRoute) return;
        
        const stopData = {
            id: marker.myId,
            name: marker.myName,
            lat: marker._latlng.lat,
            lng: marker._latlng.lng
        };

        // Check if stop is already selected
        const existingIndex = this.selectedStops.findIndex(stop => stop.id === stopData.id);
        
        if (existingIndex === -1) {
            // Add stop
            this.selectedStops.push(stopData);
            this.updateStopDisplay();
            
            // Visual feedback
            marker.setStyle({ color: 'red', fillColor: 'red' });
            
            eventManager.emit('route:stop-selected', { stop: stopData });
        } else {
            // Remove stop and all subsequent stops
            this.removeStopFromSequence(existingIndex);
        }
    }

    removeStopFromSequence(index) {
        // Remove from index onwards
        const removedStops = this.selectedStops.splice(index);
        
        // Reset marker colors for removed stops
        removedStops.forEach(stop => {
            visibleMarker.eachLayer(layer => {
                if (layer.myId === stop.id) {
                    layer.setStyle({ color: 'blue', fillColor: 'blue' }); // Reset to default
                }
            });
        });
        
        this.updateStopDisplay();
        eventManager.emit('route:stops-removed', { removedStops });
    }

    updateStopDisplay() {
        const displayElement = document.getElementById('displayRouteAdded');
        if (!displayElement) return;

        displayElement.innerHTML = '';
        
        this.selectedStops.forEach((stop, index) => {
            const stopElement = document.createElement('div');
            stopElement.className = 'route-stop-item';
            stopElement.dataset.stopId = stop.id;
            stopElement.dataset.stopIndex = index;
            
            stopElement.innerHTML = `
                <span class="sequence-number">${index + 1}</span>
                <span class="stop-info">${stop.id}: ${stop.name}</span>
                <button type="button" 
                        data-action="remove-stop" 
                        data-stop-index="${index}"
                        class="remove-stop-btn">×</button>
            `;
            
            displayElement.appendChild(stopElement);
        });
        
        // Update current route data
        this.currentRouteData.stopIds = this.selectedStops.map(stop => parseInt(stop.id));
    }

    removeStop(event, element) {
        const stopIndex = parseInt(element.dataset.stopIndex);
        this.removeStopFromSequence(stopIndex);
    }

    clearAllStops(event, element) {
        this.selectedStops = [];
        this.updateStopDisplay();
        
        // Reset all marker colors
        visibleMarker.eachLayer(layer => {
            layer.setStyle({ color: 'blue', fillColor: 'blue' });
        });
        
        eventManager.emit('route:all-stops-cleared');
    }

    updateBusNumber(event, element) {
        this.currentRouteData.busNumber = element.value;
        console.log('Bus number updated:', this.currentRouteData.busNumber);
    }

    updateDirection(event, element) {
        if (element.checked) {
            this.currentRouteData.direction = parseInt(element.value);
            console.log('Direction updated:', this.currentRouteData.direction);
        }
    }

    async saveRoute(event, element) {
        if (!this.validateRouteData()) {
            alert('Please fill in all required fields and select at least 2 stops');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/busRoute/addRoute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.currentRouteData)
            });

            if (response.ok) {
                console.log('Route saved successfully');
                eventManager.emit('route:saved', { routeData: this.currentRouteData });
                this.resetRouteCreation();
            } else {
                throw new Error('Failed to save route');
            }
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Failed to save route. Please try again.');
        }
    }

    validateRouteData() {
        return this.currentRouteData.busNumber && 
               this.currentRouteData.stopIds.length >= 2;
    }

    cancelAddRoute(event, element) {
        this.resetRouteCreation();
        eventManager.emit('route:creation-cancelled');
    }

    resetRouteCreation() {
        this.isAddingRoute = false;
        this.selectedStops = [];
        this.currentRouteData = {
            busNumber: '',
            direction: 0,
            stopIds: []
        };
        
        // Reset UI
        document.getElementById('content').innerHTML = '';
        
        // Reset marker colors
        visibleMarker.eachLayer(layer => {
            layer.setStyle({ color: 'blue', fillColor: 'blue' });
            layer.off('click'); // Remove selection handlers
        });
    }

    updateUIState() {
        // Update button states, show/hide elements, etc.
        const addRouteBtn = document.querySelector('[data-action="add-route"]');
        if (addRouteBtn) {
            addRouteBtn.disabled = this.isAddingRoute;
            addRouteBtn.textContent = this.isAddingRoute ? 'Adding Route...' : 'Add Route';
        }
    }

    // Event handlers for custom events
    handleStopSelected(event) {
        console.log('Stop selected:', event.detail.stop);
        // Additional logic when a stop is selected
    }

    handleStopDeselected(event) {
        console.log('Stop deselected:', event.detail.stop);
        // Additional logic when a stop is deselected
    }
}

// Create and export singleton instance
const busRouteManager = new BusRouteManager();
export { BusRouteManager, busRouteManager };