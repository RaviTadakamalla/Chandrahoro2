#!/bin/bash

# Test script for AI Prompt Configuration API
# This script tests all the new AI prompt endpoints

set -e

BASE_URL="http://localhost:8000"
API_URL="$BASE_URL/api/v1"

echo "=========================================="
echo "AI Prompt Configuration API Test"
echo "=========================================="
echo ""

# Step 1: Register a new test user for AI prompts
echo "Step 1: Registering test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aiprompttest@example.com",
    "username": "aiprompttest",
    "password": "testpassword123",
    "full_name": "AI Prompt Test User"
  }')

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')

# If registration fails (user exists), try to login
if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "User already exists, logging in..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "aiprompttest@example.com",
      "password": "testpassword123"
    }')

  ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
fi

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Authentication failed"
  echo "Response: $REGISTER_RESPONSE"
  exit 1
fi

echo "✅ Authenticated successfully"
echo "Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Step 2: Get available modules
echo "Step 2: Getting available AI modules..."
MODULES_RESPONSE=$(curl -s -X GET "$API_URL/ai-prompts/modules" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response:"
echo $MODULES_RESPONSE | jq '.'
echo ""

# Step 3: Get all user prompts
echo "Step 3: Getting all user prompts..."
PROMPTS_RESPONSE=$(curl -s -X GET "$API_URL/ai-prompts/" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Response:"
echo $PROMPTS_RESPONSE | jq '.'
echo ""

# Step 4: Create a custom prompt
echo "Step 4: Creating a custom prompt for chart_interpretation..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/ai-prompts/" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_type": "chart_interpretation",
    "custom_prompt": "You are an expert Vedic astrologer with 20 years of experience. Analyze this birth chart:\n\n{chart_data}\n\nProvide detailed insights on:\n1. Personality traits based on Ascendant and Moon\n2. Career potential from 10th house\n3. Relationship patterns from 7th house\n4. Health considerations from 6th house\n5. Spiritual path and life purpose\n\nBe specific, actionable, and compassionate in your analysis.",
    "output_format": "markdown",
    "is_enabled": true,
    "temperature": 0.7,
    "max_tokens": 2000
  }')

echo "Response:"
echo $CREATE_RESPONSE | jq '.'

PROMPT_ID=$(echo $CREATE_RESPONSE | jq -r '.id')
echo ""
echo "Created prompt ID: $PROMPT_ID"
echo ""

# Step 5: Get the created prompt
if [ "$PROMPT_ID" != "null" ] && [ ! -z "$PROMPT_ID" ]; then
  echo "Step 5: Getting the created prompt..."
  GET_PROMPT_RESPONSE=$(curl -s -X GET "$API_URL/ai-prompts/$PROMPT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  
  echo "Response:"
  echo $GET_PROMPT_RESPONSE | jq '.'
  echo ""
  
  # Step 6: Update the prompt
  echo "Step 6: Updating the prompt..."
  UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/ai-prompts/$PROMPT_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "custom_prompt": "UPDATED: You are an expert Vedic astrologer with 20 years of experience...",
      "is_enabled": true,
      "change_notes": "Added experience level and improved structure"
    }')
  
  echo "Response:"
  echo $UPDATE_RESPONSE | jq '.'
  echo ""
  
  # Step 7: Get modules again to see custom prompt status
  echo "Step 7: Getting modules again to verify custom prompt..."
  MODULES_RESPONSE_2=$(curl -s -X GET "$API_URL/ai-prompts/modules" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  echo "Response (showing chart_interpretation):"
  echo $MODULES_RESPONSE_2 | jq '.modules[] | select(.module_type == "chart_interpretation")'
  echo ""

  # Step 8: Reset to default
  echo "Step 8: Resetting to default..."
  RESET_RESPONSE=$(curl -s -X POST "$API_URL/ai-prompts/reset-to-default" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "module_type": "chart_interpretation"
    }')
  
  echo "Response:"
  echo $RESET_RESPONSE | jq '.'
  echo ""
fi

echo "=========================================="
echo "✅ AI Prompt Configuration API Test Complete!"
echo "=========================================="

