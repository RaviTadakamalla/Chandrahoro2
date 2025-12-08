/**
 * Horoscope Report Component
 * 
 * Renders a comprehensive Vedic horoscope report from JSON data
 * Based on the design from pragnya_horoscope_report.html
 */

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Type definitions for the report data structure
export interface HoroscopeReportData {
  birth_details: {
    name: string;
    gender: string;
    date_of_birth: string;
    time_of_birth: string;
    place_of_birth: string;
    lagna: string;
    rashi: string;
    nakshatra: string;
  };
  planetary_positions: Array<{
    planet: string;
    longitude: string;
    sign: string;
    degree_in_sign: string;
    house: string;
    nakshatra: string;
    pada: number;
    dignity: string;
    navamsa: string;
    karaka: string;
    is_retrograde: boolean;
  }>;
  vimsottari_dasha: {
    moon_nakshatra: string;
    nakshatra_lord: string;
    mahadashas: Array<{
      planet: string;
      duration_years: number;
      start_date: string;
      end_date: string;
      position: string;
      status: string;
      is_current: boolean;
    }>;
    current_antardashas: Array<{
      period: string;
      start_date: string;
      end_date: string;
      duration: string;
      is_current: boolean;
    }>;
  };
  yoga_analysis: Array<{
    name: string;
    planets_involved: string;
    interpretation: string;
  }>;
  house_analysis: Array<{
    house_number: string;
    sign: string;
    planets: string;
    lord_position: string;
    interpretation: string;
  }>;
  life_areas: {
    personality: string;
    education_career: string;
    wealth: string;
    marriage: string;
    current_period: string;
    favorable_periods: string;
  };
  remedies: {
    primary_planet: string;
    primary_remedy: string;
    secondary_planet: string;
    secondary_remedy: string;
    general_practices: string;
    gemstones: {
      primary: string;
      secondary: string;
    };
  };
  summary: {
    ascendant: string;
    moon_sign: string;
    nakshatra: string;
    navamsa_lagna: string;
    atmakaraka: string;
    darakaraka: string;
    current_dasha: string;
    major_yogas: string;
    assessments: Array<{
      category: string;
      rating: string;
      key_factors: string;
    }>;
  };
}

interface HoroscopeReportProps {
  data: HoroscopeReportData;
  onDownloadPDF?: () => void;
}

export const HoroscopeReport: React.FC<HoroscopeReportProps> = ({ data, onDownloadPDF }) => {
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const getDignityClass = (dignity: string): string => {
    const dignityLower = dignity.toLowerCase();
    if (dignityLower.includes('own')) return 'dignity-own';
    if (dignityLower.includes('exalted')) return 'dignity-exalted';
    if (dignityLower.includes('debilitated')) return 'dignity-debilitated';
    if (dignityLower.includes('friendly')) return 'dignity-friendly';
    if (dignityLower.includes('enemy')) return 'dignity-enemy';
    return '';
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Dynamically import html2pdf.js
      const html2pdf = (await import('html2pdf.js')).default;

      const element = reportRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Vedic_Horoscope_${data.birth_details.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();

      if (onDownloadPDF) {
        onDownloadPDF();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="horoscope-report-wrapper">
      {/* Download Button */}
      <div className="mb-4 flex justify-end gap-2">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          className="bg-saffron-500 hover:bg-saffron-600"
        >
          {isGeneratingPDF ? (
            <>
              <Download className="h-4 w-4 mr-2 animate-pulse" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Report Container */}
      <div ref={reportRef} className="horoscope-report-container">
        <style jsx>{`
          /* Import all CSS from pragnya_horoscope_report.html */
          .horoscope-report-container {
            --primary: #8B4513;
            --secondary: #D4AF37;
            --accent: #CD853F;
            --bg-light: #FFF8DC;
            --bg-cream: #FFFEF0;
            --text-dark: #2C1810;
            --exalted: #228B22;
            --debilitated: #DC143C;
            --own-sign: #006400;
            --vargottama: #FFD700;
            --current-dasha: #FF8C00;

            font-family: Georgia, serif;
            background: linear-gradient(135deg, var(--bg-cream) 0%, var(--bg-light) 100%);
            color: var(--text-dark);
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(139, 69, 19, 0.2);
            border-radius: 10px;
            overflow: hidden;
          }

          .report-header {
            background: linear-gradient(135deg, var(--primary) 0%, #5D2E0C 100%);
            color: var(--secondary);
            text-align: center;
            padding: 30px 20px;
            border-bottom: 5px solid var(--secondary);
          }

          .sanskrit {
            font-size: 1.2em;
            color: #FFE4B5;
            margin-bottom: 10px;
            font-style: italic;
          }

          .report-header h1 {
            font-size: 2.5em;
            margin: 10px 0;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }

          .subtitle {
            font-size: 1.1em;
            color: #DEB887;
          }

          .section {
            padding: 25px;
            border-bottom: 2px solid var(--bg-light);
          }

          .section-title {
            color: var(--primary);
            font-size: 1.5em;
            border-bottom: 3px solid var(--secondary);
            padding-bottom: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .section-title::before,
          .section-title::after {
            content: "॥";
            color: var(--secondary);
          }

          .birth-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }

          .detail-item {
            background: var(--bg-light);
            padding: 12px 15px;
            border-radius: 8px;
            border-left: 4px solid var(--secondary);
          }

          .detail-label {
            font-weight: bold;
            color: var(--primary);
            font-size: 0.9em;
          }

          .detail-value {
            font-size: 1.1em;
            margin-top: 3px;
          }

          .dignity-own { color: var(--own-sign); font-weight: bold; }
          .dignity-exalted { color: var(--exalted); font-weight: bold; }
          .dignity-debilitated { color: var(--debilitated); font-weight: bold; }
          .dignity-friendly { color: #4169E1; }
          .dignity-enemy { color: #B22222; }

          .horoscope-report-container table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 0.9em;
          }

          .horoscope-report-container th,
          .horoscope-report-container td {
            padding: 10px 8px;
            text-align: left;
            border: 1px solid #ddd;
          }

          .horoscope-report-container th {
            background: linear-gradient(135deg, var(--primary) 0%, #6B3E26 100%);
            color: white;
            font-weight: bold;
          }

          .horoscope-report-container tr:nth-child(even) {
            background: var(--bg-light);
          }

          .horoscope-report-container tr:hover {
            background: #FFE4B5;
          }

          .current-dasha {
            background: var(--current-dasha) !important;
            color: white;
            font-weight: bold;
          }

          .yoga-card {
            background: linear-gradient(135deg, var(--bg-light) 0%, #FFF 100%);
            border: 2px solid var(--secondary);
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
          }

          .yoga-name {
            font-size: 1.2em;
            color: var(--primary);
            font-weight: bold;
            margin-bottom: 8px;
          }

          .yoga-planets {
            color: var(--accent);
            font-style: italic;
            margin-bottom: 8px;
          }

          .house-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 15px;
          }

          .house-card {
            background: var(--bg-cream);
            border: 1px solid var(--accent);
            border-radius: 8px;
            padding: 15px;
            border-left: 5px solid var(--secondary);
          }

          .house-number {
            font-size: 1.3em;
            color: var(--primary);
            font-weight: bold;
          }

          .house-sign {
            color: var(--accent);
            font-style: italic;
          }

          .interpretation {
            background: var(--bg-cream);
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
            border-left: 5px solid var(--secondary);
          }

          .interpretation h4 {
            color: var(--primary);
            margin-bottom: 10px;
            font-size: 1.1em;
          }

          .summary-box {
            background: linear-gradient(135deg, var(--primary) 0%, #5D2E0C 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            margin: 15px 0;
          }

          .summary-box h4 {
            color: var(--secondary);
            margin-bottom: 15px;
          }

          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
          }

          .summary-item {
            background: rgba(255,255,255,0.1);
            padding: 10px;
            border-radius: 5px;
          }

          .summary-label {
            font-size: 0.85em;
            color: #DEB887;
          }

          .summary-value {
            font-size: 1.1em;
            color: var(--secondary);
            font-weight: bold;
          }

          .report-footer {
            background: var(--primary);
            color: var(--secondary);
            text-align: center;
            padding: 20px;
          }

          .remedies-list {
            list-style: none;
            padding: 0;
          }

          .remedies-list li {
            padding: 10px;
            margin: 8px 0;
            background: rgba(255,255,255,0.1);
            border-radius: 5px;
            border-left: 4px solid var(--secondary);
          }

          @media print {
            .horoscope-report-container {
              box-shadow: none;
              max-width: 100%;
              width: 100%;
            }
            .section {
              page-break-inside: avoid;
            }
          }
        `}</style>

        {/* Header */}
        <header className="report-header">
          <div className="sanskrit">॥ श्री गणेशाय नमः ॥</div>
          <div className="sanskrit">ॐ गुरवे नमः</div>
          <h1>जन्म कुण्डली</h1>
          <h1>Vedic Birth Chart</h1>
          <div className="subtitle">{data.birth_details.name}</div>
          <div className="subtitle" style={{ marginTop: '10px' }}>
            {data.summary.ascendant} Ascendant • {data.summary.moon_sign} Moon • {data.summary.nakshatra}
          </div>
        </header>

        {/* Birth Details Section */}
        <div className="section">
          <h2 className="section-title">Birth Details (जन्म विवरण)</h2>
          <div className="birth-details">
            <div className="detail-item">
              <div className="detail-label">Name (नाम)</div>
              <div className="detail-value">{data.birth_details.name}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Gender (लिंग)</div>
              <div className="detail-value">{data.birth_details.gender}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Date of Birth (जन्म तिथि)</div>
              <div className="detail-value">{data.birth_details.date_of_birth}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Time of Birth (जन्म समय)</div>
              <div className="detail-value">{data.birth_details.time_of_birth}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Place of Birth (जन्म स्थान)</div>
              <div className="detail-value">{data.birth_details.place_of_birth}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Lagna (लग्न)</div>
              <div className="detail-value">{data.birth_details.lagna}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Rashi (राशि)</div>
              <div className="detail-value">{data.birth_details.rashi}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Nakshatra (नक्षत्र)</div>
              <div className="detail-value">{data.birth_details.nakshatra}</div>
            </div>
          </div>
        </div>

        {/* Planetary Positions Section */}
        <div className="section">
          <h2 className="section-title">Planetary Positions (ग्रह स्थिति)</h2>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Longitude</th>
                <th>Sign</th>
                <th>Degree</th>
                <th>House</th>
                <th>Nakshatra</th>
                <th>Pada</th>
                <th>Dignity</th>
                <th>Navamsa</th>
                <th>Karaka</th>
              </tr>
            </thead>
            <tbody>
              {data.planetary_positions.map((planet, index) => (
                <tr key={index}>
                  <td>
                    {planet.planet}
                    {planet.is_retrograde && ' ℞'}
                  </td>
                  <td>{planet.longitude}</td>
                  <td>{planet.sign}</td>
                  <td>{planet.degree_in_sign}</td>
                  <td>{planet.house}</td>
                  <td>{planet.nakshatra}</td>
                  <td>{planet.pada}</td>
                  <td className={getDignityClass(planet.dignity)}>{planet.dignity}</td>
                  <td>{planet.navamsa}</td>
                  <td>{planet.karaka}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vimsottari Dasha Section */}
        <div className="section">
          <h2 className="section-title">Vimsottari Dasha (विंशोत्तरी दशा)</h2>
          <p style={{ marginBottom: '15px' }}>
            <strong>Moon Nakshatra:</strong> {data.vimsottari_dasha.moon_nakshatra}
            {' '}({data.vimsottari_dasha.nakshatra_lord})
          </p>

          <h3 style={{ color: 'var(--primary)', marginTop: '20px', marginBottom: '10px' }}>
            Mahadasha Periods
          </h3>
          <table>
            <thead>
              <tr>
                <th>Planet</th>
                <th>Duration</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Position</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.vimsottari_dasha.mahadashas.map((dasha, index) => (
                <tr key={index} className={dasha.is_current ? 'current-dasha' : ''}>
                  <td>{dasha.planet}</td>
                  <td>{dasha.duration_years} years</td>
                  <td>{dasha.start_date}</td>
                  <td>{dasha.end_date}</td>
                  <td>{dasha.position}</td>
                  <td>{dasha.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.vimsottari_dasha.current_antardashas.length > 0 && (
            <>
              <h3 style={{ color: 'var(--primary)', marginTop: '20px', marginBottom: '10px' }}>
                Current Antardasha Periods
              </h3>
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vimsottari_dasha.current_antardashas.map((antardasha, index) => (
                    <tr key={index} className={antardasha.is_current ? 'current-dasha' : ''}>
                      <td>{antardasha.period}</td>
                      <td>{antardasha.start_date}</td>
                      <td>{antardasha.end_date}</td>
                      <td>{antardasha.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Yoga Analysis Section */}
        <div className="section">
          <h2 className="section-title">Yoga Analysis (योग विश्लेषण)</h2>
          {data.yoga_analysis.map((yoga, index) => (
            <div key={index} className="yoga-card">
              <div className="yoga-name">{yoga.name}</div>
              <div className="yoga-planets">{yoga.planets_involved}</div>
              <div>{yoga.interpretation}</div>
            </div>
          ))}
        </div>

        {/* House Analysis Section */}
        <div className="section">
          <h2 className="section-title">House Analysis (भाव विश्लेषण)</h2>
          <div className="house-grid">
            {data.house_analysis.map((house, index) => (
              <div key={index} className="house-card">
                <div className="house-number">{house.house_number}</div>
                <div className="house-sign">{house.sign}</div>
                <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                  <strong>Planets:</strong> {house.planets}
                </div>
                <div style={{ fontSize: '0.9em' }}>
                  <strong>Lord:</strong> {house.lord_position}
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.95em' }}>
                  {house.interpretation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Life Area Analysis Section */}
        <div className="section">
          <h2 className="section-title">Life Area Analysis (जीवन क्षेत्र विश्लेषण)</h2>

          <div className="interpretation">
            <h4>Personality (व्यक्तित्व)</h4>
            <p>{data.life_areas.personality}</p>
          </div>

          <div className="interpretation">
            <h4>Education & Career (शिक्षा और करियर)</h4>
            <p>{data.life_areas.education_career}</p>
          </div>

          <div className="interpretation">
            <h4>Wealth (धन)</h4>
            <p>{data.life_areas.wealth}</p>
          </div>

          <div className="interpretation">
            <h4>Marriage & Relationships (विवाह)</h4>
            <p>{data.life_areas.marriage}</p>
          </div>

          <div className="interpretation">
            <h4>Current Period (वर्तमान काल)</h4>
            <p>{data.life_areas.current_period}</p>
          </div>

          <div className="interpretation">
            <h4>Favorable Periods (अनुकूल समय)</h4>
            <p>{data.life_areas.favorable_periods}</p>
          </div>
        </div>

        {/* Remedies Section */}
        <div className="section">
          <h2 className="section-title">Remedies (उपाय)</h2>

          <div className="interpretation">
            <h4>Primary Remedy - {data.remedies.primary_planet}</h4>
            <p>{data.remedies.primary_remedy}</p>
          </div>

          {data.remedies.secondary_planet && (
            <div className="interpretation">
              <h4>Secondary Remedy - {data.remedies.secondary_planet}</h4>
              <p>{data.remedies.secondary_remedy}</p>
            </div>
          )}

          <div className="interpretation">
            <h4>General Practices</h4>
            <p>{data.remedies.general_practices}</p>
          </div>

          <div className="interpretation">
            <h4>Gemstone Recommendations</h4>
            <ul className="remedies-list">
              <li><strong>Primary:</strong> {data.remedies.gemstones.primary}</li>
              {data.remedies.gemstones.secondary && (
                <li><strong>Secondary:</strong> {data.remedies.gemstones.secondary}</li>
              )}
            </ul>
          </div>
        </div>

        {/* Summary Section */}
        <div className="section">
          <div className="summary-box">
            <h4>Chart Summary (कुण्डली सारांश)</h4>
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-label">Ascendant</div>
                <div className="summary-value">{data.summary.ascendant}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Moon Sign</div>
                <div className="summary-value">{data.summary.moon_sign}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Nakshatra</div>
                <div className="summary-value">{data.summary.nakshatra}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Navamsa Lagna</div>
                <div className="summary-value">{data.summary.navamsa_lagna}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Atmakaraka</div>
                <div className="summary-value">{data.summary.atmakaraka}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Darakaraka</div>
                <div className="summary-value">{data.summary.darakaraka}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Current Dasha</div>
                <div className="summary-value">{data.summary.current_dasha}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">Major Yogas</div>
                <div className="summary-value">{data.summary.major_yogas}</div>
              </div>
            </div>

            <h4 style={{ marginTop: '20px' }}>Assessment</h4>
            <table style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Rating</th>
                  <th>Key Factors</th>
                </tr>
              </thead>
              <tbody>
                {data.summary.assessments.map((assessment, index) => (
                  <tr key={index}>
                    <td>{assessment.category}</td>
                    <td>{assessment.rating}</td>
                    <td>{assessment.key_factors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <footer className="report-footer">
          <div className="sanskrit">॥ शुभं भवतु ॥</div>
          <p style={{ marginTop: '10px', fontSize: '0.9em' }}>
            Generated by ChandraHoro - Vedic Astrology Platform
          </p>
          <p style={{ fontSize: '0.85em', marginTop: '5px' }}>
            Methodology: Parashara • Generated on {new Date().toLocaleDateString()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HoroscopeReport;

