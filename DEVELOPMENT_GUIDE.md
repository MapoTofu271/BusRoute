# Bus Route Management System - Development Guide

## Overview

This guide provides comprehensive information for developing and maintaining the Bus Route Management System. The project consists of a Spring Boot backend and a modern JavaScript frontend with Leaflet mapping capabilities.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Frontend Development](#frontend-development)
3. [Backend Development](#backend-development)
4. [Event Handling System](#event-handling-system)
5. [Routing & Navigation](#routing--navigation)
6. [Leaflet Integration](#leaflet-integration)
7. [API Documentation](#api-documentation)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Resources](#resources)

## Project Structure

```
/workspace/
├── Frontend/                    # Frontend application
│   ├── components/             # HTML components
│   │   ├── addRoute.html      # Route creation form
│   │   └── navigation.html    # Navigation component
│   ├── scripts/               # JavaScript modules
│   │   ├── router.js          # SPA routing system
│   │   └── utils/             # Utility modules
│   │       ├── eventManager.js      # Event handling system
│   │       ├── busRouteManager.js   # Route management logic
│   │       ├── leafletEnhancements.js # Enhanced Leaflet features
│   │       └── mapInit.js           # Map initialization
│   ├── styles/                # CSS files
│   │   ├── main.css          # Main application styles
│   │   ├── components.css    # Component-specific styles
│   │   └── leaflet-enhancements.css # Leaflet customizations
│   └── index.html            # Main HTML file
├── src/main/java/org/example/ # Spring Boot backend
│   ├── controller/           # REST controllers
│   ├── service/             # Business logic
│   ├── repository/          # Data access layer
│   ├── model/              # JPA entities
│   ├── dtos/               # Data transfer objects
│   ├── exception/          # Exception handling
│   └── config/             # Configuration classes
└── src/main/resources/      # Application resources
```

## Frontend Development

### Event Handling System

The application uses a centralized event management system for clean separation of concerns:

```javascript
// Using the event manager
import { eventManager } from './utils/eventManager.js';

// Register event handlers
eventManager.on('click', '[data-action="save-route"]', this.saveRoute, this);
eventManager.on('change', '[data-field="bus-number"]', this.updateBusNumber, this);

// Emit custom events
eventManager.emit('route:created', { routeId: 'bus_38_0' });

// Listen for custom events
eventManager.listen('route:created', this.handleRouteCreated, this);
```

**Key Benefits:**
- Centralized event handling
- Automatic event delegation
- Clean component communication
- Easy debugging and maintenance

### SPA Routing System

The router provides client-side navigation without page refreshes:

```javascript
// Navigate programmatically
router.navigate('/routes/add');

// Define new routes
router.addRoute('/custom-page', {
    name: 'custom',
    title: 'Custom Page',
    component: () => this.loadCustomPage(),
    requiresAuth: false
});
```

**Features:**
- Browser history support
- Parameterized routes (`/routes/:id`)
- Route guards and authentication
- Loading states and error handling

### Component Architecture

Components follow a modular pattern:

```javascript
class ComponentName {
    constructor() {
        this.state = {};
        this.init();
    }
    
    init() {
        // Register event handlers
        // Initialize component state
    }
    
    render() {
        // Return HTML string or update DOM
    }
    
    destroy() {
        // Cleanup event listeners
        // Remove DOM elements
    }
}
```

## Backend Development

### REST API Design

The backend follows RESTful conventions with proper HTTP status codes:

```
GET    /api/v1/routes           # List all routes
POST   /api/v1/routes           # Create new route
GET    /api/v1/routes/{id}      # Get route by ID
PUT    /api/v1/routes/{id}      # Update route
DELETE /api/v1/routes/{id}      # Delete route
GET    /api/v1/routes/search    # Search routes
```

### Service Layer Pattern

Business logic is encapsulated in service classes:

```java
@Service
@Transactional
public class RouteService {
    
    public RouteResponse createRoute(AddRouteRequest request) {
        // Validate input
        validateRouteRequest(request);
        
        // Business logic
        Route route = createRouteEntity(request);
        
        // Save and return
        return mapToResponse(routeRepository.save(route));
    }
}
```

### Exception Handling

Global exception handling provides consistent error responses:

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        // Return standardized error response
    }
}
```

### Validation

Input validation using Bean Validation:

```java
public class AddRouteRequest {
    @NotBlank(message = "Bus number is required")
    @Size(min = 1, max = 10)
    private String busNumber;
    
    @NotNull
    @Min(0) @Max(1)
    private Integer direction;
    
    @NotNull
    @Size(min = 2, message = "Route must have at least 2 stops")
    private Long[] stopIds;
}
```

## Event Handling System

### Event Types

1. **DOM Events**: Click, change, submit, etc.
2. **Custom Events**: Application-specific events
3. **System Events**: Route changes, data updates, etc.

### Event Patterns

```javascript
// 1. Event Delegation (for dynamic content)
eventManager.on('click', '[data-action="delete"]', this.handleDelete, this);

// 2. Custom Events (for component communication)
eventManager.emit('data:updated', { type: 'route', id: routeId });

// 3. System Events (for global state changes)
eventManager.listen('route:changed', this.handleRouteChange, this);
```

### Best Practices

- Use data attributes for event targeting
- Emit events for state changes
- Keep event handlers small and focused
- Always clean up event listeners

## Routing & Navigation

### Route Configuration

```javascript
// Define routes in router.js
this.addRoute('/routes/:id/edit', {
    name: 'edit-route',
    title: 'Edit Route',
    component: (params) => this.loadEditPage(params.id),
    requiresAuth: true
});
```

### Navigation Links

```html
<!-- Use data-route attribute for SPA navigation -->
<a href="/routes/123" data-route="/routes/123">View Route</a>
<button data-route="/routes/add">Add Route</button>
```

### Route Guards

```javascript
// Check authentication before route access
if (route.requiresAuth && !this.isAuthenticated()) {
    this.navigate('/login');
    return;
}
```

## Leaflet Integration

### Basic Setup

```javascript
// Initialize map with enhancements
import { LeafletEnhancements } from './leafletEnhancements.js';

const map = L.map('map').setView([21.025546, 105.845032], 15);
const enhancements = new LeafletEnhancements(map);
```

### Custom Markers

```javascript
// Create custom bus stop markers
const marker = L.marker([lat, lng], {
    icon: L.divIcon({
        html: '<div class="bus-stop-marker">🚌</div>',
        className: 'custom-marker',
        iconSize: [30, 40]
    })
});
```

### Routing Machine

```javascript
// Initialize routing with custom options
const routingControl = L.Routing.control({
    waypoints: [startPoint, endPoint],
    routeWhileDragging: true,
    router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
    })
});
```

### Performance Optimization

- Use marker clustering for many points
- Implement viewport-based loading
- Cache tile layers
- Use canvas renderer for better performance

## API Documentation

### Authentication

Currently, the API doesn't require authentication, but you can add JWT-based auth:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Configure JWT authentication
}
```

### Request/Response Format

All API responses follow this structure:

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { /* actual data */ },
    "timestamp": "2023-10-23T10:30:00Z"
}
```

### Error Responses

```json
{
    "success": false,
    "message": "Validation failed",
    "timestamp": "2023-10-23T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "details": {
        "busNumber": "Bus number is required"
    }
}
```

## Best Practices

### Frontend

1. **Use ES6 Modules**: Import/export for better code organization
2. **Event Delegation**: Handle events efficiently with delegation
3. **Async/Await**: Use modern async patterns
4. **Error Handling**: Always handle promises and API errors
5. **Performance**: Debounce user inputs, lazy load components

### Backend

1. **Layered Architecture**: Controller → Service → Repository
2. **DTO Pattern**: Use DTOs for API contracts
3. **Validation**: Validate all inputs at controller level
4. **Exception Handling**: Use global exception handlers
5. **Transactions**: Use @Transactional for data consistency

### Database

1. **Indexing**: Add indexes for frequently queried columns
2. **Relationships**: Use proper JPA relationships
3. **Migrations**: Use Flyway or Liquibase for schema changes
4. **Connection Pooling**: Configure HikariCP properly

## Troubleshooting

### Common Frontend Issues

**Event handlers not working:**
```javascript
// Ensure DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize your components here
});
```

**Map not displaying:**
```javascript
// Check container has dimensions
#map {
    height: 400px;
    width: 100%;
}
```

**CORS errors:**
```java
// Configure CORS in Spring Boot
@CrossOrigin(origins = {"http://localhost:3000"})
```

### Common Backend Issues

**JPA Entity not found:**
```java
// Check entity scanning
@EntityScan("org.example.model")
@SpringBootApplication
public class Application { }
```

**Transaction rollback:**
```java
// Use proper exception handling
@Transactional(rollbackFor = Exception.class)
public void saveData() { }
```

## Resources

### Documentation

- **Spring Boot**: https://spring.io/projects/spring-boot
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **Leaflet**: https://leafletjs.com/
- **Leaflet Routing Machine**: https://www.liedman.net/leaflet-routing-machine/

### Tutorials

- **Spring Boot REST API**: https://spring.io/guides/gs/rest-service/
- **Leaflet Quick Start**: https://leafletjs.com/examples/quick-start/
- **JavaScript Modules**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules

### Tools

- **Postman**: API testing and documentation
- **Chrome DevTools**: Frontend debugging
- **Spring Boot DevTools**: Hot reloading during development
- **H2 Console**: Database inspection during development

### Libraries & Plugins

**Frontend:**
- Leaflet.markercluster: Marker clustering
- Leaflet.control.geocoder: Address search
- Leaflet-routing-machine: Route calculation

**Backend:**
- Lombok: Reduce boilerplate code
- MapStruct: Object mapping
- Flyway: Database migrations
- SpringDoc OpenAPI: API documentation

### Performance Monitoring

- **Frontend**: Chrome Lighthouse, Web Vitals
- **Backend**: Spring Boot Actuator, Micrometer
- **Database**: Query analysis, connection pool monitoring

### Testing

**Frontend:**
- Jest: Unit testing
- Cypress: E2E testing

**Backend:**
- JUnit 5: Unit testing
- TestContainers: Integration testing
- WireMock: API mocking

---

This guide should help you understand and extend the Bus Route Management System effectively. For specific implementation details, refer to the code examples in the respective modules.