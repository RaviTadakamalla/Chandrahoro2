import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesPanel } from '../PreferencesPanel';

describe('PreferencesPanel', () => {
  const mockOnChange = jest.fn();

  const defaultProps = {
    onChange: mockOnChange,
    preferences: {
      ayanamsha: 'lahiri',
      chartStyle: 'north_indian',
      language: 'en',
      showRetrograde: true,
      showAspects: true,
      showNakshatras: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all preference options', () => {
    render(<PreferencesPanel {...defaultProps} />);

    expect(screen.getByText(/ayanamsha/i)).toBeInTheDocument();
    expect(screen.getByText(/chart style/i)).toBeInTheDocument();
    expect(screen.getByText(/language/i)).toBeInTheDocument();
    expect(screen.getByText(/show retrograde/i)).toBeInTheDocument();
    expect(screen.getByText(/show aspects/i)).toBeInTheDocument();
    expect(screen.getByText(/show nakshatras/i)).toBeInTheDocument();
  });

  it('displays current preference values', () => {
    render(<PreferencesPanel {...defaultProps} />);

    expect(screen.getByDisplayValue('lahiri')).toBeInTheDocument();
    expect(screen.getByDisplayValue('north_indian')).toBeInTheDocument();
    expect(screen.getByDisplayValue('en')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /show retrograde/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /show aspects/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /show nakshatras/i })).toBeChecked();
  });

  it('handles ayanamsha selection', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const ayanamshaSelect = screen.getByDisplayValue('lahiri');
    await user.selectOptions(ayanamshaSelect, 'raman');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      ayanamsha: 'raman',
    });
  });

  it('handles chart style selection', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const chartStyleSelect = screen.getByDisplayValue('north_indian');
    await user.selectOptions(chartStyleSelect, 'south_indian');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      chartStyle: 'south_indian',
    });
  });

  it('handles language selection', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const languageSelect = screen.getByDisplayValue('en');
    await user.selectOptions(languageSelect, 'hi');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      language: 'hi',
    });
  });

  it('handles checkbox toggles', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    // Toggle retrograde checkbox
    const retrogradeCheckbox = screen.getByRole('checkbox', { name: /show retrograde/i });
    await user.click(retrogradeCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      showRetrograde: false,
    });

    // Toggle aspects checkbox
    const aspectsCheckbox = screen.getByRole('checkbox', { name: /show aspects/i });
    await user.click(aspectsCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      showAspects: false,
    });

    // Toggle nakshatras checkbox
    const nakshatrasCheckbox = screen.getByRole('checkbox', { name: /show nakshatras/i });
    await user.click(nakshatrasCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      showNakshatras: false,
    });
  });

  it('shows ayanamsha options', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const ayanamshaSelect = screen.getByDisplayValue('lahiri');
    await user.click(ayanamshaSelect);

    expect(screen.getByText('Lahiri')).toBeInTheDocument();
    expect(screen.getByText('Raman')).toBeInTheDocument();
    expect(screen.getByText('Krishnamurti')).toBeInTheDocument();
    expect(screen.getByText('Yukteshwar')).toBeInTheDocument();
  });

  it('shows chart style options', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const chartStyleSelect = screen.getByDisplayValue('north_indian');
    await user.click(chartStyleSelect);

    expect(screen.getByText('North Indian')).toBeInTheDocument();
    expect(screen.getByText('South Indian')).toBeInTheDocument();
  });

  it('shows language options', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const languageSelect = screen.getByDisplayValue('en');
    await user.click(languageSelect);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
    expect(screen.getByText('Sanskrit')).toBeInTheDocument();
  });

  it('handles reset to defaults', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const resetButton = screen.getByRole('button', { name: /reset to defaults/i });
    await user.click(resetButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ayanamsha: 'lahiri',
      chartStyle: 'north_indian',
      language: 'en',
      showRetrograde: true,
      showAspects: true,
      showNakshatras: true,
    });
  });

  it('handles advanced preferences toggle', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const advancedToggle = screen.getByRole('button', { name: /advanced preferences/i });
    await user.click(advancedToggle);

    expect(screen.getByText(/house system/i)).toBeInTheDocument();
    expect(screen.getByText(/orb settings/i)).toBeInTheDocument();
  });

  it('validates preference combinations', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    // Some combinations might not be valid
    const chartStyleSelect = screen.getByDisplayValue('north_indian');
    await user.selectOptions(chartStyleSelect, 'south_indian');

    const languageSelect = screen.getByDisplayValue('en');
    await user.selectOptions(languageSelect, 'sa'); // Sanskrit

    // Should show warning for certain combinations
    await waitFor(() => {
      expect(screen.getByText(/some features may not be available/i)).toBeInTheDocument();
    });
  });

  it('saves preferences to localStorage', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const ayanamshaSelect = screen.getByDisplayValue('lahiri');
    await user.selectOptions(ayanamshaSelect, 'raman');

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'vedic-chart-preferences',
      JSON.stringify({
        ...defaultProps.preferences,
        ayanamsha: 'raman',
      })
    );
  });

  it('loads preferences from localStorage on mount', () => {
    const savedPreferences = {
      ayanamsha: 'raman',
      chartStyle: 'south_indian',
      language: 'hi',
      showRetrograde: false,
      showAspects: false,
      showNakshatras: false,
    };

    (localStorage.getItem as jest.Mock).mockReturnValue(
      JSON.stringify(savedPreferences)
    );

    render(<PreferencesPanel {...defaultProps} />);

    expect(screen.getByDisplayValue('raman')).toBeInTheDocument();
    expect(screen.getByDisplayValue('south_indian')).toBeInTheDocument();
    expect(screen.getByDisplayValue('hi')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /show retrograde/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /show aspects/i })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /show nakshatras/i })).not.toBeChecked();
  });

  it('handles invalid localStorage data gracefully', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('invalid json');

    render(<PreferencesPanel {...defaultProps} />);

    // Should use default preferences
    expect(screen.getByDisplayValue('lahiri')).toBeInTheDocument();
    expect(screen.getByDisplayValue('north_indian')).toBeInTheDocument();
  });

  it('shows tooltips for preference options', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const ayanamshaHelp = screen.getByTestId('ayanamsha-help');
    await user.hover(ayanamshaHelp);

    await waitFor(() => {
      expect(screen.getByText(/ayanamsha is the difference/i)).toBeInTheDocument();
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<PreferencesPanel {...defaultProps} />);

    const ayanamshaSelect = screen.getByDisplayValue('lahiri');
    
    await user.click(ayanamshaSelect);
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Enter}');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultProps.preferences,
      ayanamsha: 'raman',
    });
  });
});
