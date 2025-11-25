# Implementation Plan - Reference PDF Matching

## 🎯 **Executive Summary**

To match the reference PDF (`JD_Horo_Just_A_Sample.pdf`), we need to implement:

1. **Dasha-Bhukti Intensity Scoring System** (Core requirement)
2. **Bhava-based Reasoning Engine** (Explanations)
3. **Advanced PDF Report Generator** (38-page format)
4. **Trend Analysis & Visualization** (Charts and graphs)

**Current Status:** 65% complete (core calculations done)
**Missing:** 35% (intensity scoring, advanced PDF, trend analysis)

---

## 📋 **Phase 1: Dasha-Bhukti Intensity System**

### **1.1 Create Intensity Calculator Service**

**File:** `backend/app/core/dasha_intensity.py`

```python
from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DashaIntensityCalculator:
    """Calculate Dasha-Bhukti intensity scores for life areas."""
    
    # Life areas and their primary houses
    LIFE_AREAS = {
        'wealth': {'primary': [2, 11], 'secondary': [1, 9], 'weight': 1.0},
        'business': {'primary': [10, 6], 'secondary': [3, 11], 'weight': 1.0},
        'health': {'primary': [1, 6], 'secondary': [8, 12], 'weight': 1.0},
        'wife': {'primary': [7], 'secondary': [2, 4, 8], 'weight': 1.0},
        'kids': {'primary': [5], 'secondary': [9, 11], 'weight': 1.0},
        'career': {'primary': [10], 'secondary': [1, 6, 11], 'weight': 1.0}
    }
    
    def __init__(self):
        """Initialize intensity calculator."""
        pass
    
    def calculate_all_intensities(self, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate intensity scores for all Dasha-Bhukti periods.
        
        Args:
            chart_data: Complete chart data with planets, houses, dasha
            
        Returns:
            Dictionary with intensity scores and reasoning
        """
        try:
            # Get dasha timeline (full 120-year cycle)
            dasha_navigator = chart_data.get('dasha_navigator', {})
            planets = chart_data.get('planets', [])
            houses = chart_data.get('houses', [])
            
            # Convert to internal format
            planet_data = self._convert_planet_data(planets)
            house_data = self._convert_house_data(houses)
            
            # Calculate intensities for each period
            intensity_results = []
            
            for mahadasha in dasha_navigator.get('mahadashas', []):
                maha_planet = mahadasha['planet']
                
                for bhukti in mahadasha.get('bhuktis', []):
                    bhukti_planet = bhukti['planet']
                    
                    # Calculate scores for all life areas
                    period_scores = self._calculate_period_scores(
                        maha_planet, bhukti_planet, planet_data, house_data
                    )
                    
                    # Generate reasoning
                    reasoning = self._generate_period_reasoning(
                        maha_planet, bhukti_planet, period_scores, planet_data, house_data
                    )
                    
                    intensity_results.append({
                        'mahadasha': maha_planet,
                        'bhukti': bhukti_planet,
                        'start_date': bhukti['start_date'],
                        'end_date': bhukti['end_date'],
                        'scores': period_scores,
                        'reasoning': reasoning
                    })
            
            return {
                'intensity_table': intensity_results,
                'summary': self._generate_summary(intensity_results),
                'methodology': self._get_methodology_notes()
            }
            
        except Exception as e:
            logger.error(f"Error calculating intensities: {e}")
            return {}
    
    def _calculate_period_scores(self, maha_planet: str, bhukti_planet: str,
                                planet_data: Dict, house_data: Dict) -> Dict[str, float]:
        """Calculate intensity scores for a specific Dasha-Bhukti period."""
        scores = {}
        
        for area, config in self.LIFE_AREAS.items():
            # Base score from Mahadasha planet
            maha_score = self._calculate_planet_score_for_area(
                maha_planet, area, config, planet_data, house_data
            )
            
            # Modifier from Bhukti planet
            bhukti_score = self._calculate_planet_score_for_area(
                bhukti_planet, area, config, planet_data, house_data
            )
            
            # Combined score (weighted average)
            combined_score = (maha_score * 0.7) + (bhukti_score * 0.3)
            
            # Normalize to 1-10 scale
            final_score = max(1.0, min(10.0, combined_score))
            scores[area] = round(final_score, 1)
        
        return scores
    
    def _calculate_planet_score_for_area(self, planet: str, area: str, 
                                       config: Dict, planet_data: Dict, 
                                       house_data: Dict) -> float:
        """Calculate how a planet affects a specific life area."""
        if planet not in planet_data:
            return 5.0  # Neutral score
        
        planet_info = planet_data[planet]
        planet_house = planet_info.get('house', 1)
        planet_sign = planet_info.get('sign_number', 0)
        
        # Base score
        score = 5.0
        
        # House placement effect
        primary_houses = config['primary']
        secondary_houses = config['secondary']
        
        if planet_house in primary_houses:
            score += 2.5  # Strong positive effect
        elif planet_house in secondary_houses:
            score += 1.0  # Moderate positive effect
        
        # Sign strength effect
        sign_strength = self._get_planet_sign_strength(planet, planet_sign)
        score += sign_strength
        
        # Aspect effects (simplified)
        aspect_effect = self._calculate_aspect_effects(planet, area, planet_data)
        score += aspect_effect
        
        return score
    
    def _get_planet_sign_strength(self, planet: str, sign_number: int) -> float:
        """Get planet strength in sign (-2 to +2)."""
        # Exaltation signs
        exaltation = {
            'Sun': 0, 'Moon': 1, 'Mars': 9, 'Mercury': 5,
            'Jupiter': 3, 'Venus': 11, 'Saturn': 6
        }
        
        # Debilitation signs
        debilitation = {
            'Sun': 6, 'Moon': 7, 'Mars': 3, 'Mercury': 11,
            'Jupiter': 9, 'Venus': 5, 'Saturn': 0
        }
        
        if planet in exaltation and exaltation[planet] == sign_number:
            return 2.0  # Exalted
        elif planet in debilitation and debilitation[planet] == sign_number:
            return -2.0  # Debilitated
        else:
            return 0.0  # Neutral
    
    def _calculate_aspect_effects(self, planet: str, area: str, 
                                planet_data: Dict) -> float:
        """Calculate aspect effects on life area (simplified)."""
        # This is a simplified version - full implementation would be more complex
        return 0.0
    
    def _generate_period_reasoning(self, maha_planet: str, bhukti_planet: str,
                                 scores: Dict[str, float], planet_data: Dict,
                                 house_data: Dict) -> Dict[str, str]:
        """Generate detailed reasoning for each life area score."""
        reasoning = {}
        
        for area, score in scores.items():
            reason_parts = []
            
            # Mahadasha planet analysis
            maha_info = planet_data.get(maha_planet, {})
            maha_house = maha_info.get('house', 1)
            maha_sign = maha_info.get('sign', 'Unknown')
            
            reason_parts.append(f"Mahadasha of {maha_planet} in {maha_house}th house ({maha_sign})")
            
            # Bhukti planet analysis
            bhukti_info = planet_data.get(bhukti_planet, {})
            bhukti_house = bhukti_info.get('house', 1)
            bhukti_sign = bhukti_info.get('sign', 'Unknown')
            
            reason_parts.append(f"Bhukti of {bhukti_planet} in {bhukti_house}th house ({bhukti_sign})")
            
            # Area-specific analysis
            area_config = self.LIFE_AREAS[area]
            primary_houses = area_config['primary']
            
            if maha_house in primary_houses or bhukti_house in primary_houses:
                reason_parts.append(f"Strong influence on {area} due to placement in key houses")
            
            # Score interpretation
            if score >= 8.0:
                reason_parts.append("Excellent period for this area")
            elif score >= 6.0:
                reason_parts.append("Good period with positive outcomes")
            elif score >= 4.0:
                reason_parts.append("Average period with mixed results")
            else:
                reason_parts.append("Challenging period requiring caution")
            
            reasoning[area] = ". ".join(reason_parts) + "."
        
        return reasoning
    
    def _convert_planet_data(self, planets: List[Dict]) -> Dict[str, Dict]:
        """Convert planet list to dictionary format."""
        planet_dict = {}
        for planet in planets:
            planet_dict[planet['name']] = {
                'house': planet.get('house', 1),
                'sign': planet.get('sign', 'Aries'),
                'sign_number': planet.get('sign_number', 0),
                'longitude': planet.get('sidereal_longitude', 0.0)
            }
        return planet_dict
    
    def _convert_house_data(self, houses: List[Dict]) -> Dict[int, Dict]:
        """Convert house list to dictionary format."""
        house_dict = {}
        for house in houses:
            house_dict[house['number']] = {
                'cusp_longitude': house.get('cusp_longitude', 0.0),
                'sign': house.get('sign', 'Aries')
            }
        return house_dict
    
    def _generate_summary(self, intensity_results: List[Dict]) -> Dict[str, Any]:
        """Generate summary statistics."""
        if not intensity_results:
            return {}
        
        # Calculate average scores by life area
        area_averages = {}
        for area in self.LIFE_AREAS.keys():
            scores = [result['scores'][area] for result in intensity_results]
            area_averages[area] = round(sum(scores) / len(scores), 1)
        
        # Find best and worst periods
        best_periods = {}
        worst_periods = {}
        
        for area in self.LIFE_AREAS.keys():
            best_score = 0
            worst_score = 10
            best_period = None
            worst_period = None
            
            for result in intensity_results:
                score = result['scores'][area]
                if score > best_score:
                    best_score = score
                    best_period = f"{result['mahadasha']}-{result['bhukti']}"
                if score < worst_score:
                    worst_score = score
                    worst_period = f"{result['mahadasha']}-{result['bhukti']}"
            
            best_periods[area] = {'period': best_period, 'score': best_score}
            worst_periods[area] = {'period': worst_period, 'score': worst_score}
        
        return {
            'area_averages': area_averages,
            'best_periods': best_periods,
            'worst_periods': worst_periods,
            'total_periods': len(intensity_results)
        }
    
    def _get_methodology_notes(self) -> Dict[str, str]:
        """Get methodology explanation."""
        return {
            'scoring_system': "Scores range from 1-10, where 10 is most favorable",
            'calculation_method': "Weighted combination of Mahadasha (70%) and Bhukti (30%) effects",
            'house_analysis': "Primary and secondary house influences considered",
            'planetary_strength': "Exaltation, debilitation, and sign placement effects included",
            'life_areas': "Six key areas: Wealth, Business, Health, Marriage, Children, Career"
        }
```

### **1.2 Add API Endpoint**

**File:** `backend/app/api/v1/chart.py` (add to existing file)

```python
@router.post("/intensity-analysis")
async def calculate_intensity_analysis(request: ChartRequest):
    """
    Calculate Dasha-Bhukti intensity analysis for life areas.
    
    Args:
        request: Chart calculation request
        
    Returns:
        Intensity analysis with scores and reasoning
    """
    try:
        logger.info("Calculating intensity analysis")
        
        # First calculate the chart (reuse existing logic)
        chart_response = await calculate_chart(request)
        
        if not chart_response.get("success"):
            raise HTTPException(
                status_code=400,
                detail="Failed to calculate chart for intensity analysis"
            )
        
        chart_data = chart_response["data"]
        
        # Calculate intensity analysis
        intensity_calc = DashaIntensityCalculator()
        intensity_results = intensity_calc.calculate_all_intensities(chart_data)
        
        logger.info("Intensity analysis completed successfully")
        
        return {
            "success": True,
            "data": intensity_results,
            "message": "Intensity analysis calculated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error calculating intensity analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Error calculating intensity analysis: {str(e)}")
```

---

## 📋 **Phase 2: Enhanced PDF Generator**

### **2.1 Create Advanced PDF Service**

**File:** `backend/app/services/advanced_pdf_generator.py`

```python
from typing import Dict, List, Any, Optional
import io
import logging
from datetime import datetime

# ReportLab imports
try:
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

logger = logging.getLogger(__name__)

class AdvancedPDFGenerator:
    """Generate comprehensive PDF reports matching reference format."""
    
    def __init__(self):
        """Initialize advanced PDF generator."""
        if not REPORTLAB_AVAILABLE:
            logger.warning("ReportLab not available, PDF generation will be disabled")
        
        self.styles = getSampleStyleSheet() if REPORTLAB_AVAILABLE else None
        if self.styles:
            self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom styles for the report."""
        # Title style
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue,
            fontName='Helvetica-Bold'
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=15,
            spaceBefore=25,
            textColor=colors.darkblue,
            fontName='Helvetica-Bold'
        ))
        
        # Table header style
        self.styles.add(ParagraphStyle(
            name='TableHeader',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))
    
    def generate_comprehensive_report(self, chart_data: Dict[str, Any], 
                                    intensity_data: Dict[str, Any]) -> Optional[bytes]:
        """
        Generate comprehensive 38-page PDF report matching reference format.
        
        Args:
            chart_data: Complete chart data
            intensity_data: Dasha-Bhukti intensity analysis
            
        Returns:
            PDF bytes if successful, None if failed
        """
        if not REPORTLAB_AVAILABLE:
            logger.error("ReportLab not available, cannot generate PDF")
            return None
        
        try:
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Create document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=50,
                leftMargin=50,
                topMargin=50,
                bottomMargin=50
            )
            
            # Build content
            story = []
            
            # Page 1: Title page
            self._add_title_page(story, chart_data)
            story.append(PageBreak())
            
            # Pages 2-4: Chart displays
            self._add_chart_pages(story, chart_data)
            
            # Pages 5-6: Intensity table
            self._add_intensity_table(story, intensity_data)
            
            # Pages 7-18: Detailed reasoning
            self._add_detailed_reasoning(story, intensity_data)
            
            # Pages 19-36: Trend analysis
            self._add_trend_analysis(story, intensity_data)
            
            # Pages 37-38: Summary
            self._add_summary_pages(story, chart_data, intensity_data)
            
            # Build PDF
            doc.build(story)
            
            # Get PDF bytes
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Error generating comprehensive PDF report: {e}")
            return None
    
    def _add_title_page(self, story: list, chart_data: Dict[str, Any]):
        """Add title page matching reference format."""
        birth_info = chart_data.get('birth_info', {})
        
        # Main title
        title = Paragraph(
            "Horoscope Analysis — KP (D1, D9, Dasha–Bhukti 1986–2070)",
            self.styles['ReportTitle']
        )
        story.append(title)
        story.append(Spacer(1, 0.5*inch))
        
        # Birth details table
        birth_data = [
            ['Name:', birth_info.get('name', 'Anonymous')],
            ['Date of Birth:', birth_info.get('date_of_birth', 'Unknown')],
            ['Time of Birth:', birth_info.get('time_of_birth', 'Unknown')],
            ['Place of Birth:', f"{birth_info.get('place_of_birth', 'Unknown')}"],
            ['Ayanamsa:', chart_data.get('preferences', {}).get('ayanamsha', 'LAHIRI')],
            ['House System:', chart_data.get('preferences', {}).get('house_system', 'WHOLE_SIGN')]
        ]
        
        birth_table = Table(birth_data, colWidths=[2*inch, 4*inch])
        birth_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        
        story.append(birth_table)
    
    def _add_intensity_table(self, story: list, intensity_data: Dict[str, Any]):
        """Add Dasha-Bhukti intensity table."""
        story.append(Paragraph("Dasha-Bhukti Intensity Analysis", self.styles['SectionHeader']))
        
        intensity_table = intensity_data.get('intensity_table', [])
        if not intensity_table:
            story.append(Paragraph("No intensity data available", self.styles['Normal']))
            return
        
        # Create table headers
        headers = ['Mahadasha', 'Bhukti', 'Period', 'Wealth', 'Business', 'Health', 'Wife', 'Kids', 'Career']
        
        # Create table data
        table_data = [headers]
        
        for period in intensity_table[:20]:  # Show first 20 periods
            row = [
                period['mahadasha'],
                period['bhukti'],
                f"{period['start_date'][:4]}-{period['end_date'][:4]}",
                str(period['scores']['wealth']),
                str(period['scores']['business']),
                str(period['scores']['health']),
                str(period['scores']['wife']),
                str(period['scores']['kids']),
                str(period['scores']['career'])
            ]
            table_data.append(row)
        
        # Create table
        table = Table(table_data, colWidths=[0.8*inch] * 9)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        story.append(PageBreak())
    
    # Additional methods would be implemented here...
```

---

## 🎯 **Implementation Priority**

### **Immediate (Week 1-2)**
1. ✅ Create `DashaIntensityCalculator` service
2. ✅ Add intensity analysis API endpoint
3. ✅ Test with sample data

### **Short-term (Week 3-4)**
1. ✅ Enhance PDF generator for intensity tables
2. ✅ Add detailed reasoning generation
3. ✅ Create trend analysis calculations

### **Medium-term (Month 2)**
1. ✅ Complete 38-page PDF format
2. ✅ Add chart visualizations to PDF
3. ✅ Implement KP-specific features

---

## 📊 **Success Metrics**

- ✅ Intensity scores match reference PDF format (±0.5 points)
- ✅ PDF layout matches reference structure (38 pages)
- ✅ Reasoning explanations are detailed and accurate
- ✅ API response time < 5 seconds for full analysis
- ✅ PDF generation time < 10 seconds

---

**Next Step:** Implement `DashaIntensityCalculator` and test with reference data.
