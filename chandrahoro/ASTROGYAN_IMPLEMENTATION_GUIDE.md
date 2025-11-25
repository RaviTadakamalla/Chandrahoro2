# Astrogyan.com Alignment - Implementation Guide

## Phase 1: Critical Fixes

### Fix 1.1: Change House System to Whole Sign

**File**: `backend/app/api/v1/chart.py`
**Line**: 95
**Current**:
```python
ascendant_data = ephemeris.calculate_ascendant(
    birth_datetime,
    birth_details.latitude,
    birth_details.longitude,
    house_system='Placidus'  # ❌ WRONG
)
```

**Change To**:
```python
ascendant_data = ephemeris.calculate_ascendant(
    birth_datetime,
    birth_details.latitude,
    birth_details.longitude,
    house_system=preferences.house_system  # ✅ Use from preferences
)
```

**Also Update**:
```python
house_data = house_calc.calculate_houses(
    birth_datetime,
    birth_details.latitude,
    birth_details.longitude,
    ascendant_data.get('ayanamsha_value', 0.0)
)
```

### Fix 1.2: Update Default House System

**File**: `backend/app/models/chart.py`
**Current**:
```python
class ChartPreferences(BaseModel):
    ayanamsha: str = 'Lahiri'
    house_system: str = 'Placidus'  # ❌ WRONG
    chart_style: str = 'North Indian'
```

**Change To**:
```python
class ChartPreferences(BaseModel):
    ayanamsha: str = 'Lahiri'
    house_system: str = 'Whole Sign'  # ✅ CORRECT for Vedic
    chart_style: str = 'North Indian'
```

### Fix 1.3: Verify Whole Sign Implementation

**File**: `backend/app/core/houses.py`
**Check**: Lines 22-31 (HOUSE_SYSTEMS dictionary)

**Verify**:
```python
HOUSE_SYSTEMS = {
    'Placidus': b'P',
    'Koch': b'K',
    'Equal': b'E',
    'Whole Sign': b'W',  # ✅ Should be present
    ...
}
```

**Status**: ✅ Already implemented correctly

---

## Phase 2: Validation Tests

### Test 2.1: Ravi Tadakamalla Validation

**Birth Data**:
- Name: Ravi Tadakamalla
- Date: 1963-09-06
- Time: 11:00:00 AM
- Location: Khammam, India
- Latitude: 17.25°N
- Longitude: 80.15°E

**Expected Results** (from Astrogyan.com):
```
Ascendant: Virgo 17-18°
Sun: Virgo ~20°, Hasta, Pada 3
Moon: Pisces ~15°, Uttara Bhadrapada, Pada 2
Mercury: Virgo ~5°, Hasta, Pada 1
Venus: Libra ~10°, Swati, Pada 1
Mars: Virgo ~25°, Chitra, Pada 1
Jupiter: Aries ~20°, Bharani, Pada 3
Saturn: Aquarius ~15°, Dhanishta, Pada 2
Rahu: Taurus ~10°, Rohini, Pada 2
Ketu: Scorpio ~10°, Jyeshtha, Pada 2
```

**Validation Steps**:
1. Generate chart in Chandrahoro
2. Compare each planet's sign and degree
3. Compare nakshatras
4. Compare house placements
5. Compare retrograde status

### Test 2.2: Create Additional Test Cases

**Need**: 3-5 more test cases with known reference data

**Recommended**:
1. Morning birth (6:00 AM)
2. Afternoon birth (2:00 PM)
3. Evening birth (6:00 PM)
4. Night birth (11:00 PM)
5. Different location (different latitude/longitude)

---

## Phase 3: Nakshatra Verification

### Issue: Nakshatra Calculation Accuracy

**File**: `backend/app/core/ephemeris.py`
**Lines**: 99-102

**Current Code**:
```python
nakshatra_num = int(sidereal_long / (360 / 27))
nakshatra_degree = sidereal_long % (360 / 27)
pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
```

**Verification Needed**:
1. Check if nakshatra_num is 0-indexed (0-26) or 1-indexed (1-27)
2. Compare with Astrogyan.com for multiple planets
3. Verify pada calculation matches

**Test Case**:
- Sun at Virgo 20° (sidereal_long = 150°)
- Expected: Hasta nakshatra (13), Pada 3
- Calculation:
  - nakshatra_num = int(150 / 13.333) = 11 (0-indexed)
  - If 1-indexed: 12 (Uttara Phalguni) ❌ WRONG
  - Should be: 13 (Hasta) ✅

**Potential Fix**:
```python
nakshatra_num = int(sidereal_long / (360 / 27)) + 1  # Make 1-indexed
```

---

## Phase 4: Dasha Validation

### Issue: Dasha Start Date Accuracy

**File**: `backend/app/core/dasha.py`
**Lines**: 67-86

**Current Code**:
```python
def calculate_birth_nakshatra(self, moon_longitude: float) -> Tuple[int, float]:
    nakshatra_size = 360.0 / 27.0
    nakshatra_number = int(moon_longitude / nakshatra_size) + 1
    degrees_in_nakshatra = moon_longitude % nakshatra_size
    return nakshatra_number, degrees_in_nakshatra
```

**Verification Needed**:
1. Verify nakshatra_number calculation
2. Compare Dasha balance with Astrogyan.com
3. Verify Antardasha start dates

**Test Case**:
- Moon at Pisces 15° (sidereal_long = 345°)
- Expected: Uttara Bhadrapada (26)
- Calculation:
  - nakshatra_num = int(345 / 13.333) + 1 = 26 ✅

---

## Phase 5: Divisional Chart Validation

### D9 (Navamsa) Verification

**File**: `backend/app/core/divisional_charts.py`
**Lines**: 55-57

**Current Code**:
```python
elif chart_type == 'D9':
    return self._calculate_navamsa(longitude)
```

**Verification Needed**:
1. Compare D9 positions with Astrogyan.com
2. Verify navamsa sign calculation
3. Verify navamsa degree calculation

### D10 (Dasamsa) Verification

**File**: `backend/app/core/divisional_charts.py`
**Lines**: 58-60

**Current Code**:
```python
elif chart_type == 'D10':
    return self._calculate_dasamsa(longitude)
```

**Verification Needed**:
1. Compare D10 positions with Astrogyan.com
2. Verify dasamsa sign calculation
3. Verify dasamsa degree calculation

---

## Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Fix house system in chart.py (line 95)
- [ ] Update default in models/chart.py
- [ ] Verify Whole Sign implementation in houses.py
- [ ] Test with Ravi Tadakamalla data

### Phase 2: Validation
- [ ] Compare all planetary positions
- [ ] Verify nakshatra assignments
- [ ] Verify house placements
- [ ] Verify retrograde status
- [ ] Create test cases

### Phase 3: Nakshatra Verification
- [ ] Verify nakshatra calculation
- [ ] Fix if needed
- [ ] Test with multiple planets

### Phase 4: Dasha Validation
- [ ] Verify Dasha balance calculation
- [ ] Verify Antardasha calculations
- [ ] Compare with Astrogyan.com

### Phase 5: Divisional Charts
- [ ] Verify D9 calculations
- [ ] Verify D10 calculations
- [ ] Test with multiple charts

### Phase 6: Final Testing
- [ ] Test with 5+ reference charts
- [ ] Verify all calculations match
- [ ] Create automated tests
- [ ] Document results

---

## Expected Outcomes

### After Phase 1
- House system changed to Whole Sign
- Ravi Tadakamalla chart should match Astrogyan.com

### After Phase 2
- All planetary positions verified
- Nakshatras verified
- House placements verified

### After Phase 3
- Nakshatra calculations accurate
- Dasha calculations accurate

### After Phase 4
- Dasha periods match Astrogyan.com
- Antardasha calculations verified

### After Phase 5
- Divisional charts match Astrogyan.com
- All chart types verified

### After Phase 6
- 100% alignment with Astrogyan.com
- Automated validation tests in place
- Documentation complete

---

## Estimated Timeline

- Phase 1: 30 minutes
- Phase 2: 1-2 hours
- Phase 3: 1-2 hours
- Phase 4: 1-2 hours
- Phase 5: 1-2 hours
- Phase 6: 2-3 hours

**Total**: 8-12 hours

---

## Success Criteria

✅ All planetary signs match exactly
✅ All planetary degrees within ±10 minutes
✅ All nakshatras match exactly
✅ All house placements match exactly
✅ All retrograde statuses match exactly
✅ All Dasha calculations match exactly
✅ All divisional charts match exactly
✅ 100% pass rate on validation tests

---

**Status**: Ready for implementation
**Priority**: HIGH
**Complexity**: MEDIUM

