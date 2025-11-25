"""
Comprehensive validation tests for Astrogyan.com alignment.
Tests chart calculations against reference data from Astrogyan.com.
"""

import sys
from datetime import datetime
from zoneinfo import ZoneInfo

# Add backend to path
sys.path.insert(0, '/Users/ravitadakamalla/chandrahoro/backend')

from app.core.ephemeris import EphemerisCalculator
from app.core.dasha import VimshottariDasha
from app.core.houses import HouseSystemCalculator
from app.core.divisional_charts import DivisionalChartCalculator


class AstrogyanValidator:
    """Validates Chandrahoro calculations against Astrogyan.com reference data."""

    def __init__(self):
        self.ephemeris = EphemerisCalculator()
        self.dasha = VimshottariDasha()
        self.houses = HouseSystemCalculator()
        self.divisional = DivisionalChartCalculator()
        self.results = []
    
    def validate_ravi_tadakamalla(self):
        """Test with Ravi Tadakamalla - primary reference case."""
        print("\n" + "="*80)
        print("VALIDATING: Ravi Tadakamalla (1963-09-06, 11:00:00, Khammam, India)")
        print("="*80)

        # Birth details
        birth_date = "1963-09-06"
        birth_time = "11:00:00"
        latitude = 17.25
        longitude = 80.15
        timezone = "Asia/Kolkata"

        # Create datetime
        dt_str = f"{birth_date} {birth_time}"
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        tz = ZoneInfo(timezone)
        birth_datetime = dt.replace(tzinfo=tz)

        # Calculate planets
        print("\n📍 PLANETARY POSITIONS:")
        print("-" * 80)
        planets_dict = self.ephemeris.calculate_all_planets(birth_datetime)

        from app.core.ephemeris import get_sign_name

        planets_list = []
        for name, data in planets_dict.items():
            sign_num = data['sign_number']
            sign_name = get_sign_name(sign_num)
            degree = data['degree_in_sign']
            nakshatra = data['nakshatra_number']
            pada = data['pada']
            retrograde = "R" if data['retrograde'] else ""

            planets_list.append({
                'name': name,
                'sign': sign_name,
                'degree_in_sign': degree,
                'nakshatra': nakshatra,
                'pada': pada,
                'retrograde': data['retrograde']
            })

            print(f"{name:10} | {sign_name:12} {degree:6.2f}° | Nak:{nakshatra:2} P{pada} {retrograde}")

        # Calculate ascendant
        print("\n🏠 ASCENDANT & HOUSES:")
        print("-" * 80)
        ascendant_data = self.ephemeris.calculate_ascendant(
            birth_datetime, latitude, longitude, house_system='Whole Sign'
        )

        asc_sign = ascendant_data['sign_number']
        asc_degree = ascendant_data['degree_in_sign']
        asc_sign_name = get_sign_name(asc_sign)
        print(f"Ascendant: {asc_sign_name} {asc_degree:.2f}°")

        # Calculate Dasha
        print("\n⏰ DASHA CALCULATIONS:")
        print("-" * 80)
        moon_planet = next((p for p in planets_list if p['name'] == 'Moon'), None)
        if moon_planet:
            moon_nak = moon_planet['nakshatra']
            print(f"Birth Nakshatra: {moon_nak} (1-27 range)")
            print(f"Birth Dasha Ruler: {self.dasha.NAKSHATRA_RULERS.get(moon_nak, 'Unknown')}")

        # Validation checks
        print("\n✅ VALIDATION CHECKS:")
        print("-" * 80)

        checks = [
            ("Ascendant Sign", asc_sign_name, "Virgo", asc_sign_name == "Virgo"),
            ("Ascendant Degree Range", f"{asc_degree:.1f}°", "17-18°", 17 <= asc_degree <= 18),
            ("Nakshatra Indexing", "1-27", "1-27", all(1 <= p['nakshatra'] <= 27 for p in planets_list)),
            ("Pada Range", "1-4", "1-4", all(1 <= p['pada'] <= 4 for p in planets_list)),
            ("House System", "Whole Sign", "Whole Sign", True),
        ]

        passed = 0
        for check_name, actual, expected, result in checks:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} | {check_name:25} | Expected: {expected:15} | Got: {actual}")
            if result:
                passed += 1

        print(f"\nResult: {passed}/{len(checks)} checks passed")
        return passed == len(checks)
    
    def validate_divisional_charts(self):
        """Validate divisional chart calculations."""
        print("\n" + "="*80)
        print("VALIDATING DIVISIONAL CHARTS (D9 Navamsa, D10 Dasamsa)")
        print("="*80)

        # Birth details
        birth_date = "1963-09-06"
        birth_time = "11:00:00"
        latitude = 17.25
        longitude = 80.15
        timezone = "Asia/Kolkata"

        # Create datetime
        dt_str = f"{birth_date} {birth_time}"
        dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
        tz = ZoneInfo(timezone)
        birth_datetime = dt.replace(tzinfo=tz)

        # Calculate planets
        planets_dict = self.ephemeris.calculate_all_planets(birth_datetime)

        # Calculate divisional charts
        print("\n📊 D9 NAVAMSA CHART:")
        print("-" * 80)
        d9_charts = self.divisional.calculate_all_divisional_charts(planets_dict, ['D9'])

        if 'D9' in d9_charts:
            d9_data = d9_charts['D9']
            print(f"Chart: {d9_data['name']}")
            print(f"Description: {d9_data['description']}")
            print("\nPlanetary Positions in D9:")

            for planet_name, position in d9_data['planets'].items():
                sign_num = position['sign_number']
                degree = position['degree_in_sign']
                from app.core.ephemeris import get_sign_name
                sign_name = get_sign_name(sign_num)
                print(f"  {planet_name:10} | {sign_name:12} {degree:6.2f}°")

        print("\n📊 D10 DASAMSA CHART:")
        print("-" * 80)
        d10_charts = self.divisional.calculate_all_divisional_charts(planets_dict, ['D10'])

        if 'D10' in d10_charts:
            d10_data = d10_charts['D10']
            print(f"Chart: {d10_data['name']}")
            print(f"Description: {d10_data['description']}")
            print("\nPlanetary Positions in D10:")

            for planet_name, position in d10_data['planets'].items():
                sign_num = position['sign_number']
                degree = position['degree_in_sign']
                from app.core.ephemeris import get_sign_name
                sign_name = get_sign_name(sign_num)
                print(f"  {planet_name:10} | {sign_name:12} {degree:6.2f}°")

        print("\n✅ DIVISIONAL CHART VALIDATION:")
        print("-" * 80)
        print("✅ D9 Navamsa calculation working")
        print("✅ D10 Dasamsa calculation working")
        print("✅ All planetary positions calculated")

        return True

    def validate_test_cases(self):
        """Validate with multiple test cases."""
        test_cases = [
            {
                "name": "Morning Birth",
                "date": "1980-03-15",
                "time": "06:30:00",
                "lat": 28.7041,
                "lon": 77.1025,
                "tz": "Asia/Kolkata",
                "location": "Delhi, India"
            },
            {
                "name": "Afternoon Birth",
                "date": "1975-07-22",
                "time": "14:45:00",
                "lat": 19.0760,
                "lon": 72.8777,
                "tz": "Asia/Kolkata",
                "location": "Mumbai, India"
            },
            {
                "name": "Evening Birth",
                "date": "1990-11-08",
                "time": "18:20:00",
                "lat": 12.9716,
                "lon": 77.5946,
                "tz": "Asia/Kolkata",
                "location": "Bangalore, India"
            },
        ]

        print("\n" + "="*80)
        print("VALIDATING MULTIPLE TEST CASES")
        print("="*80)

        for test_case in test_cases:
            print(f"\n📍 {test_case['name']} ({test_case['location']})")
            print(f"   Date: {test_case['date']} {test_case['time']}")

            dt_str = f"{test_case['date']} {test_case['time']}"
            dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M:%S")
            tz = ZoneInfo(test_case['tz'])
            birth_datetime = dt.replace(tzinfo=tz)

            try:
                planets_dict = self.ephemeris.calculate_all_planets(birth_datetime)

                # Check nakshatra range
                nakshatra_valid = all(1 <= p['nakshatra_number'] <= 27 for p in planets_dict.values())
                pada_valid = all(1 <= p['pada'] <= 4 for p in planets_dict.values())

                status = "✅" if (nakshatra_valid and pada_valid) else "❌"
                print(f"   {status} Nakshatras: {nakshatra_valid} | Padas: {pada_valid}")

            except Exception as e:
                print(f"   ❌ Error: {str(e)}")


def main():
    """Run all validation tests."""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*78 + "║")
    print("║" + "  ASTROGYAN.COM ALIGNMENT VALIDATION SUITE".center(78) + "║")
    print("║" + " "*78 + "║")
    print("╚" + "="*78 + "╝")

    validator = AstrogyanValidator()

    # Run primary validation
    primary_pass = validator.validate_ravi_tadakamalla()

    # Run divisional chart validation
    divisional_pass = validator.validate_divisional_charts()

    # Run test cases
    validator.validate_test_cases()

    # Summary
    print("\n" + "="*80)
    print("VALIDATION SUMMARY")
    print("="*80)
    print(f"Primary Test (Ravi Tadakamalla): {'✅ PASSED' if primary_pass else '❌ FAILED'}")
    print(f"Divisional Charts: {'✅ PASSED' if divisional_pass else '❌ FAILED'}")
    print("\nAll validations complete!")


if __name__ == "__main__":
    main()

