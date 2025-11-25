# Root Cause Analysis: ChandraHoro vs Astrogyan.com

## Executive Summary

This document provides a detailed root cause analysis of potential differences between ChandraHoro and Astrogyan.com calculations, with specific code locations and remediation strategies.

---

## Issue 1: House System Mismatch (CRITICAL)

### Problem Statement
ChandraHoro uses Placidus house system (Western astrology) instead of Whole Sign (Vedic astrology), causing all house placements to be incorrect.

### Root Cause
**File**: `backend/app/api/v1/chart.py`
**Line**: 95
**Code**:
```python
ascendant_data = ephemeris.calculate_ascendant(
    birth_datetime,
    birth_details.latitude,
    birth_details.longitude,
    house_system='Placidus'  # ❌ HARDCODED WRONG VALUE
)
```

### Impact
- **Severity**: CRITICAL
- **Scope**: All charts
- **Affected Data**: House placements for all planets
- **User Impact**: Incorrect house-based interpretations

### Why It Happens
1. Placidus is hardcoded instead of using preferences
2. Default in ChartPreferences is also Placidus
3. No validation to ensure Vedic system is used

### Verification
**Expected**: Whole Sign (Bhava)
**Actual**: Placidus
**Difference**: 0-30° per house (varies by location and time)

### Solution

**Step 1**: Update chart.py (line 95)
```python
# BEFORE
house_system='Placidus'

# AFTER
house_system=preferences.house_system
```

**Step 2**: Update models/chart.py
```python
# BEFORE
house_system: str = 'Placidus'

# AFTER
house_system: str = 'Whole Sign'
```

**Step 3**: Verify houses.py has Whole Sign support
```python
# Check line 26
'Whole Sign': b'W',  # ✅ Should be present
```

### Validation
After fix, verify:
- [ ] Ascendant sign matches Astrogyan.com
- [ ] All house placements match
- [ ] House cusps are at sign boundaries (Whole Sign)

---

## Issue 2: Nakshatra Indexing (MEDIUM)

### Problem Statement
Nakshatra calculation may use 0-based indexing (0-26) instead of 1-based (1-27), causing off-by-one errors.

### Root Cause
**File**: `backend/app/core/ephemeris.py`
**Lines**: 99-102
**Code**:
```python
nakshatra_num = int(sidereal_long / (360 / 27))  # Returns 0-26
nakshatra_degree = sidereal_long % (360 / 27)
pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
```

### Impact
- **Severity**: MEDIUM
- **Scope**: Nakshatra assignments, Dasha calculations
- **Affected Data**: Nakshatra names, Dasha periods
- **User Impact**: Wrong nakshatra assignments, wrong Dasha start dates

### Why It Happens
1. Integer division returns 0-26 range
2. Nakshatra names array is 1-indexed (1-27)
3. Mismatch between calculation and lookup

### Verification
**Test Case**: Sun at Virgo 20° (sidereal_long = 150°)
- Calculation: int(150 / 13.333) = 11 (0-indexed)
- Expected: Hasta (13, 1-indexed)
- Actual: Purva Phalguni (12, 1-indexed) ❌

### Solution

**Option 1**: Add +1 to make 1-indexed
```python
nakshatra_num = int(sidereal_long / (360 / 27)) + 1  # Returns 1-27
```

**Option 2**: Adjust lookup function
```python
def get_nakshatra_name(nakshatra_number: int) -> str:
    nakshatras = [
        '',  # Placeholder for index 0
        'Ashwini', 'Bharani', ...  # 1-27
    ]
    return nakshatras[nakshatra_number]
```

### Validation
After fix, verify:
- [ ] Sun at Virgo 20° = Hasta (13)
- [ ] Moon at Pisces 15° = Uttara Bhadrapada (26)
- [ ] All nakshatras match Astrogyan.com

---

## Issue 3: Pada Calculation (MEDIUM)

### Problem Statement
Pada calculation may have rounding errors or off-by-one issues.

### Root Cause
**File**: `backend/app/core/ephemeris.py`
**Line**: 102
**Code**:
```python
pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
```

### Impact
- **Severity**: MEDIUM
- **Scope**: Pada assignments
- **Affected Data**: Pada numbers (1-4)
- **User Impact**: Wrong pada assignments

### Why It Happens
1. Rounding in division may cause off-by-one
2. Boundary conditions not handled
3. No validation of pada range

### Verification
**Test Case**: Sun at Virgo 20° (sidereal_long = 150°)
- Nakshatra: Hasta (13°20' to 26°40')
- Degree in nakshatra: 150 - 160 = -10° (wraps to 350°)
- Pada: int(-10 / 3.333) + 1 = -3 + 1 = -2 ❌

### Solution

**Fix**: Ensure degree is within nakshatra range
```python
nakshatra_size = 360 / 27  # 13.333...
nakshatra_start = nakshatra_num * nakshatra_size
degree_in_nakshatra = (sidereal_long - nakshatra_start) % nakshatra_size
pada = int(degree_in_nakshatra / (nakshatra_size / 4)) + 1
pada = max(1, min(4, pada))  # Ensure 1-4 range
```

### Validation
After fix, verify:
- [ ] All padas are 1-4
- [ ] Pada boundaries match Astrogyan.com
- [ ] No off-by-one errors

---

## Issue 4: Dasha Balance Calculation (MEDIUM)

### Problem Statement
Dasha balance calculation depends on accurate nakshatra calculation. If nakshatra is wrong, Dasha balance is wrong.

### Root Cause
**File**: `backend/app/core/dasha.py`
**Lines**: 88-111
**Code**:
```python
def calculate_dasha_balance(self, moon_longitude: float) -> Tuple[str, float]:
    nakshatra_number, degrees_in_nakshatra = self.calculate_birth_nakshatra(moon_longitude)
    ruling_planet = self.NAKSHATRA_RULERS[nakshatra_number]
    traversed_fraction = degrees_in_nakshatra / nakshatra_size
    balance = total_period * (1 - traversed_fraction)
    return ruling_planet, balance
```

### Impact
- **Severity**: MEDIUM
- **Scope**: Dasha calculations
- **Affected Data**: Dasha start dates, Dasha balance
- **User Impact**: Wrong Dasha periods, wrong predictions

### Why It Happens
1. Depends on accurate nakshatra calculation
2. If nakshatra is off by 1, Dasha is wrong
3. Cascading effect on all Dasha calculations

### Verification
**Test Case**: Moon at Pisces 15° (sidereal_long = 345°)
- Expected: Uttara Bhadrapada (26)
- If nakshatra is wrong: Wrong Dasha planet
- If balance is wrong: Wrong Dasha start date

### Solution

**Step 1**: Fix nakshatra calculation (see Issue 2)
**Step 2**: Verify Dasha balance matches Astrogyan.com
**Step 3**: Test with multiple birth charts

### Validation
After fix, verify:
- [ ] Birth nakshatra matches Astrogyan.com
- [ ] Birth Dasha matches Astrogyan.com
- [ ] Dasha balance within ±1 month
- [ ] Antardasha sequence correct

---

## Issue 5: Divisional Chart Calculation (LOW)

### Problem Statement
Divisional chart calculations (D9, D10) may not match Astrogyan.com exactly.

### Root Cause
**File**: `backend/app/core/divisional_charts.py`
**Lines**: 55-60
**Code**:
```python
elif chart_type == 'D9':
    return self._calculate_navamsa(longitude)
elif chart_type == 'D10':
    return self._calculate_dasamsa(longitude)
```

### Impact
- **Severity**: LOW
- **Scope**: Divisional charts only
- **Affected Data**: D9, D10 positions
- **User Impact**: Wrong divisional chart interpretations

### Why It Happens
1. Divisional chart algorithms may differ
2. Rounding differences in calculations
3. Different interpretation of rules

### Verification
**Test Case**: Sun at Virgo 20° (sidereal_long = 150°)
- D9: Calculate navamsa position
- D10: Calculate dasamsa position
- Compare with Astrogyan.com

### Solution

**Step 1**: Verify D9 calculation algorithm
**Step 2**: Verify D10 calculation algorithm
**Step 3**: Compare with Astrogyan.com for multiple planets
**Step 4**: Adjust if needed

### Validation
After fix, verify:
- [ ] D9 positions match Astrogyan.com
- [ ] D10 positions match Astrogyan.com
- [ ] All divisional charts verified

---

## Issue 6: Ayanamsha Precision (LOW)

### Problem Statement
Ayanamsha value may differ slightly between ephemeris versions.

### Root Cause
**File**: `backend/app/core/ephemeris.py`
**Line**: 90
**Code**:
```python
ayanamsha_value = swe.get_ayanamsa_ut(jd)
```

### Impact
- **Severity**: LOW
- **Scope**: All calculations
- **Affected Data**: Sidereal longitude
- **User Impact**: Degree differences of ±0.1°

### Why It Happens
1. Different Swiss Ephemeris versions
2. Different ayanamsha calculation methods
3. Rounding differences

### Verification
**Test Case**: Compare ayanamsha value for 1963-09-06
- Expected: ~23.5° (Lahiri)
- Actual: [Check with swe.get_ayanamsa_ut()]
- Difference: Should be <0.1°

### Solution

**Step 1**: Verify Swiss Ephemeris version (2.10.3.2)
**Step 2**: Compare ayanamsha values with Astrogyan.com
**Step 3**: If different, investigate version differences

### Validation
After verification, confirm:
- [ ] Ayanamsha value matches Astrogyan.com
- [ ] Degree differences <0.1°
- [ ] No systematic offset

---

## Summary of Root Causes

| Issue | Severity | Root Cause | File | Line | Fix |
|-------|----------|-----------|------|------|-----|
| House System | CRITICAL | Hardcoded Placidus | chart.py | 95 | Change to Whole Sign |
| Nakshatra Index | MEDIUM | 0-based vs 1-based | ephemeris.py | 100 | Add +1 |
| Pada Calc | MEDIUM | Rounding errors | ephemeris.py | 102 | Fix boundary |
| Dasha Balance | MEDIUM | Depends on nakshatra | dasha.py | 88 | Fix nakshatra first |
| Divisional Charts | LOW | Algorithm differences | divisional_charts.py | 55 | Verify algorithm |
| Ayanamsha | LOW | Version differences | ephemeris.py | 90 | Verify version |

---

## Implementation Priority

1. **CRITICAL**: Fix house system (30 min)
2. **MEDIUM**: Fix nakshatra indexing (1 hour)
3. **MEDIUM**: Fix pada calculation (30 min)
4. **MEDIUM**: Verify Dasha calculations (1 hour)
5. **LOW**: Verify divisional charts (1 hour)
6. **LOW**: Verify ayanamsha (30 min)

**Total Estimated Time**: 4-5 hours

---

**Status**: Ready for implementation
**Priority**: HIGH
**Complexity**: MEDIUM

