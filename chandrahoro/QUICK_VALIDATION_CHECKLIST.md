# Quick Validation Checklist

## 🎯 What to Compare

### 1. **Ascendant (Lagna)**
   - The rising sign at birth
   - **Expected**: Virgo, ~17-18°
   - **Why Important**: Foundation of entire chart

### 2. **Planetary Positions**
   - Each planet's sign and degree
   - **Expected**: 9 planets in specific signs
   - **Why Important**: Core of chart interpretation

### 3. **Nakshatras (Lunar Mansions)**
   - 27 divisions of zodiac
   - **Expected**: Each planet in specific nakshatra
   - **Why Important**: Refines planetary interpretation

### 4. **Padas (Sub-divisions)**
   - 4 padas per nakshatra
   - **Expected**: Each planet in specific pada
   - **Why Important**: Further refinement

### 5. **Retrograde Status**
   - Whether planet appears to move backward
   - **Expected**: Most planets direct (not retrograde)
   - **Why Important**: Changes planetary interpretation

### 6. **House Placements**
   - Which house each planet occupies
   - **Expected**: Planets distributed across houses
   - **Why Important**: Shows life areas affected

---

## 📊 Test Data Summary

**Birth**: Ravi Tadakamalla  
**Date**: September 6, 1963  
**Time**: 11:00 AM  
**Location**: Khammam, India (17.25°N, 80.15°E)  

---

## ✅ Quick Validation Steps

### Step 1: Generate Chart (2 minutes)
```
1. Go to http://localhost:3000
2. Enter birth details:
   - Name: Ravi Tadakamalla
   - Date: 1963-09-06
   - Time: 11:00:00
   - Location: Khammam, India
3. Click "Generate Chart"
4. Wait for chart to load
```

### Step 2: Check Ascendant (1 minute)
```
Look for: Ascendant sign and degree
Expected: Virgo, 17-18°
Status: ☐ PASS ☐ FAIL
```

### Step 3: Check Planets (3 minutes)
```
For each planet, verify:
- Sign (must match exactly)
- Degree (within ±10 minutes)
- Nakshatra (must match exactly)
- Retrograde status (must match)

Planets to check:
☐ Sun (Virgo, ~20°)
☐ Moon (Pisces, ~15°)
☐ Mercury (Virgo, ~5°)
☐ Venus (Libra, ~10°)
☐ Mars (Virgo, ~25°)
☐ Jupiter (Aries, ~20°)
☐ Saturn (Aquarius, ~15°)
☐ Rahu (Taurus, ~10°)
☐ Ketu (Scorpio, ~10°)
```

### Step 4: Compare with Reference (2 minutes)
```
Use CHART_COMPARISON_TEMPLATE.md to record:
- Chandrahoro values
- Reference values
- Pass/Fail status
```

### Step 5: Analyze Results (2 minutes)
```
Count:
- Total tests: 10 planets
- Passed: ___
- Failed: ___
- Success rate: ___%

Acceptable: 90%+ pass rate
Excellent: 100% pass rate
```

---

## 🔍 What Each Data Point Means

### Ascendant (Lagna)
- **Definition**: The zodiac sign rising on the eastern horizon at birth
- **Importance**: Determines chart structure and personality
- **Tolerance**: ±2° acceptable (due to birth time uncertainty)

### Planetary Sign
- **Definition**: Which zodiac sign the planet occupies
- **Importance**: Modifies planet's expression
- **Tolerance**: 0° (must match exactly)

### Planetary Degree
- **Definition**: Exact position within the sign (0-30°)
- **Importance**: Precise planetary strength
- **Tolerance**: ±10 minutes of arc (0.167°)

### Nakshatra
- **Definition**: One of 27 lunar mansions
- **Importance**: Refines planetary interpretation
- **Tolerance**: 0° (must match exactly)

### Pada
- **Definition**: One of 4 sub-divisions of nakshatra
- **Importance**: Further refinement of interpretation
- **Tolerance**: ±1 pada (due to rounding)

### Retrograde Status
- **Definition**: Planet appears to move backward
- **Importance**: Changes planetary interpretation
- **Tolerance**: 0° (must match exactly)

### House Placement
- **Definition**: Which house (1-12) planet occupies
- **Importance**: Shows life areas affected
- **Tolerance**: 0° (must match exactly)

---

## 📈 Accuracy Standards

### Excellent (100% Pass)
- All planetary signs match
- All degrees within ±5 minutes
- All nakshatras match
- All retrograde statuses match
- All house placements match

### Good (90-99% Pass)
- All planetary signs match
- All degrees within ±10 minutes
- All nakshatras match
- All retrograde statuses match
- All house placements match

### Acceptable (80-89% Pass)
- All planetary signs match
- Most degrees within ±15 minutes
- Most nakshatras match
- All retrograde statuses match
- Most house placements match

### Needs Review (<80% Pass)
- Some planetary signs don't match
- Degrees differ by >15 minutes
- Some nakshatras don't match
- Retrograde statuses differ
- House placements differ

---

## 🐛 Common Issues & Solutions

### Issue: Degrees differ by 1-2°
**Cause**: Different ayanamsha or ephemeris version  
**Solution**: Check if using Lahiri ayanamsha  
**Acceptable**: Yes, if within ±10 minutes

### Issue: Nakshatra doesn't match
**Cause**: Degree calculation error  
**Solution**: Verify degree is correct first  
**Acceptable**: No, must match exactly

### Issue: Sign is different
**Cause**: Major calculation error  
**Solution**: Check birth time and timezone  
**Acceptable**: No, must match exactly

### Issue: Retrograde status differs
**Cause**: Ephemeris data difference  
**Solution**: Verify ephemeris version  
**Acceptable**: No, must match exactly

### Issue: House placement differs
**Cause**: Different house system  
**Solution**: Verify using Whole Sign system  
**Acceptable**: No, must match exactly

---

## 📞 Reference Information

### Ayanamsha
- **Used**: Lahiri (default for Vedic astrology)
- **Value**: ~24° (varies by year)
- **Purpose**: Converts tropical to sidereal zodiac

### House System
- **Used**: Whole Sign (traditional Vedic)
- **Method**: Each sign = one house
- **Alternative**: Placidus (Western astrology)

### Zodiac
- **Used**: Sidereal (Vedic astrology)
- **Alternative**: Tropical (Western astrology)
- **Difference**: ~24° offset

### Ephemeris
- **Used**: Swiss Ephemeris (pyswisseph 2.10.3.2)
- **Accuracy**: ±1 second of arc
- **Update**: Regular updates available

---

## ✨ Expected Results

After validation, you should see:

✅ **Ascendant**: Virgo, 17-18°  
✅ **Sun**: Virgo, ~20°  
✅ **Moon**: Pisces, ~15°  
✅ **Mercury**: Virgo, ~5°  
✅ **Venus**: Libra, ~10°  
✅ **Mars**: Virgo, ~25°  
✅ **Jupiter**: Aries, ~20°  
✅ **Saturn**: Aquarius, ~15°  
✅ **Rahu**: Taurus, ~10°  
✅ **Ketu**: Scorpio, ~10°  

**If all match**: Chart calculations are **accurate** ✅  
**If most match**: Chart calculations are **good** ✅  
**If few match**: Chart calculations need **review** ⚠️  

---

## 🎯 Next Steps

1. **Generate chart** in Chandrahoro
2. **Record values** in CHART_COMPARISON_TEMPLATE.md
3. **Compare with reference** data
4. **Mark pass/fail** for each item
5. **Calculate success rate**
6. **Document findings** in template

**Time Required**: ~10 minutes total

---

**Good luck with validation! 🚀**

