#!/bin/bash

# Test script for Jaimini methodology
# Tests Chara Karakas, Chara Dasha, and other Jaimini calculations

echo "=== Testing Jaimini Methodology ==="
echo ""

# Login and get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jaimini_test@example.com",
    "password": "TestPassword123!"
  }')

echo "$LOGIN_RESPONSE" > /tmp/login_response.json

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('access_token', ''))")

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test Jaimini chart calculation
echo "2. Calculating Jaimini chart..."
echo "   Birth: Jan 1, 1990, 12:00 PM, New Delhi (28.6139°N, 77.2090°E)"
echo ""

curl -s -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "birth_details": {
      "date": "1990-01-01",
      "time": "12:00:00",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "timezone": "Asia/Kolkata",
      "location_name": "New Delhi, India",
      "name": "Test Person"
    },
    "preferences": {
      "methodology": "jaimini",
      "ayanamsha": "Lahiri",
      "house_system": "Whole Sign",
      "chart_style": "South Indian"
    }
  }' | python3 -m json.tool > /tmp/jaimini_test.json

# Check if calculation was successful
if [ $? -eq 0 ]; then
  echo "✅ Chart calculation successful"
  echo ""
  
  # Display Chara Karakas
  echo "3. Chara Karakas (Variable Significators):"
  echo "   ========================================="
  python3 << 'EOF'
import json
with open('/tmp/jaimini_test.json', 'r') as f:
    data = json.load(f)
    if 'data' in data and 'jaimini_data' in data['data']:
        karakas = data['data']['jaimini_data'].get('chara_karakas', {})
        for karaka_name, karaka_data in karakas.items():
            planet = karaka_data.get('planet', 'N/A')
            degree = karaka_data.get('degree_in_sign', 0)
            print(f"   {karaka_name:15} → {planet:10} ({degree:.2f}°)")
    else:
        print("   ❌ No Jaimini data found")
EOF
  echo ""
  
  # Display Karakamsha
  echo "4. Karakamsha (Atmakaraka's Navamsa):"
  echo "   ===================================="
  python3 << 'EOF'
import json
with open('/tmp/jaimini_test.json', 'r') as f:
    data = json.load(f)
    if 'data' in data and 'jaimini_data' in data['data']:
        karakamsha = data['data']['jaimini_data'].get('karakamsha', {})
        planet = karakamsha.get('planet', 'N/A')
        navamsa_sign = karakamsha.get('navamsa_sign_name', 'N/A')
        rasi_sign = karakamsha.get('rasi_sign_name', 'N/A')
        print(f"   Atmakaraka: {planet}")
        print(f"   Rasi Sign: {rasi_sign}")
        print(f"   Navamsa Sign (Karakamsha): {navamsa_sign}")
    else:
        print("   ❌ No Karakamsha data found")
EOF
  echo ""
  
  # Display Chara Dasha
  echo "5. Chara Dasha (First 3 Maha Dashas):"
  echo "   ===================================="
  python3 << 'EOF'
import json
with open('/tmp/jaimini_test.json', 'r') as f:
    data = json.load(f)
    if 'data' in data and 'jaimini_data' in data['data']:
        chara_dasha = data['data']['jaimini_data'].get('chara_dasha', {})
        direction = chara_dasha.get('direction', 'N/A')
        lagna_sign = chara_dasha.get('lagna_sign', 'N/A')
        print(f"   Lagna: {lagna_sign}")
        print(f"   Direction: {direction}")
        print("")
        
        maha_dashas = chara_dasha.get('maha_dashas', [])
        for i, md in enumerate(maha_dashas[:3]):
            sign = md.get('sign_name', 'N/A')
            lord = md.get('lord', 'N/A')
            years = md.get('years', 0)
            start = md.get('start_date', 'N/A')[:10]
            end = md.get('end_date', 'N/A')[:10]
            print(f"   {i+1}. {sign:12} ({lord:7}) - {years:2} years - {start} to {end}")
    else:
        print("   ❌ No Chara Dasha data found")
EOF
  echo ""
  
  # Display current dasha
  echo "6. Current Running Dasha:"
  echo "   ======================="
  python3 << 'EOF'
import json
with open('/tmp/jaimini_test.json', 'r') as f:
    data = json.load(f)
    if 'data' in data and 'jaimini_data' in data['data']:
        chara_dasha = data['data']['jaimini_data'].get('chara_dasha', {})
        current = chara_dasha.get('current_dasha', {})
        if current:
            maha = current.get('maha_dasha', 'N/A')
            maha_lord = current.get('maha_dasha_lord', 'N/A')
            antar = current.get('antar_dasha', 'N/A')
            antar_lord = current.get('antar_dasha_lord', 'N/A')
            print(f"   Maha Dasha: {maha} ({maha_lord})")
            print(f"   Antar Dasha: {antar} ({antar_lord})")
        else:
            print("   ❌ No current dasha found")
    else:
        print("   ❌ No Chara Dasha data found")
EOF
  echo ""
  
  echo "✅ All tests completed successfully!"
  echo ""
  echo "Full JSON output saved to: /tmp/jaimini_test.json"
  
else
  echo "❌ Chart calculation failed"
  exit 1
fi

