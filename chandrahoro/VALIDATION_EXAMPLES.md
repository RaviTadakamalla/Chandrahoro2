# Chart Validation Examples

## 📋 What You'll See in Chandrahoro

### Example 1: Ascendant Display
```
Ascendant (Lagna)
├─ Sign: Virgo
├─ Degree: 17°45'
├─ Nakshatra: Hasta
└─ Pada: 2
```

**What to Check**:
- ✅ Sign = Virgo (exact match)
- ✅ Degree = 17-18° (within ±2°)
- ✅ Nakshatra = Hasta (exact match)
- ✅ Pada = 2-3 (within ±1)

---

### Example 2: Planetary Position Display
```
Sun
├─ Sign: Virgo
├─ Degree: 20°15'
├─ Tropical: 280°45'
├─ Sidereal: 257°10'
├─ Nakshatra: Hasta
├─ Pada: 3
├─ House: 1
├─ Retrograde: No
└─ Speed: 1.02°/day
```

**What to Check**:
- ✅ Sign = Virgo (exact)
- ✅ Degree = 20° (within ±10 min)
- ✅ Nakshatra = Hasta (exact)
- ✅ Pada = 3 (exact)
- ✅ Retrograde = No (exact)

---

### Example 3: Moon Position Display
```
Moon
├─ Sign: Pisces
├─ Degree: 15°30'
├─ Tropical: 345°30'
├─ Sidereal: 321°55'
├─ Nakshatra: Uttara Bhadrapada
├─ Pada: 2
├─ House: 7
├─ Retrograde: No
└─ Speed: 13.18°/day
```

**What to Check**:
- ✅ Sign = Pisces (exact)
- ✅ Degree = 15° (within ±10 min)
- ✅ Nakshatra = Uttara Bhadrapada (exact)
- ✅ Pada = 2 (exact)
- ✅ Retrograde = No (exact)

---

## 🔢 Understanding Degree Notation

### Degree Format
```
20°15' = 20 degrees and 15 minutes
20°15'30" = 20 degrees, 15 minutes, 30 seconds
```

### Conversion
```
1 degree = 60 minutes
1 minute = 60 seconds
1 degree = 3600 seconds
```

### Examples
```
20°00' = 20.000°
20°15' = 20.250°
20°30' = 20.500°
20°45' = 20.750°
```

### Tolerance Calculation
```
±10 minutes = ±0.167°

Example:
Reference: 20°00'
Acceptable Range: 19°50' to 20°10'
Chandrahoro: 20°05' ✅ PASS
Chandrahoro: 20°15' ❌ FAIL
```

---

## 📊 Nakshatra Reference

### 27 Nakshatras (Lunar Mansions)

| # | Nakshatra | Ruler | Degree Range |
|---|-----------|-------|--------------|
| 1 | Ashwini | Ketu | 0°-13°20' |
| 2 | Bharani | Venus | 13°20'-26°40' |
| 3 | Krittika | Sun | 26°40'-40° |
| 4 | Rohini | Moon | 40°-53°20' |
| 5 | Mrigashira | Mars | 53°20'-66°40' |
| 6 | Ardra | Rahu | 66°40'-80° |
| 7 | Punarvasu | Jupiter | 80°-93°20' |
| 8 | Pushya | Saturn | 93°20'-106°40' |
| 9 | Ashlesha | Mercury | 106°40'-120° |
| 10 | Magha | Ketu | 120°-133°20' |
| 11 | Purva Phalguni | Venus | 133°20'-146°40' |
| 12 | Uttara Phalguni | Sun | 146°40'-160° |
| 13 | Hasta | Moon | 160°-173°20' |
| 14 | Chitra | Mars | 173°20'-186°40' |
| 15 | Swati | Rahu | 186°40'-200° |
| 16 | Vishakha | Jupiter | 200°-213°20' |
| 17 | Anuradha | Saturn | 213°20'-226°40' |
| 18 | Jyeshtha | Mercury | 226°40'-240° |
| 19 | Mula | Ketu | 240°-253°20' |
| 20 | Purva Ashadha | Venus | 253°20'-266°40' |
| 21 | Uttara Ashadha | Sun | 266°40'-280° |
| 22 | Shravana | Moon | 280°-293°20' |
| 23 | Dhanishta | Mars | 293°20'-306°40' |
| 24 | Shatabhisha | Rahu | 306°40'-320° |
| 25 | Purva Bhadrapada | Jupiter | 320°-333°20' |
| 26 | Uttara Bhadrapada | Saturn | 333°20'-346°40' |
| 27 | Revati | Mercury | 346°40'-360° |

---

## 🎯 Pada (Sub-division) Reference

### 4 Padas per Nakshatra

Each nakshatra is divided into 4 padas (quarters):

```
Nakshatra = 13°20' (800 minutes)
Pada 1 = 0°-3°20' (200 minutes)
Pada 2 = 3°20'-6°40' (200 minutes)
Pada 3 = 6°40'-10° (200 minutes)
Pada 4 = 10°-13°20' (200 minutes)
```

### Example: Hasta Nakshatra
```
Hasta Range: 160°-173°20'

Pada 1: 160°-163°20' (Aries)
Pada 2: 163°20'-166°40' (Taurus)
Pada 3: 166°40'-170° (Gemini)
Pada 4: 170°-173°20' (Cancer)
```

---

## 🏠 House System Explanation

### Whole Sign System (Vedic)
```
House 1 (Ascendant): Virgo (0°-30°)
House 2: Libra (0°-30°)
House 3: Scorpio (0°-30°)
... and so on
```

**Key Point**: Each sign = one complete house

### Planet Placement
```
If Sun is at Virgo 20°:
→ Sun is in House 1 (Ascendant house)

If Moon is at Pisces 15°:
→ Moon is in House 7 (Descendant house)
```

---

## ✅ Validation Workflow

### Step 1: Record Ascendant
```
Reference: Virgo 17-18°
Chandrahoro: Virgo ___°___'
Match: ☐ YES ☐ NO
```

### Step 2: Record Each Planet
```
For each planet:
1. Note the sign
2. Note the degree
3. Note the nakshatra
4. Note the pada
5. Check retrograde status
6. Compare with reference
7. Mark pass/fail
```

### Step 3: Calculate Success Rate
```
Total planets: 9
Passed: ___
Failed: ___
Success rate: ___/9 = ___%
```

### Step 4: Determine Overall Status
```
100% pass: ✅ EXCELLENT
90-99% pass: ✅ GOOD
80-89% pass: ⚠️ ACCEPTABLE
<80% pass: ❌ NEEDS REVIEW
```

---

## 📝 Sample Validation Entry

### Example: Sun Position

**Reference Data**:
```
Sun in Virgo, 20°15', Hasta Nakshatra, Pada 3
```

**Chandrahoro Data**:
```
Sun in Virgo, 20°10', Hasta Nakshatra, Pada 3
```

**Comparison**:
```
Sign: Virgo = Virgo ✅ MATCH
Degree: 20°15' vs 20°10' = 5 minutes difference ✅ PASS (within ±10 min)
Nakshatra: Hasta = Hasta ✅ MATCH
Pada: 3 = 3 ✅ MATCH
Retrograde: No = No ✅ MATCH

Overall: ✅ PASS
```

---

## 🔍 Troubleshooting Examples

### Example 1: Degree Mismatch
```
Reference: Sun at 20°00'
Chandrahoro: Sun at 20°45'
Difference: 45 minutes
Status: ❌ FAIL (exceeds ±10 min tolerance)

Possible Causes:
- Different ephemeris version
- Timezone error
- Birth time error
```

### Example 2: Sign Mismatch
```
Reference: Mercury in Virgo
Chandrahoro: Mercury in Leo
Status: ❌ FAIL (sign must match exactly)

Possible Causes:
- Major calculation error
- Wrong ayanamsha
- Birth time significantly off
```

### Example 3: Nakshatra Mismatch
```
Reference: Moon in Uttara Bhadrapada
Chandrahoro: Moon in Revati
Status: ❌ FAIL (nakshatra must match exactly)

Possible Causes:
- Degree calculation error
- Nakshatra calculation error
- Ephemeris data issue
```

---

## 🎯 Success Indicators

### ✅ All Checks Pass
- All signs match exactly
- All degrees within ±10 minutes
- All nakshatras match exactly
- All padas match (±1 acceptable)
- All retrograde statuses match
- All house placements match

**Conclusion**: Chart calculations are **accurate and production-ready**

### ⚠️ Most Checks Pass
- All signs match exactly
- Most degrees within ±10 minutes
- Most nakshatras match exactly
- All retrograde statuses match

**Conclusion**: Chart calculations are **good with minor variations**

### ❌ Many Checks Fail
- Some signs don't match
- Degrees differ significantly
- Nakshatras don't match
- Retrograde statuses differ

**Conclusion**: Chart calculations need **investigation and fixes**

---

**Use this guide to validate your chart calculations! 🚀**

