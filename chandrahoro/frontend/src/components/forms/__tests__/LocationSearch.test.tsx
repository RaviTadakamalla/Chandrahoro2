import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSearch } from '../LocationSearch';

// Mock the API
const mockSearchLocations = jest.fn();
jest.mock('@/lib/api', () => ({
  api: {
    searchLocations: (...args: any[]) => mockSearchLocations(...args),
  },
}));

describe('LocationSearch', () => {
  const mockOnLocationSelect = jest.fn();
  const mockOnChange = jest.fn();

  const defaultProps = {
    onLocationSelect: mockOnLocationSelect,
    onChange: mockOnChange,
    placeholder: 'Search for a location...',
  };

  const mockLocations = [
    {
      name: 'New York, NY, USA',
      latitude: 40.7128,
      longitude: -74.0060,
      timezone: 'America/New_York',
      country: 'USA',
      state: 'NY',
    },
    {
      name: 'London, England, UK',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
      country: 'UK',
      state: 'England',
    },
    {
      name: 'Mumbai, Maharashtra, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata',
      country: 'India',
      state: 'Maharashtra',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchLocations.mockResolvedValue({
      success: true,
      data: mockLocations,
    });
  });

  it('renders search input', () => {
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  it('shows loading state while searching', async () => {
    const user = userEvent.setup();
    
    // Make the API call take some time
    mockSearchLocations.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: [] }), 100))
    );

    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    // Should show loading indicator
    expect(screen.getByTestId('search-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId('search-loading')).not.toBeInTheDocument();
    });
  });

  it('searches for locations on input change', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(mockSearchLocations).toHaveBeenCalledWith('New York');
    });
  });

  it('debounces search requests', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    
    // Type quickly
    await user.type(input, 'N');
    await user.type(input, 'e');
    await user.type(input, 'w');

    // Should not call API immediately
    expect(mockSearchLocations).not.toHaveBeenCalled();

    // Wait for debounce
    await waitFor(() => {
      expect(mockSearchLocations).toHaveBeenCalledWith('New');
    }, { timeout: 1000 });
  });

  it('displays search results', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
      expect(screen.getByText('London, England, UK')).toBeInTheDocument();
      expect(screen.getByText('Mumbai, Maharashtra, India')).toBeInTheDocument();
    });
  });

  it('handles location selection', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });

    const locationOption = screen.getByText('New York, NY, USA');
    await user.click(locationOption);

    expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocations[0]);
    expect(input).toHaveValue('New York, NY, USA');
  });

  it('clears results when input is cleared', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });

    await user.clear(input);

    await waitFor(() => {
      expect(screen.queryByText('New York, NY, USA')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockSearchLocations.mockRejectedValue(new Error('API Error'));

    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText(/error searching locations/i)).toBeInTheDocument();
    });
  });

  it('shows no results message when no locations found', async () => {
    const user = userEvent.setup();
    mockSearchLocations.mockResolvedValue({
      success: true,
      data: [],
    });

    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'Nonexistent Place');

    await waitFor(() => {
      expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('New York, NY, USA')).toHaveClass('highlighted');

    await user.keyboard('{ArrowDown}');
    expect(screen.getByText('London, England, UK')).toHaveClass('highlighted');

    await user.keyboard('{ArrowUp}');
    expect(screen.getByText('New York, NY, USA')).toHaveClass('highlighted');

    // Select with Enter
    await user.keyboard('{Enter}');
    expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocations[0]);
  });

  it('closes dropdown on escape key', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByText('New York, NY, USA')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <LocationSearch {...defaultProps} />
        <button>Outside button</button>
      </div>
    );

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    await waitFor(() => {
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument();
    });

    const outsideButton = screen.getByText('Outside button');
    await user.click(outsideButton);

    await waitFor(() => {
      expect(screen.queryByText('New York, NY, USA')).not.toBeInTheDocument();
    });
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    await user.type(input, 'New York');

    expect(mockOnChange).toHaveBeenCalledWith('New York');
  });

  it('accepts initial value', () => {
    const initialLocation = {
      name: 'Initial Location',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
    };

    render(<LocationSearch {...defaultProps} value={initialLocation} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    expect(input).toHaveValue('Initial Location');
  });

  it('handles minimum search length', async () => {
    const user = userEvent.setup();
    render(<LocationSearch {...defaultProps} minSearchLength={3} />);

    const input = screen.getByPlaceholderText('Search for a location...');
    
    // Type less than minimum length
    await user.type(input, 'Ne');
    
    await waitFor(() => {
      expect(mockSearchLocations).not.toHaveBeenCalled();
    });

    // Type minimum length
    await user.type(input, 'w');
    
    await waitFor(() => {
      expect(mockSearchLocations).toHaveBeenCalledWith('New');
    });
  });
});
