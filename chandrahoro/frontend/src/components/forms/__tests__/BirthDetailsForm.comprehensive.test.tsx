import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthDetailsForm from '../BirthDetailsForm';
import { BirthDetails, ChartPreferences } from '@/lib/api';

// Mock the child components
jest.mock('../LocationSearch', () => {
  return function MockLocationSearch({ onLocationSelect }: any) {
    return (
      <div data-testid="location-search">
        <button
          onClick={() =>
            onLocationSelect({
              name: 'Bangalore, Karnataka, India',
              latitude: 12.9716,
              longitude: 77.5946,
              timezone: 'Asia/Kolkata',
              country: 'India',
              state: 'Karnataka',
            })
          }
        >
          Select Location
        </button>
      </div>
    );
  };
});

jest.mock('../PreferencesPanel', () => {
  return function MockPreferencesPanel() {
    return <div data-testid="preferences-panel">Preferences Panel</div>;
  };
});

describe('BirthDetailsForm - Comprehensive Tests', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('renders all form tabs', () => {
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      expect(screen.getByRole('tab', { name: /basic info/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /location/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /preferences/i })).toBeInTheDocument();
    });

    it('renders all form fields in basic info tab', () => {
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/birth date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/birth time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/time unknown/i)).toBeInTheDocument();
    });

    it.skip('renders location search component', () => {
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const locationTab = screen.getByRole('tab', { name: /location/i });
      userEvent.click(locationTab);

      expect(screen.getByTestId('location-search')).toBeInTheDocument();
    });

    it.skip('renders preferences panel', () => {
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });
      userEvent.click(preferencesTab);

      expect(screen.getByTestId('preferences-panel')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it.skip('validates required name field', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /generate chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it.skip('validates required date field', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/full name/i);
      await user.type(nameInput, 'John Doe');

      const submitButton = screen.getByRole('button', { name: /generate chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/birth date is required/i)).toBeInTheDocument();
      });
    });

    it.skip('validates date format', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const dateInput = screen.getByLabelText(/birth date/i);
      await user.type(dateInput, 'invalid-date');

      const submitButton = screen.getByRole('button', { name: /generate chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid date format/i)).toBeInTheDocument();
      });
    });

    it.skip('validates time field when time_unknown is false', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      // Fill test data to set location, then clear time
      const fillTestDataButton = screen.getByRole('button', { name: /fill test data/i });
      await user.click(fillTestDataButton);

      const timeInput = screen.getByLabelText(/birth time/i) as HTMLInputElement;
      await user.clear(timeInput);

      const submitButton = screen.getByRole('button', { name: /generate chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/birth time is required/i)).toBeInTheDocument();
      });
    });

    it.skip('does not validate time when time_unknown is checked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/full name/i);
      const dateInput = screen.getByLabelText(/birth date/i);
      const timeUnknownCheckbox = screen.getByLabelText(/time unknown/i);

      await user.type(nameInput, 'John Doe');
      await user.type(dateInput, '1990-01-01');
      await user.click(timeUnknownCheckbox);

      // Time field should be disabled
      const timeInput = screen.getByLabelText(/birth time/i);
      expect(timeInput).toBeDisabled();
    });
  });

  describe('Form Input Handling', () => {
    it('updates name field on input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');

      expect(nameInput.value).toBe('Jane Doe');
    });

    it('updates date field on input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const dateInput = screen.getByLabelText(/birth date/i) as HTMLInputElement;
      await user.clear(dateInput);
      await user.type(dateInput, '1995-06-15');

      expect(dateInput.value).toBe('1995-06-15');
    });

    it('updates time field on input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const timeInput = screen.getByLabelText(/birth time/i) as HTMLInputElement;
      await user.clear(timeInput);
      await user.type(timeInput, '14:30');

      expect(timeInput.value).toBe('14:30');
    });

    it('disables time input when time_unknown is checked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const timeUnknownCheckbox = screen.getByLabelText(/time unknown/i);
      const timeInput = screen.getByLabelText(/birth time/i);

      expect(timeInput).not.toBeDisabled();

      await user.click(timeUnknownCheckbox);

      expect(timeInput).toBeDisabled();
    });

    it('sets time to 12:00 when time_unknown is checked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const timeInput = screen.getByLabelText(/birth time/i) as HTMLInputElement;
      const timeUnknownCheckbox = screen.getByLabelText(/time unknown/i);

      await user.type(timeInput, '14:30');
      await user.click(timeUnknownCheckbox);

      expect(timeInput.value).toBe('12:00');
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      // Use Fill Test Data button to populate all fields including location
      const fillTestDataButton = screen.getByRole('button', { name: /fill test data/i });
      await user.click(fillTestDataButton);

      const submitButton = screen.getByRole('button', { name: /generate chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });

    it('does not submit with invalid data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /generate chart/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /generating/i });
      expect(submitButton).toBeDisabled();
    });

    it('displays error message when provided', () => {
      const errorMessage = 'Failed to generate chart';
      render(<BirthDetailsForm onSubmit={mockOnSubmit} error={errorMessage} />);

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Test Data Filling', () => {
    it('fills form with test data', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const fillTestDataButton = screen.getByRole('button', { name: /fill test data/i });
      await user.click(fillTestDataButton);

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      const dateInput = screen.getByLabelText(/birth date/i) as HTMLInputElement;
      const timeInput = screen.getByLabelText(/birth time/i) as HTMLInputElement;

      expect(nameInput.value).toBe('Test User');
      expect(dateInput.value).toBe('1980-01-01');
      expect(timeInput.value).toBe('12:00');
    });
  });

  describe('Initial Data', () => {
    it('populates form with initial data', () => {
      const initialData: Partial<BirthDetails> = {
        name: 'Jane Smith',
        date: '1985-05-20',
        time: '10:30',
      };

      render(<BirthDetailsForm onSubmit={mockOnSubmit} initialData={initialData} />);

      const nameInput = screen.getByLabelText(/full name/i) as HTMLInputElement;
      const dateInput = screen.getByLabelText(/birth date/i) as HTMLInputElement;
      const timeInput = screen.getByLabelText(/birth time/i) as HTMLInputElement;

      expect(nameInput.value).toBe('Jane Smith');
      expect(dateInput.value).toBe('1985-05-20');
      expect(timeInput.value).toBe('10:30');
    });
  });

  describe('Tab Navigation', () => {
    it('switches between tabs', async () => {
      const user = userEvent.setup({ delay: null });
      render(<BirthDetailsForm onSubmit={mockOnSubmit} />);

      const basicTab = screen.getByRole('tab', { name: /basic info/i });
      const locationTab = screen.getByRole('tab', { name: /location/i });
      const preferencesTab = screen.getByRole('tab', { name: /preferences/i });

      expect(basicTab).toHaveAttribute('data-state', 'active');

      await user.click(locationTab);
      expect(locationTab).toHaveAttribute('data-state', 'active');

      await user.click(preferencesTab);
      expect(preferencesTab).toHaveAttribute('data-state', 'active');
    });
  });
});

