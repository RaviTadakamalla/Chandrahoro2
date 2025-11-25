# Strength Attributes API Guide

## Overview

The Strength Attributes API calculates 8 personalized strength attributes from a birth chart using Shadbala and Ashtakavarga calculations.

## Endpoint

### Calculate Strength Attributes

```
POST /api/v1/charts/{chart_id}/strength-attributes/calculate
```

**Authentication:** Required (Bearer token)

**Rate Limit:** 10 per hour per user

## Request

```bash
curl -X POST http://localhost:8000/api/v1/charts/{chart_id}/strength-attributes/calculate \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json"
```

**Parameters:**
- `chart_id` (path): UUID of the birth chart

**Headers:**
- `Authorization: Bearer {access_token}` - JWT token from login

## Response

### Success (200 OK)

```json
{
  "birth_chart_id": "550e8400-e29b-41d4-a716-446655440000",
  "attributes": {
    "Risk-Taking": {
      "attribute_name": "Risk-Taking",
      "score": 7.5,
      "grade": "Very Good",
      "interpretation": "Good balance of courage and caution",
      "contributing_factors": {
        "Mars": 0.45,
        "Jupiter": 0.38,
        "Saturn": -0.12
      },
      "confidence": 1.0
    },
    "Loyalty": {
      "attribute_name": "Loyalty",
      "score": 8.2,
      "grade": "Very Good",
      "interpretation": "Strong sense of loyalty and commitment",
      "contributing_factors": {
        "Moon": 0.42,
        "Venus": 0.38,
        "Saturn": 0.28
      },
      "confidence": 1.0
    },
    "Honesty": {
      "attribute_name": "Honesty",
      "score": 8.8,
      "grade": "Excellent",
      "interpretation": "Highly truthful and ethical",
      "contributing_factors": {
        "Mercury": 0.48,
        "Sun": 0.42,
        "Saturn": 0.32
      },
      "confidence": 1.0
    },
    "Hardworking": {
      "attribute_name": "Hardworking",
      "score": 7.9,
      "grade": "Very Good",
      "interpretation": "Strong work ethic and dedication",
      "contributing_factors": {
        "Saturn": 0.52,
        "Mars": 0.38,
        "Sun": 0.25
      },
      "confidence": 1.0
    },
    "Logical": {
      "attribute_name": "Logical",
      "score": 7.3,
      "grade": "Very Good",
      "interpretation": "Strong logical thinking",
      "contributing_factors": {
        "Mercury": 0.55,
        "Saturn": 0.28,
        "Jupiter": 0.22
      },
      "confidence": 1.0
    },
    "Creativity": {
      "attribute_name": "Creativity",
      "score": 6.8,
      "grade": "Good",
      "interpretation": "Good creative thinking",
      "contributing_factors": {
        "Venus": 0.42,
        "Mercury": 0.38,
        "Jupiter": 0.20
      },
      "confidence": 1.0
    },
    "Leadership": {
      "attribute_name": "Leadership",
      "score": 7.6,
      "grade": "Very Good",
      "interpretation": "Strong leadership qualities",
      "contributing_factors": {
        "Sun": 0.52,
        "Jupiter": 0.35,
        "Mars": 0.18
      },
      "confidence": 1.0
    },
    "Adaptability": {
      "attribute_name": "Adaptability",
      "score": 7.1,
      "grade": "Very Good",
      "interpretation": "Strong ability to adapt",
      "contributing_factors": {
        "Mercury": 0.42,
        "Moon": 0.38,
        "Venus": 0.22
      },
      "confidence": 1.0
    }
  },
  "overall_score": 7.65,
  "calculation_timestamp": "2024-01-15T10:30:00"
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "detail": "Chart data not available. Please calculate the chart first."
}
```

#### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

#### 404 Not Found
```json
{
  "detail": "Chart not found"
}
```

#### 500 Internal Server Error
```json
{
  "detail": "Error calculating strength attributes: {error_message}"
}
```

## Response Fields

### CalculatedStrengthProfileResponse
- **birth_chart_id** (string): UUID of the birth chart
- **attributes** (object): Dictionary of 8 strength attributes
- **overall_score** (float): Average of all 8 attributes (1-10 scale)
- **calculation_timestamp** (datetime): When the calculation was performed

### StrengthAttributeResponse
- **attribute_name** (string): Name of the attribute
- **score** (float): Score on 1-10 scale
- **grade** (string): Grade (Excellent, Very Good, Good, Average, Below Average, Weak)
- **interpretation** (string): Human-readable description
- **contributing_factors** (object): Dictionary of planet contributions
- **confidence** (float): Confidence score (0-1 scale)

## 8 Strength Attributes

### 1. Risk-Taking
**Measures:** Willingness to take calculated risks
**Contributing Planets:** Mars (40%), Jupiter (35%), Saturn (-25%)
**Interpretation Examples:**
- Excellent: "Highly courageous and willing to take calculated risks"
- Average: "Prefers stability over risk"
- Weak: "Very cautious, avoids risks"

### 2. Loyalty
**Measures:** Commitment and dedication to relationships/goals
**Contributing Planets:** Moon (35%), Venus (35%), Saturn (30%)
**Interpretation Examples:**
- Excellent: "Deeply committed and devoted"
- Average: "Moderately loyal"
- Weak: "Difficulty maintaining loyalty"

### 3. Honesty
**Measures:** Integrity and truthfulness
**Contributing Planets:** Mercury (35%), Sun (35%), Saturn (30%)
**Interpretation Examples:**
- Excellent: "Highly truthful and ethical"
- Average: "Moderately honest"
- Weak: "Difficulty with truthfulness"

### 4. Hardworking
**Measures:** Diligence and work ethic
**Contributing Planets:** Saturn (40%), Mars (35%), Sun (25%)
**Interpretation Examples:**
- Excellent: "Extremely diligent and hardworking"
- Average: "Moderately hardworking"
- Weak: "Difficulty with sustained effort"

### 5. Logical
**Measures:** Analytical and rational thinking
**Contributing Planets:** Mercury (45%), Saturn (30%), Jupiter (25%)
**Interpretation Examples:**
- Excellent: "Highly analytical and rational"
- Average: "Moderately logical"
- Weak: "Difficulty with logical thinking"

### 6. Creativity
**Measures:** Innovation and creative thinking
**Contributing Planets:** Venus (40%), Mercury (35%), Jupiter (25%)
**Interpretation Examples:**
- Excellent: "Highly creative and innovative"
- Average: "Moderately creative"
- Weak: "Difficulty with creativity"

### 7. Leadership
**Measures:** Ability to lead and inspire
**Contributing Planets:** Sun (45%), Jupiter (35%), Mars (20%)
**Interpretation Examples:**
- Excellent: "Natural leader with strong influence"
- Average: "Moderate leadership ability"
- Weak: "Difficulty with leadership roles"

### 8. Adaptability
**Measures:** Flexibility and ability to adjust
**Contributing Planets:** Mercury (40%), Moon (35%), Venus (25%)
**Interpretation Examples:**
- Excellent: "Highly flexible and adaptable"
- Average: "Moderately adaptable"
- Weak: "Difficulty adapting to change"

## Grade Scale

| Grade | Score Range | Interpretation |
|-------|-------------|-----------------|
| Excellent | 8.5-10.0 | Exceptional strength in this attribute |
| Very Good | 7.0-8.4 | Strong presence of this attribute |
| Good | 5.5-6.9 | Moderate strength in this attribute |
| Average | 4.0-5.4 | Balanced, neither strong nor weak |
| Below Average | 2.5-3.9 | Weaker presence of this attribute |
| Weak | 1.0-2.4 | Significant challenge in this attribute |

## Scoring Methodology

### Two-Factor Calculation
1. **Shadbala Strength** (60% weight)
   - Measures planetary strength through 6 factors
   - Normalized to 0-100 scale

2. **Ashtakavarga Strength** (40% weight)
   - Measures planetary influence through 8-fold division
   - Normalized to 0-100 scale

### Formula
```
Combined Strength = (Shadbala% × 0.6) + (Ashtakavarga% × 0.4)
Attribute Score = (Weighted Sum / Total Weight) × 10
Final Score = Clamp(Score, 1.0, 10.0)
```

## Confidence Score

Confidence indicates the reliability of the calculation:
- **1.0 (100%):** All 3 positive contributing planets are strong
- **0.67 (67%):** 2 of 3 positive contributing planets are strong
- **0.33 (33%):** Only 1 positive contributing planet is strong

## Prerequisites

1. **Birth Chart Must Exist**
   - Chart must be created via `/api/v1/charts` endpoint

2. **Chart Data Must Be Calculated**
   - Chart must have been calculated with full planetary positions
   - Must include planets and houses data

3. **User Must Be Authenticated**
   - Valid JWT token required
   - User must own the chart

## Example Usage

### Step 1: Create a Birth Chart
```bash
curl -X POST http://localhost:8000/api/v1/charts \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Chart",
    "birth_date": "1990-01-15",
    "birth_time": "14:30:00",
    "birth_latitude": 28.6139,
    "birth_longitude": 77.2090,
    "birth_timezone": "Asia/Kolkata",
    "birth_location": "New Delhi, India"
  }'
```

### Step 2: Calculate Chart (via existing chart calculation endpoint)
```bash
curl -X POST http://localhost:8000/api/v1/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "birth_details": {...},
    "preferences": {...}
  }'
```

### Step 3: Calculate Strength Attributes
```bash
curl -X POST http://localhost:8000/api/v1/charts/{chart_id}/strength-attributes/calculate \
  -H "Authorization: Bearer {token}"
```

## Troubleshooting

### "Chart data not available"
- Ensure chart has been calculated with full planetary positions
- Check that chart_data field contains planets and houses

### "Chart not found"
- Verify chart_id is correct
- Ensure you own the chart (created with your account)

### "Error calculating strength attributes"
- Check chart data integrity
- Verify all required fields are present
- Check server logs for detailed error message

## Rate Limiting

- **Limit:** 10 calculations per hour per user
- **Response:** 429 Too Many Requests
- **Retry-After:** Header indicates seconds to wait

## Performance

- **Calculation Time:** ~100-200ms
- **Memory Usage:** ~1-2MB per calculation
- **Caching:** Results can be cached for 1 hour

## Future Enhancements

1. Batch calculation for multiple charts
2. Caching of results
3. Historical tracking of attribute changes
4. Comparison with other users (anonymized)
5. Recommendations based on attributes

