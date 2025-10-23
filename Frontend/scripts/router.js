/**
 * Modern SPA Router with proper page management
 * Handles navigation, page loading, and browser history
 */

import { eventManager } from './utils/eventManager.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.currentPage = null;
        this.contentContainer = document.getElementById('content');
        this.loadingTemplate = '<div class="loading">Loading...</div>';
        
        this.init();
    }

    init() {
        // Register routes
        this.registerRoutes();
        
        // Handle navigation clicks
        eventManager.on('click', '[data-route]', this.handleNavigationClick, this);
        
        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const path = e.state?.path || window.location.pathname;
            this.handleRouteChange(path, false); // false = don't push to history
        });
        
        // Handle initial route
        this.handleRouteChange(window.location.pathname || '/', false);
    }

    /**
     * Register all application routes
     */
    registerRoutes() {
        this.addRoute('/', {
            name: 'home',
            title: 'Bus Route Manager',
            component: () => this.loadHomePage(),
            requiresAuth: false
        });

        this.addRoute('/routes', {
            name: 'routes',
            title: 'Manage Routes',
            component: () => this.loadRoutesPage(),
            requiresAuth: false
        });

        this.addRoute('/routes/add', {
            name: 'add-route',
            title: 'Add New Route',
            component: () => this.loadAddRoutePage(),
            requiresAuth: false
        });

        this.addRoute('/routes/:id', {
            name: 'route-detail',
            title: 'Route Details',
            component: (params) => this.loadRouteDetailPage(params.id),
            requiresAuth: false
        });

        this.addRoute('/stops', {
            name: 'stops',
            title: 'Bus Stops',
            component: () => this.loadStopsPage(),
            requiresAuth: false
        });

        // 404 route
        this.addRoute('*', {
            name: '404',
            title: 'Page Not Found',
            component: () => this.load404Page(),
            requiresAuth: false
        });
    }

    /**
     * Add a route to the router
     */
    addRoute(path, config) {
        this.routes.set(path, {
            path,
            ...config,
            params: this.extractParams(path)
        });
    }

    /**
     * Extract parameter names from route path
     */
    extractParams(path) {
        const params = [];
        const segments = path.split('/');
        
        segments.forEach((segment, index) => {
            if (segment.startsWith(':')) {
                params.push({
                    name: segment.slice(1),
                    index
                });
            }
        });
        
        return params;
    }

    /**
     * Handle navigation link clicks
     */
    handleNavigationClick(event, element) {
        event.preventDefault();
        const path = element.dataset.route || element.getAttribute('href');
        this.navigate(path);
    }

    /**
     * Navigate to a specific path
     */
    navigate(path, pushState = true) {
        this.handleRouteChange(path, pushState);
    }

    /**
     * Handle route changes
     */
    async handleRouteChange(path, pushState = true) {
        // Find matching route
        const { route, params } = this.matchRoute(path);
        
        if (!route) {
            console.error(`No route found for path: ${path}`);
            return;
        }

        // Check authentication if required
        if (route.requiresAuth && !this.isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        // Update browser history
        if (pushState) {
            history.pushState({ path }, route.title, path);
        }

        // Update page title
        document.title = route.title;

        // Show loading state
        this.showLoading();

        try {
            // Load the page component
            await this.loadPage(route, params);
            
            // Update current route
            this.currentRoute = { ...route, path, params };
            
            // Emit route change event
            eventManager.emit('route:changed', {
                route: this.currentRoute,
                path,
                params
            });
            
        } catch (error) {
            console.error('Error loading page:', error);
            this.showError('Failed to load page');
        }
    }

    /**
     * Match a path to a route
     */
    matchRoute(path) {
        // Try exact match first
        if (this.routes.has(path)) {
            return { route: this.routes.get(path), params: {} };
        }

        // Try parameterized routes
        for (const [routePath, route] of this.routes) {
            if (routePath.includes(':')) {
                const match = this.matchParameterizedRoute(path, routePath);
                if (match) {
                    return { route, params: match };
                }
            }
        }

        // Return 404 route
        return { route: this.routes.get('*'), params: {} };
    }

    /**
     * Match parameterized routes like /routes/:id
     */
    matchParameterizedRoute(path, routePath) {
        const pathSegments = path.split('/').filter(s => s);
        const routeSegments = routePath.split('/').filter(s => s);

        if (pathSegments.length !== routeSegments.length) {
            return null;
        }

        const params = {};
        
        for (let i = 0; i < routeSegments.length; i++) {
            const routeSegment = routeSegments[i];
            const pathSegment = pathSegments[i];

            if (routeSegment.startsWith(':')) {
                // Parameter segment
                const paramName = routeSegment.slice(1);
                params[paramName] = pathSegment;
            } else if (routeSegment !== pathSegment) {
                // Literal segment doesn't match
                return null;
            }
        }

        return params;
    }

    /**
     * Load a page component
     */
    async loadPage(route, params) {
        try {
            const content = await route.component(params);
            this.contentContainer.innerHTML = content;
            
            // Initialize page-specific functionality
            this.initializePage(route.name, params);
            
        } catch (error) {
            throw new Error(`Failed to load ${route.name} page: ${error.message}`);
        }
    }

    /**
     * Initialize page-specific functionality
     */
    initializePage(pageName, params) {
        switch (pageName) {
            case 'add-route':
                // Initialize add route functionality
                import('./utils/busRouteManager.js').then(module => {
                    // Route manager is already initialized as singleton
                });
                break;
                
            case 'route-detail':
                // Initialize route detail view
                this.initializeRouteDetail(params.id);
                break;
                
            // Add more page initializations as needed
        }
    }

    /**
     * Page loading methods
     */
    async loadHomePage() {
        return `
            <div class="home-page">
                <div class="hero-section">
                    <h1>Bus Route Management System</h1>
                    <p>Manage bus routes and stops efficiently</p>
                </div>
                
                <div class="quick-actions">
                    <div class="action-card">
                        <h3>Manage Routes</h3>
                        <p>View, edit, and delete existing bus routes</p>
                        <button data-route="/routes" class="btn btn-primary">View Routes</button>
                    </div>
                    
                    <div class="action-card">
                        <h3>Add New Route</h3>
                        <p>Create a new bus route with stops</p>
                        <button data-route="/routes/add" class="btn btn-primary">Add Route</button>
                    </div>
                    
                    <div class="action-card">
                        <h3>Manage Stops</h3>
                        <p>View and manage bus stops</p>
                        <button data-route="/stops" class="btn btn-primary">View Stops</button>
                    </div>
                </div>
            </div>
        `;
    }

    async loadRoutesPage() {
        try {
            const response = await fetch('http://localhost:8080/api/busRoute');
            const routes = await response.json();
            
            return `
                <div class="routes-page">
                    <div class="page-header">
                        <h2>Bus Routes</h2>
                        <button data-route="/routes/add" class="btn btn-primary">Add New Route</button>
                    </div>
                    
                    <div class="routes-grid">
                        ${routes.map(route => `
                            <div class="route-card">
                                <h3>Route ${route.routeId}</h3>
                                <p>${route.route_long_name}</p>
                                <div class="route-actions">
                                    <button data-route="/routes/${route.routeId}" class="btn btn-secondary">View Details</button>
                                    <button data-action="edit-route" data-route-id="${route.routeId}" class="btn btn-outline">Edit</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (error) {
            return `<div class="error">Failed to load routes: ${error.message}</div>`;
        }
    }

    async loadAddRoutePage() {
        try {
            const response = await fetch('./components/addRoute.html');
            const html = await response.text();
            return html;
        } catch (error) {
            return `<div class="error">Failed to load add route page: ${error.message}</div>`;
        }
    }

    async loadRouteDetailPage(routeId) {
        try {
            const response = await fetch(`http://localhost:8080/api/busRoute?routeId=${routeId}`);
            const routeData = await response.json();
            
            return `
                <div class="route-detail-page">
                    <div class="page-header">
                        <button data-route="/routes" class="btn btn-secondary">← Back to Routes</button>
                        <h2>Route ${routeId}</h2>
                    </div>
                    
                    <div class="route-info">
                        <h3>${routeData[0]?.route_long_name || 'Route Details'}</h3>
                        
                        <div class="stops-list">
                            <h4>Stops (${routeData.length})</h4>
                            ${routeData.map((stop, index) => `
                                <div class="stop-item">
                                    <span class="stop-sequence">${index + 1}</span>
                                    <span class="stop-name">${stop.stopName}</span>
                                    <span class="stop-id">(ID: ${stop.stopId})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            return `<div class="error">Failed to load route details: ${error.message}</div>`;
        }
    }

    async loadStopsPage() {
        return `
            <div class="stops-page">
                <h2>Bus Stops</h2>
                <p>Bus stops management will be implemented here</p>
                <button data-route="/" class="btn btn-secondary">← Back to Home</button>
            </div>
        `;
    }

    load404Page() {
        return `
            <div class="not-found-page">
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
                <button data-route="/" class="btn btn-primary">Go Home</button>
            </div>
        `;
    }

    /**
     * Utility methods
     */
    showLoading() {
        if (this.contentContainer) {
            this.contentContainer.innerHTML = this.loadingTemplate;
        }
    }

    showError(message) {
        if (this.contentContainer) {
            this.contentContainer.innerHTML = `
                <div class="error-page">
                    <h3>Error</h3>
                    <p>${message}</p>
                    <button data-route="/" class="btn btn-primary">Go Home</button>
                </div>
            `;
        }
    }

    isAuthenticated() {
        // Implement authentication check
        return true; // For now, always return true
    }

    initializeRouteDetail(routeId) {
        // Initialize route detail specific functionality
        console.log(`Initializing route detail for route: ${routeId}`);
    }
}

// Create and export router instance
const router = new Router();
export { Router, router };