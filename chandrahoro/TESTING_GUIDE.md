# Testing Guide for Phase 1 Implementation

## Overview
This guide provides comprehensive testing recommendations for the newly implemented Phase 1 features.

## Unit Tests

### 1. AspectIntensityCalculator Tests

**File:** `tests/services/test_aspect_intensity_service.py`

```python
def test_calculate_aspect_intensity():
    """Test single date intensity calculation."""
    calculator = AspectIntensityCalculator()
    intensity = calculator.calculate_aspect_intensity(
        aspect_name="Wealth",
        birth_date=date(1990, 1, 15),
        birth_time="14:30:00",
        latitude=28.6139,
        longitude=77.2090,
        timezone="Asia/Kolkata",
        target_date=datetime(2024, 1, 15),
    )
    assert 1.0 <= intensity.intensity_score <= 10.0
    assert intensity.confidence_band_low <= intensity.intensity_score
    assert intensity.intensity_score <= intensity.confidence_band_high

def test_calculate_timeline():
    """Test timeline generation."""
    calculator = AspectIntensityCalculator()
    timeline = calculator.calculate_timeline(
        aspect_name="Health",
        birth_date=date(1990, 1, 15),
        birth_time="14:30:00",
        latitude=28.6139,
        longitude=77.2090,
        timezone="Asia/Kolkata",
        start_date=datetime(2024, 1, 1),
        end_date=datetime(2024, 1, 31),
        interval_days=7,
    )
    assert len(timeline) > 0
    assert all(1.0 <= point.intensity_score <= 10.0 for point in timeline)

def test_confidence_bands():
    """Test confidence band calculation."""
    calculator = AspectIntensityCalculator()
    factors = {
        "transit_influence": 6.0,
        "dasha_influence": 5.5,
        "house_influence": 7.0,
    }
    low, high = calculator._calculate_confidence_bands(6.2, factors)
    assert low < 6.2 < high
    assert high - low > 0

def test_score_aggregation():
    """Test weighted score aggregation."""
    calculator = AspectIntensityCalculator()
    factors = {
        "transit_influence": 8.0,
        "dasha_influence": 6.0,
        "house_influence": 7.0,
    }
    score = calculator._aggregate_scores(factors)
    # Expected: 8.0*0.4 + 6.0*0.35 + 7.0*0.25 = 7.15
    assert 7.0 <= score <= 7.3
```

### 2. API Endpoint Tests

**File:** `tests/api/test_charts.py`

```python
@pytest.mark.asyncio
async def test_create_chart(client, auth_token):
    """Test chart creation."""
    response = client.post(
        "/api/v1/charts",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "name": "Test Chart",
            "birth_date": "1990-01-15",
            "birth_time": "14:30:00",
            "birth_latitude": 28.6139,
            "birth_longitude": 77.2090,
            "birth_timezone": "Asia/Kolkata",
            "birth_location": "New Delhi",
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Chart"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_charts(client, auth_token):
    """Test chart listing."""
    response = client.get(
        "/api/v1/charts",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_get_chart(client, auth_token, chart_id):
    """Test get chart."""
    response = client.get(
        f"/api/v1/charts/{chart_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == chart_id

@pytest.mark.asyncio
async def test_update_chart(client, auth_token, chart_id):
    """Test chart update."""
    response = client.put(
        f"/api/v1/charts/{chart_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={"name": "Updated Name"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"

@pytest.mark.asyncio
async def test_delete_chart(client, auth_token, chart_id):
    """Test chart deletion."""
    response = client.delete(
        f"/api/v1/charts/{chart_id}",
        headers={"Authorization": f"Bearer {auth_token}"},
    )
    assert response.status_code == 200
```

## Integration Tests

### 1. Chart Workflow Test

```python
@pytest.mark.asyncio
async def test_chart_workflow(client, auth_token):
    """Test complete chart workflow."""
    # Create chart
    create_response = client.post(
        "/api/v1/charts",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={...}
    )
    chart_id = create_response.json()["id"]
    
    # Create strength profile
    profile_response = client.post(
        f"/api/v1/charts/{chart_id}/strength-profile",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={
            "risk_taking": 7.5,
            "loyalty": 8.0,
            ...
        }
    )
    assert profile_response.status_code == 200
    
    # Get timeline
    timeline_response = client.get(
        f"/api/v1/charts/{chart_id}/timeline",
        headers={"Authorization": f"Bearer {auth_token}"},
        params={
            "start_date": "2024-01-01",
            "end_date": "2024-01-31",
            "aspects": "Wealth,Health",
        }
    )
    assert timeline_response.status_code == 200
    data = timeline_response.json()
    assert "Wealth" in data["aspects"]
    assert "Health" in data["aspects"]
```

## Rate Limiting Tests

### 1. Rate Limit Enforcement

```python
@pytest.mark.asyncio
async def test_rate_limit_chart_creation(client, auth_token):
    """Test rate limiting on chart creation."""
    # Create 10 charts (limit)
    for i in range(10):
        response = client.post(
            "/api/v1/charts",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={...}
        )
        assert response.status_code == 200
    
    # 11th request should be rate limited
    response = client.post(
        "/api/v1/charts",
        headers={"Authorization": f"Bearer {auth_token}"},
        json={...}
    )
    assert response.status_code == 429
    assert "Retry-After" in response.headers
```

## Security Tests

### 1. Authentication Tests

```python
@pytest.mark.asyncio
async def test_unauthorized_access(client):
    """Test unauthorized access."""
    response = client.get("/api/v1/charts")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_invalid_token(client):
    """Test invalid token."""
    response = client.get(
        "/api/v1/charts",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
```

### 2. User Ownership Tests

```python
@pytest.mark.asyncio
async def test_user_ownership_verification(client, auth_token_1, auth_token_2, chart_id):
    """Test user ownership verification."""
    # User 2 should not access User 1's chart
    response = client.get(
        f"/api/v1/charts/{chart_id}",
        headers={"Authorization": f"Bearer {auth_token_2}"},
    )
    assert response.status_code == 404
```

## Manual Testing Checklist

### Chart Management
- [ ] Create chart with all fields
- [ ] Create chart with minimal fields
- [ ] List charts with pagination
- [ ] Get specific chart
- [ ] Update chart name
- [ ] Update chart preferences
- [ ] Delete chart
- [ ] Verify chart not found after deletion

### Profile Management
- [ ] Create strength profile
- [ ] Update strength profile
- [ ] Get strength profile
- [ ] Update user profile
- [ ] Get user profile
- [ ] Verify profile persistence

### Timeline
- [ ] Get timeline for single aspect
- [ ] Get timeline for multiple aspects
- [ ] Test date range handling
- [ ] Test interval parameter
- [ ] Verify confidence bands
- [ ] Verify dasha period info

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Access protected endpoint with token
- [ ] Verify token expiration
- [ ] Test invalid credentials

### Error Handling
- [ ] Invalid chart ID
- [ ] Invalid date range
- [ ] Missing required fields
- [ ] Invalid aspect name
- [ ] Unauthorized access
- [ ] Rate limit exceeded

## Performance Testing

### Load Testing
```bash
# Using Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/v1/charts

# Using wrk
wrk -t4 -c100 -d30s \
  -H "Authorization: Bearer {token}" \
  http://localhost:8000/api/v1/charts
```

### Database Query Performance
- [ ] Verify indexes on foreign keys
- [ ] Test pagination performance
- [ ] Test timeline calculation speed
- [ ] Monitor database connection pool

## Testing Tools

### Recommended Tools
1. **pytest** - Unit testing framework
2. **pytest-asyncio** - Async test support
3. **httpx** - HTTP client for testing
4. **Postman** - Manual API testing
5. **Apache Bench** - Load testing
6. **wrk** - HTTP benchmarking

### Setup
```bash
pip install pytest pytest-asyncio httpx
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: pip install -r requirements.txt
      - run: pytest tests/
```

## Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** 70%+ coverage
- **API Endpoints:** 100% coverage
- **Error Paths:** 90%+ coverage

## Next Steps

1. Write unit tests for AspectIntensityCalculator
2. Write integration tests for API workflows
3. Set up pytest configuration
4. Configure CI/CD pipeline
5. Run manual testing checklist
6. Performance testing and optimization

