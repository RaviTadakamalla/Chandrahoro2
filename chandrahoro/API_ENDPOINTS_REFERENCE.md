# API Endpoints Reference - Phase 1 Implementation

## Authentication Endpoints

### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "full_name": "Full Name"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

Response: 200 OK
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

## Chart Management Endpoints

### Create Chart
```
POST /api/v1/charts
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "My Birth Chart",
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "birth_latitude": 28.6139,
  "birth_longitude": 77.2090,
  "birth_timezone": "Asia/Kolkata",
  "birth_location": "New Delhi, India",
  "ayanamsha": "Lahiri",
  "house_system": "Whole Sign",
  "chart_style": "North Indian",
  "is_public": "N",
  "notes": "Optional notes"
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "My Birth Chart",
  "birth_date": "1990-01-15",
  "birth_time": "14:30:00",
  "birth_latitude": 28.6139,
  "birth_longitude": 77.2090,
  "birth_timezone": "Asia/Kolkata",
  "birth_location": "New Delhi, India",
  "ayanamsha": "Lahiri",
  "house_system": "Whole Sign",
  "chart_style": "North Indian",
  "is_public": "N",
  "notes": "Optional notes",
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### List Charts
```
GET /api/v1/charts?skip=0&limit=10
Authorization: Bearer {access_token}

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "My Birth Chart",
    ...
  }
]
```

### Get Chart
```
GET /api/v1/charts/{chart_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "name": "My Birth Chart",
  ...
}
```

### Update Chart
```
PUT /api/v1/charts/{chart_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "ayanamsha": "Raman",
  "notes": "Updated notes"
}

Response: 200 OK
{
  "id": "uuid",
  "name": "Updated Name",
  ...
}
```

### Delete Chart
```
DELETE /api/v1/charts/{chart_id}
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Chart deleted successfully"
}
```

## Profile Management Endpoints

### Get Strength Profile
```
GET /api/v1/charts/{chart_id}/strength-profile
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "birth_chart_id": "uuid",
  "risk_taking": 7.5,
  "loyalty": 8.0,
  "honesty": 9.0,
  "hardworking": 8.5,
  "logical": 7.0,
  "creativity": 6.5,
  "leadership": 7.5,
  "adaptability": 8.0,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### Create/Update Strength Profile
```
POST /api/v1/charts/{chart_id}/strength-profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "risk_taking": 7.5,
  "loyalty": 8.0,
  "honesty": 9.0,
  "hardworking": 8.5,
  "logical": 7.0,
  "creativity": 6.5,
  "leadership": 7.5,
  "adaptability": 8.0
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "birth_chart_id": "uuid",
  "risk_taking": 7.5,
  ...
}
```

### Get User Profile
```
GET /api/v1/users/profile
Authorization: Bearer {access_token}

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "role": "individual",
  "phone": "+91-9999999999",
  "avatar_url": "https://...",
  "bio": "User bio",
  "timezone": "Asia/Kolkata",
  "language": "en",
  "is_verified": true,
  "is_email_verified": true,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": "2024-01-15T10:30:00"
}
```

### Update User Profile
```
PUT /api/v1/users/profile
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "full_name": "Updated Name",
  "phone": "+91-9999999999",
  "bio": "Updated bio",
  "timezone": "Asia/Kolkata",
  "language": "en"
}

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Updated Name",
  ...
}
```

## Timeline Endpoints

### Get Timeline
```
GET /api/v1/charts/{chart_id}/timeline?start_date=2024-01-01&end_date=2024-12-31&aspects=Wealth,Health,Business&interval_days=7
Authorization: Bearer {access_token}

Response: 200 OK
{
  "chart_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "aspects": {
    "Wealth": [
      {
        "date": "2024-01-01T00:00:00",
        "intensity_score": 6.5,
        "confidence_band_low": 5.2,
        "confidence_band_high": 7.8,
        "dasha_period": "Jupiter - Mercury",
        "transit_info": "Jupiter in Scorpio H11; Venus in Libra H10"
      },
      {
        "date": "2024-01-08T00:00:00",
        "intensity_score": 6.7,
        ...
      }
    ],
    "Health": [...],
    "Business": [...]
  },
  "dasha_periods": []
}
```

### Save Timeline
```
POST /api/v1/charts/{chart_id}/timeline/save?aspect_name=Wealth
Authorization: Bearer {access_token}

Response: 200 OK
{
  "message": "Timeline saved successfully"
}
```

## Query Parameters

### Timeline Endpoint
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `aspects` (optional): Comma-separated aspect names (default: all)
  - Valid values: Wealth, Health, Business, Spouse, Kids, Career
- `interval_days` (optional): Days between data points (1-30, default: 7)

### Chart List Endpoint
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum records to return (1-100, default: 10)

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not enough permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Chart not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Chart calculation limit exceeded"
}
```
Headers: `Retry-After: 3600`

### 500 Internal Server Error
```json
{
  "detail": "Error calculating timeline"
}
```

## Rate Limits

- Chart Creation: 10 per hour per user
- Timeline Calculations: 10 per hour per user
- General API: 100 per hour per IP

## Authentication

All endpoints (except `/health` and `/api/v1/health`) require:
```
Authorization: Bearer {access_token}
```

Token obtained from `/api/v1/auth/login` or `/api/v1/auth/register`

## Content Types

- Request: `application/json`
- Response: `application/json`

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

