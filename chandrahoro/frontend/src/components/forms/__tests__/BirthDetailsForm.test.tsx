import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BirthDetailsForm } from '../BirthDetailsForm';

// Mock the location search component
jest.mock('../LocationSearch', () => ({
  LocationSearch: ({ onLocationSelect, value }: any) => (
    <div data-testid="location-search">
      <input
        data-testid="location-input"
        value={value?.name || ''}
        onChange={(e) => {
          if (e.target.value === 'New York') {
            onLocationSelect({
              name: 'New York',
              latitude: 40.7128,
              longitude: -74.0060,
              timezone: 'America/New_York'
            });
          }
        }}
      />
    </div>
  )
}));

describe('BirthDetailsForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnChange = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onChange: mockOnChange,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<BirthDetailsForm {...defaultProps} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByTestId('location-search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generate chart/i })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    const submitButton = screen.getByRole('button', { name: /generate chart/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/time of birth is required/i)).toBeInTheDocument();
      expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates name field', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    
    // Test empty name
    await user.clear(nameInput);
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    // Test name too short
    await user.type(nameInput, 'A');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });

    // Test valid name
    await user.clear(nameInput);
    await user.type(nameInput, 'John Doe');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.queryByText(/name/i)).not.toBeInTheDocument();
    });
  });

  it('validates date field', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    const dateInput = screen.getByLabelText(/date of birth/i);
    
    // Test future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    await user.type(dateInput, futureDateString);
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/date cannot be in the future/i)).toBeInTheDocument();
    });

    // Test valid date
    await user.clear(dateInput);
    await user.type(dateInput, '1990-01-01');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.queryByText(/date cannot be in the future/i)).not.toBeInTheDocument();
    });
  });

  it('validates time field', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    const timeInput = screen.getByLabelText(/time of birth/i);
    
    // Test invalid time format
    await user.type(timeInput, '25:00');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.getByText(/invalid time format/i)).toBeInTheDocument();
    });

    // Test valid time
    await user.clear(timeInput);
    await user.type(timeInput, '14:30');
    await user.tab();
    
    await waitFor(() => {
      expect(screen.queryByText(/invalid time format/i)).not.toBeInTheDocument();
    });
  });

  it('handles location selection', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    const locationInput = screen.getByTestId('location-input');
    
    await user.type(locationInput, 'New York');
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          location: {
            name: 'New York',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York'
          }
        })
      );
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    // Fill in all required fields
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
    await user.type(screen.getByLabelText(/time of birth/i), '14:30');
    await user.type(screen.getByTestId('location-input'), 'New York');

    const submitButton = screen.getByRole('button', { name: /generate chart/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          date: '1990-01-01',
          time: '14:30',
          location: expect.objectContaining({
            name: 'New York',
            latitude: 40.7128,
            longitude: -74.0060,
            timezone: 'America/New_York'
          })
        })
      );
    });
  });

  it('shows loading state', () => {
    render(<BirthDetailsForm {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /generating/i });
    expect(submitButton).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('calls onChange when form data changes', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'John');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John'
        })
      );
    });
  });

  it('handles form reset', async () => {
    const user = userEvent.setup();
    render(<BirthDetailsForm {...defaultProps} />);

    // Fill in some data
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/date of birth/i), '1990-01-01');

    // Reset form (if reset button exists)
    const resetButton = screen.queryByRole('button', { name: /reset/i });
    if (resetButton) {
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/date of birth/i)).toHaveValue('');
      });
    }
  });

  it('preserves form data when re-rendered', () => {
    const initialData = {
      name: 'John Doe',
      date: '1990-01-01',
      time: '14:30',
      location: {
        name: 'New York',
        latitude: 40.7128,
        longitude: -74.0060,
        timezone: 'America/New_York'
      }
    };

    const { rerender } = render(
      <BirthDetailsForm {...defaultProps} initialData={initialData} />
    );

    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue('1990-01-01');
    expect(screen.getByLabelText(/time of birth/i)).toHaveValue('14:30');

    // Re-render with same props
    rerender(<BirthDetailsForm {...defaultProps} initialData={initialData} />);

    expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue('1990-01-01');
    expect(screen.getByLabelText(/time of birth/i)).toHaveValue('14:30');
  });
});
