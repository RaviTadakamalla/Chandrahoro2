#!/bin/bash

# Test KP chart calculation

# Get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_parashara@example.com",
    "password": "TestPassword123!"
  }' | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

echo "Token: $TOKEN"
echo ""
echo "Testing KP chart calculation..."
echo ""

# Test KP chart
curl -s -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d @- <<'EOF' | python3 -m json.tool
{
  "birth_details": {
    "name": "Test KP User",
    "date": "1990-01-01",
    "time": "12:00:00",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "timezone": "Asia/Kolkata",
    "location_name": "New Delhi, India",
    "time_unknown": false
  },
  "preferences": {
    "methodology": "kp",
    "ayanamsha": "Krishnamurti",
    "house_system": "Placidus",
    "chart_style": "South Indian"
  }
}
EOF

