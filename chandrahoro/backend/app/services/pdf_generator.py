"""PDF report generation service for Vedic horoscope charts."""

import io
from datetime import datetime
from typing import Dict, Any, Optional
import logging

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
    from reportlab.platypus.flowables import Image
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

logger = logging.getLogger(__name__)


class PDFReportGenerator:
    """Generate PDF reports for Vedic horoscope charts."""
    
    def __init__(self):
        """Initialize PDF generator."""
        if not REPORTLAB_AVAILABLE:
            logger.warning("ReportLab not available, PDF generation will be disabled")
        
        self.styles = getSampleStyleSheet() if REPORTLAB_AVAILABLE else None
        if self.styles:
            # Custom styles
            self.styles.add(ParagraphStyle(
                name='ChartTitle',
                parent=self.styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkblue
            ))
            
            self.styles.add(ParagraphStyle(
                name='SectionHeader',
                parent=self.styles['Heading2'],
                fontSize=14,
                spaceAfter=12,
                spaceBefore=20,
                textColor=colors.darkblue
            ))
    
    def generate_chart_report(self, chart_data: Dict[str, Any]) -> Optional[bytes]:
        """
        Generate a comprehensive PDF report for a Vedic chart.
        
        Args:
            chart_data: Complete chart data including planets, houses, dashas, etc.
            
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
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Build content
            story = []
            
            # Title page
            self._add_title_page(story, chart_data)
            
            # Birth information
            self._add_birth_information(story, chart_data)
            
            # Planetary positions
            self._add_planetary_positions(story, chart_data)
            
            # Current Dasha
            if chart_data.get('current_dasha'):
                self._add_current_dasha(story, chart_data['current_dasha'])
            
            # Divisional charts summary
            if chart_data.get('divisional_charts'):
                self._add_divisional_charts_summary(story, chart_data['divisional_charts'])
            
            # Footer
            self._add_footer(story)
            
            # Build PDF
            doc.build(story)
            
            # Get PDF bytes
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"Error generating PDF report: {e}")
            return None
    
    def _add_title_page(self, story: list, chart_data: Dict[str, Any]):
        """Add title page to the report."""
        birth_info = chart_data.get('birth_info', {})
        name = birth_info.get('name', 'Anonymous')
        
        # Main title
        title = Paragraph(
            f"Vedic Horoscope Chart<br/>{name}",
            self.styles['ChartTitle']
        )
        story.append(title)
        story.append(Spacer(1, 0.5 * inch))
        
        # Birth details summary
        birth_date = birth_info.get('date', 'Unknown')
        birth_time = birth_info.get('time', 'Unknown')
        location = birth_info.get('location_name', 'Unknown')
        
        summary_text = f"""
        <b>Date of Birth:</b> {birth_date}<br/>
        <b>Time of Birth:</b> {birth_time}<br/>
        <b>Place of Birth:</b> {location}<br/>
        <b>Report Generated:</b> {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        """
        
        summary = Paragraph(summary_text, self.styles['Normal'])
        story.append(summary)
        story.append(Spacer(1, 0.5 * inch))
        
        # Ascendant information
        ascendant_sign = chart_data.get('ascendant_sign', 'Unknown')
        ascendant_degree = chart_data.get('ascendant', 0)
        ayanamsha = chart_data.get('ayanamsha_value', 0)
        
        ascendant_text = f"""
        <b>Ascendant (Lagna):</b> {ascendant_sign} {ascendant_degree:.2f}°<br/>
        <b>Ayanamsha:</b> {ayanamsha:.2f}° (Lahiri)
        """
        
        ascendant_para = Paragraph(ascendant_text, self.styles['Normal'])
        story.append(ascendant_para)
        story.append(PageBreak())
    
    def _add_birth_information(self, story: list, chart_data: Dict[str, Any]):
        """Add detailed birth information section."""
        story.append(Paragraph("Birth Information", self.styles['SectionHeader']))
        
        birth_info = chart_data.get('birth_info', {})
        
        # Create table with birth details
        data = [
            ['Name', birth_info.get('name', 'Not provided')],
            ['Date of Birth', birth_info.get('date', 'Unknown')],
            ['Time of Birth', birth_info.get('time', 'Unknown')],
            ['Place of Birth', birth_info.get('location_name', 'Unknown')],
            ['Ascendant Sign', chart_data.get('ascendant_sign', 'Unknown')],
            ['Ascendant Degree', f"{chart_data.get('ascendant', 0):.2f}°"],
            ['Ayanamsha Value', f"{chart_data.get('ayanamsha_value', 0):.2f}°"]
        ]
        
        table = Table(data, colWidths=[2*inch, 4*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
        story.append(Spacer(1, 0.3 * inch))
    
    def _add_planetary_positions(self, story: list, chart_data: Dict[str, Any]):
        """Add planetary positions table."""
        story.append(Paragraph("Planetary Positions", self.styles['SectionHeader']))
        
        planets = chart_data.get('planets', [])
        
        # Table headers
        data = [['Planet', 'Sign', 'Degree', 'Nakshatra', 'Pada', 'House', 'Status']]
        
        # Add planet data
        for planet in planets:
            status = 'Retrograde' if planet.get('retrograde', False) else 'Direct'
            data.append([
                planet.get('name', ''),
                planet.get('sign', ''),
                f"{planet.get('degree_in_sign', 0):.2f}°",
                planet.get('nakshatra', ''),
                str(planet.get('pada', '')),
                str(planet.get('house', '')),
                status
            ])
        
        table = Table(data, colWidths=[0.8*inch, 1*inch, 0.8*inch, 1.2*inch, 0.5*inch, 0.5*inch, 0.8*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9)
        ]))
        
        story.append(table)
        story.append(Spacer(1, 0.3 * inch))
    
    def _add_current_dasha(self, story: list, dasha_data: Dict[str, Any]):
        """Add current Dasha information."""
        story.append(Paragraph("Current Dasha Periods", self.styles['SectionHeader']))
        
        mahadasha = dasha_data.get('mahadasha', {})
        antardasha = dasha_data.get('antardasha', {})
        pratyantardasha = dasha_data.get('pratyantardasha', {})
        
        dasha_text = f"""
        <b>Mahadasha:</b> {mahadasha.get('planet', 'Unknown')} 
        ({mahadasha.get('start_date', '')} to {mahadasha.get('end_date', '')})<br/>
        """
        
        if antardasha:
            dasha_text += f"""
            <b>Antardasha:</b> {antardasha.get('planet', 'Unknown')} 
            ({antardasha.get('start_date', '')} to {antardasha.get('end_date', '')})<br/>
            """
        
        if pratyantardasha:
            dasha_text += f"""
            <b>Pratyantardasha:</b> {pratyantardasha.get('planet', 'Unknown')} 
            ({pratyantardasha.get('start_date', '')} to {pratyantardasha.get('end_date', '')})
            """
        
        dasha_para = Paragraph(dasha_text, self.styles['Normal'])
        story.append(dasha_para)
        story.append(Spacer(1, 0.3 * inch))
    
    def _add_divisional_charts_summary(self, story: list, divisional_charts: Dict[str, Any]):
        """Add summary of divisional charts."""
        story.append(Paragraph("Divisional Charts Summary", self.styles['SectionHeader']))
        
        for chart_type, chart_data in divisional_charts.items():
            chart_name = chart_data.get('name', chart_type)
            description = chart_data.get('description', '')
            
            chart_text = f"<b>{chart_type} - {chart_name}:</b> {description}"
            chart_para = Paragraph(chart_text, self.styles['Normal'])
            story.append(chart_para)
            story.append(Spacer(1, 0.1 * inch))
    
    def _add_footer(self, story: list):
        """Add footer with disclaimer."""
        story.append(Spacer(1, 0.5 * inch))
        
        disclaimer = """
        <b>Disclaimer:</b> This report is generated for educational and entertainment purposes only. 
        Vedic astrology is a traditional system of divination and should not be used as the sole basis 
        for making important life decisions. Please consult with qualified professionals for matters 
        concerning health, finance, relationships, or other significant life choices.
        """
        
        disclaimer_para = Paragraph(disclaimer, self.styles['Normal'])
        story.append(disclaimer_para)
        
        # Generated by
        footer_text = f"""
        <br/><br/>
        Generated by Vedic Horoscope Chart Pack<br/>
        Report created on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
        """
        
        footer_para = Paragraph(footer_text, self.styles['Normal'])
        story.append(footer_para)
