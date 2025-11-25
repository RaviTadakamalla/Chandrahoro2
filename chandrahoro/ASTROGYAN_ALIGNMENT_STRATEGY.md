# Astrogyan.com Alignment Strategy for Chandrahoro

## Executive Summary

This document outlines a comprehensive strategy to align Chandrahoro's Vedic astrology calculations with Astrogyan.com as the authoritative reference standard. The goal is to ensure identical results across all chart types and Dasha calculations.

---

## 1. Current Implementation Analysis

### 1.1 Calculation Architecture

**Files Involved**:
- `backend/app/core/ephemeris.py` - Planetary position calculations
- `backend/app/core/houses.py` - House system calculations
- `backend/app/core/dasha.py` - Vimshottari Dasha calculations
- `backend/app/core/divisional_charts.py` - Divisional chart calculations
- `backend/app/core/ayanamsha.py` - Ayanamsha settings (currently empty)
- `backend/app/api/v1/chart.py` - Main chart calculation orchestration

### 1.2 Current Settings

**Ayanamsha**: Lahiri (SE_SIDM_LAHIRI = 1)
- Default and most common for Vedic astrology
- Matches Astrogyan.com standard

**House System**: Placidus (hardcoded in chart.py line 95)
- Issue: Placidus is Western astrology standard
- Vedic standard: Whole Sign (Bhava)
- **ACTION NEEDED**: Change to Whole Sign for Vedic calculations

**Ephemeris**: Swiss Ephemeris (pyswisseph 2.10.3.2)
- Accurate to ±1 second of arc
- Matches Astrogyan.com ephemeris data

**Retrograde Detection**: Based on speed < 0
- Correct implementation

---

## 2. Identified Calculation Differences

### 2.1 House System (CRITICAL)

**Current**: Placidus (Western astrology)
**Expected**: Whole Sign (Vedic astrology)
**Impact**: All house placements will be incorrect

**Root Cause**: Line 95 in `backend/app/api/v1/chart.py`
```python
house_system='Placidus'  # WRONG for Vedic astrology
```

**Fix Required**:
```python
house_system='Whole Sign'  # Correct for Vedic astrology
```

**Files to Modify**:
1. `backend/app/api/v1/chart.py` - Line 95
2. `backend/app/models/chart.py` - Update ChartPreferences default
3. `backend/app/core/houses.py` - Verify Whole Sign implementation

### 2.2 Ayanamsha Configuration

**Current**: Lahiri (correct)
**Status**: ✅ Correct - matches Astrogyan.com

**Verification Needed**:
- Confirm `swe.set_sid_mode(1)` is called correctly
- Verify ayanamsha value matches Astrogyan.com for test dates

### 2.3 Nakshatra Calculation

**Current Implementation** (ephemeris.py lines 99-102):
```python
nakshatra_num = int(sidereal_long / (360 / 27))
nakshatra_degree = sidereal_long % (360 / 27)
pada = int(nakshatra_degree / (360 / 27 / 4)) + 1
```

**Potential Issues**:
- Nakshatra numbering: 0-26 vs 1-27
- Pada calculation: May have off-by-one errors
- Degree precision: Rounding differences

**Verification Needed**:
- Compare with Astrogyan.com for multiple test cases
- Check if nakshatra_num should be 0-indexed or 1-indexed

### 2.4 Dasha Calculation

**Current Implementation** (dasha.py):
- Vimshottari Dasha periods: ✅ Correct (7, 20, 6, 10, 7, 18, 16, 19, 17)
- Nakshatra rulers: ✅ Correct (1-27 mapping)
- Balance calculation: ✅ Appears correct
- Antardasha proportional calculation: ✅ Correct

**Potential Issues**:
- Nakshatra calculation accuracy affects Dasha start date
- Leap year handling in date calculations
- Timezone handling in date conversions

### 2.5 Divisional Charts

**Current Implementation** (divisional_charts.py):
- D1 (Rasi): ✅ Direct mapping
- D9 (Navamsa): Needs verification
- D10 (Dasamsa): Needs verification
- Generic divisional: Needs verification

**Verification Needed**:
- Compare D9 and D10 calculations with Astrogyan.com
- Check if divisional sign mapping is correct

---

## 3. Root Cause Analysis

### 3.1 House System Issue (PRIMARY)

**Root Cause**: Hardcoded Placidus instead of Whole Sign
**Severity**: CRITICAL
**Impact**: All house placements incorrect
**Fix Complexity**: LOW (1-line change)

### 3.2 Nakshatra Precision Issue (SECONDARY)

**Root Cause**: Potential rounding or indexing issues
**Severity**: MEDIUM
**Impact**: Nakshatra assignments may be off by 1
**Fix Complexity**: MEDIUM (requires testing)

### 3.3 Dasha Calculation Issue (SECONDARY)

**Root Cause**: Depends on accurate nakshatra calculation
**Severity**: MEDIUM
**Impact**: Dasha start dates may be off
**Fix Complexity**: MEDIUM (depends on nakshatra fix)

---

## 4. Validation Test Cases

### Test Case 1: Ravi Tadakamalla (Already Provided)
- Date: 1963-09-06, 11:00:00
- Location: Khammam, India (17°15'N, 80°09'E)
- Reference: Astrogyan.com

### Test Case 2: Additional Test Cases Needed
- Need 3-5 more test cases with known reference data
- Vary birth times (morning, afternoon, evening, night)
- Vary birth locations (different latitudes/longitudes)
- Include edge cases (near sign boundaries, retrograde planets)

---

## 5. Correction Strategy

### Phase 1: Critical Fixes (1-2 hours)
1. Change house system from Placidus to Whole Sign
2. Verify ayanamsha settings
3. Test with Ravi Tadakamalla data

### Phase 2: Validation (2-3 hours)
1. Compare all planetary positions with Astrogyan.com
2. Verify nakshatra assignments
3. Verify house placements
4. Verify retrograde status

### Phase 3: Dasha Validation (2-3 hours)
1. Compare Dasha start dates
2. Verify Antardasha calculations
3. Verify Pratyantardasha calculations

### Phase 4: Divisional Charts (1-2 hours)
1. Verify D9 (Navamsa) calculations
2. Verify D10 (Dasamsa) calculations
3. Test with multiple charts

### Phase 5: Comprehensive Testing (3-4 hours)
1. Test with 5+ reference charts
2. Verify all calculations match Astrogyan.com
3. Document any remaining differences
4. Create automated validation tests

---

## 6. Configuration Changes Required

### 6.1 Backend Configuration

**File**: `backend/app/models/chart.py`
```python
class ChartPreferences(BaseModel):
    ayanamsha: str = 'Lahiri'  # ✅ Correct
    house_system: str = 'Whole Sign'  # CHANGE from 'Placidus'
    chart_style: str = 'North Indian'
```

**File**: `backend/app/api/v1/chart.py`
```python
# Line 95: Change from
house_system='Placidus'
# To
house_system=preferences.house_system  # Use from preferences
```

### 6.2 Swiss Ephemeris Settings

**File**: `backend/app/core/ephemeris.py`
- Ayanamsha: Lahiri (SE_SIDM_LAHIRI = 1) ✅ Correct
- Ephemeris: Swiss Ephemeris ✅ Correct
- No changes needed

---

## 7. Validation Checklist

### Before Deployment
- [ ] House system changed to Whole Sign
- [ ] Ayanamsha verified as Lahiri
- [ ] Ravi Tadakamalla chart matches Astrogyan.com
- [ ] 5+ additional test cases pass
- [ ] Dasha calculations verified
- [ ] Divisional charts verified
- [ ] Automated tests created
- [ ] Documentation updated

### After Deployment
- [ ] Monitor for user-reported discrepancies
- [ ] Collect feedback on accuracy
- [ ] Update reference data as needed
- [ ] Create additional test cases

---

## 8. Next Steps

1. **Immediate**: Fix house system to Whole Sign
2. **Short-term**: Validate with Ravi Tadakamalla data
3. **Medium-term**: Validate with 5+ additional test cases
4. **Long-term**: Create automated validation suite

---

## 9. Reference Information

**Astrogyan.com Settings**:
- Ayanamsha: Lahiri
- House System: Whole Sign (Bhava)
- Zodiac: Sidereal (Vedic)
- Ephemeris: Swiss Ephemeris

**Chandrahoro Current Settings**:
- Ayanamsha: Lahiri ✅
- House System: Placidus ❌ (should be Whole Sign)
- Zodiac: Sidereal ✅
- Ephemeris: Swiss Ephemeris ✅

---

**Status**: Ready for Phase 1 implementation
**Estimated Time**: 10-15 hours total
**Priority**: HIGH (affects all chart calculations)

