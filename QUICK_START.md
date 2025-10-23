# Quick Start Guide

## Getting Started in 5 Minutes

### Prerequisites
- Java 17+
- Node.js (for development server)
- MySQL database
- Modern web browser

### 1. Database Setup

```sql
CREATE DATABASE busmap;
CREATE USER 'busapp'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON busmap.* TO 'busapp'@'localhost';
```

### 2. Backend Setup

```bash
# Navigate to project root
cd /workspace

# Update application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/busmap
spring.datasource.username=busapp
spring.datasource.password=password

# Run the application
./mvnw spring-boot:run
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd Frontend

# Serve with a simple HTTP server
python -m http.server 8080
# OR
npx serve -s . -p 8080
```

### 4. Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api/v1
- H2 Console (if using H2): http://localhost:8080/h2-console

## Key Features to Try

1. **View Routes**: Navigate to "Routes" to see existing bus routes
2. **Add Route**: Click "Add Route" to create a new bus route
3. **Map Interaction**: Click on map markers to add stops to routes
4. **Route Details**: Click on any route to see its stops and path

## Common Issues

**CORS Error**: Make sure frontend and backend are running on allowed origins
**Database Connection**: Check MySQL is running and credentials are correct
**Map Not Loading**: Check internet connection for tile loading

## Next Steps

- Read the full [Development Guide](DEVELOPMENT_GUIDE.md)
- Explore the API endpoints
- Customize the map styling
- Add authentication if needed