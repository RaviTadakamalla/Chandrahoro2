# Backend Integration Guide

This document explains how the Next.js frontend integrates with the Python FastAPI backend for birth chart calculations using Swiss Ephemeris.

## Architecture Overview

```
Frontend (Next.js 14) ←→ Python Backend (FastAPI) ←→ MySQL Database
        ↓                        ↓                      ↓
   Next.js API Routes    Swiss Ephemeris (Python)   Prisma ORM
        ↓                        ↓
   NextAuth.js Auth         Chart Calculations
        ↓
   Redis Cache
```

## Components

### 1. Python API Client (`src/lib/api/python-client.ts`)

**Purpose**: Handles communication with the Python FastAPI backend.

**Key Features**:
- HTTP client with retry logic
- Error handling and timeout management
- Type-safe request/response interfaces
- Health check functionality

**Usage**:
```typescript
import { pythonAPI } from '@/lib/api/python-client';

// Calculate birth chart
const chart = await pythonAPI.calculateChart({
  birth_date: '1990-01-15',
  birth_time: '14:30:00',
  birth_place: 'Hyderabad, India',
  latitude: 17.3850,
  longitude: 78.4867,
  timezone: 'Asia/Kolkata',
});

// Get transits
const transits = await pythonAPI.getTransits('2024-01-15');

// Health check
const isHealthy = await validateBackendConnection();
```

### 2. Data Transformer (`src/lib/transformers/chart-transformer.ts`)

**Purpose**: Converts data between Python backend format and frontend/Prisma format.

**Key Transformations**:
- `snake_case` ↔ `camelCase` field names
- Date string ↔ Date object conversion
- Python response validation
- Error response formatting

**Usage**:
```typescript
import { 
  transformPythonChartToPrisma,
  transformBirthDataToPython 
} from '@/lib/transformers/chart-transformer';

// Frontend → Python
const pythonRequest = transformBirthDataToPython(frontendData);

// Python → Prisma
const prismaData = transformPythonChartToPrisma(pythonResponse);
```

### 3. API Routes

#### Charts API (`app/api/charts/route.ts`)
- **POST**: Create new birth chart using Python backend
- **GET**: Retrieve user's saved charts

#### Individual Chart API (`app/api/charts/[id]/route.ts`)
- **GET**: Get specific chart
- **PUT**: Update chart metadata
- **DELETE**: Remove chart

#### Transits API (`app/api/transits/route.ts`)
- **GET**: Current planetary transits
- **POST**: Personalized transits for specific chart

#### Compatibility API (`app/api/compatibility/route.ts`)
- **POST**: Calculate compatibility between two charts

## Environment Configuration

### Required Environment Variables

```env
# Python Backend
PYTHON_BACKEND_URL=http://localhost:8000
PYTHON_API_KEY=your-secret-key  # Optional

# Database
DATABASE_URL=mysql://user:pass@localhost:3306/chandrahoro

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret

# Google Maps (for place autocomplete)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key
```

### Development Setup

1. **Start Python Backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Test Connection**:
   ```bash
   npx tsx test-backend-connection.ts
   ```

4. **Start Frontend**:
   ```bash
   npm run dev
   ```

## Data Flow

### Chart Creation Flow

1. **User Input** → Frontend form (birth details)
2. **Frontend Validation** → Zod schema validation
3. **API Route** → `/api/charts` POST endpoint
4. **Data Transformation** → `transformBirthDataToPython()`
5. **Backend Call** → `pythonAPI.calculateChart()`
6. **Response Transformation** → `transformPythonChartToPrisma()`
7. **Database Storage** → Prisma ORM → MySQL
8. **Response** → Chart data returned to frontend

### Error Handling

The integration includes comprehensive error handling:

```typescript
try {
  const chart = await pythonAPI.calculateChart(data);
  return successResponse(chart);
} catch (error) {
  if (error.message.includes('Backend request failed')) {
    return errorResponse('BACKEND_ERROR', 'Calculation service unavailable', 503);
  }
  return errorResponse('CHART_CALCULATION_FAILED', error.message, 500);
}
```

## Testing

### Connection Test Script

Run the comprehensive test script to verify integration:

```bash
npx tsx test-backend-connection.ts
```

**Tests Include**:
- Backend health check
- Chart calculation with real data
- Transit data retrieval
- System information queries
- Data transformation validation

### Manual Testing

1. **Health Check**:
   ```bash
   curl http://localhost:8000/health
   ```

2. **Chart Calculation**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/chart/calculate \
     -H "Content-Type: application/json" \
     -d '{
       "birth_date": "1990-01-15",
       "birth_time": "14:30:00",
       "birth_place": "Hyderabad, India",
       "latitude": 17.3850,
       "longitude": 78.4867,
       "timezone": "Asia/Kolkata"
     }'
   ```

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if Python backend is running on correct port
   - Verify `PYTHON_BACKEND_URL` environment variable
   - Check firewall/network connectivity

2. **Invalid Response Structure**
   - Backend may be returning different data format
   - Check Python backend version compatibility
   - Verify Swiss Ephemeris data files are available

3. **Timeout Errors**
   - Increase `PYTHON_BACKEND_TIMEOUT` value
   - Check backend performance and Swiss Ephemeris loading time
   - Verify system resources (CPU, memory)

4. **Authentication Errors**
   - Check `PYTHON_API_KEY` if backend requires authentication
   - Verify API key format and permissions

### Debug Mode

Enable detailed logging by setting:

```env
LOG_LEVEL=debug
NEXT_PUBLIC_DEBUG_MODE=true
```

This will log:
- All backend requests and responses
- Data transformation steps
- Error details and stack traces

## Performance Considerations

### Caching Strategy

1. **Chart Results**: Cached in MySQL database
2. **Transit Data**: Can be cached in Redis for 1 hour
3. **Backend Health**: Cached for 5 minutes

### Optimization Tips

1. **Connection Pooling**: Reuse HTTP connections to backend
2. **Request Batching**: Combine multiple calculations when possible
3. **Lazy Loading**: Load chart data only when needed
4. **Error Recovery**: Implement exponential backoff for retries

## Security

### API Security

1. **Authentication**: All routes require valid NextAuth session
2. **Authorization**: Users can only access their own charts
3. **Input Validation**: Zod schemas validate all inputs
4. **Rate Limiting**: Prevent abuse of calculation endpoints

### Backend Communication

1. **HTTPS**: Use HTTPS in production
2. **API Keys**: Optional authentication with Python backend
3. **Input Sanitization**: Validate all data before sending to backend
4. **Error Handling**: Don't expose internal errors to clients

## Monitoring

### Health Checks

The system includes multiple health check endpoints:

1. **Frontend Health**: `/api/health`
2. **Backend Health**: `pythonAPI.healthCheck()`
3. **Database Health**: Prisma connection check

### Metrics to Monitor

1. **Response Times**: Chart calculation duration
2. **Error Rates**: Failed calculations vs successful
3. **Backend Availability**: Uptime percentage
4. **Database Performance**: Query execution times

## Future Enhancements

### Planned Features

1. **Caching Layer**: Redis caching for frequently requested charts
2. **Batch Processing**: Calculate multiple charts in single request
3. **Real-time Updates**: WebSocket connection for live transit updates
4. **Offline Mode**: Cache calculations for offline access

### Scalability

1. **Load Balancing**: Multiple Python backend instances
2. **Database Sharding**: Distribute charts across multiple databases
3. **CDN Integration**: Cache static chart images
4. **Microservices**: Split calculations into specialized services
