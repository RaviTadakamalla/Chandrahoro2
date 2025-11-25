"""Image generation service for chart exports."""

import io
import base64
from typing import Dict, Any, Optional, Tuple
import logging

try:
    from PIL import Image, ImageDraw, ImageFont, ImageOps
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    # Create dummy Image class for type hints when PIL is not available
    class Image:
        class Image:
            pass

try:
    import cairosvg
    CAIROSVG_AVAILABLE = True
except (ImportError, OSError):
    CAIROSVG_AVAILABLE = False

logger = logging.getLogger(__name__)


class ImageGenerator:
    """Generate PNG and SVG images from chart data."""
    
    def __init__(self):
        """Initialize image generator."""
        self.chart_size = 800
        self.background_color = "#ffffff"
        self.text_color = "#000000"
        self.optimization_settings = {
            'png': {
                'optimize': True,
                'quality': 85,
                'compress_level': 6
            },
            'svg': {
                'optimize': True,
                'precision': 2,
                'remove_metadata': True
            }
        }
        self.planet_colors = {
            'Sun': '#FFA500',
            'Moon': '#C0C0C0', 
            'Mercury': '#00FF00',
            'Venus': '#0000FF',
            'Mars': '#FF0000',
            'Jupiter': '#FFFF00',
            'Saturn': '#800080',
            'Rahu': '#8B4513',
            'Ketu': '#8B4513'
        }
    
    def generate_chart_svg(self, chart_data: Dict[str, Any], 
                          chart_style: str = "north") -> str:
        """
        Generate SVG representation of the chart.
        
        Args:
            chart_data: Chart data with planetary positions
            chart_style: Chart style ('north' or 'south')
            
        Returns:
            SVG string
        """
        if chart_style.lower() == "south":
            return self._generate_south_indian_svg(chart_data)
        else:
            return self._generate_north_indian_svg(chart_data)
    
    def generate_chart_png(self, chart_data: Dict[str, Any], 
                          chart_style: str = "north",
                          size: int = 800) -> bytes:
        """
        Generate PNG representation of the chart.
        
        Args:
            chart_data: Chart data with planetary positions
            chart_style: Chart style ('north' or 'south')
            size: Image size in pixels
            
        Returns:
            PNG image bytes
        """
        if not PIL_AVAILABLE:
            raise RuntimeError("PIL (Pillow) is required for PNG generation")
        
        # Generate SVG first
        svg_content = self.generate_chart_svg(chart_data, chart_style)
        
        # Convert SVG to PNG if cairosvg is available
        if CAIROSVG_AVAILABLE:
            try:
                png_bytes = cairosvg.svg2png(
                    bytestring=svg_content.encode('utf-8'),
                    output_width=size,
                    output_height=size
                )
                return png_bytes
            except Exception as e:
                logger.warning(f"Failed to convert SVG to PNG with cairosvg: {e}")
        
        # Fallback: Create a simple PNG using PIL
        return self._generate_simple_png(chart_data, chart_style, size)
    
    def _generate_north_indian_svg(self, chart_data: Dict[str, Any]) -> str:
        """Generate North Indian (diamond) style SVG chart."""
        size = self.chart_size
        center = size // 2
        
        # SVG header
        svg = f'''<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="{size}" height="{size}" fill="{self.background_color}"/>
        '''
        
        # Draw diamond shape (rotated square)
        diamond_size = size * 0.7
        half_size = diamond_size / 2
        
        # Diamond points
        top = (center, center - half_size)
        right = (center + half_size, center)
        bottom = (center, center + half_size)
        left = (center - half_size, center)
        
        # Draw outer diamond
        svg += f'''<polygon points="{top[0]},{top[1]} {right[0]},{right[1]} {bottom[0]},{bottom[1]} {left[0]},{left[1]}" 
                   fill="none" stroke="{self.text_color}" stroke-width="2"/>'''
        
        # Draw inner divisions for houses
        # Horizontal line
        svg += f'<line x1="{left[0]}" y1="{left[1]}" x2="{right[0]}" y2="{right[1]}" stroke="{self.text_color}" stroke-width="1"/>'
        # Vertical line
        svg += f'<line x1="{top[0]}" y1="{top[1]}" x2="{bottom[0]}" y2="{bottom[1]}" stroke="{self.text_color}" stroke-width="1"/>'
        
        # Add house numbers and planets
        house_positions = self._get_north_indian_house_positions(center, half_size)
        
        for house_num in range(1, 13):
            x, y = house_positions[house_num]
            
            # Add house number
            svg += f'<text x="{x}" y="{y-20}" text-anchor="middle" font-family="Arial" font-size="12" fill="{self.text_color}">{house_num}</text>'
            
            # Add planets in this house
            planets_in_house = self._get_planets_in_house(chart_data, house_num)
            for i, planet in enumerate(planets_in_house):
                planet_y = y + (i * 15)
                color = self.planet_colors.get(planet['name'], self.text_color)
                retrograde = " R" if planet.get('retrograde', False) else ""
                svg += f'<text x="{x}" y="{planet_y}" text-anchor="middle" font-family="Arial" font-size="10" fill="{color}">{planet["name"][:2]}{retrograde}</text>'
        
        svg += '</svg>'
        return svg
    
    def _generate_south_indian_svg(self, chart_data: Dict[str, Any]) -> str:
        """Generate South Indian (square grid) style SVG chart."""
        size = self.chart_size
        cell_size = size // 4
        
        # SVG header
        svg = f'''<svg width="{size}" height="{size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="{size}" height="{size}" fill="{self.background_color}"/>
        '''
        
        # Draw 4x4 grid
        for i in range(5):
            # Vertical lines
            x = i * cell_size
            svg += f'<line x1="{x}" y1="0" x2="{x}" y2="{size}" stroke="{self.text_color}" stroke-width="1"/>'
            # Horizontal lines
            y = i * cell_size
            svg += f'<line x1="0" y1="{y}" x2="{size}" y2="{y}" stroke="{self.text_color}" stroke-width="1"/>'
        
        # House mapping for South Indian chart
        house_grid = [
            [12, 1, 2, 3],
            [11, None, None, 4],
            [10, None, None, 5],
            [9, 8, 7, 6]
        ]
        
        # Add house numbers and planets
        for row in range(4):
            for col in range(4):
                house_num = house_grid[row][col]
                if house_num is not None:
                    x = col * cell_size + cell_size // 2
                    y = row * cell_size + cell_size // 2
                    
                    # Add house number
                    svg += f'<text x="{x}" y="{y-20}" text-anchor="middle" font-family="Arial" font-size="12" fill="{self.text_color}">{house_num}</text>'
                    
                    # Add planets in this house
                    planets_in_house = self._get_planets_in_house(chart_data, house_num)
                    for i, planet in enumerate(planets_in_house):
                        planet_y = y + (i * 15)
                        color = self.planet_colors.get(planet['name'], self.text_color)
                        retrograde = " R" if planet.get('retrograde', False) else ""
                        svg += f'<text x="{x}" y="{planet_y}" text-anchor="middle" font-family="Arial" font-size="10" fill="{color}">{planet["name"][:2]}{retrograde}</text>'
        
        svg += '</svg>'
        return svg
    
    def _generate_simple_png(self, chart_data: Dict[str, Any], 
                           chart_style: str, size: int) -> bytes:
        """Generate a simple PNG using PIL as fallback."""
        # Create a white image
        img = Image.new('RGB', (size, size), 'white')
        draw = ImageDraw.Draw(img)
        
        # Try to load a font
        try:
            font = ImageFont.truetype("Arial.ttf", 16)
            small_font = ImageFont.truetype("Arial.ttf", 12)
        except:
            font = ImageFont.load_default()
            small_font = ImageFont.load_default()
        
        # Draw a simple chart representation
        center = size // 2
        
        if chart_style.lower() == "south":
            # Draw 4x4 grid
            cell_size = size // 4
            for i in range(5):
                # Vertical lines
                draw.line([(i * cell_size, 0), (i * cell_size, size)], fill='black', width=1)
                # Horizontal lines
                draw.line([(0, i * cell_size), (size, i * cell_size)], fill='black', width=1)
            
            # Add title
            draw.text((center, 20), "South Indian Chart", fill='black', font=font, anchor='mm')
        else:
            # Draw diamond
            diamond_size = size * 0.7
            half_size = diamond_size / 2
            
            points = [
                (center, center - half_size),  # top
                (center + half_size, center),  # right
                (center, center + half_size),  # bottom
                (center - half_size, center)   # left
            ]
            
            draw.polygon(points, outline='black', width=2)
            
            # Draw cross lines
            draw.line([points[3], points[1]], fill='black', width=1)  # horizontal
            draw.line([points[0], points[2]], fill='black', width=1)  # vertical
            
            # Add title
            draw.text((center, 20), "North Indian Chart", fill='black', font=font, anchor='mm')
        
        # Add planets text
        y_offset = 50
        if 'planets' in chart_data:
            for planet in chart_data['planets']:
                planet_text = f"{planet['name']}: {planet.get('sign', 'Unknown')} {planet.get('house', '?')}H"
                draw.text((20, y_offset), planet_text, fill='black', font=small_font)
                y_offset += 20
        
        # Convert to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        return img_bytes.getvalue()
    
    def _get_north_indian_house_positions(self, center: float, half_size: float) -> Dict[int, Tuple[float, float]]:
        """Get house positions for North Indian chart."""
        positions = {}
        
        # House positions in diamond layout
        positions[1] = (center, center - half_size + 30)  # Top
        positions[2] = (center + half_size * 0.7, center - half_size * 0.7)  # Top-right
        positions[3] = (center + half_size - 30, center)  # Right
        positions[4] = (center + half_size * 0.7, center + half_size * 0.7)  # Bottom-right
        positions[5] = (center, center + half_size - 30)  # Bottom
        positions[6] = (center - half_size * 0.7, center + half_size * 0.7)  # Bottom-left
        positions[7] = (center - half_size + 30, center)  # Left
        positions[8] = (center - half_size * 0.7, center - half_size * 0.7)  # Top-left
        positions[9] = (center - half_size * 0.3, center - half_size * 0.3)  # Inner top-left
        positions[10] = (center - half_size * 0.3, center + half_size * 0.3)  # Inner bottom-left
        positions[11] = (center + half_size * 0.3, center + half_size * 0.3)  # Inner bottom-right
        positions[12] = (center + half_size * 0.3, center - half_size * 0.3)  # Inner top-right
        
        return positions
    
    def _get_planets_in_house(self, chart_data: Dict[str, Any], house_num: int) -> list:
        """Get planets in a specific house."""
        planets_in_house = []
        
        if 'planets' in chart_data:
            for planet in chart_data['planets']:
                if planet.get('house') == house_num:
                    planets_in_house.append(planet)
        
        return planets_in_house
    
    def get_supported_formats(self) -> Dict[str, bool]:
        """Get supported export formats."""
        return {
            'svg': True,  # Always supported
            'png': PIL_AVAILABLE,
            'png_advanced': CAIROSVG_AVAILABLE
        }

    def optimize_png(self, image: Image.Image, quality: int = 85, compress_level: int = 6) -> bytes:
        """Optimize PNG image for smaller file size."""
        if not PIL_AVAILABLE:
            raise RuntimeError("PIL is not available for PNG optimization")

        # Convert to RGB if necessary (removes alpha channel for smaller size)
        if image.mode in ('RGBA', 'LA'):
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'RGBA':
                background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
            else:
                background.paste(image)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')

        # Apply optimization
        buffer = io.BytesIO()
        image.save(
            buffer,
            format='PNG',
            optimize=True,
            compress_level=compress_level
        )

        return buffer.getvalue()

    def optimize_svg(self, svg_content: str, precision: int = 2, remove_metadata: bool = True) -> str:
        """Optimize SVG content for smaller file size."""
        import re

        # Remove comments
        svg_content = re.sub(r'<!--.*?-->', '', svg_content, flags=re.DOTALL)

        # Remove metadata if requested
        if remove_metadata:
            svg_content = re.sub(r'<metadata>.*?</metadata>', '', svg_content, flags=re.DOTALL)
            svg_content = re.sub(r'<title>.*?</title>', '', svg_content, flags=re.DOTALL)
            svg_content = re.sub(r'<desc>.*?</desc>', '', svg_content, flags=re.DOTALL)

        # Round numbers to specified precision
        def round_numbers(match):
            number = float(match.group(0))
            return str(round(number, precision))

        # Find and round all numbers
        svg_content = re.sub(r'-?\d+\.?\d*', round_numbers, svg_content)

        # Remove unnecessary whitespace
        svg_content = re.sub(r'\s+', ' ', svg_content)
        svg_content = re.sub(r'>\s+<', '><', svg_content)

        # Remove empty attributes
        svg_content = re.sub(r'\s+[a-zA-Z-]+=""', '', svg_content)

        return svg_content.strip()

    def generate_optimized_png(self, chart_data: Dict[str, Any],
                              size: Tuple[int, int] = (800, 800),
                              quality: int = 85) -> bytes:
        """Generate optimized PNG image of the chart."""
        try:
            # Generate base PNG
            png_data = self.generate_png(chart_data, size)

            # Load image for optimization
            image = Image.open(io.BytesIO(png_data))

            # Apply optimization
            optimized_data = self.optimize_png(image, quality)

            logger.info(f"PNG optimization: {len(png_data)} -> {len(optimized_data)} bytes "
                       f"({(1 - len(optimized_data)/len(png_data))*100:.1f}% reduction)")

            return optimized_data

        except Exception as e:
            logger.error(f"Failed to generate optimized PNG: {e}")
            # Fallback to regular PNG
            return self.generate_png(chart_data, size)

    def generate_optimized_svg(self, chart_data: Dict[str, Any],
                              size: Tuple[int, int] = (800, 800),
                              precision: int = 2) -> str:
        """Generate optimized SVG image of the chart."""
        try:
            # Generate base SVG
            svg_content = self.generate_svg(chart_data, size)

            # Apply optimization
            optimized_svg = self.optimize_svg(svg_content, precision)

            logger.info(f"SVG optimization: {len(svg_content)} -> {len(optimized_svg)} chars "
                       f"({(1 - len(optimized_svg)/len(svg_content))*100:.1f}% reduction)")

            return optimized_svg

        except Exception as e:
            logger.error(f"Failed to generate optimized SVG: {e}")
            # Fallback to regular SVG
            return self.generate_svg(chart_data, size)

    def create_thumbnail(self, image_data: bytes, size: Tuple[int, int] = (200, 200)) -> bytes:
        """Create optimized thumbnail from image data."""
        if not PIL_AVAILABLE:
            raise RuntimeError("PIL is not available for thumbnail creation")

        try:
            image = Image.open(io.BytesIO(image_data))

            # Create thumbnail maintaining aspect ratio
            image.thumbnail(size, Image.Resampling.LANCZOS)

            # Optimize thumbnail
            optimized_data = self.optimize_png(image, quality=75)

            return optimized_data

        except Exception as e:
            logger.error(f"Failed to create thumbnail: {e}")
            raise
