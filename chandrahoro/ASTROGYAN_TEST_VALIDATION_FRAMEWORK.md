# Astrogyan.com Test Validation Framework

## Overview

This framework provides a systematic approach to validate Chandrahoro calculations against Astrogyan.com reference data across multiple test cases.

---

## Test Case 1: Ravi Tadakamalla (Primary Reference)

### Birth Details
```
Name: Ravi Tadakamalla
Date: September 6, 1963
Time: 11:00:00 AM
Location: Khammam, India
Latitude: 17°15'N (17.25°)
Longitude: 80°09'E (80.15°)
Timezone: Asia/Kolkata (UTC+5:30)
```

### Reference Data (Astrogyan.com)

#### Ascendant
- Sign: Virgo
- Degree: 17-18°
- Nakshatra: Hasta
- Pada: 2-3

#### Planetary Positions

| Planet | Sign | Degree | Nakshatra | Pada | Retrograde | House |
|--------|------|--------|-----------|------|-----------|-------|
| Sun | Virgo | ~20° | Hasta | 3 | No | 1 |
| Moon | Pisces | ~15° | Uttara Bhadrapada | 2 | No | 5 |
| Mercury | Virgo | ~5° | Hasta | 1 | No | 1 |
| Venus | Libra | ~10° | Swati | 1 | No | 2 |
| Mars | Virgo | ~25° | Chitra | 1 | No | 1 |
| Jupiter | Aries | ~20° | Bharani | 3 | No | 9 |
| Saturn | Aquarius | ~15° | Dhanishta | 2 | No | 7 |
| Rahu | Taurus | ~10° | Rohini | 2 | - | 10 |
| Ketu | Scorpio | ~10° | Jyeshtha | 2 | - | 4 |

#### Dasha Information
- Birth Nakshatra: Hasta (13)
- Birth Dasha: Moon
- Dasha Balance: ~X years (to be verified)

### Validation Checklist

#### Ascendant
- [ ] Sign matches: Virgo
- [ ] Degree within ±2°: 17-18°
- [ ] Nakshatra matches: Hasta
- [ ] Pada matches: 2-3

#### Each Planet
- [ ] Sign matches exactly
- [ ] Degree within ±10 minutes
- [ ] Nakshatra matches exactly
- [ ] Pada within ±1
- [ ] Retrograde status matches
- [ ] House placement matches

#### Dasha
- [ ] Birth nakshatra matches
- [ ] Birth dasha matches
- [ ] Dasha balance within ±1 month
- [ ] Antardasha sequence correct

---

## Test Case 2: Morning Birth

### Birth Details
```
Name: Test Case 2
Date: 1980-03-15
Time: 06:30:00 AM
Location: Delhi, India
Latitude: 28.7041°N
Longitude: 77.1025°E
Timezone: Asia/Kolkata (UTC+5:30)
```

### Validation Points
- [ ] Ascendant sign and degree
- [ ] All planetary signs
- [ ] All planetary degrees
- [ ] All nakshatras
- [ ] All house placements
- [ ] Dasha calculations

---

## Test Case 3: Afternoon Birth

### Birth Details
```
Name: Test Case 3
Date: 1975-07-22
Time: 14:45:00 (2:45 PM)
Location: Mumbai, India
Latitude: 19.0760°N
Longitude: 72.8777°E
Timezone: Asia/Kolkata (UTC+5:30)
```

### Validation Points
- [ ] Ascendant sign and degree
- [ ] All planetary signs
- [ ] All planetary degrees
- [ ] All nakshatras
- [ ] All house placements
- [ ] Dasha calculations

---

## Test Case 4: Evening Birth

### Birth Details
```
Name: Test Case 4
Date: 1990-11-08
Time: 18:20:00 (6:20 PM)
Location: Bangalore, India
Latitude: 12.9716°N
Longitude: 77.5946°E
Timezone: Asia/Kolkata (UTC+5:30)
```

### Validation Points
- [ ] Ascendant sign and degree
- [ ] All planetary signs
- [ ] All planetary degrees
- [ ] All nakshatras
- [ ] All house placements
- [ ] Dasha calculations

---

## Test Case 5: Night Birth

### Birth Details
```
Name: Test Case 5
Date: 1985-05-30
Time: 23:15:00 (11:15 PM)
Location: Chennai, India
Latitude: 13.0827°N
Longitude: 80.2707°E
Timezone: Asia/Kolkata (UTC+5:30)
```

### Validation Points
- [ ] Ascendant sign and degree
- [ ] All planetary signs
- [ ] All planetary degrees
- [ ] All nakshatras
- [ ] All house placements
- [ ] Dasha calculations

---

## Validation Metrics

### Accuracy Levels

#### Excellent (100% Pass)
- ✅ All signs match exactly
- ✅ All degrees within ±5 minutes
- ✅ All nakshatras match exactly
- ✅ All padas match exactly
- ✅ All retrograde statuses match
- ✅ All house placements match
- ✅ All Dasha calculations match

#### Good (90-99% Pass)
- ✅ All signs match exactly
- ✅ All degrees within ±10 minutes
- ✅ All nakshatras match exactly
- ✅ Most padas match
- ✅ All retrograde statuses match
- ✅ All house placements match
- ✅ Dasha calculations mostly match

#### Acceptable (80-89% Pass)
- ✅ All signs match exactly
- ✅ Most degrees within ±15 minutes
- ✅ Most nakshatras match
- ✅ Most padas match
- ✅ All retrograde statuses match
- ⚠️ Some house placements differ

#### Needs Review (<80% Pass)
- ❌ Some signs don't match
- ❌ Degrees differ significantly
- ❌ Nakshatras don't match
- ❌ Dasha calculations incorrect

---

## Validation Report Template

### Test Case: [Name]

**Birth Data**:
- Date: [Date]
- Time: [Time]
- Location: [Location]
- Coordinates: [Lat, Long]

**Results**:

#### Ascendant
- Expected: [Sign] [Degree]°
- Actual: [Sign] [Degree]°
- Status: ✅ PASS / ❌ FAIL
- Difference: [Degrees/Minutes]

#### Planetary Positions
| Planet | Expected | Actual | Status | Difference |
|--------|----------|--------|--------|------------|
| Sun | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Moon | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Mercury | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Venus | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Mars | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Jupiter | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Saturn | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Rahu | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |
| Ketu | [Sign] [Deg]° | [Sign] [Deg]° | ✅/❌ | [Diff] |

#### Nakshatras
| Planet | Expected | Actual | Status |
|--------|----------|--------|--------|
| Sun | [Nakshatra] | [Nakshatra] | ✅/❌ |
| Moon | [Nakshatra] | [Nakshatra] | ✅/❌ |
| [etc] | [Nakshatra] | [Nakshatra] | ✅/❌ |

#### House Placements
| Planet | Expected | Actual | Status |
|--------|----------|--------|--------|
| Sun | House [N] | House [N] | ✅/❌ |
| Moon | House [N] | House [N] | ✅/❌ |
| [etc] | House [N] | House [N] | ✅/❌ |

#### Dasha Information
- Birth Nakshatra: [Expected] / [Actual] - ✅/❌
- Birth Dasha: [Expected] / [Actual] - ✅/❌
- Dasha Balance: [Expected] / [Actual] - ✅/❌

**Summary**:
- Total Tests: [N]
- Passed: [N]
- Failed: [N]
- Pass Rate: [%]
- Status: ✅ EXCELLENT / ✅ GOOD / ⚠️ ACCEPTABLE / ❌ NEEDS REVIEW

**Issues Found**:
1. [Issue 1]
2. [Issue 2]
3. [etc]

**Recommendations**:
1. [Recommendation 1]
2. [Recommendation 2]
3. [etc]

---

## Automated Testing

### Python Test Script Template

```python
def test_ravi_tadakamalla():
    """Test Ravi Tadakamalla chart against Astrogyan.com reference."""
    
    # Birth data
    birth_date = datetime(1963, 9, 6, 11, 0, 0)
    latitude = 17.25
    longitude = 80.15
    
    # Generate chart
    chart = generate_chart(birth_date, latitude, longitude)
    
    # Verify ascendant
    assert chart.ascendant_sign == 'Virgo'
    assert 17 <= chart.ascendant_degree <= 18
    
    # Verify planets
    assert chart.sun_sign == 'Virgo'
    assert chart.moon_sign == 'Pisces'
    # ... etc
    
    # Verify nakshatras
    assert chart.sun_nakshatra == 'Hasta'
    assert chart.moon_nakshatra == 'Uttara Bhadrapada'
    # ... etc
    
    # Verify houses
    assert chart.sun_house == 1
    assert chart.moon_house == 5
    # ... etc
```

---

## Success Criteria

✅ All 5 test cases pass with ≥90% accuracy
✅ Ravi Tadakamalla chart matches Astrogyan.com exactly
✅ No systematic errors in calculations
✅ Dasha calculations verified
✅ Divisional charts verified
✅ Automated tests created and passing

---

**Status**: Ready for validation
**Priority**: HIGH
**Estimated Time**: 4-6 hours

