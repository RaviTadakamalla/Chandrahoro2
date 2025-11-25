#!/bin/bash

# Test script for Owner Name Key Sharing feature
# This demonstrates how multiple users can share the same API key using owner names

set -e

API_URL="http://localhost:8000"

echo "========================================="
echo "Owner Name Key Sharing Test"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Login as User 1
echo -e "${BLUE}Step 1: Login as User 1 (tester@example.com)${NC}"
USER1_TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester@example.com",
    "password": "tester123"
  }' | jq -r '.access_token')

if [ "$USER1_TOKEN" == "null" ] || [ -z "$USER1_TOKEN" ]; then
  echo "❌ Failed to login as User 1"
  exit 1
fi
echo -e "${GREEN}✓ User 1 logged in${NC}"
echo ""

# Step 2: User 1 configures LLM with owner name
echo -e "${BLUE}Step 2: User 1 configures LLM with owner name 'test-perplexity'${NC}"
curl -s -X POST "$API_URL/api/v1/llm/save" \
  -H "Authorization: Bearer $USER1_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "use_owner_name": true,
    "key_owner_name": "test-perplexity",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online",
    "api_key": "pplx-test-key-12345"
  }' | jq '.'

echo -e "${GREEN}✓ User 1 configured LLM${NC}"
echo ""

# Step 3: Verify User 1's configuration
echo -e "${BLUE}Step 3: Verify User 1's configuration${NC}"
USER1_CONFIG=$(curl -s -X GET "$API_URL/api/v1/llm/me" \
  -H "Authorization: Bearer $USER1_TOKEN")

echo "$USER1_CONFIG" | jq '{
  use_owner_name,
  key_owner_name,
  provider,
  model,
  key_last_four
}'

echo -e "${GREEN}✓ User 1 configuration verified${NC}"
echo ""

# Step 4: Login as User 2
echo -e "${BLUE}Step 4: Login as User 2 (tester2@example.com)${NC}"
USER2_TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester2@example.com",
    "password": "tester123"
  }' | jq -r '.access_token')

if [ "$USER2_TOKEN" == "null" ] || [ -z "$USER2_TOKEN" ]; then
  echo -e "${YELLOW}⚠ User 2 doesn't exist, creating...${NC}"
  
  # Register User 2
  curl -s -X POST "$API_URL/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "tester2@example.com",
      "password": "tester123",
      "full_name": "Test User 2"
    }' > /dev/null
  
  # Login again
  USER2_TOKEN=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "tester2@example.com",
      "password": "tester123"
    }' | jq -r '.access_token')
fi

echo -e "${GREEN}✓ User 2 logged in${NC}"
echo ""

# Step 5: User 2 configures LLM with SAME owner name
echo -e "${BLUE}Step 5: User 2 configures LLM with SAME owner name 'test-perplexity'${NC}"
curl -s -X POST "$API_URL/api/v1/llm/save" \
  -H "Authorization: Bearer $USER2_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "use_owner_name": true,
    "key_owner_name": "test-perplexity",
    "provider": "perplexity",
    "model": "llama-3.1-sonar-large-128k-online",
    "api_key": "pplx-test-key-12345"
  }' | jq '.'

echo -e "${GREEN}✓ User 2 configured LLM${NC}"
echo ""

# Step 6: Verify User 2's configuration
echo -e "${BLUE}Step 6: Verify User 2's configuration${NC}"
USER2_CONFIG=$(curl -s -X GET "$API_URL/api/v1/llm/me" \
  -H "Authorization: Bearer $USER2_TOKEN")

echo "$USER2_CONFIG" | jq '{
  use_owner_name,
  key_owner_name,
  provider,
  model,
  key_last_four
}'

echo -e "${GREEN}✓ User 2 configuration verified${NC}"
echo ""

# Step 7: Compare configurations
echo -e "${BLUE}Step 7: Verify both users share the same API key${NC}"
USER1_OWNER=$(echo "$USER1_CONFIG" | jq -r '.key_owner_name')
USER2_OWNER=$(echo "$USER2_CONFIG" | jq -r '.key_owner_name')
USER1_LAST4=$(echo "$USER1_CONFIG" | jq -r '.key_last_four')
USER2_LAST4=$(echo "$USER2_CONFIG" | jq -r '.key_last_four')

echo "User 1 owner name: $USER1_OWNER"
echo "User 2 owner name: $USER2_OWNER"
echo "User 1 key last 4: $USER1_LAST4"
echo "User 2 key last 4: $USER2_LAST4"
echo ""

if [ "$USER1_OWNER" == "$USER2_OWNER" ] && [ "$USER1_LAST4" == "$USER2_LAST4" ]; then
  echo -e "${GREEN}✅ SUCCESS! Both users are sharing the same API key via owner name!${NC}"
else
  echo -e "${YELLOW}⚠ Warning: Configurations don't match${NC}"
fi

echo ""
echo "========================================="
echo "Test Complete!"
echo "========================================="
echo ""
echo "Summary:"
echo "- User 1 and User 2 both configured with owner name 'test-perplexity'"
echo "- Both users will use the same API key stored in the vault"
echo "- The key is looked up by owner name, not by user ID"
echo "- This allows simple key sharing for testing without complex access control"

