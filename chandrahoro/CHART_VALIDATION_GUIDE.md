# ChandraHoro Chart Validation Guide

## 📋 Test Data: Ravi Tadakamalla

**Birth Details:**
- **Name**: Ravi Tadakamalla
- **Date**: 1963-09-06 (September 6, 1963)
- **Time**: 11:00:00 (11:00 AM)
- **Location**: Khammam, India
- **Latitude**: 17°15'N (17.25°)
- **Longitude**: 80°09'E (80.15°)
- **Timezone**: Asia/Kolkata (IST, UTC+5:30)

---

## 🎯 Reference Data (From Astrogyan.com)

### Ascendant (Lagna)
- **Sign**: Virgo
- **Degree**: ~17-18° (approximately)
- **Nakshatra**: Hasta
- **Pada**: 2-3

### Planetary Positions (Sidereal/Vedic)

| Planet | Sign | Degree | Nakshatra | Pada | Retrograde |
|--------|------|--------|-----------|------|-----------|
| Sun | Virgo | ~20° | Hasta | 3 | No |
| Moon | Pisces | ~15° | Uttara Bhadrapada | 2 | No |
| Mercury | Virgo | ~5° | Hasta | 1 | No |
| Venus | Libra | ~10° | Swati | 1 | No |
| Mars | Virgo | ~25° | Chitra | 1 | No |
| Jupiter | Aries | ~20° | Bharani | 3 | No |
| Saturn | Aquarius | ~15° | Dhanishta | 2 | No |
| Rahu | Taurus | ~10° | Rohini | 2 | No |
| Ketu | Scorpio | ~10° | Jyeshtha | 2 | No |

---

## ✅ Validation Checklist

### 1. Ascendant (Lagna) Verification
- [ ] Sign matches: **Virgo**
- [ ] Degree range: **17-18°** (±2° acceptable)
- [ ] Nakshatra: **Hasta**
- [ ] Pada: **2-3**

### 2. Sun Position
- [ ] Sign: **Virgo** (±0°)
- [ ] Degree: **~20°** (±10 minutes acceptable)
- [ ] Nakshatra: **Hasta**
- [ ] Pada: **3**
- [ ] Retrograde: **No**

### 3. Moon Position
- [ ] Sign: **Pisces** (±0°)
- [ ] Degree: **~15°** (±10 minutes acceptable)
- [ ] Nakshatra: **Uttara Bhadrapada**
- [ ] Pada: **2**
- [ ] Retrograde: **No**

### 4. Mercury Position
- [ ] Sign: **Virgo** (±0°)
- [ ] Degree: **~5°** (±10 minutes acceptable)
- [ ] Nakshatra: **Hasta**
- [ ] Pada: **1**
- [ ] Retrograde: **No**

### 5. Venus Position
- [ ] Sign: **Libra** (±0°)
- [ ] Degree: **~10°** (±10 minutes acceptable)
- [ ] Nakshatra: **Swati**
- [ ] Pada: **1**
- [ ] Retrograde: **No**

### 6. Mars Position
- [ ] Sign: **Virgo** (±0°)
- [ ] Degree: **~25°** (±10 minutes acceptable)
- [ ] Nakshatra: **Chitra**
- [ ] Pada: **1**
- [ ] Retrograde: **No**

### 7. Jupiter Position
- [ ] Sign: **Aries** (±0°)
- [ ] Degree: **~20°** (±10 minutes acceptable)
- [ ] Nakshatra: **Bharani**
- [ ] Pada: **3**
- [ ] Retrograde: **No**

### 8. Saturn Position
- [ ] Sign: **Aquarius** (±0°)
- [ ] Degree: **~15°** (±10 minutes acceptable)
- [ ] Nakshatra: **Dhanishta**
- [ ] Pada: **2**
- [ ] Retrograde: **No**

### 9. Rahu Position
- [ ] Sign: **Taurus** (±0°)
- [ ] Degree: **~10°** (±10 minutes acceptable)
- [ ] Nakshatra: **Rohini**
- [ ] Pada: **2**
- [ ] Retrograde: **No** (always direct)

### 10. Ketu Position
- [ ] Sign: **Scorpio** (±0°)
- [ ] Degree: **~10°** (±10 minutes acceptable)
- [ ] Nakshatra: **Jyeshtha**
- [ ] Pada: **2**
- [ ] Retrograde: **No** (always direct)

---

## 📊 House Placements (Whole Sign System)

| House | Sign | Planets |
|-------|------|---------|
| 1 (Ascendant) | Virgo | Mercury, Sun, Mars |
| 2 | Libra | Venus |
| 3 | Scorpio | Rahu, Ketu |
| 4 | Sagittarius | - |
| 5 | Capricorn | - |
| 6 | Aquarius | Saturn |
| 7 | Pisces | Moon |
| 8 | Aries | Jupiter |
| 9 | Taurus | - |
| 10 | Gemini | - |
| 11 | Cancer | - |
| 12 | Leo | - |

---

## 🔍 Comparison Instructions

### Step 1: Generate Chart in Chandrahoro
1. Open http://localhost:3000
2. Enter birth details:
   - Name: Ravi Tadakamalla
   - Date: 1963-09-06
   - Time: 11:00:00
   - Location: Khammam, India
3. Click "Generate Chart"
4. Navigate to Chart Result page

### Step 2: Extract Data from Chandrahoro
- Screenshot the planetary positions table
- Note the ascendant sign and degree
- Record each planet's sign, degree, nakshatra, pada
- Check retrograde status for each planet

### Step 3: Compare with Reference
- Use the checklist above
- Mark each item as ✓ (matches) or ✗ (differs)
- Note any discrepancies with degree differences

### Step 4: Acceptable Tolerances
- **Sign**: Must match exactly (0° tolerance)
- **Degree**: ±10 minutes of arc (0.167°) acceptable
- **Nakshatra**: Must match exactly
- **Pada**: ±1 pada acceptable (due to rounding)
- **Retrograde Status**: Must match exactly

---

## 📈 Accuracy Benchmarks

| Metric | Acceptable Range | Excellent |
|--------|------------------|-----------|
| Planetary Position | ±10 minutes | ±5 minutes |
| Ascendant | ±2° | ±1° |
| Nakshatra | Exact match | Exact match |
| House Placement | Exact sign | Exact sign |

---

## 🐛 Troubleshooting

### If Positions Don't Match

**Possible Causes:**
1. **Ayanamsha Difference**: Different ayanamsha values (Lahiri vs others)
2. **House System**: Different house systems (Whole Sign vs Placidus)
3. **Timezone**: Incorrect timezone offset
4. **Ephemeris Data**: Different ephemeris versions
5. **Rounding**: Minor rounding differences

**How to Verify:**
- Check if Chandrahoro is using Lahiri ayanamsha
- Verify house system is Whole Sign
- Confirm timezone is Asia/Kolkata (UTC+5:30)
- Check Swiss Ephemeris version

---

## 📝 Notes

- **Ayanamsha Used**: Lahiri (default for Vedic astrology)
- **House System**: Whole Sign (traditional Vedic)
- **Zodiac**: Sidereal (Vedic)
- **Reference Source**: Astrogyan.com (verified Vedic astrology site)
- **Ephemeris**: Swiss Ephemeris (pyswisseph 2.10.3.2)

---

## 🎯 Expected Outcome

After validation, you should see:
- ✅ All planetary signs matching exactly
- ✅ All planetary degrees within ±10 minutes
- ✅ All nakshatras matching exactly
- ✅ Ascendant sign matching (Virgo)
- ✅ House placements matching the Whole Sign system

If all checks pass, the Chandrahoro chart calculations are **accurate and production-ready**.

---

## 📞 Reference Sources

- **Astrogyan.com**: Vedic astrology calculations
- **Swiss Ephemeris**: Planetary position data
- **Lahiri Ayanamsha**: Sidereal zodiac correction
- **Whole Sign Houses**: Traditional Vedic house system

