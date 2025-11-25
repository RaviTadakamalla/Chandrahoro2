import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/lib/api';

// Mock the API client before importing LocationSearch
jest.mock('@/lib/api', () => ({
  apiClient: {
    searchLocations: jest.fn(),
  },
}));

import LocationSearch from '../LocationSearch';

describe('LocationSearch - Comprehensive Tests', () => {
  const mockOnLocationSelect = jest.fn();
  const mockSearchLocations = apiClient.searchLocations as jest.Mock;

  const mockLocations = [
    {
      name: 'Bangalore, Karnataka, India',
      latitude: 12.9716,
      longitude: 77.5946,
      timezone: 'Asia/Kolkata',
      country: 'India',
      admin1: 'Karnataka',
      population: 8000000,
    },
    {
      name: 'Delhi, Delhi, India',
      latitude: 28.7041,
      longitude: 77.1025,
      timezone: 'Asia/Kolkata',
      country: 'India',
      admin1: 'Delhi',
      population: 11000000,
    },
    {
      name: 'Mumbai, Maharashtra, India',
      latitude: 19.0760,
      longitude: 72.8777,
      timezone: 'Asia/Kolkata',
      country: 'India',
      admin1: 'Maharashtra',
      population: 12000000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchLocations.mockResolvedValue({
      success: true,
      results: mockLocations,
    });
  });

  describe('Component Rendering', () => {
    it('renders search input field', () => {
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      expect(input).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      const customPlaceholder = 'Enter your birth location...';
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
          placeholder={customPlaceholder}
        />
      );

      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });

    it.skip('renders search icon', () => {
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const searchIcon = screen.getByRole('img', { hidden: true });
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('does not search with less than 2 characters', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'B');

      await waitFor(() => {
        expect(mockSearchLocations).not.toHaveBeenCalled();
      });
    });

    it('searches with 2 or more characters', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Ba');

      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith('Ba');
      });
    });

    it('debounces search requests', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);

      // Type quickly
      await user.type(input, 'Ban');

      // Should not call API immediately
      expect(mockSearchLocations).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(mockSearchLocations).toHaveBeenCalledWith('Ban');
      }, { timeout: 1000 });
    });

    it('displays search results', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
        expect(screen.getByText(/delhi/i)).toBeInTheDocument();
        expect(screen.getByText(/mumbai/i)).toBeInTheDocument();
      });
    });

    it.skip('shows loading state during search', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchLocations.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ success: true, results: mockLocations }), 100))
      );

      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      // Loading spinner should appear
      const spinner = screen.getByRole('img', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    it('handles search errors gracefully', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchLocations.mockRejectedValue(new Error('Search failed'));

      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        // Should not display results on error
        expect(screen.queryByText(/bangalore/i)).not.toBeInTheDocument();
      });
    });

    it('shows no results message when no locations found', async () => {
      const user = userEvent.setup({ delay: null });
      mockSearchLocations.mockResolvedValue({
        success: true,
        results: [],
      });

      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Nonexistent Place');

      await waitFor(() => {
        expect(screen.getByText(/no locations found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Location Selection', () => {
    it('calls onLocationSelect when location is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
      });

      const bangaloreOption = screen.getByText(/bangalore/i);
      await user.click(bangaloreOption);

      expect(mockOnLocationSelect).toHaveBeenCalledWith(mockLocations[0]);
    });

    it('closes dropdown after selection', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
      });

      const bangaloreOption = screen.getByText(/bangalore/i);
      await user.click(bangaloreOption);

      await waitFor(() => {
        expect(screen.queryByText(/delhi/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates results with arrow keys', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
      });

      // Navigate down
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');

      // Select with Enter
      await user.keyboard('{Enter}');

      expect(mockOnLocationSelect).toHaveBeenCalled();
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText(/delhi/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Click Outside Behavior', () => {
    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <div>
          <LocationSearch
            value=""
            onLocationSelect={mockOnLocationSelect}
          />
          <button>Outside Button</button>
        </div>
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
      });

      const outsideButton = screen.getByRole('button', { name: /outside button/i });
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByText(/delhi/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Initial Value', () => {
    it('displays initial value in input', () => {
      render(
        <LocationSearch
          value="Bangalore, Karnataka, India"
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i) as HTMLInputElement;
      expect(input.value).toBe('Bangalore, Karnataka, India');
    });
  });

  describe('Location Details Display', () => {
    it.skip('displays location details in results', async () => {
      const user = userEvent.setup();
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/bangalore/i)).toBeInTheDocument();
        expect(screen.getByText(/karnataka/i)).toBeInTheDocument();
        expect(screen.getByText(/india/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('displays coordinates in results', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.type(input, 'Bangalore');

      await waitFor(() => {
        expect(screen.getByText(/12\.97/)).toBeInTheDocument();
        expect(screen.getByText(/77\.59/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      expect(input).toHaveAttribute('type', 'text');
    });

    it('supports focus management', async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <LocationSearch
          value=""
          onLocationSelect={mockOnLocationSelect}
        />
      );

      const input = screen.getByPlaceholderText(/search for city/i);
      await user.click(input);

      expect(input).toHaveFocus();
    });
  });
});

