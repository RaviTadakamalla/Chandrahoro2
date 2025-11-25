import React from 'react';
import { Settings, Palette, Grid, Calculator } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartPreferences } from '@/lib/api';
import MethodologySelector from '@/components/chart/MethodologySelector';

interface PreferencesPanelProps {
  preferences: ChartPreferences;
  onPreferencesChange: (preferences: ChartPreferences) => void;
}

const AYANAMSHA_OPTIONS = [
  { value: 'Lahiri', label: 'Lahiri (Chitrapaksha)' },
  { value: 'Raman', label: 'Raman' },
  { value: 'Krishnamurti', label: 'Krishnamurti (KP)' },
  { value: 'Yukteshwar', label: 'Yukteshwar' },
  { value: 'JN_Bhasin', label: 'J.N. Bhasin' },
  { value: 'Babyl_Kugler1', label: 'Babylonian (Kugler 1)' },
  { value: 'Babyl_Kugler2', label: 'Babylonian (Kugler 2)' },
  { value: 'Babyl_Huber', label: 'Babylonian (Huber)' },
  { value: 'Babyl_Mercier', label: 'Babylonian (Mercier)' },
  { value: 'Aldebaran_15Tau', label: 'Aldebaran at 15° Taurus' },
  { value: 'Hipparchos', label: 'Hipparchos' },
  { value: 'Sassanian', label: 'Sassanian' },
  { value: 'Galcent_0Sag', label: 'Galactic Center at 0° Sagittarius' },
  { value: 'J2000', label: 'J2000' },
  { value: 'J1900', label: 'J1900' },
  { value: 'B1950', label: 'B1950' }
];

const HOUSE_SYSTEM_OPTIONS = [
  { value: 'Whole Sign', label: 'Whole Sign' },
  { value: 'Placidus', label: 'Placidus' },
  { value: 'Koch', label: 'Koch' },
  { value: 'Equal', label: 'Equal' },
  { value: 'Campanus', label: 'Campanus' },
  { value: 'Regiomontanus', label: 'Regiomontanus' },
  { value: 'Topocentric', label: 'Topocentric' },
  { value: 'Alcabitus', label: 'Alcabitus' },
  { value: 'Morinus', label: 'Morinus' }
];

const CHART_STYLE_OPTIONS = [
  { value: 'North Indian', label: 'North Indian (Diamond)' },
  { value: 'South Indian', label: 'South Indian (Square Grid)' },
  { value: 'East Indian', label: 'East Indian (Bengali)' },
  { value: 'Bengali', label: 'Bengali (Rectangular)' }
];

// Default charts that are always included
const DEFAULT_CHARTS = ['D1', 'D9', 'D10'];

const DIVISIONAL_CHART_OPTIONS = [
  { value: 'D1', label: 'D1 - Rashi (Main Chart)', isDefault: true },
  { value: 'D2', label: 'D2 - Hora (Wealth)', isDefault: false },
  { value: 'D3', label: 'D3 - Drekkana (Siblings)', isDefault: false },
  { value: 'D4', label: 'D4 - Chaturthamsa (Fortune)', isDefault: false },
  { value: 'D7', label: 'D7 - Saptamsa (Children)', isDefault: false },
  { value: 'D9', label: 'D9 - Navamsa (Marriage)', isDefault: true },
  { value: 'D10', label: 'D10 - Dasamsa (Career)', isDefault: true },
  { value: 'D12', label: 'D12 - Dwadasamsa (Parents)', isDefault: false },
  { value: 'D16', label: 'D16 - Shodasamsa (Vehicles)', isDefault: false },
  { value: 'D20', label: 'D20 - Vimsamsa (Spirituality)', isDefault: false },
  { value: 'D24', label: 'D24 - Chaturvimsamsa (Education)', isDefault: false },
  { value: 'D27', label: 'D27 - Nakshatramsa (Strengths)', isDefault: false },
  { value: 'D30', label: 'D30 - Trimsamsa (Misfortunes)', isDefault: false },
  { value: 'D40', label: 'D40 - Khavedamsa (Maternal)', isDefault: false },
  { value: 'D45', label: 'D45 - Akshavedamsa (Character)', isDefault: false },
  { value: 'D60', label: 'D60 - Shashtyamsa (Karma)', isDefault: false }
];

export default function PreferencesPanel({
  preferences,
  onPreferencesChange
}: PreferencesPanelProps) {
  const handlePreferenceChange = (key: keyof ChartPreferences, value: any) => {
    // Special handling for methodology changes
    if (key === 'methodology') {
      let updatedPreferences = { ...preferences, [key]: value };

      // Auto-configure preferences based on methodology
      if (value === 'kp') {
        // KP requires Krishnamurti ayanamsha and Placidus house system
        updatedPreferences.ayanamsha = 'Krishnamurti';
        updatedPreferences.house_system = 'Placidus';
        updatedPreferences.chart_style = 'South Indian';
      } else if (value === 'jaimini') {
        // Jaimini uses Lahiri ayanamsha and Whole Sign houses
        updatedPreferences.ayanamsha = 'Lahiri';
        updatedPreferences.house_system = 'Whole Sign';
        updatedPreferences.chart_style = 'South Indian';
      } else if (value === 'parashara') {
        // Parashara uses Lahiri ayanamsha and Whole Sign houses
        updatedPreferences.ayanamsha = 'Lahiri';
        updatedPreferences.house_system = 'Whole Sign';
        updatedPreferences.chart_style = 'North Indian';
      }

      onPreferencesChange(updatedPreferences);
    } else {
      onPreferencesChange({
        ...preferences,
        [key]: value
      });
    }
  };

  const handleDivisionalChartToggle = (chartType: string, checked: boolean) => {
    // Don't allow toggling default charts
    if (DEFAULT_CHARTS.includes(chartType)) {
      return;
    }

    const currentCharts = preferences.divisional_charts || [];
    let newCharts: string[];

    if (checked) {
      // Calculate total charts including defaults
      const totalCharts = DEFAULT_CHARTS.length + currentCharts.length + 1;
      if (totalCharts > 16) {
        // Don't add more charts if we're at the limit
        return;
      }
      newCharts = [...currentCharts, chartType];
    } else {
      newCharts = currentCharts.filter(chart => chart !== chartType);
    }

    handlePreferenceChange('divisional_charts', newCharts);
  };

  return (
    <div className="space-y-6">
      {/* Methodology Selector */}
      <MethodologySelector
        currentMethodology={preferences.methodology || 'parashara'}
        onMethodologyChange={(methodology) => handlePreferenceChange('methodology', methodology)}
        showDetails={true}
      />

      {/* Calculation Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Calculation Settings
          </CardTitle>
          <CardDescription>
            Configure the astronomical and astrological calculation parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ayanamsha">Ayanamsha</Label>
            <Select
              value={preferences.ayanamsha}
              onValueChange={(value) => handlePreferenceChange('ayanamsha', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ayanamsha" />
              </SelectTrigger>
              <SelectContent>
                {AYANAMSHA_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="house-system">House System</Label>
            <Select
              value={preferences.house_system}
              onValueChange={(value) => handlePreferenceChange('house_system', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select house system" />
              </SelectTrigger>
              <SelectContent>
                {HOUSE_SYSTEM_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Palette className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Customize how your chart is displayed and formatted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chart-style">Chart Style</Label>
            <Select
              value={preferences.chart_style}
              onValueChange={(value) => handlePreferenceChange('chart_style', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select chart style" />
              </SelectTrigger>
              <SelectContent>
                {CHART_STYLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Divisional Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Grid className="h-5 w-5" />
            Divisional Charts
          </CardTitle>
          <CardDescription>
            Select which divisional charts to include in your analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Default Charts Section */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Essential Charts (Always Included)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DIVISIONAL_CHART_OPTIONS.filter(option => option.isDefault).map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`chart-${option.value}`}
                    checked={true}
                    disabled={true}
                  />
                  <Label
                    htmlFor={`chart-${option.value}`}
                    className="text-sm font-medium text-blue-600"
                  >
                    {option.label}
                    <span className="text-xs text-gray-500 ml-1">(Essential)</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Charts Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Additional Charts (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DIVISIONAL_CHART_OPTIONS.filter(option => !option.isDefault).map((option) => {
                const isChecked = preferences.divisional_charts?.includes(option.value) || false;
                const totalCharts = DEFAULT_CHARTS.length + (preferences.divisional_charts?.length || 0);
                const isAtLimit = totalCharts >= 16;
                const isDisabled = isAtLimit && !isChecked;

                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`chart-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) =>
                        handleDivisionalChartToggle(option.value, checked as boolean)
                      }
                      disabled={isDisabled}
                    />
                    <Label
                      htmlFor={`chart-${option.value}`}
                      className={`text-sm ${
                        isDisabled ? 'text-gray-400' : ''
                      }`}
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Selected:</strong> {DEFAULT_CHARTS.length} essential + {preferences.divisional_charts?.length || 0} additional = {DEFAULT_CHARTS.length + (preferences.divisional_charts?.length || 0)} of 16 chart(s)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              D1 (Rashi), D9 (Navamsa), and D10 (Dasamsa) are always included as they provide comprehensive life analysis.
            </p>
            {(DEFAULT_CHARTS.length + (preferences.divisional_charts?.length || 0)) >= 16 && (
              <p className="text-xs text-amber-600 mt-1">
                Maximum of 16 divisional charts can be calculated at once.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Advanced Options
          </CardTitle>
          <CardDescription>
            Additional features and experimental options
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-ai"
                checked={preferences.enable_ai || false}
                onCheckedChange={(checked) => handlePreferenceChange('enable_ai', checked)}
              />
              <Label htmlFor="enable-ai" className="text-sm">
                Enable AI-powered interpretations (Beta)
              </Label>
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
              <p><strong>Note:</strong> AI interpretations are experimental and should be used as guidance only.
              Traditional Vedic astrology principles and consultation with qualified astrologers remain the
              primary sources for accurate chart analysis.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}