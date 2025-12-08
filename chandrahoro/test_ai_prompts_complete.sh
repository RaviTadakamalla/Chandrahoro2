#!/bin/bash

# Test AI Prompts API - Complete Test Suite
# Tests all endpoints including new initialize-defaults and test endpoints

set -e

echo "========================================="
echo "AI Prompts API - Complete Test Suite"
echo "========================================="
echo ""

# Configuration
API_URL="http://localhost:8000"
EMAIL="admin@chandrahoro.com"
PASSWORD="admin123"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login
echo -e "${YELLOW}Step 1: Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Step 2: Initialize System Defaults (Admin only)
echo -e "${YELLOW}Step 2: Initializing system default prompts...${NC}"
INIT_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/ai-prompts/initialize-defaults" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $INIT_RESPONSE"

if echo "$INIT_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ System defaults initialized${NC}"
else
  echo -e "${YELLOW}⚠ System defaults may already exist${NC}"
fi
echo ""

# Step 3: Get Available Modules
echo -e "${YELLOW}Step 3: Getting available AI modules...${NC}"
MODULES_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/ai-prompts/modules" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $MODULES_RESPONSE"

if echo "$MODULES_RESPONSE" | grep -q '"modules"'; then
  MODULE_COUNT=$(echo "$MODULES_RESPONSE" | grep -o '"module_type"' | wc -l)
  echo -e "${GREEN}✓ Retrieved $MODULE_COUNT AI modules${NC}"
else
  echo -e "${RED}✗ Failed to get modules${NC}"
fi
echo ""

# Step 4: Create Custom Prompt
echo -e "${YELLOW}Step 4: Creating custom prompt for CHART_INTERPRETATION...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/ai-prompts/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_type": "chart_interpretation",
    "custom_prompt": "Analyze the birth chart with focus on {chart_data}. Birth info: {birth_info}. Provide detailed insights about planetary positions: {planets}.",
    "output_format": "markdown",
    "temperature": 0.8,
    "max_tokens": 3000,
    "is_enabled": true
  }')

echo "Response: $CREATE_RESPONSE"

PROMPT_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PROMPT_ID" ]; then
  echo -e "${GREEN}✓ Custom prompt created with ID: $PROMPT_ID${NC}"
else
  echo -e "${RED}✗ Failed to create custom prompt${NC}"
fi
echo ""

# Step 5: Test Prompt with Sample Data
echo -e "${YELLOW}Step 5: Testing prompt with sample data...${NC}"
TEST_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/ai-prompts/test" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_type": "chart_interpretation",
    "custom_prompt": "Analyze the birth chart: {chart_data}. Birth: {birth_info}. Planets: {planets}.",
    "temperature": 0.7,
    "max_tokens": 2000
  }')

echo "Response: $TEST_RESPONSE"

if echo "$TEST_RESPONSE" | grep -q '"filled_prompt"'; then
  echo -e "${GREEN}✓ Prompt tested successfully${NC}"
  
  # Extract and display template variables
  TEMPLATE_VARS=$(echo "$TEST_RESPONSE" | grep -o '"template_variables":\[[^]]*\]')
  echo "Template variables found: $TEMPLATE_VARS"
  
  # Check for warnings
  if echo "$TEST_RESPONSE" | grep -q '"warnings":\['; then
    WARNINGS=$(echo "$TEST_RESPONSE" | grep -o '"warnings":\[[^]]*\]')
    echo "Warnings: $WARNINGS"
  fi
else
  echo -e "${RED}✗ Failed to test prompt${NC}"
fi
echo ""

# Step 6: Get User's Custom Prompts
echo -e "${YELLOW}Step 6: Getting user's custom prompts...${NC}"
USER_PROMPTS_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/ai-prompts/?include_system=true" \
  -H "Authorization: Bearer $TOKEN")

echo "Response: $USER_PROMPTS_RESPONSE"

if echo "$USER_PROMPTS_RESPONSE" | grep -q '"prompts"'; then
  PROMPT_COUNT=$(echo "$USER_PROMPTS_RESPONSE" | grep -o '"id"' | wc -l)
  echo -e "${GREEN}✓ Retrieved $PROMPT_COUNT prompts${NC}"
else
  echo -e "${RED}✗ Failed to get user prompts${NC}"
fi
echo ""

# Step 7: Update Custom Prompt
if [ -n "$PROMPT_ID" ]; then
  echo -e "${YELLOW}Step 7: Updating custom prompt...${NC}"
  UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/v1/ai-prompts/$PROMPT_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "custom_prompt": "UPDATED: Analyze the birth chart with enhanced focus on {chart_data}. Birth info: {birth_info}. Detailed planetary analysis: {planets}.",
      "temperature": 0.9,
      "change_notes": "Increased temperature and enhanced prompt"
    }')

  echo "Response: $UPDATE_RESPONSE"

  if echo "$UPDATE_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Prompt updated successfully${NC}"
  else
    echo -e "${RED}✗ Failed to update prompt${NC}"
  fi
  echo ""
fi

# Step 8: Get Specific Prompt
if [ -n "$PROMPT_ID" ]; then
  echo -e "${YELLOW}Step 8: Getting specific prompt by ID...${NC}"
  GET_PROMPT_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/ai-prompts/$PROMPT_ID" \
    -H "Authorization: Bearer $TOKEN")

  echo "Response: $GET_PROMPT_RESPONSE"

  if echo "$GET_PROMPT_RESPONSE" | grep -q '"id"'; then
    echo -e "${GREEN}✓ Retrieved prompt successfully${NC}"
  else
    echo -e "${RED}✗ Failed to get prompt${NC}"
  fi
  echo ""
fi

# Step 9: Reset to Default
echo -e "${YELLOW}Step 9: Resetting DASHA_PREDICTIONS to default...${NC}"
RESET_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/ai-prompts/reset-to-default" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "module_type": "dasha_predictions"
  }')

echo "Response: $RESET_RESPONSE"

if echo "$RESET_RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Reset to default successful${NC}"
else
  echo -e "${YELLOW}⚠ Reset may have failed or no custom prompt existed${NC}"
fi
echo ""

echo "========================================="
echo -e "${GREEN}✓ All tests completed!${NC}"
echo "========================================="

